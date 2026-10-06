import { ButtonProps } from '../types';

const variantClasses: Record<string, string> = {
  primary: 'bg-v1-teal text-white hover:bg-teal-500 focus:ring-teal-400',
  secondary: 'bg-v1-dark text-white hover:bg-slate-700 focus:ring-slate-400',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
  ghost: 'bg-transparent text-v1-dark border border-v1-dark hover:bg-gray-100 focus:ring-gray-300',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}