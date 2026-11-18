import { Button } from '@gentleduck/registry-ui/button'
import { Field, FieldGroup, FieldLabel, FieldSeparator } from '@gentleduck/registry-ui/field'
import { Input } from '@gentleduck/registry-ui/input'

export default function Demo() {
  return (
    <div className="w-full max-w-sm">
      <FieldGroup>
        <Field>
          <Button variant="outline">Continue with a passkey</Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <FieldLabel htmlFor="email-s4p">Email</FieldLabel>
          <Input id="email-s4p" placeholder="you@example.com" type="email" />
        </Field>
        <Field>
          <Button>Sign in</Button>
        </Field>
      </FieldGroup>
    </div>
  )
}
