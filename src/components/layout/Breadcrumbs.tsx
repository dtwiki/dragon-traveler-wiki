import { Anchor, Breadcrumbs as MantineBreadcrumbs, Text } from '@mantine/core';
import { Link } from 'react-router';
import { useEntityPageTitle } from '@/hooks';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  useEntityPageTitle(items.at(-1)?.label);

  return (
    <nav aria-label="Breadcrumb">
      <MantineBreadcrumbs mb="md" style={{ flexWrap: 'wrap' }}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (isLast || !item.path) {
            return (
              <Text
                key={index}
                size="sm"
                c="dimmed"
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </Text>
            );
          }

          return (
            <Anchor
              key={index}
              component={Link}
              to={item.path}
              size="sm"
              c="dimmed"
              underline="hover"
            >
              {item.label}
            </Anchor>
          );
        })}
      </MantineBreadcrumbs>
    </nav>
  );
}
