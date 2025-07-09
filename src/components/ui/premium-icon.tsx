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
    <div 
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-premium text-white font-bold ${className}`} 
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.6 }}>★</span>
    </div>
  );
};
export default PremiumIcon;