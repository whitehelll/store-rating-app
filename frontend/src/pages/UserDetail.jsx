import { Link, useParams } from 'react-router-dom';
import { useFetch } from '../api.js';
import { Rating } from '../components/Stars.jsx';

const ROLES = { ADMIN: 'Administrator', USER: 'Normal user', STORE_OWNER: 'Store owner' };

export default function UserDetail() {
  const { id } = useParams();
  const { data: u, loading, error } = useFetch(`/admin/users/${id}`);
  return (
    <main className="page narrow">
      <Link to="/admin">Back to dashboard</Link>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="notice bad">{error}</p>}
      {u && (
        <>
          <h1>{u.name}</h1>
          <dl className="details">
            <dt>Email</dt><dd>{u.email}</dd>
            <dt>Address</dt><dd>{u.address || '—'}</dd>
            <dt>Role</dt><dd>{ROLES[u.role]}</dd>
            {u.role === 'STORE_OWNER' && (<><dt>Store rating</dt><dd><Rating value={u.rating} /></dd></>)}
          </dl>
        </>
      )}
    </main>
  );
}
