// src/pages/RankingPage.jsx
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const PODIUM_COLORS = ['bg-brutal-yellow', 'bg-brutal-gray', 'bg-brutal-orange'];
const PODIUM_ICONS = ['🥇', '🥈', '🥉'];

export default function RankingPage() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanking() {
      try {
        const { data } = await api.get('/ranking');
        setRanking(data.ranking);
      } catch {
        toast.error('Erro ao carregar ranking.');
      } finally {
        setLoading(false);
      }
    }
    fetchRanking();
  }, []);

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border-4 border-brutal-black h-16 bg-brutal-yellow/30 animate-pulse" />
        ))}
      </div>
    );
  }

  // Top 3 pódio
  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div className="min-h-screen bg-brutal-gray pb-6">
      {/* Pódio */}
      {top3.length > 0 && (
        <div className="px-4 pt-4 pb-2">
          <div className="bg-brutal-black border-4 border-brutal-black p-3 mb-4">
            <h2 className="font-display text-brutal-yellow text-center tracking-widest text-sm">
              🏆 PÓDIO
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {top3.map((player, idx) => (
              <div
                key={player.id}
                className={`border-4 border-brutal-black ${PODIUM_COLORS[idx]} shadow-brutal p-3 text-center
                  ${player.isCurrentUser ? 'ring-4 ring-brutal-blue ring-offset-2' : ''}`}
              >
                <div className="font-display text-3xl mb-1">{PODIUM_ICONS[idx]}</div>
                <div className="font-display text-lg text-brutal-black leading-tight">
                  {player.totalPoints}
                </div>
                <div className="font-body text-xs font-bold text-brutal-black mt-1 truncate">
                  {player.name.split(' ')[0]}
                  {player.isCurrentUser && ' (você)'}
                </div>
                <div className="font-display text-xs text-brutal-black/60 mt-1">pts</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabela completa */}
      <div className="px-4 mt-2">
        <div className="border-4 border-brutal-black bg-brutal-white shadow-brutal overflow-hidden">
          {/* Header da tabela */}
          <div className="grid grid-cols-12 bg-brutal-black text-brutal-yellow px-3 py-2 border-b-4 border-brutal-black">
            <span className="col-span-1 font-display text-xs text-center">#</span>
            <span className="col-span-5 font-display text-xs">JOGADOR</span>
            <span className="col-span-2 font-display text-xs text-center">PTS</span>
            <span className="col-span-2 font-display text-xs text-center">🎯</span>
            <span className="col-span-2 font-display text-xs text-center">👍</span>
          </div>

          {ranking.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-display text-brutal-black">NENHUM JOGADOR AINDA</p>
            </div>
          ) : (
            ranking.map((player, idx) => (
              <div
                key={player.id}
                className={`grid grid-cols-12 items-center px-3 py-3 border-b-2 border-brutal-black/10 transition-colors
                  ${player.isCurrentUser
                    ? 'bg-brutal-blue/10 border-b-2 border-brutal-blue/30'
                    : idx % 2 === 0 ? 'bg-brutal-white' : 'bg-brutal-gray/30'
                  }
                  ${idx < 3 ? 'font-bold' : ''}`}
              >
                {/* Posição */}
                <span className={`col-span-1 font-display text-center text-sm
                  ${idx === 0 ? 'text-brutal-yellow bg-brutal-black w-6 h-6 flex items-center justify-center mx-auto' : 'text-brutal-black/60'}`}>
                  {idx < 3 ? PODIUM_ICONS[idx] : `${player.position}º`}
                </span>

                {/* Nome */}
                <div className="col-span-5 min-w-0">
                  <p className={`font-body text-sm font-bold truncate ${player.isCurrentUser ? 'text-brutal-blue' : 'text-brutal-black'}`}>
                    {player.name}
                    {player.isCurrentUser && <span className="text-xs ml-1 opacity-60">(você)</span>}
                  </p>
                  <p className="font-body text-xs text-brutal-black/40">
                    {player.totalGuesses} palpite{player.totalGuesses !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Pontos totais */}
                <div className="col-span-2 text-center">
                  <span className={`font-display text-lg ${idx === 0 ? 'text-brutal-black' : 'text-brutal-black'}`}>
                    {player.totalPoints}
                  </span>
                </div>

                {/* Placares exatos (2pts) */}
                <div className="col-span-2 text-center">
                  <span className="font-display text-sm text-brutal-green bg-brutal-black px-1">
                    {player.exactScores}
                  </span>
                </div>

                {/* Parciais (1pt) */}
                <div className="col-span-2 text-center">
                  <span className="font-display text-sm text-brutal-black">
                    {player.partialScores}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Legenda */}
        <div className="flex gap-4 mt-3 px-1">
          <span className="font-body text-xs text-brutal-black/60 font-bold">
            🎯 = placar exato (2pts)
          </span>
          <span className="font-body text-xs text-brutal-black/60 font-bold">
            👍 = vencedor certo (1pt)
          </span>
        </div>
      </div>
    </div>
  );
}
