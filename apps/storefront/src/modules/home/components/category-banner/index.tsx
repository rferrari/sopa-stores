import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CategoryBanner = () => {
  return (
    <section className="content-container py-12">
      <div className="relative h-[50vh] w-full overflow-hidden rounded-xl">
        {/* Reuses the hero video's middle-frame poster */}
        <img
          src="/Hero-Store-poster.jpg"
          alt="Featured collection"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex flex-col items-start justify-end gap-4 p-8 small:p-14">
          <Text className="uppercase tracking-widest text-white/80 text-sm">
            Featured collection
          </Text>
          <Heading
            level="h2"
            className="max-w-lg text-3xl small:text-5xl font-bold text-white drop-shadow-lg"
          >
            This season's essentials
          </Heading>
          <LocalizedClientLink href="/store">
            <Button variant="secondary">Explore the collection</Button>
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default CategoryBanner
