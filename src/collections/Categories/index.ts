import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { formatSlugHook } from '@/hooks/formatSlugHook'
import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },

  admin: {
    useAsTitle: 'name',
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Category',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'slug',
              type: 'text',
              admin: {
                readOnly: true,
                condition: (data) => {
                  if (!data.id) {
                    return false
                  }
                  return true
                },
              },
            },
          ],
        },
        {
          label: 'Movies',
          fields: [
            {
              name: 'movies',
              type: 'relationship',
              relationTo: 'movies',
              hasMany: true,
              defaultValue: [],
              label: 'Movie list',
            },
          ],
        },
      ],
    },
  ],

  hooks: {
    beforeChange: [formatSlugHook],
  },
}
