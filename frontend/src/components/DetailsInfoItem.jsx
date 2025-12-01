export default function DetailsInfoItem({ label, value, full }) {
  return (
    <div className={`details-info-item ${full ? "full" : ""}`}>
      <label>{label}</label>
      <span>{value || "—"}</span>
    </div>
  );
}
