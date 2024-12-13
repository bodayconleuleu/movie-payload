import unidecode from 'unidecode'
import slugify from 'slugify'

export const formatSlug = (val: string) => {
  if (!val) return ''

  const name = unidecode(val?.trim().toLowerCase())
  return slugify(name, {
    replacement: '-',
    remove: /[^a-zA-Z0-9\s-]/g,
    lower: true,
    strict: true,
  })
}
