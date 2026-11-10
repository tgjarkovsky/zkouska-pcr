import type { ReactNode } from 'react';

export type Mood = 'happy' | 'wave' | 'cheer' | 'sad' | 'think' | 'wow';

const C = {
  skin: '#fbd8c0',
  skinShade: '#efbd9c',
  hair: '#8a4b2a',
  hairDark: '#5e3119',
  shirt: '#a7cbf2',
  shirtShade: '#86b0e2',
  navy: '#22416f',
  navyDark: '#152c4d',
  gold: '#ffc93c',
  cheek: '#ff8f9a',
  ink: '#2b1a12',
  mouth: '#a8313f',
  tongue: '#ff8a8a',
};

function star(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

function Arm({ x1, y1, x2, y2, className }: { x1: number; y1: number; x2: number; y2: number; className?: string }) {
  return (
    <g className={className}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.shirt} strokeWidth={17} strokeLinecap="round" />
      <circle cx={x2} cy={y2} r={10} fill={C.skin} />
    </g>
  );
}

function Eyes({ mood }: { mood: Mood }) {
  if (mood === 'cheer')
    return (
      <g fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round">
        <path d="M75 106 Q82 97 89 106" />
        <path d="M111 106 Q118 97 125 106" />
      </g>
    );
  const big = mood === 'wow';
  const dy = mood === 'sad' ? 2 : 0;
  const dx = mood === 'think' ? 2 : 0;
  const pupil = mood === 'think' ? -2 : 0;
  const ry = big ? 7.5 : mood === 'sad' ? 5.5 : 6.5;
  const rx = big ? 6.5 : 5.2;
  return (
    <g>
      {[82, 118].map((x) => (
        <g key={x}>
          <ellipse cx={x + dx} cy={104 + dy + pupil} rx={rx} ry={ry} fill={C.ink} />
          <circle cx={x + dx + 1.8} cy={101 + dy + pupil} r={2} fill="#fff" />
          {big && <circle cx={x + dx - 2} cy={107 + pupil} r={1.1} fill="#fff" />}
        </g>
      ))}
      <g stroke={C.ink} strokeWidth={2} strokeLinecap="round">
        <line x1={77 + dx} y1={99 + dy} x2={72 + dx} y2={96 + dy} />
        <line x1={123 + dx} y1={99 + dy} x2={128 + dx} y2={96 + dy} />
      </g>
    </g>
  );
}

function Brows({ mood }: { mood: Mood }) {
  const p = { fill: 'none', stroke: C.hairDark, strokeWidth: 3, strokeLinecap: 'round' as const };
  switch (mood) {
    case 'sad':
      return (
        <g {...p}>
          <path d="M74 92 L89 87" />
          <path d="M111 87 L126 92" />
        </g>
      );
    case 'think':
      return (
        <g {...p}>
          <path d="M75 91 Q83 88 90 91" />
          <path d="M111 86 Q119 80 127 85" />
        </g>
      );
    case 'wow':
      return (
        <g {...p}>
          <path d="M74 86 Q82 81 90 86" />
          <path d="M110 86 Q118 81 126 86" />
        </g>
      );
    default:
      return (
        <g {...p}>
          <path d="M74 91 Q82 87 90 91" />
          <path d="M110 91 Q118 87 126 91" />
        </g>
      );
  }
}

function Mouth({ mood }: { mood: Mood }) {
  const s = { fill: 'none', stroke: C.mouth, strokeWidth: 3.5, strokeLinecap: 'round' as const };
  switch (mood) {
    case 'cheer':
      return (
        <g>
          <path d="M86 118 Q100 140 114 118 Q100 124 86 118 Z" fill={C.mouth} />
          <ellipse cx={100} cy={129} rx={6} ry={3.2} fill={C.tongue} />
        </g>
      );
    case 'wave':
      return <path d="M88 120 Q100 135 112 120 Q100 125 88 120 Z" fill={C.mouth} />;
    case 'sad':
      return <path d="M91 129 Q100 121 109 129" {...s} />;
    case 'wow':
      return <ellipse cx={100} cy={126} rx={5.5} ry={7} fill={C.mouth} />;
    case 'think':
      return <path d="M92 126 Q101 128 110 121" {...s} />;
    default:
      return <path d="M89 121 Q100 132 111 121" {...s} />;
  }
}

