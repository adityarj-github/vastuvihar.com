import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/adminAuth';
import { audit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { getPdfTemplate, getPriceListEntry, isBuiltInSlug } from '@/lib/priceLists';
import { cleanPdfTemplate, cleanPriceList } from '@/lib/priceListTypes';
import { revalidatePriceLists } from '@/lib/revalidate';
import { jsonError, logError } from '@/lib/security/request';

type Context = { params: Promise<{ slug: string }> };

/** Saves a list's content, its own PDF design (null = shared design) and publish state. */
export async function PUT(request: Request, { params }: Context) {
  const { admin, response } = await requirePermission(request, 'pricelists:manage');
  if (!admin) return response;
  try {
    const { slug } = await params;
    const entry = await getPriceListEntry(slug);
    if (!entry) return jsonError('Price list not found.', 404);

    const body = await request.json().catch(() => null);
    // The slug is the page URL, so it never changes here; duplicate a list for a new URL.
    const { project, errors } = cleanPriceList({ ...(body?.project || {}), slug });
    if (!project) return jsonError(errors.join(' '), 400);

    const pdfDesign = body?.pdfDesign ? JSON.stringify(cleanPdfTemplate(body.pdfDesign, await getPdfTemplate())) : null;
    const isPublished = body?.isPublished !== false;
    const data = JSON.stringify(project);

    const row = await prisma.priceList.upsert({
      where: { slug },
      update: { data, pdfDesign, isPublished, updatedBy: admin.email },
      create: { slug, data, pdfDesign, isPublished, sortOrder: entry.sortOrder, updatedBy: admin.email },
    });

    revalidatePriceLists();
    await audit(admin, 'price_list.updated', 'price_list', row.id, { slug, isPublished, ownDesign: Boolean(pdfDesign) });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError('admin.priceLists.update', error);
    return jsonError('Failed to save the price list.', 500);
  }
}

/** Quick toggles: { isPublished } or { isDeleted } (false restores a deleted list). */
export async function PATCH(request: Request, { params }: Context) {
  const { admin, response } = await requirePermission(request, 'pricelists:manage');
  if (!admin) return response;
  try {
    const { slug } = await params;
    const entry = await getPriceListEntry(slug);
    if (!entry) return jsonError('Price list not found.', 404);

    const body = await request.json().catch(() => null);
    const change: { isPublished?: boolean; isDeleted?: boolean } = {};
    if (typeof body?.isPublished === 'boolean') change.isPublished = body.isPublished;
    if (typeof body?.isDeleted === 'boolean') change.isDeleted = body.isDeleted;
    if (!Object.keys(change).length) return jsonError('Nothing to change.', 400);

    const row = await prisma.priceList.upsert({
      where: { slug },
      update: { ...change, updatedBy: admin.email },
      create: { slug, data: null, sortOrder: entry.sortOrder, ...change, updatedBy: admin.email },
    });

    revalidatePriceLists();
    const action =
      change.isDeleted === true ? 'deleted' : change.isDeleted === false ? 'restored' : change.isPublished ? 'published' : 'unpublished';
    await audit(admin, `price_list.${action}`, 'price_list', row.id, { slug });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError('admin.priceLists.toggle', error);
    return jsonError('Failed to update the price list.', 500);
  }
}

/**
 * A built-in list is reset to the version in data/priceLists.js (its publish state
 * and position are kept). A list added in the admin panel is removed for good.
 */
export async function DELETE(request: Request, { params }: Context) {
  const { admin, response } = await requirePermission(request, 'pricelists:manage');
  if (!admin) return response;
  try {
    const { slug } = await params;
    const row = await prisma.priceList.findUnique({ where: { slug } });

    if (isBuiltInSlug(slug)) {
      if (row) await prisma.priceList.update({ where: { slug }, data: { data: null, pdfDesign: null, updatedBy: admin.email } });
      revalidatePriceLists();
      await audit(admin, 'price_list.reset', 'price_list', row?.id, { slug });
      return NextResponse.json({ success: true });
    }

    if (!row) return jsonError('Price list not found.', 404);
    await prisma.priceList.delete({ where: { slug } });
    revalidatePriceLists();
    await audit(admin, 'price_list.removed', 'price_list', row.id, { slug });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError('admin.priceLists.delete', error);
    return jsonError('Failed to remove the price list.', 500);
  }
}
