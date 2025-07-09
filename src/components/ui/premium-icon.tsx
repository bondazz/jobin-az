import React from 'react';
interface PremiumIconProps {
  className?: string;
  size?: number;
}
const PremiumIcon = ({
  className = '',
  size = 32
}: PremiumIconProps) => {
  return <div className={`relative inline-flex items-center justify-center ${className}`} style={{
    width: size,
    height: size
  }}>
      
    </div>;
};
export default PremiumIcon;