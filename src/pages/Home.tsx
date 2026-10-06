import { useState } from 'react';
import { Note } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { NoteCard } from '../components/NoteCard';
import { NoteForm } from '../components/NoteForm';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';

export function Home() {
  const { activeNotes, addNote, updateNote, deleteNote, archiveNote, unarchiveNote } =
    useLocalStorage();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = activeNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = (title: string, content: string) => {
    addNote(title, content);
    setIsAddModalOpen(false);
  };

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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-v1-dark">My Notes</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {activeNotes.length} {activeNotes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
            className="sm:w-auto w-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Note
          </Button>
        </div>

        {/* Search */}
        {activeNotes.length > 0 && (
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
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white"
              />
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {activeNotes.length === 0 ? (
          <EmptyState
            message="No notes yet"
            subMessage="Click 'New Note' to create your first note."
            icon={
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            }
          />
        ) : filteredNotes.length === 0 ? (
          <EmptyState
            message="No matching notes"
            subMessage={`No notes match "${searchQuery}"`}
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

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="New Note"
      >
        <NoteForm
          onSave={handleAdd}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editingNote !== null}
        onClose={() => setEditingNote(null)}
        title="Edit Note"
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