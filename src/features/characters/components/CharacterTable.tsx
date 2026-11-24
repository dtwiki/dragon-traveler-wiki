import { Group, ScrollArea, Table, Text, UnstyledButton } from '@mantine/core';
import { Link } from 'react-router';
import { CURSOR_POINTER_STYLE, getMinWidthStyle } from '@/constants/styles';
import type { Character } from '@/features/characters/types';
import {
  getCharacterIdentityKey,
  getCharacterRoutePath,
} from '@/features/characters/utils/character-route';
import ClassTag from '@/components/ui/ClassTag';
import FactionTag from '@/components/ui/FactionTag';
import GlobalBadge from '@/components/ui/GlobalBadge';
import MachineTranslatedBadge from '@/components/ui/MachineTranslatedBadge';
import QualityIcon from '@/components/ui/QualityIcon';
import SortableTh from '@/components/ui/SortableTh';
import TierBadge from '@/components/ui/TierBadge';
import CharacterPortrait from './CharacterPortrait';

interface CharacterTableProps {
  pageItems: Character[];
  sortCol: string | null;
  sortDir: 'asc' | 'desc';
  handleSort: (key: string) => void;
  selectedTierListName: string | null;
  getTierLabel: (char: Character) => string | undefined;
  newCharacterKeys?: Set<string>;
  updatedCharacterKeys?: Set<string>;
}

export default function CharacterTable({
  pageItems,
  sortCol,
  sortDir,
  handleSort,
  selectedTierListName,
  getTierLabel,
  newCharacterKeys,
  updatedCharacterKeys,
}: CharacterTableProps) {
  return (
    <ScrollArea type="auto" scrollbarSize={6} offsetScrollbars>
      <Table striped highlightOnHover style={getMinWidthStyle(560)}>
        <Table.Thead>
          <Table.Tr>
            <SortableTh
              sortKey="name"
              sortCol={sortCol}
              sortDir={sortDir}
              onSort={handleSort}
            >
              Name
            </SortableTh>
            <SortableTh
              sortKey="quality"
              sortCol={sortCol}
              sortDir={sortDir}
              onSort={handleSort}
            >
              Quality
            </SortableTh>
            <Table.Th>Class</Table.Th>
            <SortableTh
              sortKey="factions"
              sortCol={sortCol}
              sortDir={sortDir}
              onSort={handleSort}
            >
              Factions
            </SortableTh>
            <SortableTh
              sortKey="global"
              sortCol={sortCol}
              sortDir={sortDir}
              onSort={handleSort}
            >
              Global
            </SortableTh>
            {selectedTierListName && (
              <SortableTh
                sortKey="tier"
                sortCol={sortCol}
                sortDir={sortDir}
                onSort={handleSort}
              >
                Tier
              </SortableTh>
            )}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {pageItems.map((char) => (
            <Table.Tr
              key={getCharacterIdentityKey(char)}
              style={CURSOR_POINTER_STYLE}
            >
              <Table.Td>
                <UnstyledButton
                  component={Link}
                  to={getCharacterRoutePath(char)}
                >
                  <Group gap="sm" wrap="nowrap">
                    <CharacterPortrait
                      name={char.name}
                      size={40}
                      quality={char.quality}
                      borderWidth={3}
                      routePath={getCharacterRoutePath(char)}
                      style={{ flexShrink: 0 }}
                      isNew={newCharacterKeys?.has(
                        getCharacterIdentityKey(char),
                      )}
                      isUpdated={updatedCharacterKeys?.has(
                        getCharacterIdentityKey(char),
                      )}
                    />
                    <Text size="sm" fw={500} className="dt-link-text">
                      {char.name}
                    </Text>
                  </Group>
                </UnstyledButton>
              </Table.Td>
              <Table.Td>
                <QualityIcon quality={char.quality} />
              </Table.Td>
              <Table.Td>
                <ClassTag characterClass={char.character_class} />
              </Table.Td>
              <Table.Td className="table-badge-cell">
                <Group gap={4} wrap="wrap" className="table-badge-list">
                  {char.factions.map((faction) => (
                    <FactionTag key={faction} faction={faction} size="xs" />
                  ))}
                </Group>
              </Table.Td>
              <Table.Td>
                <Group gap={4} wrap="wrap">
                  <GlobalBadge isGlobal={char.is_global} size="sm" />
                  {char.machine_translated && (
                    <MachineTranslatedBadge size="sm" />
                  )}
                </Group>
              </Table.Td>
              {selectedTierListName && (
                <Table.Td>
                  {(() => {
                    const tier = getTierLabel(char);
                    return tier ? <TierBadge tier={tier} size="sm" /> : null;
                  })()}
                </Table.Td>
              )}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
