import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { getPublishedPriceLists } from '@/lib/priceLists';
import PriceListView, { type ListedPhase } from './PriceListView';

// Lists are added and edited in the admin panel, so each request reads the current set.
export const dynamic = 'force-dynamic';

export const metadata = createPageMetadata({
  title: 'Vastu Vihar Price Lists by City & Project Phase',
  description: 'Check current Vastu Vihar bungalow and flat price lists by city and project phase, with unit areas, payment schedules and validity dates.',
  path: '/price-list/',
});

export default async function PriceListPage() {
  const lists = await getPublishedPriceLists();
  const listed: ListedPhase[] = lists
    .filter((list) => list.state && list.city)
    .map((list) => ({
      state: list.state as string,
      city: list.city as string,
      name: list.phaseLabel || list.projectName,
      link: `/price-list/${list.slug}/`,
    }));

  return (
    <>
      <PriceListView listed={listed} />
      <BreadcrumbJsonLd items={[{ name: 'Price List' }]} />
    </>
  );
}
