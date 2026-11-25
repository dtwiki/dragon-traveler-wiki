import { Badge, Group, Skeleton, Stack, Text } from '@mantine/core';
import { StaticSurface } from '@/components/ui/Surface';
import { LoadingRegion } from '@/components/layout/PageLoadingSkeleton';
import { useChangelog } from '@/features/wiki/hooks/use-wiki-data';
import HomeSectionError from './HomeSectionError';

const TYPE_COLORS: Record<string, string> = {
  added: 'green',
  updated: 'blue',
  fixed: 'orange',
  removed: 'red',
};

export default function RecentUpdatesSection() {
  const { data: changelog, loading, error, retry } = useChangelog();

  if (loading) {
    return (
      <LoadingRegion label="Loading recent updates">
        <Stack gap="xs">
          {[1, 2, 3].map((i) => (
            <StaticSurface key={i} p="xs">
              <Group justify="space-between" mb={6} wrap="nowrap">
                <Skeleton height={12} width={72} radius="sm" />
                <Skeleton height={18} width={64} radius="xl" />
              </Group>
              <Stack gap={4}>
                <Skeleton height={12} width="88%" radius="sm" />
                <Skeleton height={12} width="68%" radius="sm" />
              </Stack>
            </StaticSurface>
          ))}
        </Stack>
      </LoadingRegion>
    );
  }

  if (error) {
    return (
      <HomeSectionError message="Could not load updates." onRetry={retry} />
    );
  }

  const recentEntries = [...changelog]
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .slice(0, 3);

  if (recentEntries.length === 0) {
    return (
      <Text size="sm" c="dimmed" fs="italic">
        No recent updates.
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      {recentEntries.map((entry) => (
        <StaticSurface key={entry.version ?? entry.date} p="xs">
          <Group justify="space-between" mb={4} wrap="wrap" gap={4}>
            <Text size="xs" fw={600}>
              {entry.version || entry.date}
            </Text>
            <Group gap="xs" wrap="nowrap">
              <Badge size="xs" variant="light" color="gray">
                {entry.changes.length} changes
              </Badge>
              {entry.version && (
                <Text size="xs" c="dimmed">
                  {entry.date}
                </Text>
              )}
            </Group>
          </Group>
          <Stack gap={2}>
            {entry.changes.slice(0, 2).map((change, cIdx) => (
              <Group key={cIdx} gap="xs" wrap="nowrap">
                <Badge
                  size="xs"
                  variant="light"
                  color={TYPE_COLORS[change.type] || 'gray'}
                  tt="capitalize"
                  style={{ flexShrink: 0 }}
                >
                  {change.type}
                </Badge>
                <Text size="xs" lineClamp={1}>
                  {change.description}
                </Text>
              </Group>
            ))}
            {entry.changes.length > 2 && (
              <Text size="xs" c="dimmed" fs="italic">
                +{entry.changes.length - 2} more changes
              </Text>
            )}
          </Stack>
        </StaticSurface>
      ))}
    </Stack>
  );
}
