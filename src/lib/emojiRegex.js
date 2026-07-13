// Broad emoji + symbol ranges (covers emoticons, symbols, transport,
// flags, dingbats, supplemental symbols, and variation selectors/ZWJ).
export const EMOJI_REGEX =
  /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|\u200D|\uFE0F)/g

export function removeEmojis(text) {
  return text.replace(EMOJI_REGEX, '').replace(/[ \t]{2,}/g, ' ')
}

export function countEmojis(text) {
  const matches = text.match(EMOJI_REGEX)
  return matches ? matches.length : 0
}
