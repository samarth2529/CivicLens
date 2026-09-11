import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass' | 'highlight' | 'danger' | 'success' | 'warning';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-white border border-[#e3e8ee] shadow-sm text-[#1f1f1f]',
    elevated: 'bg-white border border-[#e3e8ee] shadow-gemini-card text-[#1f1f1f]',
    glass: 'bg-white/80 backdrop-blur-md border border-[#e3e8ee] shadow-sm text-[#1f1f1f]',
    highlight: 'bg-gradient-to-b from-[#f0f7ff] to-white border border-blue-200 shadow-sm text-[#1f1f1f]',
    danger: 'bg-gradient-to-b from-[#fff5f5] to-white border border-rose-200 text-[#991b1b]',
    success: 'bg-gradient-to-b from-[#f0fdf4] to-white border border-emerald-200 text-[#166534]',
    warning: 'bg-gradient-to-b from-[#fffbeb] to-white border border-amber-200 text-[#92400e]',
  };

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-md' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
