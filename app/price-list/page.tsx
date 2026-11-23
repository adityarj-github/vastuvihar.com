import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { createPageMetadata } from '@/lib/metadata';
import { getCities } from '@/lib/priceListCities';
import { getAllPriceLists } from '@/lib/priceLists';
import { statesInOrder } from '@/lib/priceListTypes';
import PriceListView, { type StateGroup } from './PriceListView';

// Cities and lists are managed in the admin panel, so each request reads the current set.
export const dynamic = 'force-dynamic';

export const metadata = createPageMetadata({
  title: 'Vastu Vihar Price Lists by City & Project Phase',
  description: 'Check current Vastu Vihar bungalow and flat price lists by city and project phase, with unit areas, payment schedules and validity dates.',
  path: '/price-list/',
});

export default async function PriceListPage() {
  const [cities, entries] = await Promise.all([getCities(), getAllPriceLists()]);
  const shown = cities.filter((city) => city.isActive);
  // Entries are already in the admin's display order, so phases keep that order.
  const active = entries.filter((entry) => entry.status === 'active' && entry.citySlug);

  const groups: StateGroup[] = statesInOrder(shown).map((state) => ({
    state,
    cities: shown
      .filter((city) => city.state === state)
      .map((city) => ({
        name: city.name,
        phases: active
          .filter((entry) => entry.citySlug === city.slug)
          .map((entry) => ({
            name: entry.project.phaseLabel || entry.project.projectName,
            link: `/price-list/${entry.project.slug}/`,
          })),
      })),
  }));

  return (
    <>
      <PriceListView groups={groups} />
      <BreadcrumbJsonLd items={[{ name: 'Price List' }]} />
    </>
  );
}
