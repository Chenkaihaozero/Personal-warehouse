/**
 * 银河背景 —— 全站底层视觉
 * 用「重复径向渐变」拼出多层星野（比逐颗 DOM 便宜得多），
 * 再叠三团星云 + 星图网格 + 偶发流星。
 */
const STAR_LAYER_SM = `
  radial-gradient(1px 1px at 12px 18px, rgba(255,255,255,.9), transparent),
  radial-gradient(1px 1px at 58px 132px, rgba(200,225,255,.75), transparent),
  radial-gradient(1px 1px at 118px 64px, rgba(255,255,255,.6), transparent),
  radial-gradient(1px 1px at 164px 158px, rgba(190,215,255,.7), transparent),
  radial-gradient(1px 1px at 86px 196px, rgba(255,255,255,.5), transparent),
  radial-gradient(1px 1px at 30px 96px, rgba(220,235,255,.65), transparent)
`
const STAR_LAYER_MD = `
  radial-gradient(1.6px 1.6px at 220px 90px, rgba(255,255,255,.95), transparent),
  radial-gradient(1.6px 1.6px at 60px 300px, rgba(210,230,255,.8), transparent),
  radial-gradient(1.6px 1.6px at 380px 210px, rgba(255,255,255,.7), transparent),
  radial-gradient(1.6px 1.6px at 300px 420px, rgba(200,215,255,.6), transparent),
  radial-gradient(1.6px 1.6px at 150px 520px, rgba(255,255,255,.75), transparent)
`
const STAR_LAYER_LG = `
  radial-gradient(2.4px 2.4px at 640px 240px, rgba(255,255,255,1), transparent),
  radial-gradient(2.4px 2.4px at 200px 620px, rgba(215,235,255,.9), transparent),
  radial-gradient(2.4px 2.4px at 900px 500px, rgba(255,255,255,.8), transparent)
`

export default function GalaxyBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-void-900">
      {/* 底色渐变 */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#141a3a_0%,#0a0c1b_45%,#05060f_100%)]" />

      {/* 星野三层（不同速度视差） */}
      <div
        className="absolute -inset-[10%] animate-drift opacity-70"
        style={{ backgroundImage: STAR_LAYER_SM, backgroundSize: '200px 200px' }}
      />
      <div
        className="absolute -inset-[10%] animate-drift opacity-50"
        style={{ backgroundImage: STAR_LAYER_MD, backgroundSize: '480px 480px', animationDuration: '38s' }}
      />
      <div
        className="absolute -inset-[10%] animate-drift opacity-40"
        style={{ backgroundImage: STAR_LAYER_LG, backgroundSize: '1100px 900px', animationDuration: '52s' }}
      />

      {/* 星云 */}
      <div className="absolute -left-[15%] top-[8%] h-[46rem] w-[46rem] animate-drift rounded-full bg-[radial-gradient(circle,rgba(88,101,242,.20),transparent_62%)] blur-3xl" />
      <div
        className="absolute -right-[12%] top-[38%] h-[40rem] w-[40rem] animate-drift rounded-full bg-[radial-gradient(circle,rgba(168,85,247,.18),transparent_62%)] blur-3xl"
        style={{ animationDuration: '34s' }}
      />
      <div
        className="absolute bottom-[-10%] left-[28%] h-[38rem] w-[38rem] animate-drift rounded-full bg-[radial-gradient(circle,rgba(45,212,191,.14),transparent_62%)] blur-3xl"
        style={{ animationDuration: '44s' }}
      />

      {/* 星图网格 */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(125,211,252,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,.10) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(120% 90% at 50% 30%, #000 30%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(120% 90% at 50% 30%, #000 30%, transparent 78%)',
        }}
      />

      {/* 偶发流星 */}
      <div className="absolute left-[10%] top-[22%] h-px w-40 animate-sweep bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      <div
        className="absolute left-[55%] top-[62%] h-px w-28 animate-sweep bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent"
        style={{ animationDelay: '1.8s' }}
      />

      {/* 暗角 */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_50%,transparent_45%,rgba(5,6,15,.85)_100%)]" />
    </div>
  )
}
