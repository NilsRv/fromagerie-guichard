export function FormatOption({
  name,
  value,
  label = String(value),
  checked,
  onChange,
  occasion = false,
}) {
  return (
    <label className="plateau-format">
      <input
        type="radio"
        name={name}
        aria-label={label}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span className={occasion ? "meal-occasion-copy" : undefined}>
        {occasion ? (
          <strong>{label.toLocaleLowerCase("fr-FR")}</strong>
        ) : (
          <span className="plateau-format-copy">
            <span>{label.split(" ")[0]}</span>
            <span>{label.split(" ").slice(1).join(" ")}</span>
          </span>
        )}
      </span>
    </label>
  );
}
