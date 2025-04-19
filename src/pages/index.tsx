'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setIsLoggedIn(true);
    setName(payload.name || 'User');
    setRole(payload.role || '');
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 text-center space-y-6 bg-gray-50">
      <h1 className="text-4xl font-bold">📚 Welcome to Bookshelf</h1>
      <p className="text-gray-600 max-w-xl">
        Your personal space to save, track, and reflect on the books you've read. 
        Whether you're an avid reader or just starting your journey, Bookshelf helps you keep everything in one place.
      </p>

      {!isLoggedIn ? (
        <div className="flex gap-4 mt-4">
          <Link href="/login-register/register">
            <Button>Get Started</Button>
          </Link>
          <Link href="/login-register/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>
      ) : (
        <div className="flex gap-4 mt-4 items-center">
          <p className="text-lg">Welcome back, <strong>{name}</strong> 👋</p>
          <Link href="/book-shelf/mybook">
            <Button>Go to My Books</Button>
          </Link>
        </div>
      )}

      {/* ✅ คุณสมบัติของแอป */}
      <section className="mt-12 text-left max-w-2xl">
        <h2 className="text-2xl font-semibold mb-2">✅ คุณสมบัติของแอป</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          <li>บันทึกหนังสือที่คุณอ่าน</li>
          <li>ดูโปรไฟล์ผู้ใช้งานของคุณ</li>
          <li>แสดงความคืบหน้ารายสัปดาห์</li>
        </ul>
      </section>

      {/* 🖼 รูปภาพตัวอย่าง UI */}
      <section className="mt-12 text-left max-w-2xl">
        <h2 className="text-2xl font-semibold mb-2">🖼 รูปภาพตัวอย่าง UI</h2>
        <img
          src="/mockup-preview.png"
          alt="UI Mockup"
          className="w-full max-w-md border rounded shadow"
        />
      </section>

      {/* 📈 ความคืบหน้ารายสัปดาห์ */}
      {isLoggedIn && role === 'ADMIN' && (
        <section className="mt-12 text-left max-w-2xl">
          <h2 className="text-2xl font-semibold mb-2">📈 ความคืบหน้ารายสัปดาห์</h2>
          <p className="text-gray-600">ระบบจะวิเคราะห์จำนวนหนังสือที่คุณสร้างในแต่ละวันผ่านหน้า Dashboard และ Profile</p>
        </section>
      )}
    </div>
  );
}
