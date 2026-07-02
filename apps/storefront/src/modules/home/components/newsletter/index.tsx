"use client"

import { useState } from "react"
import { Button, Heading, Input, Text } from "@medusajs/ui"

const Newsletter = () => {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    // TODO: wire to a real newsletter provider / Medusa subscriber
    setSubmitted(true)
  }

  return (
    <section className="border-y border-ui-border-base bg-ui-bg-subtle">
      <div className="content-container py-16 small:py-24">
        <div className="mx-auto max-w-xl text-center">
          <Heading level="h2" className="text-2xl small:text-3xl font-normal">
            Join the list
          </Heading>
          <Text className="mt-3 text-ui-fg-subtle">
            Get early access to drops and subscriber-only offers. No spam, ever.
          </Text>

          {submitted ? (
            <Text className="mt-8 text-ui-fg-base font-medium">
              🎉 Thanks for subscribing! Check your inbox to confirm.
            </Text>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col gap-3 small:flex-row"
            >
              <Input
                type="email"
                name="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                aria-label="Email address"
              />
              <Button type="submit" variant="primary">
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export default Newsletter
