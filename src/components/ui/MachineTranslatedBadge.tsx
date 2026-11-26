import { Badge, Popover, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { memo } from 'react';
import { TAG_BADGE_STYLE } from '@/constants/styles';

const EXPLANATION =
  'Unofficial machine translation from the TW client. It will be replaced by official English when this releases globally.';

interface MachineTranslatedBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /**
   * Opens the explanation on click, tap or keyboard. Leave off inside links,
   * such as list cards, where a nested button is not allowed; those keep a
   * hover tooltip.
   */
  interactive?: boolean;
}

function MachineTranslatedBadge({
  size = 'sm',
  interactive = false,
}: MachineTranslatedBadgeProps) {
  if (interactive) {
    return <MachineTranslatedPopover size={size} />;
  }

  return (
    <Tooltip label={EXPLANATION} multiline maw={260} withArrow>
      <Badge variant="light" size={size} color="yellow" style={TAG_BADGE_STYLE}>
        Machine-translated
      </Badge>
    </Tooltip>
  );
}

function MachineTranslatedPopover({
  size,
}: Required<Pick<MachineTranslatedBadgeProps, 'size'>>) {
  const [opened, { toggle, close }] = useDisclosure(false);
  return (
    <Popover
      opened={opened}
      onDismiss={close}
      width={260}
      withArrow
      shadow="md"
      position="bottom"
    >
      <Popover.Target>
        <Badge
          component="button"
          type="button"
          variant="light"
          size={size}
          color="yellow"
          style={{ ...TAG_BADGE_STYLE, cursor: 'pointer' }}
          aria-expanded={opened}
          onClick={toggle}
          onKeyDown={(event) => {
            if (event.key === 'Escape') close();
          }}
        >
          Machine-translated
        </Badge>
      </Popover.Target>
      <Popover.Dropdown>
        <Text size="sm">{EXPLANATION}</Text>
      </Popover.Dropdown>
    </Popover>
  );
}

export default memo(MachineTranslatedBadge);
