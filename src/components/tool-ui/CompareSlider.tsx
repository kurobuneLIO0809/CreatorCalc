import { useEffect, useRef, useState } from 'preact/hooks';

interface CompareSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel: string;
  afterLabel: string;
}

/** Before/after comparison. The range input is the accessible control; dragging the image also works. */
export function CompareSlider({ beforeUrl, afterUrl, beforeLabel, afterLabel }: CompareSliderProps) {
  const [pos, setPos] = useState(50);
  const [failed, setFailed] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const after = useRef<HTMLImageElement>(null);
  const handle = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Applied through the CSSOM (allowed by our CSP), not a style attribute.
    after.current?.style.setProperty('clip-path', `inset(0 0 0 ${pos}%)`);
    handle.current?.style.setProperty('left', `${pos}%`);
  }, [pos]);

  const fromPointer = (clientX: number) => {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    setPos(Math.round(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))));
  };

  if (failed) return <p class="muted">A preview of the original is not available in this browser (the format cannot be displayed), but the converted file is fine.</p>;

  return (
    <div class="compare">
      <div
        class="compare__frame"
        ref={frame}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          fromPointer(e.clientX);
        }}
        onPointerMove={(e) => {
          if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) fromPointer(e.clientX);
        }}
      >
        <img src={beforeUrl} alt={beforeLabel} class="compare__img" draggable={false} onError={() => setFailed(true)} />
        <img src={afterUrl} alt={afterLabel} class="compare__img compare__img--after" ref={after} draggable={false} />
        <div class="compare__handle" ref={handle} aria-hidden="true" />
        <span class="compare__tag compare__tag--left">{beforeLabel}</span>
        <span class="compare__tag compare__tag--right">{afterLabel}</span>
      </div>
      <label class="visually-hidden" for="compare-range">
        Comparison position
      </label>
      <input id="compare-range" class="slider" type="range" min={0} max={100} value={pos} onInput={(e) => setPos(Number((e.target as HTMLInputElement).value))} />
    </div>
  );
}
