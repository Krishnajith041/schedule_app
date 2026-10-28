import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'icon';

interface Button3DProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

export function Button3D({
  variant = 'primary',
  children,
  className = '',
  ...rest
}: Button3DProps) {
  return (
    <button
      className={`btn-3d btn-${variant} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
