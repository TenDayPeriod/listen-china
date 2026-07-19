import { useState } from 'react'

export default function Carousel({ images, productName, onImageClick }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrev = () => {
    setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
  }

  const goToNext = () => {
    setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1)
  }

  const goToIndex = (index) => {
    setCurrentIndex(index)
  }

  return (
    <div className="carousel">
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