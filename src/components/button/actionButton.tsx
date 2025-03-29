import React from 'react';

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  width?: string;
  height?: string;
  className?: string;
}

const ActionButton = ({
  children,
  onClick,
  width = 'w-96',
  height = 'h-16',
  className = '',
}: ActionButtonProps) => {
  return (
    <button
      type="submit"
      className={`bg-red-600 ${width} ${height} rounded-lg font-bold active:bg-red-700 lg:active:bg-red-600 lg:hover:bg-red-700 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default ActionButton;
