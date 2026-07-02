import { Heading, Text } from "@medusajs/ui"

// Placeholder handle + tiles (frames pulled from the hero video).
// Swap `HANDLE` and the /gram/*.jpg files for real Instagram content later.
const HANDLE = "@sopastore"
const tiles = [1, 2, 3, 4, 5, 6]

const Instagram = () => {
  return (
    <section className="py-16 small:py-24">
      <div className="content-container text-center">
        <Heading level="h2" className="text-2xl small:text-3xl font-normal">
          Follow us on Instagram
        </Heading>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
        >
          <Text className="text-ui-fg-interactive">{HANDLE}</Text>
        </a>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-1 small:gap-2 large:grid-cols-6">
        {tiles.map((n) => (
          <a
            key={n}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden"
          >
            <img
              src={`/gram/${n}.jpg`}
              alt={`Instagram post ${n}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
              <span
                className="text-2xl text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              >
                ♥
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

export default Instagram
