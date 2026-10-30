import * as React from 'react'
import * as InputOTP from '..'

export default {
  title: 'Components/InputOTP',
}

const slotStyle: React.CSSProperties = { height: 40, textAlign: 'center', width: 32 }

export const Code = () => {
  const [value, setValue] = React.useState('')
  const [completed, setCompleted] = React.useState('')

  return (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'start', padding: 50 }}>
      <InputOTP.Root
        aria-label="Code"
        maxLength={6}
        onComplete={setCompleted}
        onValueChange={setValue}
        pattern={InputOTP.REGEXP_ONLY_DIGITS}
        style={{ alignItems: 'center', display: 'flex', gap: 8 }}
        value={value}>
        <InputOTP.Group style={{ display: 'flex', gap: 4 }}>
          <InputOTP.Slot style={slotStyle} />
          <InputOTP.Slot style={slotStyle} />
          <InputOTP.Slot style={slotStyle} />
        </InputOTP.Group>
        <InputOTP.Separator>-</InputOTP.Separator>
        <InputOTP.Group style={{ display: 'flex', gap: 4 }}>
          <InputOTP.Slot style={slotStyle} />
          <InputOTP.Slot style={slotStyle} />
          <InputOTP.Slot style={slotStyle} />
        </InputOTP.Group>
      </InputOTP.Root>
      <button onClick={() => setValue('')} type="button">
        Clear
      </button>
      <output aria-label="Value">{value || 'empty'}</output>
      <output aria-label="Completed">{completed || 'not yet'}</output>
    </div>
  )
}

export const FormAndStates = () => {
  const [disabled, setDisabled] = React.useState(false)
  const [readOnly, setReadOnly] = React.useState(false)
  const [hidden, setHidden] = React.useState(false)
  const [button, setButton] = React.useState(false)
  const [submitted, setSubmitted] = React.useState<string[]>([])

  return (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'start', padding: 50 }}>
      <label>
        <input checked={disabled} onChange={(event) => setDisabled(event.currentTarget.checked)} type="checkbox" />
        Disabled
      </label>
      <label>
        <input checked={readOnly} onChange={(event) => setReadOnly(event.currentTarget.checked)} type="checkbox" />
        Read only
      </label>
      <label>
        <input checked={hidden} onChange={(event) => setHidden(event.currentTarget.checked)} type="checkbox" />
        Hide characters
      </label>
      <label>
        <input checked={button} onChange={(event) => setButton(event.currentTarget.checked)} type="checkbox" />
        Submit button
      </label>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const code = String(new FormData(event.currentTarget).get('code'))
          setSubmitted((previous) => [...previous, code])
        }}
        style={{ display: 'flex', gap: 8 }}>
        <InputOTP.Root
          aria-label="Code"
          autoSubmit
          defaultValue="42"
          disabled={disabled}
          maxLength={4}
          name="code"
          readOnly={readOnly}
          style={{ display: 'flex', gap: 4 }}
          type={hidden ? 'password' : 'text'}>
          <InputOTP.Slot style={slotStyle} />
          <InputOTP.Slot style={slotStyle} />
          <InputOTP.Slot style={slotStyle} />
          <InputOTP.Slot style={slotStyle} />
          <InputOTP.HiddenInput />
        </InputOTP.Root>
        <button type="reset">Reset</button>
        {button && <button type="submit">Verify</button>}
      </form>
      <output aria-label="Submitted">{submitted.join(', ') || 'nothing'}</output>
    </div>
  )
}

export const RightToLeft = () => {
  const [value, setValue] = React.useState('')

  return (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'start', padding: 50 }}>
      <InputOTP.Root
        aria-label="Code"
        dir="rtl"
        maxLength={4}
        onValueChange={setValue}
        style={{ display: 'flex', gap: 4 }}
        value={value}>
        <InputOTP.Slot style={slotStyle} />
        <InputOTP.Slot style={slotStyle} />
        <InputOTP.Slot style={slotStyle} />
        <InputOTP.Slot style={slotStyle} />
      </InputOTP.Root>
      <output aria-label="Value">{value || 'empty'}</output>
    </div>
  )
}
