import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import Lightbox from './Lightbox'
import { categoryOptions, dynastyOptions, craftOptions } from '../data/dictionary'

export default function ProductGallery({ products }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxProductId, setLightboxProductId] = useState(null)
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState('全部')
  const [dynastyFilter, setDynastyFilter] = useState('全部')
  const [craftFilter, setCraftFilter] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

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

  const toggleCraft = (c) => {
    if (c === '全部') {
      setCraftFilter([])
    } else {
      setCraftFilter(prev =>
        prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
      )
    }
  }

  const filteredProducts = products.filter(p => {
    const matchCategory = categoryFilter === '全部' ? p.category !== '福利品' : p.category === categoryFilter
    const matchDynasty = dynastyFilter === '全部' || p.dynasty === dynastyFilter
    const matchCraft = craftFilter.length === 0 || craftFilter.every(c => p.craft.includes(c))
    const matchSearch = !debouncedQuery || p.name.includes(debouncedQuery.trim())
    return matchCategory && matchDynasty && matchCraft && matchSearch
  })

  return (
    <main className="main">
      <section className="collection">
        <div className={`filters ${filtersCollapsed ? 'collapsed' : ''}`}>
          <button
            type="button"
            className="filters-header"
            aria-expanded={!filtersCollapsed}
            onClick={() => setFiltersCollapsed(v => !v)}
          >
            <span className="filters-header-title">筛选</span>
            <span className="filters-arrow" aria-hidden="true">▾</span>
          </button>
          <div className="filters-content">
            <div className="filters-inner">
              <div className="filter-group">
                <span className="filter-title">类型</span>
                <div className="filter-buttons">
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
              </div>
              <div className="filter-group">
                <span className="filter-title">朝代</span>
                <div className="filter-buttons">
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
              </div>
              <div className="filter-group">
                <span className="filter-title">工艺</span>
                <div className="filter-buttons">
                  {craftOptions.map(c => (
                    <button
                      key={c}
                      className={`filter-btn ${(c === '全部' ? craftFilter.length === 0 : craftFilter.includes(c)) ? 'active' : ''}`}
                      onClick={() => toggleCraft(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter-group search-group">
                <span className="filter-title">搜索</span>
                <div className="filter-buttons search-box">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="按商品名称搜索"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onImageClick={openLightbox}
              />
            ))
          ) : (
            <div className="empty-state">暂无商品</div>
          )}
        </div>
      </section>
      <Lightbox
        isOpen={lightboxOpen}
        images={currentProduct?.images}
        currentIndex={lightboxImageIndex}
        onClose={closeLightbox}
        onPrev={goToPrevImage}
        onNext={goToNextImage}
      />
    </main>
  )
}
