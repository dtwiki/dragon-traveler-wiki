import GlobalBadge from '@/components/ui/GlobalBadge';
import MachineTranslatedBadge from '@/components/ui/MachineTranslatedBadge';

const SIZE_BY_CONTEXT = { list: 'sm', detail: 'lg' } as const;

interface RegionBadgesProps {
  isGlobal?: boolean | null;
  machineTranslated?: boolean | null;
  /** `list` for cards and table rows, `detail` for page heroes. */
  context?: keyof typeof SIZE_BY_CONTEXT;
}

/**
 * Flags entries that are not on the global server yet, and machine-translated
 * text. Global entries show nothing, since global is the default.
 */
export default function RegionBadges({
  isGlobal,
  machineTranslated,
  context = 'list',
}: RegionBadgesProps) {
  const size = SIZE_BY_CONTEXT[context];
  return (
    <>
      {isGlobal === false && <GlobalBadge isGlobal={false} size={size} />}
      {machineTranslated && <MachineTranslatedBadge size={size} />}
    </>
  );
}
