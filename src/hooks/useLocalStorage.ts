import { useState, useEffect } from 'react';
import { Note } from '../types';

const NOTES_KEY = 'v1-notes';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useLocalStorage() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const stored = localStorage.getItem(NOTES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  const addNote = (title: string, content: string): void => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: generateId(),
      title,
      content,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const updateNote = (id: string, title: string, content: string): void => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, title, content, updatedAt: new Date().toISOString() }
          : note
      )
    );
  };

  const deleteNote = (id: string): void => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const archiveNote = (id: string): void => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, archived: true, updatedAt: new Date().toISOString() }
          : note
      )
    );
  };

  const unarchiveNote = (id: string): void => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, archived: false, updatedAt: new Date().toISOString() }
          : note
      )
    );
  };

  const activeNotes = notes.filter((n) => !n.archived);
  const archivedNotes = notes.filter((n) => n.archived);

  return {
    notes,
    activeNotes,
    archivedNotes,
    addNote,
    updateNote,
    deleteNote,
    archiveNote,
    unarchiveNote,
  };
}