'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, useLoad, when } from '@/components/admin/adminApi';
import UsersPanel from '@/components/admin/UsersPanel';
import ConsentAuditTab from '@/components/admin/ConsentAuditTab';
import styles from './privacy-admin.module.css';

/* eslint-disable @typescript-eslint/no-explicit-any */

type Tab = { id: string; label: string; permission: string; group: string; description: string; icon: string };

// Feather-style icon paths, drawn in a 24px box.
const ICONS: Record<string, string> = {
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
  alert: 'M12 9v4 M12 17h.01 M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 15l2 2 4-4',
  check: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  cookie: 'M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5 M8.5 8.5h.01 M16 15.5h.01 M12 12h.01 M11 17h.01 M7 14h.01',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6',
  message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 8v4 M12 16h.01',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
  share: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M8.59 13.51l6.83 3.98 M15.41 6.51l-6.82 3.98',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
};

const TABS: Tab[] = [
  { id: 'requests', label: 'Rights requests', permission: 'privacy:read', group: 'Requests', icon: 'inbox', description: 'Access, correction, erasure and nomination requests, with their response deadlines.' },
  { id: 'grievances', label: 'Grievances', permission: 'privacy:read', group: 'Requests', icon: 'alert', description: 'Complaints about how personal data is handled, tracked to resolution.' },
  { id: 'consents', label: 'Consent records', permission: 'privacy:read', group: 'Consent & tracking', icon: 'file', description: 'Consent given or withdrawn on the website forms, looked up by phone or email.' },
  { id: 'consent-audit', label: 'Consent audit', permission: 'privacy:read', group: 'Consent & tracking', icon: 'check', description: 'Every saved cookie choice, with a masked IP and the SHA-256 of the notice shown.' },
  { id: 'cookies', label: 'Cookie log', permission: 'privacy:read', group: 'Consent & tracking', icon: 'cookie', description: 'Cookie choices per category, the tags on this deployment and the published cookie list.' },
  { id: 'activity', label: 'Visitor activity', permission: 'privacy:read', group: 'Consent & tracking', icon: 'activity', description: 'What happened in browsers that allowed analytics or advertising.' },
  { id: 'newsletter', label: 'Newsletter', permission: 'newsletter:manage', group: 'Communications', icon: 'mail', description: 'Newsletter subscribers and unsubscribes.' },
  { id: 'comments', label: 'Comments', permission: 'comments:moderate', group: 'Communications', icon: 'message', description: 'Blog comments waiting for approval, and those already published.' },
  { id: 'breaches', label: 'Breach register', permission: 'breach:manage', group: 'Governance', icon: 'shield', description: 'Personal data breaches, their assessment and the notices sent.' },
  { id: 'retention', label: 'Retention', permission: 'retention:manage', group: 'Governance', icon: 'clock', description: 'How long each kind of data is kept, legal holds and deletion runs.' },
  { id: 'processors', label: 'Data sharing', permission: 'privacy:read', group: 'Governance', icon: 'share', description: 'Who receives personal data, why, and on what terms.' },
  { id: 'users', label: 'Staff access', permission: 'users:manage', group: 'Administration', icon: 'users', description: 'Who can sign in to the admin, and with which role.' },
  { id: 'audit', label: 'Audit log', permission: 'audit:read', group: 'Administration', icon: 'list', description: 'Every action staff have taken in the admin.' },
];