/** Policistka Nanynka – maskot aplikace (originální kresba). */
export function Nanynka({ mood = 'happy', size = 120, className = '' }: { mood?: Mood; size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={size * 1.1}
      className={`nanynka mood-${mood} ${className}`}
      role="img"
      aria-label="Policistka Nanynka"
    >
      <g className="nn-body">
        {/* vlasy vzadu + cop */}
        <ellipse cx={100} cy={100} rx={55} ry={56} fill={C.hair} />
        <g fill={C.hair} stroke={C.hairDark} strokeWidth={1.5}>
          <circle cx={147} cy={132} r={10} />
          <circle cx={151} cy={148} r={9.5} />
          <circle cx={154} cy={163} r={9} />
        </g>
        <rect x={148} y={171} width={12} height={6} rx={3} fill={C.gold} />
        <path d="M150 177 Q154 192 160 177 Z" fill={C.hair} />

        {/* tělo – košile, kravata, nárameníky, odznak */}
        <path d="M38 222 C38 178 60 156 100 156 C140 156 162 178 162 222 Z" fill={C.shirt} />
        <path d="M84 156 L100 172 L91 181 Z M116 156 L100 172 L109 181 Z" fill={C.shirtShade} />
        <path d="M96 170 L104 170 L107 201 L100 209 L93 201 Z" fill={C.navy} />
        <path d="M47 176 L77 162 L80 170 L51 184 Z M153 176 L123 162 L120 170 L149 184 Z" fill={C.navy} />
        <polygon points={star(72, 194, 8)} fill={C.gold} />

        {/* krk, uši, hlava */}
        <rect x={89} y={128} width={22} height={34} rx={9} fill={C.skinShade} />
        <circle cx={54} cy={104} r={9} fill={C.skin} />
        <circle cx={146} cy={104} r={9} fill={C.skin} />
        <circle cx={54} cy={115} r={2.6} fill={C.gold} />
        <circle cx={146} cy={115} r={2.6} fill={C.gold} />
        <ellipse cx={100} cy={102} rx={46} ry={47} fill={C.skin} />

        {/* ofina */}
        <path
          d="M54 94 C56 72 76 62 100 64 C124 62 144 72 146 94 C138 85 126 80 114 82 C104 74 92 76 86 84 C76 82 62 86 54 94 Z"
          fill={C.hair}
        />

        {/* služební čepice */}
        <g transform="translate(0 -9)">
          <path d="M40 60 C42 30 158 30 160 60 C150 68 50 68 40 60 Z" fill={C.navy} />
          <rect x={55} y={58} width={90} height={15} rx={3} fill={C.navyDark} />
          <rect x={55} y={64} width={90} height={2.4} fill="#c9d4e4" />
          <polygon points={star(100, 46, 8.5)} fill={C.gold} />
          <path d="M57 72 C80 82 120 82 143 72 L145 77 C120 90 80 90 55 77 Z" fill="#0e1b2f" />
        </g>

        {/* obličej */}
        <Brows mood={mood} />
        <Eyes mood={mood} />
        <circle cx={70} cy={119} r={7} fill={C.cheek} opacity={0.5} />
        <circle cx={130} cy={119} r={7} fill={C.cheek} opacity={0.5} />
        <Mouth mood={mood} />
        {mood === 'sad' && <path d="M140 80 Q146 90 140 94 Q134 90 140 80 Z" fill="#7cc4ff" />}
      </g>

      {/* ruce podle nálady */}
      {mood === 'wave' && <Arm x1={150} y1={182} x2={178} y2={130} className="nn-wave" />}
      {mood === 'cheer' && (
        <g className="nn-cheer-arms">
          <Arm x1={50} y1={182} x2={22} y2={130} />
          <Arm x1={150} y1={182} x2={178} y2={130} />
        </g>
      )}
      {mood === 'think' && <Arm x1={64} y1={204} x2={92} y2={142} />}
      {mood === 'cheer' && (
        <g fill={C.gold} className="nn-sparkles">
          <polygon points={star(26, 70, 9)} />
          <polygon points={star(176, 66, 7)} />
          <polygon points={star(168, 100, 5)} />
        </g>
      )}
    </svg>
  );
}

/** Nanynka s bublinou. */
export function NanynkaSays({
  mood = 'happy',
  size = 76,
  children,
  className = '',
}: {
  mood?: Mood;
  size?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`nn-says ${className}`}>
      <Nanynka mood={mood} size={size} />
      <div className="bubble">{children}</div>
    </div>
  );
}
