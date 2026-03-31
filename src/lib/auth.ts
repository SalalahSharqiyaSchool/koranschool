// Simple auth system
interface User {
  role: 'admin' | 'teacher';
  username: string;
}

const USERS: Record<string, User> = {
  'admin': { role: 'admin', username: 'الإداري' },
  'teacher': { role: 'teacher', username: 'المعلم' },
};

export function login(username: string, password: string): User | null {
  if (USERS[username] && password === '123456') {
    localStorage.setItem('user', JSON.stringify(USERS[username]));
    return USERS[username];
  }
  return null;
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function logout() {
  localStorage.removeItem('user');
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function hasRole(role: 'admin' | 'teacher'): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}
