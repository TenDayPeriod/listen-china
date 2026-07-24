import Carousel from './Carousel'
import { stockMap } from '../data/stock'

function formatPrice(price) {
  return price.toLocaleString('zh-CN')
}

export default function ProductCard({ product, onImageClick }) {
  const subPrices = [
    { label: '杯子', value: product.cupPrice },
    { label: '盖碗', value: product.gaiwanPrice },
    { label: '壶承', value: product.saucerPrice },
  ].filter(item => item.value > 0)

  const stock = stockMap[product.id] || {}
  const stockItems = [
    { label: '杯子', value: stock.cupStock || 0 },
    { label: '盖碗', value: stock.gaiwanStock || 0 },
    { label: '壶承', value: stock.saucerStock || 0 },
    { label: '八方杯', value: stock.cup8Stock || 0 },
  ].filter(item => item.value > 0)

  return (
    <div className="product-card">
      <Carousel
        images={product.images}
        productName={product.name}
        onImageClick={(index) => onImageClick && onImageClick(product.id, index)}
      />
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.description ? (
          <div className="description-wrapper">
            <p className="product-description">{product.description}</p>
            <div className="description-tooltip">{product.description}</div>
          </div>
        ) : (
          <div className="description-wrapper">
            <p className="product-description">暂无简介</p>
          </div>
        )}
        <div className="product-stock">
          {stockItems.length > 0 && (
            <>
              <span className="stock-label">库存：</span>
              {stockItems.map(item => (
                <span
                  key={item.label}
                  className="stock-item"
                >
                  <span className="stock-type">{item.label}</span>
                  <span className="stock-value">{item.value}</span>
                </span>
              ))}
            </>
          )}
        </div>
        {subPrices.length > 0 && (
          <div className="product-subprices">
            {subPrices.map(item => (
              <div key={item.label} className="subprice-item">
                <span className="subprice-label">{item.label}</span>
                <span className="subprice-value">¥{formatPrice(item.value)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="product-price">
          <span className="price-label">总价</span>
          <span className="price-symbol">¥</span>
          <span className="price-value">{formatPrice(product.price)}</span>
        </div>
      </div>
    </div>
  )
}