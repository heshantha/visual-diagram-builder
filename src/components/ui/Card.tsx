import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}
export const Card = ({ children, className = '', hoverable = false, onClick }: CardProps) => {
  return (
    <div
      className={`
        bg-[var(--bg-secondary)] border border-[var(--border-color)] 
        rounded-2xl overflow-hidden transition-all duration-300
        ${hoverable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-primary-500' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
  return <div className={`p-6 pb-0 ${className}`}>{children}</div>;
};

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export const CardContent = ({ children, className = '' }: CardContentProps) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter = ({ children, className = '' }: CardFooterProps) => {
  return <div className={`px-6 pb-6 flex items-center gap-4 ${className}`}>{children}</div>;
};
