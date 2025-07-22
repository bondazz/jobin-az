import { LucideProps } from 'lucide-react';
import * as Icons from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
  fallback?: React.ComponentType<LucideProps>;
}

export const DynamicIcon = ({ name, fallback: Fallback = Icons.Tag, ...props }: DynamicIconProps) => {
  // Convert icon name to PascalCase for Lucide icon names
  const IconName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  // Get the icon component from Lucide
  const IconComponent = (Icons as any)[IconName] || (Icons as any)[name] || Fallback;

  return <IconComponent {...props} />;
};