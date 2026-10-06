import { NoteCardProps } from '../types';
import { Card } from './Card';
import { Button } from './Button';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function NoteCard({ note, onClick, onDelete, onArchive, onUnarchive }: NoteCardProps) {
  return (
    <Card className="flex flex-col gap-2 group" onClick={onClick}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-v1-dark text-sm md:text-base leading-snug line-clamp-1 flex-1">
          {note.title}
        </h3>
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {note.archived ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUnarchive(note.id)}
              className="!border-0 !px-1.5 !py-1"
            >
              <svg className="w-4 h-4 text-v1-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchive(note.id)}
              className="!border-0 !px-1.5 !py-1"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8" />
              </svg>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(note.id)}
            className="!border-0 !px-1.5 !py-1"
          >
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>
      {note.content && (
        <p className="text-gray-500 text-xs md:text-sm line-clamp-2 leading-relaxed">
          {note.content}
        </p>
      )}
      <p className="text-gray-400 text-xs mt-auto pt-1">
        {formatDate(note.updatedAt)}
      </p>
    </Card>
  );
}