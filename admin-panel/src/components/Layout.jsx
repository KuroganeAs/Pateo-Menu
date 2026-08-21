import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { UtensilsCrossed, Megaphone, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/promo', label: 'Promos', icon: Megaphone },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 bg-surface border-r border-stone-200/80 flex flex-col">
        <div className="px-5 py-5 border-b border-stone-200/60">
          <h1 className="font-bold text-lg leading-tight">Páteo Admin</h1>
          <p className="text-xs text-muted mt-0.5">Cafetaria back office</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white shadow-card'
                    : 'text-muted hover:bg-background-alt hover:text-ink'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-stone-200/60 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-muted capitalize">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 rounded-lg text-muted hover:bg-background-alt hover:text-ink"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-6 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
