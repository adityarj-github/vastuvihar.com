'use client';

import { useState } from 'react';
import type { PdfTemplate, PriceListProject } from '@/lib/priceListTypes';

/** Builds the flyer-style PDF in the browser. jsPDF is only fetched on click. */
export default function DownloadPriceListButton({
  project,
  template,
  className,
}: {
  project: PriceListProject;
  template: PdfTemplate;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleClick() {
    setBusy(true);
    setFailed(false);
    try {
      const { downloadPriceListPdf } = await import('@/lib/priceListPdf');
      await downloadPriceListPdf(project, template);
    } catch (error) {
      console.error('Price list PDF failed', error);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={handleClick} disabled={busy} aria-busy={busy}>
        {busy ? 'Preparing PDF…' : 'Download Price List (PDF)'}
      </button>
      {failed ? <span role="alert">Could not create the PDF. Please try again.</span> : null}
    </>
  );
}
