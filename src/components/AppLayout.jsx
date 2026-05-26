// src/components/AppLayout.jsx
import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-brutal-gray">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-brutal-black border-b-4 border-brutal-yellow">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-brutal-yellow text-xl leading-none">
              ⚽
            </span>
            <div>
              <span className="font-display text-brutal-yellow text-sm tracking-widest block leading-none">
                BOLÃO
              </span>
              <span className="font-display text-brutal-yellow/40 text-xs tracking-wider">
                DO COPÃO
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-body text-brutal-yellow/60 text-xs font-bold truncate max-w-[120px]">
              {user?.name?.split(" ")[0]}
            </p>
            <p className="font-display text-brutal-yellow text-sm">
              {user?.points || 0}{" "}
              <span className="text-brutal-yellow/40 text-xs">pts</span>
            </p>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
