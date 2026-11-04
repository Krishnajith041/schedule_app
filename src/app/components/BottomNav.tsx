import { NavLink } from 'react-router-dom';
import { Calendar, UtensilsCrossed, CalendarClock, Shield } from 'lucide-react';
import { useAuth } from '../state/AuthContext';

export function BottomNav() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { to: '/',         icon: Calendar,        label: 'Schedule' },
    { to: '/food',     icon: UtensilsCrossed, label: 'Food Items' },
    { to: '/upcoming', icon: CalendarClock,   label: 'Upcoming' },
    ...(isAdmin ? [{ to: '/admin', icon: Shield, label: 'Admin Panel' }] : []),
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {/* Desktop: centered pill; Mobile: full-width */}
      <div className="flex items-center justify-center gap-2 px-6 md:max-w-sm md:mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-icon-btn flex-1 md:flex-none ${isActive ? 'active' : ''}`
            }
            aria-label={label}
            title={label}
          >
            <Icon size={22} strokeWidth={1.8} />
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
