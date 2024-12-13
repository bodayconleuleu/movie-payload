import { Category, Movie } from '@/payload-types'
import type {
  CollectionBeforeChangeHook,
  CollectionAfterChangeHook,
  CollectionBeforeDeleteHook,
  PayloadRequest,
} from 'payload'

type CollectionSlug = 'categories'
type Map = 'no' | 'yes'

interface RelationshipMovies {
  movieId: string
  req: PayloadRequest
  collection: CollectionSlug
  push: any
  map?: Map
}

export const revalidateMovie: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  return data
}

const relationshipUpdated = async ({
  req,
  movieId,
  collection,
  push,
  map = 'no',
}: RelationshipMovies) => {
  const relationshipIds = push.map(async (relationship: any) => {
    let relationshipId: string = relationship
    if (map === 'yes') {
      relationshipId = relationship.id
    }
    const collectionDb = await req.payload.findByID({
      collection,
      id: relationshipId,
    })

    if (!collectionDb) {
      return
    }

    const movieSomeId = collectionDb.movies?.some((movie: any) => movie.id === movieId)
    if (movieSomeId) {
      return
    }

    const existMovies = Array.isArray(collectionDb.movies) ? collectionDb.movies : []
    const updateMovies = existMovies.map((movie: any) => {
      if (typeof movie === 'string') {
        return movie
      }
      return movie.id
    })
    updateMovies.push(movieId)

    const updated = await req.payload.update({
      collection,
      id: relationshipId,
      data: {
        movies: updateMovies,
      },
    })
    return updated
  })
  return relationshipIds
}

const relationshipRemovie = async ({
  req,
  movieId,
  collection,
  push,
  map = 'no',
}: RelationshipMovies) => {
  const relationshipIds = push.map(async (relationship: any) => {
    let relationshipId: string = relationship
    if (map === 'yes') {
      relationshipId = relationship.id
    }
    const collectionDb = await req.payload.findByID({
      collection,
      id: relationshipId,
    })

    if (!collectionDb) {
      return
    }

    const movieSomeId = collectionDb.movies?.some((movie: any) => movie.id === movieId)
    if (!movieSomeId) {
      return
    }

    const existMovies = Array.isArray(collectionDb.movies) ? collectionDb.movies : []
    const filterMovies = existMovies.map((movie: any) => {
      if (typeof movie === 'string') {
        return movie
      }
      return movie.id
    })
    const updateMovies = filterMovies.filter((movie) => movie !== movieId)

    const updated = await req.payload.update({
      collection,
      id: relationshipId,
      data: {
        movies: updateMovies,
      },
    })
    return updated
  })
  return relationshipIds
}

const relationshipMovieBeforeDelete = async ({
  req,
  movieId,
  collection,
  push,
  map,
}: RelationshipMovies) => {
  const relationshipDocs = await req.payload.find({
    collection,
    where: {
      movies: {
        in: [movieId],
      },
    },
  })
  if (relationshipDocs.docs.length > 0) {
    const previous = await relationshipRemovie({
      movieId,
      collection,
      req,
      push: relationshipDocs.docs,
      map: 'yes',
    })

    await Promise.all([...previous])
  }
}

export const revalidateMovieAfterChange: CollectionAfterChangeHook = async ({
  doc,
  operation,
  previousDoc,
  req,
}) => {
  console.log('doc', doc)
  console.log('operation', operation)
  console.log('previousDoc', previousDoc)

  if (operation === 'update') {
    const previousDocCategories = await relationshipRemovie({
      movieId: previousDoc.id,
      collection: 'categories',
      req,
      push: previousDoc.categories,
    })

    await Promise.all([...previousDocCategories])
  }

  const docCategories = await relationshipUpdated({
    movieId: doc.id,
    collection: 'categories',
    req,
    push: doc.categories,
  })

  await Promise.all([...docCategories])
  return doc
}

export const revalidateMovieBeforeDelete: CollectionBeforeDeleteHook = async ({ req, id }) => {
  await relationshipMovieBeforeDelete({
    req,
    movieId: String(id),
    push: [],
    collection: 'categories',
  })
}
