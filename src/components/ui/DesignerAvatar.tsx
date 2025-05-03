import React from 'react';
import { useDesigners } from '../../contexts/DesignersContext';
import { getContrastTextColor } from '../../utils/colors';

type DesignerAvatarProps = {
  designerId: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
  onProfileClick?: () => void;
};

const DesignerAvatar: React.FC<DesignerAvatarProps> = ({
  designerId,
  size = 'md',
  showName = false,
  className = '',
  onProfileClick,
}) => {
  const { getDesignerById } = useDesigners();
  const designer = getDesignerById(designerId);
  
  if (!designer) return null;
  
  const getSize = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8 text-xs';
      case 'lg': return 'h-12 w-12 text-base';
      case 'md':
      default: return 'h-10 w-10 text-sm';
    }
  };
  
  const textColor = getContrastTextColor(designer.color);
  const initials = designer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  return (
    <div className={`flex items-center ${className}`}>
      <button
        onClick={onProfileClick}
        className={`rounded-full flex items-center justify-center font-semibold ${getSize()} ${
          onProfileClick ? 'cursor-pointer hover:opacity-90' : ''
        }`}
        style={
          designer.profilePicture
            ? { backgroundImage: `url(${designer.profilePicture})`, backgroundSize: 'cover' }
            : { backgroundColor: designer.color, color: textColor }
        }
      >
        {!designer.profilePicture && initials}
      </button>
      {showName && (
        <span className="ml-2 font-medium text-gray-800">{designer.name}</span>
      )}
    </div>
  );
};

export default DesignerAvatar;