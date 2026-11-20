// jsdom has no CSS namespace, ResizeObserver or IntersectionObserver. This is CSSOM's serialization of an identifier.
if (typeof CSS === 'undefined') {
  Object.assign(globalThis, {
    CSS: {
      escape: (value: string) =>
        Array.from(value, (char, index) => {
          const code = char.codePointAt(0) ?? 0
          if (code === 0) return '�'
          const leadingDigit = /[0-9]/.test(char) && (index === 0 || (index === 1 && value[0] === '-'))
          if (code < 32 || code === 127 || leadingDigit) return `\\${code.toString(16)} `
          if (char === '-' && value.length === 1) return '\\-'
          return code >= 128 || /[\w-]/.test(char) ? char : `\\${char}`
        }).join(''),
    },
  })
}

class Unobserving {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??= Unobserving as never
globalThis.IntersectionObserver ??= Unobserving as never
