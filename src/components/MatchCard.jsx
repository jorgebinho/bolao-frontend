import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import toast from "react-hot-toast";
import api from "../lib/api";
import { Badge, Button } from "./ui";

const STATUS = {
  UPCOMING: { label: "Aberto", tone: "success" },
  LOCKED: { label: "Fechado", tone: "warning" },
  FINISHED: { label: "Finalizado", tone: "dark" },
};

function pointsClass(points) {
  if (points === 3) return "bg-brutal-green text-brutal-black";
  if (points === 1) return "bg-brutal-yellow text-brutal-black";
  return "bg-brutal-white text-brutal-black";
}

function stageHeaderClass(stage) {
  const group = String(stage || "")
    .match(/Grupo\s+([A-L])/i)?.[1]
    ?.toUpperCase();
  const groupColors = {
    A: "bg-brutal-yellow text-brutal-black",
    B: "bg-brutal-green text-brutal-black",
    C: "bg-brutal-blue text-brutal-white",
    D: "bg-brutal-orange text-brutal-black",
    E: "bg-brutal-pink text-brutal-black",
    F: "bg-brutal-purple text-brutal-white",
    G: "bg-brutal-red text-brutal-white",
    H: "bg-brutal-white text-brutal-black",
    I: "bg-brutal-black text-brutal-yellow",
    J: "bg-brutal-gray text-brutal-black",
    K: "bg-brutal-green text-brutal-black",
    L: "bg-brutal-orange text-brutal-black",
  };

  if (group) return groupColors[group] || groupColors.A;
  return "bg-brutal-black text-brutal-yellow";
}

function lockCountdownLabel(minutesToLock) {
  const minutes = Number(minutesToLock || 0);
  if (minutes <= 0) return "agora";
  if (minutes < 60) return `em ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes > 0
      ? `em ${hours}h ${remainingMinutes}min`
      : `em ${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours > 0) return `em ${days}d ${remainingHours}h`;
  return `em ${days}d`;
}

function teamInitial(team) {
  return String(team || "?")
    .trim()
    .charAt(0)
    .toUpperCase();
}

const FLAG_MAP = {
  // Anfitriões
  "Estados Unidos": "🇺🇸",
  México: "🇲🇽",
  Canadá: "🇨🇦",
  // CONMEBOL
  Brasil: "🇧🇷",
  Argentina: "🇦🇷",
  Colômbia: "🇨🇴",
  Equador: "🇪🇨",
  Uruguai: "🇺🇾",
  Venezuela: "🇻🇪",
  // UEFA
  Espanha: "🇪🇸",
  França: "🇫🇷",
  Alemanha: "🇩🇪",
  Inglaterra: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Portugal: "🇵🇹",
  "Países Baixos": "🇳🇱",
  Bélgica: "🇧🇪",
  Áustria: "🇦🇹",
  Hungria: "🇭🇺",
  Escócia: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Turquia: "🇹🇷",
  Suíça: "🇨🇭",
  Dinamarca: "🇩🇰",
  Sérvia: "🇷🇸",
  Croácia: "🇭🇷",
  Eslováquia: "🇸🇰",
  Itália: "🇮🇹",
  Georgia: "🇬🇪",
  // AFC
  Japão: "🇯🇵",
  "Coreia do Sul": "🇰🇷",
  Irã: "🇮🇷",
  Austrália: "🇦🇺",
  Iraque: "🇮🇶",
  Jordânia: "🇯🇴",
  Uzbequistão: "🇺🇿",
  "Arábia Saudita": "🇸🇦",
  // CAF
  Marrocos: "🇲🇦",
  Egito: "🇪🇬",
  Senegal: "🇸🇳",
  Nigéria: "🇳🇬",
  "África do Sul": "🇿🇦",
  "Costa do Marfim": "🇨🇮",
  Argélia: "🇩🇿",
  Tunísia: "🇹🇳",
  Camarões: "🇨🇲",
  Mali: "🇲🇱",
  // CONCACAF
  Panamá: "🇵🇦",
  Honduras: "🇭🇳",
  Jamaica: "🇯🇲",
  // OFC
  "Nova Zelândia": "🇳🇿",
  // Adicionais / variações de nome
  "República Tcheca": "🇨🇿",
  "Bósnia e Herzegovina": "🇧🇦",
  Paraguai: "🇵🇾",
  Catar: "🇶🇦",
  Haiti: "🇭🇹",
  Curacao: "🇨🇼",
  Holanda: "🇳🇱",
  Suecia: "🇸🇪",
  Suécia: "🇸🇪",
  "Cabo Verde": "🇨🇻",
  Noruega: "🇳🇴",
  "República Democrática do Congo": "🇨🇩",
  "Republica Democratica do Congo": "🇨🇩",
  Gana: "🇬🇭",
};

