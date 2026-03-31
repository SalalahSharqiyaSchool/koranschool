"use client"

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Home } from 'lucide-react';
import { logout } from '@/lib/auth';

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen p-6 space-y-6 flex flex-col">
      <div className="flex items-center space-x-3 space-x-reverse">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">ق</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">نظام المدرسة</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">إدارة الطلاب والحضور</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <Button variant="ghost" className="w-full justify-start h-12 px-4" onClick={() => router.push('/admin')}>
          <Home className="mr-3 h-5 w-5" />
          الرئيسية
        </Button>
      </nav>

      <Button 
        variant="outline" 
        className="w-full h-12 px-4" 
        onClick={handleLogout}
      >
        <LogOut className="mr-3 h-5 w-5" />
        خروج
      </Button>
    </div>
  );
}
