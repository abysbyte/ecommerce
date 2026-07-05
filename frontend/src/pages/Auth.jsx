import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setResendSuccess('');
      const res = await fetch('/api/users/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request OTP');
      
      setStep(2);
      setCooldown(60);
      setAttemptsRemaining(3);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setResendSuccess('');
      const res = await fetch('/api/users/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
          if (data.attemptsRemaining === 0) {
            setStep(1);
          }
        }
        throw new Error(data.error || 'Failed to verify OTP');
      }

      if (onLoginSuccess) await onLoginSuccess();
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResendOtp = async () => {
    try {
      setError('');
      setResendSuccess('');
      const res = await fetch('/api/users/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request OTP');

      setCooldown(60);
      setAttemptsRemaining(3);
      setResendSuccess('A new 6-digit verification code has been sent!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    try {
      const res = await fetch('/api/users/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to authenticate with Google');

      if (onLoginSuccess) await onLoginSuccess();
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const initGoogle = async () => {
      try {
        const res = await fetch('/api/users/config');
        const data = await res.json();
        if (data.googleClientId && window.google) {
          window.google.accounts.id.initialize({
            client_id: data.googleClientId,
            callback: handleGoogleCredentialResponse
          });
          window.google.accounts.id.renderButton(
            document.getElementById('googleLoginBtn'),
            { theme: 'outline', size: 'large', width: '100%' }
          );
        }
      } catch (err) {
        console.error('Error loading Google OAuth config:', err);
      }
    };
    initGoogle();
  }, [step]);

  return (
    <div style={{ padding: '2rem' }}>
      <div className="auth-container">
        <h2>LOG IN</h2>
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        {resendSuccess && <p style={{ color: 'green', fontWeight: 'bold' }}>{resendSuccess}</p>}
        
        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <p style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#555', fontWeight: 600 }}>
              Enter your email to receive a secure 6-digit verification code.
            </p>
            <div className="form-group">
              <label>EMAIL</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '1rem' }}>SEND OTP</button>
            <div id="googleLoginBtn" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}></div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#555', fontWeight: 600 }}>
              A 6-digit verification code was sent to <strong>{email}</strong>.
            </p>
            <div className="form-group">
              <label>OTP CODE</label>
              <input type="text" maxLength={6} placeholder="Enter 6-digit code" value={otp} onChange={e => setOtp(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '1rem' }}>VERIFY & LOG IN</button>
            <button 
              className="btn btn-secondary" 
              type="button" 
              onClick={handleResendOtp} 
              disabled={cooldown > 0}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {cooldown > 0 ? `RESEND IN ${cooldown}S` : 'RESEND CODE'}
            </button>
            <button className="btn btn-danger" type="button" onClick={() => setStep(1)} style={{ width: '100%', marginTop: '1rem' }}>BACK</button>
          </form>
        )}
        
        <p style={{ marginTop: '2rem', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
          NEW HERE? <Link to="/signup" style={{ color: 'var(--blue)' }}>CREATE ACCOUNT</Link>
        </p>
      </div>
    </div>
  );
};

export const Signup = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setResendSuccess('');
      const res = await fetch('/api/users/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request OTP');
      
      setStep(2);
      setCooldown(60);
      setAttemptsRemaining(3);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setResendSuccess('');
      const res = await fetch('/api/users/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
          if (data.attemptsRemaining === 0) {
            setStep(1);
          }
        }
        throw new Error(data.error || 'Failed to verify OTP');
      }

      if (onLoginSuccess) await onLoginSuccess();
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResendOtp = async () => {
    try {
      setError('');
      setResendSuccess('');
      const res = await fetch('/api/users/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request OTP');

      setCooldown(60);
      setAttemptsRemaining(3);
      setResendSuccess('A new 6-digit verification code has been sent!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    try {
      const res = await fetch('/api/users/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to authenticate with Google');

      if (onLoginSuccess) await onLoginSuccess();
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const initGoogle = async () => {
      try {
        const res = await fetch('/api/users/config');
        const data = await res.json();
        if (data.googleClientId && window.google) {
          window.google.accounts.id.initialize({
            client_id: data.googleClientId,
            callback: handleGoogleCredentialResponse
          });
          window.google.accounts.id.renderButton(
            document.getElementById('googleSignupBtn'),
            { theme: 'outline', size: 'large', width: '100%' }
          );
        }
      } catch (err) {
        console.error('Error loading Google OAuth config:', err);
      }
    };
    initGoogle();
  }, [step]);

  return (
    <div style={{ padding: '2rem' }}>
      <div className="auth-container" style={{ boxShadow: '12px 12px 0px var(--black)', borderColor: 'var(--blue)' }}>
        <h2 style={{ color: 'var(--blue)' }}>SIGN UP</h2>
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        {resendSuccess && <p style={{ color: 'green', fontWeight: 'bold' }}>{resendSuccess}</p>}
        
        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <p style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#555', fontWeight: 600 }}>
              Create an account or sign in with your email address to receive a secure 6-digit OTP code.
            </p>
            <div className="form-group">
              <label>EMAIL</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} style={{ borderColor: 'var(--blue)' }} required />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '1rem' }}>SEND OTP</button>
            <div id="googleSignupBtn" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}></div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#555', fontWeight: 600 }}>
              A 6-digit verification code was sent to <strong>{email}</strong>.
            </p>
            <div className="form-group">
              <label>OTP CODE</label>
              <input type="text" maxLength={6} placeholder="Enter 6-digit code" value={otp} onChange={e => setOtp(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '1rem' }}>VERIFY & REGISTER</button>
            <button 
              className="btn btn-secondary" 
              type="button" 
              onClick={handleResendOtp} 
              disabled={cooldown > 0}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {cooldown > 0 ? `RESEND IN ${cooldown}S` : 'RESEND CODE'}
            </button>
            <button className="btn btn-danger" type="button" onClick={() => setStep(1)} style={{ width: '100%', marginTop: '1rem' }}>BACK</button>
          </form>
        )}
        
        <p style={{ marginTop: '2rem', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
          ALREADY A MEMBER? <Link to="/login" style={{ color: 'var(--black)' }}>LOG IN</Link>
        </p>
      </div>
    </div>
  );
};

