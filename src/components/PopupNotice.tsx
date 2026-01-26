import { useEffect, useState } from 'preact/hooks';

type Props = {
  message: string;
  onDone: () => void;
  durationMs?: number;
};

export function PopupNotice({ message, onDone, durationMs = 1700 }: Props) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const closeTimer = setTimeout(() => setClosing(true), durationMs);
    const doneTimer = setTimeout(() => onDone(), durationMs + 220);
    return () => {
      clearTimeout(closeTimer);
      clearTimeout(doneTimer);
    };
  }, [message, durationMs, onDone]);

  return (
    <div className={`kd-pop ${closing ? 'kd-pop--out' : 'kd-pop--in'}`} role="status" aria-live="polite">
      <div className="kd-pop__panel">
        <i className="bi bi-exclamation-triangle kd-pop__icon" aria-hidden="true"></i>
        <span>{message}</span>
      </div>
    </div>
  );
}
