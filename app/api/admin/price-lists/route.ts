import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/adminAuth';
import { audit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { getAllPriceLists, getPdfTemplate, isBuiltInSlug } from '@/lib/priceLists';
import { cleanPdfTemplate, cleanPriceList } from '@/lib/priceListTypes';
import { revalidatePriceLists } from '@/lib/revalidate';
import { jsonError, logError } from '@/lib/security/request';

/** Every list (with unpublished and deleted ones) and the shared PDF design. */
export async function GET(request: Request) {
  const { admin, response } = await requirePermission(request, 'pricelists:manage');
  if (!admin) return response;
  try {
    const [lists, template] = await Promise.all([getAllPriceLists(), getPdfTemplate()]);
    return NextResponse.json({ success: true, lists, template });
  } catch (error) {
    logError('admin.priceLists.list', error);
    return jsonError('Failed to load the price lists.', 500);
  }
}

/** Adds a new list. Its slug must not be used by any list, including deleted ones. */
export async function POST(request: Request) {
  const { admin, response } = await requirePermission(request, 'pricelists:manage');
  if (!admin) return response;
  try {
    const body = await request.json().catch(() => null);
    const { project, errors } = cleanPriceList(body?.project);
    if (!project) return jsonError(errors.join(' '), 400);

    if (isBuiltInSlug(project.slug) || (await prisma.priceList.findUnique({ where: { slug: project.slug } }))) {
      return jsonError('Another price list already uses this URL slug.', 409);
    }

    const template = await getPdfTemplate();
    const last = await prisma.priceList.aggregate({ _max: { sortOrder: true } });
    const all = await getAllPriceLists();
    const sortOrder = Math.max(last._max.sortOrder ?? 0, all.length) + 1;

    const row = await prisma.priceList.create({
      data: {
        slug: project.slug,
        data: JSON.stringify(project),
        pdfDesign: body?.pdfDesign ? JSON.stringify(cleanPdfTemplate(body.pdfDesign, template)) : null,
        isPublished: body?.isPublished !== false,
        sortOrder,
        updatedBy: admin.email,
      },
    });

    revalidatePriceLists();
    await audit(admin, 'price_list.created', 'price_list', row.id, { slug: project.slug });
    return NextResponse.json({ success: true, slug: project.slug }, { status: 201 });
  } catch (error) {
    logError('admin.priceLists.create', error);
    return jsonError('Failed to create the price list.', 500);
  }
}

/** Saves the display order: { order: [slug, ...] }. */
export async function PATCH(request: Request) {
  const { admin, response } = await requirePermission(request, 'pricelists:manage');
  if (!admin) return response;
  try {
    const body = await request.json().catch(() => null);
    const order: unknown[] = Array.isArray(body?.order) ? body.order.slice(0, 500) : [];
    const current = (await getAllPriceLists()).map((entry) => entry.project.slug);
    const given = [...new Set(order.filter((slug): slug is string => typeof slug === 'string' && current.includes(slug)))];
    if (!given.length) return jsonError('No price lists to reorder.', 400);
    // Lists left out (deleted ones, for example) follow in their current order, so no two share a position.
    const slugs = [...given, ...current.filter((slug) => !given.includes(slug))];

    // A built-in list without a row gets one that stores only its position (data null).
    // Written one by one: the D1 adapter gives no atomic batch, and a partial save
    // only leaves an order the admin can save again.
    for (const [index, slug] of slugs.entries()) {
      await prisma.priceList.upsert({
        where: { slug },
        update: { sortOrder: index, updatedBy: admin.email },
        create: { slug, data: null, sortOrder: index, updatedBy: admin.email },
      });
    }

    revalidatePriceLists();
    await audit(admin, 'price_list.reordered', 'price_list', undefined, { count: slugs.length });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError('admin.priceLists.reorder', error);
    return jsonError('Failed to save the order.', 500);
  }
}
