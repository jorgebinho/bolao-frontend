import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from './BottomNav';

export default function AppLayout() {
  const { user } = useAuth();
  const navItems = [
    { to: '/', label: 'Jogos', end: true },
    { to: '/ranking', label: 'Ranking' },
    { to: '/groups', label: 'Grupos' },
    { to: '/history', label: 'Histórico' },
    { to: '/profile', label: 'Perfil' },
    ...(user?.role === 'ADMIN' ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <div className="min-h-screen bg-brutal-gray text-brutal-black">
      <header className="sticky top-0 z-30 border-b-4 border-brutal-black bg-brutal-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center border-4 border-brutal-yellow bg-brutal-yellow font-display text-xl text-brutal-black shadow-brutal-yellow">
              B
            </span>
            <div>
              <p className="font-display text-lg leading-none tracking-widest text-brutal-yellow">BOLÃO 2026</p>
              <p className="text-xs font-bold text-brutal-yellow/50">Copa do Mundo</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `border-2 border-brutal-yellow px-3 py-2 font-display text-xs tracking-wider ${
                    isActive ? 'bg-brutal-yellow text-brutal-black' : 'text-brutal-yellow hover:bg-brutal-yellow hover:text-brutal-black'
                  }`
                }
              >
                {item.label.toUpperCase()}
              </NavLink>
            ))}
          </nav>

          <Link to="/profile" className="min-w-0 text-right">
            <p className="truncate text-xs font-bold text-brutal-yellow/60">{user?.name}</p>
            <p className="font-display text-lg leading-none text-brutal-yellow">{user?.points || 0} pts</p>
          </Link>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-76px)] max-w-6xl pb-24 sm:px-6 lg:pb-8">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
