import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth, homeFor } from './auth.jsx';
import Nav from './components/Nav.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import UserDetail from './pages/UserDetail.jsx';
import Stores from './pages/Stores.jsx';
import OwnerDashboard from './pages/OwnerDashboard.jsx';
import ChangePassword from './pages/ChangePassword.jsx';

function Protected({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/login" element={user ? <Navigate to={homeFor(user.role)} replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to={homeFor(user.role)} replace /> : <Signup />} />
        <Route path="/admin" element={<Protected roles={['ADMIN']}><AdminDashboard /></Protected>} />
        <Route path="/admin/users/:id" element={<Protected roles={['ADMIN']}><UserDetail /></Protected>} />
        <Route path="/stores" element={<Protected roles={['USER']}><Stores /></Protected>} />
        <Route path="/owner" element={<Protected roles={['STORE_OWNER']}><OwnerDashboard /></Protected>} />
        <Route path="/password" element={<Protected><ChangePassword /></Protected>} />
        <Route path="*" element={<Navigate to={user ? homeFor(user.role) : '/login'} replace />} />
      </Routes>
    </>
  );
}
