import { memo, useEffect, useRef, useState } from "react";
import { Link, Photo, DottedLink } from "../components/ui";
import { googleReviews } from "../reviews";
const heroOccasions = [
  "une raclette",
  "un repas",
  "une fondue",
  "se retrouver",
];

function HeroLink({ to, children }) {
  return (
    <Link to={to} className="dotted-cta" aria-label={children}>
      <span className="hero-link-label">{children}</span>
    </Link>
  );
}

function Hero() {
  const [occasion, setOccasion] = useState(0);
  const scene = useRef(null);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(scene.current);
    const timer = window.setInterval(() => {
      if (!motion.matches && visible && !document.hidden) {
        setOccasion((current) => (current + 1) % heroOccasions.length);
      }
    }, 3000);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    const element = scene.current;
    const stage = element.parentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = parseFloat(getComputedStyle(element).top) || 0;
      const progress = motion.matches
        ? 0
        : Math.min(
            1,
            Math.max(
              0,
              (top - stage.getBoundingClientRect().top) / element.offsetHeight,
            ),
          );
      element.style.setProperty("--hero-drift", `${-progress * 50}px`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, []);
  return (
    <div className="hero-stage">
      <section className="hero-scene" ref={scene}>
        <Photo
          name="hero-fromages-v3.webp"
          alt=""
          className="hero-backdrop"
          priority
        />
        <div className="hero-scene-content">
          <h1 aria-label="Du fromage pour une raclette, un repas, une fondue, se retrouver">
            <span aria-hidden="true">du fromage pour</span>
            <span className="hero-occasion" aria-hidden="true">
              {heroOccasions.map((text) => (
                <span className="hero-occasion-measure" key={text}>
                  {text}
                </span>
              ))}
              <span key={occasion}>{heroOccasions[occasion]}</span>
            </span>
          </h1>
          <div className="hero-scene-links">
            <HeroLink to="/plateaux">Choisir mon plateau</HeroLink>
            <HeroLink to="/contact">Trouver la fromagerie</HeroLink>
          </div>
        </div>
      </section>
    </div>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <section
        className="selection"
        id="selection"
        aria-label="Plateaux, fromages et à-côtés"
      >
        <div className="selection-intro">
          <h2>
            De quoi vous faire <em>fondre</em>
          </h2>
        </div>
        <div className="selection-stack">
          {[
            {
              to: "/plateaux",
              image: "fromages1.webp",
              secondaryImage: "plateau2.webp",
              secondaryAlt: "Un second plateau de la fromagerie",
              title: "les plateaux",
              text: "Pour l’apéro, le dimanche en famille ou les grandes tablées. Un plateau composé selon vos goûts, à poser au milieu de la table.",
              cta: "Découvrir les plateaux",
              num: "01",
            },
            {
              to: "/fromages",
              image: "comptoir2.webp",
              secondaryImage: "fromage-enavant.webp",
              secondaryAlt: "Un fromage sélectionné au comptoir",
              title: "les fromages",
              text: "Des chèvres, des tommes, des pâtes crémeuses. Vos classiques et les découvertes du comptoir, à choisir avec votre fromager.",
              cta: "Explorer les fromages",
              num: "02",
            },
            {
              to: "/autres-produits",
              image: "pate-de-coing.webp",
              secondaryImage: "pates-de-fruits.webp",
              secondaryAlt: "Les pâtes de fruits de la boutique",
              title: "l'épicerie",
              text: "Pâte de coing, pâtes de fruits, crèmerie. De quoi accompagner votre sélection ou terminer sur une note sucrée.",
              cta: "Découvrir l’épicerie",
              num: "03",
            },
          ].map((item, i) => (
            <article
              key={item.to}
              className={`selection-panel selection-panel--${item.num} ${i === 1 ? "reverse" : ""}`}
              style={{ "--panel-index": i }}
            >
              <div className="selection-photo">
                <Photo
                  name={item.image}
                  className="selection-photo-main"
                  alt={
                    i === 0
                      ? "Un plateau de fromages préparé à la boutique"
                      : i === 1
                        ? "Les chèvres et fromages du comptoir"
                        : "Les pâtes de coing de la fromagerie"
                  }
                />
                <Photo
                  name={item.secondaryImage}
                  alt={item.secondaryAlt}
                  className="selection-photo-secondary"
                />
              </div>
              <div className="selection-copy">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <HeroLink to={item.to}>{item.cta}</HeroLink>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="home-collect" aria-labelledby="collect-title">
        <h2 id="collect-title">
          Choisissez ici et <em>retrouvez-nous en boutique</em>
        </h2>
        <ol className="collect-steps">
          <li>
            <span className="collect-number" aria-hidden="true">
              01
            </span>
            <h3>Faites votre sélection</h3>
            <p>
              Un plateau, vos fromages préférés, quelques douceurs : ajoutez vos
              envies au panier.
            </p>
          </li>
          <li>
            <span className="collect-number" aria-hidden="true">
              02
            </span>
            <h3>Demandez votre retrait</h3>
            <p>
              Prévoyez au moins deux jours. La boutique vous contacte pour
              confirmer les produits, le prix et l’horaire.
            </p>
          </li>
          <li>
            <span className="collect-number" aria-hidden="true">
              03
            </span>
            <h3>Passez nous voir</h3>
            <p>
              Récupérez votre sélection au 18 rue Guichard, à Cachan. Vous
              réglez sur place, tout simplement.
            </p>
          </li>
        </ol>
        <a className="dotted-cta" href="#selection">
          <span className="hero-link-label">Faire ma sélection</span>
        </a>
      </section>
      <section className="home-house page-pad">
        <Photo
          name="employe.webp"
          alt="Votre fromager au comptoir de la boutique"
        />
        <div>
          <h2>
            Le fromage,
            <br />
            ça se <em>raconte</em>
          </h2>
          <p>
            Un goût, une texture, une envie pour ce soir. Au comptoir, on prend
            le temps de vous conseiller.
          </p>
          <DottedLink to="/a-propos">Rencontrer la maison</DottedLink>
        </div>
      </section>
      <section className="cheese-pause" aria-label="Les fromages en images">
        <Photo
          name="fromages4.webp"
          alt="Tommettes corses à la coupe dans la vitrine"
          className="cheese-pause-photo"
        />
        <Photo
          name="fromages2.webp"
          alt="Un plateau généreux de fromages découpés et de bleu, garni de romarin"
          className="cheese-pause-photo"
        />
        <Photo
          name="comptoir7.webp"
          alt="Fromages de chèvre frais et affinés au comptoir"
          className="cheese-pause-photo"
        />
      </section>
      <Reviews />
    </>
  );
}
function Reviews() {
  const review = googleReviews.featured;
  return (
    <section
      className="google-reviews section page-pad"
      aria-labelledby="reviews-title"
    >
      <div className="google-reviews-heading">
        <h2 id="reviews-title">
          Vous en parlez
          <br />
          <em>mieux que nous</em>
        </h2>
      </div>
      <div className="google-reviews-layout">
        <div className="google-score">
          <div className="google-score-number">
            {googleReviews.rating}
            <span>/ 5</span>
          </div>
          <span className="review-stars" aria-hidden="true">
            ★★★★★
          </span>
          <p>{googleReviews.count} avis sur Google</p>
          <a
            className="dotted-cta"
            href={googleReviews.url}
            target="_blank"
            rel="noreferrer"
          >
            <span className="hero-link-label">Lire tous les avis</span>
          </a>
          <span className="review-snapshot">
            Note relevée le 9 octobre 2026
          </span>
        </div>
        <figure className="google-review-card">
          <div className="google-review-top">
            <span
              className="review-stars"
              aria-label={`${review.rating} étoiles sur 5`}
            >
              ★★★★★
            </span>
            <span>Google</span>
          </div>
          <blockquote>« {review.excerpt} »</blockquote>
          <figcaption>
            <span className="review-avatar" aria-hidden="true">
              S
            </span>
            <div>
              <strong>{review.author}</strong>
              <span>{review.visit} · Extrait d’un avis Google</span>
            </div>
            <a
              href={googleReviews.url}
              target="_blank"
              rel="noreferrer"
              aria-label="Consulter les avis sur Google"
            >
              Voir sur Google
            </a>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

export default memo(Home);
