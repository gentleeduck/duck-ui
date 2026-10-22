export function getAssociatedForm(control: Element | null | undefined, form: string | undefined) {
  const associated = form ? control?.ownerDocument.getElementById(form) : control?.closest('form')
  // Not `instanceof HTMLFormElement`, which is false for a form from another window, such as an iframe's.
  return associated?.localName === 'form' ? associated : null
}
