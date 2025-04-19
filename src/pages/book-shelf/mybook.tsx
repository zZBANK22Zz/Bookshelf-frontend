"use client";

import { SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AddOrEditBookModal from "@/components/AddOrEditBookModal";
import BookCard from "@/components/BookCard";

type Book = {
  id: number;
  title: string;
  author: string;
  review?: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

export default function MyBookPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      router.push("/login-register/login");
      return;
    }

    const decodeToken = () => {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.userId;
      } catch {
        return null;
      }
    };

    const userId = decodeToken();
    if (!userId) {
      toast.error("Invalid token");
      router.push("/login-register/login");
      return;
    }

    setCurrentUserId(userId);

    fetch("http://localhost:8000/books", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch books");
        }
        const data = await res.json();
        setBooks(data);
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredBooks(
      books.filter(
        (b) =>
          b.title.toLowerCase().includes(lower) ||
          b.author.toLowerCase().includes(lower)
      )
    );
  }, [search, books]);

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8000/books/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Book deleted");
      router.reload();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading)
    return <p className="text-center mt-10">Loading your books...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📚 My Bookshelf</h1>
        <Button onClick={() => setShowAddModal(true)}>➕ Add Book</Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          type="text"
          placeholder="Search title or author..."
          className="border p-2 rounded w-full sm:w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          onClick={() => {
            const lower = search.toLowerCase();
            setFilteredBooks(
              books.filter(
                (b) =>
                  b.title.toLowerCase().includes(lower) ||
                  b.author.toLowerCase().includes(lower)
              )
            );
          }}
        >
          Search
        </Button>
      </div>

      {(search ? filteredBooks : books).length === 0 ? (
        <p>No books found.</p>
      ) : (
        (search ? filteredBooks : books).map((book) => (
          <BookCard
            key={book.id}
            book={book}
            currentUserId={currentUserId ?? 0}
            onEdit={(book) => setEditBook(book as SetStateAction<Book | null>)}
            onDelete={handleDelete}
          />
        ))
      )}

      <AddOrEditBookModal
        mode="add"
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={async (bookData) => {
          const token = localStorage.getItem("token");
          if (!token) return;

          try {
            const res = await fetch("http://localhost:8000/books", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(bookData),
            });

            if (!res.ok) throw new Error("Failed to add book");

            toast.success("Book added!");
            router.reload();
          } catch (err: any) {
            toast.error(err.message);
          }
        }}
      />

      <AddOrEditBookModal
        mode="edit"
        open={!!editBook}
        initialData={editBook ?? undefined}
        onClose={() => setEditBook(null)}
        onSubmit={async (formData) => {
          const token = localStorage.getItem("token");
          if (!token || !editBook) return;

          try {
            const res = await fetch(
              `http://localhost:8000/books/${editBook.id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  title: formData.title,
                  author: formData.author,
                  review: formData.review,
                }),
              }
            );

            if (!res.ok) throw new Error("Failed to update");

            toast.success("Book updated");
            router.reload();
          } catch (err: any) {
            toast.error(err.message);
          } finally {
            setEditBook(null);
          }
        }}
      />
    </div>
  );
}
