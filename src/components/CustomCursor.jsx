import { useEffect, useState, useRef } from 'react'
import './CustomCursor.css'

/**
 * Custom Animated Cursor Component
 * Active only on fine pointer devices (desktop mouse)
 */
function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const dotRef = useRef(null)
  const rotorRef = useRef(null)
  const mousePos = useRef({ x: -100, y: -100 })
  const rotorPos = useRef({ x: -100, y: -100 })
  const rafId = useRef(null)

  useEffect(() => {
    // Only enable if pointer is fine (mouse, not touchscreen)
    const mediaQuery = window.matchMedia('(pointer: fine)')
    if (!mediaQuery.matches) return

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      if (!isVisible) setIsVisible(true)

      // Check if target or parent is interactive
      const target = e.target
      if (
        target &&
        (target.closest(
          'a, button, input, textarea, select, [role="button"], [role="tab"], .hero-btn-primary, .hero-btn-secondary, .project-card, .credential-card'
        ) !== null)
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    // Animation Loop with smooth lerp for outer ring
    const loop = () => {
      // Direct position for center dot
      if (dotRef.current) {
        dotRef.current.style.left = `${mousePos.current.x}px`
        dotRef.current.style.top = `${mousePos.current.y}px`
      }

      // Smooth lag / lerp for rotor ring
      rotorPos.current.x += (mousePos.current.x - rotorPos.current.x) * 0.18
      rotorPos.current.y += (mousePos.current.y - rotorPos.current.y) * 0.18

      if (rotorRef.current) {
        rotorRef.current.style.left = `${rotorPos.current.x}px`
        rotorRef.current.style.top = `${rotorPos.current.y}px`
      }

      rafId.current = requestAnimationFrame(loop)
    }

    rafId.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [isVisible])

  return (
    <div
      className={`custom-cursor-root ${isHovering ? 'is-hovering' : ''} ${
        !isVisible ? 'is-hidden' : ''
      }`}
      aria-hidden="true"
    >
      <div ref={dotRef} className="custom-cursor-dot" />
      <div ref={rotorRef} className="custom-cursor-rotor" />
    </div>
  )
}

export default CustomCursor
