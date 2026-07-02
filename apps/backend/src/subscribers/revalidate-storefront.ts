import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

/**
 * Tells the Next.js storefront to revalidate its cache when catalog data changes,
 * so product/collection edits show up without redeploying.
 *
 * Requires two env vars on the backend:
 *   - STOREFRONT_URL      e.g. https://sopa-stores-frontend.vercel.app
 *   - REVALIDATE_SECRET   must match the storefront's REVALIDATE_SECRET
 */
export default async function revalidateStorefront({
  event,
}: SubscriberArgs<{ id: string }>) {
  const storefrontUrl = process.env.STOREFRONT_URL
  const secret = process.env.REVALIDATE_SECRET

  if (!storefrontUrl || !secret) {
    console.warn(
      "[revalidate-storefront] STOREFRONT_URL or REVALIDATE_SECRET not set — skipping"
    )
    return
  }

  try {
    const res = await fetch(
      `${storefrontUrl}/api/revalidate?secret=${encodeURIComponent(secret)}`,
      { method: "POST" }
    )

    if (!res.ok) {
      console.error(
        `[revalidate-storefront] failed (${res.status}) after "${event.name}"`
      )
    }
  } catch (err) {
    console.error("[revalidate-storefront] error calling storefront:", err)
  }
}

export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated",
    "product.deleted",
    "product-collection.created",
    "product-collection.updated",
    "product-collection.deleted",
  ],
}
