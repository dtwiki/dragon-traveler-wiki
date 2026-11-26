import ListPageHeader from '@/components/layout/ListPageHeader';
import SafeImage from '@/components/ui/SafeImage';
import DataFetchError from '@/components/ui/DataFetchError';
import { QUALITY_ICON_MAP } from '@/assets';
import { parseNumberInput } from '@/utils';
import StatCard from '@/components/ui/StatCard';
import { StaticSurface } from '@/components/ui/Surface';
import { useStarLevels } from '@/features/wiki/hooks/use-wiki-data';
import { useGradientAccent, useIsMobile, useNullableNumber } from '@/hooks';
import { buildStarLevels } from '@/features/wiki/star-levels/star-levels';
import {
  getHeartTrialShardsPerDay,
  SHARDS_PER_DUPE,
  STAR_TIER_BADGE_COLORS,
  type HeartTrialQuality,
} from '@/features/calculators/star-upgrade/star-upgrade-model';
import {
  Alert,
  Badge,
  Container,
  Divider,
  Group,
  NumberInput,
  Progress,
  SegmentedControl,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Switch,
  Text,
  Title,
} from '@mantine/core';
import { useMemo, useState } from 'react';
import {
  IoCalendar,
  IoCopy,
  IoDiamond,
  IoHeart,
  IoInformationCircleOutline,
  IoPeople,
  IoStar,
  IoTime,
} from 'react-icons/io5';
import StarUpgradeReferenceTable from '@/features/calculators/star-upgrade/components/StarUpgradeReferenceTable';
import HeartTrialRateTable from '@/features/calculators/star-upgrade/components/HeartTrialRateTable';
import { PAGE_WIDTH } from '@/constants/ui';

const HEART_TRIAL_QUALITY_OPTIONS = [
  'SSR EX',
  'SSR+',
  'SSR',
  'SR',
] as const satisfies readonly HeartTrialQuality[];

