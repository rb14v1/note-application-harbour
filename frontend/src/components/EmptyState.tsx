import { EmptyStateProps } from '../types';

export function EmptyState({ message, subMessage, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="text-gray-300 mb-4">
        {icon ?? (
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>
      <p className="text-gray-500 font-medium text-base">{message}</p>
      {subMessage && <p className="text-gray-400 text-sm mt-1">{subMessage}</p>}
    </div>
  );
}