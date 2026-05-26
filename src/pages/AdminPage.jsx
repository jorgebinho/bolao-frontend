// src/pages/AdminPage.jsx
import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import AdminMatchModal from '../components/AdminMatchModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminPage() {
  const { user: me } = useAuth();
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('matches');
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null); // null = fechado, {} = novo, match = editar
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [matchesRes, usersRes] = await Promise.all([
        api.get('/matches'),
        api.get('/admin/users'),
      ]);
      setMatches(matchesRes.data.matches);
      setUsers(usersRes.data.users);
    } catch {
      toast.error('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openNewMatch() {
    setSelectedMatch({});
    setShowModal(true);
  }

  function openEditMatch(match) {
    setSelectedMatch(match);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedMatch(null);
  }

  async function handlePromoteUser(userId, userName) {
    if (!confirm(`Promover "${userName}" a ADMIN?`)) return;
    try {
      await api.patch(`/admin/users/${userId}/promote`);
      toast.success(`${userName} agora é ADMIN!`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao promover.');
    }
  }

  async function handleDemoteUser(userId, userName) {
    if (!confirm(`Remover cargo de ADMIN de "${userName}"?`)) return;
    try {
      await api.patch(`/admin/users/${userId}/demote`);
      toast.success(`${userName} agora é usuário comum.`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao rebaixar.');
    }
  }

  async function handleDeleteUser(userId, userName) {
    if (!confirm(`EXCLUIR "${userName}" do bolão? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success(`${userName} foi removido.`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao remover usuário.');
    }
  }

  const STATUS_BADGE = {
    UPCOMING: 'bg-brutal-green text-brutal-black',
    LOCKED:   'bg-brutal-orange text-brutal-black',
    FINISHED: 'bg-brutal-black text-brutal-yellow',
  };

  return (
    <div className="min-h-screen bg-brutal-gray pb-20">
      {/* Admin Banner */}
      <div className="bg-brutal-red border-b-4 border-brutal-black px-4 py-3 flex items-center gap-2">
        <span className="text-xl">⚙️</span>
        <div>
          <p className="font-display text-xs tracking-widest text-brutal-white">PAINEL DO ADMINISTRADOR</p>
          <p className="font-body text-xs text-brutal-white/60 font-bold">{me?.name}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-4 border-brutal-black bg-brutal-white">
        <button
          onClick={() => setTab('matches')}
          className={`flex-1 py-3 font-display text-xs tracking-wider transition-colors ${
            tab === 'matches' ? 'bg-brutal-black text-brutal-yellow' : 'text-brutal-black hover:bg-brutal-gray'
          }`}
        >
          ⚽ JOGOS ({matches.length})
        </button>
        <button
          onClick={() => setTab('users')}
          className={`flex-1 py-3 font-display text-xs tracking-wider border-l-4 border-brutal-black transition-colors ${
            tab === 'users' ? 'bg-brutal-black text-brutal-yellow' : 'text-brutal-black hover:bg-brutal-gray'
          }`}
        >
          👥 USUÁRIOS ({users.length})
        </button>
      </div>

      <div className="px-4 pt-4">
        {/* ─── TAB JOGOS ─── */}
        {tab === 'matches' && (
          <>
            <button
              onClick={openNewMatch}
              className="w-full mb-4 py-4 border-4 border-brutal-black bg-brutal-green text-brutal-black font-display tracking-wider shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              ➕ CADASTRAR NOVO JOGO
            </button>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="border-4 border-brutal-black h-20 bg-brutal-yellow/30 animate-pulse" />
                ))}
              </div>
            ) : matches.length === 0 ? (
              <div className="border-4 border-brutal-black bg-brutal-white p-8 text-center shadow-brutal">
                <p className="font-display text-brutal-black">NENHUM JOGO CADASTRADO</p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => openEditMatch(match)}
                    className="w-full border-4 border-brutal-black bg-brutal-white shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-left p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-display text-xs px-2 py-0.5 border-2 border-brutal-black ${STATUS_BADGE[match.status]}`}>
                        {match.status}
                      </span>
                      <span className="font-body text-xs text-brutal-black/50 font-bold">
                        {format(new Date(match.matchDate), "dd/MM HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="font-display text-sm text-brutal-black">
                      {match.homeTeam} <span className="opacity-40">vs</span> {match.awayTeam}
                      {match.status === 'FINISHED' && (
                        <span className="ml-2 text-brutal-green">
                          ({match.homeScore} x {match.awayScore})
                        </span>
                      )}
                    </p>
                    {match.stage && (
                      <p className="font-body text-xs text-brutal-black/50 mt-0.5 font-bold">{match.stage}</p>
                    )}
                    <p className="font-body text-xs text-brutal-black/40 mt-1">
                      {match.guesses?.length || 0} palpite(s) · toque para editar
                    </p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── TAB USUÁRIOS ─── */}
        {tab === 'users' && (
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-4 border-brutal-black h-16 bg-brutal-yellow/30 animate-pulse" />
                ))}
              </div>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  className={`border-4 border-brutal-black p-3 shadow-brutal-sm ${
                    u.role === 'ADMIN' ? 'bg-brutal-yellow' : 'bg-brutal-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display text-sm text-brutal-black truncate">{u.name}</span>
                        {u.role === 'ADMIN' && (
                          <span className="font-display text-xs px-1.5 py-0.5 bg-brutal-black text-brutal-yellow border-2 border-brutal-black">
                            ADMIN
                          </span>
                        )}
                        {u.id === me?.id && (
                          <span className="font-body text-xs text-brutal-black/50 font-bold">(você)</span>
                        )}
                      </div>
                      <p className="font-body text-xs text-brutal-black/50 font-bold truncate">{u.email}</p>
                      <p className="font-body text-xs text-brutal-black font-bold mt-0.5">
                        {u.points} pts · {u._count?.guesses || 0} palpites
                      </p>
                    </div>

                    {u.id !== me?.id && (
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        {u.role === 'USER' ? (
                          <button
                            onClick={() => handlePromoteUser(u.id, u.name)}
                            className="px-2 py-1.5 border-2 border-brutal-black bg-brutal-blue text-brutal-white font-display text-xs tracking-wider hover:bg-brutal-purple transition-colors"
                          >
                            ADMIN ↑
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDemoteUser(u.id, u.name)}
                            className="px-2 py-1.5 border-2 border-brutal-black bg-brutal-gray text-brutal-black font-display text-xs tracking-wider"
                          >
                            USER ↓
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="px-2 py-1.5 border-2 border-brutal-black bg-brutal-red text-brutal-white font-display text-xs tracking-wider hover:opacity-80 transition-opacity"
                        >
                          EXCLUIR
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AdminMatchModal
          match={selectedMatch?.id ? selectedMatch : null}
          onClose={closeModal}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}
