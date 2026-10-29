import * as React from 'react'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { useComposedRefs } from '../libs/compose-ref'
import { Presence } from '../presence'
import { Primitive } from '../primitive-elements'
import { useAccordionContext } from './accordion'
import type { IAccordion } from './accordion.types'
import { useAccordionItemContext } from './item'

const CONTENT_NAME = 'AccordionContent'

const AccordionContent = React.forwardRef<HTMLDivElement, IAccordion.IContentProps>(
  (props: IAccordion.IScoped<IAccordion.IContentProps>, forwardedRef) => {
    const { forceMount = false, hiddenUntilFound = false, ...contentProps } = props
    const { open } = useAccordionItemContext(CONTENT_NAME, props.__scopeAccordion)
    // Content in the page on load skips its animation until the item first opens or closes.
    const skipAnimationRef = React.useRef(forceMount || hiddenUntilFound || open ? open : null)

    const content = (present: boolean) => (
      <AccordionContentImpl
        {...contentProps}
        ref={forwardedRef}
        hiddenUntilFound={hiddenUntilFound}
        present={present}
        skipAnimationRef={skipAnimationRef}
      />
    )

    return (
      <Presence present={open}>
        {forceMount || hiddenUntilFound ? ({ present }) => content(present) : content(true)}
      </Presence>
    )
  },
)

AccordionContent.displayName = CONTENT_NAME

const AccordionContentImpl = React.forwardRef<HTMLDivElement, IAccordion.IContentImplProps>(
  (props: IAccordion.IScoped<IAccordion.IContentImplProps>, forwardedRef) => {
    const { __scopeAccordion, hiddenUntilFound, present, skipAnimationRef, ...contentProps } = props
    const context = useAccordionContext(CONTENT_NAME, __scopeAccordion)
    const itemContext = useAccordionItemContext(CONTENT_NAME, __scopeAccordion)
    const contentRef = React.useRef<HTMLDivElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, contentRef)
    const inlineStylesRef = React.useRef<Pick<CSSStyleDeclaration, 'animationName' | 'transitionDuration'>>(undefined)
    const findable = hiddenUntilFound && !present && !itemContext.disabled
    const { open, onOpenToggle } = itemContext

    // React 19 writes hidden="until-found" as hidden="", so the server renders it hidden and the effect upgrades it.
    useLayoutEffect(() => {
      const node = contentRef.current
      if (!node || !findable) return
      node.setAttribute('hidden', 'until-found')
      // The browser shows the content after this event whether or not the item opens, so it is hidden again when a
      // controlled value keeps the item closed.
      const onBeforeMatch = () => {
        onOpenToggle()
        requestAnimationFrame(() => {
          if (node.dataset.state !== 'open') node.setAttribute('hidden', 'until-found')
        })
      }
      node.addEventListener('beforematch', onBeforeMatch)
      return () => {
        node.removeEventListener('beforematch', onBeforeMatch)
        // React writes nothing to a `hidden` it already rendered, so an item disabled while closed keeps "until-found".
        if (node.getAttribute('hidden') === 'until-found') node.setAttribute('hidden', '')
      }
    }, [findable, onOpenToggle])

    // Content stays in the page while it animates closed, aria-hidden but still reachable by Tab until it is inert.
    useLayoutEffect(() => {
      const node = contentRef.current
      if (!node || open || !present || node.inert) return
      node.inert = true
      return () => {
        node.inert = false
      }
    }, [open, present])

    // Measured with animations off, so a closing item still reports its open size. It runs before Presence reads
    // the exit animation, so switching animations back on here starts that animation instead of cancelling it.
    useLayoutEffect(() => {
      const node = contentRef.current
      if (!node) return
      inlineStylesRef.current ??= {
        animationName: node.style.animationName,
        transitionDuration: node.style.transitionDuration,
      }
      node.style.animationName = 'none'
      node.style.transitionDuration = '0s'
      const rect = node.getBoundingClientRect()
      for (const side of ['height', 'width'] as const) {
        const name = `--gentleduck-accordion-content-${side}`
        if (contentProps.style && name in contentProps.style) continue
        if (rect[side]) node.style.setProperty(name, `${rect[side]}px`)
        else node.style.removeProperty(name)
      }
      if (skipAnimationRef.current !== open) skipAnimationRef.current = null
      if (skipAnimationRef.current === null) Object.assign(node.style, inlineStylesRef.current)
    }, [open, present, skipAnimationRef])

    return (
      <Primitive.div
        data-slot="accordion-content"
        data-state={open ? 'open' : 'closed'}
        data-disabled={itemContext.disabled ? '' : undefined}
        id={itemContext.contentId}
        role="region"
        aria-labelledby={itemContext.triggerId}
        aria-hidden={!open || undefined}
        hidden={hiddenUntilFound && !present ? true : undefined}
        data-orientation={context.orientation}
        {...contentProps}
        ref={composedRefs}
      />
    )
  },
)

AccordionContentImpl.displayName = `${CONTENT_NAME}Impl`

export { AccordionContent }
