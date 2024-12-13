import type { CollectionBeforeChangeHook } from 'payload'
import { formatSlug } from '@/utils/formatSlug'

const ramdomSlug = Math.random()
  .toString(36)
  .substring(2, 2 + 6)

export const formatSlugHook: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req: { payload },
  collection,
}) => {
  const checkSlug = await payload.find({
    collection: collection.slug,
    where: {
      and: [
        {
          slug: {
            equals: formatSlug(data?.name),
          },
        },
        originalDoc?.id
          ? {
              id: {
                not_equals: originalDoc?.id,
              },
            }
          : {},
      ],
    },
  })
  if (checkSlug.docs.length > 0) {
    data.slug = `${formatSlug(data?.name)}-${ramdomSlug}`
  } else {
    data.slug = formatSlug(data?.name)
  }

  return data
}
