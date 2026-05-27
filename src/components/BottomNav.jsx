import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const items = [
  { to: '/', label: 'Jogos', end: true },
  { to: '/ranking', label: 'Ranking' },
  { to: '/groups', label: 'Grupos' },
  { to: '/history', label: 'Historico' },
  { to: '/profile', label: 'Perfil' },
];

export default function BottomNav() {
  const { user } = useAuth();
  const navItems = user?.role === 'ADMIN' ? [...items, { to: '/admin', label: 'Admin' }] : items;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-brutal-black bg-brutal-black lg:hidden">
      <div className="flex overflow-x-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `min-w-[78px] flex-1 border-r-2 border-brutal-yellow/15 px-2 py-3 text-center font-display text-[10px] tracking-wider transition-colors ${
                isActive ? 'bg-brutal-yellow text-brutal-black' : 'text-brutal-yellow/65 hover:text-brutal-yellow'
              }`
            }
          >
            {item.label.toUpperCase()}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
