import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import MatchCard from '../components/MatchCard';
import { Badge, Button, Card, DashboardLoadingState, EmptyState, PageHeader, Select, StatCard } from '../components/ui';

const FILTERS = [
  { key: 'next-day', label: 'Próximo dia' },
  { key: 'all', label: 'Todos' },
  { key: 'today', label: 'Hoje' },
  { key: 'missing', label: 'Sem palpite' },
  { key: 'UPCOMING', label: 'Abertos' },
  { key: 'FINISHED', label: 'Finalizados' },
];

const TOURNAMENT_PHASES = [
  { key: 'all', label: 'Todos' },
  { key: 'groups', label: 'Fase de grupos' },
  { key: 'knockout', label: 'Mata-mata' },
];

const STAGE_ORDER = {
  'Fase de 32': 20,
  'Oitavas de Final': 30,
  'Quartas de Final': 40,
  Semifinal: 50,
  'Disputa 3 Lugar': 60,
  Final: 70,
};

function stageSortValue(stage) {
  const group = String(stage || '').match(/Fase de Grupos - Grupo ([A-L])/i)?.[1];
  if (group) return group.charCodeAt(0) - 64;
  return STAGE_ORDER[stage] || 999;
}

function dayKey(date) {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

function getNextMatchDay(matches) {
  if (!matches.length) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sorted = matches
    .slice()
    .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));

  const next = sorted.find((match) => new Date(match.matchDate) >= today) || sorted[0];
  return dayKey(next.matchDate);
}

function withGroupRounds(matches) {
  const roundByMatchId = new Map();
  const groups = new Map();

  for (const match of matches) {
    if (!match.stage?.startsWith('Fase de Grupos')) continue;
    if (!groups.has(match.stage)) groups.set(match.stage, []);
    groups.get(match.stage).push(match);
  }

  for (const groupMatches of groups.values()) {
    groupMatches
      .slice()
      .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate))
      .forEach((match, index) => {
        roundByMatchId.set(match.id, `Rodada ${Math.floor(index / 2) + 1}`);
      });
  }

  return matches.map((match) => ({
    ...match,
    roundLabel: roundByMatchId.get(match.id) || null,
  }));
}

