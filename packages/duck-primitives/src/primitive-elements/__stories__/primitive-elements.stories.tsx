import * as React from 'react'
import { Primitive } from '..'
import styles from './primitive-elements.stories.module.css'

export default {
  title: 'Utilities/Primitive',
}

export const Form = () => {
  const [sent, setSent] = React.useState('')
  return (
    <Primitive.form
      className={styles.page}
      onSubmit={(event) => {
        event.preventDefault()
        setSent(new URLSearchParams([...new FormData(event.currentTarget)].map(([k, v]) => [k, String(v)])).toString())
      }}>
      <Primitive.label>
        Name <Primitive.input name="name" />
      </Primitive.label>
      <Primitive.label>
        Size{' '}
        <Primitive.select defaultValue="s" name="size">
          <option value="s">Small</option>
          <option value="l">Large</option>
        </Primitive.select>
      </Primitive.label>
      <Primitive.button type="submit">Send</Primitive.button>
      <Primitive.p aria-label="Sent" role="status">
        {sent}
      </Primitive.p>
    </Primitive.form>
  )
}

export const AsChild = () => {
  const [calls, setCalls] = React.useState<string[]>([])
  return (
    <div className={styles.page}>
      <Primitive.button asChild onClick={() => setCalls((list) => [...list, 'button'])}>
        <a href="#next" onClick={() => setCalls((list) => [...list, 'link'])}>
          Next
        </a>
      </Primitive.button>
      <output aria-label="Calls">{calls.join(', ')}</output>
    </div>
  )
}
