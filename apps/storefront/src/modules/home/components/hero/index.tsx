import { Button, Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="h-[85vh] w-full border-b border-ui-border-base relative overflow-hidden bg-ui-bg-subtle">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/Hero-Store-poster.jpg"
        aria-hidden="true"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src="/Hero-Store.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 z-10 bg-black/40" />

      {/* Centered content */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 p-6 text-center">
        <Heading
          level="h1"
          className="text-4xl small:text-6xl font-bold text-white drop-shadow-lg"
        >
          Sopa Store
        </Heading>
        <Heading
          level="h2"
          className="max-w-2xl text-lg small:text-2xl font-normal text-white/90 drop-shadow"
        >
          Curated goods, delivered with care.
        </Heading>
        <LocalizedClientLink href="/store">
          <Button variant="secondary" className="mt-2">
            Shop now
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Hero
