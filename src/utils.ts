export const getDiffStr = (diff?: number): string => {
  if (!diff) return '0'

  const prefix = diff > 0 ? '⬆️  🟥' : '⬇️  🟩'
  return `${prefix}${Math.round(diff)}%`
}

export const diff = (oldVal: number, newVal: number): number =>
  +(((newVal - oldVal) / oldVal) * 100)

export const capitalize = (s: string | undefined): string | undefined =>
  s && s[0].toUpperCase() + s.slice(1)
