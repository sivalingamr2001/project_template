import { useState } from 'react';
import { X } from 'lucide-react';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  title?: string;
  submitText?: string;
  isLoading?: boolean;
}

export function CommentModal({
  isOpen,
  onClose,
  onSubmit,
  title = 'Add Comment',
  submitText = 'Submit',
  isLoading = false,
}: CommentModalProps) {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(comment);
    setComment('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-background border border-border rounded-lg shadow-lg z-50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition"
          >
            <X size={18} />
          </button>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter your comment..."
          className="w-full p-3 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={4}
          disabled={isLoading}
        />

        <div className="flex gap-2 justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded hover:bg-secondary transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!comment.trim() || isLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : submitText}
          </button>
        </div>
      </div>
    </>
  );
}
