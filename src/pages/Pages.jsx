import { useState } from "react";
import { ProductList } from "./Commerce";
import { MapPin } from "lucide-react";
import { products, googleUrl } from "../catalog";
import { Link, Photo, DottedLink } from "../components/ui";
const collections = {
  fromages: {
    label: "Les fromages",
  },
  "autres-produits": {
    label: "L’épicerie",
  },
};
function PickupNote() {
  return (
    <div className="pickup-note">
      <span className="pickup-note-label">
        <MapPin size={18} /> Retrait à Cachan
      </span>
      <p>
        Demande au moins 2 jours à l’avance. Produits, prix et créneau confirmés
        par téléphone. Règlement en boutique.
      </p>
    </div>
  );
}
export function Catalog({ type, cart, onAdd, onCart }) {
  const c = collections[type];
  const [filter, setFilter] = useState("Tous");
  const all = products.filter((p) => p.category === type);
  const tags = ["Tous", ...new Set(all.map((p) => p.tag))];
  const items = filter === "Tous" ? all : all.filter((p) => p.tag === filter);
  return (
    <div className={`collection-page collection-page--${type}`}>
      <header className="selection-heading page-pad">
        <h1>
          {type === "fromages" ? (
            <>
              les <em>fromages</em>
            </>
          ) : (
            <>
              l’<em>épicerie</em>
            </>
          )}
        </h1>
      </header>
      <section className="selection-catalog page-pad" aria-label={c.label}>
        <div className="selection-toolbar">
          <div
            className="selection-filters"
            role="group"
            aria-label={
              type === "fromages"
                ? "Filtrer les fromages"
                : "Filtrer l’épicerie"
            }
          >
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                aria-pressed={filter === t}
              >
                {t.toLocaleLowerCase("fr-FR")}
              </button>
            ))}
          </div>
          <span role="status" aria-live="polite">
            {items.length} {items.length === 1 ? "produit" : "produits"}
          </span>
        </div>
        <ProductList items={items} cart={cart} onAdd={onAdd} onCart={onCart} />
        <PickupNote />
      </section>
      <nav
        className="plateau-more page-pad"
        aria-label="Poursuivre votre sélection"
      >
        <span>Et pour accompagner ?</span>
        <Link to="/plateaux">Les plateaux</Link>
        <Link to={type === "fromages" ? "/autres-produits" : "/fromages"}>
          {type === "fromages" ? "L’épicerie" : "Les fromages"}
        </Link>
      </nav>
    </div>
  );
}
export function VisitCallout() {
  return (
    <section className="visit-callout page-pad">
      <span className="section-index">on en parle au comptoir ?</span>
      <h2>
        Le goût se choisit aussi
        <br />
        <em>en discutant</em>
      </h2>
      <DottedLink to="/contact">Passer nous voir</DottedLink>
      <a className="quiet-phone" href="tel:+33146642610">
        01 46 64 26 10
      </a>
    </section>
  );
}
export function About() {
  return (
    <div className="house-page">
      <section className="house-intro page-pad">
        <h1>
          la <em>maison</em>
        </h1>
      </section>
      <div className="house-gallery page-pad">
        <figure>
          <Photo
            name="employe.webp"
            alt="Le fromager au travail derrière son comptoir"
            priority
          />
          <figcaption>Le geste, au quotidien.</figcaption>
        </figure>
        <figure>
          <Photo
            name="boutique-interieur.webp"
            alt="Les fromages et l’intérieur de la boutique Guichard"
            priority
          />
          <figcaption>Notre adresse, à Cachan.</figcaption>
        </figure>
      </div>
      <section className="house-story page-pad">
        <span className="section-index">une fromagerie de quartier</span>
        <div>
          <h2>
            On prend le temps
            <br />
            de <em>bien choisir</em>
          </h2>
          <div className="house-story-copy">
            <p>
              Un morceau pour ce soir, un plateau pour dimanche. Au comptoir, on
              commence par vos envies.
            </p>
            <p>
              Vous aimez les pâtes crémeuses ? Les chèvres plus affinés ? On
              regarde ensemble ce qui vous plairait, parmi les fromages du
              moment.
            </p>
            <p>Et si vous hésitez, la conversation fait le reste.</p>
          </div>
          <DottedLink to="/fromages">Un tour au comptoir</DottedLink>
        </div>
      </section>
      <section className="house-diptych page-pad">
        <Photo
          name="comptoir7.webp"
          alt="Des chèvres de différentes formes et affinages au comptoir"
        />
        <div>
          <span className="section-index">les petits plaisirs</span>
          <h2>
            Un bon fromage.
            <br />
            Une bonne <em>compagnie</em>
          </h2>
          <p>
            Une sélection à partager, une pâte de coing pour l’accompagner. Il
            n’en faut parfois pas plus.
          </p>
          <DottedLink to="/plateaux">Trouver son plateau</DottedLink>
        </div>
      </section>
      <VisitCallout />
    </div>
  );
}
export function Contact() {
  return (
    <div className="visit-page">
      <section
        className="visit-layout page-pad"
        aria-label="Adresse et contact"
      >
        <figure className="visit-photo">
          <Photo
            name="devanture.webp"
            alt="La devanture de la Fromagerie Guichard au 18 rue Guichard à Cachan"
            priority
          />
        </figure>
        <div className="visit-details">
          <h1>
            nous <em>trouver</em>
          </h1>
          <address>
            18 rue Guichard
            <br />
            <span>94230 Cachan</span>
          </address>
          <DottedLink to={googleUrl} target="_blank" rel="noreferrer">
            Ouvrir l’itinéraire
          </DottedLink>
          <div className="visit-detail-row">
            <span>Un appel</span>
            <a href="tel:+33146642610">01 46 64 26 10</a>
          </div>
          <div className="visit-detail-row visit-hours">
            <span>Les horaires</span>
            <div>
              <p>Consultez les horaires à jour avant de passer.</p>
              <a href={googleUrl} target="_blank" rel="noreferrer">
                Voir sur Google
              </a>
            </div>
          </div>
          <p className="visit-small-note">
            Pour une demande particulière ou un retrait, appelez-nous
            directement.
          </p>
        </div>
      </section>
      <section className="visit-pickup page-pad">
        <div>
          <span className="section-index">votre retrait en boutique</span>
          <h2>
            Choisir ici.
            <br />
            <em>Se retrouver là-bas</em>
          </h2>
        </div>
        <div>
          <p>
            Faites votre sélection en ligne au moins deux jours avant votre
            passage. Nous vous appelons pour convenir des produits, du prix et
            du créneau.
          </p>
          <p>Vous réglez en boutique, au moment du retrait.</p>
          <DottedLink to="/plateaux">Préparer ma sélection</DottedLink>
        </div>
      </section>
    </div>
  );
}
export function Info() {
  return (
    <div className="information-page page-pad">
      <header className="information-heading">
        <span className="section-index">LES INFORMATIONS PRATIQUES</span>
        <h1>
          en toute <em>clarté</em>
        </h1>
        <p>Votre retrait, vos données et les moyens de nous joindre.</p>
      </header>
      <div className="information-layout">
        <nav className="information-nav" aria-label="Dans cette page">
          <a href="#votre-retrait">01 · Votre retrait</a>
          <a href="#vos-donnees">02 · Vos données</a>
          <a href="#les-images">03 · Les images</a>
          <a href="#nous-joindre">04 · Nous joindre</a>
        </nav>
        <div className="information-copy">
          <section id="votre-retrait">
            <span className="section-index">01</span>
            <h2>Votre sélection et votre retrait</h2>
            <p>
              Le panier permet d’envoyer une demande de retrait au 18 rue
              Guichard, 94230 Cachan. Elle ne constitue ni une commande payée ni
              une réservation confirmée.
            </p>
            <p>
              Les disponibilités, les quantités, les allergènes, le prix et
              l’horaire sont confirmés par téléphone avec la boutique. Prévoyez
              au moins deux jours avant le retrait. Le règlement se fait sur
              place. Aucun service de livraison n’est proposé.
            </p>
          </section>
          <section id="vos-donnees">
            <span className="section-index">02</span>
            <h2>Vos données</h2>
            <p>
              Votre panier reste dans le stockage local de votre navigateur.
              Vous pouvez l’effacer avec « Vider le panier ». Aucun outil
              publicitaire ni outil de mesure d’audience n’est utilisé.
            </p>
            <p>
              Lorsque vous envoyez une demande, votre nom, téléphone, sélection,
              préférences et créneau souhaité sont enregistrés sur le serveur du
              site. La boutique les utilise pour traiter votre demande. Leur
              accès est protégé et ils sont supprimés automatiquement après 90
              jours maximum.
            </p>
            <p>
              Pour demander leur consultation, correction ou suppression,
              contactez la boutique au{" "}
              <a href="tel:+33146642610">01 46 64 26 10</a>.
            </p>
            <p>
              Le récapitulatif téléchargeable est créé sur votre appareil. Les
              liens Google ouvrent un service externe soumis à ses propres
              conditions de confidentialité.
            </p>
          </section>
          <section id="les-images">
            <span className="section-index">03</span>
            <h2>Les images</h2>
            <p>
              Les photographies de la boutique et des produits illustrent notre
              sélection. Les compositions des plateaux et les disponibilités
              peuvent varier. L’image principale de l’accueil est une
              illustration photographique générée.
            </p>
          </section>
          <section id="nous-joindre">
            <span className="section-index">04</span>
            <h2>Nous joindre</h2>
            <address>
              Fromagerie Guichard
              <br />
              18 rue Guichard, 94230 Cachan
              <br />
              <a href="tel:+33146642610">01 46 64 26 10</a>
            </address>
          </section>
        </div>
      </div>
    </div>
  );
}
