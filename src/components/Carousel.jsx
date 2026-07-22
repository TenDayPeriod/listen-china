import { useState, useRef } from 'react'

export default function Carousel({ images, productName, onImageClick }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const touchStartX = useRef(null)
  const touchEndX = useRef(null)

  const switchTo = (newIndex) => {
    if (newIndex === currentIndex) return
    setLoading(true)
    setCurrentIndex(newIndex)
  }

  const goToPrev = () => {
    switchTo(currentIndex === 0 ? images.length - 1 : currentIndex - 1)
  }

  const goToNext = () => {
    switchTo(currentIndex === images.length - 1 ? 0 : currentIndex + 1)
  }

  const goToIndex = (index) => {
    switchTo(index)
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

  const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
  const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1

  return (
    <div
      className="carousel"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {loading && (
        <div className="carousel-loader">
          <div className="spinner"></div>
        </div>
      )}
      <img
        className="carousel-image"
        src={images[currentIndex]}
        alt={productName}
        onLoad={() => setLoading(false)}
        onClick={() => onImageClick && onImageClick(currentIndex)}
      />
      <img
        src={images[prevIndex]}
        alt=""
        className="carousel-preload"
        loading="lazy"
      />
      <img
        src={images[nextIndex]}
        alt=""
        className="carousel-preload"
        loading="lazy"
      />
      {images.map((img, index) => {
        if (index !== currentIndex && index !== prevIndex && index !== nextIndex) {
          return (
            <img
              key={`preload-${index}`}
              src={img}
              alt=""
              className="carousel-preload"
              loading="lazy"
            />
          )
        }
        return null
      })}
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