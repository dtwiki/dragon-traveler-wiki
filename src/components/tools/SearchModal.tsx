import SafeImage from '@/components/ui/SafeImage';
import { IMAGE_SIZE, TRANSITION } from '@/constants/ui';
import { SearchDataContext, SearchDataProvider } from '@/contexts';
import CharacterPortrait from '@/features/characters/components/CharacterPortrait';
import {
  clearRecentSearches,
  loadRecentSearches,
  saveRecentSearch,
} from '@/features/search/recent-searches';
import {
  buildSearchRegistry,
  MAX_SEARCH_RESULTS,
  SEARCH_CATEGORY_LABELS,
  searchRegistry,
  type SearchResult,
} from '@/features/search/search-registry';
import { useGradientAccent, useIsMobile, useMobileTooltip } from '@/hooks';
import { OPEN_GLOBAL_SEARCH_EVENT } from '@/utils/global-search-events';
import {
  ActionIcon,
  Alert,
  Box,
  Group,
  Kbd,
  Modal,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure, useHotkeys } from '@mantine/hooks';
import type { ReactNode } from 'react';
import {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { IconType } from 'react-icons';
import { IoArrowBack, IoClose, IoSearch, IoTimeOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router';

interface SearchModalProps {
  trigger?: (props: { open: () => void }) => ReactNode;
  enableHotkeys?: boolean;
  initiallyOpened?: boolean;
}

function SearchModalContent({
  trigger,
  enableHotkeys = true,
  initiallyOpened = false,
}: SearchModalProps) {
  const [opened, { open, close }] = useDisclosure(initiallyOpened);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 150);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    loadRecentSearches(),
  );
  const resultRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const navigate = useNavigate();
  const { accent } = useGradientAccent();
  const isMobile = useIsMobile();
  const mobileTooltip = useMobileTooltip();
  const searchData = useContext(SearchDataContext);
  const { loading, errors } = searchData;
  const isSearchPending = query.trim() !== debouncedQuery.trim();
  const registry = useMemo(() => buildSearchRegistry(searchData), [searchData]);

  const searchShortcutHint = 'Search (/)';

  useHotkeys(
    enableHotkeys
      ? [
          [
            '/',
            (e) => {
              e.preventDefault();
              open();
            },
          ],
        ]
      : [],
  );

  const searchResults = useMemo(
    () => searchRegistry(registry, debouncedQuery),
    [debouncedQuery, registry],
  );
  const activeSelectedIndex = searchResults.length
    ? Math.min(selectedIndex, searchResults.length - 1)
    : 0;

  useEffect(() => {
    if (!opened || isSearchPending) return;
    resultRefs.current[activeSelectedIndex]?.scrollIntoView({
      block: 'nearest',
    });
  }, [activeSelectedIndex, isSearchPending, opened]);

  const handleSelect = (result: SearchResult) => {
    if (query.trim()) {
      setRecentSearches((prev) => saveRecentSearch(query, prev));
    }
    navigate(result.path);
    handleClose();
  };

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery);
    setSelectedIndex(0);
  };

  const handleClose = () => {
    close();
    handleQueryChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isSearchPending || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(
        (i) => (i - 1 + searchResults.length) % searchResults.length,
      );
    } else if (e.key === 'Enter' && searchResults[activeSelectedIndex]) {
      e.preventDefault();
      handleSelect(searchResults[activeSelectedIndex]);
    }
  };

  useEffect(() => {
    window.addEventListener(OPEN_GLOBAL_SEARCH_EVENT, open);
    return () => window.removeEventListener(OPEN_GLOBAL_SEARCH_EVENT, open);
  }, [open]);

  return (
    <>
      {trigger ? (
        trigger({ open })
      ) : (
        <Tooltip
          label={searchShortcutHint}
          {...mobileTooltip}
          position="bottom"
        >
          <ActionIcon
            variant="default"
            color={accent.primary}
            size="lg"
            onClick={open}
            aria-label={searchShortcutHint}
            aria-haspopup="dialog"
          >
            <IoSearch size={IMAGE_SIZE.ICON_LG} />
          </ActionIcon>
        </Tooltip>
      )}

      <Modal
        opened={opened}
        onClose={handleClose}
        title={null}
        size={isMobile ? '100%' : '600px'}
        fullScreen={isMobile}
        padding={0}
        withCloseButton={false}
        centered
        radius="md"
        removeScrollProps={{ removeScrollBar: false }}
        styles={{
          body: { padding: 0 },
          content: {
            overflow: 'hidden',
          },
          inner: {
            padding: isMobile ? 0 : '0 16px',
          },
        }}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Box>
          <Box
            px="md"
            py={isMobile ? 'sm' : 'md'}
            style={{
              borderBottom: '1px solid var(--mantine-color-default-border)',
            }}
          >
            <TextInput
              role="combobox"
              aria-autocomplete="list"
              aria-controls="global-search-results"
              aria-expanded={!isSearchPending && searchResults.length > 0}
              aria-activedescendant={
                !isSearchPending && searchResults[activeSelectedIndex]
                  ? `global-search-result-${activeSelectedIndex}`
                  : undefined
              }
              placeholder="Search all wiki content..."
              value={query}
              onChange={(e) => handleQueryChange(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              leftSection={
                <IoSearch
                  size={IMAGE_SIZE.ICON_LG}
                  color={`var(--mantine-color-${accent.primary}-6)`}
                />
              }
              rightSection={
                isMobile ? (
                  <Group gap={4} wrap="nowrap">
                    {query && (
                      <ActionIcon
                        variant="subtle"
                        onClick={() => handleQueryChange('')}
                        size="md"
                        color="gray"
                        aria-label="Clear search"
                      >
                        <IoClose size={16} />
                      </ActionIcon>
                    )}
                    <ActionIcon
                      variant="subtle"
                      onClick={handleClose}
                      size="md"
                      color="gray"
                      aria-label="Close search"
                    >
                      <IoArrowBack size={16} />
                    </ActionIcon>
                  </Group>
                ) : query ? (
                  <ActionIcon
                    variant="subtle"
                    onClick={() => handleQueryChange('')}
                    size="sm"
                    color="gray"
                    aria-label="Clear search"
                  >
                    <IoClose size={16} />
                  </ActionIcon>
                ) : (
                  <Kbd size="sm">/</Kbd>
                )
              }
              rightSectionWidth={isMobile ? (query ? 72 : 40) : query ? 34 : 24}
              styles={{
                input: {
                  border: 'none',
                  fontSize: 'var(--mantine-font-size-md)',
                },
              }}
              autoFocus
              size={isMobile ? 'lg' : 'md'}
            />
          </Box>

          {query && (loading || isSearchPending) && (
            <Box p={isMobile ? 'lg' : 'xl'} ta="center" role="status">
              <Text c="dimmed" size="sm">
                Searching…
              </Text>
            </Box>
          )}

          {query && !loading && errors.length > 0 && (
            <Box px="md" pt="xs" role="status">
              <Alert color="orange" variant="light" py="xs" px="sm">
                <Text size="xs">
                  Some search sources could not be loaded; results may be
                  incomplete.
                </Text>
              </Alert>
            </Box>
          )}

          {query &&
            !loading &&
            !isSearchPending &&
            searchResults.length === 0 && (
              <Box p={isMobile ? 'lg' : 'xl'} ta="center">
                <Text c="dimmed" size="sm">
                  No results found for "{query}"
                </Text>
              </Box>
            )}

          {!isSearchPending && searchResults.length > 0 && (
            <>
              <Stack
                id="global-search-results"
                role="listbox"
                aria-label="Search results"
                gap={0}
                style={{
                  maxHeight: isMobile ? 'calc(100dvh - 116px)' : '500px',
                  overflowY: 'auto',
                  paddingBottom: 6,
                }}
              >
                {searchResults.map((result, index) => {
                  const isSelected = index === activeSelectedIndex;
                  const isNewCategory =
                    index === 0 ||
                    searchResults[index - 1].type !== result.type;
                  const isCharacterResult = result.type === 'character';
                  const isPortraitResult =
                    result.type === 'character' || result.type === 'wyrm';
                  const rowMinHeight = isMobile ? 56 : 52;
                  const showEnterHint = isSelected && !isMobile;
                  return (
                    <Fragment key={`${result.type}-${result.title}-${index}`}>
                      {isNewCategory && (
                        <Box
                          px="md"
                          pb={5}
                          pt={index === 0 ? 8 : 12}
                          style={{
                            borderTop:
                              index === 0
                                ? 'none'
                                : '1px solid var(--mantine-color-default-border)',
                          }}
                        >
                          <Text
                            size="xs"
                            c={result.color}
                            fw={600}
                            tt="uppercase"
                            style={{
                              letterSpacing: '0.04em',
                              lineHeight: 1.25,
                            }}
                          >
                            {SEARCH_CATEGORY_LABELS[result.type]}
                          </Text>
                        </Box>
                      )}
                      <UnstyledButton
                        ref={(node) => {
                          resultRefs.current[index] = node;
                        }}
                        id={`global-search-result-${index}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        py={isMobile ? 10 : 8}
                        px="md"
                        style={{
                          display: 'block',
                          width: '100%',
                          minHeight: rowMinHeight,
                          backgroundColor: isSelected
                            ? 'var(--mantine-color-default-hover)'
                            : 'transparent',
                          transition: `background-color ${TRANSITION.FAST}`,
                        }}
                      >
                        <Group wrap="nowrap" gap={isMobile ? 'sm' : 'md'}>
                          <Box
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: isPortraitResult ? '50%' : '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: isPortraitResult
                                ? 'transparent'
                                : `var(--mantine-color-${result.color}-1)`,
                              overflow: isPortraitResult ? 'visible' : 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            {isCharacterResult ? (
                              <CharacterPortrait
                                name={result.title}
                                size={36}
                                borderWidth={0}
                                routePath={result.path}
                              />
                            ) : typeof result.icon === 'string' ? (
                              <SafeImage
                                src={result.icon}
                                alt={result.title}
                                fit={isPortraitResult ? 'cover' : 'contain'}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectPosition: isPortraitResult
                                    ? 'top center'
                                    : 'center',
                                  padding: isPortraitResult ? 0 : 4,
                                }}
                              />
                            ) : (
                              (() => {
                                const Icon = result.icon as IconType;
                                return (
                                  <Icon
                                    size={20}
                                    color={`var(--mantine-color-${result.color}-6)`}
                                  />
                                );
                              })()
                            )}
                          </Box>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text
                              size="sm"
                              fw={500}
                              truncate
                              style={{ lineHeight: 1.2 }}
                            >
                              {result.title}
                            </Text>
                            <Text
                              size="xs"
                              c="dimmed"
                              truncate
                              style={{
                                visibility: result.subtitle
                                  ? 'visible'
                                  : 'hidden',
                                lineHeight: 1.2,
                                marginTop: 2,
                              }}
                            >
                              {result.subtitle ?? '\u00a0'}
                            </Text>
                          </div>
                          <Text
                            size="xs"
                            c="dimmed"
                            style={{
                              visibility: showEnterHint ? 'visible' : 'hidden',
                              width: isMobile ? 0 : 28,
                              flexShrink: 0,
                            }}
                          >
                            {!isMobile && <Kbd size="xs">↵</Kbd>}
                          </Text>
                        </Group>
                      </UnstyledButton>
                    </Fragment>
                  );
                })}
              </Stack>
              {searchResults.length === MAX_SEARCH_RESULTS && (
                <Box
                  py="xs"
                  ta="center"
                  style={{
                    borderTop: '1px solid var(--mantine-color-default-border)',
                  }}
                >
                  <Text size="xs" c="dimmed">
                    Showing top {MAX_SEARCH_RESULTS} results · try a more
                    specific search
                  </Text>
                </Box>
              )}
            </>
          )}

          {!query && (
            <Stack p={isMobile ? 'lg' : 'xl'} gap="md">
              <Text size="xs" c="dimmed" ta="center">
                Search characters, gear, codes, wyrms, and more…
              </Text>
              {recentSearches.length > 0 && (
                <Stack gap={0}>
                  <Group justify="space-between" align="center" mb={4}>
                    <Text
                      size="xs"
                      fw={600}
                      c="dimmed"
                      tt="uppercase"
                      style={{ letterSpacing: '0.04em' }}
                    >
                      Recent
                    </Text>
                    <UnstyledButton
                      onClick={() => {
                        setRecentSearches([]);
                        try {
                          clearRecentSearches();
                        } catch {
                          /* ignore */
                        }
                      }}
                      style={{
                        color: 'var(--mantine-color-dimmed)',
                        fontSize: 'var(--mantine-font-size-xs)',
                      }}
                    >
                      Clear
                    </UnstyledButton>
                  </Group>
                  {recentSearches.map((term) => (
                    <UnstyledButton
                      key={term}
                      onClick={() => handleQueryChange(term)}
                      py={8}
                      px="xs"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        borderRadius: 'var(--mantine-radius-sm)',
                        width: '100%',
                      }}
                      className="dt-hover-row"
                    >
                      <IoTimeOutline
                        size={14}
                        color="var(--mantine-color-dimmed)"
                        style={{ flexShrink: 0 }}
                      />
                      <Text size="sm" c="dimmed" truncate style={{ flex: 1 }}>
                        {term}
                      </Text>
                    </UnstyledButton>
                  ))}
                </Stack>
              )}
              <Group justify="center" gap="xs">
                <Text size="xs" c="dimmed">
                  Navigate with
                </Text>
                <Kbd size="xs">↑</Kbd>
                <Kbd size="xs">↓</Kbd>
              </Group>
            </Stack>
          )}
        </Box>
      </Modal>
    </>
  );
}

export default function SearchModal(props: SearchModalProps) {
  return (
    <SearchDataProvider>
      <SearchModalContent {...props} />
    </SearchDataProvider>
  );
}
