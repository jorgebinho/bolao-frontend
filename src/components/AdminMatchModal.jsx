// src/components/AdminMatchModal.jsx
import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const WORLD_CUP_TEAMS = [
  'Brasil', 'Argentina', 'França', 'Alemanha', 'Espanha', 'Portugal',
  'Inglaterra', 'Itália', 'Holanda', 'Bélgica', 'Croácia', 'Marrocos',
  'Japão', 'Coreia do Sul', 'EUA', 'México', 'Uruguai', 'Colômbia',
  'Equador', 'Senegal', 'Gana', 'Camarões', 'Tunísia', 'Austrália',
  'Polônia', 'Sérvia', 'Dinamarca', 'Suíça', 'Canadá', 'Qatar',
  'Costa Rica', 'Irã', 'Arabia Saudita',
];

const STAGES = [
  'Fase de Grupos - Grupo A', 'Fase de Grupos - Grupo B',
  'Fase de Grupos - Grupo C', 'Fase de Grupos - Grupo D',
  'Fase de Grupos - Grupo E', 'Fase de Grupos - Grupo F',
  'Fase de Grupos - Grupo G', 'Fase de Grupos - Grupo H',
  'Oitavas de Final', 'Quartas de Final',
  'Semifinal', 'Disputa 3º Lugar', 'Final',
];

