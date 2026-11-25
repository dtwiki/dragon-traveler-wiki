import { Badge, Group, Popover, Stack, Text } from '@mantine/core';
import { useContext } from 'react';
import { getStatusEffectIcon } from '@/assets';
import { STATE_COLOR } from '@/constants/status-effect-colors';
import {
  CURSOR_POINTER_STYLE,
  RICH_TEXT_BADGE_STYLE,
  WHITE_SPACE_PRE_LINE_STYLE,
} from '@/constants/styles';
import {
  IMAGE_SIZE,
  POPOVER_BADGE_WIDTH,
  POPOVER_MAX_WIDTH,
} from '@/constants/ui';
import { ResourcesContext } from '@/contexts';
import type { Skill, Talent } from '@/features/characters/types';
import type { StatusEffect } from '@/features/wiki/status-effects/types';
import { useGradientAccent } from '@/hooks';
import { normalizeName, splitEffectRefs } from '@/utils';
import IconBadge from '@/components/ui/IconBadge';
import ResourceBadge from '@/components/ui/ResourceBadge';
import SafeImage from '@/components/ui/SafeImage';

export interface RichTextProps {
  text: string;
  statusEffects: StatusEffect[];
  skills?: Skill[];
  talent?: Talent | null;
  onSkillClick?: (skillName: string) => void;
  onTalentClick?: () => void;
  italic?: boolean;
  lineHeight?: number;
  color?: string;
  disablePopovers?: boolean;
}

interface ReferenceBadgeProps {
  name: string;
  displayName?: string;
  label: string;
  color: string;
  description?: string;
  lines?: string[];
  disablePopovers?: boolean;
}

