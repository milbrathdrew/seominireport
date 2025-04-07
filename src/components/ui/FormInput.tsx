import React, { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: FieldError;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({
  label,
  name,
  error,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
          error
            ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
        }`}
        aria-invalid={error ? 'true' : 'false'}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>
          {error.message}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput; 