export function getAssociatedForm(control: Element | null | undefined, form: string | undefined) {
  // A form attribute, even an empty one, names a form in the control's own document or shadow root and nothing else.
  const associated =
    form === undefined
      ? control?.closest('form')
      : (control?.getRootNode() as Partial<NonElementParentNode> | undefined)?.getElementById?.(form)
  // Not `instanceof HTMLFormElement`, which is false for a form from another window, such as an iframe's.
  return associated?.localName === 'form' ? associated : null
}
