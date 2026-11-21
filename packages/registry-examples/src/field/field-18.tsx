'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Field, FieldLabel, MotionFieldError } from '@gentleduck/registry-ui/field'
import { Input } from '@gentleduck/registry-ui/input'
import * as React from 'react'

export default function Demo() {
  const [error, setError] = React.useState<string | null>(null)

  return (
    <form
      className="flex w-[300px] flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        const value = String(new FormData(event.currentTarget).get('username'))
        setError(value.length < 3 ? 'Use at least three characters.' : null)
      }}>
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor="field-18-username">Username</FieldLabel>
        <Input aria-invalid={error ? true : undefined} id="field-18-username" name="username" />
        {error ? <MotionFieldError errors={[{ message: error }]} key={error} /> : null}
      </Field>
      <Button className="self-start" type="submit">
        Check
      </Button>
    </form>
  )
}
