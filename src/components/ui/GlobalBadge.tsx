import { Badge } from '@mantine/core';
import { memo } from 'react';
import { TAG_BADGE_STYLE } from '@/constants/styles';

interface GlobalBadgeProps {
  isGlobal: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

function GlobalBadge({ isGlobal, size = 'sm' }: GlobalBadgeProps) {
  return (
    <Badge
      variant="light"
      size={size}
      style={TAG_BADGE_STYLE}
      color={isGlobal ? 'teal' : 'gray'}
    >
      {isGlobal ? 'Global' : 'TW / CN'}
    </Badge>
  );
}

export default memo(GlobalBadge);
