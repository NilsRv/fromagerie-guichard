import { lazy, Suspense, useCallback, useState } from "react";
import { products } from "./catalog";
import { collectionPaths } from "./routes";
import { useShopNavigation } from "./hooks/useShopNavigation";
import { usePageMetadata } from "./hooks/usePageMetadata";
import { useCart } from "./hooks/useCart";
import { Header } from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import { Cart } from "./components/Cart";
import { DottedLink, NavigationProvider } from "./components/ui";
import { Catalog, About, Contact, Info } from "./pages/Pages";
import { PlateauPage } from "./pages/Plateau";
import { ProductPage } from "./pages/Commerce";
const Admin = lazy(() => import("./pages/Admin"));
export default function App() {
  const { path, navigate } = useShopNavigation();
  const { cart, setCart, add } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  usePageMetadata(path);
  const type = path.slice(1);
  const selectedProduct = path.startsWith("/produit/")
    ? products.find((p) => path === `/produit/${p.id}`)
    : null;
  return (
    <NavigationProvider navigate={navigate}>
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      <Header
        path={path}
        count={cart.reduce((a, c) => a + c.quantity, 0)}
        onCart={openCart}
      />
      <main id="main" key={path} tabIndex={-1}>
        {path === "/" ? (
          <Home />
        ) : path === "/plateaux" ? (
          <PlateauPage cart={cart} onAdd={add} onCart={openCart} />
        ) : selectedProduct ? (
          <ProductPage
            key={selectedProduct.id}
            product={selectedProduct}
            cart={cart}
            onAdd={add}
            onCart={openCart}
          />
        ) : collectionPaths.has(path) ? (
          <Catalog
            key={type}
            type={type}
            cart={cart}
            onAdd={add}
            onCart={openCart}
          />
        ) : path === "/a-propos" ? (
          <About />
        ) : path === "/contact" ? (
          <Contact />
        ) : path === "/informations" ? (
          <Info />
        ) : path === "/gestion" ? (
          <Suspense
            fallback={
              <p className="page-pad" role="status">
                Chargement…
              </p>
            }
          >
            <Admin />
          </Suspense>
        ) : (
          <section className="not-found page-pad">
            <span className="section-index">404 · PAGE INTROUVABLE</span>
            <h1>
              On se retrouve
              <br />
              au <em>comptoir ?</em>
            </h1>
            <p>Cette page n’existe pas ou a changé d’adresse.</p>
            <DottedLink to="/">Retour à l’accueil</DottedLink>
          </section>
        )}
      </main>
      <Footer />
      {cartOpen && <Cart cart={cart} setCart={setCart} onClose={closeCart} />}
    </NavigationProvider>
  );
}
