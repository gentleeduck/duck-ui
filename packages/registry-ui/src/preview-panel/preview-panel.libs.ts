declare const process: { env?: { NODE_ENV?: string } } | undefined

const IS_DEV: boolean = typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production'
const SUSPICIOUS_HTML_PATTERN = /<script\b|on\w+\s*=/i
const warned = new Set<string>()

/**
 * Warns once per component, in development only, when `unsafeHtml` carries a `<script>` tag or an inline event
 * handler. It is not a sanitiser: the markup is still the caller's to make safe.
 */
export function warnOnSuspiciousUnsafeHtml(name: string, html: string | undefined): void {
  if (!IS_DEV || !html || warned.has(name) || !SUSPICIOUS_HTML_PATTERN.test(html)) return
  warned.add(name)
  console.warn(
    `[${name}] \`unsafeHtml\` contains a <script> tag or an inline event handler. ` +
      'This prop is rendered without sanitisation; you MUST only pass markup you fully trust. ' +
      'For untrusted content, pass React children instead.',
  )
}
