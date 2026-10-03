import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, homeFor } from '../auth.jsx';

const ROLE_LABEL = { ADMIN: 'Administrator', USER: 'Shopper', STORE_OWNER: 'Store owner' };

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const out = () => { logout(); navigate('/login'); };
  return (
    <header className="nav">
      <div className="nav-inner">
        <NavLink to={homeFor(user.role)} className="brand">Storefront Ratings</NavLink>
        <nav>
          <NavLink to={homeFor(user.role)} end>{user.role === 'ADMIN' ? 'Dashboard' : user.role === 'USER' ? 'Stores' : 'My store'}</NavLink>
          <NavLink to="/password">Change password</NavLink>
        </nav>
        <div className="who">
          <span>{user.name}<small>{ROLE_LABEL[user.role]}</small></span>
          <button className="btn ghost" onClick={out}>Log out</button>
        </div>
      </div>
    </header>
  );
}
