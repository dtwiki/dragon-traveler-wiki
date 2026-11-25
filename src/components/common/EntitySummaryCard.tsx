import SafeImage from '@/components/ui/SafeImage';
import { InteractiveSurface, StaticSurface } from '@/components/ui/Surface';
import { LINK_BLOCK_RESET_STYLE } from '@/constants/styles';
import { IMAGE_SIZE } from '@/constants/ui';
import { Box, Group, Stack, Text } from '@mantine/core';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

interface EntitySummaryCardProps {
  /** Omit (or pass null) to render a non-interactive card, e.g. when no linked entity exists yet. */
  to?: string | null;
  title: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Defaults to IMAGE_SIZE.CARD_ICON; use a smaller size for low-resolution art. */
  imageSize?: number;
  /** Keep the image column when there's no image so cards in a list stay aligned. */
  reserveImageSpace?: boolean;
  titleAccessory?: ReactNode;
  metadata?: ReactNode;
  description?: ReactNode;
}

/** Shared visual hierarchy for entity cards used across database lists. */
export default function EntitySummaryCard({
  to,
  title,
  imageSrc,
  imageAlt = title,
  imageSize = IMAGE_SIZE.CARD_ICON,
  reserveImageSpace = false,
  titleAccessory,
  metadata,
  description,
}: EntitySummaryCardProps) {
  const Surface = to ? InteractiveSurface : StaticSurface;

  return (
    <Surface
      p={{ base: 'sm', sm: 'md' }}
      {...(to ? { component: Link, to, style: LINK_BLOCK_RESET_STYLE } : {})}
    >
      <Group gap="md" align="flex-start" wrap="nowrap">
        {(imageSrc || reserveImageSpace) && (
          // Fixed-size slot so a missing or failed image doesn't shift the text.
          <Box w={imageSize} h={imageSize} style={{ flexShrink: 0 }}>
            {imageSrc && (
              <SafeImage
                src={imageSrc}
                alt={imageAlt}
                w={imageSize}
                h={imageSize}
                fit="contain"
                radius="sm"
                loading="lazy"
              />
            )}
          </Box>
        )}
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          {/* Badges wrap below the title before they can squeeze it out. */}
          <Group gap="xs" wrap="wrap" align="flex-start">
            <Text
              fw={700}
              className={to ? 'dt-link-text' : undefined}
              lineClamp={2}
              style={{ minWidth: 0, flex: '1 1 8rem' }}
            >
              {title}
            </Text>
            {titleAccessory && (
              <Box style={{ flexShrink: 0 }}>{titleAccessory}</Box>
            )}
          </Group>
          {metadata}
          {description}
        </Stack>
      </Group>
    </Surface>
  );
}
