export interface Note {
  id: string;
  title: string;
  content: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
}

export interface NoteFormProps {
  note?: Note;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface EmptyStateProps {
  message: string;
  subMessage?: string;
  icon?: React.ReactNode;
}