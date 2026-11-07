import {linkify} from "./linkify.js";

const text = (value) => ({type: 'text', value})
const link = (value) => ({type: 'link', value})

describe('linkify', () => {
  it('returns plain text as a single text part', () => {
    expect(linkify('推 好看')).toEqual([text('推 好看')])
  })

  it('returns no parts for an empty message', () => {
    expect(linkify('')).toEqual([])
  })

  it('links a message that is only a URL', () => {
    expect(linkify('https://youtu.be/abc')).toEqual([link('https://youtu.be/abc')])
  })

  it('splits text around a URL in the middle', () => {
    expect(linkify('看 http://a.com/x?y=1&z=2#h 這個')).toEqual([
      text('看 '), link('http://a.com/x?y=1&z=2#h'), text(' 這個'),
    ])
  })

  it('links several URLs', () => {
    expect(linkify('https://a.com https://b.com')).toEqual([
      link('https://a.com'), text(' '), link('https://b.com'),
    ])
  })

  it('ends a URL at CJK text or full-width punctuation', () => {
    expect(linkify('https://a.com/p好看')).toEqual([link('https://a.com/p'), text('好看')])
    expect(linkify('https://a.com，讚')).toEqual([link('https://a.com'), text('，讚')])
  })

  it('drops trailing ASCII punctuation from the URL', () => {
    expect(linkify('see https://a.com/x.')).toEqual([text('see '), link('https://a.com/x'), text('.')])
    expect(linkify('https://a.com!?')).toEqual([link('https://a.com'), text('!?')])
  })

  it('drops an unbalanced closing paren but keeps a balanced one', () => {
    expect(linkify('(https://a.com)')).toEqual([text('('), link('https://a.com'), text(')')])
    expect(linkify('https://en.wikipedia.org/wiki/Go_(game)')).toEqual([
      link('https://en.wikipedia.org/wiki/Go_(game)'),
    ])
    expect(linkify('(https://w.org/Go_(game)).')).toEqual([
      text('('), link('https://w.org/Go_(game)'), text(').'),
    ])
  })

  it('ignores bare domains without a scheme', () => {
    expect(linkify('youtu.be/abc www.ptt.cc')).toEqual([text('youtu.be/abc www.ptt.cc')])
  })

  it('never links non-http schemes', () => {
    expect(linkify('javascript:alert(1)')).toEqual([text('javascript:alert(1)')])
    expect(linkify('data:text/html,x')).toEqual([text('data:text/html,x')])
  })

  it('does not link a scheme with no host', () => {
    expect(linkify('https://')).toEqual([text('https://')])
    expect(linkify('https://.')).toEqual([text('https://.')])
  })

  it('stops a URL at quotes and angle brackets', () => {
    expect(linkify('"https://a.com"')).toEqual([text('"'), link('https://a.com'), text('"')])
    expect(linkify('<https://a.com>')).toEqual([text('<'), link('https://a.com'), text('>')])
  })
})
