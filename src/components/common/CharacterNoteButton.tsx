import { ActionIcon, Popover, Textarea, Tooltip } from '@mantine/core';
import { memo, useEffect, useRef, useState, type CSSProperties } from 'react';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { GLASS, getGlassStyles } from '@/constants/glass';
import { useDarkMode, useGradientAccent, useMobileTooltip } from '@/hooks';

interface CharacterNoteButtonProps {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  style?: CSSProperties;
}

function CharacterNoteButton({
  value,
  onCommit,
  placeholder = 'Add note...',
  style,
}: CharacterNoteButtonProps) {
  const { accent } = useGradientAccent();
  const isDark = useDarkMode();
  const mobileTooltip = useMobileTooltip();
  const [opened, setOpened] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasNote = value.trim().length > 0;

  useEffect(() => {
    if (!opened) return;
    const frameId = window.requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      try {
        textarea.focus({ preventScroll: true });
      } catch {
        textarea.focus();
      }
      const cursor = textarea.value.length;
      textarea.setSelectionRange(cursor, cursor);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [opened]);

  function commitAndClose() {
    if (draftValue !== value) {
      onCommit(draftValue);
    }
    setOpened(false);
  }

  return (
    <Popover
      opened={opened}
      onChange={(nextOpened) => {
        if (nextOpened) {
          setDraftValue(value);
        }
        setOpened(nextOpened);
      }}
      position="bottom-end"
      withArrow
      shadow="md"
      withinPortal
      zIndex={400}
      offset={6}
      // Bound against the document instead of the narrow scrollable pool column.
      middlewares={{
        shift: { boundary: document.body },
        flip: { boundary: document.body },
      }}
    >
      <Popover.Target>
        <div style={style}>
          <Tooltip label={value ? 'Edit note' : 'Add note'} {...mobileTooltip}>
            <ActionIcon
              size="sm"
              radius="md"
              variant="filled"
              color={hasNote ? accent.primary : accent.secondary}
              className="dt-note-btn"
              style={
                {
                  '--dt-note-bg': hasNote
                    ? `linear-gradient(135deg, var(--mantine-primary-color-6) 0%, var(--mantine-color-${accent.secondary}-6) 100%)`
                    : 'var(--mantine-color-body)',
                  '--dt-note-hover-bg': hasNote
                    ? `linear-gradient(135deg, var(--mantine-primary-color-7) 0%, var(--mantine-color-${accent.secondary}-7) 100%)`
                    : 'var(--mantine-color-default-hover)',
                  '--dt-note-color': hasNote
                    ? 'var(--mantine-color-white)'
                    : 'var(--mantine-primary-color-filled)',
                  '--dt-note-border': hasNote
                    ? '1px solid var(--mantine-primary-color-4)'
                    : '1px solid var(--mantine-color-default-border)',
                  '--dt-note-shadow': hasNote
                    ? 'var(--mantine-shadow-sm)'
                    : 'var(--mantine-shadow-xs)',
                  '--dt-note-hover-shadow': hasNote
                    ? 'var(--mantine-shadow-md)'
                    : 'var(--mantine-shadow-sm)',
                  '--dt-note-blur': `blur(${GLASS.BLUR_SUBTLE})`,
                  opacity: opened ? 1 : 0.97,
                  transform: opened ? 'scale(1.04)' : undefined,
                } as CSSProperties
              }
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!opened) {
                  setDraftValue(value);
                }
                setOpened((prev) => !prev);
              }}
              aria-label={value ? 'Edit note' : 'Add note'}
            >
              <IoDocumentTextOutline size={12} />
            </ActionIcon>
          </Tooltip>
        </div>
      </Popover.Target>
      <Popover.Dropdown
        p="xs"
        style={{
          ...getGlassStyles(isDark),
          boxShadow: 'var(--mantine-shadow-md)',
        }}
      >
        <Textarea
          ref={textareaRef}
          size="xs"
          placeholder={placeholder}
          value={draftValue}
          onChange={(e) => setDraftValue(e.currentTarget.value)}
          onBlur={commitAndClose}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setDraftValue(value);
              setOpened(false);
            }
          }}
          autosize
          minRows={1}
          maxRows={3}
          styles={{
            input: {
              minWidth: 180,
              maxWidth: 220,
              lineHeight: 1.35,
              borderColor: draftValue
                ? 'var(--mantine-primary-color-4)'
                : 'var(--mantine-color-default-border)',
              backgroundColor: 'var(--mantine-color-body)',
              opacity: draftValue ? 1 : 0.9,
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
            },
          }}
        />
      </Popover.Dropdown>
    </Popover>
  );
}

export default memo(CharacterNoteButton);
