// src/components/BottomNav.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

export default function BottomNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    toast.success("Até logo! 👋");
    navigate("/login");
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-brutal-black border-t-4 border-brutal-black">
      <div className="flex">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 font-display text-xs tracking-wider transition-colors border-r-4 border-brutal-black/40
            ${isActive ? "bg-brutal-yellow text-brutal-black" : "text-brutal-yellow/60 hover:text-brutal-yellow"}`
          }
        >
          <span className="text-lg">⚽</span>
          <span>JOGOS</span>
        </NavLink>

        <NavLink
          to="/ranking"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 font-display text-xs tracking-wider transition-colors border-r-4 border-brutal-black/40
            ${isActive ? "bg-brutal-yellow text-brutal-black" : "text-brutal-yellow/60 hover:text-brutal-yellow"}`
          }
        >
          <span className="text-lg">🏆</span>
          <span>RANKING</span>
        </NavLink>

        {user?.role === "ADMIN" && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 font-display text-xs tracking-wider transition-colors border-r-4 border-brutal-black/40
              ${isActive ? "bg-brutal-red text-brutal-white" : "text-brutal-red/80 hover:text-brutal-red"}`
            }
          >
            <span className="text-lg">⚙️</span>
            <span>ADMIN</span>
          </NavLink>
        )}

        {/* Pontuação do usuário */}
        <div
          className="flex-1 flex flex-col items-center py-3 cursor-pointer"
          onClick={handleLogout}
          title="Clique para sair"
        >
          <span className="text-lg">🚪</span>
          <span className="font-display text-xs text-brutal-yellow/60 tracking-wider">
            SAIR
          </span>
        </div>
      </div>
    </nav>
  );
}
