import React from 'react';
import './Button.css';

/**
 * Button - Styled button component with paper-like appearance
 */
export const Button = ({ 
  children, 
  variant = 'primary',  // 'primary' | 'secondary' | 'danger' | 'ghost'
  size = 'md',          // 'sm' | 'md' | 'lg'
  fullWidth = false,
  disabled = false,
  icon = null,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full-width',
    disabled && 'btn-disabled',
    icon && 'btn-with-icon',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-text">{children}</span>
    </button>
  );
};

export default Button;
