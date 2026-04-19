// ─────────────────────────────────────────────
// FILE: src/components/TopNav.jsx
// PURPOSE: Top navigation acting as app router links
// ─────────────────────────────────────────────
import { NavLink } from 'react-router-dom';

export default function TopNav() {
  const links = [
    { to: '/', label: 'Live Map' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/eventlog', label: 'Event Log' },
  ];

  return (
    <nav className="h-14 bg-gray-950 border-b border-gray-800/60 flex items-center px-6 gap-6 shrink-0 z-10 relative">
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `relative h-full flex items-center text-sm font-medium transition-colors ${
              isActive ? 'text-indigo-400' : 'text-gray-400 hover:text-gray-200'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {link.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
