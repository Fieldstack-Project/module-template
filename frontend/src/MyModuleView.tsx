import { useState, useEffect, useCallback } from 'react';

import { Button } from '@fieldstack/controls';
import { DataTable, type TableColumn } from '@fieldstack/controls';

import { myModuleApi } from './api';
import type { MyModuleItem } from '../../shared/types';
import './MyModuleView.css';

// ─── 테이블 컬럼 정의 ──────────────────────────────────────────────────────────

const COLUMNS: TableColumn<Record<string, unknown>>[] = [
  { key: 'id',        label: 'ID',     width: '220px', sortable: false },
  { key: 'title',     label: '제목',                   sortable: true  },
  { key: 'createdAt', label: '생성일', width: '180px', sortable: true  },
];

// ─── MyModuleView ─────────────────────────────────────────────────────────────

export function MyModuleView() {
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
        <h1 className="my-module-title">My Module</h1>
        <p className="my-module-subtitle">모듈 설명을 여기에 작성하세요.</p>
      </header>

      {error && (
        <div className="my-module-error" role="alert">{error}</div>
      )}

      <div className="my-module-form">
        <input
          className="my-module-input"
          type="text"
          placeholder="새 항목 제목..."
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
          추가
        </Button>
      </div>

      <DataTable
        columns={COLUMNS}
        rows={items as unknown as Record<string, unknown>[]}
        rowKey="id"
        loading={loading}
        emptyText="항목이 없습니다."
        pageSize={20}
      />
    </div>
  );
}
