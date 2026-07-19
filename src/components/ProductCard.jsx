import Carousel from './Carousel'

function formatPrice(price) {
  return price.toLocaleString('zh-CN')
}

export default function ProductCard({ product, onImageClick }) {
  return (
    <div className="product-card">
      <Carousel
        images={product.images}
        productName={product.name}
        onImageClick={(index) => onImageClick && onImageClick(product.id, index)}
      />
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="description-wrapper">
          <p className="product-description">{product.description}</p>
          <div className="description-tooltip">{product.description}</div>
        </div>
        <div className="product-stock">
          <span className="stock-label">库存：</span>
          <span className={`stock-value ${product.stock === 0 ? 'stock-zero' : ''}`}>
            {product.stock}
          </span>
          <span className="stock-unit">件</span>
        </div>
        <div className="product-price">
          <span className="price-symbol">¥</span>
          <span className="price-value">{formatPrice(product.price)}</span>
        </div>
      </div>
    </div>
  )
}