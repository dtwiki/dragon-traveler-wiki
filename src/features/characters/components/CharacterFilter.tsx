import { getStatusEffectIcon } from '@/assets';
import EntityFilter from '@/components/common/EntityFilter';
import {
  createClassFilterGroup,
  createFactionFilterGroup,
  createQualityFilterGroup,
} from '@/components/common/EntityFilterGroups';
import {
  FilterChipGroup,
  FilterMultiSelect,
  FilterSection,
} from '@/components/common/FilterControls';
import type { CharacterFilters } from '@/features/characters/filters';
import type { StatusEffectType } from '@/features/wiki/status-effects/types';
import { EMPTY_CHARACTER_FILTERS } from '@/features/characters/filters';
import { useIsMobile } from '@/hooks';
import { IMAGE_SIZE } from '@/constants/ui';
import { Divider, Group, Select, SimpleGrid, Text } from '@mantine/core';
import SafeImage from '@/components/ui/SafeImage';

export interface CharacterFilterProps {
  filters: CharacterFilters;
  onChange: (filters: CharacterFilters) => void;
  effectOptions: {
    label: string;
    value: string;
    slug: string;
    icon?: boolean;
    type?: StatusEffectType;
  }[];
  combatTagOptions?: string[];
  showTierFilter?: boolean;
  tierOptions?: string[];
  starLevelOptions?: { value: string; label: string }[];
}

