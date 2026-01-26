import { useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import type { Personality } from '../models/types';

type Props = {
  allKinds: Personality[];
  weights: Partial<Record<Personality, number>>;
  onWeightChange: (kind: Personality, value: number) => void;
  enabledMap: Partial<Record<Personality, boolean>>;
  onToggleEnabled: (kind: Personality, next: boolean) => void;
  unlockMaxPlayers: boolean;
  onToggleUnlock: (next: boolean) => void;
};

export function SettingsModal({
  allKinds,
  weights,
  onWeightChange,
  enabledMap,
  onToggleEnabled,
  unlockMaxPlayers,
  onToggleUnlock,
}: Props) {
  const [open, setOpen] = useState(false);
  const aiKinds = allKinds.filter(k => k !== 'Human');

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center !px-2 !py-1.5 !mt-0 !bg-transparent text-slate-100 hover:text-amber-200"
        title="Settings"
      >
        <i className="bi bi-gear text-2xl"></i>
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center h-screen" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-[min(900px,94vw)] max-h-[90vh] kd-animate-in overflow-y-auto">
            <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                <h3 className="text-base sm:text-lg font-semibold !text-amber-50">
                  Settings
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-0.5 text-2xl rounded !bg-transparent text-gray-100 hover:text-gray-400"
                  aria-label="Close"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-6 text-sm leading-relaxed">
                <section>
                  <h4 className="text-slate-200 font-semibold mb-2">AI Random Assignment Weights</h4>
                  <p className="text-slate-400 mb-3">Higher weight means the AI is more likely to be assigned.</p>
                  <div className="space-y-3">
                    {aiKinds.map(kind => {
                      const value = Number.isFinite(weights[kind]!) ? (weights[kind] as number) : 1;
                      const enabled = enabledMap[kind] !== false;
                      return (
                        <div key={kind} className="grid grid-cols-[36px_140px_1fr_48px] gap-3 items-center">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onInput={(e: any) => onToggleEnabled(kind, e.currentTarget.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-700 rounded-full flex items-center px-0.5 transition peer-checked:bg-emerald-600 peer-checked:justify-end">
                              <span className="h-4 w-4 bg-white rounded-full transition"></span>
                            </div>
                          </label>
                          <span className="text-slate-200">{kind}</span>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={value}
                            onInput={(e: any) => onWeightChange(kind, parseFloat(e.currentTarget.value))}
                            disabled={!enabled}
                            className={`w-full accent-emerald-500 ${enabled ? '' : 'opacity-40 cursor-not-allowed'}`}
                          />
                          <span className="font-mono text-slate-300 text-right">{value.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <h4 className="text-slate-200 font-semibold mb-2">Player Limit</h4>
                  <label className="inline-flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={unlockMaxPlayers}
                      onInput={(e: any) => onToggleUnlock(e.currentTarget.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-700 rounded-full flex items-center px-0.5 transition peer-checked:bg-emerald-600 peer-checked:justify-end">
                      <span className="h-5 w-5 bg-white rounded-full transition"></span>
                    </div>
                    <span className="text-slate-300">Unlock upper player limit</span>
                  </label>
                </section>
              </div>

              <div className="px-4 py-3 bg-slate-800 border-t border-slate-700 flex justify-end">
                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-1.5 rounded !text-white !bg-slate-700 hover:!bg-slate-600"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.getElementById('root') ?? document.body
      )}
    </>
  );
}
