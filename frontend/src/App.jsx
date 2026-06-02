import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import CategoryGrid from './components/CategoryGrid'
import FeaturedProducts from './components/FeaturedProducts'
import VerticalPromo from './components/VerticalPromo'
import PromoBanner from './components/PromoBanner'
import Footer from './components/Footer'
import SignIn from './pages/SignIn/SignIn'
import SignUp from './pages/SignUp/SignUp'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import ResetPassword from './pages/ResetPassword/ResetPassword'
import Account from './pages/Account/Account'
import Cart from './pages/Cart/Cart'
import Wishlist from './pages/Wishlist/Wishlist'
import ProductDetail from './pages/ProductDetail/ProductDetail'
import AdminPanel from './pages/AdminPanel/AdminPanel'
import Shop from './pages/Shop/Shop'
import Checkout from './pages/Checkout/Checkout'
import './App.css'

function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <CategoryGrid />
        <div className="shop-layout">
          <div className="container shop-layout__inner">
            <div className="shop-layout__products">
              <FeaturedProducts />
            </div>
            <aside className="shop-layout__sidebar">
              <div className="shop-layout__sidebar-inner">
                <VerticalPromo />
                <PromoBanner />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/"                  element={<HomePage />} />
            <Route path="/shop"              element={<Shop />} />
            <Route path="/signin"            element={<SignIn />} />
            <Route path="/signup"            element={<SignUp />} />
            <Route path="/forgot-password"   element={<ForgotPassword />} />
            <Route path="/reset-password"    element={<ResetPassword />} />
            <Route path="/account"           element={<Account />} />
            <Route path="/cart"              element={<Cart />} />
            <Route path="/checkout"          element={<Checkout />} />
            <Route path="/wishlist"          element={<Wishlist />} />
            <Route path="/product/:id"       element={<ProductDetail />} />
            <Route path="/admin-panel"       element={<AdminPanel />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
