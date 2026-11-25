import { Badge, Tooltip } from '@mantine/core';
import { memo } from 'react';
import { TAG_BADGE_STYLE } from '@/constants/styles';

interface MachineTranslatedBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

function MachineTranslatedBadge({ size = 'sm' }: MachineTranslatedBadgeProps) {
  return (
    <Tooltip
      label="Unofficial machine translation from the TW client. It will be replaced by official English when this releases globally."
      multiline
      maw={260}
      withArrow
    >
      <Badge variant="light" size={size} style={TAG_BADGE_STYLE} color="yellow">
        Machine-translated
      </Badge>
    </Tooltip>
  );
}

export default memo(MachineTranslatedBadge);