const TEAM_COUNTRY_CODES = {
  "africa do sul": "ZA",
  alemanha: "DE",
  argelia: "DZ",
  argentina: "AR",
  "arabia saudita": "SA",
  australia: "AU",
  austria: "AT",
  belgica: "BE",
  "bosnia e herzegovina": "BA",
  brasil: "BR",
  canada: "CA",
  "cabo verde": "CV",
  camaroes: "CM",
  catar: "QA",
  colombia: "CO",
  "coreia do sul": "KR",
  "costa do marfim": "CI",
  croacia: "HR",
  curacao: "CW",
  dinamarca: "DK",
  egito: "EG",
  equador: "EC",
  escocia: "GB",
  eslovaquia: "SK",
  espanha: "ES",
  "estados unidos": "US",
  franca: "FR",
  gana: "GH",
  georgia: "GE",
  haiti: "HT",
  holanda: "NL",
  hungria: "HU",
  inglaterra: "GB",
  ira: "IR",
  iraque: "IQ",
  italia: "IT",
  jamaica: "JM",
  japao: "JP",
  jordania: "JO",
  marrocos: "MA",
  mexico: "MX",
  nigeria: "NG",
  noruega: "NO",
  "nova zelandia": "NZ",
  "paises baixos": "NL",
  panama: "PA",
  paraguai: "PY",
  portugal: "PT",
  "republica democratica do congo": "CD",
  "republica tcheca": "CZ",
  senegal: "SN",
  servia: "RS",
  suecia: "SE",
  suica: "CH",
  tunisia: "TN",
  turquia: "TR",
  uruguai: "UY",
  uzbequistao: "UZ",
  venezuela: "VE",
};

const FIFA_COUNTRY_CODES = {
  ALG: "DZ",
  ARG: "AR",
  AUS: "AU",
  AUT: "AT",
  BEL: "BE",
  BIH: "BA",
  BRA: "BR",
  CAN: "CA",
  CIV: "CI",
  COD: "CD",
  COL: "CO",
  CPV: "CV",
  CRO: "HR",
  CUR: "CW",
  CZE: "CZ",
  ECU: "EC",
  EGY: "EG",
  ENG: "GB",
  ESP: "ES",
  FRA: "FR",
  GER: "DE",
  GHA: "GH",
  HAI: "HT",
  IRN: "IR",
  IRQ: "IQ",
  JOR: "JO",
  JPN: "JP",
  KOR: "KR",
  KSA: "SA",
  MAR: "MA",
  MEX: "MX",
  NED: "NL",
  NOR: "NO",
  NZL: "NZ",
  PAN: "PA",
  PAR: "PY",
  POR: "PT",
  QAT: "QA",
  RSA: "ZA",
  SCO: "GB",
  SEN: "SN",
  SUI: "CH",
  SWE: "SE",
  TUN: "TN",
  TUR: "TR",
  URU: "UY",
  USA: "US",
  UZB: "UZ",
};

