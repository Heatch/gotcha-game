import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';
import IconVisibility from '~icons/material-symbols/visibility-outline';
import IconVisibilityOff from '~icons/material-symbols/visibility-off-outline';

export default function LoginForm() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !password.trim()) {
      setError('Please enter both name and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await login(name.trim(), password);
      if (result.success) {
        setUser(result.user);
        navigate('/missions');
      } else {
        setLoading(false);
        setError(result.message || 'Login failed.');
      }
    } catch {
      setLoading(false);
      setError('Could not connect to server. Make sure it is running.');
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="input-group">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          autoComplete="name"
          autoFocus
        />
      </div>
      <div className="input-group password-group">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button
          type="button"
          className="toggle-password"
          onClick={() => setShowPassword(s => !s)}
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <IconVisibilityOff /> : <IconVisibility />}
        </button>
      </div>
      {error && <p className="login-error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  );
}
