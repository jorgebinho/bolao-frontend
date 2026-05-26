// src/components/MatchCard.jsx
import { useState } from 'react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../lib/api';
import toast from 'react-hot-toast';

// Mapa de emojis de bandeira por nome de seleção (principais)
const FLAG_EMOJI = {
  'Brasil': '🇧🇷', 'Argentina': '🇦🇷', 'França': '🇫🇷', 'Alemanha': '🇩🇪',
  'Espanha': '🇪🇸', 'Portugal': '🇵🇹', 'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Itália': '🇮🇹',
  'Holanda': '🇳🇱', 'Bélgica': '🇧🇪', 'Croácia': '🇭🇷', 'Marrocos': '🇲🇦',
  'Japão': '🇯🇵', 'Coreia do Sul': '🇰🇷', 'EUA': '🇺🇸', 'México': '🇲🇽',
  'Uruguai': '🇺🇾', 'Colômbia': '🇨🇴', 'Equador': '🇪🇨', 'Senegal': '🇸🇳',
  'Gana': '🇬🇭', 'Camarões': '🇨🇲', 'Tunísia': '🇹🇳', 'Austrália': '🇦🇺',
  'Polônia': '🇵🇱', 'Sérvia': '🇷🇸', 'Dinamarca': '🇩🇰', 'Suíça': '🇨🇭',
  'Canadá': '🇨🇦', 'Costa Rica': '🇨🇷', 'Qatar': '🇶🇦', 'Irã': '🇮🇷',
  'Arabia Saudita': '🇸🇦', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
};

function getFlag(teamName, flagUrl) {
  if (flagUrl) return <img src={flagUrl} alt={teamName} className="w-8 h-6 object-cover border border-brutal-black" />;
  return <span className="text-2xl">{FLAG_EMOJI[teamName] || '🏳️'}</span>;
}

const STATUS_CONFIG = {
  UPCOMING: { label: 'ABERTO', bg: 'bg-brutal-green', text: 'text-brutal-black' },
  LOCKED:   { label: 'FECHADO', bg: 'bg-brutal-red', text: 'text-brutal-white' },
  FINISHED: { label: 'ENCERRADO', bg: 'bg-brutal-black', text: 'text-brutal-yellow' },
};

