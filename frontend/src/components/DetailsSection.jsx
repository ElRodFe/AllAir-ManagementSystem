export default function DetailsSection({ title, children }) {
  return (
    <section className="details-section">
      <h3 className="details-section-title">{title}</h3>
      <div className="details-section-content">{children}</div>
    </section>
  );
}
