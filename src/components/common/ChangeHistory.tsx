import {
  Badge,
  Box,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useMemo } from 'react';
import {
  IoAddCircleOutline,
  IoCalendarOutline,
  IoRemoveCircleOutline,
  IoTimeOutline,
} from 'react-icons/io5';
import {
  getPageSizeStorageKey,
  usePageSize,
  usePagination,
} from '@/hooks/use-pagination';
import type {
  ChangeRecord,
  EntityChangeHistory,
  FieldDiff,
} from '@/types/changes';
import { formatExactDate, formatShortDate } from '@/utils';
import { isRecord } from '@/utils/type-guards';
import CollapsibleSectionCard from '@/components/ui/CollapsibleSectionCard';
import PaginationControl from '@/components/ui/PaginationControl';

const PAGE_SIZE = 5;
const CHANGE_HISTORY_PAGE_SIZE_OPTIONS = [5, 10, 20, 30] as const;

interface LabeledHistory {
  label: string;
  history: EntityChangeHistory;
}

interface ChangeHistoryProps {
  history: EntityChangeHistory | undefined;
  extraHistories?: LabeledHistory[];
}

interface MergedRecord {
  label: string | null;
  record: ChangeRecord;
}

function formatDiffValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

const FIELD_DIFF_KEYS = new Set([
  'old',
  'new',
  'added',
  'removed',
  'modified',
  'changed',
]);

function isFieldDiff(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  return Object.keys(value).some((k) => FIELD_DIFF_KEYS.has(k));
}

function extractNestedDiffDetails(value: unknown, pathPrefix = ''): string[] {
  if (!isRecord(value)) return [];

  // Scalar diff: { old, new }
  if ('old' in value || 'new' in value) {
    const oldVal = value.old;
    const newVal = value.new;
    const label = pathPrefix || 'Value';
    if (oldVal !== undefined && newVal !== undefined) {
      return [
        `${label}: ${formatDiffValue(oldVal)} → ${formatDiffValue(newVal)}`,
      ];
    }
    if (newVal !== undefined)
      return [`${label}: Added ${formatDiffValue(newVal)}`];
    if (oldVal !== undefined)
      return [`${label}: Removed ${formatDiffValue(oldVal)}`];
    return [];
  }

  // Array diff: { added, removed, modified, changed } at this level
  if (isFieldDiff(value)) {
    return extractFieldDiffDetails(
      value as Record<string, unknown>,
      pathPrefix,
    );
  }

  // Nested dict: { subkey: <FieldDiff or nested dict> }
  const details: string[] = [];
  for (const [key, nested] of Object.entries(value)) {
    const nextPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    details.push(...extractNestedDiffDetails(nested, nextPath));
  }
  return details;
}

function extractFieldDiffDetails(
  diff: Record<string, unknown>,
  pathPrefix = '',
): string[] {
  const details: string[] = [];
  const label = pathPrefix || '';

  const added = diff.added as string[] | undefined;
  const removed = diff.removed as string[] | undefined;
  const modified = diff.modified as
    string[] | Record<string, unknown> | undefined;
  const changed = diff.changed as
    Record<string, { old: unknown; new: unknown }> | undefined;

  if (added?.length) details.push(`Added: ${added.join(', ')}`);
  if (removed?.length) details.push(`Removed: ${removed.join(', ')}`);

  if (modified) {
    if (Array.isArray(modified) && modified.length) {
      details.push(`Updated: ${modified.join(', ')}`);
    } else if (isRecord(modified)) {
      const updatedItems = Object.keys(modified);
      if (updatedItems.length > 0) {
        details.push(`Updated: ${updatedItems.join(', ')}`);
        for (const [itemKey, nested] of Object.entries(modified)) {
          const nextPath = label ? `${label}.${itemKey}` : itemKey;
          details.push(...extractNestedDiffDetails(nested, nextPath));
        }
      }
    }
  }

  if (changed) {
    for (const [key, value] of Object.entries(changed)) {
      const keyLabel = label ? `${label}.${key}` : key;
      details.push(
        `${keyLabel}: ${formatDiffValue(value.old)} → ${formatDiffValue(value.new)}`,
      );
    }
  }

  return details;
}

