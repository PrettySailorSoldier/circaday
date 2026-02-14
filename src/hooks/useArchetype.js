import { useState, useEffect } from 'react'
import { supabase, getProfile } from '../lib/supabase'
import { archetypes } from '../data/archetypes'

export function useArchetype() {
  const [archetype, setArchetype] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadArchetype() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        const profile = await getProfile(user.id)

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
