import { useEffect, useMemo, useState } from 'preact/hooks';
import { Game } from './core/Game';
import { GameRecord } from './core/GameRecord';
import type { IPlayer } from './models/IPlayer';
import type { Personality } from './models/types';
import { ALL_KINDS, SINGLETON_KINDS, createPlayer } from './models/factory';
import { makeShortName } from './utils/names';

// ---------- Types ----------
type RosterEntry = {
  id: number;
  name: string;
  kind: Personality | null; // null = unassigned yet
};

// ---------- Helpers ----------
function randomAssignableKind(taken: Set<Personality>): Personality {
  // filter kinds by singleton availability
  const candidates = ALL_KINDS.filter(k =>
    SINGLETON_KINDS.includes(k) ? !taken.has(k as Personality) : true
  );
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ---------- Component ----------
export default function App() {
  const [stage, setStage] = useState<'setup' | 'playing'>('setup');
  const [roster, setRoster] = useState<RosterEntry[]>(() => {
    // start with 3 players
    return Array.from({ length: 3 }).map((_, i) => ({
      id: i + 1,
      name: makeShortName(),
      kind: null,
    }));
  });

  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [game, setGame] = useState<Game | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (stage === 'playing' && game) {
      (game as any).players = players;
    }
  }, [players, stage, game]);

  const takenSingletons = useMemo(() => {
    const s = new Set<Personality>();
    for (const r of roster) {
      if (r.kind && SINGLETON_KINDS.includes(r.kind)) s.add(r.kind);
    }
    return s;
  }, [roster]);

  function addBot() {
    const nextId = (roster.at(-1)?.id ?? 0) + 1;
    setRoster(r => [...r, { id: nextId, name: makeShortName(), kind: null }]);
  }

  function updateKind(id: number, kindStr: string) {
    const kind = (kindStr || null) as Personality | null;
    setRoster(r =>
      r.map(e => (e.id === id ? { ...e, kind } : e))
    );
  }

  function updateName(id: number, name: string) {
    setRoster(r =>
      r.map(e => (e.id === id ? { ...e, name } : e))
    );
  }

  function startGame() {
    // 1) make sure Kuzuryu not duplicated
    const used = new Set<Personality>();
    for (const r of roster) if (r.kind && SINGLETON_KINDS.includes(r.kind)) used.add(r.kind);

    // 2) assign random kinds for unassigned entries (respect singletons)
    const finalized = roster.map(e => {
      if (e.kind) return e;
      const k = randomAssignableKind(used);
      if (SINGLETON_KINDS.includes(k)) used.add(k);
      return { ...e, kind: k };
    });

    // 3) build IPlayer instances
    const instances: IPlayer[] = finalized.map((e, idx) =>
      createPlayer(e.kind as Personality, e.id, e.name)
    );

    GameRecord.instance.reset();
    const g = new Game(instances);
    setPlayers(instances);
    setGame(g);
    setStage('playing');
    setTick(t => t + 1);
  }

  function backToSetup() {
    GameRecord.instance.reset();
    setPlayers([]);
    setGame(null);
    setStage('setup');
    setTick(t => t + 1);
  }

  function playOne() {
    if (!game) return;
    game.playRound();
    setTick(t => t + 1);
  }

  // -------------- RENDER --------------
  if (stage === 'setup') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">King of Diamonds — Setup</h1>
            <div className="space-x-2">
              <button onClick={addBot} className="px-3 py-1.5 bg-indigo-600 rounded hover:bg-indigo-500">
                Add Bot
              </button>
              <button onClick={startGame} className="px-3 py-1.5 bg-emerald-600 rounded hover:bg-emerald-500">
                Start Game
              </button>
            </div>
          </header>

          <section>
            <h2 className="text-lg font-semibold mb-2">Roster (starts with 3 players)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="text-left px-3 py-2">ID</th>
                    <th className="text-left px-3 py-2">Name</th>
                    <th className="text-left px-3 py-2">AI</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map(r => (
                    <tr key={r.id} className="odd:bg-slate-800/50">
                      <td className="px-3 py-2">{r.id}</td>
                      <td className="px-3 py-2">
                        <input
                          value={r.name}
                          onInput={(e: any) => updateName(r.id, e.currentTarget.value)}
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 w-56"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={r.kind ?? ''}
                          onInput={(e: any) => updateKind(r.id, e.currentTarget.value)}
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1"
                        >
                          <option value="">(random on start)</option>
                          {ALL_KINDS.map(k => {
                            const disabled =
                              SINGLETON_KINDS.includes(k) && takenSingletons.has(k) && r.kind !== k;
                            return (
                              <option key={k} value={k} disabled={disabled}>
                                {k}{disabled ? ' (taken)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-slate-400 mt-2">
                Kuzuryu are limited to one instance per game. Unassigned AIs will be randomized on start.
              </p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // playing stage
  const record = GameRecord.instance;
  const alive = useMemo(
    () => players.map(p => ({ id: p.id, name: p.name, kind: p.kind, hp: p.hp })),
    [players, tick]
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">King of Diamonds — Match</h1>
          <div className="space-x-2">
            <button onClick={playOne} className="px-3 py-1.5 bg-emerald-600 rounded hover:bg-emerald-500">
              Play 1 Round
            </button>
            <button onClick={backToSetup} className="px-3 py-1.5 bg-slate-700 rounded hover:bg-slate-600">
              End & Back to Setup
            </button>
          </div>
        </header>

        <section>
          <h2 className="text-lg font-semibold mb-2">Players</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-800">
                  <th className="text-left px-3 py-2">ID</th>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Kind</th>
                  <th className="text-left px-3 py-2">HP</th>
                </tr>
              </thead>
              <tbody>
                {alive.map(p => (
                  <tr key={p.id} className="odd:bg-slate-800/50">
                    <td className="px-3 py-2">{p.id}</td>
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2">{p.kind}</td>
                    <td className="px-3 py-2 font-mono">{p.hp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Rounds</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-800">
                  <th className="text-left px-3 py-2">#</th>
                  <th className="text-left px-3 py-2">Average</th>
                  <th className="text-left px-3 py-2">Target (0.8×avg)</th>
                  <th className="text-left px-3 py-2">Winner</th>
                  <th className="text-left px-3 py-2">Choices</th>
                </tr>
              </thead>
              <tbody>
                {record.rounds.map(r => (
                  <tr key={r.roundNumber} className="odd:bg-slate-800/50 align-top">
                    <td className="px-3 py-2">{r.roundNumber}</td>
                    <td className="px-3 py-2">{r.average.toFixed(2)}</td>
                    <td className="px-3 py-2">{r.target.toFixed(2)}</td>
                    <td className="px-3 py-2">{r.winnerId ?? '—'}</td>
                    <td className="px-3 py-2 font-mono">
                      <div className="flex flex-wrap gap-2">
                        {r.choices.map(c => (
                          <span key={`${r.roundNumber}-${c.playerId}`} className="inline-flex items-center px-2 py-0.5 rounded bg-slate-700">
                            P{c.playerId}:{c.value}&nbsp;
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-xs text-slate-400">
          Rules: all-same ⇒ all lose 1 HP. Tie for closest ⇒ discard that group; search outward for a unique closest winner.
        </footer>
      </div>
    </div>
  );
}
