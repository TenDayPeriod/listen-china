import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductGallery from '../components/ProductGallery'
import { products } from '../data/products'

export default function Home() {
  return (
    <div className="home-page">
      <Header />
      <ProductGallery products={products} />
      <Footer />
    </div>
  )
}
