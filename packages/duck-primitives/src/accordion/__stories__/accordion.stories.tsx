import * as React from 'react'
import { DirectionProvider } from '../../direction'
import * as Accordion from '..'
import { COMBINATION_ITEMS, COMBINATIONS, type ICombination } from './accordion.combinations'
import styles from './accordion.stories.module.css'

export default { title: 'Components/Accordion' }

interface IFaqProps {
  items?: readonly { value: string; question: React.ReactNode; answer: React.ReactNode; disabled?: boolean }[]
  mode?: ICombination['mode']
  animated?: boolean
  indicator?: React.ReactNode
  styled?: boolean
  onOpenChange?(value: string, open: boolean): void
}

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ')

const FAQ = [
  { value: 'item-1', question: 'Is it accessible?', answer: 'Yes. It adheres to the WAI-ARIA design pattern.' },
  {
    value: 'item-2',
    question: 'Is it styled?',
    answer: "Yes. It comes with default styles that match the other components' aesthetic.",
  },
  {
    value: 'item-3',
    question: 'Is it animated?',
    answer: "Yes. It's animated by default, but you can disable it if you prefer.",
  },
]

const DETAILS = [
  {
    value: 'item-1',
    question: 'Is it accessible?',
    answer: 'Yes. Each trigger is a button naming the region it controls, and the arrow keys move between triggers.',
  },
  {
    value: 'item-2',
    question: 'Is it styled?',
    answer: 'No. The primitive ships no styles, and every state is a data attribute to style against.',
  },
  {
    value: 'item-3',
    question: 'Is it animated?',
    answer: 'When the content declares an animation. The open size is a CSS variable for the keyframes to read.',
  },
  {
    value: 'item-4',
    question: 'How customizable is it?',
    answer: 'Every part takes asChild, so it renders as whatever element the page needs.',
  },
  {
    value: 'item-5',
    question: 'What are some use cases for this component?',
    answer: (
      <>
        Accordions suit:
        <ul>
          <li>FAQ sections that organise questions and answers.</li>
          <li>Collapsible menus in navigation.</li>
          <li>Long product details shown compactly.</li>
          <li>Forms filled one section at a time.</li>
        </ul>
      </>
    ),
  },
]

const ARABIC = [
  { value: 'item-1', question: 'هل يدعم إمكانية الوصول؟', answer: 'نعم، فهو يتبع نمط التصميم المعتمد في WAI-ARIA.' },
  { value: 'item-2', question: 'هل يأتي بتنسيق جاهز؟', answer: 'نعم، يأتي بأنماط افتراضية متناسقة مع بقية المكونات.' },
  { value: 'item-3', question: 'هل يدعم الحركة؟', answer: 'نعم، الحركة مفعّلة افتراضيًا ويمكنك تعطيلها متى شئت.' },
]

const SHIPPING = [
  {
    value: 'item-1',
    question: 'When does my order ship?',
    answer: 'Parcels leave the warehouse within two working days.',
  },
  { value: 'item-2', question: 'How do refunds work?', answer: 'Refunds reach your card within five working days.' },
  { value: 'item-3', question: 'Can I exchange an item?', answer: 'Exchanges are free for thirty days.' },
]

const WITH_DISABLED = FAQ.map((item) => ({ ...item, disabled: item.value === 'item-2' }))

const ADDED = { value: 'item-0', question: 'Is it new?', answer: 'Yes. It was added after the first render.' }

const COMBINATION_FAQ = COMBINATION_ITEMS.map(({ value, label, disabled }) => ({
  value,
  question: label,
  answer: `Answer ${value}`,
  disabled,
}))

const Chevron = () => (
  <Accordion.Indicator className={styles.indicator}>
    <svg width="12" height="12" viewBox="0 0 12 12">
      <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  </Accordion.Indicator>
)

const Plus = () => (
  <Accordion.Indicator className={cx(styles.indicator, styles.plus)}>
    <svg width="12" height="12" viewBox="0 0 12 12">
      <path d="M6 2v8M2 6h8" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  </Accordion.Indicator>
)