function Icon({ name }: { name: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

function Status({ value }: { value: string }) {
  return <span className={styles.status} data-status={value}>{value.replace(/_/g, ' ')}</span>;
}

/* ---------------------------- Rights requests ---------------------------- */

function RequestDetail({ id, canManage, onClose, onChange }: { id: string; canManage: boolean; onClose: () => void; onChange: () => void }) {
  const { data, error, reload } = useLoad<any>(`/api/admin/privacy/requests/${id}`);
  const [note, setNote] = useState('');
  const [method, setMethod] = useState('');
  const [channels, setChannels] = useState<string[]>([]);
  const [correction, setCorrection] = useState({ fullName: '', email: '', phone: '' });
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    if (!data?.request?.requestedChange) return;
    try {
      setCorrection((current) => ({ ...current, ...JSON.parse(data.request.requestedChange) }));
    } catch {
      // Staff can still enter the correction by hand.
    }
  }, [data?.request?.requestedChange]);

  async function act(action: string, extra: Record<string, unknown> = {}, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return;
    try {
      setMessage('');
      const result = await api(`/api/admin/privacy/requests/${id}`, 'POST', { action, note, ...extra });
      if (action === 'GENERATE_ACCESS_SUMMARY') setSummary(JSON.stringify(result.result, null, 2));
      else if (result.result) setMessage(`Done: ${JSON.stringify(result.result)}`);
      else setMessage('Done.');
      setNote('');
      reload();
      onChange();
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  async function setHold(record: any) {
    const reason = record.legalHoldReason ? '' : prompt('What legal requirement means this record must be kept?');
    if (reason === null) return;
    if (!record.legalHoldReason && !reason?.trim()) return;
    try {
      await api('/api/admin/privacy/holds', 'POST', { recordType: record.recordType, id: record.id, reason });
      reload();
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  if (error) return <div className={styles.panel}><p role="alert" className={styles.error}>{error}</p></div>;
  if (!data) return <div className={styles.panel}>Loading…</div>;

  const item = data.request;
  const verified = Boolean(item.verifiedAt);
  const closed = ['RESOLVED', 'REJECTED'].includes(item.status);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h3>{item.ticketNo}</h3>
        <Status value={item.status} />
        <button type="button" className={styles.linkButton} onClick={onClose}>Close</button>
      </div>

      <dl className={styles.facts}>
        <div><dt>Type</dt><dd>{item.type.replace(/_/g, ' ')}{item.category ? ` (${item.category})` : ''}</dd></div>
        <div><dt>Requester</dt><dd>{item.requesterName}{item.actingAs === 'NOMINEE' ? ' (acting as nominee)' : ''}</dd></div>
        <div><dt>Email</dt><dd>{item.email || '—'}</dd></div>
        <div><dt>Phone</dt><dd>{item.phone || '—'}</dd></div>
        <div><dt>Received</dt><dd>{when(item.createdAt)}</dd></div>
        <div><dt>Respond by</dt><dd>{when(item.dueAt)}</dd></div>
        <div><dt>Identity</dt><dd>{verified ? `Verified by ${item.verifiedBy}: ${item.verifyMethod}` : 'Not verified'}</dd></div>
        <div><dt>Matching records</dt><dd>{data.matches.leads} enquiries, {data.matches.applications} applications, {data.matches.comments} comments, {data.matches.newsletter} newsletter entry, {data.matches.consents} consent entries, {data.matches.legalHolds} on legal hold</dd></div>
        {item.nomineeName && <div><dt>Nominee</dt><dd>{item.nomineeName}, {item.nomineeContact}{item.nomineeRelation ? `, ${item.nomineeRelation}` : ''}</dd></div>}
      </dl>

      <h4>Details from the requester</h4>
      <p className={styles.quote}>{item.details}</p>
      {item.retentionNote && <p className={styles.warning}>{item.retentionNote}</p>}
      {item.outcome && <><h4>Outcome</h4><p className={styles.quote}>{item.outcome}</p></>}

      {canManage && !closed && (
        <>
          {!verified && (
            <div className={styles.actionBox}>
              <h4>1. Verify identity</h4>
              <p>Contact the requester on the phone or email already in your records, not only on what this form gave. Nothing can be read or changed until this is recorded.</p>
              <p><strong>Tick only what you confirmed belongs to this person.</strong> Data is matched only on what you tick, so someone cannot reach another person's records by adding their number or email to the form.</p>
              <div className={styles.row}>
                {(['email', 'phone'] as const).filter((channel) => item[channel]).map((channel) => (
                  <label key={channel} className={styles.check}>
                    <input
                      type="checkbox"
                      checked={channels.includes(channel)}
                      onChange={(e) => setChannels(e.target.checked ? [...channels, channel] : channels.filter((value) => value !== channel))}
                    />
                    {channel === 'email' ? `Email: ${item.email}` : `Phone: ${item.phone}`}
                  </label>
                ))}
              </div>
              <div className={styles.row}>
                <button type="button" className={styles.secondary} onClick={() => act('START_VERIFICATION')}>Mark as verifying</button>
                <input className={styles.input} value={method} onChange={(e) => setMethod(e.target.value)} placeholder="How was identity confirmed?" />
                <button type="button" className={styles.primary} disabled={!method.trim() || !channels.length} onClick={() => act('VERIFY', { method, channels })}>Record as verified</button>
              </div>
            </div>
          )}

          {verified && (
            <div className={styles.actionBox}>
              <h4>2. Act on the request</h4>
              {data.records.length > 0 && (
                <table className={styles.table}>
                  <tbody>
                    {data.records.map((record: any) => (
                      <tr key={record.id}>
                        <td>{record.label}</td>
                        <td>{record.legalHoldReason ? `Legal hold: ${record.legalHoldReason}` : 'No legal hold'}</td>
                        <td><button type="button" className={styles.linkButton} onClick={() => setHold(record)}>{record.legalHoldReason ? 'Lift hold' : 'Place legal hold'}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className={styles.sub}>Matching only on: {item.verifiedChannels?.replace(',', ' and ')}</p>
              <div className={styles.row}>
                {item.type === 'ACCESS' && <button type="button" className={styles.secondary} onClick={() => act('GENERATE_ACCESS_SUMMARY')}>Generate access summary</button>}
                {item.type === 'CONSENT_WITHDRAWAL' && <button type="button" className={styles.secondary} onClick={() => act('WITHDRAW_CONSENT', {}, 'Record the withdrawal of all consent for this contact, stop marketing and close open enquiries?')}>Withdraw consent</button>}
                {['ERASURE', 'CONSENT_WITHDRAWAL'].includes(item.type) && <button type="button" className={styles.danger} onClick={() => act('APPLY_ERASURE', {}, 'Permanently erase this contact\'s enquiries, applications, resumes and comments? Records on legal hold are kept. This cannot be undone.')}>Erase data</button>}
              </div>
              {item.type === 'CORRECTION' && (
                <>
                  <h4>Correct details</h4>
                  <div className={styles.row}>
                    <input className={styles.input} placeholder="Correct name" value={correction.fullName} onChange={(e) => setCorrection({ ...correction, fullName: e.target.value })} />
                    <input className={styles.input} placeholder="Correct email" value={correction.email} onChange={(e) => setCorrection({ ...correction, email: e.target.value })} />
                    <input className={styles.input} placeholder="Correct phone" value={correction.phone} onChange={(e) => setCorrection({ ...correction, phone: e.target.value })} />
                    <button type="button" className={styles.secondary} onClick={() => act('APPLY_CORRECTION', correction)}>Apply correction</button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className={styles.actionBox}>
            <h4>{verified ? '3. Close the request' : 'Close the request'}</h4>
            <textarea className={styles.input} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note or outcome. Record what you told the requester and any legal reason for keeping data." />
            <div className={styles.row}>
              <button type="button" className={styles.secondary} disabled={!note.trim()} onClick={() => act('ADD_NOTE')}>Add note</button>
              <button type="button" className={styles.secondary} onClick={() => act('SET_STATUS', { status: 'ESCALATED' })}>Escalate</button>
              <button type="button" className={styles.primary} disabled={!note.trim()} onClick={() => act('RESOLVE')}>Resolve</button>
              <button type="button" className={styles.secondary} disabled={!note.trim()} onClick={() => act('REJECT')}>Reject</button>
            </div>
          </div>
        </>
      )}

      {message && <p role="status" className={styles.message}>{message}</p>}
      {summary && (
        <div className={styles.actionBox}>
          <h4>Access summary</h4>
          <p>Send this to the requester on their verified contact. It is not stored.</p>
          <textarea className={styles.input} rows={12} readOnly value={summary} />
        </div>
      )}

      <h4>History</h4>
      <ul className={styles.timeline}>
        {item.events.map((event: any) => (
          <li key={event.id}><time>{when(event.createdAt)}</time> <strong>{event.action.replace(/_/g, ' ')}</strong>{event.actorEmail ? ` by ${event.actorEmail}` : ''}{event.note ? `: ${event.note}` : ''}</li>
        ))}
      </ul>
    </div>
  );
}

function RequestsTab({ view, canManage }: { view: 'requests' | 'grievances'; canManage: boolean }) {
  const [status, setStatus] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const query = new URLSearchParams({ view, ...(status ? { status } : {}) }).toString();
  const { data, error, reload } = useLoad<any>(`/api/admin/privacy/requests?${query}`);

  const counts = data?.counts || {};
  return (
    <>
      <div className={styles.stats}>
        {['RECEIVED', 'VERIFYING', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'REJECTED'].map((key) => (
          <button key={key} type="button" className={status === key ? styles.statActive : styles.stat} onClick={() => setStatus(status === key ? '' : key)}>
            <b>{counts[key] || 0}</b> {key.replace(/_/g, ' ').toLowerCase()}
          </button>
        ))}
        <span className={data?.overdue ? styles.overdue : styles.stat}><b>{data?.overdue || 0}</b> overdue</span>
      </div>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {openId && <RequestDetail key={openId} id={openId} canManage={canManage} onClose={() => setOpenId(null)} onChange={reload} />}
      <table className={styles.table}>
        <thead><tr><th>Ticket</th><th>Type</th><th>Requester</th><th>Status</th><th>Identity</th><th>Received</th><th>Respond by</th></tr></thead>
        <tbody>
          {data?.requests?.length === 0 && <tr><td colSpan={7}>Nothing here yet.</td></tr>}
          {data?.requests?.map((item: any) => (
            <tr key={item.id}>
              <td><button type="button" className={styles.linkButton} onClick={() => setOpenId(item.id)}>{item.ticketNo}</button></td>
              <td>{item.type.replace(/_/g, ' ')}{item.category ? ` (${item.category})` : ''}</td>
              <td>{item.requesterName}</td>
              <td><Status value={item.status} /></td>
              <td>{item.verifiedAt ? 'Verified' : 'Not verified'}</td>
              <td>{when(item.createdAt)}</td>
              <td className={!['RESOLVED', 'REJECTED'].includes(item.status) && new Date(item.dueAt) < new Date() ? styles.lateCell : ''}>{when(item.dueAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

/* --------------------------------- Registers ------------------------------ */

function ConsentsTab() {
  const { data, error } = useLoad<any>('/api/admin/privacy/records?view=consents');
  return (
    <>
      <p className={styles.intro}>Every consent given or withdrawn. Contact details are stored here only as one-way codes, so this record can outlast erasure.</p>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <table className={styles.table}>
        <thead><tr><th>Time</th><th>Purpose</th><th>Action</th><th>Notice version</th><th>Language</th><th>Source</th><th>Record</th></tr></thead>
        <tbody>
          {data?.consents?.length === 0 && <tr><td colSpan={7}>No consent records yet.</td></tr>}
          {data?.consents?.map((row: any) => (
            <tr key={row.id}>
              <td>{when(row.createdAt)}</td><td>{row.purpose}</td><td><Status value={row.action} /></td>
              <td>{row.noticeVersion}</td><td>{row.language}</td><td>{row.source}</td><td>{row.recordType || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

const COOKIE_CATEGORY_LABELS: Record<string, string> = {
  third_party_media: 'Videos & maps',
  analytics_cookies: 'Analytics',
  remarketing_cookies: 'Advertising & remarketing',
};

const NO_COOKIE_FILTERS = { from: '', to: '', purpose: '', action: '', consentId: '' };

const toQuery = (values: Record<string, string>) =>
  new URLSearchParams(Object.entries(values).filter(([, value]) => value)).toString();

function Pager({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className={styles.row}>
      <button type="button" className={styles.secondary} disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
      <span>Page {page} of {pages} ({total} rows)</span>
      <button type="button" className={styles.secondary} disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
    </div>
  );
}

function CookieLogTab() {
  const [draft, setDraft] = useState(NO_COOKIE_FILTERS);
  const [filters, setFilters] = useState(NO_COOKIE_FILTERS);
  const [page, setPage] = useState(1);
  const { data, error } = useLoad<any>(`/api/admin/privacy/cookies?${toQuery({ ...filters, page: String(page) })}`);

  const count = (purpose: string, action: string) =>
    data?.summary?.find((row: any) => row.purpose === purpose && row.action === action)?.count || 0;
  const field = (key: keyof typeof NO_COOKIE_FILTERS) => ({
    value: draft[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDraft({ ...draft, [key]: event.target.value }),
  });

  return (
    <>
      <p className={styles.intro}>Every cookie choice made on the website, one row per category each time a visitor saves. It holds a coded visitor reference and no contact details or IP addresses. To find one visitor, ask for the consent ID shown under Cookie Preferences on the privacy policy.</p>
      {error && <p role="alert" className={styles.error}>{error}</p>}

      <div className={styles.stats}>
        {(data?.purposes || []).map((purpose: string) => (
          <span key={purpose} className={styles.stat}>
            {COOKIE_CATEGORY_LABELS[purpose] || purpose}: <b>{count(purpose, 'GRANTED')}</b> allowed, <b>{count(purpose, 'WITHDRAWN')}</b> declined or withdrawn
          </span>
        ))}
      </div>
      <p className={styles.sub}>These count saved choices, not people. A visitor who changes their mind is counted again.</p>
      {data?.tags && (
        <p className={styles.sub}>
          Tags on this deployment: Google tag (GTM) {data.tags.googleTag ? 'on' : 'not configured'}, Google Analytics {data.tags.googleAnalytics ? 'on' : 'not configured'}, Google Ads {data.tags.googleAds ? 'on' : 'not configured'}.
        </p>
      )}

      <form
        className={styles.row}
        onSubmit={(event) => {
          event.preventDefault();
          setFilters(draft);
          setPage(1);
        }}
      >
        <label className={styles.field}>From<input className={styles.input} type="date" {...field('from')} /></label>
        <label className={styles.field}>To<input className={styles.input} type="date" {...field('to')} /></label>
        <label className={styles.field}>Category
          <select className={styles.input} {...field('purpose')}>
            <option value="">All</option>
            {(data?.purposes || []).map((purpose: string) => <option key={purpose} value={purpose}>{COOKIE_CATEGORY_LABELS[purpose] || purpose}</option>)}
          </select>
        </label>
        <label className={styles.field}>Choice
          <select className={styles.input} {...field('action')}>
            <option value="">All</option>
            <option value="GRANTED">Allowed</option>
            <option value="WITHDRAWN">Declined or withdrawn</option>
          </select>
        </label>
        <label className={styles.field}>Consent ID<input className={styles.input} {...field('consentId')} /></label>
        <button type="submit" className={styles.primary}>Apply</button>
        <a className={styles.secondary} href={`/api/admin/privacy/cookies?${toQuery({ ...filters, format: 'csv' })}`}>Download CSV</a>
      </form>

      <table className={styles.table}>
        <thead><tr><th>Time</th><th>Visitor code</th><th>Category</th><th>Choice</th><th>Notice version</th><th>Language</th><th>Source</th></tr></thead>
        <tbody>
          {data?.rows?.length === 0 && <tr><td colSpan={7}>No cookie choices match.</td></tr>}
          {data?.rows?.map((row: any) => (
            <tr key={row.id}>
              <td>{when(row.createdAt)}</td>
              <td>{row.visitor}</td>
              <td>{COOKIE_CATEGORY_LABELS[row.purpose] || row.purpose}</td>
              <td><Status value={row.action} /></td>
              <td>{row.noticeVersion}</td>
              <td>{row.language}</td>
              <td>{row.source.replace(/_/g, ' ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data && <Pager page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}

      <h4>Cookies and storage on this website</h4>
      <p className={styles.intro}>The list published in the privacy policy. Providers can change their cookies, so check it against the live site from time to time.</p>
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Provider</th><th>Category</th><th>Type</th><th>Purpose</th><th>Lasts</th></tr></thead>
        <tbody>
          {data?.inventory?.map((item: any) => (
            <tr key={item.name}><td>{item.name}</td><td>{item.provider}</td><td>{item.category}</td><td>{item.type}</td><td className={styles.wrap}>{item.purpose}</td><td>{item.duration}</td></tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

const AD_CHANNEL_LABELS: Record<string, string> = { google_ads: 'Google Ads', meta: 'Meta', campaign: 'Campaign link' };
const TAG_LABELS: Record<string, string> = { google_tag: 'Google tag', google_analytics: 'Google Analytics', google_ads: 'Google Ads', meta_pixel: 'Meta Pixel' };

const NO_ACTIVITY_FILTERS = { from: '', to: '', kind: '', category: '', channel: '', consentId: '', visitor: '' };

function VisitorActivityTab() {
  const [draft, setDraft] = useState(NO_ACTIVITY_FILTERS);
  const [filters, setFilters] = useState(NO_ACTIVITY_FILTERS);
  const [page, setPage] = useState(1);
  const { data, error } = useLoad<any>(`/api/admin/privacy/visitor-activity?${toQuery({ ...filters, page: String(page) })}`);

  const count = (kind: string, category: string) =>
    data?.summary?.find((row: any) => row.kind === kind && row.category === category)?.count || 0;
  const field = (key: keyof typeof NO_ACTIVITY_FILTERS) => ({
    value: draft[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDraft({ ...draft, [key]: event.target.value }),
  });
  const followVisitor = (visitor: string) => {
    const next = { ...NO_ACTIVITY_FILTERS, visitor };
    setDraft(next);
    setFilters(next);
    setPage(1);
  };

  return (
    <>
      <p className={styles.intro}>What happened in the browsers of visitors who allowed analytics or advertising: the pages they viewed, which tag cookies were present (names only), the advert or campaign that brought them, and what each tag was asked to do. It holds a coded visitor reference and no contact details, IP addresses or cookie values. A visitor who withdraws a category has that category&apos;s rows deleted.</p>
      <p className={styles.sub}>Tag events show what this website asked a tag to do. They do not confirm that Google or Meta received it, so check their own dashboards for that. Cookies on Google&apos;s or Meta&apos;s own domains, such as IDE and fr, cannot be seen from this website.</p>
      {error && <p role="alert" className={styles.error}>{error}</p>}

      <div className={styles.stats}>
        <span className={styles.stat}>Page views: <b>{count('page_view', 'analytics')}</b> analytics, <b>{count('page_view', 'advertising')}</b> advertising</span>
        <span className={styles.stat}>Tag events: <b>{count('tag_event', 'analytics')}</b> analytics, <b>{count('tag_event', 'advertising')}</b> advertising</span>
        {data?.channels?.map((row: any) => (
          <span key={row.channel} className={styles.stat}>{AD_CHANNEL_LABELS[row.channel] || row.channel}: <b>{row.count}</b> page views</span>
        ))}
      </div>
      <p className={styles.sub}>A visitor who allowed both categories is counted once under each. These count events, not people.</p>

      <form
        className={styles.row}
        onSubmit={(event) => {
          event.preventDefault();
          setFilters(draft);
          setPage(1);
        }}
      >
        <label className={styles.field}>From<input className={styles.input} type="date" {...field('from')} /></label>
        <label className={styles.field}>To<input className={styles.input} type="date" {...field('to')} /></label>
        <label className={styles.field}>Type
          <select className={styles.input} {...field('kind')}>
            <option value="">All</option>
            <option value="page_view">Page views</option>
            <option value="tag_event">Tag events</option>
          </select>
        </label>
        <label className={styles.field}>Category
          <select className={styles.input} {...field('category')}>
            <option value="">All</option>
            <option value="analytics">Analytics</option>
            <option value="advertising">Advertising &amp; remarketing</option>
          </select>
        </label>
        <label className={styles.field}>Ad source
          <select className={styles.input} {...field('channel')}>
            <option value="">All</option>
            {(data?.channelOptions || []).map((channel: string) => <option key={channel} value={channel}>{AD_CHANNEL_LABELS[channel] || channel}</option>)}
          </select>
        </label>
        <label className={styles.field}>Visitor code<input className={styles.input} {...field('visitor')} /></label>
        <label className={styles.field}>Consent ID<input className={styles.input} {...field('consentId')} /></label>
        <button type="submit" className={styles.primary}>Apply</button>
        <a className={styles.secondary} href={`/api/admin/privacy/visitor-activity?${toQuery({ ...filters, format: 'csv' })}`}>Download CSV</a>
      </form>

      <table className={styles.table}>
        <thead><tr><th>Time</th><th>Visitor code</th><th>Category</th><th>Page</th><th>Event or cookies</th><th>Ad source</th></tr></thead>
        <tbody>
          {data?.rows?.length === 0 && <tr><td colSpan={6}>No visitor activity matches.</td></tr>}
          {data?.rows?.map((row: any) => (
            <tr key={row.id}>
              <td>{when(row.createdAt)}</td>
              <td><button type="button" className={styles.secondary} onClick={() => followVisitor(row.visitor)}>{row.visitor}</button></td>
              <td>{row.category}</td>
              <td className={styles.wrap}>{row.path}</td>
              <td className={styles.wrap}>
                {row.kind === 'tag_event'
                  ? `${TAG_LABELS[row.provider] || row.provider}: ${row.eventName.replace(/_/g, ' ')}`
                  : row.cookies ? row.cookies.replace(/,/g, ', ') : 'Page view, no tag cookies yet'}
              </td>
              <td className={styles.wrap}>
                {row.adChannel
                  ? [AD_CHANNEL_LABELS[row.adChannel] || row.adChannel, row.adUtmSource, row.adUtmMedium, row.adUtmCampaign].filter(Boolean).join(' / ')
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data && <Pager page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
    </>
  );
}

function NewsletterTab() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, error } = useLoad<any>(`/api/admin/newsletter?${toQuery({ status, page: String(page) })}`);

  return (
    <>
      <p className={styles.intro}>The website no longer takes sign-ups, so this only lists earlier ones, and it sends no email. Download a fresh list immediately before each send, because an older copy will still contain people who have since unsubscribed. The download only holds people currently subscribed.</p>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <div className={styles.stats}>
        {['SUBSCRIBED', 'UNSUBSCRIBED'].map((key) => (
          <button
            key={key}
            type="button"
            className={status === key ? styles.statActive : styles.stat}
            onClick={() => {
              setStatus(status === key ? '' : key);
              setPage(1);
            }}
          >
            <b>{data?.counts?.[key] || 0}</b> {key.toLowerCase()}
          </button>
        ))}
        <a className={styles.secondary} href="/api/admin/newsletter?format=csv">Download subscribers (CSV)</a>
      </div>
      <table className={styles.table}>
        <thead><tr><th>Email</th><th>Status</th><th>Subscribed</th><th>Unsubscribed</th><th>Notice version</th><th>Language</th></tr></thead>
        <tbody>
          {data?.subscribers?.length === 0 && <tr><td colSpan={6}>Nothing here yet.</td></tr>}
          {data?.subscribers?.map((row: any) => (
            <tr key={row.id}>
              <td>{row.email}</td>
              <td><Status value={row.status} /></td>
              <td>{when(row.createdAt)}</td>
              <td>{when(row.unsubscribedAt)}</td>
              <td>{row.noticeVersion}</td>
              <td>{row.noticeLanguage}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data && <Pager page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
    </>
  );
}

function CommentsTab() {
  const { data, error, reload } = useLoad<any>('/api/admin/privacy/comments');
  const [message, setMessage] = useState('');
  const run = async (fn: () => Promise<unknown>) => {
    try {
      setMessage('');
      await fn();
      reload();
    } catch (err) {
      setMessage((err as Error).message);
    }
  };
  return (
    <>
      <p className={styles.intro}>Comments stay hidden until approved here.</p>
      {(error || message) && <p role="alert" className={styles.error}>{error || message}</p>}
      <table className={styles.table}>
        <thead><tr><th>Submitted</th><th>Post</th><th>Name</th><th>Comment</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {data?.comments?.length === 0 && <tr><td colSpan={6}>No comments yet.</td></tr>}
          {data?.comments?.map((comment: any) => (
            <tr key={comment.id}>
              <td>{when(comment.createdAt)}</td>
              <td>{comment.post?.title}</td>
              <td>{comment.authorName}</td>
              <td className={styles.wrap}>{comment.content}</td>
              <td><Status value={comment.isApproved ? 'PUBLISHED' : 'PENDING'} /></td>
              <td className={styles.nowrap}>
                <button type="button" className={styles.linkButton} onClick={() => run(() => api('/api/admin/privacy/comments', 'PATCH', { id: comment.id, isApproved: !comment.isApproved }))}>
                  {comment.isApproved ? 'Unpublish' : 'Approve'}
                </button>{' · '}
                <button type="button" className={styles.linkButton} onClick={() => confirm('Delete this comment?') && run(() => api(`/api/admin/privacy/comments?id=${comment.id}`, 'DELETE'))}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

const BREACH_FIELDS: [string, string][] = [
  ['nature', 'Nature of the breach'],
  ['scope', 'Scope and how it happened'],
  ['affectedDataTypes', 'Data affected'],
  ['likelyConsequences', 'Likely consequences for people'],
  ['containmentActions', 'Containment actions'],
  ['remediationActions', 'Remediation and safety measures'],
  ['notificationNotes', 'Notification notes'],
];

const BREACH_DATES: [string, string][] = [
  ['occurredAt', 'When it occurred'],
  ['boardIntimatedAt', 'Initial intimation to the Board'],
  ['boardReportedAt', 'Detailed report to the Board'],
  ['principalsNotifiedAt', 'Affected people notified'],
];

const toLocalInput = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

function principalNotice(incident: any) {
  return `Subject: Important notice about your personal data

Vastu Vihar (Technoculture Building Centre Private Limited) is writing to tell you about a personal data breach (reference ${incident.reference}).

What happened: ${incident.nature || '[describe the breach]'}
When: ${incident.occurredAt ? when(incident.occurredAt) : '[date and time]'}
Data involved: ${incident.affectedDataTypes || '[data affected]'}
What this may mean for you: ${incident.likelyConsequences || '[likely consequences]'}
What we have done: ${incident.containmentActions || '[containment]'} ${incident.remediationActions || '[remediation]'}
What you can do: [safety measures for the person]

Questions: privacy@vastuvihar.org or +91 95340 95340.`;
}

function boardReport(incident: any) {
  return `Personal data breach report: ${incident.reference}
Data Fiduciary: Technoculture Building Centre Private Limited (Vastu Vihar)

Detected: ${when(incident.detectedAt)}
Occurred: ${when(incident.occurredAt)}
Severity: ${incident.severity}
Nature and extent: ${incident.nature || '[required]'}
Scope and cause: ${incident.scope || '[required]'}
Data affected: ${incident.affectedDataTypes || '[required]'}
Approximate number of people affected: ${incident.affectedCount ?? '[required]'}
Likely impact: ${incident.likelyConsequences || '[required]'}
Containment: ${incident.containmentActions || '[required]'}
Remediation: ${incident.remediationActions || '[required]'}
People notified: ${incident.principalsNotifiedAt ? `${when(incident.principalsNotifiedAt)}, count ${incident.principalsNotifiedCount ?? 'not recorded'}` : 'Not yet'}

Check the current rules for the required form and manner before filing.`;
}

function BreachEditor({ incident, onSaved, onClose }: { incident: any; onSaved: () => void; onClose: () => void }) {
  const [form, setForm] = useState<any>(() => {
    const initial = { ...incident };
    for (const [key] of BREACH_DATES) initial[key] = toLocalInput(incident[key]);
    return initial;
  });
  const [message, setMessage] = useState('');
  const [draft, setDraft] = useState('');

  async function save() {
    try {
      const payload: any = { id: incident.id };
      for (const key of ['status', 'severity', 'ownerEmail', 'affectedCount', 'principalsNotifiedCount', 'boardReference', ...BREACH_FIELDS.map(([k]) => k)]) payload[key] = form[key];
      for (const [key] of BREACH_DATES) payload[key] = form[key] ? new Date(form[key]).toISOString() : null;
      await api('/api/admin/privacy/breaches', 'PATCH', payload);
      setMessage('Saved.');
      onSaved();
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h3>{incident.reference}: {incident.title}</h3>
        <button type="button" className={styles.linkButton} onClick={onClose}>Close</button>
      </div>
      <p className={styles.warning}>Detected {when(incident.detectedAt)}. Board report target: {when(incident.boardDueAt)}. Check the current rules before relying on this date, and notify affected people without delay.</p>
      <div className={styles.grid}>
        <label className={styles.field}>Status
          <select className={styles.input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {['DETECTED', 'ASSESSING', 'CONTAINED', 'NOTIFIED', 'CLOSED'].map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label className={styles.field}>Severity
          <select className={styles.input} value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
            {['UNASSESSED', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label className={styles.field}>Responsible person (email)
          <input className={styles.input} value={form.ownerEmail || ''} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} />
        </label>
        <label className={styles.field}>People affected
          <input className={styles.input} type="number" min="0" value={form.affectedCount ?? ''} onChange={(e) => setForm({ ...form, affectedCount: e.target.value })} />
        </label>
        <label className={styles.field}>People notified
          <input className={styles.input} type="number" min="0" value={form.principalsNotifiedCount ?? ''} onChange={(e) => setForm({ ...form, principalsNotifiedCount: e.target.value })} />
        </label>
        <label className={styles.field}>Board reference
          <input className={styles.input} value={form.boardReference || ''} onChange={(e) => setForm({ ...form, boardReference: e.target.value })} />
        </label>
        {BREACH_DATES.map(([key, label]) => (
          <label key={key} className={styles.field}>{label}
            <input className={styles.input} type="datetime-local" value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          </label>
        ))}
      </div>
      {BREACH_FIELDS.map(([key, label]) => (
        <label key={key} className={styles.field}>{label}
          <textarea className={styles.input} rows={2} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
        </label>
      ))}
      <div className={styles.row}>
        <button type="button" className={styles.primary} onClick={save}>Save</button>
        <button type="button" className={styles.secondary} onClick={() => setDraft(principalNotice(incident))}>Draft notice to people</button>
        <button type="button" className={styles.secondary} onClick={() => setDraft(boardReport(incident))}>Draft Board report</button>
      </div>
      {message && <p role="status" className={styles.message}>{message}</p>}
      {draft && <textarea className={styles.input} rows={14} value={draft} onChange={(e) => setDraft(e.target.value)} />}
    </div>
  );
}

function BreachesTab() {
  const { data, error, reload } = useLoad<any>('/api/admin/privacy/breaches');
  const [title, setTitle] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const open = data?.incidents?.find((incident: any) => incident.id === openId);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    try {
      setMessage('');
      const result = await api('/api/admin/privacy/breaches', 'POST', { title });
      setTitle('');
      await reload();
      setOpenId(result.incident.id);
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  return (
    <>
      <p className={styles.intro}>Record a suspected breach as soon as you know about it, then tell the responsible person straight away. The runbook is in docs/dpdp/breach-response.md.</p>
      <form className={styles.row} onSubmit={create}>
        <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title, e.g. Lost laptop with lead export" required />
        <button type="submit" className={styles.danger}>Record incident</button>
      </form>
      {(error || message) && <p role="alert" className={styles.error}>{error || message}</p>}
      {open && <BreachEditor key={open.id + open.updatedAt} incident={open} onSaved={reload} onClose={() => setOpenId(null)} />}
      <table className={styles.table}>
        <thead><tr><th>Reference</th><th>Title</th><th>Status</th><th>Severity</th><th>Detected</th><th>Board report target</th><th>Board reported</th><th>People notified</th></tr></thead>
        <tbody>
          {data?.incidents?.length === 0 && <tr><td colSpan={8}>No incidents recorded.</td></tr>}
          {data?.incidents?.map((incident: any) => (
            <tr key={incident.id}>
              <td><button type="button" className={styles.linkButton} onClick={() => setOpenId(incident.id)}>{incident.reference}</button></td>
              <td>{incident.title}</td>
              <td><Status value={incident.status} /></td>
              <td>{incident.severity}</td>
              <td>{when(incident.detectedAt)}</td>
              <td className={!incident.boardReportedAt && new Date(incident.boardDueAt) < new Date() ? styles.lateCell : ''}>{when(incident.boardDueAt)}</td>
              <td>{when(incident.boardReportedAt)}</td>
              <td>{when(incident.principalsNotifiedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function RetentionRow({ policy, onChange, onError }: { policy: any; onChange: () => void; onError: (message: string) => void }) {
  const [days, setDays] = useState(policy.retentionDays ?? '');
  const [basis, setBasis] = useState(policy.legalBasis || '');

  async function save(clear = false) {
    try {
      await api('/api/admin/privacy/retention', 'PATCH', {
        category: policy.category,
        retentionDays: clear ? null : days,
        legalBasis: basis,
      });
      if (clear) setDays('');
      onChange();
    } catch (err) {
      onError((err as Error).message);
    }
  }

  return (
    <tr>
      <td><strong>{policy.category}</strong><div className={styles.sub}>{policy.description}</div></td>
      <td><input className={styles.input} type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} placeholder="Not set" /></td>
      <td><input className={styles.input} value={basis} onChange={(e) => setBasis(e.target.value)} placeholder="Approval or legal basis" /></td>
      <td>{policy.approvedAt ? `${policy.approvedBy}, ${when(policy.approvedAt)}` : 'Not approved: never deleted'}</td>
      <td className={styles.nowrap}>
        <button type="button" className={styles.linkButton} onClick={() => save()}>Approve</button>
        {policy.approvedAt && <>{' · '}<button type="button" className={styles.linkButton} onClick={() => save(true)}>Clear</button></>}
      </td>
    </tr>
  );
}

function RetentionTab() {
  const { data, error, reload } = useLoad<any>('/api/admin/privacy/retention');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<any>(null);

  async function run(dryRun: boolean) {
    if (!dryRun && !confirm('Permanently delete everything past its approved period? This cannot be undone.')) return;
    try {
      setMessage('');
      setPreview(await api('/api/admin/privacy/retention', 'POST', { dryRun }));
      reload();
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  async function saveSetting(settingKey: string, value: string) {
    try {
      await api('/api/admin/privacy/retention', 'PATCH', { settingKey, value });
      setMessage('Saved. New requests and incidents use this value.');
      reload();
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  return (
    <>
      <p className={styles.intro}>Nothing is deleted automatically until a period is approved here. Records on legal hold are always kept. Enter periods only after legal review.</p>
      {(error || message) && <p role="status" className={styles.message}>{error || message}</p>}
      <table className={styles.table}>
        <thead><tr><th>Category</th><th>Days</th><th>Approval or legal basis</th><th>Approved</th><th></th></tr></thead>
        <tbody>{data?.policies?.map((policy: any) => <RetentionRow key={policy.category + (policy.approvedAt || '')} policy={policy} onChange={reload} onError={setMessage} />)}</tbody>
      </table>
      <div className={styles.row}>
        <button type="button" className={styles.secondary} onClick={() => run(true)}>Preview what would be deleted</button>
        <button type="button" className={styles.danger} onClick={() => run(false)}>Run deletion now</button>
      </div>
      {preview && (
        <ul className={styles.timeline}>
          {preview.results.map((row: any) => <li key={row.category}><strong>{row.category}</strong>: {row.status === 'skipped: no approved period' ? 'skipped, no approved period' : `${row.affected} ${preview.dryRun ? 'would be deleted' : 'deleted'}`}</li>)}
        </ul>
      )}

      <h4>Deadlines</h4>
      <p className={styles.intro}>Confirm these against the current rules with your legal adviser.</p>
      {data?.settings?.map((setting: any) => (
        <form
          key={setting.key + setting.value}
          className={styles.row}
          onSubmit={(event) => {
            event.preventDefault();
            saveSetting(setting.key, String(new FormData(event.currentTarget).get('value')));
          }}
        >
          <label className={styles.field} style={{ flex: 1 }}>{setting.label}
            <input className={styles.input} name="value" type="number" min="1" defaultValue={setting.value} />
          </label>
          <button type="submit" className={styles.secondary}>Save</button>
        </form>
      ))}

      <h4>Recent runs</h4>
      <table className={styles.table}>
        <thead><tr><th>Time</th><th>Category</th><th>Action</th><th>Records</th><th>Mode</th><th>Trigger</th></tr></thead>
        <tbody>
          {data?.logs?.length === 0 && <tr><td colSpan={6}>No runs yet.</td></tr>}
          {data?.logs?.map((log: any) => (
            <tr key={log.id}><td>{when(log.createdAt)}</td><td>{log.category}</td><td>{log.action}</td><td>{log.affected}</td><td>{log.dryRun ? 'Preview' : 'Live'}</td><td>{log.trigger}</td></tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function ProcessorsTab() {
  const { data, error } = useLoad<any>('/api/admin/privacy/records?view=processors');
  return (
    <>
      <p className={styles.intro}>Everything that receives personal data from this website. Update data/privacy/processors.js before connecting anything new.</p>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <table className={styles.table}>
        <thead><tr><th>Recipient</th><th>Role</th><th>Purpose</th><th>Data shared</th><th>When</th><th>Contract</th><th>Location</th></tr></thead>
        <tbody>
          {data?.processors?.map((row: any) => (
            <tr key={row.name}><td>{row.name}</td><td>{row.role}</td><td>{row.purpose}</td><td>{row.data}</td><td>{row.trigger}</td><td>{row.contract}</td><td>{row.location}</td></tr>
          ))}
        </tbody>
      </table>
      <h4>Removed during the compliance work</h4>
      <ul className={styles.timeline}>{data?.removed?.map((row: any) => <li key={row.name}><strong>{row.name}</strong>: {row.change}</li>)}</ul>
    </>
  );
}

function AuditTab() {
  const { data, error } = useLoad<any>('/api/admin/privacy/records?view=audit');
  return (
    <>
      <p className={styles.intro}>The latest 300 administrative actions. Entries hold record IDs and field names, not personal details.</p>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <table className={styles.table}>
        <thead><tr><th>Time</th><th>Staff</th><th>Action</th><th>Record</th><th>Details</th></tr></thead>
        <tbody>
          {data?.entries?.map((entry: any) => (
            <tr key={entry.id}>
              <td>{when(entry.createdAt)}</td>
              <td>{entry.actorEmail || 'System'}</td>
              <td>{entry.action}</td>
              <td>{entry.entityType ? `${entry.entityType} ${entry.entityId || ''}` : '—'}</td>
              <td className={styles.wrap}>{entry.metadata || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default function PrivacyAdminPage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [tab, setTab] = useState('');

  useEffect(() => {
    api('/api/admin/auth')
      .then((data) => {
        if (!data.authenticated) {
          router.replace('/admin/login/');
          return;
        }
        setMe(data.user);
        // ?tab=consent-audit opens that tab directly, if this user may see it.
        const allowed = TABS.filter((candidate) => data.user.permissions.includes(candidate.permission));
        const requested = new URLSearchParams(window.location.search).get('tab');
        setTab(allowed.find((candidate) => candidate.id === requested)?.id || allowed[0]?.id || '');
      })
      .catch(() => router.replace('/admin/login/'));
  }, [router]);

  if (!me) {
    return (
      <div className={styles.page}>
        <div className={styles.loading} role="status"><span className={styles.spinner} aria-hidden="true" />Loading Privacy &amp; Compliance…</div>
      </div>
    );
  }

  const visible = TABS.filter((candidate) => me.permissions.includes(candidate.permission));
  const groups = [...new Set(visible.map((candidate) => candidate.group))];
  const current = visible.find((candidate) => candidate.id === tab);
  const canManage = me.permissions.includes('privacy:manage');
  const initials = (me.name || me.email || '?').split(/\s+/).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase();

  // Keeps the address in step, so a section can be bookmarked or shared.
  const open = (id: string) => {
    setTab(id);
    window.history.replaceState(null, '', `?tab=${id}`);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link href="/admin/" prefetch={false}>Admin</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Privacy &amp; Compliance</span>
          </nav>
          <h1>Privacy &amp; Compliance</h1>
          <p>DPDP Act requests, consent evidence and data governance in one place.</p>
        </div>
        <div className={styles.headerSide}>
          <span className={styles.user}>
            <span className={styles.avatar} aria-hidden="true">{initials}</span>
            <span>
              <strong>{me.name}</strong>
              <small>{me.role.replace(/_/g, ' ').toLowerCase()}</small>
            </span>
          </span>
          <Link href="/admin/" prefetch={false} className={styles.secondary}>← Dashboard</Link>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <label className={styles.mobileNav}>
            <span>Section</span>
            <select className={styles.input} value={tab} onChange={(event) => open(event.target.value)}>
              {groups.map((group) => (
                <optgroup key={group} label={group}>
                  {visible.filter((candidate) => candidate.group === group).map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>{candidate.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <nav className={styles.nav} aria-label="Privacy sections">
            {groups.map((group) => (
              <div key={group} className={styles.navGroup}>
                <span className={styles.navTitle}>{group}</span>
                {visible.filter((candidate) => candidate.group === group).map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    className={tab === candidate.id ? styles.navItemActive : styles.navItem}
                    aria-current={tab === candidate.id ? 'page' : undefined}
                    onClick={() => open(candidate.id)}
                  >
                    <Icon name={candidate.icon} />
                    <span>{candidate.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <main className={styles.content}>
          {current && (
            <div className={styles.sectionHead}>
              <span className={styles.sectionIcon}><Icon name={current.icon} /></span>
              <div>
                <span className={styles.sectionGroup}>{current.group}</span>
                <h2>{current.label}</h2>
                <p>{current.description}</p>
              </div>
            </div>
          )}
          <div className={styles.body}>
        {!visible.length && <p className={styles.empty}>Your role has no access to this area.</p>}
        {tab === 'requests' && <RequestsTab key="requests" view="requests" canManage={canManage} />}
        {tab === 'grievances' && <RequestsTab key="grievances" view="grievances" canManage={canManage} />}
        {tab === 'consents' && <ConsentsTab />}
        {tab === 'cookies' && <CookieLogTab />}
        {tab === 'consent-audit' && <ConsentAuditTab heading={false} />}
        {tab === 'activity' && <VisitorActivityTab />}
        {tab === 'newsletter' && <NewsletterTab />}
        {tab === 'comments' && <CommentsTab />}
        {tab === 'breaches' && <BreachesTab />}
        {tab === 'retention' && <RetentionTab />}
        {tab === 'processors' && <ProcessorsTab />}
        {tab === 'users' && <UsersPanel currentId={me.id} />}
        {tab === 'audit' && <AuditTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
