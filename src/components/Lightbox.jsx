import { useEffect, useRef } from 'react'

export default function Lightbox({ isOpen, images, currentIndex, onClose, onPrev, onNext }) {
  const touchStartX = useRef(null)
  const touchEndX = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onPrev, onNext])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = null
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return

    const diff = touchStartX.current - touchEndX.current
    const threshold = 50

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        onNext()
      } else {
        onPrev()
      }
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  if (!isOpen || !images || images.length === 0) return null

  return (
    <div
      className="lightbox"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button className="lightbox-close" onClick={onClose}>&times;</button>
      <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); onPrev(); }}>
        &#10094;
      </button>
      <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); onNext(); }}>
        &#10095;
      </button>
      <img
        className="lightbox-image"
        src={images[currentIndex]}
        alt=""
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}