function ChampionCard() {
  const [state, setState] = useState(null);
  const [team, setTeam] = useState('');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchGuess = useCallback(async () => {
    try {
      const [guessRes, teamsRes] = await Promise.all([
        api.get('/champion-guess'),
        api.get('/matches/teams'),
      ]);
      setState(guessRes.data);
      setTeam(guessRes.data.guess?.team || '');
      setTeams(teamsRes.data.teams || []);
    } catch {
      toast.error('Erro ao carregar palpite de campeao.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGuess(); }, [fetchGuess]);

  async function saveGuess(event) {
    event.preventDefault();
    if (!team) return toast.error('Escolha uma selecao.');
    setSaving(true);
    try {
      const { data } = await api.put('/champion-guess', { team });
      setState(data);
      toast.success('Palpite de campeao salvo.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar campeao.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Card className="h-full p-4"><div className="h-24 animate-pulse bg-brutal-yellow/40" /></Card>;

  const deadlineLabel = state?.deadline
    ? format(new Date(state.deadline), "dd/MM 'as' HH:mm", { locale: ptBR })
    : null;

  return (
    <Card className="h-full p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-xs tracking-wider text-brutal-black/50">PALPITE EXTRA</p>
          <h2 className="font-display text-xl">Campeao da Copa</h2>
        </div>
        <Badge tone={state?.isOpen ? 'success' : 'dark'}>{state?.isOpen ? '+5 ate abertura' : 'fechado'}</Badge>
      </div>
      {deadlineLabel && (
        <p className="mb-3 text-xs font-bold text-brutal-black/60">
          Pode alterar ate o inicio do primeiro jogo: <span className="text-brutal-black">{deadlineLabel}</span>.
        </p>
      )}
      {state?.officialChampion && (
        <p className="mb-3 border-4 border-brutal-black bg-brutal-green p-2 text-sm font-bold">
          Campeao oficial: {state.officialChampion}
        </p>
      )}
      <form onSubmit={saveGuess} className="flex gap-2">
        <Select value={team} onChange={(event) => setTeam(event.target.value)} disabled={!state?.isOpen} className="h-12 py-2">
          <option value="">Selecao campea</option>
          {teams.map((item) => (
            <option key={item.id} value={item.name}>
              Grupo {item.group} - {item.name}
            </option>
          ))}
        </Select>
        <Button type="submit" size="sm" loading={saving} disabled={!state?.isOpen} className="h-12">
          SALVAR
        </Button>
      </form>
      {state?.guess && (
        <p className="mt-3 text-sm font-bold text-brutal-black/65">
          Seu palpite atual: <span className="text-brutal-black">{state.guess.team}</span>
        </p>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('next-day');
  const [tournamentPhase, setTournamentPhase] = useState('all');
  const [stage, setStage] = useState('all');
  const [error, setError] = useState('');

  const fetchMatches = useCallback(async () => {
    try {
      setError('');
      const { data } = await api.get('/matches');
      setMatches(data.matches || []);
    } catch {
      setError('Nao foi possivel carregar os jogos.');
      toast.error('Erro ao carregar jogos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 60_000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  const stages = useMemo(() => {
    const unique = new Set(matches.map((match) => match.stage).filter(Boolean));
    return Array.from(unique).sort((a, b) => stageSortValue(a) - stageSortValue(b) || a.localeCompare(b));
  }, [matches]);

  const visibleStages = useMemo(() => {
    return stages.filter((item) => {
      const isGroupStage = item.startsWith('Fase de Grupos');
      if (tournamentPhase === 'groups') return isGroupStage;
      if (tournamentPhase === 'knockout') return !isGroupStage;
      return true;
    });
  }, [stages, tournamentPhase]);

  useEffect(() => {
    if (stage !== 'all' && !visibleStages.includes(stage)) {
      setStage('all');
    }
  }, [stage, visibleStages]);

  const stats = useMemo(() => {
    const open = matches.filter((match) => match.status === 'UPCOMING').length;
    const missing = matches.filter((match) => match.status === 'UPCOMING' && !match.myGuess).length;
    const finished = matches.filter((match) => match.status === 'FINISHED').length;
    return { open, missing, finished };
  }, [matches]);

  const filtered = useMemo(() => {
    const baseMatches = matches.filter((match) => {
      const isGroupStage = match.stage?.startsWith('Fase de Grupos');
      const byTournamentPhase =
        tournamentPhase === 'all' ||
        (tournamentPhase === 'groups' && isGroupStage) ||
        (tournamentPhase === 'knockout' && !isGroupStage);
      const byStage = stage === 'all' || match.stage === stage;
      return byTournamentPhase && byStage;
    });

    const nextMatchDay = getNextMatchDay(baseMatches);
    const filteredMatches = baseMatches.filter((match) => {
      const matchDate = new Date(match.matchDate);
      const today = new Date().toDateString() === matchDate.toDateString();
      const byFilter =
        filter === 'all' ||
        match.status === filter ||
        (filter === 'today' && today) ||
        (filter === 'next-day' && (!nextMatchDay || dayKey(match.matchDate) === nextMatchDay)) ||
        (filter === 'missing' && match.status === 'UPCOMING' && !match.myGuess);
      return byFilter;
    });

    return withGroupRounds(filteredMatches);
  }, [filter, matches, stage, tournamentPhase]);

  function handleGuessSubmitted() {
    fetchMatches();
    refreshUser();
  }

  return (
    <div>
      <PageHeader
        eyebrow={`Ola, ${user?.name?.split(' ')[0] || 'craque'}`}
        title="Jogos e palpites"
        description="Acompanhe proximos jogos, filtre pendencias e salve seus placares antes do bloqueio."
        action={
          <div className="grid min-w-[280px] gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block font-display text-xs tracking-wider text-brutal-yellow/70">
                ETAPA
              </span>
              <select
                value={tournamentPhase}
                onChange={(event) => {
                  setTournamentPhase(event.target.value);
                  setStage('all');
                }}
                className="w-full border-4 border-brutal-yellow bg-brutal-yellow px-3 py-3 font-display text-sm text-brutal-black focus:outline-none"
              >
                {TOURNAMENT_PHASES.map((item) => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block font-display text-xs tracking-wider text-brutal-yellow/70">
                GRUPO / FASE
              </span>
              <select
                value={stage}
                onChange={(event) => setStage(event.target.value)}
                className="w-full border-4 border-brutal-yellow bg-brutal-yellow px-3 py-3 font-display text-sm text-brutal-black focus:outline-none"
              >
                <option value="all">
                  {tournamentPhase === 'groups' ? 'Todos os grupos' : tournamentPhase === 'knockout' ? 'Todo mata-mata' : 'Todas as fases'}
                </option>
                {visibleStages.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
        }
      />

      <div className="space-y-5 px-4 py-5 sm:px-0">
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Jogos abertos" value={stats.open} tone="green" />
            <StatCard label="Sem palpite" value={stats.missing} tone="orange" />
            <StatCard label="Finalizados" value={stats.finished} tone="white" />
          </div>
          <ChampionCard />
        </div>

        <Card className="p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {TOURNAMENT_PHASES.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setTournamentPhase(item.key);
                    setStage('all');
                  }}
                  className={`flex-shrink-0 border-4 border-brutal-black px-3 py-2 font-display text-xs tracking-wider transition-colors ${
                    tournamentPhase === item.key ? 'bg-brutal-black text-brutal-yellow' : 'bg-brutal-white text-brutal-black hover:bg-brutal-yellow'
                  }`}
                >
                  {item.label.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={`flex-shrink-0 border-4 border-brutal-black px-3 py-2 font-display text-xs tracking-wider transition-colors ${
                    filter === item.key ? 'bg-brutal-black text-brutal-yellow' : 'bg-brutal-white text-brutal-black hover:bg-brutal-yellow'
                  }`}
                >
                  {item.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {error && (
          <Card className="bg-brutal-red p-4 text-brutal-white">
            <p className="font-display">{error}</p>
            <Button variant="secondary" className="mt-3" onClick={fetchMatches}>TENTAR NOVAMENTE</Button>
          </Card>
        )}

        {loading ? (
          <DashboardLoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhum jogo encontrado"
            description={matches.length === 0 ? 'Quando o admin cadastrar jogos eles aparecem aqui.' : 'Tente outro filtro ou fase.'}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((match) => (
              <MatchCard key={match.id} match={match} onGuessSubmitted={handleGuessSubmitted} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
