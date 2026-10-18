import { useCallback, useEffect, useState } from 'react';
import { Note } from '../types';
import { notesApi } from '../api';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (action: () => Promise<void>) => {
    try {
      setError(null);
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }, []);

  useEffect(() => {
    run(async () => setNotes(await notesApi.list())).finally(() => setLoading(false));
  }, [run]);

  const replace = (saved: Note) => setNotes((prev) => prev.map((note) => (note.id === saved.id ? saved : note)));

  const addNote = (title: string, content: string): void => {
    run(async () => {
      const created = await notesApi.create(title, content);
      setNotes((prev) => [created, ...prev]);
    });
  };

  const updateNote = (id: string, title: string, content: string): void => {
    run(async () => replace(await notesApi.update(id, title, content)));
  };

  const deleteNote = (id: string): void => {
    run(async () => {
      await notesApi.remove(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
    });
  };

  const archiveNote = (id: string): void => {
    run(async () => replace(await notesApi.archive(id)));
  };

  const unarchiveNote = (id: string): void => {
    run(async () => replace(await notesApi.unarchive(id)));
  };

  const activeNotes = notes.filter((n) => !n.archived);
  const archivedNotes = notes.filter((n) => n.archived);

  return {
    notes,
    activeNotes,
    archivedNotes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    archiveNote,
    unarchiveNote,
  };
}