export const AdminLogin = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to login');

      // Only allow admins to login from this page
      if (data.user.role !== 'ADMIN') {
        // Logout the user immediately
        await fetch('/api/users/logout', {
          method: 'POST',
          credentials: 'include'
        });
        throw new Error('Only admin accounts can access this portal. Regular users must login from the user login page.');
      }
      
      if (onLoginSuccess) await onLoginSuccess();
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div className="auth-container" style={{ boxShadow: '12px 12px 0px var(--black)', borderColor: 'var(--blue)' }}>
        <h2 style={{ color: 'var(--blue)' }}>ADMIN LOGIN</h2>
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        <form onSubmit={handleAdminLogin}>
          <div className="form-group">
            <label>EMAIL</label>
            <input type="email" placeholder="Enter admin email" value={email} onChange={e => setEmail(e.target.value)} style={{ borderColor: 'var(--blue)' }} required />
          </div>
          <div className="form-group">
            <label>PASSWORD</label>
            <input type="password" placeholder="Enter admin password" value={password} onChange={e => setPassword(e.target.value)} style={{ borderColor: 'var(--blue)' }} required />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '1rem' }}>ADMIN LOGIN</button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>
          NEED TO CREATE ADMIN USER? <Link to="/admin/create-user" style={{ color: 'var(--blue)' }}>CREATE USER</Link>
        </p>
      </div>
    </div>
  );
};

export const AdminCreateUser = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/admin-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, adminSecret }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      
      setSuccess('Admin user created successfully!');
      setName('');
      setEmail('');
      setPassword('');
      setAdminSecret('');
      if (onLoginSuccess) await onLoginSuccess();
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div className="auth-container" style={{ boxShadow: '12px 12px 0px var(--black)', borderColor: 'var(--blue)' }}>
        <h2 style={{ color: 'var(--blue)' }}>CREATE NEW ADMIN USER</h2>
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        {success && <p style={{ color: 'green', fontWeight: 'bold' }}>{success}</p>}
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label>FULL NAME</label>
            <input type="text" placeholder="Enter admin name" value={name} onChange={e => setName(e.target.value)} style={{ borderColor: 'var(--blue)' }} required />
          </div>
          <div className="form-group">
            <label>EMAIL</label>
            <input type="email" placeholder="Enter admin email" value={email} onChange={e => setEmail(e.target.value)} style={{ borderColor: 'var(--blue)' }} required />
          </div>
          <div className="form-group">
            <label>PASSWORD</label>
            <input type="password" placeholder="Create password" value={password} onChange={e => setPassword(e.target.value)} style={{ borderColor: 'var(--blue)' }} required />
          </div>
          <div className="form-group">
            <label>ADMIN SECRET</label>
            <input type="password" placeholder="Enter admin secret code" value={adminSecret} onChange={e => setAdminSecret(e.target.value)} style={{ borderColor: 'var(--blue)' }} required />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '1rem' }}>CREATE USER</button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>
          <Link to="/admin-portal" style={{ color: 'var(--black)' }}>BACK TO LOGIN</Link>
        </p>
      </div>
    </div>
  );
};
