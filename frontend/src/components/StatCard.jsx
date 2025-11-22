import "../styles/components/StatCard.css";

export default function StatCard({ icon_url, value, label, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}><img src={icon_url} alt={`${label} Icon`}/></div>
      <div className="stat-info">
        <p className="stat-value bold">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}