export default function CharacterFilter({
  filters,
  onChange,
  effectOptions,
  combatTagOptions = [],
  showTierFilter = false,
  tierOptions = [],
  starLevelOptions = [],
}: CharacterFilterProps) {
  const isMobile = useIsMobile();
  const chipSize = isMobile ? 'md' : 'xs';
  const groups = [
    createQualityFilterGroup(),
    createClassFilterGroup(),
    createFactionFilterGroup(),
    ...(showTierFilter
      ? [{ key: 'tiers', label: 'Tier', options: tierOptions }]
      : []),
  ];

  const handleGroupChange = (key: string, values: string[]) => {
    switch (key) {
      case 'qualities':
        onChange({
          ...filters,
          qualities: values as CharacterFilters['qualities'],
        });
        return;
      case 'classes':
        onChange({
          ...filters,
          classes: values as CharacterFilters['classes'],
        });
        return;
      case 'factions':
        onChange({
          ...filters,
          factions: values as CharacterFilters['factions'],
        });
        return;
      case 'tiers':
        onChange({ ...filters, tiers: values });
        return;
      default:
        return;
    }
  };

  const hasOwnedFilter =
    filters.ownedOnly ||
    filters.minStarLevel !== null ||
    filters.maxStarLevel !== null;

  return (
    <EntityFilter
      groups={groups}
      selected={{
        qualities: filters.qualities,
        classes: filters.classes,
        factions: filters.factions,
        tiers: filters.tiers,
      }}
      onChange={handleGroupChange}
      onClear={() => onChange(EMPTY_CHARACTER_FILTERS)}
      hasActiveFilters={
        filters.search !== '' ||
        filters.qualities.length > 0 ||
        filters.classes.length > 0 ||
        filters.factions.length > 0 ||
        filters.attackRanges.length > 0 ||
        filters.attackTypes.length > 0 ||
        filters.combatTags.length > 0 ||
        (showTierFilter && filters.tiers.length > 0) ||
        filters.statusEffects.length > 0 ||
        filters.globalOnly !== null ||
        filters.upcomingOnly ||
        hasOwnedFilter
      }
      beforeGroups={
        <>
          <FilterSection label="Server">
            <FilterChipGroup
              size={chipSize}
              value={
                filters.globalOnly === null
                  ? []
                  : filters.globalOnly
                    ? ['global']
                    : ['cn']
              }
              onChange={(val) => {
                const next = val.length === 0 ? null : val[val.length - 1];
                const globalOnly =
                  next === 'global' ? true : next === 'cn' ? false : null;
                onChange({
                  ...filters,
                  globalOnly,
                });
              }}
              options={[
                { value: 'global', label: 'Global' },
                { value: 'cn', label: 'TW / CN' },
              ]}
            />
          </FilterSection>
          <FilterSection label="Release">
            <FilterChipGroup
              size={chipSize}
              value={filters.upcomingOnly ? ['upcoming'] : []}
              onChange={(val) =>
                onChange({ ...filters, upcomingOnly: val.includes('upcoming') })
              }
              options={[{ value: 'upcoming', label: 'Upcoming' }]}
            />
          </FilterSection>
        </>
      }
      afterGroups={
        <>
          <Divider label="Combat" labelPosition="left" my={4} />
          <FilterSection label="Attack Type">
            <FilterChipGroup
              size={chipSize}
              value={filters.attackTypes}
              onChange={(values) =>
                onChange({
                  ...filters,
                  attackTypes: values as CharacterFilters['attackTypes'],
                })
              }
              options={[
                { value: 'physical', label: 'Physical' },
                { value: 'magical', label: 'Magical' },
              ]}
            />
          </FilterSection>
          <FilterSection label="Attack Range">
            <FilterChipGroup
              size={chipSize}
              value={filters.attackRanges}
              onChange={(values) =>
                onChange({
                  ...filters,
                  attackRanges: values as CharacterFilters['attackRanges'],
                })
              }
              options={[
                { value: 'melee', label: 'Melee' },
                { value: 'ranged', label: 'Ranged' },
              ]}
            />
          </FilterSection>
          {combatTagOptions.length > 0 && (
            <FilterSection label="Combat Tags">
              <FilterMultiSelect
                data={combatTagOptions}
                value={filters.combatTags}
                onChange={(val) => onChange({ ...filters, combatTags: val })}
                placeholder="Filter by combat tag..."
                searchable
                clearable
                size={chipSize}
                style={{ flex: 1, minWidth: 180 }}
                comboboxProps={{ withinPortal: !isMobile }}
              />
            </FilterSection>
          )}
          {effectOptions.length > 0 && (
            <FilterSection label="Effects">
              <FilterMultiSelect
                data={effectOptions}
                value={filters.statusEffects}
                onChange={(val) => onChange({ ...filters, statusEffects: val })}
                placeholder="Filter by status effect..."
                renderOption={({ option }) => {
                  const effect = effectOptions.find(
                    (o) => o.value === option.value,
                  );
                  const iconSrc = effect?.slug
                    ? getStatusEffectIcon(effect.slug, effect.type)
                    : undefined;
                  return (
                    <Group gap="xs" align="center">
                      {iconSrc ? (
                        <SafeImage
                          src={iconSrc}
                          alt=""
                          w={IMAGE_SIZE.ICON_LG}
                          h={IMAGE_SIZE.ICON_LG}
                          fit="contain"
                        />
                      ) : null}
                      <Text size="sm">{option.label}</Text>
                    </Group>
                  );
                }}
                searchable={effectOptions.length >= 10}
                clearable
                size={chipSize}
                style={{ flex: 1, minWidth: 180 }}
                comboboxProps={{ withinPortal: !isMobile }}
              />
            </FilterSection>
          )}
          <Divider label="Collection" labelPosition="left" my={4} />
          <FilterSection label="Owned Characters">
            <FilterChipGroup
              size={chipSize}
              value={filters.ownedOnly ? ['owned'] : []}
              onChange={(val) =>
                onChange({ ...filters, ownedOnly: val.includes('owned') })
              }
              options={[{ value: 'owned', label: 'Owned only' }]}
            />
            {starLevelOptions.length > 0 && (
              <SimpleGrid cols={2} spacing="xs">
                <Select
                  label="Min Star Level"
                  placeholder="Any"
                  size={chipSize}
                  data={starLevelOptions}
                  value={filters.minStarLevel}
                  onChange={(val) => {
                    const minIndex = val
                      ? starLevelOptions.findIndex(
                          (option) => option.value === val,
                        )
                      : -1;
                    const maxIndex = filters.maxStarLevel
                      ? starLevelOptions.findIndex(
                          (option) => option.value === filters.maxStarLevel,
                        )
                      : -1;
                    onChange({
                      ...filters,
                      minStarLevel: val,
                      maxStarLevel:
                        minIndex >= 0 && maxIndex >= 0 && minIndex > maxIndex
                          ? null
                          : filters.maxStarLevel,
                    });
                  }}
                  clearable
                  comboboxProps={{ withinPortal: !isMobile }}
                />
                <Select
                  label="Max Star Level"
                  placeholder="Any"
                  size={chipSize}
                  data={starLevelOptions}
                  value={filters.maxStarLevel}
                  onChange={(val) => {
                    const maxIndex = val
                      ? starLevelOptions.findIndex(
                          (option) => option.value === val,
                        )
                      : -1;
                    const minIndex = filters.minStarLevel
                      ? starLevelOptions.findIndex(
                          (option) => option.value === filters.minStarLevel,
                        )
                      : -1;
                    onChange({
                      ...filters,
                      maxStarLevel: val,
                      minStarLevel:
                        minIndex >= 0 && maxIndex >= 0 && minIndex > maxIndex
                          ? null
                          : filters.minStarLevel,
                    });
                  }}
                  clearable
                  comboboxProps={{ withinPortal: !isMobile }}
                />
              </SimpleGrid>
            )}
          </FilterSection>
        </>
      }
    />
  );
}
