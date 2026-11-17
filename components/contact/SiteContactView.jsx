'use client';

import { useEffect, useMemo, useState } from 'react';
import { SITE_CONTACT_DATA, TOTAL_SITES } from '@/data/site-contacts';
import VVArrowButton from '@/components/common/VVArrowButton';
import styles from './SiteContactView.module.css';

function Icon({ name, size = 18 }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (name) {
    case 'search':
      return <svg {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4.2-4.2" /></svg>;
    case 'chevron':
      return <svg {...props}><path d="m6 9 6 6 6-6" /></svg>;
    case 'pin':
      return <svg {...props}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
    case 'phone':
      return <svg {...props}><path d="M22 16.6v2.7a2.2 2.2 0 0 1-2.4 2.2A20.2 20.2 0 0 1 2.5 4.4 2.2 2.2 0 0 1 4.7 2h2.7a2 2 0 0 1 2 1.7l.5 2.9a2 2 0 0 1-.6 1.9L8 9.8a16.6 16.6 0 0 0 6.2 6.2l1.3-1.3a2 2 0 0 1 1.9-.6l2.9.5a2 2 0 0 1 1.7 2.2Z" /></svg>;
    case 'mail':
      return <svg {...props}><rect x="2.5" y="4" width="19" height="16" rx="1" /><path d="m3 6 9 7 9-7" /></svg>;
    case 'user':
      return <svg {...props}><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></svg>;
    case 'x':
      return <svg {...props}><path d="M5 5 19 19M19 5 5 19" /></svg>;
    case 'copy':
      return <svg {...props}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>;
    case 'check':
      return <svg {...props}><path d="m5 12 4 4L19 6" /></svg>;
    default:
      return null;
  }
}

/** Convert an unambiguous Indian ten-digit number into a callable link. */
function phoneHref(value) {
  const text = String(value).trim();
  const digits = text.replace(/[\s()+-]/g, '');
  if (/^[0-9]{10}$/.test(digits)) return `tel:+91${digits}`;
  if (/^91[0-9]{10}$/.test(digits)) return `tel:+${digits}`;
  return null;
}

function Phones({ value }) {
  if (!value) return null;
  const numbers = String(value).split(',').map((item) => item.trim()).filter(Boolean);
  return (
    <div className={styles.phoneList}>
      {numbers.map((display, index) => {
        const href = phoneHref(display);
        return href
          ? <a key={`${display}-${index}`} href={href}>{display}</a>
          : <span key={`${display}-${index}`}>{display}</span>;
      })}
    </div>
  );
}

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fallback for restricted browser contexts.
    }
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    if (!document.execCommand('copy')) throw new Error('Copy failed');
  } finally {
    textarea.remove();
  }
}

