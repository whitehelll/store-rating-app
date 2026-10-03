export const Rating = ({ value }) =>
  value == null ? <span className="muted">No ratings</span> : <span className="rating-num"><span className="star on">★</span> {Number(value).toFixed(1)}</span>;

// Clickable 1-5 stars. Clicking sets or changes the rating.
export function StarInput({ value, onChange, disabled }) {
  return (
    <span className="stars" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={`star ${value >= n ? 'on' : ''}`}
          disabled={disabled}
          onClick={() => onChange(n)}
        >★</button>
      ))}
    </span>
  );
}
