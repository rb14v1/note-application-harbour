import { useState } from 'react';
import { Note } from '../types';
import { useNotes } from '../hooks/useNotes';
import { NoteCard } from '../components/NoteCard';
import { NoteForm } from '../components/NoteForm';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';

export function Archive() {
  const { archivedNotes, loading, error, updateNote, deleteNote, archiveNote, unarchiveNote } =
    useNotes();

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = archivedNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdate = (title: string, content: string) => {
    if (!editingNote) return;
    updateNote(editingNote.id, title, content);
    setEditingNote(null);
  };

  const handleCardClick = (note: Note) => {
    setEditingNote(note);
  };

  return (
    <div className="min-h-screen bg-v1-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-v1-dark rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-v1-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-v1-dark">Archive</h1>
          </div>
          <p className="text-gray-500 text-sm ml-11">
            {archivedNotes.length} archived {archivedNotes.length === 1 ? 'note' : 'notes'}
          </p>
        </div>

        {/* Search */}
        {archivedNotes.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search archived notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white"
              />
            </div>
          </div>
        )}

        {/* Info Banner */}
        {archivedNotes.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-v1-teal mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-500">
              Click the <span className="font-medium text-v1-teal">restore icon</span> on any note to move it back to your active notes.
            </p>
          </div>
        )}

        {/* Notes Grid */}
        {loading ? (
          <p className="text-sm text-gray-500">Loading notes...</p>
        ) : archivedNotes.length === 0 ? (
          <EmptyState
            message="Archive is empty"
            subMessage="Notes you archive will appear here."
            icon={
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8" />
              </svg>
            }
          />
        ) : filteredNotes.length === 0 ? (
          <EmptyState
            message="No matching archived notes"
            subMessage={`No archived notes match "${searchQuery}"`}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => handleCardClick(note)}
                onDelete={deleteNote}
                onArchive={archiveNote}
                onUnarchive={unarchiveNote}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={editingNote !== null}
        onClose={() => setEditingNote(null)}
        title="Edit Archived Note"
      >
        {editingNote && (
          <NoteForm
            note={editingNote}
            onSave={handleUpdate}
            onCancel={() => setEditingNote(null)}
          />
        )}
      </Modal>
    </div>
  );
}