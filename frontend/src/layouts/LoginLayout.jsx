import "../styles/layouts/LoginLayout.css";

export default function LoginLayout({ children }) {
  return (
    <div className="login-layout">
      <aside className="login-left">
        <img
          src="/assets/allair_logo.svg"
          alt="AllAir Logo"
          className="login-logo"
        />
      </aside>
      <main className="center">
        <div className="login-content">
          {children}
        </div>
      </main>
    </div>
  );
}
