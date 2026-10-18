import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as echarts from 'echarts';
import { relations, RELATION_STYLE, factions } from '../lib/data.js';
import SilhouetteAvatar, { silhouetteDataUri } from './SilhouetteAvatar.jsx';

const ALL_NODES = relations.nodes;
const ALL_LINKS = relations.links;
const TYPES = Object.keys(RELATION_STYLE);

/**
 * 这个组件刻意保持「力导向 + 不印线上文字」：
 *  1. 布局交给 ECharts 的内建力导向（`layout:'force'`），同阵营/同故事线的人会自然聚成一团，
 *     这是读图时最主要的「逻辑感」来源；
 *  2. 连线上不印任何文字，避免几十条关系挤在一起变成一团糊；
 *  3. 关系详情改成**双击一条连线**弹出（以前是鼠标一碰线就弹框，太容易误触），
 *     详情正文的字号是原来的两倍；
 *  4. 头像的点击判定由本组件自己算（`readPixels`），因为 ECharts 把连线画在头像之上，
 *     穿过头像的线会抢走点击 —— 自己算就永远点得中头像。
 */

/** 头像直径：关系越多的人越大 */
function nodeSize(degree) {
  return 30 + Math.min(degree || 0, 12) * 2.2;
}

/** 每条边两端各自要不要箭头；ECharts 的边 symbol 支持逐端指定 */
function endsFor(dir) {
  const atSource = dir === 't2s' || dir === 'both';
  const atTarget = dir === 's2t' || dir === 'both';
  return [atSource ? 'arrow' : 'none', atTarget ? 'arrow' : 'none'];
}

/** 关系类型胶囊上的线型预览 */
const DASH_BG = {
  solid: 'none',
  dashed: 'repeating-linear-gradient(90deg, currentColor 0 6px, transparent 6px 10px)',
  dotted: 'repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 5px)',
};

/** 详情卡：正文 24px、备注 22px —— 正好是原来 12px / 11px 的两倍 */
const FONT = 24;
const FONT_SM = 22;

/** 画布四周留出的余量，别让贴边的头像被裁掉（ECharts 的力导向会把节点铺满整个矩形） */
const PAD = { left: 52, top: 46, right: 52, bottom: 56 };

/* ------------------------------------------------------------------ *
 * 命中判定用到的几何工具
 * ------------------------------------------------------------------ */

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/**
 * 到一条边的距离：两点是直线，三点是二次贝塞尔（curveness 产生的控制点）。
 *
 * ⚠️ 三个点的顺序是 ECharts 的内部约定，**不是**直觉上的「起点、控制点、终点」：
 *   - forceLayout.js 写回边几何时是 `points[0] = p1(起点) / points[1] = p2(终点) / points[2] = 控制点`；
 *   - 真正画线时（Line.js 的 setLinePoints）同样把 `points[1]` 当成终点 x2/y2、`points[2]` 当成控制点 cpx1/cpy1。
 * 也就是 [起点, 终点, 控制点]。早先这里按 [起点, 控制点, 终点] 采样，描出来的是**另一条曲线**
 * （相当于把控制点和终点对调），于是双击一条线常常命中旁边另一条线，
 * 详情卡就显示成了别人的关系（例：点「姬子→开拓者」弹出「黄泉→开拓者」）。
 * 实测：修正前只有 55% 的点能命中自己那条边、28% 张冠李戴；修正后 141/141 精确命中。
 */
