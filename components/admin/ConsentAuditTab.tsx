'use client';

import { useState } from 'react';
import { useLoad } from '@/components/admin/adminApi';
import styles from './ConsentAuditTab.module.css';

/* eslint-disable @typescript-eslint/no-explicit-any */

const ACTIONS: Record<string, { label: string; tone: string }> = {
  accept_all: { label: 'Accept all', tone: 'good' },
  reject_all: { label: 'Reject optional', tone: 'bad' },
  save_preferences: { label: 'Saved preferences', tone: 'mixed' },
  allow_embed: { label: 'Allowed an embed', tone: 'info' },
  policy_update: { label: 'Changed on policy page', tone: 'info' },
};

const LANGUAGES: Record<string, string> = { en: 'English', hi: 'Hindi' };

// Marketing is the advertising and remarketing cookie category.
const CONSENTS = [
  { key: 'necessary', label: 'Necessary' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'advertising', label: 'Marketing' },
  { key: 'media', label: 'Videos & maps' },
] as const;

const NO_FILTERS = { from: '', to: '', action: '', language: '', anonymousId: '' };
type Filters = typeof NO_FILTERS;

const toQuery = (values: Record<string, string>) =>
  new URLSearchParams(Object.entries(values).filter(([, value]) => value)).toString();

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

function daysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return isoDay(date);
}

const PRESETS = [
  { label: 'Today', from: () => daysAgo(0) },
  { label: '7 days', from: () => daysAgo(6) },
  { label: '30 days', from: () => daysAgo(29) },
  { label: 'All time', from: () => '' },
];

function formatTime(value: string) {
  const date = new Date(value);
  const zone = { timeZone: 'Asia/Kolkata' } as const;
  return {
    day: date.toLocaleDateString('en-IN', { ...zone, day: '2-digit', month: 'short', year: 'numeric' }),
    time: `${date.toLocaleTimeString('en-IN', { ...zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} IST`,
  };
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={styles.copy}
      aria-label={`Copy ${label}`}
      title={copied ? 'Copied' : `Copy ${label}`}
      onClick={(event) => {
        event.stopPropagation();
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }).catch(() => {});
      }}
    >
      {copied ? '✓' : '⧉'}
    </button>
  );
}

function Chip({ label, value }: { label: string; value: boolean | null }) {
  const state = value === null || value === undefined ? 'unset' : value ? 'yes' : 'no';
  const mark = state === 'yes' ? '✓' : state === 'no' ? '✕' : '–';
  const title = state === 'yes' ? 'Allowed' : state === 'no' ? 'Refused' : 'Not asked in this save';
  return (
    <span className={styles.chip} data-state={state} title={`${label}: ${title}`}>
      <span aria-hidden="true">{mark}</span> {label}
    </span>
  );
}

function Rate({ label, allowed, refused }: { label: string; allowed: number; refused: number }) {
  const answered = allowed + refused;
  const percent = answered ? Math.round((allowed / answered) * 100) : 0;
  return (
    <div className={styles.card}>
      <span className={styles.cardLabel}>{label} opt-in</span>
      <strong className={styles.cardValue}>{answered ? `${percent}%` : '–'}</strong>
      <span className={styles.meter} aria-hidden="true"><span style={{ width: `${percent}%` }} /></span>
      <span className={styles.cardNote}>{allowed} allowed · {refused} refused</span>
    </div>
  );
}

