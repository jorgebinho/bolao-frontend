import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, EmptyState, Input, LoadingState, PageHeader, Position, StatCard } from '../components/ui';

export default function ProfilePage() {
  const { logout, refreshUser, syncUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me/profile');
      setProfile(data.profile);
      setName(data.profile.name);
      syncUser({
        id: data.profile.id,
        name: data.profile.name,
        email: data.profile.email,
        role: data.profile.role,
        points: data.profile.totalPoints,
      });
    } catch {
      toast.error('Erro ao carregar perfil.');
    } finally {
      setLoading(false);
    }
  }, [syncUser]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  async function saveName(event) {
    event.preventDefault();
    setSavingName(true);
    try {
      await api.patch('/users/me', { name });
      await refreshUser();
      await fetchProfile();
      toast.success('Nome atualizado.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao atualizar nome.');
    } finally {
      setSavingName(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    setSavingPassword(true);
    try {
      await api.patch('/users/me/password', passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      toast.success('Senha alterada.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao alterar senha.');
    } finally {
      setSavingPassword(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div>
      <PageHeader eyebrow="sua conta" title="Perfil" description="Veja estatísticas, histórico recente e ajustes da conta." />
      <div className="space-y-5 px-4 py-5 sm:px-0">
        {loading ? (
          <LoadingState rows={4} type="row" />
        ) : !profile ? (
          <EmptyState title="Perfil indisponível" description="Não foi possível carregar seus dados." />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label="Pontos totais" value={profile.totalPoints} tone="yellow" />
              <StatCard label="Ranking geral" value={profile.generalPosition ? <Position value={profile.generalPosition} /> : '-'} tone="green" />
              <StatCard label="Aproveitamento" value={`${profile.hitRate}%`} tone="blue" />
              <StatCard label="Palpites" value={profile.totalGuesses} tone="white" />
              <StatCard label="Exatos" value={profile.exactScores} tone="green" />
              <StatCard label="Parciais" value={profile.partialScores} tone="orange" />
              <StatCard label="Erros" value={profile.errors} tone="white" />
              <StatCard label="Campeão extra" value={profile.championPoints} tone="black" />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <Card className="p-4">
                <h2 className="font-display text-xl">Dados da conta</h2>
                <p className="mt-1 text-sm font-bold text-brutal-black/55">{profile.email}</p>
                <form onSubmit={saveName} className="mt-4 space-y-3">
                  <Input label="NOME" value={name} onChange={(event) => setName(event.target.value)} />
                  <Button type="submit" loading={savingName}>SALVAR NOME</Button>
                </form>
              </Card>

              <Card className="p-4">
                <h2 className="font-display text-xl">Segurança</h2>
                <form onSubmit={savePassword} className="mt-4 space-y-3">
                  <Input label="SENHA ATUAL" type="password" value={passwords.currentPassword} onChange={(event) => setPasswords((form) => ({ ...form, currentPassword: event.target.value }))} />
                  <Input label="NOVA SENHA" type="password" value={passwords.newPassword} onChange={(event) => setPasswords((form) => ({ ...form, newPassword: event.target.value }))} />
                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" loading={savingPassword}>ALTERAR SENHA</Button>
                    <Button type="button" variant="danger" onClick={handleLogout}>SAIR</Button>
                  </div>
                </form>
              </Card>
            </div>

            <Card className="overflow-hidden">
              <div className="border-b-4 border-brutal-black bg-brutal-yellow p-4">
                <h2 className="font-display text-xl">Histórico recente</h2>
              </div>
              {profile.recentGuesses.length === 0 ? (
                <div className="p-4"><EmptyState title="Sem palpites recentes" description="Seus palpites aparecem aqui depois de salvos." /></div>
              ) : (
                <div className="divide-y-2 divide-brutal-black/10">
                  {profile.recentGuesses.map((guess) => (
                    <div key={guess.id} className="grid gap-2 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                      <div>
                        <p className="font-display">{guess.match.homeTeam} x {guess.match.awayTeam}</p>
                        <p className="text-xs font-bold text-brutal-black/50">
                          {guess.match.stage || 'Sem fase'} - {format(new Date(guess.match.matchDate), 'dd/MM HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                      <p className="font-display">Palpite {guess.homeGuess} x {guess.awayGuess}</p>
                      <p className="font-display text-xl">{guess.points} pt</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