function ReferenceBadge({
  name,
  displayName,
  label,
  color,
  description,
  lines,
  disablePopovers,
}: ReferenceBadgeProps) {
  const hasDetails = Boolean(description) || (lines?.length ?? 0) > 0;
  const badgeLabel = displayName ?? name;

  if (!hasDetails || disablePopovers) {
    return (
      <Badge
        variant="light"
        color={color}
        size="sm"
        component="span"
        style={RICH_TEXT_BADGE_STYLE}
      >
        {badgeLabel}
      </Badge>
    );
  }

  return (
    <Popover
      position="top"
      withArrow
      shadow="md"
      closeOnClickOutside
      withinPortal
    >
      <Popover.Target>
        <Badge
          variant="light"
          color={color}
          size="sm"
          component="span"
          style={{ ...RICH_TEXT_BADGE_STYLE, ...CURSOR_POINTER_STYLE }}
        >
          {badgeLabel}
        </Badge>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="xs" maw={POPOVER_MAX_WIDTH}>
          <Group gap="xs" wrap="nowrap">
            <Text fw={600} size="sm">
              {name}
            </Text>
            <Badge variant="light" color={color} size="xs">
              {label}
            </Badge>
          </Group>
          {description && (
            <Text size="xs" style={WHITE_SPACE_PRE_LINE_STYLE}>
              {description}
            </Text>
          )}
          {lines?.map((line, idx) => (
            <Text
              key={`${name}-line-${idx}`}
              size="xs"
              style={WHITE_SPACE_PRE_LINE_STYLE}
            >
              {line}
            </Text>
          ))}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

const fuzzyNames = (name: string): string[] => {
  const n = normalizeName(name);
  return n.endsWith('s') ? [n, n.slice(0, -1)] : [n, n + 's'];
};

const findByName = <T extends { name: string }>(
  items: T[] | undefined,
  name: string,
): T | undefined => {
  const candidates = fuzzyNames(name);
  return items?.find((item) => candidates.includes(normalizeName(item.name)));
};

interface StatusEffectBadgeProps {
  slug: string;
  statusEffects: StatusEffect[];
  displayName?: string;
  disablePopover?: boolean;
}

function StatusEffectBadge({
  slug,
  statusEffects,
  displayName,
  disablePopover,
}: StatusEffectBadgeProps) {
  const effect = statusEffects.find((item) => item.slug === slug);
  const label = displayName ?? effect?.name ?? slug;

  if (!effect) {
    return (
      <Badge
        variant="light"
        color="gray"
        size="sm"
        component="span"
        style={RICH_TEXT_BADGE_STYLE}
      >
        {label}
      </Badge>
    );
  }

  const effectColor = STATE_COLOR[effect.type];
  const iconSrc =
    effect.icon !== false
      ? getStatusEffectIcon(effect.slug, effect.type)
      : undefined;

  if (disablePopover) {
    return (
      <Badge
        variant="light"
        color={effectColor}
        size="sm"
        component="span"
        style={RICH_TEXT_BADGE_STYLE}
      >
        {label}
      </Badge>
    );
  }

  return (
    <IconBadge
      label={label}
      color={effectColor}
      size="sm"
      iconSrc={iconSrc}
      component="span"
      popoverContent={
        <Stack gap="xs" maw={POPOVER_BADGE_WIDTH}>
          <Group gap="xs" wrap="nowrap">
            <SafeImage
              src={iconSrc}
              alt={effect.name}
              w={IMAGE_SIZE.ICON_LG}
              h={IMAGE_SIZE.ICON_LG}
            />
            <Text fw={600} size="sm">
              {effect.name}
            </Text>
            <Badge variant="light" color={effectColor} size="xs">
              {effect.type}
            </Badge>
          </Group>
          <RichText
            text={effect.effect}
            statusEffects={statusEffects}
            disablePopovers
          />
          {effect.remark && (
            <Text
              size="xs"
              c="dimmed"
              fs="italic"
              style={WHITE_SPACE_PRE_LINE_STYLE}
            >
              {effect.remark}
            </Text>
          )}
        </Stack>
      }
    />
  );
}

export default function RichText({
  text,
  statusEffects,
  skills,
  talent,
  onSkillClick,
  onTalentClick,
  italic = false,
  lineHeight,
  color,
  disablePopovers,
}: RichTextProps) {
  const segments = splitEffectRefs(text);
  const { resources } = useContext(ResourcesContext);
  const { accent } = useGradientAccent();
  const talentLines = talent?.talent_levels.map(
    (level) => `Level ${level.level}: ${level.effect}`,
  );

  return (
    <Text
      size="sm"
      c={color}
      fs={italic ? 'italic' : undefined}
      component="span"
      style={{ whiteSpace: 'pre-line', lineHeight }}
    >
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <span key={i}>{seg.content}</span>;
        }

        if (seg.type === 'italic') {
          return <em key={i}>{seg.content}</em>;
        }

        if (seg.type === 'percentRange') {
          return (
            <Text
              key={i}
              component="span"
              size="sm"
              c="var(--dt-rich-range)"
              fw={600}
            >
              {seg.content}
            </Text>
          );
        }

        if (seg.type === 'percent') {
          return (
            <Text
              key={i}
              component="span"
              size="sm"
              c="var(--dt-rich-percent)"
              fw={600}
            >
              {seg.content}
            </Text>
          );
        }

        if (seg.type === 'number') {
          return (
            <Text
              key={i}
              component="span"
              size="sm"
              c="var(--dt-rich-number)"
              fw={600}
            >
              {seg.content}
            </Text>
          );
        }

        if (seg.type === 'statusRef') {
          return (
            <StatusEffectBadge
              key={i}
              slug={seg.name}
              statusEffects={statusEffects}
              disablePopover={disablePopovers}
            />
          );
        }

        const skill = findByName(skills, seg.name);
        if (skill) {
          if (onSkillClick) {
            return (
              <Badge
                key={i}
                variant="light"
                color={accent.secondary}
                size="sm"
                component="button"
                type="button"
                aria-label={`Go to skill ${skill.name}`}
                style={{ ...RICH_TEXT_BADGE_STYLE, ...CURSOR_POINTER_STYLE }}
                onClick={() => onSkillClick(skill.name)}
              >
                {seg.name}
              </Badge>
            );
          }
          return (
            <ReferenceBadge
              key={i}
              name={skill.name}
              displayName={seg.name}
              label="Skill"
              color={accent.secondary}
              description={skill.description}
              disablePopovers={disablePopovers}
            />
          );
        }

        if (talent && normalizeName(talent.name) === normalizeName(seg.name)) {
          if (onTalentClick) {
            return (
              <Badge
                key={i}
                variant="light"
                color={accent.tertiary}
                size="sm"
                component="button"
                type="button"
                aria-label={`Go to talent ${talent.name}`}
                style={{ ...RICH_TEXT_BADGE_STYLE, ...CURSOR_POINTER_STYLE }}
                onClick={onTalentClick}
              >
                {seg.name}
              </Badge>
            );
          }
          return (
            <ReferenceBadge
              key={i}
              name={talent.name}
              displayName={seg.name}
              label="Talent"
              color={accent.tertiary}
              lines={talentLines}
              disablePopovers={disablePopovers}
            />
          );
        }

        const resource = resources.find(
          (r) => normalizeName(r.name) === normalizeName(seg.name),
        );
        if (resource) {
          return (
            <ResourceBadge
              key={i}
              slug={resource.slug}
              displayName={seg.name}
            />
          );
        }

        return (
          <Badge
            key={i}
            variant="light"
            color="gray"
            size="sm"
            component="span"
            style={RICH_TEXT_BADGE_STYLE}
          >
            {seg.name}
          </Badge>
        );
      })}
    </Text>
  );
}
