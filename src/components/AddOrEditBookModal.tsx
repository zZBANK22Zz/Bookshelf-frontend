'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type BookData = {
  title: string;
  author: string;
  review?: string;
};

type Props = {
  mode: 'add' | 'edit';
  initialData?: BookData;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BookData) => void;
};

export default function AddOrEditBookModal({
  mode,
  initialData,
  open,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<BookData>({
    title: '',
    author: '',
    review: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ title: '', author: '', review: '' });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author) {
      toast.error('Please fill in title and author');
      return;
    }
    onSubmit(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{mode === 'add' ? 'Add Book' : 'Edit Book'}</DialogTitle>
          </DialogHeader>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input name="title" value={form.title} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="author">Author</Label>
            <Input name="author" value={form.author} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="review">Review</Label>
            <Input name="review" value={form.review} onChange={handleChange} />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">{mode === 'add' ? 'Add' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}