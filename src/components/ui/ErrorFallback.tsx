// src/components/ErrorFallback.tsx

import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <main className="error-fallback">
      <div className="error-content p-6 bg-red-100 rounded-md">
        <div className="flex items-center mb-4">
          <FaExclamationTriangle className="w-6 h-6 text-red-500 mr-2" />
          <h2 className="text-xl font-semibold">Something went wrong:</h2>
        </div>
        <div className="error-message mb-4">
          <p>{error.message}</p>
        </div>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-500 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    </main>
  );
};

export default ErrorFallback;
