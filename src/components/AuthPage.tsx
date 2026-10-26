import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  GraduationCap, 
  Hash, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import type { User, Department } from '../types';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

const DEPARTMENTS: Department[] = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Electronics & Communication (ECE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Artificial Intelligence & ML (AIML)',
  'Applied Sciences & Humanities'
];

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

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
  const [regSuccess, setRegSuccess] = useState('');

  // Helper to get registered students from localStorage
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

    if (!emailClean) {
      setLoginError('Please enter your college email address.');
      return;
    }

    if (!emailClean.endsWith('@coet.in')) {
      setLoginError('Email address must end with the @coet.in format (e.g. yourname@coet.in). No other format is permitted.');
      return;
    }

    if (!passwordClean) {
      setLoginError('Please enter your password.');
      return;
    }

    const registeredUsers = getRegisteredUsers();
    const matchedUser = registeredUsers.find(
      u => u.collegeEmail.toLowerCase() === emailClean
    );

    if (!matchedUser) {
      setLoginError('No student account found with this email. Please click "New Student Register" below to create your account.');
      return;
    }

    // Verify stored password
    const storedPasswords = JSON.parse(localStorage.getItem('mgmcet_student_passwords') || '{}');
    if (storedPasswords[matchedUser.id] && storedPasswords[matchedUser.id] !== passwordClean) {
      setLoginError('Incorrect password. Please verify and try again.');
      return;
    }

    onLoginSuccess(matchedUser);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    const name = regName.trim();
    const roll = regRollNumber.trim();
    const email = regEmail.trim().toLowerCase();
    const section = regSection.trim().toUpperCase();

    if (!name) {
      setRegError('Please enter your full name.');
      return;
    }
    if (!roll) {
      setRegError('College Roll Number is required.');
      return;
    }
    if (!email) {
      setRegError('Official college email is required.');
      return;
    }

    // Strict validation: Email must end with @coet.in
    const coetEmailPattern = /^[a-zA-Z0-9._%+-]+@coet\.in$/;
    if (!email.endsWith('@coet.in') || !coetEmailPattern.test(email)) {
      setRegError('Email address must end with @coet.in (e.g. rollnumber@coet.in). No other email format is allowed.');
      return;
    }

    // Strict validation: Mobile number can contain numbers only, no alphabetical characters
    const phone = regPhone.trim();
    if (phone) {
      if (/[a-zA-Z]/.test(phone)) {
        setRegError('Mobile number cannot contain any alphabetical characters. Please use numbers only.');
        return;
      }
      if (!/^\d+$/.test(phone)) {
        setRegError('Mobile number must contain digits only.');
        return;
      }
      if (phone.length !== 10) {
        setRegError('Mobile number must be exactly 10 digits.');
        return;
      }
    }

    if (!regPassword || regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    // Check if email or roll number already registered
    const existingUsers = getRegisteredUsers();
    if (existingUsers.some(u => u.collegeEmail.toLowerCase() === email)) {
      setRegError('An account with this email already exists. Please log in.');
      return;
    }
    if (existingUsers.some(u => u.rollNumber.toLowerCase() === roll.toLowerCase())) {
      setRegError('This Roll Number has already been registered. Please log in.');
      return;
    }

    const newStudent: User = {
      id: `usr_${Date.now()}`,
      fullName: name,
      collegeEmail: email,
      department: regDepartment,
      year: regYear,
      section: section || 'A',
      rollNumber: roll,
      phoneNumber: regPhone.trim() || undefined,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=a7f3d0,10b981,059669&textColor=065f46`,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };

    // Save to registered list
    const updatedUsers = [...existingUsers, newStudent];
    localStorage.setItem('mgmcet_registered_students', JSON.stringify(updatedUsers));

    // Save password
    const storedPasswords = JSON.parse(localStorage.getItem('mgmcet_student_passwords') || '{}');
    storedPasswords[newStudent.id] = regPassword;
    localStorage.setItem('mgmcet_student_passwords', JSON.stringify(storedPasswords));

    setRegSuccess('Registration successful! Logging you in...');
    setTimeout(() => {
      onLoginSuccess(newStudent);
    }, 700);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem',
      position: 'relative'
    }}>
      {/* College Header with Logo at Top */}
      <div style={{
        textAlign: 'center',
        marginBottom: '1.75rem',
        maxWidth: '560px'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#ffffff',
          padding: '4px',
          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.25), 0 2px 10px rgba(0,0,0,0.06)',
          marginBottom: '0.85rem',
          border: '3px solid var(--primary)'
        }}>
          <img
            src="/images/logo4.jpg"
            alt="MGM College of Engineering and Technology Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '50%'
            }}
          />
        </div>

        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
          MGMCET CampusFinder
        </h1>
        <div style={{
          fontSize: '0.86rem',
          fontWeight: 700,
          color: 'var(--primary-dark)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '0.35rem'
        }}>
          Mahatma Gandhi Mission's College of Engineering & Technology
        </div>
        <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4 }}>
          Sector 62, Noida Campus • Official Student Lost & Found Portal
        </p>
      </div>

      {/* Centered Clean White Card Container */}
      <div 
        className="glass-panel animate-modal-pop"
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: 'var(--radius-lg)',
          background: '#ffffff',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          boxShadow: '0 20px 50px -10px rgba(16, 185, 129, 0.15), 0 4px 20px rgba(0, 0, 0, 0.05)',
          padding: '2.2rem 2rem'
        }}
      >
        {/* Switcher: Login vs Register */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#f1f5f9',
          borderRadius: 'var(--radius-md)',
          padding: '0.35rem',
          marginBottom: '1.75rem',
          border: '1px solid #e2e8f0'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setLoginError(''); }}
            style={{
              padding: '0.7rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mode === 'login' ? 'var(--primary)' : 'transparent',
              color: mode === 'login' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: mode === 'login' ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            Student Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setRegError(''); }}
            style={{
              padding: '0.7rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mode === 'register' ? 'var(--primary)' : 'transparent',
              color: mode === 'register' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: mode === 'register' ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            New Student Register
          </button>
        </div>

        {/* LOGIN VIEW */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {loginError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--lost-bg)',
                border: '1px solid var(--lost-border)',
                padding: '0.7rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--lost-color)',
                fontSize: '0.82rem',
                lineHeight: 1.4
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  Official College Email ID
                </label>
                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, background: '#ecfdf5', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                  Must end in @coet.in
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  placeholder="e.g. student@coet.in"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem 0.8rem 2.7rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              {loginEmail.includes('@') && !loginEmail.toLowerCase().endsWith('@coet.in') && (
                <div style={{ fontSize: '0.73rem', color: '#e11d48', marginTop: '0.35rem', fontWeight: 500 }}>
                  ⚠️ Only official emails ending with @coet.in are accepted.
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem 0.8rem 2.7rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '0.9rem',
                fontSize: '0.98rem',
                fontWeight: 700,
                marginTop: '0.5rem'
              }}
            >
              <span>Login to Campus Finder</span>
              <ArrowRight size={18} />
            </button>

            <div style={{
              textAlign: 'center',
              marginTop: '0.85rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid #f1f5f9'
            }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                New student at MGMCET?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-dark)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Register here
                </button>
              </span>
            </div>
          </form>
        ) : (
          /* REGISTRATION VIEW */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {regError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--lost-bg)',
                border: '1px solid var(--lost-border)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--lost-color)',
                fontSize: '0.82rem'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--found-bg)',
                border: '1px solid var(--found-border)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--found-color)',
                fontSize: '0.82rem'
              }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>{regSuccess}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                Full Name (Student)
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Enter your official name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Department / Branch */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                Branch / Department
              </label>
              <div style={{ position: 'relative' }}>
                <GraduationCap size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <select
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value as Department)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Class / Year & Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  Class / Year
                </label>
                <select
                  value={regYear}
                  onChange={(e) => setRegYear(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
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
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  Section
                </label>
                <input
                  type="text"
                  placeholder="e.g. A, B, C"
                  value={regSection}
                  onChange={(e) => setRegSection(e.target.value)}
                  maxLength={3}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* College Roll Number */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                University / College Roll Number
              </label>
              <div style={{ position: 'relative' }}>
                <Hash size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="e.g. 2300970100054"
                  value={regRollNumber}
                  onChange={(e) => setRegRollNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Official College Email */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                  Official College Email ID
                </label>
                <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, background: '#ecfdf5', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                  Must end in @coet.in
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  placeholder="e.g. rollnumber@coet.in"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>
              {regEmail.includes('@') && !regEmail.toLowerCase().endsWith('@coet.in') && (
                <div style={{ fontSize: '0.72rem', color: '#e11d48', marginTop: '0.25rem', fontWeight: 500 }}>
                  ⚠️ Email must end with @coet.in (no other format allowed)
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                  Contact / WhatsApp Number (for item recovery)
                </label>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                  Numbers only (10 digits)
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Phone size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  placeholder="e.g. 9876543210 (10 digits, numbers only)"
                  value={regPhone}
                  onKeyDown={(e) => {
                    // Allow navigation/editing keys
                    if (['Backspace', 'Tab', 'Enter', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                      return;
                    }
                    // Prevent any character that is not a numeric digit 0-9
                    if (!/^[0-9]$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    // Strictly strip any alphabetical or non-numeric characters immediately
                    const numericOnly = e.target.value.replace(/[^0-9]/g, '');
                    setRegPhone(numericOnly.slice(0, 10));
                  }}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>
              {regPhone.length > 0 && regPhone.length < 10 && (
                <div style={{ fontSize: '0.71rem', color: '#d97706', marginTop: '0.2rem' }}>
                  Entered {regPhone.length}/10 digits
                </div>
              )}
            </div>

            {/* Password & Confirm */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  Create Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="password"
                    placeholder="Min 6 chars"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.2rem',
                      borderRadius: 'var(--radius-md)',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  Confirm
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="password"
                    placeholder="Repeat"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.2rem',
                      borderRadius: 'var(--radius-md)',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
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
              <span>Complete Student Registration</span>
              <CheckCircle2 size={18} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-dark)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Log in
                </button>
              </span>
            </div>
          </form>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#475569' }}>
        Approved by AICTE, Affiliated to AKTU Lucknow • A-9, Sector 62, Institutional Area, Noida
      </div>
    </div>
  );
};
