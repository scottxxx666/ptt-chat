import fs from 'node:fs'
import path from 'node:path'
import postcss from 'postcss'
import postcssConfig from '../postcss.config.js'
import {scopePreflightSelector} from './preflightScope.js'

const SCOPE = ':where(.ptt-root)'

describe('scopePreflightSelector', () => {
  it.each(['html', ':root', ':host'])('maps document-level %s onto the root itself', (selector) => {
    expect(scopePreflightSelector(selector)).toBe(SCOPE)
  })

  it('does not map body onto the root, so its line-height: inherit cannot override html', () => {
    expect(scopePreflightSelector('body')).toBe(`${SCOPE} body`)
  })

  it('does not treat selectors that merely start with html/body as document-level', () => {
    expect(scopePreflightSelector('html body')).toBe(`${SCOPE} html body`)
    expect(scopePreflightSelector('bodyx')).toBe(`${SCOPE} bodyx`)
  })

  it('matches both root and descendants for the universal selector', () => {
    expect(scopePreflightSelector('*')).toBe(`${SCOPE}, ${SCOPE} *`)
  })

  it('keeps the rest of a universal compound selector', () => {
    expect(scopePreflightSelector('*::before')).toBe(`${SCOPE}::before, ${SCOPE} *::before`)
  })

  it('matches both root and descendants for bare pseudo-elements', () => {
    expect(scopePreflightSelector('::backdrop')).toBe(`${SCOPE}::backdrop, ${SCOPE} ::backdrop`)
  })

  it.each(['button', "[type='button']", 'abbr:where([title])', ':disabled', 'textarea::placeholder'])(
    'scopes element/attribute selector %s to descendants',
    (selector) => {
      expect(scopePreflightSelector(selector)).toBe(`${SCOPE} ${selector}`)
    },
  )
})

describe('postcss pipeline', () => {
  async function compile(file) {
    const from = path.resolve(__dirname, file)
    const result = await postcss(postcssConfig.plugins).process(fs.readFileSync(from, 'utf8'), {from: `${from}?inline`})
    const selectors = []
    result.root.walkRules(rule => {
      if (rule.parent.type === 'atrule' && /keyframes/.test(rule.parent.name)) return
      selectors.push(...rule.selectors)
    })
    return {result, selectors}
  }

  it('leaves no Preflight selector able to match host page elements', async () => {
    const {selectors} = await compile('preflight.css')
    expect(selectors.length).toBeGreaterThan(0)
    expect(selectors.filter(s => !s.startsWith(SCOPE))).toEqual([])
  })

  it('moves the html font/line-height reset onto the root', async () => {
    const {result} = await compile('preflight.css')
    const rootRules = []
    result.root.walkRules(rule => {
      if (rule.selector === SCOPE) rootRules.push(rule)
    })
    const props = rootRules.flatMap(rule => rule.nodes.map(decl => decl.prop))
    expect(props).toEqual(expect.arrayContaining(['font-family', 'line-height']))
  })

  it('keeps the root line-height at 1.5 instead of inheriting the host page', async () => {
    const {result} = await compile('preflight.css')
    const lineHeights = []
    result.root.walkDecls('line-height', decl => {
      if (decl.parent.selector === SCOPE) lineHeights.push(decl.value)
    })
    expect(lineHeights).toEqual(['1.5'])
  })

  it('does not prefix the extension stylesheet', async () => {
    const {selectors} = await compile('index.css')
    expect(selectors).toContain('#crx-root')
    expect(selectors).toContain('.ptt-chat-window')
    expect(selectors.some(s => s.includes(SCOPE))).toBe(false)
  })

  it('contains no Preflight in the extension stylesheet', async () => {
    const {selectors} = await compile('index.css')
    expect(selectors).not.toContain('button')
    expect(selectors).not.toContain('html')
  })
})
