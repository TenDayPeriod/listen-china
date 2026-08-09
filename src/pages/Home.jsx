import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import ProductGallery from '../components/ProductGallery'
import { products } from '../data/products'

export default function Home() {
  return (
    <div className="home-page">
      <Header />
      <Nav />
      <ProductGallery products={products} />
      <Footer />
    </div>
  )
}
