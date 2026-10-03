import { Link, useNavigate } from 'react-router-dom';
import api from '../api.js';
import Form from '../components/Form.jsx';

export default function Signup() {
  const navigate = useNavigate();
  return (
    <main className="auth">
      <h1>Create an account</h1>
      <p className="muted">Sign up to rate the stores you visit.</p>
      <Form
        initial={{ name: '', email: '', address: '', password: '' }}
        fields={[
          { name: 'name', label: 'Full name', hint: '20 to 60 characters.' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'address', label: 'Address', type: 'textarea', hint: 'Up to 400 characters.' },
          { name: 'password', label: 'Password', type: 'password', hint: '8 to 16 characters, one uppercase letter, one special character.' },
        ]}
        submitLabel="Create account"
        onSubmit={async (v) => {
          await api.post('/auth/signup', v);
          navigate('/login');
        }}
      />
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </main>
  );
}
