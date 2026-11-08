import { useCallback, useEffect, useRef, useState } from 'react';

// The server is authoritative. A failed write leaves the current view intact,
// and version checks prevent one staff member from overwriting another's edit.
export default function useCollection(collection) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const currentItems = useRef([]);
  const writing = useRef(false);
  const mounted = useRef(false);
  const reload = useCallback(async (signal) => {
    try {
      const response = await fetch(`/api/admin/manage/${collection}`, { credentials: 'include', signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load records.');
      if (signal?.aborted || !mounted.current) return;
      currentItems.current = data.items;
      setItems(data.items);
      setError('');
    } catch (cause) {
      if (!signal?.aborted && mounted.current) setError(cause.message);
    } finally {
      if (!signal?.aborted && mounted.current) setLoading(false);
    }
  }, [collection]);

  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    const timer = setTimeout(() => { void reload(controller.signal); }, 0);
    return () => { mounted.current = false; clearTimeout(timer); controller.abort(); };
  }, [reload]);

  const saveItems = useCallback(async (update) => {
    if (writing.current) return false;
    writing.current = true;
    setSaving(true);
    setError('');
    try {
      const previous = currentItems.current;
      const next = typeof update === 'function' ? update(previous) : update;
      const previousById = new Map(previous.map((item) => [item.id, item]));
      const nextIds = new Set(next.map((item) => item.id));
      const changes = [];
      for (const item of next) {
        const existing = previousById.get(item.id);
        if (!existing) changes.push({ type: 'create', data: item });
        else if (JSON.stringify(existing) !== JSON.stringify(item)) changes.push({ type: 'update', id: item.id, version: item.version, data: item });
      }
      for (const item of previous) {
        if (!nextIds.has(item.id)) changes.push({ type: 'delete', id: item.id, version: item.version });
      }
      if (!changes.length) return previous;
      const response = await fetch(`/api/admin/manage/${collection}/changes`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ changes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Changes could not be saved.');
      if (mounted.current) {
        currentItems.current = data.items;
        setItems(data.items);
      }
      return data.items;
    } catch (cause) {
      if (mounted.current) setError(cause.message);
      return false;
    } finally {
      writing.current = false;
      if (mounted.current) setSaving(false);
    }
  }, [collection]);

  return [items, saveItems, { loading, saving, error, reload: () => window.location.reload() }];
}