function distToEdge(px, py, pts) {
  if (!pts || pts.length < 2) return Infinity;
  if (pts.length === 2) {
    return distToSegment(px, py, pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
  }
  const p0 = pts[0]; // 起点
  const p1 = pts[1]; // 终点
  const ctrl = pts[2]; // 控制点
  let best = Infinity;
  let prevX = p0[0];
  let prevY = p0[1];
  const STEPS = 16;
  for (let s = 1; s <= STEPS; s += 1) {
    const t = s / STEPS;
    const mt = 1 - t;
    const x = mt * mt * p0[0] + 2 * mt * t * ctrl[0] + t * t * p1[0];
    const y = mt * mt * p0[1] + 2 * mt * t * ctrl[1] + t * t * p1[1];
    best = Math.min(best, distToSegment(px, py, prevX, prevY, x, y));
    prevX = x;
    prevY = y;
  }
  return best;
}

/** 连线的点击热区半径（像素） */
const EDGE_HIT = 9;

export default function RelationGraph({ height = 900 }) {
  const hostRef = useRef(null);
  const chartRef = useRef(null);
  const downRef = useRef(null);
  const navigate = useNavigate();

  const [activeTypes, setActiveTypes] = useState(() => new Set(TYPES));
  const [activeFactions, setActiveFactions] = useState(() => new Set());
  const [keyword, setKeyword] = useState('');
  const [focusId, setFocusId] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [oneHop, setOneHop] = useState(true);
  const [hoverName, setHoverName] = useState(null);
  const [detailLink, setDetailLink] = useState(null);

  /** 图上真正出现过的阵营，按 lib 里的顺序 */
  const graphFactions = useMemo(() => {
    const seen = new Set();
    for (const n of ALL_NODES) if (n.faction) seen.add(n.faction);
    return factions.filter((f) => seen.has(f.id));
  }, []);

  /** 过滤：阵营 → 关系类型 → 关键词（命中节点及其一度邻居）→ 只看一度关系 */
  const view = useMemo(() => {
    const byFaction = (n) =>
      !activeFactions.size || (n.faction && activeFactions.has(n.faction));

    let nodes = ALL_NODES.filter(byFaction);

    const links = ALL_LINKS.filter((l) => {
      if (!activeTypes.has(l.type)) return false;
      const s = ALL_NODES.find((n) => n.name === l.source);
      const t = ALL_NODES.find((n) => n.name === l.target);
      if (!s || !t) return false;
      return byFaction(s) && byFaction(t);
    });

    const q = keyword.trim().toLowerCase();
    if (q) {
      const hits = new Set();
      for (const n of nodes) {
        if (
          n.name.toLowerCase().includes(q) ||
          (n.reason || '').toLowerCase().includes(q) ||
          (n.factionName || '').toLowerCase().includes(q)
        ) {
          hits.add(n.name);
        }
      }
      for (const l of links) {
        if (hits.has(l.source)) hits.add(l.target);
        if (hits.has(l.target)) hits.add(l.source);
      }
      nodes = nodes.filter((n) => hits.has(n.name));
      const keep = new Set(nodes.map((n) => n.name));
      return {
        nodes,
        links: links.filter((l) => keep.has(l.source) && keep.has(l.target)),
      };
    }

    const focusName = selectedName || null;
    if (focusName && oneHop) {
      const keep = new Set([focusName]);
      const kept = [];
      for (const l of links) {
        if (l.source === focusName || l.target === focusName) {
          keep.add(l.source);
          keep.add(l.target);
          kept.push(l);
        }
      }
      return { nodes: nodes.filter((n) => keep.has(n.name)), links: kept };
    }

    return { nodes, links };
  }, [activeTypes, activeFactions, keyword, selectedName, oneHop]);

  /** 图上选中的节点（可能是外部节点） */
  const focusNode = useMemo(
    () => (selectedName ? ALL_NODES.find((n) => n.name === selectedName) || null : null),
    [selectedName],
  );

  /** 悬停节点 / 双击连线的详情对象 */
  const hoverNode = useMemo(
    () => (hoverName ? ALL_NODES.find((n) => n.name === hoverName) || null : null),
    [hoverName],
  );

  /** 换筛选条件时收起详情卡，避免指到一张已经不在图上的关系 */
  useEffect(() => {
    setDetailLink(null);
  }, [view]);

  /* ---------------------------------------------------------------- *
   * 从 ECharts 内部读出「节点现在画在哪」
   *
   * 关键机制：力导向（layout:'force'）没有 x/y 数据，createView.js 会把
   * 坐标系的 boundingRect 直接设成 viewRect，于是 View 的变换退化为恒等 ——
   * 数据坐标就是画布像素坐标。用 convertToPixel 再包一层，顺带把
   * 滚轮缩放 / 拖拽平移（roam）算进去，坐标系就始终对得上。
   * ---------------------------------------------------------------- */
  const readPixels = () => {
    const chart = chartRef.current;
    if (!chart) return null;
    let series = null;
    try {
      series = chart.getModel().getSeriesByIndex(0);
    } catch {
      series = null;
    }
    const graph = series && typeof series.getGraph === 'function' ? series.getGraph() : null;
    if (!graph) return null;

    // 节点在屏幕上的真实大小倍率。roam 缩放时 ECharts 不是让头像原样放大：
    //   图形挂在 group 上，group.scaleX = zoom；符号自己再乘 getNodeGlobalScale
    //   = ((zoom - 1) * nodeScaleRatio + 1) / zoom（nodeScaleRatio 默认 0.6）。
    //   两者相乘 → 屏幕上只放大 (zoom - 1) * 0.6 + 1 倍。命中半径必须跟着一起缩放，
    //   否则放大后点头像会点空（落到连线判定上）、缩小后会误判到旁边的节点。
    const coordSys = series.coordinateSystem;
    const ratioRaw = series.get ? Number(series.get('nodeScaleRatio')) : NaN;
    const nodeScaleRatio = Number.isFinite(ratioRaw) ? ratioRaw : 0.6;
    const groupZoom = coordSys && Number.isFinite(coordSys.scaleX) ? coordSys.scaleX : 1;
    const roamZoom = coordSys && typeof coordSys.getZoom === 'function' ? coordSys.getZoom() : groupZoom;
    const nodePixelScale = Number.isFinite(roamZoom) ? (roamZoom - 1) * nodeScaleRatio + 1 : 1;

    const toPixel = (p) => {
      try {
        const out = chart.convertToPixel({ seriesIndex: 0 }, p);
        return out && Number.isFinite(out[0]) && Number.isFinite(out[1]) ? out : p;
      } catch {
        return p;
      }
    };

    const nodes = new Map();
    for (let i = 0; i < view.nodes.length; i += 1) {
      const n = view.nodes[i];
      const node = graph.getNodeByIndex(i);
      const layout = node && node.getLayout();
      if (!layout || !Number.isFinite(layout[0]) || !Number.isFinite(layout[1])) continue;
      const p = toPixel(layout);
      nodes.set(n.name, { x: p[0], y: p[1], r: (nodeSize(n.degree) / 2) * nodePixelScale });
    }
    return { nodes, graph, toPixel };
  };

  const hitNodeAt = (geo, x, y) => {
    let best = null;
    let bestDist = Infinity;
    for (const n of view.nodes) {
      const p = geo.nodes.get(n.name);
      if (!p) continue;
      const d = Math.hypot(x - p.x, y - p.y);
      if (d <= p.r + 3 && d < bestDist) {
        best = n;
        bestDist = d;
      }
    }
    return best;
  };

  /** 返回被双击的边在 view.links 里的下标 */
  const hitEdgeAt = (geo, x, y) => {
    let bestIndex = -1;
    let bestDist = EDGE_HIT;
    for (let i = 0; i < view.links.length; i += 1) {
      const edge = geo.graph.getEdgeByIndex(i);
      const raw = edge && edge.getLayout();
      if (!raw) continue;
      // 双保险：确认这条内部边就是 view.links[i]（按名字对，不靠下标）。万一将来 ECharts
      // 内部边的顺序或过滤方式变了，宁可这条不参与命中，也不要再出现「双击一条线弹别人的关系」。
      const link = view.links[i];
      if (edge.node1 && edge.node2 && (edge.node1.id !== link.source || edge.node2.id !== link.target)) continue;
      // 边的几何是「数据空间」坐标，鼠标坐标是画布像素。roam（滚轮缩放 / 拖拽平移）之后两者
      // 不再重合 —— 不换算的话，缩放后双击连线会点空或者点到别的线上。这里跟节点用同一套
      // toPixel（内部就是 convertToPixel，已含 roam 变换）。二次贝塞尔是仿射不变的，
      // 所以 3 个点各自换算即可，画出来的曲线与采样曲线仍然完全一致。
      const d = distToEdge(
        x,
        y,
        raw.map((p) => geo.toPixel(p)),
      );
      if (d < bestDist) {
        bestDist = d;
        bestIndex = i;
      }
    }
    return bestIndex;
  };

  /* ---------------------------------------------------------------- *
   * 初始化：hologram 容器 + 尺寸自适应
   * ---------------------------------------------------------------- */
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return undefined;
    const chart = echarts.init(el, null, { renderer: 'canvas' });
    chartRef.current = chart;
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);
    return () => {
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  /* ---------------------------------------------------------------- *
   * 鼠标交互
   *   单击头像   → 进入角色专栏（外部节点则聚焦它的关系）
   *   双击连线   → 弹出这条关系的详情卡
   *   悬停头像   → 弹出这个人的小卡片
   * ---------------------------------------------------------------- */
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return undefined;

    const local = (e) => {
      // canvas 是首帧绘制时才创建的，所以每次都现查，不能在 effect 里咬死引用
      const canvas = el.querySelector('canvas');
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onClick = (e) => {
      if (downRef.current) {
        const moved = Math.hypot(e.clientX - downRef.current.x, e.clientY - downRef.current.y);
        downRef.current = null;
        if (moved > 4) return; // 那是拖拽，不是点击
      }
      const pt = local(e);
      if (!pt) return;
      const geo = readPixels();
      if (!geo) return;
      const node = hitNodeAt(geo, pt.x, pt.y);
      if (!node) return;
      if (node.external) {
        setFocusId(node.id);
        setSelectedName(node.name);
      } else {
        navigate(`/character/${node.id}`);
      }
    };

    const onDown = (e) => {
      downRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMove = (e) => {
      if (downRef.current) return; // 拖动节点时不要弹卡片
      const pt = local(e);
      if (!pt) return;
      const geo = readPixels();
      if (!geo) return;
      const node = hitNodeAt(geo, pt.x, pt.y);
      setHoverName(node ? node.name : null);
    };

    const onLeave = () => setHoverName(null);

    const onDblClick = (e) => {
      const pt = local(e);
      if (!pt) return;
      const geo = readPixels();
      if (!geo) return;
      if (hitNodeAt(geo, pt.x, pt.y)) return; // 双击头像不处理
      const index = hitEdgeAt(geo, pt.x, pt.y);
      if (index < 0) return;
      setDetailLink(view.links[index]);
    };

    const onKey = (e) => {
      if (e.key === 'Escape') setDetailLink(null);
    };

    el.addEventListener('mousedown', onDown);
    el.addEventListener('click', onClick);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('dblclick', onDblClick);
    window.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('mousedown', onDown);
      el.removeEventListener('click', onClick);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('dblclick', onDblClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [view, navigate]);

  /* ---------------------------------------------------------------- *
   * 渲染
   * ---------------------------------------------------------------- */
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const activeNames = new Set(focusNode ? [focusNode.name] : []);
    const neighborNames = new Set(activeNames);
    if (focusNode) {
      for (const l of ALL_LINKS) {
        if (l.source === focusNode.name) neighborNames.add(l.target);
        if (l.target === focusNode.name) neighborNames.add(l.source);
      }
    }

    const onFocusPath = (l) =>
      activeNames.has(l.source) || activeNames.has(l.target);

    const data = view.nodes.map((n) => {
      const dim = focusNode ? !neighborNames.has(n.name) : false;
      const isFocus = focusNode ? n.name === focusNode.name : false;
      const color = n.factionColor || '#7dd3fc';
      return {
        // 注意：这里不能写 `id: n.id`（那是角色数字 id）。ECharts 用 id 匹配边的端点，
        // 而 links 的 source/target 是「角色名」，一旦给出数字 id 就一条边都接不上，
        // 画面会退化成「只有头像、没有任何连线」。省略 id，让它回退成用 name 匹配。
        name: n.name,
        category: Math.max(0, graphFactions.findIndex((f) => f.id === n.faction)),
        symbol: n.avatar ? `image://${n.avatar}` : `image://${silhouetteDataUri({ stroke: color })}`,
        symbolSize: nodeSize(n.degree),
        itemStyle: {
          borderColor: isFocus ? '#ffffff' : color,
          borderWidth: isFocus ? 4 : 2,
          shadowBlur: isFocus ? 26 : 10,
          shadowColor: isFocus ? 'rgba(255,255,255,0.55)' : `${color}66`,
          opacity: dim ? 0.22 : 1,
        },
        label: {
          show: true,
          opacity: dim ? 0.1 : 1,
        },
        dim,
        isFocus,
      };
    });

    const links = view.links.map((l) => {
      const st = RELATION_STYLE[l.type] || RELATION_STYLE.ally;
      const dim = focusNode ? !onFocusPath(l) : false;
      return {
        source: l.source,
        target: l.target,
        symbol: endsFor(l.dir),
        symbolSize: [9, 11],
        lineStyle: {
          color: st.color,
          width: dim ? 1 : 1.6,
          opacity: dim ? 0.08 : 0.72,
          type: st.dash,
          curveness: 0.12,
        },
        dim,
        _link: l,
      };
    });

    chart.setOption(
      {
        backgroundColor: 'transparent',
        animation: false,
        // 力导向的初始区域四周留出余量。注意：ECharts 的力导向会把节点继续往外推，
        // 最终仍可能有贴边的头像被切掉一点，这是内建行为，不是这里的余量没生效。
        left: PAD.left,
        top: PAD.top,
        right: PAD.right,
        bottom: PAD.bottom,
        series: [
          {
            type: 'graph',
            layout: 'force',
            roam: true,
            draggable: true,
            force: {
              repulsion: 420,
              edgeLength: [70, 190],
              gravity: 0.08,
              friction: 0.16,
              layoutAnimation: false,
            },
            data,
            links,
            label: {
              show: true,
              position: 'bottom',
              distance: 3,
              color: '#dbe3f0',
              fontSize: 11,
              textBorderColor: 'rgba(5,6,15,0.92)',
              textBorderWidth: 3,
            },
            lineStyle: { curveness: 0.12 },
            emphasis: {
              focus: 'adjacency',
              scale: 1.15,
              lineStyle: { width: 3, opacity: 1 },
            },
            itemStyle: { borderWidth: 2 },
          },
        ],
      },
      { notMerge: true },
    );
  }, [view, graphFactions, focusNode]);

  const toggleType = (t) =>
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next.size ? next : new Set(TYPES);
    });

  const toggleFaction = (id) =>
    setActiveFactions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const reset = () => {
    setActiveTypes(new Set(TYPES));
    setActiveFactions(new Set());
    setKeyword('');
    setFocusId(null);
    setSelectedName(null);
    setOneHop(true);
    setDetailLink(null);
  };

  const detailStyle = detailLink ? RELATION_STYLE[detailLink.type] || RELATION_STYLE.ally : null;

  return (
    <div className="space-y-3">
      {/* 控件 */}
      <div className="glass rounded-2xl border border-white/10 p-3 md:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜角色 / 阵营，聚焦某一段关系网…"
            className="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-void-900/70 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-sky-400/60"
          />
          <button
            type="button"
            onClick={() => setOneHop((v) => !v)}
            className={`rounded-xl border px-3 py-2 text-xs transition ${
              oneHop
                ? 'border-sky-400/50 bg-sky-400/10 text-sky-200'
                : 'border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            只看一度关系
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:text-slate-200"
          >
            重置
          </button>
        </div>

        {focusNode ? (
          <p className="mt-3 text-xs text-slate-400">
            正在聚焦 <span className="text-slate-100">{focusNode.name}</span>
            {focusNode.reason ? ` · ${focusNode.reason}` : ''} · 四周是它的直接关系
            <button
              type="button"
              onClick={() => {
                setFocusId(null);
                setSelectedName(null);
              }}
              className="ml-2 text-sky-300 underline decoration-dotted"
            >
              取消聚焦
            </button>
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] tracking-widest text-slate-500">关系类型</span>
          {TYPES.map((t) => {
            const st = RELATION_STYLE[t];
            const on = activeTypes.has(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                title={`${st.label}（${
                  st.dash === 'solid' ? '实线' : st.dash === 'dashed' ? '虚线' : '点线'
                }）`}
                style={{ color: on ? st.color : undefined, borderColor: on ? `${st.color}88` : undefined }}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
                  on ? 'bg-white/5' : 'border-white/10 text-slate-500'
                }`}
              >
                <i
                  className="inline-block h-[2px] w-5"
                  style={{
                    backgroundImage: DASH_BG[st.dash] === 'none' ? undefined : DASH_BG[st.dash],
                    backgroundColor: DASH_BG[st.dash] === 'none' ? 'currentColor' : undefined,
                  }}
                />
                {st.label}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[11px] tracking-widest text-slate-500">阵营</span>
          <button
            type="button"
            onClick={() => setActiveFactions(new Set())}
            className={`rounded-full border px-2.5 py-1 text-xs transition ${
              activeFactions.size === 0
                ? 'border-sky-400/50 bg-sky-400/10 text-sky-200'
                : 'border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            全部
          </button>
          {graphFactions.map((f) => {
            const on = activeFactions.has(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleFaction(f.id)}
                style={on ? { color: f.color, borderColor: `${f.color}88` } : undefined}
                className={`rounded-full border px-2.5 py-1 text-xs transition ${
                  on ? 'bg-white/5' : 'border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.crest} {f.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <div
          ref={hostRef}
          style={{ height }}
          className="graph-host glass w-full cursor-pointer rounded-2xl border border-white/10"
          role="img"
          aria-label="崩铁：星穹铁道人物关系网络图"
        />

        {/* 详情卡：悬停头像 / 双击连线都在这里显示，字号是原来的两倍 */}
        {hoverNode || detailLink ? (
          <div className="pointer-events-auto absolute right-3 top-3 max-h-[calc(100%-1.5rem)] w-[420px] max-w-[calc(100%-1.5rem)] overflow-auto rounded-2xl border border-white/15 bg-void-900/[0.97] p-4 shadow-2xl backdrop-blur-md">
            {detailLink && detailStyle ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[24px] font-semibold leading-tight text-slate-100">
                    {detailLink.dir === 'none'
                      ? `${detailLink.source} — ${detailLink.target}`
                      : detailLink.arrow}
                  </p>
                  <button
                    type="button"
                    onClick={() => setDetailLink(null)}
                    aria-label="关闭"
                    className="-mr-1 -mt-1 rounded-lg px-2 text-[22px] leading-none text-slate-500 transition hover:text-slate-200"
                  >
                    ×
                  </button>
                </div>
                <p className="mt-2 text-[22px] leading-snug" style={{ color: detailStyle.color }}>
                  {detailStyle.label}
                </p>
                <p className="mt-1 text-[24px] leading-snug text-slate-100">
                  「{detailLink.relation}」
                </p>
                <p className="mt-2 text-[22px] leading-snug text-slate-500">
                  来源：
                  {detailLink.origins.includes('official')
                    ? '官方 Wiki 角色关系'
                    : '按剧情补全'}
                </p>
                {detailLink.notes.map((nt) => (
                  <p key={nt} className="mt-1 text-[22px] leading-snug text-slate-400">
                    {nt}
                  </p>
                ))}
              </>
            ) : hoverNode ? (
              <>
                <div className="flex items-center gap-3">
                  {hoverNode.avatar ? (
                    <img
                      src={hoverNode.avatar}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-full border-2"
                      style={{ borderColor: hoverNode.factionColor || '#7dd3fc' }}
                    />
                  ) : (
                    <SilhouetteAvatar name="" size={64} stroke={hoverNode.factionColor || '#7dd3fc'} />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-[24px] font-semibold leading-tight text-slate-100">
                      {hoverNode.name}
                    </p>
                    <p className="text-[22px] leading-snug text-slate-400">
                      {hoverNode.factionName || hoverNode.reason || ''}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[22px] leading-snug text-slate-400">
                  {hoverNode.degree} 条关系
                </p>
                <p className="mt-1 text-[22px] leading-snug text-slate-500">
                  {hoverNode.external ? '官方 Wiki 暂无头像与专栏' : '单击进入角色专栏'}
                </p>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="text-xs leading-relaxed text-slate-500">
        当前显示 {view.nodes.length} 个节点 / {view.links.length} 条关系（共 {ALL_NODES.length} /{' '}
        {ALL_LINKS.length}）。连线上不印文字：
        <span className="text-slate-300">双击一条连线</span>
        看这条关系的详情，鼠标悬停头像看这个人。线色与线型都表示类型：实线是家人与同伴，
        虚线是上下与师生，点线是敌对。箭头指向「长辈 / 上级 → 晚辈 / 下级」；相互敌对为双向箭头；
        家人与同伴不设方向。按住节点可拖动，按住空白处拖动可平移，滚轮缩放。
      </p>
    </div>
  );
}
