import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  GraduationCap, 
  Hash, 
  Building2, 
  Phone, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { User, Department } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
}

const DEPARTMENTS: Department[] = [
  'Computer Science & Engineering (CSE)',
  'CSE AIML',
  'CSE Data Science',
  'Information Technology (IT)',
  'Electronics & Communication (ECE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Artificial Intelligence & ML (AIML)',
  'Applied Sciences & Humanities'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regDepartment, setRegDepartment] = useState<Department>('Computer Science & Engineering (CSE)');
  const [regYear, setRegYear] = useState<'1st Year' | '2nd Year' | '3rd Year' | '4th Year'>('1st Year');
  const [regSection, setRegSection] = useState('A');
  const [regRollNumber, setRegRollNumber] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');

  if (!isOpen) return null;

  const getRegisteredUsers = (): User[] => {
    try {
      const stored = localStorage.getItem('mgmcet_registered_students');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const emailClean = loginEmail.trim().toLowerCase();
    const passwordClean = loginPassword.trim();

    if (!emailClean || !passwordClean) {
      setLoginError('Please enter both your college email and password.');
      return;
    }

    if (!emailClean.endsWith('@coet.in')) {
      setLoginError('Email must end with @coet.in format (e.g. yourname@coet.in).');
      return;
    }

    const registeredUsers = getRegisteredUsers();
    const matched = registeredUsers.find(u => u.collegeEmail.toLowerCase() === emailClean);

    if (!matched) {
      setLoginError('No student account found. Please register as a new student.');
      return;
    }

    const storedPasswords = JSON.parse(localStorage.getItem('mgmcet_student_passwords') || '{}');
    if (storedPasswords[matched.id] && storedPasswords[matched.id] !== passwordClean) {
      setLoginError('Incorrect password.');
      return;
    }

    onLoginSuccess(matched);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('Please provide your full name.');
      return;
    }
    if (!regRollNumber.trim()) {
      setRegError('College Roll Number is required.');
      return;
    }
    const email = regEmail.trim().toLowerCase();
    if (!email) {
      setRegError('Official college email is required.');
      return;
    }
    const coetRegex = /^[a-zA-Z0-9._%+-]+@coet\.in$/;
    if (!email.endsWith('@coet.in') || !coetRegex.test(email)) {
      setRegError('Email must end with @coet.in (e.g. rollnumber@coet.in). No other format allowed.');
      return;
    }

    const phone = regPhone.trim();
    if (phone) {
      if (/[a-zA-Z]/.test(phone)) {
        setRegError('Mobile number cannot contain any alphabetical characters. Numbers only.');
        return;
      }
      if (!/^\d+$/.test(phone)) {
        setRegError('Mobile number must contain digits only.');
        return;
      }
      if (phone.length !== 10) {
        setRegError('Mobile number must be a 10-digit number.');
        return;
      }
    }

    if (!regPassword || regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    const newStudent: User = {
      id: `usr_${Date.now()}`,
      fullName: regName.trim(),
      collegeEmail: regEmail.trim().toLowerCase(),
      department: regDepartment,
      year: regYear,
      section: regSection.trim().toUpperCase() || 'A',
      rollNumber: regRollNumber.trim(),
      phoneNumber: regPhone.trim() || undefined,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(regName.trim())}&backgroundColor=1c2541,3a0ca3,4361ee`,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };

    const existing = getRegisteredUsers();
    localStorage.setItem('mgmcet_registered_students', JSON.stringify([...existing, newStudent]));

    const storedPasswords = JSON.parse(localStorage.getItem('mgmcet_student_passwords') || '{}');
    storedPasswords[newStudent.id] = regPassword;
    localStorage.setItem('mgmcet_student_passwords', JSON.stringify(storedPasswords));

    onLoginSuccess(newStudent);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 20, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 100
    }}>
      <div 
        className="glass-panel animate-modal-pop"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)',
          position: 'relative',
          padding: '2rem 1.8rem'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
            boxShadow: '0 6px 20px rgba(67, 97, 238, 0.4)',
            marginBottom: '0.75rem'
          }}>
            <Building2 size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.3rem' }}>
            {mode === 'login' ? 'MGMCET Student Login' : 'New Student Registration'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
            Mahatma Gandhi Mission's College of Engg. & Technology, Noida Sec-62.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 'var(--radius-md)',
          padding: '0.3rem',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-glass)'
        }}>
          <button
            onClick={() => { setMode('login'); setLoginError(''); }}
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mode === 'login' ? 'var(--primary)' : 'transparent',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            Student Login
          </button>
          <button
            onClick={() => { setMode('register'); setRegError(''); }}
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mode === 'register' ? 'var(--primary)' : 'transparent',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            New Student Register
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loginError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--lost-bg)',
                border: '1px solid var(--lost-border)',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--lost-color)',
                fontSize: '0.8rem'
              }}>
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Official College Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="email"
                  placeholder="e.g. yourname@coet.in"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.6rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                marginTop: '0.5rem'
              }}
            >
              <span>Log In</span>
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {regError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--lost-bg)',
                border: '1px solid var(--lost-border)',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--lost-color)',
                fontSize: '0.8rem'
              }}>
                <AlertCircle size={16} />
                <span>{regError}</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Full Name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Branch / Department
              </label>
              <select
                value={regDepartment}
                onChange={(e) => setRegDepartment(e.target.value as Department)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#0e172e',
                  border: '1px solid var(--border-glass)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Class / Year
                </label>
                <select
                  value={regYear}
                  onChange={(e) => setRegYear(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#0e172e',
                    border: '1px solid var(--border-glass)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Section
                </label>
                <input
                  type="text"
                  placeholder="Section"
                  value={regSection}
                  onChange={(e) => setRegSection(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Roll Number
              </label>
              <input
                type="text"
                placeholder="Roll Number"
                value={regRollNumber}
                onChange={(e) => setRegRollNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Official College Email
              </label>
              <input
                type="email"
                placeholder="rollnumber@coet.in"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Confirm
                </label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                marginTop: '0.4rem'
              }}
            >
              <span>Register</span>
              <CheckCircle2 size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
