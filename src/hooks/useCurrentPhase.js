import { useState, useEffect } from 'react'

export function useCurrentPhase(arcSchedule) {
  const [currentPhase, setCurrentPhase] = useState(null)

  useEffect(() => {
    if (!arcSchedule || arcSchedule.length === 0) {
      return
    }

    function calculatePhase() {
      const now = new Date()
      const currentHour = now.getHours()

      const phase = arcSchedule.find(p => {
        // Handle phases that wrap around midnight
        if (p.endHour <= p.startHour) {
          return currentHour >= p.startHour || currentHour < p.endHour
        }
        return currentHour >= p.startHour && currentHour < p.endHour
      })

      setCurrentPhase(phase || arcSchedule[0])
    }

    // Calculate immediately
    calculatePhase()

    // Update every minute
    const interval = setInterval(calculatePhase, 60000)

    return () => clearInterval(interval)
  }, [arcSchedule])

  return currentPhase
}

export default useCurrentPhase
