import { ActionIcon, Button, Tooltip } from '@mantine/core';
import { IoBugOutline } from 'react-icons/io5';
import { useGradientAccent, useIsMobile } from '@/hooks';
import { buildIssueUrl } from '@/utils/github-issues';

export default function DataCorrectionButton({
  entityType,
}: {
  entityType: string;
}) {
  const { accent } = useGradientAccent();
  const isMobile = useIsMobile();
  const report = () => {
    const pageUrl = window.location.href;
    const issueUrl = buildIssueUrl({
      title: `[Data] Incorrect ${entityType} data`,
      labels: 'data-correction',
      body: `**Page:** ${pageUrl}\n\n**What is incorrect?**\n\n\n**What should it be?**\n\n`,
    });
    window.open(issueUrl, '_blank', 'noopener,noreferrer');
  };
  // Same size as the neighbouring Export button, but subtle: a secondary action.
  return isMobile ? (
    <Tooltip label="Report issue">
      <ActionIcon
        variant="subtle"
        color={accent.primary}
        size="lg"
        onClick={report}
        aria-label="Report issue"
      >
        <IoBugOutline size={16} />
      </ActionIcon>
    </Tooltip>
  ) : (
    <Button
      variant="subtle"
      color={accent.primary}
      size="xs"
      leftSection={<IoBugOutline size={16} />}
      onClick={report}
    >
      Report issue
    </Button>
  );
}
