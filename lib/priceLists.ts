// Server-side source of truth for the price lists and their PDF design.
//
// data/priceLists.js holds the lists that ship with the site. A PriceList row with the
// same slug replaces one (or hides it, with isDeleted); a row with any other slug is a
// list added in the admin panel. With an empty table the site shows the file unchanged.
import type { PriceList as PriceListRow } from '@prisma/client';
import { priceLists as builtInLists } from '@/data/priceLists';
import { databaseFallback, prisma } from '@/lib/prisma';
import {
  cleanPdfTemplate,
  DEFAULT_PDF_TEMPLATE,
  parseJson,
  type PdfTemplate,
  type PriceListProject,
} from '@/lib/priceListTypes';

export const TEMPLATE_ID = 'default';

export type PriceListEntry = {
  project: PriceListProject;
  isPublished: boolean;
  isBuiltIn: boolean;
  /** A built-in list that has been edited (it can be reset to the file version). */
  isModified: boolean;
  isDeleted: boolean;
  sortOrder: number;
  /** This list's own PDF design, or null to use the shared one. */
  pdfDesign: PdfTemplate | null;
  updatedAt: string | null;
};

const BUILT_IN = builtInLists as unknown as PriceListProject[];

export const isBuiltInSlug = (slug: string) => BUILT_IN.some((list) => list.slug === slug);

/** Every list, including unpublished and deleted ones (admin view). */
export async function getAllPriceLists(): Promise<PriceListEntry[]> {
  const [rows, template] = await Promise.all([
    prisma.priceList.findMany().catch(databaseFallback<PriceListRow[]>('Price lists', [])),
    getPdfTemplate(),
  ]);
  const bySlug = new Map(rows.map((row) => [row.slug, row]));

  const entries: PriceListEntry[] = BUILT_IN.map((file, index) => {
    const row = bySlug.get(file.slug);
    const stored = row ? (parseJson(row.data) as PriceListProject | null) : null;
    const design = row ? parseJson(row.pdfDesign) : null;
    return {
      project: stored ? { ...stored, slug: file.slug } : file,
      isPublished: row ? row.isPublished : true,
      isBuiltIn: true,
      isModified: Boolean(stored),
      isDeleted: row?.isDeleted ?? false,
      sortOrder: row ? row.sortOrder : index,
      pdfDesign: design ? cleanPdfTemplate(design, template) : null,
      updatedAt: row ? row.updatedAt.toISOString() : null,
    };
  });

  rows
    .filter((row) => !isBuiltInSlug(row.slug))
    .forEach((row) => {
      const stored = parseJson(row.data) as PriceListProject | null;
      if (!stored) return;
      const design = parseJson(row.pdfDesign);
      entries.push({
        project: { ...stored, slug: row.slug },
        isPublished: row.isPublished,
        isBuiltIn: false,
        isModified: false,
        isDeleted: row.isDeleted,
        sortOrder: row.sortOrder,
        pdfDesign: design ? cleanPdfTemplate(design, template) : null,
        updatedAt: row.updatedAt.toISOString(),
      });
    });

  return entries.sort((a, b) => a.sortOrder - b.sortOrder || a.project.projectName.localeCompare(b.project.projectName));
}

/** Lists visitors can see, in display order. */
export async function getPublishedPriceLists(): Promise<PriceListProject[]> {
  const entries = await getAllPriceLists();
  return entries.filter((entry) => entry.isPublished && !entry.isDeleted).map((entry) => entry.project);
}

export async function getPriceListEntry(slug: string): Promise<PriceListEntry | null> {
  const entries = await getAllPriceLists();
  return entries.find((entry) => entry.project.slug === slug) ?? null;
}

/** A published list and the PDF design it downloads with. */
export async function getPublicPriceList(slug: string) {
  const [entry, template] = await Promise.all([getPriceListEntry(slug), getPdfTemplate()]);
  if (!entry || !entry.isPublished || entry.isDeleted) return null;
  return { project: entry.project, pdfTemplate: entry.pdfDesign ?? template };
}

/** The shared PDF design, filled with defaults for anything not set. */
export async function getPdfTemplate(): Promise<PdfTemplate> {
  const row = await prisma.priceListTemplate
    .findUnique({ where: { id: TEMPLATE_ID } })
    .catch(databaseFallback('Price list PDF design', null));
  return row ? cleanPdfTemplate(parseJson(row.data)) : DEFAULT_PDF_TEMPLATE;
}

export const builtInPriceList = (slug: string) => BUILT_IN.find((list) => list.slug === slug) ?? null;
