import RegionBadges from '@/components/ui/RegionBadges';
import {
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { Link } from 'react-router';
import CharacterPortrait from '@/features/characters/components/CharacterPortrait';
import ClassTag from '@/components/ui/ClassTag';
import FactionTag from '@/components/ui/FactionTag';
import QualityIcon from '@/components/ui/QualityIcon';
import { InteractiveSurface } from '@/components/ui/Surface';
import { LINK_BLOCK_RESET_STYLE } from '@/constants/styles';
import { CHARACTER_CARD, PAGE_WIDTH, CARD_GRID_COLS } from '@/constants/ui';
import type { Character } from '@/features/characters/types';
import {
  getCharacterIdentityKey,
  getCharacterRoutePath,
} from '@/features/characters/utils/character-route';

interface CharacterVariantSelectorProps {
  variants: Character[];
}

export default function CharacterVariantSelector({
  variants,
}: CharacterVariantSelectorProps) {
  if (variants.length === 0) {
    return null;
  }

  return (
    <Container size={PAGE_WIDTH.WIDE} py="md">
      <Stack gap="md">
        <Stack gap={4}>
          <Text size="lg" fw={700}>
            Choose a {variants[0].name} rarity
          </Text>
          <Text c="dimmed" size="sm">
            This character has multiple rarities. Pick one to view detailed
            skills, builds, and references.
          </Text>
        </Stack>

        <SimpleGrid cols={CARD_GRID_COLS} spacing="sm">
          {variants.map((variant) => {
            const routePath = getCharacterRoutePath(variant);

            return (
              <UnstyledButton
                key={getCharacterIdentityKey(variant)}
                component={Link}
                to={routePath}
                style={LINK_BLOCK_RESET_STYLE}
              >
                <InteractiveSurface component="div" p="sm">
                  <Group gap="sm" align="flex-start" wrap="nowrap">
                    <CharacterPortrait
                      name={variant.name}
                      size={CHARACTER_CARD.PORTRAIT_SIZE}
                      quality={variant.quality}
                      borderWidth={3}
                      routePath={routePath}
                      style={{ flexShrink: 0 }}
                    />

                    <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
                      <Group justify="space-between" align="flex-start" gap={6}>
                        <Group gap={6} wrap="wrap" style={{ minWidth: 0 }}>
                          <Text
                            fw={700}
                            size="sm"
                            className="dt-link-text"
                            lineClamp={1}
                          >
                            {variant.name}
                          </Text>
                          <QualityIcon quality={variant.quality} size={16} />
                        </Group>
                        <Group gap={4} justify="flex-end">
                          <RegionBadges
                            isGlobal={variant.is_global}
                            machineTranslated={variant.machine_translated}
                          />
                        </Group>
                      </Group>

                      <Group gap={6} wrap="wrap" align="center">
                        <ClassTag
                          characterClass={variant.character_class}
                          size="xs"
                        />
                        {variant.title && (
                          <Text size="xs" c="dimmed" lineClamp={1}>
                            {variant.title}
                          </Text>
                        )}
                      </Group>

                      {variant.factions.length > 0 && (
                        <Group gap={4} wrap="wrap">
                          {variant.factions.map((faction) => (
                            <FactionTag
                              key={faction}
                              faction={faction}
                              size="xs"
                            />
                          ))}
                        </Group>
                      )}

                      <Text fw={600} className="dt-link-text" size="xs">
                        Open details →
                      </Text>
                    </Stack>
                  </Group>
                </InteractiveSurface>
              </UnstyledButton>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
