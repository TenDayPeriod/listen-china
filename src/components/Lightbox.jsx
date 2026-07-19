import { useEffect } from 'react'

export default function Lightbox({ isOpen, images, currentIndex, onClose, onPrev, onNext }) {
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

  if (!isOpen || !images || images.length === 0) return null

  return (
    <div className="lightbox" onClick={onClose}>
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