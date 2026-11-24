import ExpandableText from '@/components/ui/ExpandableText';
import { getWyrmspellIcon } from '@/assets';
import RichText from '@/components/common/RichText';
import { InteractiveSurface } from '@/components/ui/Surface';
import { LINK_BLOCK_RESET_STYLE } from '@/constants/styles';
import FactionTag from '@/components/ui/FactionTag';
import GlobalBadge from '@/components/ui/GlobalBadge';
import MachineTranslatedBadge from '@/components/ui/MachineTranslatedBadge';
import QualityIcon from '@/components/ui/QualityIcon';
import type {
  Wyrmspell,
  WyrmspellType,
} from '@/features/wiki/wyrmspells/types';
import { getMaxQuality } from '@/features/wiki/wyrmspells/types';
import WyrmspellTypeTag from './WyrmspellTypeTag';
import { useStatusEffects } from '@/features/wiki/hooks/use-wiki-data';
import { Group, Stack, Text } from '@mantine/core';
import SafeImage from '@/components/ui/SafeImage';
import { IMAGE_SIZE } from '@/constants/ui';
import { Link } from 'react-router';

interface WyrmspellCardProps {
  name: string;
  type?: string;
  wyrmspells?: Wyrmspell[];
}

export default function WyrmspellCard({
  name,
  type,
  wyrmspells = [],
}: WyrmspellCardProps) {
  const { data: statusEffects } = useStatusEffects();
  const wyrmspell = wyrmspells.find((w) => w.slug === name || w.name === name);
  if (!wyrmspell) return null;

  const displayType = type || wyrmspell.type || 'Unknown';
  const iconSrc = getWyrmspellIcon(wyrmspell.slug, displayType);
  const maxQuality = getMaxQuality(wyrmspell);

  return (
    <InteractiveSurface
      component={Link}
      to={`/wyrmspells/${wyrmspell.slug}`}
      p="sm"
      style={LINK_BLOCK_RESET_STYLE}
    >
      <Stack gap="xs" align="center">
        {iconSrc && (
          <SafeImage
            src={iconSrc}
            alt={wyrmspell.name}
            w={IMAGE_SIZE.CARD_ICON_SM}
            h={IMAGE_SIZE.CARD_ICON_SM}
            fit="contain"
            loading="lazy"
          />
        )}
        <Group gap={4} justify="center" align="center">
          <Text size="sm" fw={600} ta="center" className="dt-link-text">
            {wyrmspell.name}
          </Text>
          {maxQuality && <QualityIcon quality={maxQuality.quality} />}
          {wyrmspell.is_global === false && (
            <GlobalBadge isGlobal={false} size="xs" />
          )}
          {wyrmspell.machine_translated && <MachineTranslatedBadge size="xs" />}
        </Group>
        <Group gap={4} justify="center">
          <WyrmspellTypeTag type={displayType as WyrmspellType} />
          {wyrmspell.exclusive_faction && (
            <FactionTag faction={wyrmspell.exclusive_faction} size="xs" />
          )}
        </Group>
        {maxQuality && (
          <ExpandableText size="xs" ta="center">
            <RichText text={maxQuality.effect} statusEffects={statusEffects} />
          </ExpandableText>
        )}
      </Stack>
    </InteractiveSurface>
  );
}
