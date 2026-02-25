import React from 'react';
import './PaperContainer.css';

/**
 * PaperContainer - Wrapper component with analog paper texture
 * Used throughout the app for that authentic 1980s paper feel
 */
export const PaperContainer = ({ 
  children, 
  variant = 'cream',  // 'cream' | 'aged' | 'graph' | 'lined'
  className = '',
  padding = 'md',     // 'none' | 'sm' | 'md' | 'lg'
  ...props 
}) => {
  const paddingClass = padding !== 'none' ? `paper-padding-${padding}` : '';
  
  return (
    <div 
      className={`paper-container paper-${variant} ${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default PaperContainer;
