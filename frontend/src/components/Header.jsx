import "../styles/components/Header.css";

export default function Header({ icon_url, title, username }) {
  return (
    <header>
      <div className="header-container between">
        <div className="header-title center">
          <img src={icon_url} alt={`${title} Icon`} />
          <h1>{title}</h1>
        </div>
        <div className="header-user column">
          <img src="assets/user_icon.svg" alt="User Profile" />
          <p className="font-body">{username}</p>
        </div>
      </div>
    </header>
  );
}
