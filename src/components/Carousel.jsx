import { useState, useRef } from 'react'

export default function Carousel({ images, productName, onImageClick }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef(null)
  const touchEndX = useRef(null)

  const goToPrev = () => {
    setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
  }

  const goToNext = () => {
    setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1)
  }

  const goToIndex = (index) => {
    setCurrentIndex(index)
  }

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
        goToNext()
      } else {
        goToPrev()
      }
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  return (
    <div
      className="carousel"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        className="carousel-image"
        src={images[currentIndex]}
        alt={productName}
        onClick={() => onImageClick && onImageClick(currentIndex)}
      />
      <button className="carousel-btn prev" onClick={goToPrev}>
        &#10094;
      </button>
      <button className="carousel-btn next" onClick={goToNext}>
        &#10095;
      </button>
      <div className="carousel-nav">
        {images.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}