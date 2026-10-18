import { Note } from './types';

// Vite bakes VITE_API_URL into the bundle at build time. The fallback is for running the frontend locally
// beside the backend, which listens on port 8080.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/+$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    let message = `The server answered ${response.status}.`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // The body was not JSON; keep the status message.
    }
    throw new Error(message);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

export const notesApi = {
  list: () => request<Note[]>('/notes'),
  create: (title: string, content: string) =>
    request<Note>('/notes', { method: 'POST', body: JSON.stringify({ title, content }) }),
  update: (id: string, title: string, content: string) =>
    request<Note>(`/notes/${id}`, { method: 'PUT', body: JSON.stringify({ title, content }) }),
  remove: (id: string) => request<void>(`/notes/${id}`, { method: 'DELETE' }),
  archive: (id: string) => request<Note>(`/notes/${id}/archive`, { method: 'POST' }),
  unarchive: (id: string) => request<Note>(`/notes/${id}/unarchive`, { method: 'POST' }),
};
