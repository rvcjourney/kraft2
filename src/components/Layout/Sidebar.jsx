import { FiAward, FiBook, FiMic, FiBarChart2, FiLogOut, FiUser, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'lessons',   label: 'Lessons',    icon: FiBook },
  { id: 'roleplay',  label: 'Role Play',  icon: FiMic },
  { id: 'dashboard', label: 'Dashboard',  icon: FiBarChart2 },
];

export default function Sidebar({ screen, setScreen, onLogout, userEmail, collapsed, onToggle }) {

  const initials = userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : 'U';

  const displayName = userEmail
    ? userEmail.split('@')[0]
    : 'User';

  return (
    <aside className={`ck-sidebar${collapsed ? ' ck-sidebar--collapsed' : ''}`}>
      {/* Brand */}
      <div className="ck-sidebar-brand">
        <div className="ck-sidebar-logo">
          <FiAward size={20} />
        </div>
        <div className="ck-sidebar-brand-text">
          <div className="ck-sidebar-brand-name">CareerKraft</div>
          <div className="ck-sidebar-brand-tag">Skill. Practice. Grow.</div>
        </div>
      </div>

      {/* Collapse toggle */}
      <button className="ck-sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {collapsed ? <FiChevronsRight size={16} /> : <FiChevronsLeft size={16} />}
      </button>

      {/* Nav */}
      <nav className="ck-sidebar-nav">
        <div className="ck-nav-label">MENU</div>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`ck-nav-item ${screen === id ? 'ck-nav-item--active' : ''}`}
            onClick={() => setScreen(id)}
            title={collapsed ? label : undefined}
          >
            <Icon size={17} />
            <span className="ck-nav-label-text">{label}</span>
          </button>
        ))}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User + Logout */}
      <div className="ck-sidebar-footer">
        <button
          className="ck-nav-item"
          onClick={() => setScreen('profile')}
          title={collapsed ? 'Profile' : undefined}
        >
          <FiUser size={17} />
          <span className="ck-nav-label-text">Profile</span>
        </button>

        <div className="ck-sidebar-user">
          <div className="ck-user-avatar">{initials}</div>
          <div className="ck-user-info">
            <div className="ck-user-name">{displayName}</div>
            <div className="ck-user-email">{userEmail}</div>
          </div>
        </div>

        <button className="ck-nav-item ck-nav-item--logout" onClick={onLogout} title={collapsed ? 'Logout' : undefined}>
          <FiLogOut size={17} />
          <span className="ck-nav-label-text">Logout</span>
        </button>
      </div>
    </aside>
  );
}
