import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@fieldstack/controls';
import { DataTable, type TableColumn } from '@fieldstack/controls';

// 경로는 Fieldstack 레포 내 위치에 맞게 조정할 것
// 예: import { registerModuleLocale } from '../../../apps/web/src/i18n/registerModuleLocale';
import { registerModuleLocale } from '../../../apps/web/src/i18n/registerModuleLocale';
import ko from '../locales/ko.json';
import en from '../locales/en.json';

import { myModuleApi } from './api';
import type { MyModuleItem } from '../../shared/types';
import './MyModuleView.css';

// 모듈 번역 파일 등록 — 앱 i18next에 'my-module' 네임스페이스로 추가
registerModuleLocale('my-module', ko, en);

// ─── 테이블 컬럼 정의 ──────────────────────────────────────────────────────────

const COLUMNS: TableColumn<Record<string, unknown>>[] = [
  { key: 'id',        label: 'ID',     width: '220px', sortable: false },
  { key: 'title',     label: '제목',                   sortable: true  },
  { key: 'createdAt', label: '생성일', width: '180px', sortable: true  },
];

// ─── MyModuleView ─────────────────────────────────────────────────────────────

export function MyModuleView() {
  const { t } = useTranslation('my-module');
  const [items, setItems]     = useState<MyModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput]     = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await myModuleApi.listItems());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleCreate = async () => {
    if (!input.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await myModuleApi.createItem({ title: input.trim() });
      setInput('');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="my-module-page">
      <header className="my-module-header">
        <h1 className="my-module-title">{t('title')}</h1>
        <p className="my-module-subtitle">{t('description')}</p>
      </header>

      {error && (
        <div className="my-module-error" role="alert">{error}</div>
      )}

      <div className="my-module-form">
        <input
          className="my-module-input"
          type="text"
          placeholder={t('placeholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void handleCreate(); }}
          disabled={saving}
        />
        <Button
          variant="primary"
          size="sm"
          loading={saving}
          onClick={() => void handleCreate()}
        >
          {t('add')}
        </Button>
      </div>

      <DataTable
        columns={COLUMNS}
        rows={items as unknown as Record<string, unknown>[]}
        rowKey="id"
        loading={loading}
        emptyText={t('empty')}
        pageSize={20}
      />
    </div>
  );
}
