import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { login } from '../lib/auth';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-page">
      <div className="login-outer animate-fade-up">
        <div className="login-inner">
          <div className="login-header animate-fade-up delay-100">
            <div className="login-logo">D</div>
            <h1 className="login-title">Dome Admin</h1>
            <p className="login-subtitle">Sign in to manage bookings and customers</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group animate-fade-up delay-200">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                className="form-control"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group animate-fade-up delay-300">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="login-error animate-fade-up">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </p>
            )}
            <button type="submit" className="btn-login animate-fade-up delay-400">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;