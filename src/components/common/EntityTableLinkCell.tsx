import { Group, Table, Text } from '@mantine/core';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

interface EntityTableLinkCellProps {
  to: string;
  children: ReactNode;
  fontWeight?: number;
  /** Rendered after the link, outside it (e.g. a status badge). */
  accessory?: ReactNode;
}

/** Consistent, keyboard-accessible primary link for entity table rows. */
export default function EntityTableLinkCell({
  to,
  children,
  fontWeight = 600,
  accessory,
}: EntityTableLinkCellProps) {
  const link = (
    <Text
      component={Link}
      to={to}
      size="sm"
      fw={fontWeight}
      className="dt-link-text"
      style={{ textDecoration: 'none' }}
    >
      {children}
    </Text>
  );

  return (
    <Table.Td>
      {accessory ? (
        <Group gap="xs" wrap="nowrap">
          {link}
          {accessory}
        </Group>
      ) : (
        link
      )}
    </Table.Td>
  );
}
