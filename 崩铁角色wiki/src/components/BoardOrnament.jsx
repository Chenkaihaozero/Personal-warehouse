/**
 * 八大板块各自的「地域纹章」。
 *
 * 每个板块一个专属 SVG，形状直接对应它在剧情里的地标：
 * 银轨 / 六边形舱段 / 冰棱 / 回纹灯笼 / 装饰艺术扇形 / 十二火种 / 故障条 / 令咒。
 * 全部用 currentColor，颜色由所在板块的 --c-primary 决定。
 */

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' };

function Express() {
  return (
    <svg viewBox="0 0 220 40" className="h-10 w-full" aria-hidden="true">
      {/* 两条铁轨 */}
      <path d="M0 14h220M0 30h220" {...S} strokeOpacity="0.7" />
      {/* 枕木 */}
      {Array.from({ length: 22 }, (_, i) => (
        <path key={i} d={`M${i * 10 + 4} 10v24`} {...S} strokeOpacity="0.28" />
      ))}
      {/* 列车厢与窗 */}
      <rect x="70" y="6" width="80" height="28" rx="6" {...S} strokeOpacity="0.9" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={80 + i * 18} y="14" width="10" height="12" rx="2" {...S} strokeOpacity="0.55" />
      ))}
      <circle cx="60" cy="20" r="4" {...S} strokeOpacity="0.5" />
      <circle cx="160" cy="20" r="4" {...S} strokeOpacity="0.5" />
    </svg>
  );
}

function Herta() {
  const hex = (cx, cy, r) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    });
    return `M${pts.join('L')}Z`;
  };
  return (
    <svg viewBox="0 0 220 44" className="h-11 w-full" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={hex(26 + i * 34, 22, 15)} {...S} strokeOpacity={i === 2 ? 0.95 : 0.3} />
      ))}
      <circle cx="94" cy="22" r="5" {...S} strokeOpacity="0.9" />
      <circle cx="94" cy="22" r="10" {...S} strokeOpacity="0.35" strokeDasharray="3 5" />
      <path d="M0 22h14M206 22h14" {...S} strokeOpacity="0.4" strokeDasharray="4 4" />
    </svg>
  );
}

function Belobog() {
  return (
    <svg viewBox="0 0 220 44" className="h-11 w-full" aria-hidden="true">
      {/* 冰棱 */}
      {Array.from({ length: 13 }, (_, i) => {
        const x = 8 + i * 17;
        const h = 10 + ((i * 7) % 16);
        return <path key={i} d={`M${x} 4L${x + 6} 4L${x + 3} ${4 + h}Z`} {...S} strokeOpacity="0.45" />;
      })}
      {/* 地表裂缝 */}
      <path d="M0 38h60l8-6 10 6h44l6 5 9-5h83" {...S} strokeOpacity="0.6" />
      {/* 雪花 */}
      {[70, 150, 190].map((cx) => (
        <g key={cx} {...S} strokeOpacity="0.7">
          <path d={`M${cx} 20v10M${cx - 4.5} 22.5l9 5M${cx + 4.5} 22.5l-9 5`} />
        </g>
      ))}
    </svg>
  );
}

function Xianzhou() {
  return (
    <svg viewBox="0 0 220 44" className="h-11 w-full" aria-hidden="true">
      {/* 回纹 */}
      <path
        d="M0 8h6v-4h8v8h-4V10H0M220 8h-6v-4h-8v8h4V10h10"
        {...S}
        strokeOpacity="0.55"
      />
      <path
        d="M0 36h6v4h8v-8h-4v2H0M220 36h-6v4h-8v-8h4v2h10"
        {...S}
        strokeOpacity="0.55"
      />
      {/* 灯笼 */}
      {[56, 110, 164].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy="22" rx="9" ry="11" {...S} strokeOpacity="0.8" />
          <path d={`M${cx} 6v5M${cx} 33v5`} {...S} strokeOpacity="0.5" />
          <path d={`M${cx - 6} 12h12M${cx - 8} 22h16M${cx - 6} 32h12`} {...S} strokeOpacity="0.3" />
        </g>
      ))}
      <path d="M30 22h14M96 22h-6M130 22h-6M186 22h14" {...S} strokeOpacity="0.35" strokeDasharray="3 4" />
    </svg>
  );
}

