import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import ProductGallery from '../components/ProductGallery'
import { teaSidesProducts } from '../data/teaSidesProducts'

export default function TeaSides() {
  return (
    <div className="teaside-page">
      <Header
        title="听风轩茶周边"
        tagline="茶香入器，雅趣天成"
        theme="teaside-theme"
      />
      <Nav theme="teaside-theme" />
      <ProductGallery products={teaSidesProducts} />
      <Footer />
    </div>
  )
}
