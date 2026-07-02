import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

/**
 * On-demand revalidation endpoint.
 *
 * Called by the Medusa backend (see apps/backend/src/subscribers/revalidate-storefront.ts)
 * whenever catalog data changes, so the storefront reflects updates without a redeploy.
 *
 * Auth: `?secret=` must match REVALIDATE_SECRET (same value on backend + storefront).
 *
 * We revalidate the root layout (the whole storefront) because a product/collection
 * change can affect the home page, store listing, collection pages, and product pages.
 * This starter also tags fetches per-visitor (`_medusa_cache_id` cookie), which makes
 * global tag-based revalidation unreliable — path revalidation is the robust choice.
 */
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { message: "Invalid or missing secret" },
      { status: 401 }
    )
  }

  revalidatePath("/", "layout")

  return NextResponse.json({ revalidated: true })
}
