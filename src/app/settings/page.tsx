'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { KannyLogo } from '@/components/ui/logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-neutral-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Go to Home" className="flex items-center gap-3">
              <KannyLogo size="md" />
              <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Profile Section */}
            <Card className="bg-white border border-neutral-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-neutral-900">Profile Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-neutral-200">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="w-16 h-16 rounded-full object-cover border-2 border-neutral-200"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center border-2 border-neutral-200">
                      <span className="text-2xl font-semibold text-primary-600">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">{user?.name || 'User'}</h3>
                    <p className="text-sm text-neutral-600">{user?.email || ''}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Name
                    </label>
                    <Input
                      type="text"
                      value={user?.name || ''}
                      disabled
                      className="bg-neutral-50 border-neutral-200 text-neutral-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <Input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-neutral-50 border-neutral-200 text-neutral-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="bg-white border border-neutral-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-100 rounded-lg">
                    <Shield className="h-5 w-5 text-neutral-700" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-neutral-900">Account Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-neutral-600">
                  Manage your account settings and preferences.
                </p>
                <div className="pt-4 border-t border-neutral-200">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    disabled
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-white border border-neutral-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-neutral-900">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-error-50 border border-error-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-neutral-900 mb-1">Sign Out</h4>
                    <p className="text-sm text-neutral-600">Sign out of your account</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="border-error-400 text-error-400 hover:bg-error-50 hover:text-error-500"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full bg-white border-t border-neutral-200 px-4 md:px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-sm text-neutral-600 gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Link href="/" aria-label="Go to Home" className="flex items-center gap-2">
              <KannyLogo size="sm" />
              <span>Kanny © 2025</span>
            </Link>
          </div>
          <span>Designed by 17/32</span>
        </div>
      </div>
    </div>
  );
}
