// Tailwind Preflight uses bare selectors (`*`, `html`, `button`, ...). Injected as-is
// into a host page it restyles the whole site, so it is rewritten to apply only
// inside elements carrying PREFLIGHT_ROOT_CLASS. `:where()` keeps the added
// specificity at zero, so Preflight still loses to every class-based rule.
export const PREFLIGHT_ROOT_CLASS = 'ptt-root'

const SCOPE = `:where(.${PREFLIGHT_ROOT_CLASS})`

export function scopePreflightSelector(selector) {
  // document-level rules (font-family, line-height) belong on the root itself.
  // `body` is left to the default branch (`.ptt-root body`, which never matches): mapped
  // onto the root, its later `line-height: inherit` would override html's 1.5 and pull
  // in the host page's line-height. Its `margin: 0` is moot, since roots are divs/sections.
  if (/^(html|:root|:host)$/.test(selector)) return SCOPE
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
