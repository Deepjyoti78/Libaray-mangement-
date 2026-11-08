import React, { useState, useEffect, useRef } from 'react';
import { Search, Book, User } from 'lucide-react';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ books: [], members: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Live search debounced
  useEffect(() => {
    if (!query.trim()) return;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (!controller.signal.aborted) setResults(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) console.error('Search error:', err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);

    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div className="search-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-input-row">
          <Search size={18} className="search-modal-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="Search books by title, author, or search members..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setResults({ books: [], members: [] }); setLoading(false); }}
          />
          <kbd className="esc-badge" onClick={onClose}>ESC</kbd>
        </div>

        <div className="search-modal-results">
          {loading && (
            <div className="search-modal-status">Searching catalog &amp; members...</div>
          )}

          {!loading && !query && (
            <div className="search-modal-status hint">
              Type to quickly find any book in the catalog or member profile.
            </div>
          )}

          {!loading && query && results.books.length === 0 && results.members.length === 0 && (
            <div className="search-modal-status">No matching records found.</div>
          )}

          {results.books.length > 0 && (
            <div className="search-section">
              <span className="search-section-label">BOOKS CATALOG</span>
              {results.books.map((b) => (
                <div key={`book-${b.id}`} className="search-item" onClick={onClose}>
                  <Book size={15} className="search-item-icon" />
                  <div className="search-item-details">
                    <span className="search-item-title">{b.title}</span>
                    <span className="search-item-sub">{b.author} · {b.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.members.length > 0 && (
            <div className="search-section">
              <span className="search-section-label">MEMBERS</span>
              {results.members.map((m) => (
                <div key={`member-${m.id}`} className="search-item" onClick={onClose}>
                  <User size={15} className="search-item-icon" />
                  <div className="search-item-details">
                    <span className="search-item-title">{m.name}</span>
                    <span className="search-item-sub">{m.member_no} · {m.email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
