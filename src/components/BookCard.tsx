import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

type Book = {
  id: number;
  title: string;
  author: string;
  review?: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    role: string;
  };
};

type Props = {
  book: Book;
  currentUserId: number;
  onEdit: (book: Book) => void;
  onDelete: (bookId: number) => void;
};

export default function BookCard({
  book,
  currentUserId,
  onEdit,
  onDelete,
}: Props) {
  const isOwner = book.user.id === currentUserId;

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <h2 className="text-xl font-semibold">{book.title}</h2>
        <p className="text-sm text-muted-foreground">by {book.author}</p>
        {book.review && <p>“{book.review}”</p>}

        <div className="text-xs text-gray-500">
          Owner: {book.user.name} ({book.user.role})
        </div>
        <div className="text-xs text-gray-400">
          Added: {new Date(book.createdAt).toLocaleString()}
        </div>

        {isOwner && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => onEdit(book)}>
              ✏️ Edit
            </Button>
            <ConfirmDeleteDialog
              onConfirm={() => onDelete(book.id)}
              trigger={
                <Button variant="destructive" size="sm">
                  🗑️ Delete
                </Button>
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
