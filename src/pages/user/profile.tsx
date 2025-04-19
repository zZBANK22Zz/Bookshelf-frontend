'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

type UserProfile = {
  id: number;
  name: string;
  email: string;
  role: string;
  imageUrl?: string;
};

type Book = {
  id: number;
  createdAt: string;
};

type DayOfWeek = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bookCount, setBookCount] = useState<number>(0);
  const [progress, setProgress] = useState<Record<string, number>>({
    sun: 0, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0,
  });

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      router.push('/login-register/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:8000/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        toast.error(err.message);
      }
    };

    const fetchBooksAndProgress = async () => {
      try {
        const res = await fetch('http://localhost:8000/books', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: Book[] = await res.json();
        setBookCount(data.length);

        const progressMap = {
          sun: 0, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0,
        };

        data.forEach(book => {
          const date = new Date(book.createdAt);
          const day = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()] as DayOfWeek;
          progressMap[day]++;
        });

        setProgress(progressMap);
      } catch {
        setBookCount(0);
        setProgress({ sun: 0, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0 });
      }
    };

    fetchProfile();
    fetchBooksAndProgress();
  }, [router]);

  if (!profile) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-5xl w-full px-6 py-10 bg-white shadow rounded-lg flex flex-col sm:flex-row gap-8">
        {/* Left panel */}
        <div className="flex flex-col items-center w-full sm:w-1/3 border-r sm:pr-6">
          <img
            src={imagePreview || profile.imageUrl || 'https://via.placeholder.com/128'}
            alt="User profile"
            className="w-32 h-32 rounded-full object-cover mb-4"
          />
          <label htmlFor="profile-pic-upload" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded mb-2">
            Change Photo
            <input
              id="profile-pic-upload"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
              
                const previewUrl = URL.createObjectURL(file);
                setImagePreview(previewUrl);
              
                const token = localStorage.getItem('token');
                const formData = new FormData();
                formData.append('file', file);
              
                try {
                  const res = await fetch('http://localhost:8000/users/upload-profile-image', {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                  });
              
                  if (!res.ok) throw new Error('Upload failed');
                  toast.success('✅ Profile image uploaded!');
                } catch (err: any) {
                  toast.error(err.message);
                }
              }}
              className="hidden"
            />
          </label>
          <h2 className="text-lg font-bold">{profile.name}</h2>
          <p className="text-sm text-muted-foreground">{profile.role}</p>
        </div>

        {/* Right panel */}
        <div className="flex-1 space-y-4">
          <p><strong>Gmail:</strong> {profile.email}</p>
          <p><strong>How many books they have:</strong> {bookCount} books</p>

          <div>
            <h3 className="font-semibold mb-2">Progress</h3>
            <div className="grid grid-cols-7 gap-2 text-center">
              {Object.entries(progress).map(([day, count]) => (
                <div key={day} className="flex flex-col items-center space-y-1">
                  <span className="text-sm capitalize">{day}</span>
                  {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-blue-400 rounded-sm" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}