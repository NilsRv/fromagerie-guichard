import { MAX_COMMENT_LENGTH } from "../domain/constants";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

const starters = [
  { label: "envie de…", prefix: "Envie de " },
  { label: "sans…", prefix: "Sans " },
  { label: "allergie à…", prefix: "Allergie à " },
];

function resizeField(textarea) {
  textarea.style.height = "auto";
  const style = getComputedStyle(textarea);
  const max = parseFloat(style.maxHeight);
  const min = parseFloat(style.minHeight);
  textarea.style.height = `${Math.max(min, Math.min(max, textarea.scrollHeight))}px`;
  textarea.style.overflowY = textarea.scrollHeight > max ? "auto" : "hidden";
}

export function PlateauNotes({ value, onChange }) {
  const id = useId();
  const field = useRef(null);
  const pendingCaret = useRef(null);
  const [focused, setFocused] = useState(false);
  const expanded = focused || Boolean(value.trim());
  useLayoutEffect(() => {
    const textarea = field.current;
    if (!textarea) return;
    resizeField(textarea);
    if (pendingCaret.current !== null) {
      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(pendingCaret.current, pendingCaret.current);
      pendingCaret.current = null;
    }
  }, [value, expanded]);
  useEffect(() => {
    const textarea = field.current;
    let width = textarea.getBoundingClientRect().width;
    const observer = new ResizeObserver(() => {
      const nextWidth = textarea.getBoundingClientRect().width;
      if (nextWidth !== width) {
        width = nextWidth;
        resizeField(textarea);
      }
    });
    observer.observe(textarea);
    return () => observer.disconnect();
  }, []);

  function existingLine(prefix) {
    let offset = 0;
    for (const line of value.split("\n")) {
      const text = line.trimStart().toLocaleLowerCase("fr-FR");
      const match = prefix.trim().toLocaleLowerCase("fr-FR");
      if (text === match || text.startsWith(`${match} `))
        return offset + line.length;
      offset += line.length + 1;
    }
    return -1;
  }
  function insertion(prefix) {
    const caret = field.current?.selectionEnd ?? value.length;
    const nextBreak = value.indexOf("\n", caret);
    const end = nextBreak === -1 ? value.length : nextBreak;
    const before = value.slice(0, end);
    const separator = before && !before.endsWith("\n") ? "\n" : "";
    return {
      text: `${before}${separator}${prefix}${value.slice(end)}`,
      caret: end + separator.length + prefix.length,
    };
  }
  function start(prefix) {
    let caret = existingLine(prefix);
    if (caret === -1) {
      const next = insertion(prefix);
      if (next.text.length > MAX_COMMENT_LENGTH) return;
      pendingCaret.current = next.caret;
      onChange(next.text);
      return;
    }
    field.current?.focus({ preventScroll: true });
    field.current?.setSelectionRange(caret, caret);
  }
  return (
    <div className="meal-comment" data-expanded={expanded || undefined}>
      <div className="meal-comment-heading">
        <label htmlFor={id}>vos précisions</label>
        <span>facultatif</span>
      </div>
      <div
        className="meal-comment-editor"
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setFocused(false);
            if (value && !value.trim()) onChange("");
          }
        }}
      >
        <textarea
          ref={field}
          id={id}
          value={value}
          maxLength={MAX_COMMENT_LENGTH}
          rows={1}
          aria-describedby={`${id}-help ${id}-count`}
          placeholder={
            expanded
              ? "Un fromage préféré, plutôt sans bleu…"
              : "Ajouter une précision…"
          }
          onChange={(event) => onChange(event.target.value)}
        />
        <div className="meal-comment-reveal" inert={!expanded}>
          <div className="meal-comment-reveal-inner">
            <div className="meal-comment-tools">
              <div
                className="meal-suggestions"
                role="group"
                aria-label="Idées de commentaires"
              >
                {starters.map(({ label, prefix }) => (
                  <button
                    type="button"
                    key={prefix}
                    disabled={
                      existingLine(prefix) === -1 &&
                      insertion(prefix).text.length > MAX_COMMENT_LENGTH
                    }
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => start(prefix)}
                    aria-label={`Préciser : ${label}`}
                  >
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <span
                id={`${id}-count`}
                className="meal-comment-count"
                data-near-limit={
                  value.length >= MAX_COMMENT_LENGTH - 50 || undefined
                }
                aria-label={`${value.length} caractères sur ${MAX_COMMENT_LENGTH}`}
              >
                {value.length}
                <span> / {MAX_COMMENT_LENGTH}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="meal-comment-reveal" inert={!expanded}>
        <div className="meal-comment-reveal-inner">
          <p id={`${id}-help`} className="meal-comment-hint">
            Préférences et allergies à confirmer avec la boutique avant
            préparation.
          </p>
        </div>
      </div>
    </div>
  );
}
