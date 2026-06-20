import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import AdminMatchModal from '../components/AdminMatchModal';
import { Badge, Button, Card, EmptyState, Input, LoadingState, PageHeader, Select, StatCard } from '../components/ui';

function generateTemporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = new Uint32Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('');
}

function hasFinishedResult(match) {
  return (
    match.status === 'FINISHED' &&
    match.homeScore !== null &&
    match.homeScore !== undefined &&
    match.awayScore !== null &&
    match.awayScore !== undefined
  );
}

export default function AdminPage() {
  const { user: me } = useAuth();
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('matches');
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [champion, setChampion] = useState('');
  const [currentChampion, setCurrentChampion] = useState('');
  const [teams, setTeams] = useState([]);
  const [savingChampion, setSavingChampion] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [hideFinishedMatches, setHideFinishedMatches] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [matchesRes, usersRes, teamsRes, championRes] = await Promise.all([
        api.get('/matches'),
        api.get('/admin/users'),
        api.get('/matches/teams'),
        api.get('/champion-guess'),
      ]);
      setMatches(matchesRes.data.matches || []);
      setUsers(usersRes.data.users || []);
      setTeams(teamsRes.data.teams || []);
      setCurrentChampion(championRes.data.officialChampion || '');
      setChampion(championRes.data.officialChampion || '');
    } catch {
      toast.error('Erro ao carregar dados do admin.');
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

  async function handlePromoteUser(userId, userName) {
    if (!confirm(`Promover "${userName}" a admin?`)) return;
    try {
      await api.patch(`/admin/users/${userId}/promote`);
      toast.success(`${userName} agora é admin.`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao promover usuário.');
    }
  }

  async function handleDemoteUser(userId, userName) {
    if (!confirm(`Remover admin de "${userName}"?`)) return;
    try {
      await api.patch(`/admin/users/${userId}/demote`);
      toast.success(`${userName} agora é usuário comum.`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao rebaixar usuário.');
    }
  }

  async function handleDeleteUser(userId, userName) {
    if (!confirm(`Excluir "${userName}" do bolão?`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Usuário removido.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao remover usuário.');
    }
  }

  function openPasswordEditor(userId) {
    setPasswordUserId((current) => current === userId ? '' : userId);
    setPasswordValue('');
    setShowPassword(false);
  }

  function handleGenerateTemporaryPassword(userId) {
    setPasswordUserId(userId);
    setPasswordValue(generateTemporaryPassword());
    setShowPassword(true);
  }

  async function handleCopyPassword() {
    if (!passwordValue) return toast.error('Gere ou informe uma senha primeiro.');

    try {
      await navigator.clipboard.writeText(passwordValue);
      toast.success('Senha copiada.');
    } catch {
      toast.error('Não foi possível copiar a senha.');
    }
  }

  async function handleResetPassword(userId, userName) {
    if (passwordValue.length < 6) return toast.error('A nova senha deve ter pelo menos 6 caracteres.');
    if (!confirm(`Redefinir a senha de "${userName}"? A senha antiga não poderá ser recuperada.`)) return;

    setSavingPassword(true);
    try {
      await api.patch(`/admin/users/${userId}/password`, { password: passwordValue });
      toast.success(`Senha de ${userName} redefinida.`);
      setPasswordUserId('');
      setPasswordValue('');
      setShowPassword(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao redefinir senha.');
    } finally {
      setSavingPassword(false);
    }
  }

  async function saveChampion(event) {
    event.preventDefault();
    if (!champion.trim()) return toast.error('Informe a seleção campeã.');
    const action = currentChampion ? 'alterar' : 'salvar';
    const message = currentChampion
      ? `Alterar campeão oficial de "${currentChampion}" para "${champion}"? Isso recalcula os pontos extras.`
      : `Salvar "${champion}" como campeão oficial? Isso recalcula os pontos extras.`;

    if (!confirm(message)) return;

    setSavingChampion(true);
    try {
      const { data } = await api.post('/admin/champion-result', { champion });
      toast.success(`Campeão salvo. ${data.processed || 0} palpites processados.`);
      setCurrentChampion(data.champion || champion);
    } catch (err) {
      toast.error(err.response?.data?.error || `Erro ao ${action} campeão.`);
    } finally {
      setSavingChampion(false);
    }
  }

  const openMatches = matches.filter((match) => match.status === 'UPCOMING').length;
  const finishedMatches = matches.filter((match) => match.status === 'FINISHED').length;
  const visibleMatches = useMemo(
    () => matches.filter((match) => !hideFinishedMatches || !hasFinishedResult(match)),
    [hideFinishedMatches, matches],
  );
  const hiddenFinishedMatches = matches.length - visibleMatches.length;

  return (
    <div>
      <PageHeader
        eyebrow={`Admin - ${me?.name || ''}`}
        title="Painel admin"
        description="Gerencie jogos, usuários, resultados e o campeão oficial."
      />

      <div className="space-y-5 px-4 py-5 sm:px-0">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Jogos" value={matches.length} tone="yellow" />
          <StatCard label="Abertos" value={openMatches} tone="green" />
          <StatCard label="Finalizados" value={finishedMatches} tone="white" />
          <StatCard label="Usuários" value={users.length} tone="blue" />
        </div>

        <Card className="p-3">
          <div className="flex gap-2 overflow-x-auto">
            {[
              ['matches', `Jogos (${matches.length})`],
              ['users', `Usuários (${users.length})`],
              ['champion', 'Campeão'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex-shrink-0 border-4 border-brutal-black px-3 py-2 font-display text-xs tracking-wider ${
                  tab === key ? 'bg-brutal-black text-brutal-yellow' : 'bg-brutal-white hover:bg-brutal-yellow'
                }`}
              >
                {label.toUpperCase()}
              </button>
            ))}
          </div>
        </Card>

        {tab === 'matches' && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-stretch">
              <Button variant="success" className="w-full" onClick={openNewMatch}>CADASTRAR NOVO JOGO</Button>
              <Button
                type="button"
                variant={hideFinishedMatches ? 'primary' : 'secondary'}
                className="w-full md:w-auto"
                onClick={() => setHideFinishedMatches((current) => !current)}
              >
                {hideFinishedMatches ? 'MOSTRAR FINALIZADOS' : 'OCULTAR FINALIZADOS'}
              </Button>
            </div>
            {hideFinishedMatches && hiddenFinishedMatches > 0 && (
              <p className="border-4 border-brutal-black bg-brutal-yellow p-3 text-sm font-bold">
                {hiddenFinishedMatches} jogo(s) finalizado(s) com resultado oculto(s).
              </p>
            )}
            {loading ? (
              <LoadingState rows={3} type="row" />
            ) : matches.length === 0 ? (
              <EmptyState title="Nenhum jogo cadastrado" description="Crie o primeiro jogo para liberar palpites." />
            ) : visibleMatches.length === 0 ? (
              <EmptyState title="Nenhum jogo para exibir" description="Desative o filtro para ver os jogos finalizados com resultado." />
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {visibleMatches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => openEditMatch(match)}
                    className="border-4 border-brutal-black bg-brutal-white p-4 text-left shadow-brutal transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <Badge tone={match.status === 'FINISHED' ? 'dark' : match.status === 'LOCKED' ? 'warning' : 'success'}>{match.status}</Badge>
                      <span className="text-xs font-bold text-brutal-black/50">
                        {format(new Date(match.matchDate), 'dd/MM HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                    <p className="font-display text-lg">{match.homeTeam} x {match.awayTeam}</p>
                    {match.status === 'FINISHED' && <p className="font-display text-brutal-green">{match.homeScore} x {match.awayScore}</p>}
                    <p className="mt-1 text-xs font-bold text-brutal-black/50">{match.stage || 'Sem fase'} - {match.guesses?.length || 0} palpite(s)</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div className="grid gap-3 lg:grid-cols-2">
            {loading ? (
              <LoadingState rows={4} type="row" />
            ) : users.length === 0 ? (
              <EmptyState title="Nenhum usuário" description="Usuários cadastrados aparecem aqui." />
            ) : (
              users.map((user) => (
                <Card key={user.id} className={`p-4 ${user.role === 'ADMIN' ? 'bg-brutal-yellow' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-display text-lg">{user.name}</p>
                        {user.role === 'ADMIN' && <Badge tone="dark">ADMIN</Badge>}
                        {user.id === me?.id && <Badge tone="info">VOCÊ</Badge>}
                      </div>
                      <p className="truncate text-xs font-bold text-brutal-black/50">{user.email}</p>
                      <p className="mt-1 text-sm font-bold">
                        {user.points} pts - {user._count?.guesses || 0} palpites - {user._count?.groupMemberships || 0} grupos
                      </p>
                      <p className="mt-1 text-xs font-bold text-brutal-black/55">Senha: ********</p>
                    </div>
                    {user.id !== me?.id && (
                      <div className="flex flex-col gap-2">
                        {user.role === 'USER' ? (
                          <Button size="sm" variant="secondary" onClick={() => handlePromoteUser(user.id, user.name)}>ADMIN</Button>
                        ) : (
                          <Button size="sm" variant="warning" onClick={() => handleDemoteUser(user.id, user.name)}>USER</Button>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => openPasswordEditor(user.id)}>SENHA</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteUser(user.id, user.name)}>EXCLUIR</Button>
                      </div>
                    )}
                  </div>
                  {passwordUserId === user.id && (
                    <div className="mt-4 border-t-4 border-brutal-black pt-4">
                      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="font-display text-sm tracking-wider">REDEFINIR SENHA</p>
                          <p className="text-xs font-bold text-brutal-black/60">
                            Gere uma temporária ou informe uma senha manualmente.
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleGenerateTemporaryPassword(user.id)}
                        >
                          GERAR TEMPORÁRIA
                        </Button>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                          label="NOVA SENHA"
                          type={showPassword ? 'text' : 'password'}
                          value={passwordValue}
                          onChange={(event) => setPasswordValue(event.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="sm:min-w-[220px]"
                        />
                        <Button type="button" variant="warning" onClick={() => setShowPassword((value) => !value)}>
                          {showPassword ? 'OCULTAR' : 'VER'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleCopyPassword}>
                          COPIAR
                        </Button>
                        <Button
                          type="button"
                          variant="success"
                          loading={savingPassword}
                          onClick={() => handleResetPassword(user.id, user.name)}
                        >
                          SALVAR
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {tab === 'champion' && (
          <Card className="p-4">
            <h2 className="font-display text-xl">Campeão oficial</h2>
            <p className="mt-1 text-sm font-bold text-brutal-black/60">
              Ao salvar, o backend marca quem acertou o campeão e adiciona os pontos extras no ranking calculado.
            </p>
            {currentChampion && (
              <p className="mt-3 border-4 border-brutal-black bg-brutal-green p-3 text-sm font-bold">
                Campeão oficial atual: {currentChampion}
              </p>
            )}
            <form onSubmit={saveChampion} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Select value={champion} onChange={(event) => setChampion(event.target.value)} className="sm:min-w-[280px]">
                <option value="">Selecione a equipe</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </Select>
              <Button type="submit" variant="success" loading={savingChampion}>
                {currentChampion ? 'ALTERAR CAMPEÃO' : 'SALVAR CAMPEÃO'}
              </Button>
            </form>
          </Card>
        )}
      </div>

      {showModal && (
        <AdminMatchModal
          match={selectedMatch?.id ? selectedMatch : null}
          onClose={() => {
            setShowModal(false);
            setSelectedMatch(null);
          }}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}
