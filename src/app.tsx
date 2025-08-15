import { useEffect, useMemo, useState } from 'preact/hooks';
import './app.css'
import { Game } from './core/Game';
import { GameRecord } from './core/GameRecord';
import type { IPlayer } from './models/IPlayer';
import type { Personality } from './models/types';
import { ALL_KINDS, SINGLETON_KINDS, createPlayer } from './models/factory';
import { makeShortName } from './utils/names';
import { GameInfoModal } from './components/RulesModal';
import { HumanPlayer } from './models/players/HumanPlayer';
import { HumanChoiceSelector } from './components/HumanChoiceSelector';
import { RoundsTable } from './components/RoundsTable';

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
  const [stage, setStage] = useState<'setup' | 'playing' | 'finished'>('setup');
const [roster, setRoster] = useState<RosterEntry[]>(() => {
  return Array.from({ length: 3 }).map((_, i) => ({
    id: i + 1,
    name: i === 0 ? "You" : makeShortName(),
    kind: i === 0 ? "Human" : null, // 假设 Human 是 Personality 类型里的一个值
  }));
});


  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [game, setGame] = useState<Game | null>(null);
  const [tick, setTick] = useState(0);
  const [showKinds, setShowKinds] = useState(false);
  const [openRec, setOpenRec] = useState(false);

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

  function removePlayer(id: number) {
    // 如果希望最少保留 3 人，可加这段保护
    if (stage === 'setup' && roster.length <= 3) {
      alert('至少需要 3 名玩家才能开始游戏，无法再删除。');
      return;
    }
    setRoster(r => r.filter(e => e.id !== id));
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
    const instances: IPlayer[] = finalized.map((e/*, idx*/) =>
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
    if (game.matchWinner) setStage('finished');
  }

  // -------------- RENDER --------------
  if (stage === 'setup') {
    return (
      <div className="!min-h-screen !w-srceen bg-slate-900 text-slate-100 p-6">
        <div className="w-full mx-auto space-y-6">
          <header className="flex items-center justify-between">
            <h2 className="!text-4xl font-bold mr-2">King of Diamonds</h2>
            <div className="space-x-2">
              <button onClick={addBot} className="px-3 py-1.5 !bg-indigo-600 rounded hover:!bg-indigo-500">
                Add Bot
              </button>
              <button onClick={startGame} className="px-3 py-1.5 !bg-emerald-600 rounded hover:!bg-emerald-500">
                Start Game
              </button>
              <GameInfoModal
                players={players}
                allKinds={ALL_KINDS}
                settings={{
                  minPlayers: 3,
                  maxPlayers: 24,
                  initialHP: 10,
                  numberRange: [0, 100],
                  singletonKinds: SINGLETON_KINDS,
                }}
              />
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
                    <th className="text-left px-3 py-2">Character</th>
                    <th className="text-left px-3 py-2">Actions</th>
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
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removePlayer(r.id)}
                          className="!bg-transparent !text-red-800/80 disabled:!text-slate-400/80"
                          disabled={roster.length <= 3}
                          // Minimal to start : 3 players
                          title="Delete this player"
                        >
                          <i class="bi text-2xl bi-person-fill-dash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs !text-slate-400 mt-2">
                Kuzuryu are limited to one instance per game. Unassigned AIs will be randomized on start.
              </p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Finished stage
  if (stage === 'finished' && game?.matchWinner) {
    const w = game.matchWinner;
    const record = GameRecord.instance;
    return (
      <div className="h-screen w-srceen bg-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <div className="w-full rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl p-6 kd-animate-in">
          <h1 className="text-2xl font-bold mb-4">Match Finished</h1>
          <i class="bi text-3xl bi-emoji-sunglasses"></i>
          <div className="space-y-2">
            <div><span className="text-slate-400">Winner:</span> <span className="font-semibold">{w.name}</span></div>
            <div><span className="text-slate-400">Type:</span> <span className="font-mono">{w.kind}</span></div>
            <div><span className="text-slate-400">Final HP:</span> <span className="font-mono">{w.hp}</span></div>
          </div>
          <div className="mt-6 flex gap-2">
            <button
              onClick={backToSetup}
              className="w-full px-3 py-1.5 rounded !bg-emerald-600 hover:!bg-emerald-500"
            >
              Start a New Round
            </button>
          </div>
          <div className="mt-6">
            <button
              onClick={() => setOpenRec(v => !v)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded !bg-transparent !text-sm"
            >
              <i class={`bi bi-caret-down kd-rot ${openRec ? 'kd-rot--open' : ''}`}></i>
              <span>Game Record</span>
              <i class={`bi bi-caret-down kd-rot ${openRec ? 'kd-rot--open' : ''}`}></i>
            </button>

            <div className={`kd-acc mt-3 ${openRec ? 'kd-acc--open' : 'kd-acc--closed'}`}>
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
                <RoundsTable rounds={record.rounds} />
              </div>
            </div>
          </div>
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

  // find the human (if any) and readiness (must have a pending choice)
  const human = players.find(p => p.kind === 'Human') as HumanPlayer | undefined;
  const humanReady = !human || human.hasPendingChoice();

  function submitHumanChoice(value: number) {
    if (human) human.setPendingChoice(value);
    setTick(t => t + 1);
  }

  return (
    <div className="min-h-screen w-srceen bg-slate-900 text-slate-100 p-6 relative">
      <div className="w-full mx-auto space-y-6 overflow-y-auto">
        <header className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">King of Diamonds — Match</h2>
          <div className="flex items-center gap-2">
            <button onClick={backToSetup} className="px-3 py-1.5 !bg-slate-700 rounded hover:!bg-slate-600">
              Restart
            </button>
            {human && (
              <HumanChoiceSelector players={players} onPick={submitHumanChoice} round={record.currRound()} /*Use tick here as substitution to round*/ />
            )}
            <button
              onClick={playOne}
              disabled={!humanReady}
              className={`px-3 py-1.5 rounded ${humanReady ? '!bg-emerald-600 hover:!bg-emerald-500' : '!bg-slate-700 !text-slate-400 cursor-not-allowed'}`}
              title={human && !humanReady ? 'Pick your number first' : ''}
            >
              Play Round
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
                  <th className="text-left px-3 py-2">
                    Kind
                    <button
                      onClick={() => setShowKinds(v => !v)}
                      className="ml-1 p-0.5 !bg-transparent border-0 text-slate-400 hover:text-slate-200"
                      title={showKinds ? 'Hide player types' : 'Show player types'}
                    >
                      {showKinds
                        ? <i class="bi bi-eye-fill"></i>
                        : <i class="bi bi-eye-slash-fill"></i>}
                    </button>
                  </th>
                  <th className="text-left px-3 py-2">HP</th>
                </tr>
              </thead>
              <tbody>
                {alive.map(p => (
                  <tr key={p.id} className="odd:bg-slate-800/50">
                    <td className="px-3 py-2">{p.id}</td>
                    <td className="px-3 py-2">{p.name}</td>
                    <td className={`px-3 py-2 md:min-w-32 ${showKinds ? "text-slate-200" : "!text-slate-400/80 italic"}`}>
                      {showKinds ? p.kind : '< Hidden >'}
                    </td>
                    <td className={`px-3 py-2 font-mono font-black text-xl text-center
                      ${p.hp>7 ? "!text-green-700" : (p.hp>2 ? "!text-yellow-700" : "text-red-700")}`}>
                      {p.hp == 0 ? <i class="bi !text-red-800/70 bi-emoji-dizzy"></i> 
                      : p.hp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Finished Rounds <b className="text-sm !text-gray-300/60">(Newest on top)</b></h2>
          <RoundsTable rounds={record.rounds} />
        </section>

        <footer className="text-xs text-slate-400">
          Winner will be highlighted, a perfect-hit winner will be rainbow-highlighted.
        </footer>
      </div>
      <div className="fixed bottom-4 right-4">
        <GameInfoModal
          players={players}
          allKinds={ALL_KINDS}
          settings={{
            minPlayers: 3,
            maxPlayers: 24,
            initialHP: 10,
            numberRange: [0, 100],
            singletonKinds: SINGLETON_KINDS,
          }}
        />
      </div>
    </div>
  );
}