function renderDetailLine(fieldName: string, detail: string, index: number) {
  const key = `${fieldName}-${index}`;

  // "Added: items" → green
  const addedMatch = detail.match(/^Added:\s*(.+)$/);
  if (addedMatch) {
    return (
      <Text
        key={key}
        size="xs"
        c="green"
        mt={2}
        style={{ wordBreak: 'break-word' }}
      >
        + {addedMatch[1]}
      </Text>
    );
  }

  // "Removed: items" → red
  const removedMatch = detail.match(/^Removed:\s*(.+)$/);
  if (removedMatch) {
    return (
      <Text
        key={key}
        size="xs"
        c="red"
        mt={2}
        style={{ wordBreak: 'break-word' }}
      >
        − {removedMatch[1]}
      </Text>
    );
  }

  // "Updated: items" — section header for modified sub-items, keep subtle
  const updatedMatch = detail.match(/^Updated:\s*(.+)$/);
  if (updatedMatch) {
    return (
      <Text key={key} size="xs" c="dimmed" fs="italic" mt={2}>
        {updatedMatch[1]}
      </Text>
    );
  }

  // "label: old → new" or "old → new" → red/green split
  if (detail.includes(' → ')) {
    const arrowIdx = detail.indexOf(' → ');
    const before = detail.slice(0, arrowIdx);
    const after = detail.slice(arrowIdx + 3);
    const colonIdx = before.indexOf(': ');
    if (colonIdx !== -1) {
      const label = before.slice(0, colonIdx);
      const oldVal = before.slice(colonIdx + 2);
      return (
        <Box key={key} mt={2}>
          <Text size="xs" c="dimmed">
            {label}:
          </Text>
          <Text size="xs" c="red" style={{ wordBreak: 'break-word' }}>
            − {oldVal}
          </Text>
          <Text size="xs" c="green" style={{ wordBreak: 'break-word' }}>
            + {after}
          </Text>
        </Box>
      );
    }
    return (
      <Box key={key} mt={2}>
        <Text size="xs" c="red" style={{ wordBreak: 'break-word' }}>
          − {before}
        </Text>
        <Text size="xs" c="green" style={{ wordBreak: 'break-word' }}>
          + {after}
        </Text>
      </Box>
    );
  }

  // "label: Added value" / "label: Removed value" from nested diff paths
  const labelAddedMatch = detail.match(/^(.+?):\s*Added\s+(.+)$/);
  if (labelAddedMatch) {
    return (
      <Box key={key} mt={2}>
        <Text size="xs" c="dimmed">
          {labelAddedMatch[1]}:
        </Text>
        <Text size="xs" c="green" style={{ wordBreak: 'break-word' }}>
          + {labelAddedMatch[2]}
        </Text>
      </Box>
    );
  }

  const labelRemovedMatch = detail.match(/^(.+?):\s*Removed\s+(.+)$/);
  if (labelRemovedMatch) {
    return (
      <Box key={key} mt={2}>
        <Text size="xs" c="dimmed">
          {labelRemovedMatch[1]}:
        </Text>
        <Text size="xs" c="red" style={{ wordBreak: 'break-word' }}>
          − {labelRemovedMatch[2]}
        </Text>
      </Box>
    );
  }

  // Fallback
  return (
    <Text key={key} size="xs" c="dimmed" mt={2}>
      {detail}
    </Text>
  );
}

function LifecycleEvent({
  record,
  label,
}: {
  record: ChangeRecord;
  label: string | null;
}) {
  const isRemoved = record.type === 'removed';
  const color = isRemoved ? 'red' : 'teal';
  const Icon = isRemoved ? IoRemoveCircleOutline : IoAddCircleOutline;
  const text = isRemoved ? 'Removed' : 'Re-added';

  return (
    <Group gap="xs" align="flex-start" wrap="nowrap">
      <Icon size={14} color={`var(--mantine-color-${color}-6)`} />
      <Stack gap={0}>
        <Group gap={6} wrap="wrap">
          <Text size="sm" fw={700} c={`${color}.6`}>
            {text}
          </Text>
          {label && (
            <Text size="xs" c="dimmed">
              • {label}
            </Text>
          )}
        </Group>
        <Text size="xs" c="dimmed">
          {formatShortDate(record.timestamp)}
        </Text>
        <Text size="xs" c="dimmed">
          {formatExactDate(record.timestamp)}
        </Text>
      </Stack>
    </Group>
  );
}

