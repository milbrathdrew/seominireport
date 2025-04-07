import React from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose
}) => {
  const typeStyles: Record<AlertType, { bg: string; icon: React.ReactNode }> = {
    success: {
      bg: 'bg-green-50 border-green-500 text-green-800',
      icon: (
        <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      )
    },
    error: {
      bg: 'bg-red-50 border-red-500 text-red-800',
      icon: (
        <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      )
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-500 text-yellow-800',
      icon: (
        <svg className="h-5 w-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      )
    },
    info: {
      bg: 'bg-blue-50 border-blue-500 text-blue-800',
      icon: (
        <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    }
  };

  const { bg, icon } = typeStyles[type];

  return (
    <div className={`${bg} border-l-4 p-4 rounded-md animate-fade-in`} role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div className="ml-3 w-full">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          <div className="text-sm mt-1">{message}</div>
        </div>
        {onClose && (
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-opacity-10 hover:bg-black"
            onClick={onClose}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert; 