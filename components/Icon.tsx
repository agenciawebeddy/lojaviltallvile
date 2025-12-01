import React from 'react';

interface IconProps {
  children: React.ReactNode;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ children, className }) => {
  return (
    <div className={`w-6 h-6 ${className}`}>
      {children}
    </div>
  );
};

export default Icon;