function summarizeFieldDiff(diff: FieldDiff): {
  kind: string;
  details: string[];
} {
  // Handle scalar diff
  if (diff.old !== undefined || diff.new !== undefined) {
    const details: string[] = [];
    if (diff.old !== undefined && diff.new !== undefined) {
      details.push(
        `${formatDiffValue(diff.old)} → ${formatDiffValue(diff.new)}`,
      );
    } else if (diff.new !== undefined) {
      details.push(`Added: ${formatDiffValue(diff.new)}`);
    } else if (diff.old !== undefined) {
      details.push(`Removed: ${formatDiffValue(diff.old)}`);
    }
    const kind =
      diff.old === undefined
        ? 'Added'
        : diff.new === undefined
          ? 'Removed'
          : 'Updated';
    return { kind, details };
  }

  // Handle array/object diff (added/removed/modified/changed)
  if (isFieldDiff(diff as unknown as Record<string, unknown>)) {
    const details = extractFieldDiffDetails(
      diff as unknown as Record<string, unknown>,
    );
    if (details.length > 0) {
      const hasAdd = !!diff.added?.length;
      const hasRemove = !!diff.removed?.length;
      const hasUpdate = !!(diff.modified || diff.changed);
      const kind =
        hasAdd && !hasRemove && !hasUpdate
          ? 'Added'
          : !hasAdd && hasRemove && !hasUpdate
            ? 'Removed'
            : 'Updated';
      return { kind, details };
    }
  }

  // Nested dict: { subkey: <FieldDiff or nested> } — not a direct FieldDiff
  const diffRecord = diff as unknown as Record<string, unknown>;
  const details: string[] = [];
  for (const [key, nested] of Object.entries(diffRecord)) {
    details.push(...extractNestedDiffDetails(nested, key));
  }

  if (details.length === 0) {
    return { kind: 'Updated', details: ['Value changed'] };
  }
  return { kind: 'Updated', details };
}

