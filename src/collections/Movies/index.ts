import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { formatSlugHook } from '@/hooks/formatSlugHook'
import type { CollectionConfig } from 'payload'
import {
  revalidateMovie,
  revalidateMovieAfterChange,
  revalidateMovieBeforeDelete,
} from './hooks/revalidateMovie'

export const Movies: CollectionConfig = {
  slug: 'movies',
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
        // tab movie
        {
          label: 'Movie',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              label: 'Movie name',
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
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              defaultValue: [],
            },
          ],
        },

        //
      ],
    },
  ],

  hooks: {
    beforeChange: [formatSlugHook, revalidateMovie],
    beforeDelete: [revalidateMovieBeforeDelete],
    afterChange: [revalidateMovieAfterChange],
  },
}
