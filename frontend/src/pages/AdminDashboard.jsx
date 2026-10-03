import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { useFetch } from '../api.js';
import DataTable, { nextSort } from '../components/DataTable.jsx';
import Form from '../components/Form.jsx';
import { Rating } from '../components/Stars.jsx';

const ROLE_OPTIONS = [['USER', 'Normal user'], ['STORE_OWNER', 'Store owner'], ['ADMIN', 'Administrator']];
const ROLE_LABEL = Object.fromEntries(ROLE_OPTIONS);

function Filters({ values, onChange, fields }) {
  return (
    <div className="filters">
      {fields.map((f) => (
        <label className="field" key={f.name}>
          <span className="label">{f.label}</span>
          {f.options ? (
            <select value={values[f.name]} onChange={(e) => onChange({ ...values, [f.name]: e.target.value })}>
              <option value="">All</option>
              {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ) : (
            <input value={values[f.name]} onChange={(e) => onChange({ ...values, [f.name]: e.target.value })} />
          )}
        </label>
      ))}
    </div>
  );
}

function UsersTab() {
  const [f, setF] = useState({ name: '', email: '', address: '', role: '' });
  const [s, setS] = useState({ sort: 'name', order: 'asc' });
  const { data, loading, error } = useFetch('/admin/users', { ...f, ...s });
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'role', label: 'Role', sortable: true, render: (r) => ROLE_LABEL[r.role] },
    { key: 'rating', label: 'Rating', sortable: true, render: (r) => (r.role === 'STORE_OWNER' ? <Rating value={r.rating} /> : '—') },
    { key: 'view', label: '', render: (r) => <Link to={`/admin/users/${r.id}`}>Details</Link> },
  ];
  return (
    <>
      <Filters values={f} onChange={setF} fields={[
        { name: 'name', label: 'Name' }, { name: 'email', label: 'Email' },
        { name: 'address', label: 'Address' }, { name: 'role', label: 'Role', options: ROLE_OPTIONS },
      ]} />
      {error && <p className="notice bad">{error}</p>}
      {loading && !data ? <p className="muted">Loading…</p> : <DataTable columns={columns} rows={data || []} {...s} onSort={(k) => setS(nextSort(s, k))} empty="No users match these filters." />}
    </>
  );
}

function StoresTab() {
  const [f, setF] = useState({ name: '', email: '', address: '' });
  const [s, setS] = useState({ sort: 'name', order: 'asc' });
  const { data, loading, error } = useFetch('/admin/stores', { ...f, ...s });
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true, render: (r) => <Rating value={r.rating} /> },
  ];
  return (
    <>
      <Filters values={f} onChange={setF} fields={[{ name: 'name', label: 'Name' }, { name: 'email', label: 'Email' }, { name: 'address', label: 'Address' }]} />
      {error && <p className="notice bad">{error}</p>}
      {loading && !data ? <p className="muted">Loading…</p> : <DataTable columns={columns} rows={data || []} {...s} onSort={(k) => setS(nextSort(s, k))} empty="No stores match these filters." />}
    </>
  );
}

const AddUser = () => (
  <Form
    resetOnSuccess
    initial={{ name: '', email: '', address: '', password: '', role: 'USER' }}
    fields={[
      { name: 'name', label: 'Full name', hint: '20 to 60 characters.' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'password', label: 'Password', type: 'password', hint: '8 to 16 characters, one uppercase letter, one special character.' },
      { name: 'role', label: 'Role', type: 'select', options: ROLE_OPTIONS, rule: 'required' },
    ]}
    submitLabel="Add user"
    onSubmit={async (v) => { await api.post('/admin/users', v); return 'User added.'; }}
  />
);

const AddStore = () => (
  <Form
    resetOnSuccess
    initial={{ name: '', email: '', address: '', ownerEmail: '' }}
    fields={[
      { name: 'name', label: 'Store name', rule: 'storeName' },
      { name: 'email', label: 'Store email', type: 'email' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'ownerEmail', label: 'Owner email (optional)', rule: 'optionalEmail', hint: 'Must belong to an existing store owner account.' },
    ]}
    submitLabel="Add store"
    onSubmit={async (v) => { await api.post('/admin/stores', v); return 'Store added.'; }}
  />
);

const TABS = [['users', 'Users', UsersTab], ['stores', 'Stores', StoresTab], ['add-user', 'Add user', AddUser], ['add-store', 'Add store', AddStore]];

export default function AdminDashboard() {
  const [tab, setTab] = useState('users');
  const { data: stats } = useFetch('/admin/stats');
  const Active = TABS.find((t) => t[0] === tab)[2];
  return (
    <main className="page">
      <h1>Dashboard</h1>
      <section className="stats">
        <div><strong>{stats?.users ?? '–'}</strong> users</div>
        <div><strong>{stats?.stores ?? '–'}</strong> stores</div>
        <div><strong>{stats?.ratings ?? '–'}</strong> ratings submitted</div>
      </section>
      <div className="tabs" role="tablist">
        {TABS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'tab active' : 'tab'} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      <div className={tab.startsWith('add') ? 'narrow' : ''}><Active key={tab} /></div>
    </main>
  );
}
