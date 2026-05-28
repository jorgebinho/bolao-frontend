import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { Badge, Button, Card, EmptyState, Input, LoadingState, PageHeader } from '../components/ui';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [joinCode, setJoinCode] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data.groups || []);
      setSelected((current) => current || data.groups?.[0] || null);
    } catch {
      toast.error('Erro ao carregar grupos.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMembers = useCallback(async (groupId) => {
    if (!groupId) return;
    setMembersLoading(true);
    try {
      const { data } = await api.get(`/groups/${groupId}/members`);
      setMembers(data.members || []);
    } catch {
      toast.error('Erro ao carregar membros.');
    } finally {
      setMembersLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);
  useEffect(() => { fetchMembers(selected?.id); }, [fetchMembers, selected?.id]);

  async function createGroup(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/groups', createForm);
      toast.success('Grupo criado.');
      setCreateForm({ name: '', description: '' });
      await fetchGroups();
      setSelected(data.group);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar grupo.');
    } finally {
      setSaving(false);
    }
  }

  async function joinGroup(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/groups/join', { code: joinCode });
      toast.success('Voce entrou no grupo.');
      setJoinCode('');
      await fetchGroups();
      setSelected(data.group);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao entrar no grupo.');
    } finally {
      setSaving(false);
    }
  }

  async function removeMember(member) {
    if (!confirm(`Remover ${member.name} deste grupo?`)) return;
    try {
      await api.delete(`/groups/${selected.id}/members/${member.id}`);
      toast.success('Membro removido.');
      fetchMembers(selected.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao remover membro.');
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="comunidade"
        title="Grupos"
        description="Crie ligas particulares, entre por codigo e acompanhe o ranking do seu grupo."
      />

      <div className="grid gap-5 px-4 py-5 sm:px-0 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="font-display text-lg">Criar grupo</h2>
            <form onSubmit={createGroup} className="mt-3 space-y-3">
              <Input label="NOME" value={createForm.name} onChange={(event) => setCreateForm((form) => ({ ...form, name: event.target.value }))} placeholder="Amigos da firma" />
              <Input label="DESCRICAO" value={createForm.description} onChange={(event) => setCreateForm((form) => ({ ...form, description: event.target.value }))} placeholder="Opcional" />
              <Button type="submit" variant="success" className="w-full" loading={saving}>CRIAR</Button>
            </form>
          </Card>

          <Card className="p-4">
            <h2 className="font-display text-lg">Entrar por codigo</h2>
            <form onSubmit={joinGroup} className="mt-3 flex gap-2">
              <Input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="CODIGO" className="uppercase" />
              <Button type="submit" loading={saving}>OK</Button>
            </form>
          </Card>
        </div>

        <div className="space-y-4">
          {loading ? (
            <LoadingState rows={3} type="row" />
          ) : groups.length === 0 ? (
            <EmptyState title="Sem grupos" description="Voce ainda nao participa de nenhum grupo." />
          ) : (
            <Card className="p-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelected(group)}
                    className={`flex-shrink-0 border-4 border-brutal-black px-3 py-2 font-display text-xs tracking-wider ${
                      selected?.id === group.id ? 'bg-brutal-black text-brutal-yellow' : 'bg-brutal-white'
                    }`}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {selected && (
            <Card className="overflow-hidden">
              <div className="border-b-4 border-brutal-black bg-brutal-yellow p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-display text-2xl">{selected.name}</h2>
                    {selected.description && <p className="mt-1 text-sm font-bold text-brutal-black/65">{selected.description}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={selected.isGlobal ? 'dark' : 'info'}>{selected.isGlobal ? 'GLOBAL' : selected.role}</Badge>
                  </div>
                </div>
                <div className="mt-4 inline-flex flex-wrap items-center border-4 border-brutal-black bg-brutal-white">
                  <span className="border-r-4 border-brutal-black px-3 py-2 font-display text-xs tracking-wider text-brutal-black/60">
                    CODIGO:
                  </span>
                  <span className="px-3 py-2 font-mono text-sm font-bold text-brutal-black">
                    {selected.code}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-display text-lg">Participantes</h3>
                {membersLoading ? (
                  <div className="mt-3"><LoadingState rows={3} type="row" /></div>
                ) : members.length === 0 ? (
                  <EmptyState title="Sem membros" description="Convide pessoas usando o codigo do grupo." />
                ) : (
                  <div className="mt-3 space-y-2">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between gap-3 border-4 border-brutal-black bg-brutal-white p-3 shadow-brutal-sm">
                        <div className="min-w-0">
                          <p className="truncate font-display text-sm">{member.name}</p>
                          <p className="truncate text-xs font-bold text-brutal-black/50">{member.email}</p>
                          <p className="text-xs font-bold">{member.points} pts - {member.totalGuesses} palpites</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge tone={member.groupRole === 'OWNER' ? 'dark' : 'neutral'}>{member.groupRole}</Badge>
                          {selected.role === 'OWNER' && member.groupRole !== 'OWNER' && !selected.isGlobal && (
                            <Button variant="danger" size="sm" onClick={() => removeMember(member)}>REMOVER</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
