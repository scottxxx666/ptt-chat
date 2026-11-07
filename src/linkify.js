// http(s) only, so chat text can never produce a javascript: or data: link.
// Non-ASCII ends a URL: copied URLs are percent-encoded, and chat often puts CJK text right after one.
const URL_PATTERN = /https?:\/\/[^\s<>"\u0080-￿]+/g
const TRAILING_PUNCTUATION = /[.,!?;:'"\]}]+$/

function trimTrailing(url) {
  let result = url.replace(TRAILING_PUNCTUATION, '')
  // keep a closing paren that is part of the URL, e.g. https://en.wikipedia.org/wiki/Go_(game)
  while (result.endsWith(')') && count(result, '(') < count(result, ')')) {
    result = result.slice(0, -1).replace(TRAILING_PUNCTUATION, '')
  }
  return result
}

function count(str, char) {
  return str.split(char).length - 1
}

// splits a message into ordered text and link parts
export function linkify(text) {
  const parts = []
  let last = 0
  for (const match of text.matchAll(URL_PATTERN)) {
    const url = trimTrailing(match[0])
    if (url.length <= match[0].indexOf('//') + 2) continue
    if (match.index > last) parts.push({type: 'text', value: text.slice(last, match.index)})
    parts.push({type: 'link', value: url})
    last = match.index + url.length
  }
  if (last < text.length) parts.push({type: 'text', value: text.slice(last)})
  return parts
}
