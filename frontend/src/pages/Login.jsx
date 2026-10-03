import { Link, useNavigate } from 'react-router-dom';
import { useAuth, homeFor } from '../auth.jsx';
import Form from '../components/Form.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  return (
    <main className="auth">
      <h1>Log in</h1>
      <p className="muted">One login for shoppers, store owners and administrators.</p>
      <Form
        initial={{ email: '', password: '' }}
        fields={[
          { name: 'email', label: 'Email', type: 'email', rule: 'required' },
          { name: 'password', label: 'Password', type: 'password', rule: 'required' },
        ]}
        submitLabel="Log in"
        onSubmit={async ({ email, password }) => {
          const user = await login(email, password);
          navigate(homeFor(user.role), { replace: true });
        }}
      />
      <p className="muted">New here? <Link to="/signup">Create an account</Link></p>
    </main>
  );
}
