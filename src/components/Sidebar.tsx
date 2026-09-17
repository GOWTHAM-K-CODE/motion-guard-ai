import {
  Activity,
  Brain,
  ChartNoAxesCombined,
  CircleUserRound,
  LayoutDashboard,
  Settings,
  Watch,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Motion Analysis",
    path: "/motion-analysis",
    icon: Activity,
  },
  {
    name: "Smart Band",
    path: "/smart-band",
    icon: Watch,
  },
  {
    name: "EEG Wheelchair",
    path: "/eeg-wheelchair",
    icon: Brain,
  },
  {
    name: "Session History",
    path: "/session-history",
    icon: ChartNoAxesCombined,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: CircleUserRound,
  },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Activity size={22} strokeWidth={2.5} />
        </div>

        <div>
          <h1>Motion Guard</h1>
          <span>AI PLATFORM</span>
        </div>
      </div>

      <nav className="sidebar-navigation">
        <p className="navigation-label">MAIN MENU</p>

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `navigation-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} strokeWidth={2} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="system-status">
          <div className="status-dot" />

          <div>
            <strong>System Online</strong>
            <span>All services operational</span>
          </div>
        </div>

        <NavLink
          to="/settings"
          className="navigation-item"
        >
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;