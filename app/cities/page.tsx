import Link from 'next/link';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import PageLayout from '@/components/PageLayout';
import cityData from '@/data/cities.json';
import styles from './page.module.css';

// Copy your EXISTING price-list hero CSS, unchanged, into:
// app/cities/hero.module.css
import heroStyles from './hero.module.css';

export const metadata: Metadata = {
  title: 'Residential Projects by City | Vastu Vihar',
  description:
    'Browse Vastu Vihar residential projects by city and state, with project phases in Bihar, Jharkhand, Uttar Pradesh, West Bengal and Odisha.',
};

type CityRecord = {
  slug?: string;
  name?: string;
  state?: string;
  phases?: unknown[];
  // Optional: a REAL, locally stored, transparent city map SVG.
  // e.g. "/city-maps/patna.svg" (under public/city-maps/)
  mapSilhouette?: string;
};

const cityDataBySlug = cityData as Record<string, CityRecord>;

type CityGroup = { label: string; cities: readonly string[] };
type StateGroup = {
  state: string;
  slug: string;
  groups: readonly CityGroup[];
};

// Menu controls order / region headings; cities.json controls phase counts and links.
const STATE_GROUPS: readonly StateGroup[] = [
  {
    state: 'Bihar',
    slug: 'bihar',
    groups: [
      {
        label: 'South Bihar',
        cities: [
          'Patna', 'Gaya', 'Bhagalpur', 'Ara', 'Aurangabad',
          'Bihar Sharif', 'Buxar', 'Dehri-On-Sone', 'Jehanabad',
          'Munger', 'Sasaram',
        ],
      },
      {
        label: 'North Bihar',
        cities: [
          'Hajipur', 'Muzaffarpur', 'Purnia', 'Begusarai', 'Chapra',
          'Darbhanga', 'Bettiah', 'Madhubani', 'Motihari', 'Katihar',
          'Saharsa', 'Samastipur', 'Siwan', 'Sitamarhi', 'Raxaul',
        ],
      },
    ],
  },
  {
    state: 'Jharkhand',
    slug: 'jharkhand',
    groups: [{
      label: 'Jharkhand',
      cities: [
        'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro',
        'Hazaribagh', 'Deoghar', 'Giridih',
      ],
    }],
  },
  {
    state: 'Uttar Pradesh',
    slug: 'uttar-pradesh',
    groups: [{ label: 'Uttar Pradesh', cities: ['Varanasi', 'Gorakhpur', 'Mirzapur'] }],
  },
  {
    state: 'West Bengal',
    slug: 'west-bengal',
    groups: [{
      label: 'West Bengal',
      cities: ['Durgapur', 'Siliguri', 'Kolkata', 'Asansol', 'Alipurduar'],
    }],
  },
  {
    state: 'Odisha',
    slug: 'odisha',
    groups: [{ label: 'Odisha', cities: ['Bhubaneswar', 'Rourkela'] }],
  },
];

const SLUG_ALIASES: Record<string, readonly string[]> = {
  'bihar-sharif': ['biharsharif', 'bihar-sharif', 'biharsarif'],
  'dehri-on-sone': ['dehri-on-sone', 'dehri', 'dehrionsone'],
  chapra: ['chapra', 'chhapra'],
  purnia: ['purnia', 'purnea'],
};

// Faint accent tints only for the map area. The card itself remains light,
// following the existing Price List card design.
const MAP_TINTS = [
  'rgba(8, 170, 236, .13)',
  'rgba(25, 135, 179, .14)',
  'rgba(39, 165, 138, .12)',
  'rgba(66, 148, 169, .13)',
  'rgba(49, 95, 142, .12)',
] as const;

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function resolveCity(name: string) {
  const menuSlug = slugify(name);
  const possibleKeys = SLUG_ALIASES[menuSlug] ?? [menuSlug];
  const jsonKey = possibleKeys.find((key) =>
    Object.prototype.hasOwnProperty.call(cityDataBySlug, key),
  );
  const data = jsonKey ? cityDataBySlug[jsonKey] : undefined;
  const phaseCount = Array.isArray(data?.phases) ? data.phases.length : null;

  return {
    name: data?.name || name,
    slug: jsonKey || menuSlug,
    phaseCount,
    available: phaseCount !== null && phaseCount > 0,
    mapSilhouette: data?.mapSilhouette,
  };
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="13" height="13" fill="none">
      <path
        d="M5.5 18.5 18 6M8 6h10v10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// White outline pin used in the badge when a card is hovered/focused.
function BadgeLocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function LocationPinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 30" width="23" height="29" fill="none">
      <path
        d="M12 1C6.2 1 1.5 5.7 1.5 11.5c0 7.1 10.5 17.2 10.5 17.2s10.5-10.1 10.5-17.2C22.5 5.7 17.8 1 12 1Z"
        fill="#EA414C"
        stroke="rgba(255,255,255,.85)"
        strokeWidth="1.3"
      />
      <circle cx="12" cy="11.5" r="4" fill="#FFFFFF" />
    </svg>
  );
}