export default function MatchCard({ match, onGuessSubmitted }) {
  const [homeInput, setHomeInput] = useState(
    match.myGuess?.homeGuess !== undefined ? String(match.myGuess.homeGuess) : ''
  );
  const [awayInput, setAwayInput] = useState(
    match.myGuess?.awayGuess !== undefined ? String(match.myGuess.awayGuess) : ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [showGuesses, setShowGuesses] = useState(false);

  const isLocked = match.isLocked;
  const isFinished = match.status === 'FINISHED';
  const hasMyGuess = match.myGuess !== null;
  const statusConfig = STATUS_CONFIG[match.status] || STATUS_CONFIG.UPCOMING;

  async function handleGuessSubmit(e) {
    e.preventDefault();
    if (homeInput === '' || awayInput === '') {
      toast.error('Preencha os dois placares!');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/matches/${match.id}/guess`, {
        homeGuess: parseInt(homeInput),
        awayGuess: parseInt(awayInput),
      });
      toast.success(hasMyGuess ? '✏️ Palpite atualizado!' : '✅ Palpite registrado!');
      onGuessSubmitted?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar palpite.');
    } finally {
      setSubmitting(false);
    }
  }

  const matchDateObj = new Date(match.matchDate);
  const isToday = new Date().toDateString() === matchDateObj.toDateString();

  // Cor do card baseada no status
  const cardColors = {
    UPCOMING: 'bg-brutal-yellow',
    LOCKED: 'bg-brutal-orange',
    FINISHED: 'bg-brutal-white',
  };

  return (
    <div className={`border-4 border-brutal-black shadow-brutal ${cardColors[match.status] || 'bg-brutal-yellow'} animate-slide-in-up`}>
      {/* Header do card */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b-4 border-brutal-black">
        <span className="font-display text-xs tracking-widest text-brutal-black opacity-70">
          {match.stage || 'COPA DO MUNDO'}
        </span>
        <span className={`font-display text-xs tracking-wider px-2 py-1 border-2 border-brutal-black ${statusConfig.bg} ${statusConfig.text}`}>
          {statusConfig.label}
        </span>
      </div>

      {/* Confronto */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Time da Casa */}
          <div className="flex-1 flex flex-col items-center gap-1">
            {getFlag(match.homeTeam, match.homeFlag)}
            <span className="font-display text-sm text-brutal-black text-center leading-tight">
              {match.homeTeam.toUpperCase()}
            </span>
          </div>

          {/* Placar / Horário */}
          <div className="flex flex-col items-center">
            {isFinished ? (
              <div className="flex items-center gap-2">
                <span className="font-display text-4xl text-brutal-black">{match.homeScore}</span>
                <span className="font-display text-2xl text-brutal-black opacity-50">x</span>
                <span className="font-display text-4xl text-brutal-black">{match.awayScore}</span>
              </div>
            ) : (
              <>
                <span className="font-display text-2xl text-brutal-black">
                  {format(matchDateObj, 'HH:mm')}
                </span>
                <span className="font-body text-xs text-brutal-black font-bold opacity-60">
                  {isToday
                    ? 'HOJE'
                    : format(matchDateObj, "dd 'de' MMM", { locale: ptBR }).toUpperCase()}
                </span>
              </>
            )}
          </div>

          {/* Time Visitante */}
          <div className="flex-1 flex flex-col items-center gap-1">
            {getFlag(match.awayTeam, match.awayFlag)}
            <span className="font-display text-sm text-brutal-black text-center leading-tight">
              {match.awayTeam.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Palpite do usuário */}
      {!isFinished && (
        <div className="px-4 pb-3 border-t-4 border-brutal-black pt-3">
          {isLocked ? (
            hasMyGuess ? (
              <div className="bg-brutal-black text-brutal-white p-2 flex items-center justify-between">
                <span className="font-body text-xs font-bold">SEU PALPITE</span>
                <span className="font-display text-lg">
                  {match.myGuess.homeGuess} x {match.myGuess.awayGuess}
                </span>
              </div>
            ) : (
              <div className="bg-brutal-red text-brutal-white p-2 text-center">
                <span className="font-display text-xs tracking-wider">⛔ SEM PALPITE</span>
              </div>
            )
          ) : (
            <form onSubmit={handleGuessSubmit}>
              <p className="font-display text-xs tracking-wider text-brutal-black mb-2">
                {hasMyGuess ? '✏️ ALTERAR PALPITE' : '💡 SEU PALPITE'}
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={homeInput}
                  onChange={(e) => setHomeInput(e.target.value)}
                  className="w-14 h-12 border-4 border-brutal-black text-center font-display text-2xl bg-brutal-white focus:outline-none focus:bg-brutal-green"
                  placeholder="0"
                />
                <span className="font-display text-xl text-brutal-black font-bold">X</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={awayInput}
                  onChange={(e) => setAwayInput(e.target.value)}
                  className="w-14 h-12 border-4 border-brutal-black text-center font-display text-2xl bg-brutal-white focus:outline-none focus:bg-brutal-green"
                  placeholder="0"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-12 bg-brutal-black text-brutal-yellow border-4 border-brutal-black font-display text-sm tracking-wider hover:bg-brutal-blue transition-colors disabled:opacity-50 active:scale-95"
                >
                  {submitting ? '...' : hasMyGuess ? 'SALVAR' : 'APOSTAR'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Resultado do palpite (jogo finalizado) */}
      {isFinished && hasMyGuess && (
        <div className={`px-4 pb-3 border-t-4 border-brutal-black pt-3 flex items-center justify-between
          ${match.myGuess.points === 2 ? 'bg-brutal-green' : match.myGuess.points === 1 ? 'bg-brutal-yellow' : 'bg-brutal-gray'}`}
        >
          <div>
            <p className="font-display text-xs tracking-wider text-brutal-black">SEU PALPITE</p>
            <p className="font-display text-xl text-brutal-black">
              {match.myGuess.homeGuess} x {match.myGuess.awayGuess}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-xs tracking-wider text-brutal-black">PONTOS</p>
            <p className="font-display text-4xl text-brutal-black">
              {match.myGuess.points === 2 ? '🎯' : match.myGuess.points === 1 ? '👍' : '❌'} {match.myGuess.points}
            </p>
          </div>
        </div>
      )}

      {/* Palpites dos outros jogadores (visível após bloqueio) */}
      {(isLocked || isFinished) && match.guesses.length > 0 && (
        <div className="border-t-4 border-brutal-black">
          <button
            onClick={() => setShowGuesses(!showGuesses)}
            className="w-full px-4 py-2 font-display text-xs tracking-wider text-brutal-black bg-brutal-gray hover:bg-brutal-black hover:text-brutal-yellow transition-colors border-none text-left flex justify-between items-center"
          >
            <span>👥 PALPITES ({match.guesses.length})</span>
            <span>{showGuesses ? '▲' : '▼'}</span>
          </button>
          {showGuesses && (
            <div className="max-h-40 overflow-y-auto">
              {match.guesses.map((g) => (
                <div key={g.userId} className="flex items-center justify-between px-4 py-2 border-t-2 border-brutal-black/20 hover:bg-brutal-black/5">
                  <span className="font-body text-sm font-bold text-brutal-black truncate flex-1 mr-2">
                    {g.userName}
                  </span>
                  <span className="font-display text-sm text-brutal-black mr-3">
                    {g.homeGuess} x {g.awayGuess}
                  </span>
                  {isFinished && (
                    <span className={`font-display text-sm px-2 py-0.5 border-2 border-brutal-black ${
                      g.points === 2 ? 'bg-brutal-green' : g.points === 1 ? 'bg-brutal-yellow' : 'bg-brutal-gray'
                    }`}>
                      {g.points}pt
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