export function SiteCard({ site, city, state }) {
  const [copyStatus, setCopyStatus] = useState('');
  const mapQuery = [site.address, city, state, 'India'].filter(Boolean).join(', ');
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  const handleCopyLocation = async () => {
    try {
      await copyToClipboard(mapUrl);
      setCopyStatus('Location link copied');
    } catch {
      setCopyStatus('Unable to copy location');
    }
  };

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.cardEyebrow}>Vastu Vihar project</span>
        <h4 className={styles.cardTitle}>{site.phase_name}</h4>
      </div>

      <div className={styles.cardDetails}>
        <div className={styles.detail}>
          <span className={styles.detailIcon}><Icon name="pin" /></span>
          <p>{site.address}</p>
        </div>
        {site.phone && (
          <div className={styles.detail}>
            <span className={styles.detailIcon}><Icon name="phone" /></span>
            <Phones value={site.phone} />
          </div>
        )}
        {site.email && (
          <div className={styles.detail}>
            <span className={styles.detailIcon}><Icon name="mail" /></span>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        )}
        {site.contacts?.length > 0 && (
          <div className={styles.people}>
            <span className={styles.peopleTitle}>Site contacts</span>
            {site.contacts.map((person, index) => {
              const href = phoneHref(person.phone || '');
              return (
                <div className={styles.person} key={`${person.name}-${index}`}>
                  <span className={styles.detailIcon}><Icon name="user" /></span>
                  <div className={styles.personInfo}>
                    <strong>{person.name}</strong>
                    {person.role && <small>{person.role}</small>}
                    {href
                      ? <a href={href}>{person.phone}</a>
                      : <span>{person.phone}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.locationActions}>
        <VVArrowButton
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          label="View Location"
          className={styles.actionButton}
        />
        <button
          type="button"
          className={styles.copyButton}
          onClick={handleCopyLocation}
          aria-label={`Copy location of ${site.phase_name}`}
          title="Copy location link"
        >
          <Icon name={copyStatus === 'Location link copied' ? 'check' : 'copy'} size={19} />
        </button>
      </div>
      {copyStatus && (
        <span className={styles.copyFeedback} role="status" aria-live="polite">
          {copyStatus}
        </span>
      )}
    </article>
  );
}

export default function SiteContactView() {
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [openState, setOpenState] = useState(SITE_CONTACT_DATA[0]?.state ?? null);

  const cities = useMemo(() => {
    const matchingStates = SITE_CONTACT_DATA.filter((group) => !state || group.state === state);
    return [...new Set(matchingStates.flatMap((group) => group.branches.map((item) => item.city)))].sort();
  }, [state]);

  const groups = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return SITE_CONTACT_DATA
      .filter((group) => !state || group.state === state)
      .map((group) => ({
        ...group,
        branches: group.branches
          .filter((branch) => !city || branch.city === city)
          .map((branch) => ({
            ...branch,
            phases: branch.phases.filter((site) => {
              if (!needle) return true;
              const searchable = [
                group.state,
                branch.city,
                site.phase_name,
                site.address,
                site.phone || '',
                site.email || '',
                ...(site.contacts || []).flatMap((person) => [person.name, person.role, person.phone]),
              ].join(' ').toLowerCase();
              return searchable.includes(needle);
            }),
          }))
          .filter((branch) => branch.phases.length > 0),
      }))
      .filter((group) => group.branches.length > 0);
  }, [search, state, city]);

  const totalMatches = groups.reduce(
    (total, group) => total + group.branches.reduce((sum, branch) => sum + branch.phases.length, 0),
    0
  );

  // Automatically expand the first matching state when the filters change.
  // Manual toggles do not change the filter values.
  useEffect(() => {
    setOpenState(groups[0]?.state ?? null);
  }, [groups]);

  const toggleState = (stateName) => {
    setOpenState((previous) => (previous === stateName ? null : stateName));
  };

  const hasFilter = Boolean(search || state || city);
  const clearAll = () => {
    setSearch('');
    setState('');
    setCity('');
  };

  return (
    <section className={styles.directory} aria-label="Search Vastu Vihar site contacts">
      <div className={styles.filters} role="search" aria-label="Site contact filters">
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="site-contact-query">Search sites</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}><Icon name="search" size={19} /></span>
            <input
              id="site-contact-query"
              className={styles.input}
              type="search"
              placeholder="Search project, location or contact"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                type="button"
                className={styles.clearInput}
                aria-label="Clear search"
                onClick={() => setSearch('')}
              >
                <Icon name="x" size={16} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="site-contact-state">State</label>
          <div className={styles.inputWrap}>
            <select
              id="site-contact-state"
              className={styles.select}
              value={state}
              onChange={(event) => { setState(event.target.value); setCity(''); }}
            >
              <option value="">All states</option>
              {SITE_CONTACT_DATA.map((group) => (
                <option key={group.state} value={group.state}>{group.state}</option>
              ))}
            </select>
            <span className={styles.selectIcon}><Icon name="chevron" size={16} /></span>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="site-contact-city">City</label>
          <div className={styles.inputWrap}>
            <select
              id="site-contact-city"
              className={styles.select}
              value={city}
              onChange={(event) => setCity(event.target.value)}
            >
              <option value="">All cities</option>
              {cities.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <span className={styles.selectIcon}><Icon name="chevron" size={16} /></span>
          </div>
        </div>
      </div>

      <div className={styles.resultsInfo} aria-live="polite">
        <p>Showing <strong>{totalMatches}</strong> of {TOTAL_SITES} sites</p>
        {hasFilter && (
          <VVArrowButton type="button" label="Clear filters" onClick={clearAll} className={styles.clearFilters} />
        )}
      </div>

      {groups.length > 0 ? (
        <div className={styles.results}>
          {groups.map((group) => {
            const expanded = openState === group.state;
            const contentId = `site-state-${group.state.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            const siteCount = group.branches.reduce(
              (count, branch) => count + branch.phases.length,
              0
            );
            return (
              <section className={styles.stateSection} key={group.state} aria-label={group.state}>
                <h2 className={styles.stateHeading}>
                  <button
                    type="button"
                    className={styles.accordionTrigger}
                    onClick={() => toggleState(group.state)}
                    aria-expanded={expanded}
                    aria-controls={contentId}
                  >
                    <span className={styles.stateName}>{group.state}</span>
                    <span className={styles.stateCount}>{siteCount} {siteCount === 1 ? 'site' : 'sites'}</span>
                    <span className={`${styles.accordionIcon} ${expanded ? styles.accordionIconOpen : ''}`} aria-hidden="true">
                      <Icon name="chevron" size={19} />
                    </span>
                  </button>
                </h2>
                <div id={contentId} className={styles.accordionContent} hidden={!expanded}>
                  {group.branches.map((branch) => (
                    <section
                      className={styles.citySection}
                      key={`${group.state}-${branch.city}`}
                      aria-label={branch.city}
                    >
                      <div className={styles.cityHeading}>
                        <h3>{branch.city}</h3>
                        <span>{branch.phases.length} {branch.phases.length === 1 ? 'project' : 'projects'}</span>
                      </div>
                      <div className={styles.cardGrid}>
                        {branch.phases.map((site, index) => (
                          <SiteCard
                            key={`${site.phase_name}-${index}`}
                            site={site}
                            city={branch.city}
                            state={group.state}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty} role="status">
          <Icon name="search" size={32} />
          <h2>No matching sites found</h2>
          <p>Try another project name, city or state.</p>
          <VVArrowButton type="button" label="View all sites" onClick={clearAll} />
        </div>
      )}
    </section>
  );
}
