'use client'

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@gentleduck/registry-ui/field'
import { Input } from '@gentleduck/registry-ui/input'
import * as React from 'react'

const rules = [
  { message: 'Use at least 8 characters.', test: (value: string) => value.length >= 8 },
  { message: 'Include a number.', test: (value: string) => /\d/.test(value) },
]

export default function Demo() {
  const [password, setPassword] = React.useState('duck')
  const errors = rules.filter((rule) => !rule.test(password))
  const invalid = errors.length > 0

  return (
    <div className="w-full max-w-md">
      <FieldGroup>
        <Field data-invalid={invalid}>
          <FieldLabel htmlFor="password-v3n">Password</FieldLabel>
          <Input
            aria-invalid={invalid}
            id="password-v3n"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
          <FieldDescription>Type to see which rules it still breaks.</FieldDescription>
          <FieldError errors={errors} />
        </Field>
      </FieldGroup>
    </div>
  )
}
