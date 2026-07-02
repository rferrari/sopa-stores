import { Heading, Text } from "@medusajs/ui"

const reviews = [
  {
    name: "Sofia M.",
    location: "Lisbon, PT",
    text: "Beautifully packaged and even better in person. Ordering again already.",
  },
  {
    name: "Lucas R.",
    location: "Berlin, DE",
    text: "Fast shipping and the quality is genuinely premium. Worth every euro.",
  },
  {
    name: "Emma T.",
    location: "Amsterdam, NL",
    text: "The checkout was effortless and my order arrived two days early.",
  },
  {
    name: "Marco B.",
    location: "Milan, IT",
    text: "Exactly what the photos promised. The attention to detail shows.",
  },
  {
    name: "Chloé D.",
    location: "Paris, FR",
    text: "Customer service answered in minutes. Rare these days — loved it.",
  },
  {
    name: "Oliver S.",
    location: "London, UK",
    text: "My third order this year. Consistent quality keeps me coming back.",
  },
  {
    name: "Ana G.",
    location: "Madrid, ES",
    text: "Sustainable, stylish, and reasonably priced. My new go-to store.",
  },
  {
    name: "Niklas H.",
    location: "Copenhagen, DK",
    text: "Minimal design, maximum quality. Feels like a store that cares.",
  },
  {
    name: "Julia W.",
    location: "Vienna, AT",
    text: "Returns were painless — though I ended up keeping everything.",
  },
  {
    name: "Tomás F.",
    location: "Porto, PT",
    text: "Bought a gift and it was a hit. The unboxing experience is lovely.",
  },
]

const Stars = () => (
  <div className="mb-3 flex gap-0.5 text-amber-500" aria-label="5 out of 5 stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i} aria-hidden="true">
        ★
      </span>
    ))}
  </div>
)

const Testimonials = () => {
  return (
    <section className="content-container py-16 small:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Heading level="h2" className="text-2xl small:text-3xl font-normal">
          What our customers say
        </Heading>
        <Text className="mt-3 text-ui-fg-subtle">
          Thousands of happy shoppers across Europe.
        </Text>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 small:grid-cols-2 large:grid-cols-3">
        {reviews.map((review) => (
          <figure
            key={review.name}
            className="flex flex-col rounded-lg border border-ui-border-base bg-ui-bg-subtle p-6"
          >
            <Stars />
            <blockquote className="flex-1">
              <Text className="text-ui-fg-base">“{review.text}”</Text>
            </blockquote>
            <figcaption className="mt-4">
              <Text className="font-medium text-ui-fg-base">{review.name}</Text>
              <Text className="text-sm text-ui-fg-subtle">{review.location}</Text>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

export default Testimonials
