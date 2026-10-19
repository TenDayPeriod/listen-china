import { useState, useEffect, useRef } from 'react'
import ProductCard from './ProductCard'
import Lightbox from './Lightbox'
import { categoryOptions, dynastyOptions, craftOptions } from '../data/dictionary'
import BackToTop from './BackToTop'

export default function ProductGallery({ products }) {
  const collectionRef = useRef(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxProductId, setLightboxProductId] = useState(null)
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState('全部')
  const [dynastyFilter, setDynastyFilter] = useState('全部')
  const [craftFilter, setCraftFilter] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(40)

  const pageSizeOptions = [20, 40, 60, 100]

  // 已激活的筛选条件数量（用于 FAB 角标）
  const activeFilterCount =
    (categoryFilter !== '全部' ? 1 : 0) +
    (dynastyFilter !== '全部' ? 1 : 0) +
    craftFilter.length +
    (debouncedQuery.trim() ? 1 : 0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // 筛选抽屉打开时锁定背景滚动 + Esc 关闭
  useEffect(() => {
    if (!filterOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (e) => {
      if (e.key === 'Escape') setFilterOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [filterOpen])

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

  // 筛选条件或搜索词变化时回到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [categoryFilter, dynastyFilter, craftFilter, debouncedQuery])

  // 翻页后滚动到商品区顶部
  useEffect(() => {
    const el = collectionRef.current
    if (el) {
      const navOffset = 70
      const top = el.getBoundingClientRect().top + window.scrollY - navOffset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }, [currentPage])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const pagedProducts = filteredProducts.slice(startIndex, startIndex + pageSize)

  // 生成分页页码（带省略号）
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }
    const left = Math.max(1, safePage - 2)
    const right = Math.min(totalPages, safePage + 2)
    pages.push(1)
    if (left > 2) pages.push('...')
    for (let i = left; i <= right; i++) {
      if (i !== 1 && i !== totalPages) pages.push(i)
    }
    if (right < totalPages - 1) pages.push('...')
    if (totalPages !== 1) pages.push(totalPages)
    return pages
  }

  const handlePageSizeChange = (size) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  // 重置所有筛选条件
  const resetFilters = () => {
    setCategoryFilter('全部')
    setDynastyFilter('全部')
    setCraftFilter([])
    setSearchQuery('')
    setDebouncedQuery('')
    setFilterOpen(false)
  }

  return (
    <main className="main">
      <section className="collection" ref={collectionRef}>
        {/* 悬浮筛选按钮 */}
        <button
          type="button"
          className="filter-fab"
          aria-label="打开筛选"
          onClick={() => setFilterOpen(true)}
        >
          <span className="filter-fab-icon" aria-hidden="true">⚙</span>
          <span className="filter-fab-text">筛选</span>
          {activeFilterCount > 0 && (
            <span className="filter-fab-badge">{activeFilterCount}</span>
          )}
        </button>

        {/* 筛选抽屉遮罩 */}
        <div
          className={`filter-backdrop ${filterOpen ? 'show' : ''}`}
          onClick={() => setFilterOpen(false)}
        />

        {/* 筛选抽屉面板 */}
        <aside className={`filter-drawer ${filterOpen ? 'open' : ''}`}>
          <div className="filter-drawer-header">
            <span className="filter-drawer-title">筛选</span>
            <div className="filter-drawer-actions">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  className="filter-reset-btn"
                  aria-label="重置筛选"
                  onClick={resetFilters}
                >
                  <span className="filter-reset-icon" aria-hidden="true">↺</span>
                  <span className="filter-reset-text">重置</span>
                </button>
              )}
              <button
                type="button"
                className="filter-drawer-close"
                aria-label="关闭筛选"
                onClick={() => setFilterOpen(false)}
              >
                &times;
              </button>
            </div>
          </div>
          <div className="filter-drawer-body">
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
            <div className="filter-group">
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
        </aside>
        <div className="products-grid">
          {pagedProducts.length > 0 ? (
            pagedProducts.map(product => (
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
        {filteredProducts.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              共 <span className="pagination-count">{filteredProducts.length}</span> 件
            </div>
            <div className="pagination-pages">
              <button
                className="page-btn"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(safePage - 1)}
              >
                上一页
              </button>
              {getPageNumbers().map((p, idx) => (
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="page-ellipsis">…</span>
                ) : (
                  <button
                    key={p}
                    className={`page-btn ${p === safePage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                )
              ))}
              <button
                className="page-btn"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(safePage + 1)}
              >
                下一页
              </button>
            </div>
            <div className="pagination-size">
              <span className="pagination-size-label">每页</span>
              {pageSizeOptions.map(size => (
                <button
                  key={size}
                  className={`page-size-btn ${pageSize === size ? 'active' : ''}`}
                  onClick={() => handlePageSizeChange(size)}
                >
                  {size}
                </button>
              ))}
              <span className="pagination-size-label">件</span>
            </div>
          </div>
        )}
      </section>
      <Lightbox
        isOpen={lightboxOpen}
        images={currentProduct?.images}
        currentIndex={lightboxImageIndex}
        onClose={closeLightbox}
        onPrev={goToPrevImage}
        onNext={goToNextImage}
      />
      <BackToTop />
    </main>
  )
}
