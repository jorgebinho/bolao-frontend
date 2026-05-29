import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import toast from "react-hot-toast";
import api from "../lib/api";
import {
  Badge,
  Card,
  EmptyState,
  LoadingState,
  PageHeader,
  Select,
} from "../components/ui";

export default function HistoryPage() {
  const [rounds, setRounds] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeStage, setActiveStage] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [roundsRes, historyRes] = await Promise.all([
        api.get("/rounds"),
        api.get("/rounds/me/history"),
      ]);
      setRounds(roundsRes.data.rounds || []);
      setHistory(historyRes.data.history || []);
    } catch {
      toast.error("Erro ao carregar historico.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered =
    activeStage === "all"
      ? history
      : history.filter((item) => item.stage === activeStage);

  return (
    <div>
      <PageHeader
        eyebrow="desempenho"
        title="Historico"
        description="Revise jogos anteriores, seus palpites e pontos por fase."
        action={
          <Select
            value={activeStage}
            onChange={(event) => setActiveStage(event.target.value)}
            className="min-w-[240px] bg-brutal-yellow text-brutal-black"
          >
            <option value="all">Todas as fases</option>
            {rounds.map((round) => (
              <option key={round.stage} value={round.stage}>
                {round.stage}
              </option>
            ))}
          </Select>
        }
      />

      <div className="space-y-5 px-4 py-5 sm:px-0">
        {loading ? (
          <LoadingState rows={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Sem historico ainda"
            description="Quando seus palpites forem finalizados, seu desempenho por fase aparece aqui."
          />
        ) : (
          filtered.map((round) => (
            <Card key={round.stage} className="overflow-hidden">
              <div className="flex flex-col gap-2 border-b-4 border-brutal-black bg-brutal-yellow p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-xl">{round.stage}</h2>
                  <p className="text-sm font-bold text-brutal-black/55">
                    {round.guesses.length} palpite(s)
                  </p>
                </div>
                <Badge tone="dark">{round.totalPoints} PONTOS</Badge>
              </div>
              <div className="divide-y-2 divide-brutal-black/10">
                {round.guesses.map((guess) => (
                  <div
                    key={guess.id}
                    className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center"
                  >
                    <div>
                      <p className="font-display">
                        {guess.match.homeTeam} x {guess.match.awayTeam}
                      </p>
                      <p className="text-xs font-bold text-brutal-black/50">
                        {format(
                          new Date(guess.match.matchDate),
                          "dd/MM HH:mm",
                          { locale: ptBR },
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brutal-black/50">
                        Resultado
                      </p>
                      <p className="font-display">
                        {guess.match.status === "FINISHED"
                          ? `${guess.match.homeScore} x ${guess.match.awayScore}`
                          : "Pendente"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brutal-black/50">
                        Seu palpite
                      </p>
                      <p className="font-display">
                        {guess.homeGuess} x {guess.awayGuess}
                      </p>
                    </div>
                    <Badge
                      tone={
                        guess.points === 3
                          ? "success"
                          : guess.points === 1
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {guess.points} PT
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
