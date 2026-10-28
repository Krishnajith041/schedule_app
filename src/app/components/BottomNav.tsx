import { NavLink } from 'react-router-dom';
import { Calendar, UtensilsCrossed, CalendarClock } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',         icon: Calendar,        label: 'Schedule' },
  { to: '/food',     icon: UtensilsCrossed, label: 'Food Items' },
  { to: '/upcoming', icon: CalendarClock,   label: 'Upcoming' },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {/* Desktop: centered pill; Mobile: full-width */}
      <div className="flex items-center justify-center gap-2 px-6 md:max-w-sm md:mx-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-icon-btn flex-1 md:flex-none ${isActive ? 'active' : ''}`
            }
            aria-label={label}
          >
            <Icon size={22} strokeWidth={1.8} />
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
