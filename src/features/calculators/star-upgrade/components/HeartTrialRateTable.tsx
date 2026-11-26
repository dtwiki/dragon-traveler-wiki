import { Table } from '@mantine/core';
import { QUALITY_ICON_MAP } from '@/assets';
import SafeImage from '@/components/ui/SafeImage';

const SWEEP_RATES = [
  {
    quality: 'SSR EX',
    sweeps: 2,
    shards: '1 (2 at Affection 20)',
  },
  { quality: 'SSR+', sweeps: 3, shards: '3' },
  { quality: 'SSR', sweeps: 3, shards: '6' },
  { quality: 'SR', sweeps: 3, shards: '15' },
] as const;

export default function HeartTrialRateTable() {
  return (
    <Table withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th ta="center">Quality</Table.Th>
          <Table.Th ta="center">Sweeps/day</Table.Th>
          <Table.Th ta="center">Shards/day</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {SWEEP_RATES.map((rate) => (
          <Table.Tr key={rate.quality}>
            <Table.Td>
              <SafeImage
                src={QUALITY_ICON_MAP[rate.quality]}
                alt={rate.quality}
                h={20}
                fit="contain"
              />
            </Table.Td>
            <Table.Td ta="center">{rate.sweeps}</Table.Td>
            <Table.Td ta="center">{rate.shards}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
