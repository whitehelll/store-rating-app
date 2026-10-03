import { useState } from 'react';
import api, { errorMessage, useFetch } from '../api.js';
import DataTable, { nextSort } from '../components/DataTable.jsx';
import { Rating, StarInput } from '../components/Stars.jsx';

export default function Stores() {
  const [search, setSearch] = useState('');
  const [s, setS] = useState({ sort: 'name', order: 'asc' });
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const { data, loading, error: loadError, reload } = useFetch('/stores', { search, ...s });

  async function rate(id, rating) {
    setBusyId(id); setError('');
    try { await api.put(`/stores/${id}/rating`, { rating }); reload(); }
    catch (e) { setError(errorMessage(e)); }
    finally { setBusyId(null); }
  }

  const columns = [
    { key: 'name', label: 'Store', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'rating', label: 'Overall rating', sortable: true, render: (r) => <Rating value={r.rating} /> },
    { key: 'myRating', label: 'Your rating', sortable: true, render: (r) => (
      <span className="rate-cell">
        <StarInput value={r.myRating} disabled={busyId === r.id} onChange={(n) => rate(r.id, n)} />
        <small className="muted">{r.myRating ? 'Click a star to change it' : 'Click a star to rate'}</small>
      </span>
    ) },
  ];

  return (
    <main className="page">
      <h1>Stores</h1>
      <div className="filters">
        <label className="field">
          <span className="label">Search by name or address</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. Market Street" />
        </label>
      </div>
      {(error || loadError) && <p className="notice bad">{error || loadError}</p>}
      {loading && !data ? <p className="muted">Loading…</p> : (
        <DataTable columns={columns} rows={data || []} {...s} onSort={(k) => setS(nextSort(s, k))} empty="No stores match your search." />
      )}
    </main>
  );
}
