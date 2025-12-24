import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { UserRole } from '../../types';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, error, clearError, loading } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('editor');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    setFormError(null);
    if (!email.trim()) { setFormError('Email is required'); return false; }
    if (!password) { setFormError('Password is required'); return false; }
    if (password.length < 6) { setFormError('Password must be at least 6 characters'); return false; }
    if (isSignUp && password !== confirmPassword) { setFormError('Passwords do not match'); return false; }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validateForm()) return;

    try {
      if (isSignUp) {
        await signUp(email, password, role);
      } else {
        await signIn(email, password);
      }
      navigate('/dashboard');
    } catch {
      //setFormError('Invalid email or password');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormError(null);
    clearError();
    setConfirmPassword('');
  };

  const displayError = formError || error;

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden bg-[var(--bg-primary)]">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary-500 to-secondary bg-clip-text text-transparent mb-2">
            FlowDiagram
          </h1>
          <p className="text-[var(--text-secondary)]">
            Create beautiful diagrams with drag-and-drop simplicity
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-[var(--text-tertiary)]">
              {isSignUp ? 'Start building amazing diagrams today' : 'Sign in to continue to your diagrams'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {displayError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-xl text-sm font-medium">
                {displayError}
              </div>
            )}

            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              autoComplete="email"
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />

            {isSignUp && (
              <>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock size={18} />}
                  autoComplete="new-password"
                />

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Account Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={`flex flex-col items-center gap-1 p-4 bg-[var(--bg-primary)] border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        role === 'editor' ? 'border-primary-500 bg-primary-500/10' : 'border-[var(--border-color)] hover:border-primary-500'
                      }`}
                      onClick={() => setRole('editor')}
                    >
                      <span className="text-sm font-semibold text-[var(--text-primary)]">Editor</span>
                      <span className="text-xs text-[var(--text-tertiary)]">Create & edit diagrams</span>
                    </button>
                    <button
                      type="button"
                      className={`flex flex-col items-center gap-1 p-4 bg-[var(--bg-primary)] border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        role === 'viewer' ? 'border-primary-500 bg-primary-500/10' : 'border-[var(--border-color)] hover:border-primary-500'
                      }`}
                      onClick={() => setRole('viewer')}
                    >
                      <span className="text-sm font-semibold text-[var(--text-primary)]">Viewer</span>
                      <span className="text-xs text-[var(--text-tertiary)]">View shared diagrams</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="button"
              className="flex items-center gap-2 bg-transparent border-none text-[var(--text-tertiary)] text-sm cursor-pointer hover:text-[var(--text-primary)] transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPassword ? 'Hide password' : 'Show password'}
            </button>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-[var(--border-color)]">
            <span className="text-sm text-[var(--text-tertiary)]">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button 
              onClick={toggleMode} 
              className="bg-transparent border-none text-primary-500 text-sm font-semibold cursor-pointer hover:opacity-80 transition-opacity"
            >
              {isSignUp ? 'Sign in' : 'Create one'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
