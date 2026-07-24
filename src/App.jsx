import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import ProductCard from './components/ProductCard'
import Lightbox from './components/Lightbox'
import { products } from './data/products'
import { categoryOptions, dynastyOptions, craftOptions } from './data/dictionary'

export default function App() {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxProductId, setLightboxProductId] = useState(null)
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState('全部')
  const [dynastyFilter, setDynastyFilter] = useState('全部')
  const [craftFilter, setCraftFilter] = useState('全部')

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

  const filteredProducts = products.filter(p => {
    const matchCategory = categoryFilter === '全部' || p.category === categoryFilter
    const matchDynasty = dynastyFilter === '全部' || p.dynasty === dynastyFilter
    const matchCraft = craftFilter === '全部' || p.craft === craftFilter
    return matchCategory && matchDynasty && matchCraft
  })

  return (
    <div className="app">
      <Header />
      <main className="main">
        <section className="collection">
          <div className="filters">
            <div className="filter-group">
              <span className="filter-title">类型</span>
              {categoryOptions.map(c => (
                <button
                  key={c}
                  className={`filter-btn ${categoryFilter === c ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="filter-group">
              <span className="filter-title">朝代</span>
              {dynastyOptions.map(d => (
                <button
                  key={d}
                  className={`filter-btn ${dynastyFilter === d ? 'active' : ''}`}
                  onClick={() => setDynastyFilter(d)}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="filter-group">
              <span className="filter-title">工艺</span>
              {craftOptions.map(c => (
                <button
                  key={c}
                  className={`filter-btn ${craftFilter === c ? 'active' : ''}`}
                  onClick={() => setCraftFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="products-grid">
            {filteredProducts.map(product => (
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