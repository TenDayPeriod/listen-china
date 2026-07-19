import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import ProductCard from './components/ProductCard'
import Lightbox from './components/Lightbox'
import { products } from './data/products'

export default function App() {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxProductId, setLightboxProductId] = useState(null)
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0)

  const openLightbox = (productId, imageIndex) => {
    setLightboxProductId(productId)
    setLightboxImageIndex(imageIndex)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setLightboxProductId(null)
    setLightboxImageIndex(0)
  }

  const currentProduct = products.find(p => p.id === lightboxProductId)

  const goToPrevImage = () => {
    if (!currentProduct) return
    setLightboxImageIndex(prev => 
      prev === 0 ? currentProduct.images.length - 1 : prev - 1
    )
  }

  const goToNextImage = () => {
    if (!currentProduct) return
    setLightboxImageIndex(prev => 
      prev === currentProduct.images.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <div className="app">
      <Header />
      <main className="main">
        <section className="collection">
          <div className="products-grid">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onImageClick={openLightbox}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <Lightbox
        isOpen={lightboxOpen}
        images={currentProduct?.images}
        currentIndex={lightboxImageIndex}
        onClose={closeLightbox}
        onPrev={goToPrevImage}
        onNext={goToNextImage}
      />
    </div>
  )
}