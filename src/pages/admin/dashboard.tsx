'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

type User = { id: number; name: string };
type Book = { id: number; createdAt: string };

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [chartData, setChartData] = useState<{ date: string; count: number }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      router.push('/login-register/login');
      return;
    }

    const getPayload = () => {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch {
        return null;
      }
    };

    const user = getPayload();
    if (user?.role !== 'ADMIN') {
      toast.error('Access denied');
      router.push('/');
      return;
    }

    const fetchUsers = async () => {
      const res = await fetch('http://localhost:8000/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('Expected array but got:', data);
        toast.error('Invalid user data from server');
        setUsers([]);
      }
    };

    const fetchBooks = async () => {
      const res = await fetch('http://localhost:8000/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: Book[] = await res.json();
      setBooks(data);

      const grouped: Record<string, number> = {};
      data.forEach((b) => {
        const date = new Date(b.createdAt).toLocaleDateString();
        grouped[date] = (grouped[date] || 0) + 1;
      });

      const chart = Object.entries(grouped).map(([date, count]) => ({ date, count }));
      setChartData(chart);
    };

    fetchUsers();
    fetchBooks();
  }, [router]);

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">📊 Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">👥 Total Users</h2>
            <p className="text-3xl mt-2">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">📚 Total Books</h2>
            <p className="text-3xl mt-2">{books.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h3 className="text-lg font-bold mb-4">Books Created Per Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white rounded shadow p-6 mt-10">
        <h3 className="text-lg font-bold mb-4">All Users</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b">ID</th>
                <th className="px-4 py-2 border-b">Name</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{user.id}</td>
                  <td className="px-4 py-2 border-b">{user.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}