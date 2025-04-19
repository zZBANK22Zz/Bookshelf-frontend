'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
  
      if (storedToken) {
        try {
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          setRole(payload.role);
        } catch {
          setRole(null);
        }
      } else {
        setRole(null);
      }
    };
  
    checkAuth();
  
    router.events.on('routeChangeComplete', checkAuth);
    return () => {
      router.events.off('routeChangeComplete', checkAuth);
    };
  }, [router.events]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setRole(null);
    router.push('/login-register/login');
  };

  return (
    <nav className="bg-white border-b shadow px-6 py-4 flex items-center justify-between">
      <div className="font-bold text-lg">
        <Link href="/">📚 Bookshelf</Link>
      </div>
      <div className="flex gap-4 items-center text-sm">
        {token && (
          <>
            <Link href="/book-shelf/mybook">My Books</Link>
            <Link href="/user/profile">Profile</Link>
            {role === 'ADMIN' && <Link href="/admin/dashboard">Dashboard</Link>}
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </>
        )}
        {!token && (
          <>
            <Link href="/login-register/login">Login</Link>
            <Link href="/login-register/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}