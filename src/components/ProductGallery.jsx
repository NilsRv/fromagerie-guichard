import { useId, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Photo } from "./ui";
const plateauPhotos = [
  { name: "plateau1.webp", label: "Vue du plateau de fromages" },
  { name: "fromages1.webp", label: "Autre composition de la fromagerie" },
  { name: "plateau2.webp", label: "Détail d’un plateau de la fromagerie" },
];
export function ProductGallery({
  photos = plateauPhotos,
  caption = "Les compositions varient selon les fromages du moment.",
}) {
  if (photos.length === 1)
    return <SingleProductImage photo={photos[0]} caption={caption} />;
  return <GalleryCarousel photos={photos} caption={caption} />;
}
function SingleProductImage({ photo, caption }) {
  return (
    <div className="plateau-gallery plateau-gallery--single">
      <figure>
        <div className="plateau-image-stage">
          <div
            className="plateau-slides"
            role="region"
            aria-label={`Photographie : ${photo.label}`}
          >
            <div
              className="plateau-slide is-active"
              role="group"
              aria-label="Photographie 1 sur 1"
              aria-hidden={false}
            >
              <Photo
                name={photo.name}
                alt={photo.label}
                priority
                loading="eager"
                fetchPriority="high"
                draggable="false"
              />
            </div>
          </div>
        </div>
        <figcaption>{caption}</figcaption>
      </figure>
    </div>
  );
}
function GalleryCarousel({ photos, caption }) {
  const galleryId = useId();
  const [photo, setPhoto] = useState(0);
  const carousel = useRef(null);
  const stage = useRef(null);
  const cursor = useRef(null);
  const selected = useRef(0);
  const destination = useRef(null);
  const drag = useRef(null);
  const suppressClick = useRef(false);
  const reduce = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function position(index) {
    const element = carousel.current;
    return Math.min(
      element.scrollWidth - element.clientWidth,
      Math.max(
        0,
        element.children[index].offsetLeft -
          parseFloat(getComputedStyle(element).paddingLeft),
      ),
    );
  }
  function nearest() {
    return photos.reduce(
      (best, _, index) =>
        Math.abs(carousel.current.scrollLeft - position(index)) <
        Math.abs(carousel.current.scrollLeft - position(best))
          ? index
          : best,
      0,
    );
  }
  function select(index) {
    selected.current = index;
    setPhoto(index);
  }
  function go(index, instant = false) {
    const element = carousel.current;
    const next = Math.max(0, Math.min(photos.length - 1, index));
    select(next);
    destination.current = next;
    element.scrollTo({
      left: position(next),
      behavior: instant || reduce() ? "instant" : "smooth",
    });
  }
  function updatePhoto() {
    const element = carousel.current;
    if (destination.current !== null) {
      if (Math.abs(element.scrollLeft - position(destination.current)) < 1.5)
        destination.current = null;
      else return;
    }
    const next = nearest();
    if (next !== selected.current) select(next);
  }
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => {
      const element = carousel.current;
      destination.current = null;
      element.scrollTo({
        left: position(selected.current),
        behavior: "instant",
      });
    });
    observer.observe(carousel.current);
    return () => observer.disconnect();
  }, []);
  function pointerMove(e) {
    const rect = stage.current.getBoundingClientRect();
    const x = e.clientX - rect.left,
      y = e.clientY - rect.top;
    cursor.current.style.setProperty("--pointer-x", `${x}px`);
    cursor.current.style.setProperty("--pointer-y", `${y}px`);
    cursor.current.style.setProperty(
      "--pointer-turn",
      x < rect.width / 2 ? "180deg" : "0deg",
    );
    if (!drag.current || e.pointerId !== drag.current.id) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) < 6 && !drag.current.moved) return;
    drag.current.moved = true;
    suppressClick.current = true;
    destination.current = null;
    carousel.current.classList.add("is-dragging");
    carousel.current.scrollLeft = drag.current.left - dx;
  }
  function endDrag(e) {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    const moved = drag.current.moved;
    drag.current = null;
    carousel.current.classList.remove("is-dragging");
    if (stage.current.hasPointerCapture(e.pointerId))
      stage.current.releasePointerCapture(e.pointerId);
    if (moved) go(nearest());
  }
  return (
    <div className="plateau-gallery">
      <div
        className="plateau-thumbnails"
        role="group"
        aria-label="Photographies du plateau"
        style={{ "--selected-photo": photo }}
      >
        {photos.map((item, i) => (
          <button
            key={item.name}
            type="button"
            onClick={() => go(i)}
            aria-pressed={photo === i}
            aria-label={item.label}
            aria-controls={galleryId}
          >
            <Photo name={item.name} alt="" />
          </button>
        ))}
        <span className="plateau-thumbnail-indicator" aria-hidden="true" />
      </div>
      <figure>
        <div
          ref={stage}
          className="plateau-image-stage"
          onPointerDown={(e) => {
            if (e.button !== 0 || e.pointerType === "touch" || !e.isPrimary)
              return;
            suppressClick.current = false;
            drag.current = {
              id: e.pointerId,
              x: e.clientX,
              left: carousel.current.scrollLeft,
              moved: false,
            };
            stage.current.setPointerCapture(e.pointerId);
          }}
          onPointerMove={pointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={(e) => {
            if (e.target.closest(".plateau-gallery-dots")) return;
            if (window.matchMedia("(max-width: 750px)").matches && e.detail > 0)
              return;
            if (suppressClick.current && e.detail > 0) {
              suppressClick.current = false;
              return;
            }
            const direction =
              e.detail === 0
                ? Number(
                    e.target.closest("[data-direction]")?.dataset.direction ||
                      1,
                  )
                : e.clientX <
                    stage.current.getBoundingClientRect().left +
                      stage.current.clientWidth / 2
                  ? -1
                  : 1;
            go(selected.current + direction);
          }}
        >
          <div
            ref={carousel}
            id={galleryId}
            className="plateau-slides"
            role="region"
            aria-label="Galerie du plateau"
            onScroll={updatePhoto}
          >
            {photos.map((item, i) => (
              <div
                className={`plateau-slide ${photo === i ? "is-active" : ""}`}
                key={item.name}
                role="group"
                aria-label={`Photographie ${i + 1} sur ${photos.length}`}
                aria-hidden={photo !== i}
              >
                <Photo
                  name={item.name}
                  alt={item.label}
                  priority={i === 0}
                  loading="eager"
                  fetchPriority={i === 0 ? "high" : "low"}
                  draggable="false"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="plateau-gallery-hit plateau-gallery-prev"
            data-direction="-1"
            aria-label="Photo précédente"
            aria-disabled={photo === 0}
          >
            <ArrowLeft size={20} />
          </button>
          <button
            type="button"
            className="plateau-gallery-hit plateau-gallery-next"
            data-direction="1"
            aria-label="Photo suivante"
            aria-disabled={photo === photos.length - 1}
          >
            <ArrowRight size={20} />
          </button>
          <span
            ref={cursor}
            className="plateau-gallery-cursor"
            aria-hidden="true"
          >
            <span>
              <ArrowRight size={18} />
            </span>
          </span>
          <div
            className="plateau-gallery-dots"
            role="group"
            aria-label="Choisir une photographie"
          >
            {photos.map((item, i) => (
              <button
                key={item.name}
                type="button"
                aria-label={item.label}
                aria-pressed={photo === i}
                aria-controls={galleryId}
                onClick={(e) => {
                  e.stopPropagation();
                  go(i);
                }}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
        <figcaption>{caption}</figcaption>
      </figure>
    </div>
  );
}