function toLocalDatetimeString(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export default function AdminMatchModal({ match, onClose, onSaved }) {
  const isEditing = Boolean(match?.id);
  const isScoring = match?.status === 'LOCKED' || match?.status === 'FINISHED';

  const [form, setForm] = useState({
    homeTeam: match?.homeTeam || '',
    awayTeam: match?.awayTeam || '',
    homeFlag: match?.homeFlag || '',
    awayFlag: match?.awayFlag || '',
    matchDate: toLocalDatetimeString(match?.matchDate) || '',
    stage: match?.stage || '',
  });

  const [scoreForm, setScoreForm] = useState({
    homeScore: match?.homeScore !== null && match?.homeScore !== undefined ? String(match.homeScore) : '',
    awayScore: match?.awayScore !== null && match?.awayScore !== undefined ? String(match.awayScore) : '',
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(isScoring && !isEditing ? 'score' : 'details');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSaveMatch(e) {
    e.preventDefault();
    if (!form.homeTeam || !form.awayTeam || !form.matchDate) {
      toast.error('Times e data são obrigatórios!');
      return;
    }
    if (form.homeTeam === form.awayTeam) {
      toast.error('Os times não podem ser iguais!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        matchDate: new Date(form.matchDate).toISOString(),
        homeFlag: form.homeFlag || null,
        awayFlag: form.awayFlag || null,
      };

      if (isEditing) {
        await api.put(`/admin/matches/${match.id}`, payload);
        toast.success('Jogo atualizado!');
      } else {
        await api.post('/admin/matches', payload);
        toast.success('Jogo cadastrado! ⚽');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar jogo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleScoreMatch(e) {
    e.preventDefault();
    if (scoreForm.homeScore === '' || scoreForm.awayScore === '') {
      toast.error('Insira o placar completo!');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/admin/score-match', {
        matchId: match.id,
        homeScore: parseInt(scoreForm.homeScore),
        awayScore: parseInt(scoreForm.awayScore),
      });
      toast.success(`🏆 Pontuação calculada! ${data.summary?.length || 0} palpites processados.`);
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao pontuar jogo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteMatch() {
    if (!confirm(`Excluir o jogo ${match.homeTeam} x ${match.awayTeam}?`)) return;
    setLoading(true);
    try {
      await api.delete(`/admin/matches/${match.id}`);
      toast.success('Jogo removido.');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao remover jogo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-brutal-black/80 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-lg bg-brutal-white border-4 border-brutal-black shadow-brutal-xl animate-slide-in-up">
        {/* Header */}
        <div className="bg-brutal-black flex items-center justify-between px-4 py-3 border-b-4 border-brutal-black">
          <h2 className="font-display text-brutal-yellow tracking-wider text-sm">
            {isEditing ? '✏️ EDITAR JOGO' : '➕ NOVO JOGO'}
          </h2>
          <button
            onClick={onClose}
            className="text-brutal-yellow font-display text-xl hover:text-brutal-red transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs (só aparece em edição) */}
        {isEditing && (
          <div className="flex border-b-4 border-brutal-black">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 font-display text-xs tracking-wider transition-colors ${
                activeTab === 'details' ? 'bg-brutal-yellow text-brutal-black' : 'bg-brutal-white text-brutal-black hover:bg-brutal-gray'
              }`}
            >
              DETALHES
            </button>
            <button
              onClick={() => setActiveTab('score')}
              className={`flex-1 py-3 font-display text-xs tracking-wider border-l-4 border-brutal-black transition-colors ${
                activeTab === 'score' ? 'bg-brutal-green text-brutal-black' : 'bg-brutal-white text-brutal-black hover:bg-brutal-gray'
              }`}
            >
              🏁 RESULTADO
            </button>
          </div>
        )}

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {/* TAB DETALHES */}
          {activeTab === 'details' && (
            <form onSubmit={handleSaveMatch} className="space-y-4">
              {/* Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-display text-xs tracking-widest mb-1">TIME CASA</label>
                  <select
                    name="homeTeam"
                    value={form.homeTeam}
                    onChange={handleChange}
                    required
                    className="w-full border-4 border-brutal-black p-2 font-body font-bold bg-brutal-yellow text-brutal-black focus:outline-none text-sm"
                  >
                    <option value="">Selecione...</option>
                    {WORLD_CUP_TEAMS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-display text-xs tracking-widest mb-1">TIME VISITANTE</label>
                  <select
                    name="awayTeam"
                    value={form.awayTeam}
                    onChange={handleChange}
                    required
                    className="w-full border-4 border-brutal-black p-2 font-body font-bold bg-brutal-yellow text-brutal-black focus:outline-none text-sm"
                  >
                    <option value="">Selecione...</option>
                    {WORLD_CUP_TEAMS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data e hora */}
              <div>
                <label className="block font-display text-xs tracking-widest mb-1">DATA E HORA</label>
                <input
                  type="datetime-local"
                  name="matchDate"
                  value={form.matchDate}
                  onChange={handleChange}
                  required
                  className="w-full border-4 border-brutal-black p-2 font-body font-bold bg-brutal-white focus:outline-none"
                />
              </div>

              {/* Fase */}
              <div>
                <label className="block font-display text-xs tracking-widest mb-1">FASE</label>
                <select
                  name="stage"
                  value={form.stage}
                  onChange={handleChange}
                  className="w-full border-4 border-brutal-black p-2 font-body font-bold bg-brutal-white focus:outline-none text-sm"
                >
                  <option value="">Sem fase definida</option>
                  {STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-2">
                {isEditing && match.status === 'UPCOMING' && (
                  <button
                    type="button"
                    onClick={handleDeleteMatch}
                    disabled={loading}
                    className="px-4 py-3 border-4 border-brutal-black bg-brutal-red text-brutal-white font-display text-xs tracking-wider shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    EXCLUIR
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 border-4 border-brutal-black bg-brutal-black text-brutal-yellow font-display text-sm tracking-wider shadow-brutal-yellow hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-60"
                >
                  {loading ? '...' : isEditing ? 'SALVAR ALTERAÇÕES' : '⚽ CADASTRAR JOGO'}
                </button>
              </div>
            </form>
          )}

          {/* TAB RESULTADO */}
          {activeTab === 'score' && match && (
            <form onSubmit={handleScoreMatch} className="space-y-4">
              {match.status === 'FINISHED' && (
                <div className="bg-brutal-orange border-4 border-brutal-black p-3">
                  <p className="font-display text-xs text-brutal-black tracking-wider">
                    ⚠️ JOGO JÁ PONTUADO — Resultado atual: {match.homeScore} x {match.awayScore}
                  </p>
                </div>
              )}

              <p className="font-display text-brutal-black text-center text-lg">
                {match.homeTeam} vs {match.awayTeam}
              </p>

              <div>
                <label className="block font-display text-xs tracking-widest mb-2 text-center">
                  RESULTADO FINAL
                </label>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="font-body text-xs font-bold text-brutal-black/60 mb-1">
                      {match.homeTeam.toUpperCase()}
                    </p>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={scoreForm.homeScore}
                      onChange={(e) => setScoreForm((f) => ({ ...f, homeScore: e.target.value }))}
                      disabled={match.status === 'FINISHED'}
                      className="w-20 h-20 border-4 border-brutal-black text-center font-display text-4xl bg-brutal-green focus:outline-none disabled:bg-brutal-gray disabled:cursor-not-allowed"
                      placeholder="0"
                    />
                  </div>
                  <span className="font-display text-3xl text-brutal-black">X</span>
                  <div className="text-center">
                    <p className="font-body text-xs font-bold text-brutal-black/60 mb-1">
                      {match.awayTeam.toUpperCase()}
                    </p>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={scoreForm.awayScore}
                      onChange={(e) => setScoreForm((f) => ({ ...f, awayScore: e.target.value }))}
                      disabled={match.status === 'FINISHED'}
                      className="w-20 h-20 border-4 border-brutal-black text-center font-display text-4xl bg-brutal-green focus:outline-none disabled:bg-brutal-gray disabled:cursor-not-allowed"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {match.status !== 'FINISHED' && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 border-4 border-brutal-black bg-brutal-green text-brutal-black font-display text-sm tracking-wider shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-60"
                >
                  {loading ? 'CALCULANDO...' : '🏆 CONFIRMAR RESULTADO E PONTUAR'}
                </button>
              )}

              <p className="text-center font-body text-xs text-brutal-black/50">
                Isso calculará os pontos de todos os participantes.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
