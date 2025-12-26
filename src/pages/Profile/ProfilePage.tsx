import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, LogOut, Calendar } from 'lucide-react';
import { Layout } from '../../components/layout/layout';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Profile</h1>
          <p className="text-[var(--text-tertiary)]">Manage your account settings</p>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="text-center">
            <CardContent>
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary rounded-full text-white mb-4">
                <User size={48} />
              </div>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-3">
                {user.displayName || user.email.split('@')[0]}
              </h2>
              <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold capitalize rounded-full ${
                user.role === 'editor' 
                  ? 'bg-emerald-500/15 text-emerald-500' 
                  : 'bg-primary-500/15 text-primary-500'
              }`}>
                <Shield size={14} />
                {user.role}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Account Details</h3>
              <div className="flex flex-col gap-4">
                {[
                  { icon: Mail, label: 'Email', value: user.email },
                  { icon: Shield, label: 'Role', value: user.role, capitalize: true },
                  { icon: Calendar, label: 'Member Since', value: user.createdAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                ].map(({ icon: Icon, label, value, capitalize }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-[var(--bg-primary)] rounded-lg text-primary-500">
                      <Icon size={18} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-[var(--text-tertiary)]">{label}</span>
                      <span className={`text-sm text-[var(--text-primary)] ${capitalize ? 'capitalize' : ''}`}>
                        {value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Preferences</h3>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-[var(--text-primary)]">Theme</span>
                  <span className="text-xs text-[var(--text-tertiary)]">Switch between light and dark mode</span>
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 bg-transparent border-none cursor-pointer"
                >
                  <span className={`relative w-12 h-6.5 rounded-full transition-all duration-300 ${
                    theme === 'dark' ? 'bg-primary-500' : 'bg-[var(--bg-primary)] border-2 border-[var(--border-color)]'
                  }`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
                      theme === 'dark' ? 'left-[calc(100%-22px)]' : 'left-0.5'
                    }`} />
                  </span>
                  <span className="text-sm text-[var(--text-secondary)] min-w-[40px]">
                    {theme === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Role Permissions</h3>
              <div className="flex flex-col gap-3">
                {user.role === 'editor' ? (
                  ['Create new diagrams', 'Edit diagram nodes and connections', 'Share diagrams with others', 'Delete owned diagrams'].map((perm) => (
                    <div key={perm} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                      <span className="flex items-center justify-center w-6 h-6 bg-emerald-500/15 text-emerald-500 rounded-full text-xs">✓</span>
                      {perm}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                      <span className="flex items-center justify-center w-6 h-6 bg-emerald-500/15 text-emerald-500 rounded-full text-xs">✓</span>
                      View shared diagrams
                    </div>
                    {['Cannot create or edit diagrams', 'Cannot share or delete diagrams'].map((perm) => (
                      <div key={perm} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                        <span className="flex items-center justify-center w-6 h-6 bg-red-500/15 text-red-500 rounded-full text-xs">✗</span>
                        {perm}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-500/30">
            <CardContent>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">Sign Out</h3>
              <p className="text-sm text-[var(--text-tertiary)] mb-4">
                Sign out of your account on this device.
              </p>
              <Button variant="danger" onClick={handleLogout}>
                <LogOut size={18} />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
