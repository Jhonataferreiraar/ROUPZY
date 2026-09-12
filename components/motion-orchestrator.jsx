'use client'

import { useEffect } from 'react'

export function MotionOrchestrator() {
  useEffect(() => {
    const stages = [...document.querySelectorAll('[data-motion-stage]')]

    function moveStage(event) {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
      event.currentTarget.style.setProperty('--rf-pointer-x', x.toFixed(3))
      event.currentTarget.style.setProperty('--rf-pointer-y', y.toFixed(3))
    }

    function resetStage(event) {
      event.currentTarget.style.setProperty('--rf-pointer-x', '0')
      event.currentTarget.style.setProperty('--rf-pointer-y', '0')
    }

    stages.forEach((stage) => {
      stage.addEventListener('pointermove', moveStage, { passive: true })
      stage.addEventListener('pointerleave', resetStage)
    })

    return () => {
      stages.forEach((stage) => {
        stage.removeEventListener('pointermove', moveStage)
        stage.removeEventListener('pointerleave', resetStage)
      })
    }
  }, [])

  return null
}
