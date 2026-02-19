import { useState, useEffect } from 'react'
import { getCurrentUser, getProfile } from '../lib/db'
import { archetypes } from '../data/archetypes'

export function useArchetype() {
  const [archetype, setArchetype] = useState(null)
  const [profile, setProfile] = useState(null)
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

        const userProfile = await getProfile(user.id)
        
        if (userProfile) {
          // Parse quiz_answers if it's a string (Appwrite stores JSON as string)
          if (userProfile.quiz_answers && typeof userProfile.quiz_answers === 'string') {
            try {
              userProfile.quiz_answers = JSON.parse(userProfile.quiz_answers)
            } catch (e) {
              console.error('Failed to parse quiz_answers', e)
            }
          }

          setProfile(userProfile) // Store full profile

          if (userProfile.archetype_id && archetypes[userProfile.archetype_id]) {
            setArchetype(archetypes[userProfile.archetype_id])
          }
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

  return { archetype, profile, loading, error }
}

export default useArchetype