/** Used on the dashboard (/admin, which has its own page heading) and in Privacy & Compliance. */
export default function ConsentAuditTab({ heading = true }: { heading?: boolean }) {
  const [draft, setDraft] = useState<Filters>(NO_FILTERS);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [page, setPage] = useState(1);
  const { data, error, reload } = useLoad<any>(`/api/admin/privacy/consent-audit?${toQuery({ ...filters, page: String(page) })}`);

  const apply = (next: Filters) => {
    setDraft(next);
    setFilters(next);
    setPage(1);
  };
  const field = (key: keyof Filters) => ({
    value: draft[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDraft({ ...draft, [key]: event.target.value }),
  });

  const total = data?.total ?? 0;
  const count = (action: string) => data?.summary?.find((row: any) => row.action === action)?.count || 0;
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const filtered = Object.values(filters).some(Boolean);
  const activePreset = PRESETS.find((preset) => preset.from() === filters.from && !filters.to)?.label;

  return (
    <div className={styles.wrap}>
      <header className={styles.top}>
        <div>
          {heading && <h3 className={styles.title}>Consent audit</h3>}
          <p className={styles.lead} style={heading ? undefined : { marginTop: 0 }}>
            Every saved cookie choice, with the answer for each category at that moment. IPs are masked before storage and each row carries the SHA-256 of the exact notice shown. Rows cannot be edited.
          </p>
        </div>
        <div className={styles.topActions}>
          <button type="button" className={styles.ghost} onClick={reload}>Refresh</button>
          <a className={styles.solid} href={`/api/admin/privacy/consent-audit?${toQuery({ ...filters, format: 'csv' })}`}>Download CSV</a>
        </div>
      </header>

      {error && <p role="alert" className={styles.alert}>{error}</p>}

      <section className={styles.cards} aria-label="Summary">
        <div className={`${styles.card} ${styles.cardMain}`}>
          <span className={styles.cardLabel}>Consent events{filtered ? ' (filtered)' : ''}</span>
          <strong className={styles.cardValue}>{data ? total.toLocaleString('en-IN') : '…'}</strong>
          <span className={styles.split}>
            <span data-tone="good">{count('accept_all')} accept all</span>
            <span data-tone="bad">{count('reject_all')} reject</span>
            <span data-tone="mixed">{count('save_preferences')} custom</span>
            <span data-tone="info">{count('allow_embed') + count('policy_update')} other</span>
          </span>
        </div>
        <Rate label="Analytics" allowed={data?.optIn?.analytics.allowed || 0} refused={data?.optIn?.analytics.refused || 0} />
        <Rate label="Marketing" allowed={data?.optIn?.marketing.allowed || 0} refused={data?.optIn?.marketing.refused || 0} />
        <Rate label="Videos & maps" allowed={data?.optIn?.media.allowed || 0} refused={data?.optIn?.media.refused || 0} />
      </section>

      {data?.current && (
        <section className={styles.notice} aria-label="Live notice">
          <div>
            <span className={styles.cardLabel}>Live notice</span>
            <strong className={styles.version}>{data.current.noticeVersion}</strong>
          </div>
          {(['en', 'hi'] as const).map((lang) => (
            <div key={lang} className={styles.hashBox}>
              <span className={styles.cardLabel}>{LANGUAGES[lang]} hash · SHA-256</span>
              <span className={styles.hashLine}>
                <code title={data.current.hashes[lang]}>{data.current.hashes[lang]}</code>
                <CopyButton value={data.current.hashes[lang]} label={`${LANGUAGES[lang]} notice hash`} />
              </span>
            </div>
          ))}
        </section>
      )}

      <form
        className={styles.filters}
        onSubmit={(event) => {
          event.preventDefault();
          apply(draft);
        }}
      >
        <div className={styles.presets} role="group" aria-label="Date range">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={activePreset === preset.label ? styles.presetOn : styles.preset}
              onClick={() => apply({ ...draft, from: preset.from(), to: '' })}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <label className={styles.field}><span>From</span><input type="date" {...field('from')} /></label>
        <label className={styles.field}><span>To</span><input type="date" {...field('to')} /></label>
        <label className={styles.field}><span>Action</span>
          <select {...field('action')}>
            <option value="">All actions</option>
            {Object.entries(ACTIONS).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className={styles.field}><span>Language</span>
          <select {...field('language')}>
            <option value="">All</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </label>
        <label className={`${styles.field} ${styles.grow}`}><span>Anonymous ID</span><input placeholder="Paste a consent ID" spellCheck={false} {...field('anonymousId')} /></label>
        <div className={styles.filterActions}>
          <button type="submit" className={styles.solid}>Apply</button>
          {filtered && <button type="button" className={styles.ghost} onClick={() => apply(NO_FILTERS)}>Clear</button>}
        </div>
      </form>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Timestamp</th>
              <th scope="col">Anonymous ID</th>
              <th scope="col">Action</th>
              <th scope="col">Granular consents</th>
              <th scope="col">Language</th>
              <th scope="col">Masked IP</th>
              <th scope="col">Notice hash (SHA-256)</th>
            </tr>
          </thead>
          <tbody>
            {!data && !error && [0, 1, 2].map((key) => (
              <tr key={key} className={styles.skeleton}><td colSpan={7}><span /></td></tr>
            ))}
            {data?.rows?.length === 0 && (
              <tr><td colSpan={7} className={styles.empty}>
                <strong>No consent events {filtered ? 'match these filters' : 'yet'}</strong>
                <span>{filtered ? 'Try a wider date range or clear the filters.' : 'Rows appear here as soon as a visitor saves a cookie choice.'}</span>
              </td></tr>
            )}
            {data?.rows?.map((row: any) => {
              const { day, time } = formatTime(row.createdAt);
              const action = ACTIONS[row.action] || { label: row.action, tone: 'info' };
              const live = data.current?.hashes?.[row.language] === row.noticeHash;
              return (
                <tr key={row.id}>
                  <td data-label="Timestamp" className={styles.when}><span>{day}</span><small>{time}</small></td>
                  <td data-label="Anonymous ID">
                    <span className={styles.idLine}>
                      <button
                        type="button"
                        className={styles.idLink}
                        title={`Show every event for ${row.anonymousId}`}
                        onClick={() => apply({ ...NO_FILTERS, anonymousId: row.anonymousId })}
                      >
                        {row.anonymousId.slice(0, 8)}…{row.anonymousId.slice(-4)}
                      </button>
                      <CopyButton value={row.anonymousId} label="anonymous ID" />
                    </span>
                  </td>
                  <td data-label="Action">
                    <span className={styles.action} data-tone={action.tone}>{action.label}</span>
                    <small className={`${styles.muted} ${styles.source}`}>{row.source.replace(/_/g, ' ')}</small>
                  </td>
                  <td data-label="Consents">
                    <span className={styles.chips}>
                      {CONSENTS.map(({ key, label }) => <Chip key={key} label={label} value={row[key]} />)}
                    </span>
                  </td>
                  <td data-label="Language"><span className={styles.lang} title={LANGUAGES[row.language] || row.language}>{row.language.toUpperCase()}</span></td>
                  <td data-label="Masked IP"><code className={styles.mono}>{row.maskedIp || '–'}</code></td>
                  <td data-label="Notice hash">
                    <span className={styles.idLine}>
                      <code className={styles.mono} title={row.noticeHash}>{row.noticeHash.slice(0, 10)}…</code>
                      <CopyButton value={row.noticeHash} label="notice hash" />
                    </span>
                    <small className={styles.muted}>
                      {row.noticeVersion} <span className={live ? styles.live : styles.older}>{live ? 'live' : 'older'}</span>
                    </small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && data.total > 0 && (
        <nav className={styles.pager} aria-label="Pages">
          <span>
            Showing {(data.page - 1) * data.pageSize + 1}–{Math.min(data.page * data.pageSize, data.total)} of {data.total.toLocaleString('en-IN')}
          </span>
          <span className={styles.pagerButtons}>
            <button type="button" className={styles.ghost} disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {data.page} of {pages}</span>
            <button type="button" className={styles.ghost} disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
          </span>
        </nav>
      )}
    </div>
  );
}