// One tiny inline SVG, not a network map library or fake city boundary.
// Replace with a real local SVG using each city's optional mapSilhouette field.
function StreetLines() {
  return (
    <svg viewBox="0 0 320 164" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M-20 18Q40 24 90 10T205 26T340 4M-25 58Q55 47 108 65T220 57T345 78M-25 108Q34 83 105 100T223 117T350 105M-20 147Q52 136 95 150T234 149T350 143"
          strokeWidth="1.6"
          opacity=".58"
        />
        <path
          d="M28-20Q46 30 26 75T47 194M86-20Q101 43 84 89T101 200M148-20Q170 38 145 98T159 190M225-20Q206 40 239 94T231 190M289-20Q269 38 298 96T290 200"
          strokeWidth="1.5"
          opacity=".60"
        />
        <path
          d="M-25 30Q55 75 119 54T340 25M-20 132Q84 115 148 70T345 42M15 184Q110 107 150 120T325-12"
          strokeWidth="3.3"
          opacity=".48"
        />
        <path
          d="M57-15 67 45M104 72l-13 54M181 53l22 49M251 110l32 54M15 94l38-16M180 135l-19 47M271 15l35 30M124 17l34 13"
          strokeWidth="1.1"
          opacity=".42"
        />
      </g>
    </svg>
  );
}

function CityArtwork({ cityName, mapSilhouette }: { cityName: string; mapSilhouette?: string }) {
  return (
    <>
      <span className={styles.mapArt} aria-hidden="true">
        {mapSilhouette ? (
          // No Next/Image optimization needed for small transparent public SVGs.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mapSilhouette} className={styles.realMap} loading="lazy" decoding="async" alt="" />
        ) : (
          <StreetLines />
        )}
      </span>
      <span className={styles.locationMark} aria-hidden="true">
        <LocationPinIcon />
        <span className={styles.locationName}>{cityName}</span>
      </span>
    </>
  );
}

function CityCard({ name, region, index }: { name: string; region: string; index: number }) {
  const city = resolveCity(name);
  const cardStyle = {
    '--map-tint': MAP_TINTS[index % MAP_TINTS.length],
  } as CSSProperties;

  const cardBody = (
    <>
      {/* The surface has an actual transparent carved notch, not a white overlay.
          Its inner bloom remains clipped inside that surface during hover. */}
      <span className={styles.cardSurface} aria-hidden="true">
        <span className={styles.innerBloom} />
      </span>
      <span className={styles.cardBadge} aria-hidden="true">
        <span className={styles.badgeNumber}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className={styles.badgeIcon}>
          <BadgeLocationIcon />
        </span>
      </span>

      {/* Preserve the original fading map and single RED map pin. */}
      <CityArtwork cityName={city.name} mapSilhouette={city.mapSilhouette} />

      <span className={styles.cardTop}>
        <span className={styles.regionLabel}>{region}</span>
        <span className={styles.phaseCount}>
          <strong>{city.phaseCount === null ? '--' : String(city.phaseCount).padStart(2, '0')}</strong>
          <small>{city.phaseCount === 1 ? 'PHASE' : 'PHASES'}</small>
        </span>
      </span>

      <span className={`${styles.cityName} ${city.name.length > 12 ? styles.longCityName : ''}`}>
        {city.name}
      </span>

      <span className={styles.learnMore}>
        <ArrowIcon />
        {city.available ? 'LEARN MORE' : 'COMING SOON'}
      </span>
    </>
  );

  if (!city.available) {
    return (
      <article
        className={`${styles.card} ${styles.unavailable}`}
        style={cardStyle}
        aria-label={`${city.name} projects coming soon`}
      >
        {cardBody}
      </article>
    );
  }

  return (
    <Link
      href={`/cities/${city.slug}/`}
      className={styles.card}
      style={cardStyle}
      aria-label={`Explore ${city.name}: ${city.phaseCount} ${city.phaseCount === 1 ? 'phase' : 'phases'}`}
    >
      {cardBody}
    </Link>
  );
}

export default function CitiesPage() {
  return (
    <PageLayout route="cities">
      <main className={styles.page}>
        {/* Identical hero markup/classes to the individual city page. */}
        <section className={heroStyles.hero}>
          <div className={heroStyles.heroInner}>
            <h1>Explore Our Projects</h1>

            <div className={heroStyles.heroBottom}>
              <nav className={heroStyles.breadcrumbs} aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span aria-hidden="true" />
                <strong aria-current="page">Cities</strong>
              </nav>
            </div>
          </div>
          <div className={heroStyles.heroCurve} />
        </section>

        <div className={styles.content}>
          <div className={styles.container}>
            {STATE_GROUPS.map((state) => {
              const count = state.groups.reduce((sum, group) => sum + group.cities.length, 0);
              let stateIndex = 0;
              return (
                <section className={styles.stateSection} id={state.slug} key={state.slug} aria-labelledby={`${state.slug}-heading`}>
                  <div className={styles.stateHeader}>
                    <h2 id={`${state.slug}-heading`}>{state.state}</h2>
                    <span className={styles.stateCount}>{count} CITIES</span>
                  </div>

                  {state.groups.map((group) => (
                    <div key={group.label} className={styles.regionSection}>
                      {state.slug === 'bihar' && (
                        <h3 className={styles.groupHeading}>{group.label}</h3>
                      )}
                      <div className={styles.grid}>
                        {group.cities.map((name) => (
                          <CityCard key={name} name={name} region={group.label} index={stateIndex++} />
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
