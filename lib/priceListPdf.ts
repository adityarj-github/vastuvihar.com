// Builds the downloadable project price list as a PDF laid out like the printed
// Vastu Vihar flyer (public/ara_ph_2_ext.jpeg): red company header with the logo
// tab, big bungalow table, flats + specification on the left, payment schedules
// + notes on the right, red footer band.
//
// Runs in the browser only. It is loaded on demand by DownloadPriceListButton so
// jsPDF never ships in the page bundle.
import { jsPDF } from 'jspdf';

type Unit = {
  name: string;
  model?: string;
  carpetArea?: string;
  builtUpArea?: string;
  landArea?: string;
  deluxePrice?: string;
  luxuryPrice?: string;
};

type Spec = { particular: string; deluxe?: string; luxury?: string };

export type PriceListPdfProject = {
  slug: string;
  projectName: string;
  effectiveDate: string;
  officeAddress: string;
  siteAddress: string;
  contactPhones: string;
  email?: string;
  bookingStatus?: string;
  footerMessage?: string;
  bungalows?: Unit[];
  flats?: Unit[];
  shops?: Unit[];
  parking?: Array<{ name: string; size?: string; price?: string | number }>;
  paymentSchedules: Array<{ title: string; steps: string[] }>;
  specifications?: Spec[];
  specificationNote?: string;
  shopSpecifications?: Spec[];
  notes: string[];
};

// Printed on every Vastu Vihar price list sheet.
const COMPANY_NAME = 'TECHNOCULTURE BUILDING CENTRE PVT. LTD.';
const HELPLINE = '95340 95340';
const WEBSITE = 'www.vastuvihar.org';
const LOGO_SRC = '/images/vastu-logo.webp';

type RGB = [number, number, number];
const RED: RGB = [237, 28, 36];
const RED_DARK: RGB = [160, 16, 22];
const CREAM: RGB = [253, 247, 220];
const YELLOW: RGB = [253, 233, 166];
const LINE: RGB = [240, 165, 49];
const HEAD_LINE: RGB = [247, 190, 192];
const INK: RGB = [29, 29, 27];
const GREY: RGB = [58, 58, 58];
const WHITE: RGB = [255, 255, 255];

const PAGE_W = 210;
const A4_H = 297;
const M = 8; // side margin, mm
const PT = 0.3528; // mm per point
const HEADER_H = 30;
/** Space kept free at the bottom for the signature line and the footer band. */
const BOTTOM_RESERVE = 25;
/** Below this scale the text gets too small to read, so the page grows instead. */
const MIN_SCALE = 0.8;

type Logo = { data: string; w: number; h: number };

const setFill = (doc: jsPDF, c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
const setStroke = (doc: jsPDF, c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
const setInk = (doc: jsPDF, c: RGB) => doc.setTextColor(c[0], c[1], c[2]);

function setFont(doc: jsPDF, size: number, style = 'bold', family = 'helvetica') {
  doc.setFont(family, style);
  doc.setFontSize(size);
}

/** Largest font size (down to `min`) at which `text` fits in `maxW`. */
function fitSize(doc: jsPDF, text: string, maxW: number, size: number, min = 5) {
  let s = size;
  doc.setFontSize(s);
  while (s > min && doc.getTextWidth(text) > maxW) {
    s -= 0.25;
    doc.setFontSize(s);
  }
  return s;
}

/** Filled closed polygon from absolute points. */
function polygon(doc: jsPDF, pts: Array<[number, number]>) {
  const deltas = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]);
  doc.lines(deltas, pts[0][0], pts[0][1], [1, 1], 'F', true);
}

