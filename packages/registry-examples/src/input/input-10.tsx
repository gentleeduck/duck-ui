import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <div className="grid gap-2">
        <Label htmlFor="email-invalid-r4k">Email</Label>
        <Input
          aria-describedby="email-invalid-r4k-error"
          aria-invalid="true"
          defaultValue="duck@"
          id="email-invalid-r4k"
        />
        <p className="text-destructive text-sm" id="email-invalid-r4k-error">
          Enter the whole address.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password-warning-n8j">Password</Label>
        <Input
          aria-describedby="password-warning-n8j-hint"
          aria-warning="true"
          defaultValue="quackquack"
          id="password-warning-n8j"
          type="password"
        />
        <p className="text-sm text-warning" id="password-warning-n8j-hint">
          This password is allowed, but easy to guess.
        </p>
      </div>
    </div>
  )
}
