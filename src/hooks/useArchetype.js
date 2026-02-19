import { useState, useEffect } from 'react'
import { getCurrentUser, getProfile } from '../lib/db'
import { archetypes } from '../data/archetypes'

export function useArchetype() {
  const [archetype, setArchetype] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadArchetype() {
      try {
        const { data: { user } } = await getCurrentUser()

        if (!user) {
          setLoading(false)
          return
        }

        const profile = await getProfile(user.id) // Appwrite user.$id? No, getCurrentUser returns { user } which is the Appwrite user object. So user.$id.
        // Wait! getCurrentUser returns { data: { user } }. The `account.get()` returns object with $id.
        // Supabase user has `id`. Appwrite user has `$id`.
        // My helper just returns the Appwrite user object as `user`.
        // So `user.id` will be UNDEFINED. I must use `user.$id`.
        
        // I need to update this usage in ALL files.
        // OR I can map the user object in `getCurrentUser` helper to have `id`.
        
        // Let's UPDATE THE HELPER in `db.ts` to be safer!
        // This avoids changing `user.id` to `user.$id` in 5 files.
        


        if (profile?.archetype_id && archetypes[profile.archetype_id]) {
          setArchetype(archetypes[profile.archetype_id])
        }
      } catch (err) {
        console.error('Error loading archetype:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    loadArchetype()
  }, [])

  return { archetype, loading, error }
}

export default useArchetype