/** Splits "(01) Booking amount..." into "01" and "Booking amount...". */
function splitNumbered(text: string, index: number) {
  const match = text.match(/^\(?\(?(\d+)\)\s*/);
  if (!match) return { num: String(index + 1).padStart(2, '0'), body: text };
  return { num: match[1], body: text.slice(match[0].length) };
}

function unitKinds(p: PriceListPdfProject) {
  const kinds = [
    p.bungalows?.length ? 'Bungalow' : null,
    p.flats?.length ? 'Flat' : null,
    p.shops?.length ? 'Shop' : null,
  ].filter(Boolean) as string[];
  if (kinds.length <= 1) return kinds.join('');
  return `${kinds.slice(0, -1).join(', ')} & ${kinds[kinds.length - 1]}`;
}

type Col = { label: string; sub?: string; weight: number; left?: boolean };

/** Columns and cell text for a unit table, showing only columns that have data. */
function unitColumns(title: string, items: Unit[]) {
  const has = (key: keyof Unit) => items.some((item) => item[key]);
  const hasLuxury = has('luxuryPrice');
  const cols: Array<Col & { get: (u: Unit) => string | undefined }> = [
    { label: title, weight: 1.75, left: true, get: (u) => u.name },
  ];
  if (has('model')) cols.push({ label: 'Model', weight: 0.75, get: (u) => u.model });
  if (has('carpetArea')) cols.push({ label: 'Carpet Area', sub: '(Sq. Ft.)', weight: 1, get: (u) => u.carpetArea });
  if (has('builtUpArea')) cols.push({ label: 'B.U.A', sub: '(Sq. Ft.)', weight: 0.9, get: (u) => u.builtUpArea });
  if (has('landArea')) cols.push({ label: 'Land Area', sub: '(Sq. Ft.)', weight: 1, get: (u) => u.landArea });
  if (has('deluxePrice')) cols.push({ label: hasLuxury ? 'Deluxe' : 'Price', weight: 1.15, get: (u) => u.deluxePrice });
  if (hasLuxury) cols.push({ label: 'Luxury', weight: 1.15, get: (u) => u.luxuryPrice });

  return {
    cols,
    rows: items.map((item) => cols.map((col) => col.get(item) || '-')),
  };
}

type TableStyle = {
  headH: number;
  rowH: number;
  headSize: number;
  bodySize: number;
  italicHead?: boolean;
  redNames?: boolean;
};

/** Red header, yellow rows, orange grid. Returns the bottom y. */
function drawUnitTable(doc: jsPDF, x: number, y: number, w: number, cols: Col[], rows: string[][], st: TableStyle) {
  const total = cols.reduce((sum, col) => sum + col.weight, 0);
  const widths = cols.map((col) => (w * col.weight) / total);
  const xs = widths.map((_, i) => x + widths.slice(0, i).reduce((a, b) => a + b, 0));
  const pad = 2.5;
  const bodyTop = y + st.headH;
  const bottom = bodyTop + rows.length * st.rowH;

  setFill(doc, RED);
  doc.rect(x, y, w, st.headH, 'F');
  setFill(doc, YELLOW);
  doc.rect(x, bodyTop, w, bottom - bodyTop, 'F');

  setInk(doc, WHITE);
  cols.forEach((col, i) => {
    const tx = col.left ? xs[i] + pad : xs[i] + widths[i] / 2;
    const align = col.left ? 'left' : 'center';
    setFont(doc, st.headSize, st.italicHead ? 'bolditalic' : 'bold');
    fitSize(doc, col.label, widths[i] - 2 * pad, st.headSize);
    doc.text(col.label, tx, col.sub ? y + st.headH * 0.4 : y + st.headH / 2, { align, baseline: 'middle' });
    if (col.sub) {
      setFont(doc, Math.max(st.headSize * 0.42, 5), 'italic');
      doc.text(col.sub, tx, y + st.headH * 0.78, { align, baseline: 'middle' });
    }
  });

  rows.forEach((row, r) => {
    const cy = bodyTop + r * st.rowH + st.rowH / 2;
    row.forEach((cell, i) => {
      const left = cols[i].left;
      setFont(doc, st.bodySize, 'bold');
      fitSize(doc, cell, widths[i] - 2 * pad, st.bodySize);
      setInk(doc, i === 0 && st.redNames ? RED : INK);
      doc.text(cell, left ? xs[i] + pad : xs[i] + widths[i] / 2, cy, { align: left ? 'left' : 'center', baseline: 'middle' });
    });
  });

  // Grid
  doc.setLineWidth(0.3);
  setStroke(doc, HEAD_LINE);
  xs.slice(1).forEach((lx) => doc.line(lx, y, lx, bodyTop));
  setStroke(doc, LINE);
  xs.slice(1).forEach((lx) => doc.line(lx, bodyTop, lx, bottom));
  for (let r = 1; r < rows.length; r += 1) doc.line(x, bodyTop + r * st.rowH, x + w, bodyTop + r * st.rowH);
  doc.setLineWidth(0.6);
  setStroke(doc, RED);
  doc.rect(x, y, w, bottom - y, 'S');

  return bottom;
}

/** Plain yellow grid table with wrapping cells (specifications). Returns the bottom y. */
function drawSpecTable(doc: jsPDF, x: number, y: number, w: number, rows: string[][], weights: number[], size: number) {
  const total = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map((wt) => (w * wt) / total);
  const xs = widths.map((_, i) => x + widths.slice(0, i).reduce((a, b) => a + b, 0));
  const pad = 1.5;
  const lineH = size * PT * 1.2;

  setFont(doc, size, 'bold');
  doc.setLineWidth(0.3);
  setStroke(doc, LINE);
  let ry = y;
  rows.forEach((row) => {
    const lines = row.map((cell, i) => doc.splitTextToSize(cell || '-', widths[i] - 2 * pad) as string[]);
    const h = Math.max(...lines.map((l) => l.length)) * lineH + 2 * pad - 0.4;
    setFill(doc, YELLOW);
    doc.rect(x, ry, w, h, 'F');
    setInk(doc, INK);
    lines.forEach((cellLines, i) => {
      doc.text(cellLines, xs[i] + pad, ry + pad, { baseline: 'top', lineHeightFactor: 1.2 });
      doc.rect(xs[i], ry, widths[i], h, 'S');
    });
    ry += h;
  });
  return ry;
}

/** Red heading strip with a cut right corner and a folded tab. Returns the bottom y. */
function drawRibbon(doc: jsPDF, x: number, y: number, text: string, size: number, k: number, maxW: number) {
  setFont(doc, size, 'bold');
  const s = fitSize(doc, text, maxW - 12 * k, size);
  const h = s * PT * 1.9;
  const w = doc.getTextWidth(text) + 12 * k;
  setFill(doc, RED);
  polygon(doc, [[x, y], [x + w, y], [x + w - 4 * k, y + h], [x, y + h]]);
  setFill(doc, RED_DARK);
  polygon(doc, [[x, y + h], [x + 2.5 * k, y + h], [x + 2.5 * k, y + h + 2.2 * k]]);
  setInk(doc, WHITE);
  doc.text(text, x + 3 * k, y + h / 2, { baseline: 'middle' });
  return y + h;
}

/** "(01) text" list with hanging indent. Returns the bottom y. */
function drawNumbered(doc: jsPDF, x: number, y: number, w: number, items: string[], size: number) {
  setFont(doc, size, 'bold');
  setInk(doc, INK);
  const lineH = size * PT * 1.4;
  const numW = doc.getTextWidth('(00)') + 1.6;
  let cy = y;
  items.forEach((item, i) => {
    const { num, body } = splitNumbered(item, i);
    const lines = doc.splitTextToSize(body, w - numW) as string[];
    // Drawn as a one-item array so it shares the body's line metrics and sits level with it.
    doc.text([`(${num})`], x, cy, { baseline: 'top', lineHeightFactor: 1.4 });
    doc.text(lines, x + numW, cy, { baseline: 'top', lineHeightFactor: 1.4 });
    cy += lines.length * lineH + 0.5;
  });
  return cy;
}

/** Draws the whole sheet at scale `k` on a page `pageH` tall. Returns the bottom of the content. */
function render(doc: jsPDF, p: PriceListPdfProject, k: number, pageH: number, logo: Logo | null) {
  setFill(doc, CREAM);
  doc.rect(0, 0, PAGE_W, pageH, 'F');

  const tabX = 9;
  const tabW = 42;
  const textLeft = tabX + tabW + 4;
  const textW = PAGE_W - 5 - textLeft;
  const textX = textLeft + textW / 2;

  // Address lines shrink a little to stay on one line; past that they wrap and the band grows.
  const phones = p.contactPhones.split(/[\/,]/).map((s) => s.trim()).filter(Boolean).join(' / ');
  const infoSize = 9.5;
  const infoMin = 8;
  const infoLines: Array<{ text: string; size: number }> = [];
  [
    `Office Address : ${p.officeAddress}`,
    `Call : ${phones}${p.email ? `, Email : ${p.email}` : ''}`,
    `Site Address : ${p.siteAddress}`,
  ].forEach((line) => {
    setFont(doc, infoSize, 'bold');
    const size = fitSize(doc, line, textW, infoSize, infoMin);
    if (doc.getTextWidth(line) <= textW) {
      infoLines.push({ text: line, size });
      return;
    }
    (doc.splitTextToSize(line, textW) as string[]).forEach((part) => infoLines.push({ text: part, size: infoMin }));
  });
  const infoStep = 4.6;
  const headerH = Math.max(HEADER_H, 16 + infoLines.length * infoStep);
  const tabH = headerH + 5;

  // ---- Header band with logo tab ----
  setFill(doc, RED);
  doc.rect(0, 0, PAGE_W, headerH, 'F');
  setFill(doc, WHITE);
  polygon(doc, [[tabX, 0], [tabX + tabW, 0], [tabX + tabW, tabH], [tabX + tabW / 2, tabH - 5], [tabX, tabH]]);
  if (logo) {
    const lw = 35;
    const lh = (lw * logo.h) / logo.w;
    doc.addImage(logo.data, 'JPEG', tabX + (tabW - lw) / 2, 5, lw, lh);
  }

  setInk(doc, WHITE);
  setFont(doc, 21, 'bold');
  fitSize(doc, COMPANY_NAME, textW, 21);
  doc.text(COMPANY_NAME, textX, 9.5, { align: 'center', baseline: 'middle' });

  infoLines.forEach((line, i) => {
    setFont(doc, line.size, 'bold');
    doc.text(line.text, textX, 17 + i * infoStep, { align: 'center', baseline: 'middle' });
  });

  // ---- Title row ----
  let y = headerH + 9;
  setInk(doc, GREY);
  setFont(doc, 19, 'bolditalic');
  fitSize(doc, p.projectName, PAGE_W - M - (tabX + tabW + 6), 19);
  doc.text(p.projectName, PAGE_W - M, y, { align: 'right' });
  y += 7.5;
  setInk(doc, RED);
  const effective = `Effective From ${p.effectiveDate}`;
  setFont(doc, 14, 'bolditalic');
  fitSize(doc, effective, 120, 14);
  doc.text(effective, PAGE_W - M, y, { align: 'right' });
  const kinds = unitKinds(p);
  setFont(doc, 9.5, 'bolditalic');
  doc.text(kinds ? `Price List of ${kinds}` : 'Price List', M + 2, y);
  y += 3.5;

  // ---- Headline table: bungalows, or flats/shops when a project has none ----
  const unitGroups: Array<{ title: string; items: Unit[] }> = [
    { title: 'Model Bungalow', items: p.bungalows || [] },
    { title: 'Model Flat', items: p.flats || [] },
    { title: 'Model Shop', items: p.shops || [] },
  ].filter((group) => group.items.length);
  const [headline, ...otherGroups] = unitGroups;

  if (headline) {
    const { cols, rows } = unitColumns(headline.title, headline.items);
    y = drawUnitTable(doc, M, y, PAGE_W - 2 * M, cols, rows, {
      headH: 14 * k,
      rowH: 11 * k,
      headSize: 17 * k,
      bodySize: 17 * k,
      italicHead: true,
      redNames: true,
    });
  }
  y += 7 * k;

  // ---- Two columns ----
  const leftX = M;
  const leftW = 112;
  const rightX = leftX + leftW + 6;
  const rightW = PAGE_W - M - rightX;
  let ly = y;
  let ry = y;

  const smallTable: TableStyle = { headH: 10 * k, rowH: 8 * k, headSize: 11 * k, bodySize: 10.5 * k };
  otherGroups.forEach((group) => {
    const { cols, rows } = unitColumns(group.title, group.items);
    ly = drawUnitTable(doc, leftX, ly, leftW, cols, rows, smallTable) + 6 * k;
  });

  if (p.parking?.length) {
    const cols: Col[] = [
      { label: 'Parking', weight: 1.6, left: true },
      { label: 'Size', weight: 1 },
      { label: 'Price', weight: 1 },
    ];
    const rows = p.parking.map((item) => [
      item.name,
      item.size || '-',
      typeof item.price === 'number' ? item.price.toLocaleString('en-IN') : item.price || '-',
    ]);
    ly = drawUnitTable(doc, leftX, ly, leftW, cols, rows, smallTable) + 6 * k;
  }

  if (p.specifications?.length) {
    ly = drawRibbon(doc, leftX, ly, 'SPECIFICATION', 12 * k, k, leftW) + 3 * k;
    const indent = 4 * k;
    // Flat-only projects list a single specification; drop the empty Luxury column then.
    const specs = p.specifications;
    const twoGrades = specs.some((s) => s.luxury);
    const rows = twoGrades
      ? [['Particular', 'Deluxe', 'Luxury'], ...specs.map((s) => [s.particular, s.deluxe || '-', s.luxury || '-'])]
      : [['Particular', 'Specification'], ...specs.map((s) => [s.particular, s.deluxe || '-'])];
    ly = drawSpecTable(doc, leftX + indent, ly, leftW - indent, rows, twoGrades ? [1, 1.3, 1.6] : [1, 2], 7 * k);

    if (p.specificationNote) {
      const pad = 2 * k;
      setFont(doc, 7.8 * k, 'bold');
      const lines = doc.splitTextToSize(p.specificationNote, leftW - indent - 2 * pad) as string[];
      const h = lines.length * 7.8 * k * PT * 1.35 + 2 * pad;
      setFill(doc, RED);
      doc.rect(leftX + indent, ly + 1.5 * k, leftW - indent, h, 'F');
      setInk(doc, WHITE);
      doc.text(lines, leftX + indent + pad, ly + 1.5 * k + pad, { baseline: 'top', lineHeightFactor: 1.35 });
      ly += 1.5 * k + h;
    }
    ly += 5 * k;
  }

  const listSize = 8.3 * k;
  p.paymentSchedules.forEach((schedule) => {
    ry = drawRibbon(doc, rightX, ry, schedule.title, 11 * k, k, rightW) + 2.8 * k;
    ry = drawNumbered(doc, rightX + 3 * k, ry, rightW - 3 * k, schedule.steps, listSize) + 3.5 * k;
  });

  if (p.notes?.length) {
    ry = drawRibbon(doc, rightX, ry, 'Note:-', 11 * k, k, rightW) + 2.8 * k;
    ry = drawNumbered(doc, rightX + 3 * k, ry, rightW - 3 * k, p.notes, listSize) + 3.5 * k;
  }

  if (p.shopSpecifications?.length) {
    ry = drawRibbon(doc, rightX, ry, 'Shop Specification', 11 * k, k, rightW) + 2.8 * k;
    const rows = p.shopSpecifications.map((s) => [s.particular, s.deluxe || s.luxury || '-']);
    ry = drawSpecTable(doc, rightX + 3 * k, ry, rightW - 3 * k, rows, [1, 1.5], 7 * k) + 4 * k;
  }

  if (p.bookingStatus) {
    const size = 24 * k;
    setFont(doc, size, 'bolditalic');
    setInk(doc, RED);
    const tw = doc.getTextWidth(p.bookingStatus);
    ry += size * PT + 2 * k;
    doc.text(p.bookingStatus, PAGE_W - M - tw, ry, { angle: 5 });
    ry += 3 * k;
  }

  const contentBottom = Math.max(ly, ry);

  // ---- Signatures and footer band, pinned to the page bottom ----
  const bandTop = pageH - 9;
  setInk(doc, INK);
  setFont(doc, 6.5, 'bold');
  const signY = bandTop - 9;
  ['Marketing Signature', 'Project Head Signature', 'Customer Signature'].forEach((label, i) => {
    doc.text(label, leftX + 4 + i * 44, signY);
  });

  setFill(doc, RED);
  doc.rect(0, bandTop, PAGE_W, 9, 'F');
  polygon(doc, [[146, bandTop], [153, bandTop - 6], [PAGE_W, bandTop - 6], [PAGE_W, bandTop]]);
  setInk(doc, WHITE);
  setFont(doc, 12.5, 'bold');
  doc.text(`For Any Cities : ${HELPLINE}    |    ${WEBSITE}`, 70, bandTop + 4.8, { align: 'center', baseline: 'middle' });
  setFont(doc, 17, 'bolditalic', 'times');
  doc.text(p.footerMessage || 'Thanks For Visit', 178, bandTop + 1.2, { align: 'center', baseline: 'middle' });

  return contentBottom;
}

async function loadLogo(): Promise<Logo> {
  const img = new Image();
  img.src = LOGO_SRC;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  return { data: canvas.toDataURL('image/jpeg', 0.92), w: canvas.width, h: canvas.height };
}

/** Builds the PDF for one project. One A4 page; long lists shrink slightly, then the page grows. */
export async function buildPriceListPdf(p: PriceListPdfProject) {
  const logo = await loadLogo().catch(() => null);

  let k = 1;
  let bottom = 0;
  for (;;) {
    bottom = render(new jsPDF({ unit: 'mm', format: 'a4' }), p, k, A4_H, null);
    if (bottom <= A4_H - BOTTOM_RESERVE || k <= MIN_SCALE) break;
    k = Math.round((k - 0.05) * 100) / 100;
  }

  const pageH = Math.max(A4_H, Math.ceil(bottom + BOTTOM_RESERVE));
  const doc = new jsPDF({ unit: 'mm', format: pageH === A4_H ? 'a4' : [PAGE_W, pageH], orientation: 'portrait' });
  render(doc, p, k, pageH, logo);
  doc.setProperties({ title: `${p.projectName} Price List`, author: 'Vastu Vihar', subject: `Effective ${p.effectiveDate}` });
  return doc;
}

export async function downloadPriceListPdf(p: PriceListPdfProject) {
  const doc = await buildPriceListPdf(p);
  doc.save(`vastu-vihar-${p.slug}-price-list.pdf`);
}
