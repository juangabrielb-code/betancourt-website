'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Container } from '@/components/ui/UI';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminPage() {
  const { session, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-j-light-bg dark:bg-j-dark-bg">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-12 w-12 text-warm-glow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-j-light-text dark:text-j-dark-text text-sm">
            {t.common?.loading || 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-j-light-bg dark:bg-j-dark-bg pt-24 pb-12">
      <Container>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-j-light-text dark:text-j-dark-text mb-2">
              {t.admin?.title || 'Admin Panel'}
            </h1>
            <p className="text-j-light-text/60 dark:text-j-dark-text/60">
              {t.admin?.subtitle || 'Manage your application and users'}
            </p>
          </div>

          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-j-light-text/10 dark:border-white/10 p-6">
              <div className="text-warm-glow text-3xl mb-2">👥</div>
              <p className="text-2xl font-bold text-j-light-text dark:text-j-dark-text">0</p>
              <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/60">
                {t.admin?.totalUsers || 'Total Users'}
              </p>
            </div>

            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-j-light-text/10 dark:border-white/10 p-6">
              <div className="text-warm-glow text-3xl mb-2">📁</div>
              <p className="text-2xl font-bold text-j-light-text dark:text-j-dark-text">0</p>
              <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/60">
                {t.admin?.totalProjects || 'Total Projects'}
              </p>
            </div>

            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-j-light-text/10 dark:border-white/10 p-6">
              <div className="text-warm-glow text-3xl mb-2">🔐</div>
              <p className="text-2xl font-bold text-j-light-text dark:text-j-dark-text">0</p>
              <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/60">
                {t.admin?.activeSessions || 'Active Sessions'}
              </p>
            </div>

            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-j-light-text/10 dark:border-white/10 p-6">
              <div className="text-warm-glow text-3xl mb-2">⚡</div>
              <p className="text-2xl font-bold text-j-light-text dark:text-j-dark-text">100%</p>
              <p className="text-sm text-j-light-text/60 dark:text-j-dark-text/60">
                {t.admin?.uptime || 'System Uptime'}
              </p>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-j-light-text/10 dark:border-white/10 p-6 mb-6">
            <h2 className="text-xl font-semibold text-j-light-text dark:text-j-dark-text mb-4">
              {t.admin?.management || 'Management'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="p-4 rounded-xl bg-warm-glow/10 hover:bg-warm-glow/20 border border-warm-glow/20 transition-colors text-left">
                <div className="text-warm-glow text-2xl mb-2">👤</div>
                <h3 className="font-semibold text-j-light-text dark:text-j-dark-text mb-1">
                  {t.admin?.userManagement || 'User Management'}
                </h3>
                <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60">
                  {t.admin?.manageUsers || 'View and manage all users'}
                </p>
              </button>

              <button className="p-4 rounded-xl bg-warm-glow/10 hover:bg-warm-glow/20 border border-warm-glow/20 transition-colors text-left">
                <div className="text-warm-glow text-2xl mb-2">🔑</div>
                <h3 className="font-semibold text-j-light-text dark:text-j-dark-text mb-1">
                  {t.admin?.roleManagement || 'Role Management'}
                </h3>
                <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60">
                  {t.admin?.manageRoles || 'Manage user roles and permissions'}
                </p>
              </button>

              <button className="p-4 rounded-xl bg-warm-glow/10 hover:bg-warm-glow/20 border border-warm-glow/20 transition-colors text-left">
                <div className="text-warm-glow text-2xl mb-2">🔧</div>
                <h3 className="font-semibold text-j-light-text dark:text-j-dark-text mb-1">
                  {t.admin?.systemSettings || 'System Settings'}
                </h3>
                <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60">
                  {t.admin?.configureSystem || 'Configure system settings'}
                </p>
              </button>

              <button className="p-4 rounded-xl bg-warm-glow/10 hover:bg-warm-glow/20 border border-warm-glow/20 transition-colors text-left">
                <div className="text-warm-glow text-2xl mb-2">📧</div>
                <h3 className="font-semibold text-j-light-text dark:text-j-dark-text mb-1">
                  {t.admin?.emailTemplates || 'Email Templates'}
                </h3>
                <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60">
                  {t.admin?.manageEmails || 'Manage email templates'}
                </p>
              </button>

              <button className="p-4 rounded-xl bg-warm-glow/10 hover:bg-warm-glow/20 border border-warm-glow/20 transition-colors text-left">
                <div className="text-warm-glow text-2xl mb-2">📊</div>
                <h3 className="font-semibold text-j-light-text dark:text-j-dark-text mb-1">
                  {t.admin?.reports || 'Reports'}
                </h3>
                <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60">
                  {t.admin?.viewReports || 'View system reports and logs'}
                </p>
              </button>

              <button className="p-4 rounded-xl bg-warm-glow/10 hover:bg-warm-glow/20 border border-warm-glow/20 transition-colors text-left">
                <div className="text-warm-glow text-2xl mb-2">🔒</div>
                <h3 className="font-semibold text-j-light-text dark:text-j-dark-text mb-1">
                  {t.admin?.security || 'Security'}
                </h3>
                <p className="text-xs text-j-light-text/60 dark:text-j-dark-text/60">
                  {t.admin?.securitySettings || 'Security and audit logs'}
                </p>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-j-light-text/10 dark:border-white/10 p-6">
            <h2 className="text-xl font-semibold text-j-light-text dark:text-j-dark-text mb-4">
              {t.admin?.recentActivity || 'Recent Activity'}
            </h2>
            <div className="text-center py-8 text-j-light-text/60 dark:text-j-dark-text/60">
              {t.admin?.noActivity || 'No recent activity to display'}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
