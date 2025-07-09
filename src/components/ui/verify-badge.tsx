import React from 'react';

interface VerifyBadgeProps {
  className?: string;
  size?: number;
}

const VerifyBadge = ({ className = '', size = 16 }: VerifyBadgeProps) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 22 22" 
      className={`inline-block ${className}`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="verify-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1DA1F2" />
          <stop offset="100%" stopColor="#0084b4" />
        </linearGradient>
        <linearGradient id="verify-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A90E2" />
          <stop offset="100%" stopColor="#357ABD" />
        </linearGradient>
      </defs>
      <g clipRule="evenodd" fillRule="evenodd">
        <path 
          d="M13.324 3.848L11 1.6 8.676 3.848l-3.201-.453-.559 3.184L2.06 8.095 3.48 11l-1.42 2.904 2.856 1.516.559 3.184 3.201-.452L11 20.4l2.324-2.248 3.201.452.559-3.184 2.856-1.516L18.52 11l1.42-2.905-2.856-1.516-.559-3.184zm-7.09 7.575l3.428 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" 
          fill="url(#verify-gradient-1)"
        />
        <path 
          d="M13.101 4.533L11 2.5 8.899 4.533l-2.895-.41-.505 2.88-2.583 1.37L4.2 11l-1.284 2.627 2.583 1.37.505 2.88 2.895-.41L11 19.5l2.101-2.033 2.895.41.505-2.88 2.583-1.37L17.8 11l1.284-2.627-2.583-1.37-.505-2.88zm-6.868 6.89l3.429 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" 
          fill="url(#verify-gradient-2)"
        />
        <path 
          d="M6.233 11.423l3.429 3.428 5.65-6.17.038-.033-.005 1.398-5.683 6.206-3.429-3.429-.003-1.405.005.003z" 
          fill="#0084b4"
        />
      </g>
    </svg>
  );
};

export default VerifyBadge;