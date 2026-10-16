'use client';

function humanPx(): number {
  return 132;
}

export function ScaleGraphic({
  meters,
  label,
}: {
  meters: number;
  label: string;
}) {
  const H = humanPx();
  const ratio = meters / 1.8;
  const creaturePx = Math.max(4, Math.min(H * ratio, 240));
  const times = ratio >= 1 ? Math.round(ratio * 10) / 10 : null;

  return (
    <div className="phylo-scale">
      <div className="phylo-scale-cols">
        <div className="phylo-scale-col">
          <div className="phylo-scale-stage" style={{ height: H }}>
            <svg viewBox="0 0 24 60" className="phylo-human" aria-hidden="true">
              <circle cx="12" cy="8" r="5" fill="currentColor" />
              <path
                d="M12 13c-4 0-6 3-6 7v6h3l1 12h4l1-12h3v-6c0-4-2-7-6-7Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="phylo-scale-cap">You · 1.8m</span>
        </div>

        <div className="phylo-scale-col">
          <div className="phylo-scale-stage" style={{ height: H }}>
            <div
              className="phylo-scale-bar"
              style={{ height: creaturePx }}
              title={label}
            />
          </div>
          <span className="phylo-scale-cap">
            {times ? `${times}× you` : 'tiny'}
          </span>
        </div>
      </div>
      <p className="phylo-scale-label">{label}</p>
    </div>
  );
}
