import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <div className={`
          relative flex items-center bg-[var(--bg-secondary)] 
          border-2 rounded-xl transition-all duration-200
          ${error 
            ? 'border-red-500 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/15' 
            : 'border-[var(--border-color)] focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/15'
          }
        `}>
          {icon && (
            <span className="flex items-center justify-center pl-4 text-[var(--text-tertiary)]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              flex-1 py-3.5 px-4 bg-transparent text-[var(--text-primary)]
              border-none outline-none placeholder:text-[var(--text-tertiary)]
              ${icon ? 'pl-2' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <span className="text-sm font-medium text-red-500">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
