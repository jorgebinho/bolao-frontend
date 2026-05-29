import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { Badge, Card, EmptyState, LoadingState, PageHeader, Position, Select, StatCard } from '../components/ui';

export default function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState('general');
  const [loading, setLoading] = useState(true);
  const [tieBreakers, setTieBreakers] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [groupsRes, rankingRes] = await Promise.all([
        api.get('/groups'),
        activeGroup === 'general' ? api.get('/ranking') : api.get(`/groups/${activeGroup}/ranking`),
      ]);
      setGroups(groupsRes.data.groups || []);
      setRanking(rankingRes.data.ranking || []);
      setTieBreakers(rankingRes.data.tieBreakers || []);
    } catch {
      toast.error('Erro ao carregar ranking.');
    } finally {
      setLoading(false);
    }
  }, [activeGroup]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const top3 = ranking.slice(0, 3);
  const currentUser = ranking.find((player) => player.isCurrentUser);
  const activeGroupName =
    activeGroup === 'general'
      ? 'Ranking geral'
      : groups.find((group) => group.id === activeGroup)?.name || 'Grupo';

  return (
    <div>
      <PageHeader
        eyebrow="disputa"
        title="Ranking"
        description="Desempate por pontos totais, placares exatos e acertos parciais."
      />

      <div className="space-y-5 px-4 py-5 sm:px-0">
        <Card className="bg-brutal-yellow p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_320px] md:items-end">
            <div>
              <p className="font-display text-xs tracking-wider text-brutal-black/60">GRUPO DO RANKING</p>
              <h2 className="font-display text-2xl">{activeGroupName}</h2>
              <p className="text-sm font-bold text-brutal-black/60">
                Escolha aqui qual grupo você quer visualizar.
              </p>
            </div>
            <Select
              label="SELECIONAR GRUPO"
              value={activeGroup}
              onChange={(event) => setActiveGroup(event.target.value)}
              className="bg-brutal-white"
            >
              <option value="general">Ranking geral</option>
              {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
            </Select>
          </div>
        </Card>

        {currentUser && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Sua posição" value={<Position value={currentUser.position} />} tone="yellow" />
            <StatCard label="Pontos" value={currentUser.totalPoints} tone="green" />
            <StatCard label="Exatos" value={currentUser.exactScores} tone="white" />
            <StatCard label="Parciais" value={currentUser.partialScores} tone="orange" />
          </div>
        )}

        {loading ? (
          <LoadingState rows={5} type="row" />
        ) : ranking.length === 0 ? (
          <EmptyState title="Ranking vazio" description="Assim que houver participantes, a disputa aparece aqui." />
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              {top3.map((player, index) => (
                <Card key={player.id} className={`p-4 text-center ${index === 0 ? 'bg-brutal-yellow' : index === 1 ? 'bg-brutal-green' : 'bg-brutal-orange'}`}>
                  <p className="font-display text-sm text-brutal-black/55">
                    <Position value={index + 1} /> lugar
                  </p>
                  <h2 className="mt-2 truncate font-display text-2xl">{player.name}</h2>
                  <p className="mt-2 font-display text-5xl leading-none">{player.totalPoints}</p>
                  <p className="mt-1 text-xs font-bold">pontos totais</p>
                  {player.isCurrentUser && <Badge tone="info" className="mt-3">VOCÊ</Badge>}
                </Card>
              ))}
            </div>

            <Card className="overflow-hidden">
              <div className="hidden grid-cols-12 gap-3 border-b-4 border-brutal-black bg-brutal-black px-4 py-3 font-display text-xs tracking-wider text-brutal-yellow md:grid">
                <span className="col-span-1">#</span>
                <span className="col-span-4">Jogador</span>
                <span className="col-span-2 text-center">Pontos</span>
                <span className="col-span-2 text-center">Exatos</span>
                <span className="col-span-2 text-center">Parciais</span>
                <span className="col-span-1 text-center">Palp.</span>
              </div>
              {ranking.map((player) => (
                <div
                  key={player.id}
                  className={`grid gap-2 border-b-2 border-brutal-black/10 px-4 py-4 md:grid-cols-12 md:items-center md:gap-3 ${
                    player.isCurrentUser ? 'bg-brutal-blue/10' : 'bg-brutal-white'
                  }`}
                >
                  <div className="flex items-center justify-between md:col-span-1 md:block">
                    <Position value={player.position} className="text-xl" />
                    {player.isCurrentUser && <Badge tone="info" className="md:hidden">VOCÊ</Badge>}
                  </div>
                  <div className="min-w-0 md:col-span-4">
                    <p className="truncate font-display text-lg">{player.name}</p>
                    <p className="text-xs font-bold text-brutal-black/50">
                      {player.championGuess?.team ? `Campeão: ${player.championGuess.team}` : 'Sem campeão'}
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 md:contents">
                    <p className="font-display md:col-span-2 md:text-center">{player.totalPoints}</p>
                    <p className="font-display md:col-span-2 md:text-center">{player.exactScores}</p>
                    <p className="font-display md:col-span-2 md:text-center">{player.partialScores}</p>
                    <p className="font-display md:col-span-1 md:text-center">{player.totalGuesses}</p>
                  </div>
                </div>
              ))}
            </Card>
          </>
        )}

        <Card className="p-4">
          <p className="font-display text-sm">Critérios de desempate</p>
          <p className="mt-2 text-sm font-bold text-brutal-black/60">
            {(tieBreakers.length ? tieBreakers : ['Pontos totais', 'Mais placares exatos', 'Mais acertos parciais']).join(' > ')}
          </p>
          <div className="mt-4 grid gap-2 text-sm font-bold text-brutal-black/70 sm:grid-cols-3">
            <div className="border-4 border-brutal-black bg-brutal-green p-3 text-brutal-black">
              <p className="font-display text-xl">3 pts</p>
              <p>Cravar o placar correto.</p>
            </div>
            <div className="border-4 border-brutal-black bg-brutal-yellow p-3 text-brutal-black">
              <p className="font-display text-xl">1 pt</p>
              <p>Acertar quem ganhou ou o empate.</p>
            </div>
            <div className="border-4 border-brutal-black bg-brutal-white p-3 text-brutal-black">
              <p className="font-display text-xl">0 pt</p>
              <p>Errar o vencedor da partida.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
