import {
  Bell,
  ChevronDown,
  CircleHelp,
  Search,
} from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-title">
        <h2>{title}</h2>

        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="header-actions">
        <div className="header-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search"
          />
        </div>

        <button
          className="header-icon-button"
          type="button"
          aria-label="Help"
        >
          <CircleHelp size={20} />
        </button>

        <button
          className="header-icon-button notification-button"
          type="button"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="notification-dot" />
        </button>

        <button
          className="profile-button"
          type="button"
        >
          <div className="profile-avatar">TK</div>

          <div className="profile-info">
            <strong>Patient Demo</strong>
            <span>Physiotherapy</span>
          </div>

          <ChevronDown size={17} />
        </button>
      </div>
    </header>
  );
}

export default Header;