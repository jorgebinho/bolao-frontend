// src/pages/DashboardPage.jsx
import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import MatchCard from '../components/MatchCard';
import toast from 'react-hot-toast';

const FILTER_OPTIONS = [
  { key: 'all',      label: 'TODOS' },
  { key: 'UPCOMING', label: 'ABERTOS' },
  { key: 'LOCKED',   label: 'EM JOGO' },
  { key: 'FINISHED', label: 'FINALIZADOS' },
];

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchMatches = useCallback(async () => {
    try {
      const { data } = await api.get('/matches');
      setMatches(data.matches);
    } catch {
      toast.error('Erro ao carregar jogos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    // Polling a cada 60s para atualizar status dos jogos
    const interval = setInterval(fetchMatches, 60_000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  function handleGuessSubmitted() {
    fetchMatches();
    refreshUser();
  }

  const filtered = filter === 'all'
    ? matches
    : matches.filter((m) => m.status === filter);

  const pendingGuesses = matches.filter(
    (m) => m.status === 'UPCOMING' && !m.myGuess
  ).length;

  return (
    <div className="min-h-screen bg-brutal-gray">
      {/* Banner de jogos sem palpite */}
      {pendingGuesses > 0 && (
        <div className="bg-brutal-orange border-b-4 border-brutal-black px-4 py-2 flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <span className="font-display text-xs tracking-wider text-brutal-black">
            VOCÊ TEM {pendingGuesses} JOGO{pendingGuesses > 1 ? 'S' : ''} SEM PALPITE!
          </span>
        </div>
      )}

      {/* Filtros */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`flex-shrink-0 px-3 py-2 border-4 border-brutal-black font-display text-xs tracking-wider transition-all ${
                filter === opt.key
                  ? 'bg-brutal-black text-brutal-yellow shadow-brutal-yellow'
                  : 'bg-brutal-white text-brutal-black shadow-brutal hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de jogos */}
      <div className="px-4 pb-6 space-y-4">
        {loading ? (
          <div className="flex flex-col gap-4 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-4 border-brutal-black bg-brutal-yellow/50 h-48 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="border-4 border-brutal-black bg-brutal-white shadow-brutal p-8 text-center mt-4">
            <span className="text-5xl block mb-3">⚽</span>
            <p className="font-display text-lg text-brutal-black">NENHUM JOGO AQUI</p>
            <p className="font-body text-sm text-brutal-black/60 mt-1">
              {filter === 'all' ? 'Aguarde os jogos serem cadastrados.' : 'Tente outro filtro.'}
            </p>
          </div>
        ) : (
          filtered.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onGuessSubmitted={handleGuessSubmitted}
            />
          ))
        )}
      </div>
    </div>
  );
}
