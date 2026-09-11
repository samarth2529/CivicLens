import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors';
  
  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
  };

  const variantClasses = {
    default: 'bg-[#f0f4f9] text-[#444746] border border-[#e3e8ee]',
    success: 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]',
    warning: 'bg-[#fef7e0] text-[#b06000] border border-[#feefc3]',
    danger: 'bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]',
    info: 'bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]',
    outline: 'bg-white text-[#5f6368] border border-[#dadce0]',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
