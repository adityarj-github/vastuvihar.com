'use client';

import { useMemo, useState } from 'react';
import { DEFAULT_PDF_TEMPLATE, type PdfTemplate, type PriceListProject } from '@/lib/priceListTypes';
import { api, useLoad, when } from './adminApi';
import PdfDesignForm from './PdfDesignForm';
import PdfPreview from './PdfPreview';
import PriceListEditor, { type EditorTarget } from './PriceListEditor';
import styles from './PriceLists.module.css';

type Entry = {
  project: PriceListProject;
  isPublished: boolean;
  isBuiltIn: boolean;
  isModified: boolean;
  isDeleted: boolean;
  sortOrder: number;
  pdfDesign: PdfTemplate | null;
  updatedAt: string | null;
};

type View = { kind: 'list' } | { kind: 'edit'; target: EditorTarget } | { kind: 'design' };

const BLANK_PROJECT: PriceListProject = {
  slug: '',
  projectName: '',
  effectiveDate: '',
  officeAddress: '',
  siteAddress: '',
  contactPhones: '',
  bookingStatus: 'Booking Open',
  bungalows: [{ name: '' }],
  paymentSchedules: [{ title: 'Payment Schedule', steps: [] }],
  notes: [],
};

/** Shared PDF design, previewed with any list. */
function DesignView({
  lists,
  initial,
  onDone,
}: {
  lists: Entry[];
  initial: PdfTemplate;
  onDone: (message?: string) => void;
}) {
  const [template, setTemplate] = useState<PdfTemplate>(initial);
  const [sample, setSample] = useState(lists[0]?.project.slug || '');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const sampleProject = lists.find((entry) => entry.project.slug === sample)?.project || lists[0]?.project;
  const withOwnDesign = lists.filter((entry) => entry.pdfDesign).map((entry) => entry.project.projectName);

  const change = (next: PdfTemplate) => {
    setTemplate(next);
    setDirty(true);
  };

  async function save() {
    setSaving(true);
    setError('');
    try {
      await api('/api/admin/price-list-template', 'PUT', { template });
      setDirty(false);
      onDone('PDF design saved. Every price list without its own design now downloads with it.');
    } catch (err) {
      setError((err as Error).message);
    }
    setSaving(false);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <h2 className={styles.title}>Shared PDF design</h2>
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => {
              if (confirm('Reset every setting to the original Vastu Vihar flyer design? Nothing is saved until you click Save.')) {
                change({ ...DEFAULT_PDF_TEMPLATE });
              }
            }}
          >
            Reset to original
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => {
              if (!dirty || confirm('Discard your unsaved changes?')) onDone();
            }}
          >
            Back to list
          </button>
        </div>
      </div>
      {withOwnDesign.length ? (
        <p className={styles.hint}>
          These lists have their own design and are not affected: {withOwnDesign.join(', ')}.
        </p>
      ) : null}

      <div className={styles.editorLayout}>
        <div className={styles.editorForm}>
          <PdfDesignForm value={template} onChange={change} />
          <div className={styles.stickyBar}>
            <span className={styles.hint}>{dirty ? 'Unsaved changes' : 'No unsaved changes'}</span>
            <button type="button" className={styles.primary} onClick={save} disabled={saving || !dirty}>
              {saving ? 'Saving…' : 'Save design'}
            </button>
          </div>
          {error ? <p role="alert" className={`${styles.message} ${styles.error}`}>{error}</p> : null}
        </div>
        <div className={styles.previewColumn}>
          <label className={styles.field} style={{ marginBottom: 8 }}>
            Preview with
            <select value={sample} onChange={(e) => setSample(e.target.value)}>
              {lists.map((entry) => (
                <option key={entry.project.slug} value={entry.project.slug}>
                  {entry.project.projectName}
                </option>
              ))}
            </select>
          </label>
          {sampleProject ? <PdfPreview project={sampleProject} template={template} /> : <p className={styles.hint}>Add a price list to preview the design.</p>}
        </div>
      </div>
    </div>
  );
}

