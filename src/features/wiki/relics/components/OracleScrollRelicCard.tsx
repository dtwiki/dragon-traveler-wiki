import SafeImage from '@/components/ui/SafeImage';
import { getRelicIcon } from '@/assets';
import RichText from '@/components/common/RichText';
import QualityIcon from '@/components/ui/QualityIcon';
import GlobalBadge from '@/components/ui/GlobalBadge';
import type { Relic } from '@/features/wiki/relics/types';
import type { StatusEffect } from '@/features/wiki/status-effects/types';
import { QUALITY_COLOR } from '@/constants/quality';
import { getLoreGlassStyles } from '@/constants/glass';
import { StaticSurface } from '@/components/ui/Surface';
import { IMAGE_SIZE } from '@/constants/ui';
import { Group, Stack, Text } from '@mantine/core';

interface OracleScrollRelicCardProps {
  relic: Relic;
  isDark: boolean;
  statusEffects: StatusEffect[];
}

export default function OracleScrollRelicCard({
  relic,
  isDark,
  statusEffects,
}: OracleScrollRelicCardProps) {
  const iconSrc = getRelicIcon(relic.slug, relic.quality);
  return (
    <StaticSurface
      p="md"
      style={{
        borderTop: `3px solid var(--mantine-color-${QUALITY_COLOR[relic.quality]}-${isDark ? 7 : 5})`,
      }}
    >
      <Stack gap="sm">
        <Group gap="md" wrap="nowrap" align="flex-start">
          {iconSrc && (
            <SafeImage
              src={iconSrc}
              alt={relic.name}
              w={IMAGE_SIZE.CARD_ICON}
              h={IMAGE_SIZE.CARD_ICON}
              fit="contain"
              radius="sm"
              loading="lazy"
            />
          )}
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" align="center" wrap="wrap">
              <Text fw={700} size="lg" className="dt-link-text" lineClamp={1}>
                {relic.name}
              </Text>
              <QualityIcon quality={relic.quality} />
              {relic.is_global === false && (
                <GlobalBadge isGlobal={false} size="sm" />
              )}
            </Group>
          </Stack>
        </Group>

        <StaticSurface p="sm" radius="sm" style={getLoreGlassStyles(isDark)}>
          <RichText text={relic.lore} statusEffects={statusEffects} italic />
        </StaticSurface>
      </Stack>
    </StaticSurface>
  );
}
