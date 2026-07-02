import { Heading, Text } from "@medusajs/ui"

const features = [
  {
    title: "Free shipping",
    description: "On all orders over €50, delivered fast across Europe.",
  },
  {
    title: "Secure checkout",
    description: "Your payment details are encrypted and never stored.",
  },
  {
    title: "Easy returns",
    description: "Changed your mind? Return within 30 days, no questions asked.",
  },
]

const StoreInfo = () => {
  return (
    <section className="content-container py-16 small:py-24">
      {/* About */}
      <div className="mx-auto max-w-3xl text-center">
        <Heading level="h2" className="text-2xl small:text-3xl font-normal">
          About Sopa Store
        </Heading>
        <Text className="mt-4 text-ui-fg-subtle text-base small:text-lg">
          We hand-pick every product in our catalog for quality and design.
          What started as a small idea has grown into a store we're proud to
          share — thoughtfully sourced goods, honest prices, and a shopping
          experience built to be simple and delightful.
        </Text>
      </div>

      {/* Value props */}
      <div className="mt-14 grid grid-cols-1 gap-8 small:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-lg border border-ui-border-base p-6 text-center"
          >
            <Heading level="h3" className="text-lg font-medium">
              {feature.title}
            </Heading>
            <Text className="mt-2 text-ui-fg-subtle">{feature.description}</Text>
          </div>
        ))}
      </div>
    </section>
  )
}

export default StoreInfo
