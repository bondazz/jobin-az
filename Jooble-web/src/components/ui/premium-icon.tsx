import React from 'react';
interface PremiumIconProps {
  className?: string;
  size?: number;
}
const PremiumIcon = ({
  className = '',
  size = 16
}: PremiumIconProps) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <path
          d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};
export default PremiumIcon;