import api from '../api.js';
import Form from '../components/Form.jsx';

export default function ChangePassword() {
  return (
    <main className="page narrow">
      <h1>Change password</h1>
      <Form
        initial={{ currentPassword: '', password: '' }}
        resetOnSuccess
        fields={[
          { name: 'currentPassword', label: 'Current password', type: 'password', rule: 'required' },
          { name: 'password', label: 'New password', type: 'password', hint: '8 to 16 characters, one uppercase letter, one special character.' },
        ]}
        submitLabel="Update password"
        onSubmit={async (v) => (await api.put('/auth/password', v)).data.message}
      />
    </main>
  );
}
