import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Badge, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { useInViewport, useMergedRef, useReducedMotion } from '@mantine/hooks';
import { InteractiveSurface } from '@/components/ui/Surface';
import GlobalBadge from '@/components/ui/GlobalBadge';
import SafeImage from '@/components/ui/SafeImage';
import SafeVideo from '@/components/ui/SafeVideo';
import { getOracleScrollVideo, getRelicIcon } from '@/assets';
import ListPageShell from '@/components/layout/ListPageShell';
import { CardGridLoading } from '@/components/layout/PageLoadingSkeleton';
import SearchableGridPanel from '@/components/layout/SearchableGridPanel';
import { LINK_BLOCK_RESET_STYLE } from '@/constants/styles';
import RelicTypeTag from '@/features/wiki/relics/components/RelicTypeTag';
import type { OracleScrollRef, Relic } from '@/features/wiki/relics/types';
import { CARD_GRID_COLS } from '@/constants/ui';
import { useGradientAccent } from '@/hooks';

interface OracleScrollsTabProps {
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  oracleScrolls: OracleScrollRef[];
  search: string;
  onSearchChange: (value: string) => void;
  filtered: OracleScrollRef[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageItems: OracleScrollRef[];
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (pageSize: number) => void;
  relicsByOracle: Map<string, Relic[]>;
}

const VIDEO_HEIGHT = 130;

function OracleScrollVideo({ src }: { src: string }) {
  const { ref: viewportRef, inViewport } = useInViewport<HTMLVideoElement>();
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mergedRef = useMergedRef(viewportRef, videoRef);
  const shouldPlay = inViewport && !reduceMotion;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!shouldPlay) {
      video.pause();
      return;
    }
    video.play()?.catch(() => {
      // Autoplay can be blocked by the browser (e.g. data saver modes).
    });
  }, [shouldPlay]);

  return (
    <SafeVideo
      ref={mergedRef}
      src={src}
      muted
      loop
      // Reduced motion never plays the video, so load enough data to show
      // its first frame instead of an empty box.
      preload={reduceMotion ? 'auto' : 'metadata'}
      style={{
        display: 'block',
        width: '100%',
        height: VIDEO_HEIGHT,
        objectFit: 'cover',
        objectPosition: 'center',
        borderTopLeftRadius: 'var(--mantine-radius-md)',
        borderTopRightRadius: 'var(--mantine-radius-md)',
      }}
    />
  );
}

export default function OracleScrollsTab({
  loading,
  error,
  onRetry,
  oracleScrolls,
  search,
  onSearchChange,
  filtered,
  page,
  totalPages,
  onPageChange,
  pageItems,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  relicsByOracle,
}: OracleScrollsTabProps) {
  const { accent } = useGradientAccent();
  return (
    <ListPageShell
      loading={loading}
      error={error}
      onRetry={onRetry}
      errorTitle="Could not load oracle scrolls"
      hasData={oracleScrolls.length > 0}
      emptyMessage="No oracle scroll data available yet."
      loadingFallback={<CardGridLoading cardHeight={160} showPagination />}
    >
      <SearchableGridPanel
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by oracle scroll or relic name..."
        hasResults={filtered.length > 0}
        noResultsTitle="No oracle scrolls found"
        noResultsMessage="No oracle scrolls match the search."
        onResetSearch={() => onSearchChange('')}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={filtered.length}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
      >
        <SimpleGrid cols={CARD_GRID_COLS} spacing="md">
          {pageItems.map((scroll) => {
            const items = relicsByOracle.get(scroll.slug) ?? [];
            const videoSrc = getOracleScrollVideo(scroll.slug);
            return (
              <InteractiveSurface
                key={scroll.slug}
                component={Link}
                to={`/oracle-scrolls/${scroll.slug}`}
                p={0}
                style={{ ...LINK_BLOCK_RESET_STYLE, overflow: 'hidden' }}
              >
                <Stack gap={0}>
                  {videoSrc && <OracleScrollVideo src={videoSrc} />}
                  <Stack gap="xs" p="md">
                    <Group justify="space-between" align="center">
                      <Text
                        fw={700}
                        className="dt-link-text"
                        lineClamp={1}
                        style={{ flex: 1 }}
                      >
                        {scroll.name}
                      </Text>
                      <Badge
                        variant="light"
                        size="sm"
                        color={accent.secondary}
                        style={{ flexShrink: 0 }}
                      >
                        {items.length} relic
                        {items.length === 1 ? '' : 's'}
                      </Badge>
                    </Group>

                    <Stack gap={4}>
                      {items.map((relic) => {
                        const relicIconSrc = getRelicIcon(
                          relic.slug,
                          relic.quality,
                        );
                        return (
                          <Group key={relic.name} gap="xs" wrap="nowrap">
                            {relicIconSrc && (
                              <SafeImage
                                src={relicIconSrc}
                                alt={relic.name}
                                w={24}
                                h={24}
                                fit="contain"
                                radius="sm"
                              />
                            )}
                            <Stack
                              gap={2}
                              align="flex-start"
                              style={{ flex: 1, minWidth: 0 }}
                            >
                              <Group gap="xs" wrap="nowrap">
                                <Text size="sm" fw={500}>
                                  {relic.name}
                                </Text>
                                {relic.is_global === false && (
                                  <GlobalBadge isGlobal={false} size="xs" />
                                )}
                              </Group>
                              <RelicTypeTag type={relic.type} />
                            </Stack>
                          </Group>
                        );
                      })}
                    </Stack>
                  </Stack>
                </Stack>
              </InteractiveSurface>
            );
          })}
        </SimpleGrid>
      </SearchableGridPanel>
    </ListPageShell>
  );
}
