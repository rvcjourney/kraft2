import { useState } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FiLogIn, FiUserPlus, FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import * as localAuth from '../../services/localAuth';
import { supabase } from '../../services/supabaseAPI';
import { useUserStore } from '../../store/userStore';
import './AuthForm.css';

/**
 * AuthForm Component
 * Professional login/register with pill-style mode toggle
 * Uses design tokens for consistent theming
 */
export default function AuthForm({ onSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const setUser = useUserStore((state) => state.setUser);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let response;

      if (mode === 'login') {
        if (!formData.email || !formData.password) {
          throw new Error('Email and password are required');
        }
        response = await localAuth.login(formData.email, formData.password);
      } else {
        if (!formData.email || !formData.password || !formData.fullName) {
          throw new Error('All fields are required');
        }
        response = await localAuth.register(
          formData.email,
          formData.password,
          formData.fullName
        );
      }

      if (response.success) {
        setSuccess(`${mode === 'login' ? 'Login' : 'Registration'} successful!`);
        const stored = localAuth.getStoredUser();
        setUser(stored || response.user || { id: formData.email, email: formData.email });

        if (response.user?.id) {
          localStorage.setItem('user_id', response.user.id);
          localStorage.setItem('email', response.user.email);
        }

        // Save to Supabase (for registration)
        if (mode === 'register' && response.user?.id) {
          try {
            console.log('Saving user to Supabase...', response.user.id);
            const { error } = await supabase
              .from('user_profiles')
              .upsert(
                {
                  user_id: response.user.id,
                  full_name: formData.fullName,
                  created_at: new Date().toISOString(),
                },
                { onConflict: 'user_id' }
              );

            if (error) {
              console.error('Supabase save error:', error);
            } else {
              console.log('User saved to Supabase!');
            }
          } catch (dbError) {
            console.error('Could not save to Supabase:', dbError?.message);
          }
        }

        setTimeout(() => {
          onSuccess?.();
        }, 1000);
      } else {
        setError(response.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card shadow-lg border-0">
        {/* Header */}
        <Card.Header className="auth-header text-white p-3 text-center">
          <h2 className="mb-1">CareerKraft</h2>
          <p className="mb-0 small opacity-90">AI-Driven Learning Platform for BFSI</p>
        </Card.Header>

        <Card.Body className="p-3">
          {/* Welcome Text */}
          <div className="text-center mb-3">
            <h5 className="text-muted">Welcome to Your Learning Journey</h5>
          </div>

          {/* Mode Toggle - Pill Style with Underline */}
          <div className="auth-mode-toggle mb-4">
            <button
              type="button"
              className={`mode-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
            >
              <FiLogIn size={18} className="me-2" style={{ display: 'inline' }} />
              Sign In
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register');
                setError('');
                setSuccess('');
              }}
            >
              <FiUserPlus size={18} className="me-2" style={{ display: 'inline' }} />
              Register
            </button>
          </div>

          <Form onSubmit={handleSubmit}>
            {/* Full Name Field (Register only) */}
            {mode === 'register' && (
              <Form.Group className="mb-4">
                <Form.Label className="d-flex align-items-center gap-2 fw-semibold">
                  <FiUser size={18} className="text-primary" /> Full Name
                </Form.Label>
                <Form.Control
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  disabled={loading}
                  className="rounded-lg"
                />
              </Form.Group>
            )}

            {/* Email Field */}
            <Form.Group className="mb-4">
              <Form.Label className="d-flex align-items-center gap-2 fw-semibold">
                <FiMail size={18} className="text-primary" /> Email Address
              </Form.Label>
              <Form.Control
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                disabled={loading}
                className="rounded-lg"
              />
            </Form.Group>

            {/* Password Field */}
            <Form.Group className="mb-4">
              <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                <Form.Label className="d-flex align-items-center gap-2 fw-semibold mb-0">
                  <FiLock size={18} className="text-primary" /> Password
                </Form.Label>
                {mode === 'login' && (
                  <a href="#" className="text-primary text-decoration-none small fw-semibold">
                    Forgot?
                  </a>
                )}
              </div>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  disabled={loading}
                  className="rounded-lg pe-5"
                />
                <Button
                  variant="link"
                  className="position-absolute end-0 top-50 translate-middle-y text-primary border-0 p-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </Button>
              </div>
            </Form.Group>

            {/* Error Alert */}
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4 rounded-lg">
                {error}
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-4 rounded-lg">
                {success}
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              variant={mode === 'register' ? 'warning' : 'primary'}
              type="submit"
              className="w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span>Authenticating...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <FiLogIn size={18} /> Sign In
                </>
              ) : (
                <>
                  <FiUserPlus size={18} /> Create Account
                </>
              )}
            </Button>
          </Form>

          {/* Footer Text */}
          <div className="text-center mt-4 pt-3 border-top mb-0">
            <p className="text-muted small mb-0">
              {mode === 'login' ? (
                <>
                  New here? Switch to <strong>Register</strong> tab above
                </>
              ) : (
                <>
                  Have an account? Switch to <strong>Sign In</strong> tab above
                </>
              )}
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
