import { useState } from 'react';
import { useFetch } from '../api.js';
import DataTable, { nextSort } from '../components/DataTable.jsx';
import { Rating } from '../components/Stars.jsx';

export default function OwnerDashboard() {
  const [s, setS] = useState({ sort: 'date', order: 'desc' });
  const { data, loading, error } = useFetch('/owner/dashboard', s);

  if (loading && !data) return <main className="page"><p className="muted">Loading…</p></main>;
  if (error) return <main className="page"><p className="notice bad">{error}</p></main>;
  if (!data.store) return <main className="page"><h1>My store</h1><p>No store is linked to your account yet. Ask an administrator to assign one.</p></main>;

  const { store, raters } = data;
  const columns = [
    { key: 'name', label: 'Customer', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true, render: (r) => <Rating value={r.rating} /> },
    { key: 'date', label: 'Last updated', sortable: true, render: (r) => new Date(r.ratedAt).toLocaleDateString() },
  ];

  return (
    <main className="page">
      <h1>{store.name}</h1>
      <p className="muted">{store.address}</p>
      <section className="hero-stat">
        <div className="big">{store.average == null ? '–' : Number(store.average).toFixed(1)}<span className="star on">★</span></div>
        <p>Average rating from {store.ratingCount} {store.ratingCount === 1 ? 'customer' : 'customers'}</p>
      </section>
      <h2>Customers who rated your store</h2>
      <DataTable columns={columns} rows={raters} {...s} onSort={(k) => setS(nextSort(s, k))} empty="No one has rated your store yet." />
    </main>
  );
}