export default function StarUpgradeCalculatorPage() {
  const { accent } = useGradientAccent();
  const isMobile = useIsMobile();
  const {
    data: rawStarLevels,
    loading: starLevelsLoading,
    error: starLevelsError,
    retry: retryStarLevels,
  } = useStarLevels();
  const starLevels = useMemo(
    () => buildStarLevels(rawStarLevels),
    [rawStarLevels],
  );

  const [currentValue, setCurrentValue] = useState<string>('');
  const [targetValue, setTargetValue] = useState<string>('');
  const [quality, setQuality] = useState<HeartTrialQuality>('SSR');
  const [affectionLevel20, setAffectionLevel20] = useState<boolean>(false);
  const [currentCopies, safeCurrentCopies, setCurrentCopies] =
    useNullableNumber(0);
  const [currentShards, setCurrentShards] = useState<number | null>(0);

  // Fall back to first/last level when data loads or user hasn't selected yet
  const effectiveCurrentValue = currentValue || (starLevels[0]?.value ?? '');
  const effectiveTargetValue =
    targetValue || (starLevels[starLevels.length - 1]?.value ?? '');

  const currentIndex = starLevels.findIndex(
    (level) => level.value === effectiveCurrentValue,
  );
  const targetIndex = starLevels.findIndex(
    (level) => level.value === effectiveTargetValue,
  );

  const currentLevel = starLevels[currentIndex] ?? starLevels[0];
  const targetLevel =
    starLevels[targetIndex] ?? starLevels[starLevels.length - 1];

  const isValidSelection =
    currentIndex >= 0 && targetIndex >= 0 && currentIndex < targetIndex;

  const copiesNeeded = isValidSelection
    ? targetLevel.copies - currentLevel.copies
    : 0;
  const fodderNeeded = isValidSelection
    ? targetLevel.fodder - currentLevel.fodder
    : 0;
  const divineCrystalsNeeded = isValidSelection
    ? targetLevel.divineCrystals - currentLevel.divineCrystals
    : 0;

  const shardsPerDay = getHeartTrialShardsPerDay(quality, affectionLevel20);

  const effectiveCopiesNeeded =
    quality === 'SR' ? copiesNeeded * 2 : copiesNeeded;
  const totalShardsNeeded = effectiveCopiesNeeded * SHARDS_PER_DUPE;
  const safeCurrentShards = currentShards ?? 0;
  const ownedShards = Math.max(
    0,
    safeCurrentCopies * SHARDS_PER_DUPE + safeCurrentShards,
  );
  const shardsRemaining = Math.max(0, totalShardsNeeded - ownedShards);

  const shardProgress =
    totalShardsNeeded > 0
      ? Math.min(
          100,
          (Math.min(ownedShards, totalShardsNeeded) / totalShardsNeeded) * 100,
        )
      : 0;

  const daysNeeded =
    shardsPerDay > 0 ? Math.ceil(shardsRemaining / shardsPerDay) : 0;
  const weeksNeeded = daysNeeded > 0 ? (daysNeeded / 7).toFixed(1) : '0';
  const monthsNeeded = daysNeeded > 0 ? (daysNeeded / 30).toFixed(1) : '0';
  const yearsNeeded = daysNeeded > 0 ? (daysNeeded / 365).toFixed(1) : '0';

  const completionDate = useMemo(() => {
    if (daysNeeded <= 0) return '';
    const date = new Date();
    date.setDate(date.getDate() + daysNeeded);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [daysNeeded]);

  const levelOptions = starLevels.map((level) => ({
    value: level.value,
    label: `${level.label} • ${level.copies} copies / ${level.fodder} fodder`,
  }));

  return (
    <Container size={PAGE_WIDTH.WIDE} py={{ base: 'lg', sm: 'xl' }}>
      <Stack gap="lg">
        <ListPageHeader
          title="Star Upgrade Calculator"
          description="Plan your upgrade path, shard farming timeline, and required resources."
        />

        <Alert
          variant="light"
          color={accent.primary}
          icon={<IoInformationCircleOutline />}
          title="How to use"
        >
          Pick your current and target star levels first. The calculator shows
          cumulative requirements, then estimates farming time based on your
          selected quality and current shard stock.
        </Alert>

        {starLevelsError && (
          <DataFetchError
            title="Could not load star levels"
            message={starLevelsError.message}
            onRetry={retryStarLevels}
          />
        )}

        <StaticSurface p={{ base: 'sm', sm: 'lg' }}>
          <Stack gap="md">
            <Title order={2} size="h3">
              <Group gap="xs">
                <IoStar />
                Upgrade Requirements
              </Group>
            </Title>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              {starLevelsLoading ? (
                <>
                  <Skeleton height={62} radius="sm" />
                  <Skeleton height={62} radius="sm" />
                </>
              ) : (
                <>
                  <Select
                    label="Current Star Level"
                    data={levelOptions}
                    value={effectiveCurrentValue}
                    onChange={(value) =>
                      setCurrentValue(value ?? starLevels[0]?.value ?? '')
                    }
                    searchable
                    nothingFoundMessage="No level found"
                  />
                  <Select
                    label="Target Star Level"
                    data={levelOptions}
                    value={effectiveTargetValue}
                    onChange={(value) =>
                      setTargetValue(
                        value ?? starLevels[starLevels.length - 1]?.value ?? '',
                      )
                    }
                    searchable
                    nothingFoundMessage="No level found"
                  />
                </>
              )}
            </SimpleGrid>

            {starLevelsLoading ? null : !isValidSelection ? (
              <Alert color="red" variant="light" title="Invalid selection">
                Target star level must be higher than current star level.
              </Alert>
            ) : (
              <>
                <Group gap="xs" wrap="wrap">
                  <Badge
                    color={STAR_TIER_BADGE_COLORS[currentLevel.tier]}
                    variant="light"
                    size="lg"
                  >
                    Current: {currentLevel.label}
                  </Badge>
                  <Badge
                    color={STAR_TIER_BADGE_COLORS[targetLevel.tier]}
                    variant="light"
                    size="lg"
                  >
                    Target: {targetLevel.label}
                  </Badge>
                </Group>

                <SimpleGrid
                  cols={{ base: 2, sm: divineCrystalsNeeded > 0 ? 3 : 2 }}
                  spacing="sm"
                >
                  <StatCard
                    icon={<IoCopy size={16} />}
                    title="5-Star Copies"
                    value={copiesNeeded}
                    color={accent.primary}
                  />
                  <StatCard
                    icon={<IoPeople size={16} />}
                    title="6-Star Fodder"
                    value={fodderNeeded}
                    color={accent.secondary}
                  />
                  {divineCrystalsNeeded > 0 && (
                    <StatCard
                      icon={<IoDiamond size={16} />}
                      title="Divine Crystals"
                      value={divineCrystalsNeeded}
                      color="orange"
                    />
                  )}
                </SimpleGrid>
              </>
            )}
          </Stack>
        </StaticSurface>

        {isValidSelection && copiesNeeded > 0 && (
          <StaticSurface p={{ base: 'sm', sm: 'lg' }}>
            <Stack gap="md">
              <Title order={2} size="h3">
                <Group gap="xs">
                  <IoHeart />
                  Heart Trial Estimator
                </Group>
              </Title>

              <Text size="sm" c="dimmed">
                Each dupe requires {SHARDS_PER_DUPE} shards. SR heart-trial
                yields 4-star copies, so SR paths are automatically converted to
                5-star equivalent costs.
              </Text>

              <SegmentedControl
                value={quality}
                onChange={(value) => setQuality(value as HeartTrialQuality)}
                data={HEART_TRIAL_QUALITY_OPTIONS.map((option) => ({
                  value: option,
                  label: (
                    <SafeImage
                      src={QUALITY_ICON_MAP[option]}
                      alt={option}
                      h={18}
                      fit="contain"
                    />
                  ),
                }))}
                fullWidth
              />

              {quality === 'SSR EX' && (
                <Switch
                  label="Affection Level 20 (2 shards/day)"
                  checked={affectionLevel20}
                  onChange={(event) =>
                    setAffectionLevel20(event.currentTarget.checked)
                  }
                />
              )}

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <NumberInput
                  hideControls={isMobile}
                  label="Current Copies"
                  description={`Full copies already owned (${SHARDS_PER_DUPE} shards each)`}
                  value={currentCopies ?? ''}
                  onChange={(value) =>
                    setCurrentCopies(parseNumberInput(value))
                  }
                  min={0}
                  step={1}
                  allowNegative={false}
                />
                <NumberInput
                  hideControls={isMobile}
                  label="Current Shards"
                  description="Extra shards beyond full copies"
                  value={currentShards ?? ''}
                  onChange={(value) =>
                    setCurrentShards(
                      parseNumberInput(value) == null
                        ? null
                        : Math.max(
                            0,
                            Math.min(
                              SHARDS_PER_DUPE - 1,
                              parseNumberInput(value) ?? 0,
                            ),
                          ),
                    )
                  }
                  min={0}
                  max={SHARDS_PER_DUPE - 1}
                  step={1}
                  allowNegative={false}
                />
              </SimpleGrid>

              <Stack gap={6}>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Shard Progress
                  </Text>
                  <Text size="xs" c="dimmed">
                    {Math.min(ownedShards, totalShardsNeeded)} /{' '}
                    {totalShardsNeeded} ({shardProgress.toFixed(1)}%)
                  </Text>
                </Group>
                <Progress
                  value={shardProgress}
                  size="lg"
                  radius="md"
                  color={shardProgress >= 100 ? 'teal' : accent.primary}
                />
              </Stack>

              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                <StatCard
                  icon={<IoTime size={16} />}
                  title="Days"
                  value={daysNeeded}
                  color="teal"
                />
                <StatCard
                  icon={<IoTime size={16} />}
                  title="Weeks"
                  value={Number(weeksNeeded)}
                  color="teal"
                />
                <StatCard
                  icon={<IoTime size={16} />}
                  title="Months"
                  value={Number(monthsNeeded)}
                  color="teal"
                />
                <StatCard
                  icon={<IoTime size={16} />}
                  title="Years"
                  value={Number(yearsNeeded)}
                  color="teal"
                />
              </SimpleGrid>

              <SimpleGrid cols={3} spacing="sm">
                <StaticSurface p={{ base: 'xs', sm: 'md' }}>
                  <Stack gap={4} align="center">
                    <Text size="xs" c="dimmed" ta="center">
                      Daily Shards
                    </Text>
                    <Text fw={700} size="lg">
                      {shardsPerDay}/day
                    </Text>
                  </Stack>
                </StaticSurface>
                <StaticSurface p={{ base: 'xs', sm: 'md' }}>
                  <Stack gap={4} align="center">
                    <Text size="xs" c="dimmed" ta="center">
                      Total Needed
                    </Text>
                    <Text fw={700} size="lg">
                      {totalShardsNeeded}
                    </Text>
                  </Stack>
                </StaticSurface>
                <StaticSurface p={{ base: 'xs', sm: 'md' }}>
                  <Stack gap={4} align="center">
                    <Text size="xs" c="dimmed" ta="center">
                      Remaining
                    </Text>
                    <Text fw={700} size="lg">
                      {shardsRemaining}
                    </Text>
                  </Stack>
                </StaticSurface>
              </SimpleGrid>

              {daysNeeded > 0 && (
                <StaticSurface p="md">
                  <Group gap="sm" wrap="nowrap">
                    <IoCalendar size={16} />
                    <Stack gap={2}>
                      <Text size="sm" c="dimmed">
                        Estimated completion date
                      </Text>
                      <Text fw={700}>{completionDate}</Text>
                    </Stack>
                  </Group>
                </StaticSurface>
              )}

              <Divider />

              <Stack gap="xs">
                <Text fw={600} size="sm">
                  Sweep Rate Reference
                </Text>
                <HeartTrialRateTable />
              </Stack>
            </Stack>
          </StaticSurface>
        )}

        <StarUpgradeReferenceTable
          levels={starLevels}
          currentIndex={currentIndex}
          targetIndex={targetIndex}
          validSelection={isValidSelection}
          accentColor={accent.primary}
        />
      </Stack>
    </Container>
  );
}