function Faq({ items = FAQ, mode = 'unmount', animated = true, indicator, styled = false, onOpenChange }: IFaqProps) {
  const forceMount = mode === 'force-mount'
  return (
    <>
      {items.map(({ value, question, answer, disabled }) => (
        <Accordion.Item
          key={value}
          value={value}
          disabled={disabled}
          onOpenChange={onOpenChange && ((open) => onOpenChange(value, open))}
          className={cx(styles.item, forceMount && styles.collapse, forceMount && animated && styles.smooth)}>
          <Accordion.Header className={styles.header}>
            <Accordion.Trigger className={cx(styles.trigger, styled && styles.styled)}>
              {question}
              {indicator}
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content
            forceMount={forceMount}
            hiddenUntilFound={mode === 'until-found'}
            className={cx(styles.content, animated && !forceMount && styles.animated)}>
            <div className={styles.answer}>{answer}</div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </>
  )
}

export const Single = () => (
  <Accordion.Root type="single" collapsible className={styles.root}>
    <Faq />
  </Accordion.Root>
)

export const DefaultOpen = () => (
  <Accordion.Root type="single" collapsible defaultValue="item-1" className={styles.root}>
    <Faq />
  </Accordion.Root>
)

export const NotCollapsible = () => (
  <Accordion.Root type="single" defaultValue="item-1" className={styles.root}>
    <Faq />
  </Accordion.Root>
)

export const NotAnimated = () => (
  <Accordion.Root type="single" collapsible defaultValue="item-1" className={styles.root}>
    <Faq animated={false} />
  </Accordion.Root>
)

export const Indicator = () => (
  <Accordion.Root type="single" collapsible className={styles.root}>
    <Faq indicator={<Chevron />} />
  </Accordion.Root>
)

export const Multiple = () => (
  <Accordion.Root type="multiple" className={styles.root}>
    <Faq items={DETAILS} indicator={<Plus />} />
  </Accordion.Root>
)

export const Rtl = () => (
  <DirectionProvider dir="rtl">
    <Accordion.Root type="single" collapsible className={styles.root}>
      <Faq items={ARABIC} indicator={<Chevron />} />
    </Accordion.Root>
  </DirectionProvider>
)

export const StyledTrigger = () => (
  <Accordion.Root type="single" collapsible className={styles.root}>
    <Faq styled />
  </Accordion.Root>
)

export const ForceMount = () => (
  <Accordion.Root type="single" collapsible className={styles.root}>
    <Faq mode="force-mount" indicator={<Chevron />} />
  </Accordion.Root>
)

export const HiddenUntilFound = () => (
  <Accordion.Root type="single" collapsible className={styles.root}>
    <Faq items={SHIPPING} mode="until-found" />
  </Accordion.Root>
)

export const Horizontal = () => (
  <Accordion.Root type="single" collapsible orientation="horizontal" className={styles.root}>
    <Faq />
  </Accordion.Root>
)

export const HorizontalRtl = () => (
  <DirectionProvider dir="rtl">
    <Accordion.Root type="single" collapsible orientation="horizontal" className={styles.root}>
      <Faq />
    </Accordion.Root>
  </DirectionProvider>
)

export const Disabled = () => (
  <Accordion.Root type="single" collapsible defaultValue="item-1" disabled className={styles.root}>
    <Faq />
  </Accordion.Root>
)

export const DisabledItem = () => (
  <Accordion.Root type="single" collapsible className={styles.root}>
    <Faq items={WITH_DISABLED} />
  </Accordion.Root>
)

export const NoLoop = () => (
  <Accordion.Root type="single" collapsible loop={false} className={styles.root}>
    <Faq />
  </Accordion.Root>
)

export const Controlled = () => {
  const [value, setValue] = React.useState('item-1')
  return (
    <div className={styles.stack}>
      <div className={styles.toolbar}>
        {FAQ.map((item) => (
          <button key={item.value} type="button" onClick={() => setValue(item.value)}>
            Open {item.value}
          </button>
        ))}
        <button type="button" onClick={() => setValue('')}>
          Close all
        </button>
      </div>
      <Accordion.Root type="single" collapsible value={value} onValueChange={setValue} className={styles.root}>
        <Faq />
      </Accordion.Root>
      <output className={styles.log}>value: {value || 'none'}</output>
    </div>
  )
}

export const ControlledMultiple = () => {
  const [value, setValue] = React.useState<string[]>([])
  return (
    <div className={styles.stack}>
      <div className={styles.toolbar}>
        <button type="button" onClick={() => setValue(FAQ.map((item) => item.value))}>
          Open all
        </button>
        <button type="button" onClick={() => setValue([])}>
          Close all
        </button>
      </div>
      <Accordion.Root type="multiple" value={value} onValueChange={setValue} className={styles.root}>
        <Faq />
      </Accordion.Root>
      <output className={styles.log}>value: {value.join(', ') || 'none'}</output>
    </div>
  )
}

export const Events = () => {
  const [log, setLog] = React.useState<string[]>([])
  const record = (entry: string) => setLog((entries) => [...entries, entry])
  return (
    <div className={styles.stack}>
      <Accordion.Root
        type="single"
        collapsible
        onValueChange={(value) => record(`value ${value || 'none'}`)}
        onFocusChange={(value) => record(`focus ${value ?? 'none'}`)}
        className={styles.root}>
        <Faq onOpenChange={(value, open) => record(`${value} ${open ? 'opened' : 'closed'}`)} />
      </Accordion.Root>
      <button type="button">After the accordion</button>
      <pre aria-label="Events" className={styles.log}>
        {log.join('\n')}
      </pre>
    </div>
  )
}

export const Nested = () => (
  <Accordion.Root type="single" collapsible defaultValue="shipping" className={styles.root}>
    <Accordion.Item value="shipping" className={styles.item}>
      <Accordion.Header className={styles.header}>
        <Accordion.Trigger className={styles.trigger}>Shipping</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className={cx(styles.content, styles.animated)}>
        <div className={styles.answer}>
          <Accordion.Root type="multiple" className={cx(styles.root, styles.inner)}>
            <Faq />
          </Accordion.Root>
        </div>
      </Accordion.Content>
    </Accordion.Item>
    {['Returns', 'Payments'].map((question) => (
      <Accordion.Item key={question} value={question.toLowerCase()} className={styles.item}>
        <Accordion.Header className={styles.header}>
          <Accordion.Trigger className={styles.trigger}>{question}</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className={cx(styles.content, styles.animated)}>
          <div className={styles.answer}>{question} are covered on the help page.</div>
        </Accordion.Content>
      </Accordion.Item>
    ))}
  </Accordion.Root>
)

export const Dynamic = () => {
  const [items, setItems] = React.useState(FAQ)
  return (
    <div className={styles.stack}>
      <div className={styles.toolbar}>
        <button type="button" disabled={items[0] === ADDED} onClick={() => setItems((current) => [ADDED, ...current])}>
          Add an item first
        </button>
        <button type="button" onClick={() => setItems((current) => current.filter((item) => item.value !== 'item-2'))}>
          Remove item-2
        </button>
      </div>
      <Accordion.Root type="single" collapsible className={styles.root}>
        <Faq items={items} />
      </Accordion.Root>
    </div>
  )
}

export const AsChild = () => (
  <Accordion.Root type="single" collapsible asChild className={styles.root}>
    <section aria-label="Questions">
      {FAQ.map(({ value, question, answer }) => (
        <Accordion.Item key={value} value={value} asChild className={styles.item}>
          <article>
            <Accordion.Header asChild className={styles.header}>
              <h2>
                <Accordion.Trigger asChild className={styles.trigger}>
                  <button type="button">{question}</button>
                </Accordion.Trigger>
              </h2>
            </Accordion.Header>
            <Accordion.Content asChild className={cx(styles.content, styles.animated)}>
              <section>
                <div className={styles.answer}>{answer}</div>
              </section>
            </Accordion.Content>
          </article>
        </Accordion.Item>
      ))}
    </section>
  </Accordion.Root>
)

function Combination({ combination }: { combination: ICombination }) {
  const { key, type, orientation, dir, motion, mode } = combination
  const items = <Faq items={COMBINATION_FAQ} mode={mode} animated={motion === 'animated'} />
  return type === 'multiple' ? (
    <Accordion.Root
      type="multiple"
      defaultValue={['one']}
      orientation={orientation}
      dir={dir}
      data-combination={key}
      className={styles.root}>
      {items}
    </Accordion.Root>
  ) : (
    <Accordion.Root
      type="single"
      collapsible={type === 'collapsible'}
      defaultValue="one"
      orientation={orientation}
      dir={dir}
      data-combination={key}
      className={styles.root}>
      {items}
    </Accordion.Root>
  )
}

export const Combinations = () => (
  <div className={styles.grid}>
    {COMBINATIONS.map((combination) => (
      <section key={combination.key} className={styles.cell}>
        <p className={styles.caption}>{combination.key}</p>
        <Combination combination={combination} />
      </section>
    ))}
  </div>
)