function normalizeTeamName(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function countryCodeToFlagUrl(countryCode) {
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
}

function isImageFlag(flag) {
  return /^https?:\/\//i.test(flag) || /^data:image\//i.test(flag);
}

function flagValueToImage(flag) {
  const value = String(flag || "").trim();
  if (/^[a-z]{2}$/i.test(value)) return countryCodeToFlagUrl(value);

  const countryCode = FIFA_COUNTRY_CODES[value.toUpperCase()];
  return countryCode ? countryCodeToFlagUrl(countryCode) : null;
}

const teamFlagImage = (name) => {
  const countryCode = TEAM_COUNTRY_CODES[normalizeTeamName(name)];
  return countryCode ? countryCodeToFlagUrl(countryCode) : null;
};

function TeamBlock({ name, flag }) {
  const flagImage =
    (flag && isImageFlag(flag) ? flag : null) ||
    flagValueToImage(flag) ||
    teamFlagImage(name);
  const flagText = flag && !isImageFlag(flag) && !flagValueToImage(flag) ? flag : null;
  return (
    <div className="min-w-0 flex-1 text-center">
      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center overflow-hidden border-4 border-brutal-black bg-brutal-white shadow-brutal-sm">
        {flagImage ? (
          <img src={flagImage} alt={name} className="h-full w-full object-cover" />
        ) : flagText ? (
          <span className="text-2xl leading-none">{flagText}</span>
        ) : (
          <span className="font-display text-xl">{teamInitial(name)}</span>
        )}
      </div>
      <p className="truncate font-display text-sm leading-tight sm:text-base">
        {name}
      </p>
    </div>
  );
}

export default function MatchCard({ match, onGuessSubmitted }) {
  const [homeInput, setHomeInput] = useState("");
  const [awayInput, setAwayInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showGuesses, setShowGuesses] = useState(false);

  useEffect(() => {
    setHomeInput(match.myGuess?.homeGuess ?? "");
    setAwayInput(match.myGuess?.awayGuess ?? "");
  }, [match.id, match.myGuess?.homeGuess, match.myGuess?.awayGuess]);

  const matchDate = new Date(match.matchDate);
  const status = STATUS[match.status] || STATUS.UPCOMING;
  const hasGuess = Boolean(match.myGuess);
  const isFinished = match.status === "FINISHED";
  const isLocked = match.isLocked;

  async function handleSubmit(event) {
    event.preventDefault();
    if (homeInput === "" || awayInput === "") {
      toast.error("Preencha os dois placares.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/matches/${match.id}/guess`, {
        homeGuess: Number(homeInput),
        awayGuess: Number(awayInput),
      });
      toast.success(hasGuess ? "Palpite atualizado." : "Palpite registrado.");
      onGuessSubmitted?.();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao salvar palpite.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="border-4 border-brutal-black bg-brutal-white shadow-brutal">
      <div
        className={`flex flex-wrap items-center justify-between gap-2 border-b-4 border-brutal-black px-4 py-3 ${stageHeaderClass(match.stage)}`}
      >
        <div>
          <p className="font-display text-xs tracking-wider opacity-75">
            {match.stage || "Copa do Mundo 2026"}
          </p>
          {match.roundLabel && (
            <p className="font-display text-xs tracking-wider opacity-90">
              {match.roundLabel}
            </p>
          )}
          <p className="font-body text-xs font-bold opacity-80">
            {format(matchDate, "dd/MM 'as' HH:mm", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-5">
        <TeamBlock name={match.homeTeam} flag={match.homeFlag} />
        <div className="text-center">
          {isFinished ? (
            <div className="flex items-center gap-2 font-display text-4xl">
              <span>{match.homeScore}</span>
              <span className="text-2xl opacity-45">x</span>
              <span>{match.awayScore}</span>
            </div>
          ) : (
            <>
              <p className="font-display text-3xl leading-none">
                {format(matchDate, "HH:mm")}
              </p>
              <p className="mt-1 text-xs font-bold text-brutal-black/55">
                Fecha {lockCountdownLabel(match.minutesToLock)}
              </p>
            </>
          )}
        </div>
        <TeamBlock name={match.awayTeam} flag={match.awayFlag} />
      </div>

      {!isFinished && (
        <div className="border-t-4 border-brutal-black bg-brutal-gray/60 px-4 py-3">
          {isLocked ? (
            <div
              className={`flex items-center justify-between border-4 border-brutal-black p-3 ${hasGuess ? "bg-brutal-black text-brutal-yellow" : "bg-brutal-red text-brutal-white"}`}
            >
              <span className="font-display text-xs tracking-wider">
                {hasGuess ? "SEU PALPITE" : "SEM PALPITE"}
              </span>
              {hasGuess && (
                <span className="font-display text-xl">
                  {match.myGuess.homeGuess} x {match.myGuess.awayGuess}
                </span>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={homeInput}
                  onChange={(event) => setHomeInput(event.target.value)}
                  className="h-12 w-14 border-4 border-brutal-black bg-brutal-white text-center font-display text-2xl focus:bg-brutal-green focus:outline-none"
                  placeholder="0"
                />
                <span className="font-display">X</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={awayInput}
                  onChange={(event) => setAwayInput(event.target.value)}
                  className="h-12 w-14 border-4 border-brutal-black bg-brutal-white text-center font-display text-2xl focus:bg-brutal-green focus:outline-none"
                  placeholder="0"
                />
              </div>
              <Button
                type="submit"
                className="h-12 flex-1 px-2"
                size="sm"
                loading={submitting}
              >
                {hasGuess ? "SALVAR" : "PALPITAR"}
              </Button>
            </form>
          )}
        </div>
      )}

      {isFinished && (
        <div
          className={`border-t-4 border-brutal-black px-4 py-3 ${pointsClass(match.myGuess?.points || 0)}`}
        >
          {hasGuess ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-xs">SEU PALPITE</p>
                <p className="font-display text-xl">
                  {match.myGuess.homeGuess} x {match.myGuess.awayGuess}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-xs">PONTOS</p>
                <p className="font-display text-3xl">{match.myGuess.points}</p>
              </div>
            </div>
          ) : (
            <p className="font-display text-sm">Você não palpitou neste jogo.</p>
          )}
        </div>
      )}

      {(isLocked || isFinished) && match.guesses?.length > 0 && (
        <div className="border-t-4 border-brutal-black">
          <button
            type="button"
            onClick={() => setShowGuesses((value) => !value)}
            className="flex w-full items-center justify-between bg-brutal-white px-4 py-3 font-display text-xs tracking-wider hover:bg-brutal-yellow"
          >
            <span>PALPITES ({match.guesses.length})</span>
            <span>{showGuesses ? "FECHAR" : "VER"}</span>
          </button>
          {showGuesses && (
            <div className="max-h-48 overflow-y-auto border-t-2 border-brutal-black">
              {match.guesses.map((guess) => (
                <div
                  key={guess.id || guess.userId}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-brutal-black/10 px-4 py-2 text-sm font-bold"
                >
                  <span className="truncate">{guess.userName}</span>
                  <span className="font-display">
                    {guess.homeGuess} x {guess.awayGuess}
                  </span>
                  {isFinished && (
                    <span
                      className={`border-2 border-brutal-black px-2 py-0.5 font-display text-sm ${pointsClass(guess.points)}`}
                    >
                      {guess.points}pt
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