function Penacony() {
  return (
    <svg viewBox="0 0 220 44" className="h-11 w-full" aria-hidden="true">
      {/* 装饰艺术扇形 */}
      {Array.from({ length: 13 }, (_, i) => {
        const a = Math.PI + (Math.PI / 12) * i;
        return (
          <path
            key={i}
            d={`M110 40L${(110 + 38 * Math.cos(a)).toFixed(1)} ${(40 + 38 * Math.sin(a)).toFixed(1)}`}
            {...S}
            strokeOpacity={i % 3 === 0 ? 0.75 : 0.28}
          />
        );
      })}
      <path d="M62 40a48 48 0 0 1 96 0" {...S} strokeOpacity="0.8" />
      <path d="M74 40a36 36 0 0 1 72 0" {...S} strokeOpacity="0.5" strokeDasharray="4 4" />
      <circle cx="110" cy="40" r="5" {...S} strokeOpacity="0.9" />
      {[24, 196].map((x) => (
        <path key={x} d={`M${x} 12v20M${x - 6} 12h12M${x - 6} 32h12`} {...S} strokeOpacity="0.4" />
      ))}
    </svg>
  );
}

function Amphoreus() {
  // 十二枚火种环绕
  return (
    <svg viewBox="0 0 220 44" className="h-11 w-full" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 12 - Math.PI / 2;
        const cx = 110 + 19 * Math.cos(a) * 2.6;
        const cy = 22 + 19 * Math.sin(a) * 0.92;
        return <circle key={i} cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={i % 3 === 0 ? 3 : 1.8} {...S} strokeOpacity={i % 3 === 0 ? 0.9 : 0.45} />;
      })}
      {/* 希腊回纹 */}
      <path
        d="M0 22h10v-7h10v14h10v-14h10v7h10M220 22h-10v-7h-10v14h-10v-14h-10v7h-10"
        {...S}
        strokeOpacity="0.6"
      />
      <path d="M110 4v36" {...S} strokeOpacity="0.2" />
    </svg>
  );
}

function Erxiang() {
  return (
    <svg viewBox="0 0 220 44" className="h-11 w-full" aria-hidden="true">
      {/* 故障条 */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect
          key={i}
          x={8 + ((i * 29) % 150)}
          y={6 + i * 4.2}
          width={26 + ((i * 17) % 46)}
          height="2.6"
          fill="currentColor"
          opacity={0.14 + (i % 4) * 0.18}
        />
      ))}
      {/* 扫描线 */}
      {Array.from({ length: 11 }, (_, i) => (
        <path key={i} d={`M0 ${i * 4}h220`} {...S} strokeOpacity="0.09" />
      ))}
      <rect x="88" y="12" width="60" height="20" rx="3" {...S} strokeOpacity="0.85" />
      <path d="M96 22h44" {...S} strokeOpacity="0.4" strokeDasharray="2 3" />
      <circle cx="82" cy="22" r="3" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

function Fate() {
  return (
    <svg viewBox="0 0 220 44" className="h-11 w-full" aria-hidden="true">
      <circle cx="110" cy="22" r="18" {...S} strokeOpacity="0.85" />
      <circle cx="110" cy="22" r="13" {...S} strokeOpacity="0.5" strokeDasharray="2 4" />
      {/* 令咒光芒 */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI / 4) * i;
        return (
          <path
            key={i}
            d={`M${(110 + 20 * Math.cos(a)).toFixed(1)} ${(22 + 20 * Math.sin(a)).toFixed(1)}L${(
              110 +
              30 * Math.cos(a)
            ).toFixed(1)} ${(22 + 30 * Math.sin(a)).toFixed(1)}`}
            {...S}
            strokeOpacity="0.55"
          />
        );
      })}
      <path d="M0 22h78M142 22h78" {...S} strokeOpacity="0.4" />
      <path d="M46 14l8 8-8 8-8-8zM174 14l8 8-8 8-8-8z" {...S} strokeOpacity="0.5" />
    </svg>
  );
}

const ORNAMENTS = {
  express: Express,
  herta: Herta,
  belobog: Belobog,
  xianzhou: Xianzhou,
  penacony: Penacony,
  amphoreus: Amphoreus,
  erxiang: Erxiang,
  fate: Fate,
};

export default function BoardOrnament({ boardId }) {
  const C = ORNAMENTS[boardId];
  return C ? <C /> : null;
}
