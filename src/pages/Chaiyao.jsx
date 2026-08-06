import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductGallery from '../components/ProductGallery'
import { chaiyaoProducts } from '../data/chaiyaoProducts'

export default function Chaiyao() {
  return (
    <div className="chaiyao-page">
      <Header
        title="柴窑"
        tagline="天青色等烟雨，柴窑绝世珍品"
        theme="chaiyao-theme"
      />
      <ProductGallery products={chaiyaoProducts} />
      <Footer />
    </div>
  )
}