export function ChangeRecordCard({
  record,
  label,
}: {
  record: ChangeRecord;
  label?: string | null;
}) {
  const { fields } = record;
  if (!fields) return null;
  const fieldNames = Object.keys(fields);
  if (fieldNames.length === 0) return null;

  const KIND_COLOR: Record<string, string> = {
    Added: 'green',
    Removed: 'red',
    Updated: 'blue',
  };

  return (
    <Paper p="sm" withBorder radius="md">
      <Stack gap="xs">
        <Group
          justify="space-between"
          align="flex-start"
          gap="sm"
          wrap="nowrap"
        >
          <Group gap="xs" align="flex-start" wrap="nowrap">
            <IoTimeOutline size={13} color="var(--mantine-color-dimmed)" />
            <Stack gap={0}>
              <Text size="sm" fw={600}>
                {formatShortDate(record.timestamp)}
              </Text>
              <Text size="xs" c="dimmed">
                {formatExactDate(record.timestamp)}
              </Text>
            </Stack>
          </Group>
          <Text size="xs" c="dimmed" ta="right">
            {fieldNames.length} field{fieldNames.length !== 1 ? 's' : ''}
            {label ? ` • ${label}` : ''}
          </Text>
        </Group>

        <Stack gap={6}>
          {fieldNames.map((fieldName) => {
            const diff = fields[fieldName];
            const summary = summarizeFieldDiff(diff);
            const kindColor = KIND_COLOR[summary.kind];

            return (
              <Paper
                key={fieldName}
                p="xs"
                withBorder
                radius="sm"
                bg="var(--mantine-color-default)"
              >
                <Group
                  justify="space-between"
                  align="center"
                  gap="sm"
                  wrap="nowrap"
                  mb={summary.details.length ? 4 : 0}
                >
                  <Text size="xs" fw={600} ff="monospace" c="dimmed">
                    {fieldName}
                  </Text>
                  <Badge
                    size="xs"
                    variant="dot"
                    color={kindColor}
                    tt="capitalize"
                  >
                    {summary.kind}
                  </Badge>
                </Group>
                {summary.details.map((detail, index) =>
                  renderDetailLine(fieldName, detail, index),
                )}
              </Paper>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function ChangeHistory({
  history,
  extraHistories,
}: ChangeHistoryProps) {
  const hasExtras = extraHistories && extraHistories.length > 0;

  const sorted = useMemo(() => {
    const merged: MergedRecord[] = [];

    if (history) {
      for (const record of history.changes) {
        merged.push({ label: null, record });
      }
    }

    if (extraHistories) {
      for (const { label, history: extra } of extraHistories) {
        for (const record of extra.changes) {
          merged.push({ label, record });
        }
      }
    }

    return merged.sort((a, b) => b.record.timestamp - a.record.timestamp);
  }, [history, extraHistories]);

  const earliestAdded = useMemo(() => {
    const timestamps: number[] = [];
    if (history) timestamps.push(history.added);
    if (extraHistories) {
      for (const { history: extra } of extraHistories) {
        timestamps.push(extra.added);
      }
    }
    return timestamps.length > 0 ? Math.min(...timestamps) : null;
  }, [history, extraHistories]);

  const paginationResetKey = useMemo(() => {
    const newestTimestamp = sorted[0]?.record.timestamp ?? 0;
    const oldestTimestamp = sorted[sorted.length - 1]?.record.timestamp ?? 0;
    return `${earliestAdded ?? 0}:${sorted.length}:${newestTimestamp}:${oldestTimestamp}`;
  }, [earliestAdded, sorted]);

  const { pageSize, setPageSize, pageSizeOptions } = usePageSize(
    CHANGE_HISTORY_PAGE_SIZE_OPTIONS,
    {
      defaultSize: PAGE_SIZE,
      storageKey: getPageSizeStorageKey('change-history'),
    },
  );

  const { page, setPage, totalPages, offset } = usePagination(
    sorted.length,
    pageSize,
    paginationResetKey,
  );

  if (!history && !hasExtras) return null;

  const visible = sorted.slice(offset, offset + pageSize);

  return (
    <Box mt="xl">
      <CollapsibleSectionCard
        defaultExpanded={false}
        header={
          <Stack gap={2}>
            <Group gap="sm" align="center">
              <Title order={2} size="h3">
                Change History
              </Title>
              {sorted.length > 0 && (
                <Text size="sm" c="dimmed" fw={500}>
                  {sorted.length} update{sorted.length !== 1 ? 's' : ''}
                </Text>
              )}
            </Group>
            <Text size="xs" c="dimmed">
              Recent edits, lifecycle events, and field-level updates.
            </Text>
          </Stack>
        }
      >
        <Stack gap="md">
          {/* Added date */}
          {earliestAdded !== null && (
            <Paper p="xs" withBorder radius="md" bg="var(--mantine-color-body)">
              <Group gap="xs" align="flex-start" wrap="nowrap">
                <IoCalendarOutline
                  size={14}
                  color="var(--mantine-color-dimmed)"
                />
                <Stack gap={0}>
                  <Text size="sm" c="dimmed" fw={500}>
                    Added on {formatShortDate(earliestAdded)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatExactDate(earliestAdded)}
                  </Text>
                </Stack>
              </Group>
            </Paper>
          )}

          {sorted.length === 0 ? (
            <Text size="sm" c="dimmed" fs="italic">
              No recorded changes yet.
            </Text>
          ) : (
            <Stack gap="sm">
              {visible.map((entry, index) => (
                <Box key={`${entry.record.timestamp}-${entry.label}-${index}`}>
                  {index > 0 && <Divider mb="sm" />}
                  {entry.record.type ? (
                    <Paper
                      p="sm"
                      withBorder
                      radius="md"
                      bg="var(--mantine-color-body)"
                    >
                      <LifecycleEvent
                        record={entry.record}
                        label={entry.label}
                      />
                    </Paper>
                  ) : (
                    <ChangeRecordCard
                      record={entry.record}
                      label={entry.label}
                    />
                  )}
                </Box>
              ))}

              {totalPages > 1 && (
                <PaginationControl
                  currentPage={page}
                  totalPages={totalPages}
                  onChange={setPage}
                  totalItems={sorted.length}
                  pageSize={pageSize}
                  pageSizeOptions={pageSizeOptions}
                  onPageSizeChange={setPageSize}
                />
              )}
            </Stack>
          )}
        </Stack>
      </CollapsibleSectionCard>
    </Box>
  );
}