export default function PriceListsManager() {
  const { data, error, reload } = useLoad<{ lists: Entry[]; template: PdfTemplate }>('/api/admin/price-lists');
  const [view, setView] = useState<View>({ kind: 'list' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  const lists = useMemo(() => data?.lists || [], [data]);
  const template = data?.template || DEFAULT_PDF_TEMPLATE;
  const active = lists.filter((entry) => !entry.isDeleted);
  const deletedCount = lists.length - active.length;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lists
      .filter((entry) => showDeleted || !entry.isDeleted)
      .filter(
        (entry) =>
          !q ||
          [entry.project.projectName, entry.project.slug, entry.project.city, entry.project.state]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q)),
      );
  }, [lists, query, showDeleted]);

  async function act(fn: () => Promise<unknown>, done: string) {
    setBusy(true);
    setMessage('');
    try {
      await fn();
      setMessage(done);
      await reload();
    } catch (err) {
      setMessage((err as Error).message);
    }
    setBusy(false);
  }

  const path = (slug: string) => `/api/admin/price-lists/${encodeURIComponent(slug)}`;

  function reorder(slug: string, by: number) {
    const order = active.map((entry) => entry.project.slug);
    const index = order.indexOf(slug);
    const target = index + by;
    if (index < 0 || target < 0 || target >= order.length) return;
    order.splice(index, 1);
    order.splice(target, 0, slug);
    act(() => api('/api/admin/price-lists', 'PATCH', { order }), 'Order saved.');
  }

  function openEditor(entry: Entry) {
    setMessage('');
    setView({
      kind: 'edit',
      target: {
        project: entry.project,
        isNew: false,
        isBuiltIn: entry.isBuiltIn,
        isPublished: entry.isPublished,
        pdfDesign: entry.pdfDesign,
      },
    });
  }

  function duplicate(entry: Entry) {
    setMessage('');
    let slug = `${entry.project.slug}-copy`;
    for (let n = 2; lists.some((item) => item.project.slug === slug); n += 1) slug = `${entry.project.slug}-copy-${n}`;
    setView({
      kind: 'edit',
      target: {
        project: { ...entry.project, slug, projectName: `${entry.project.projectName} (copy)`, city: undefined, phaseLabel: undefined },
        isNew: true,
        isBuiltIn: false,
        isPublished: false,
        pdfDesign: entry.pdfDesign,
      },
    });
  }

  const backToList = async (done?: string) => {
    setView({ kind: 'list' });
    if (done) setMessage(done);
    await reload();
  };

  if (view.kind === 'edit') {
    return <PriceListEditor key={view.target.project.slug} target={view.target} sharedTemplate={template} onSaved={backToList} onCancel={() => backToList()} />;
  }

  if (view.kind === 'design') {
    return <DesignView lists={active} initial={template} onDone={backToList} />;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <input
            type="text"
            role="searchbox"
            className={styles.search}
            placeholder="Search by name, city or URL…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search price lists"
          />
          {deletedCount ? (
            <label className={styles.check}>
              <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} />
              Show deleted ({deletedCount})
            </label>
          ) : null}
        </div>
        <div className={styles.toolbarGroup}>
          <button type="button" className={styles.secondary} onClick={() => setView({ kind: 'design' })} disabled={!data}>
            PDF design
          </button>
          <button
            type="button"
            className={styles.primary}
            onClick={() =>
              setView({ kind: 'edit', target: { project: BLANK_PROJECT, isNew: true, isBuiltIn: false, isPublished: false, pdfDesign: null } })
            }
          >
            + New price list
          </button>
        </div>
      </div>

      <p className={styles.hint}>
        Changes appear on the website and in the downloadable PDF as soon as you save. Lists with a city appear on the price list index in this order.
      </p>
      {error || message ? <p role="status" className={`${styles.message} ${error ? styles.error : ''}`}>{error || message}</p> : null}
      {!data && !error ? <p className={styles.hint}>Loading…</p> : null}

      {data ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Price list</th>
                <th>Index</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((entry) => {
                const p = entry.project;
                const index = active.indexOf(entry);
                return (
                  <tr key={p.slug} className={entry.isDeleted ? styles.rowDeleted : ''}>
                    <td>
                      {entry.isDeleted || query ? null : (
                        <span className={styles.order}>
                          <button type="button" className={styles.iconButton} disabled={busy || index === 0} onClick={() => reorder(p.slug, -1)} aria-label={`Move ${p.projectName} up`}>
                            ↑
                          </button>
                          <button
                            type="button"
                            className={styles.iconButton}
                            disabled={busy || index === active.length - 1}
                            onClick={() => reorder(p.slug, 1)}
                            aria-label={`Move ${p.projectName} down`}
                          >
                            ↓
                          </button>
                        </span>
                      )}
                    </td>
                    <td>
                      <strong>{p.projectName}</strong>
                      <span className={styles.slug}>/price-list/{p.slug}/</span>
                    </td>
                    <td>{p.city ? `${p.city} · ${p.phaseLabel || p.projectName}` : <span className={styles.slug}>Link only</span>}</td>
                    <td>
                      <span className={styles.badges}>
                        {entry.isDeleted ? (
                          <span className={`${styles.badge} ${styles.badgeRed}`}>Deleted</span>
                        ) : entry.isPublished ? (
                          <span className={`${styles.badge} ${styles.badgeGreen}`}>Published</span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeAmber}`}>Hidden</span>
                        )}
                        {entry.isBuiltIn ? (
                          entry.isModified ? <span className={`${styles.badge} ${styles.badgeBlue}`}>Edited</span> : <span className={styles.badge}>Original</span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeBlue}`}>Added</span>
                        )}
                        {entry.pdfDesign ? <span className={styles.badge}>Own design</span> : null}
                      </span>
                    </td>
                    <td>{when(entry.updatedAt)}</td>
                    <td>
                      <span className={styles.rowActions}>
                        {entry.isDeleted ? (
                          <button type="button" className={styles.small} disabled={busy} onClick={() => act(() => api(path(p.slug), 'PATCH', { isDeleted: false }), `Restored "${p.projectName}".`)}>
                            Restore
                          </button>
                        ) : (
                          <>
                            <button type="button" className={styles.small} disabled={busy} onClick={() => openEditor(entry)}>
                              Edit
                            </button>
                            <button type="button" className={styles.small} disabled={busy} onClick={() => duplicate(entry)}>
                              Duplicate
                            </button>
                            <button
                              type="button"
                              className={styles.small}
                              disabled={busy}
                              onClick={() =>
                                act(
                                  () => api(path(p.slug), 'PATCH', { isPublished: !entry.isPublished }),
                                  entry.isPublished ? `"${p.projectName}" is now hidden.` : `"${p.projectName}" is now published.`,
                                )
                              }
                            >
                              {entry.isPublished ? 'Hide' : 'Publish'}
                            </button>
                            {entry.isBuiltIn && entry.isModified ? (
                              <button
                                type="button"
                                className={styles.small}
                                disabled={busy}
                                onClick={() => {
                                  if (confirm(`Undo every edit to "${p.projectName}" and go back to the original version?`)) {
                                    act(() => api(path(p.slug), 'DELETE'), `"${p.projectName}" is back to the original version.`);
                                  }
                                }}
                              >
                                Reset
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className={styles.danger}
                              disabled={busy}
                              onClick={() => {
                                if (entry.isBuiltIn) {
                                  if (confirm(`Delete "${p.projectName}"? Its page will stop working. You can restore it later.`)) {
                                    act(() => api(path(p.slug), 'PATCH', { isDeleted: true }), `Deleted "${p.projectName}".`);
                                  }
                                } else if (confirm(`Delete "${p.projectName}" permanently? This can't be undone.`)) {
                                  act(() => api(path(p.slug), 'DELETE'), `Deleted "${p.projectName}".`);
                                }
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!shown.length ? <p className={styles.hint}>No price lists match.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
