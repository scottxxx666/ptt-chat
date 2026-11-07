// Tailwind Preflight uses bare selectors (`*`, `html`, `button`, ...). Injected as-is
// into a host page it restyles the whole site, so it is rewritten to apply only
// inside elements carrying PREFLIGHT_ROOT_CLASS. `:where()` keeps the added
// specificity at zero, so Preflight still loses to every class-based rule.
export const PREFLIGHT_ROOT_CLASS = 'ptt-root'

const SCOPE = `:where(.${PREFLIGHT_ROOT_CLASS})`

export function scopePreflightSelector(selector) {
  // document-level rules (font-family, line-height, margin) belong on the root itself
  if (/^(html|body|:root|:host)$/.test(selector)) return SCOPE
  // universal and bare pseudo-element rules must also match the root element
  if (selector.startsWith('*')) return `${SCOPE}${selector.slice(1)}, ${SCOPE} ${selector}`
  if (selector.startsWith('::')) return `${SCOPE}${selector}, ${SCOPE} ${selector}`
  return `${SCOPE} ${selector}`
}

export const preflightScopeOptions = {
  prefix: SCOPE,
  includeFiles: [/preflight\.css/],
  transform: (prefix, selector) => scopePreflightSelector(selector),
}
