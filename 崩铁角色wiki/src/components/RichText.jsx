import { useMemo } from 'react';

/**
 * 角色故事正文的渲染器。
 *
 * 官方 Wiki 的正文里带有少量内联标记（`<i>` 内心独白、`<b>` 系统日志、
 * `<s>` 删除线、`<u>` 下划线、`<color=#rrggbbaa>` 高亮、`<align="right">` 落款）。
 *
 * 安全策略：**先把整段文本 HTML 转义**，再只把白名单里的那几个标记还原成真实标签。
 * 于是任何来自数据源的 `<script>` 都只会以纯文本形式显示，注入无从谈起。
 */

const ESCAPED_TAGS = [
  // 斜体（内心独白）
  [/&lt;i&gt;/g, '<em class="rich-i">'],
  [/&lt;\/i&gt;/g, '</em>'],
  // 粗体（系统日志、标题）
  [/&lt;b&gt;/g, '<strong class="rich-b">'],
  [/&lt;\/b&gt;/g, '</strong>'],
  // 删除线
  [/&lt;s&gt;/g, '<span class="rich-s">'],
  [/&lt;\/s&gt;/g, '</span>'],
  // 下划线（变量名）
  [/&lt;u&gt;/g, '<span class="rich-u">'],
  [/&lt;\/u&gt;/g, '</span>'],
  // 高亮色：官方写成 #rrggbbaa，丢掉 alpha 通道交给 CSS
  [/&lt;color=#([0-9a-fA-F]{6})[0-9a-fA-F]{0,2}&gt;/g, '<span style="color:#$1">'],
  [/&lt;\/color&gt;/g, '</span>'],
  // 落款：整行右对齐 / 居中
  [/&lt;align="?(left|center|right)"?&gt;/g, '<span class="rich-align-$1">'],
  [/&lt;\/align&gt;/g, '</span>'],
];

export function escapeHtml(raw) {
  return String(raw ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** 文本 → 安全的 HTML 字符串（未按段落切分）。 */
export function toSafeHtml(raw) {
  let out = escapeHtml(raw);
  for (const [re, to] of ESCAPED_TAGS) out = out.replace(re, to);
  return out;
}

/**
 * @param {object} props
 * @param {string} props.text      原始正文
 * @param {boolean} [props.block]  是否按换行切成段落（故事正文=true，标语/简介首句=false）
 * @param {string} [props.className]
 */
export default function RichText({ text, block = true, className = '' }) {
  const lines = useMemo(() => {
    const safe = toSafeHtml(text);
    if (!block) return null;
    return safe.split('\n').map((line) => line.trim());
  }, [text, block]);

  if (!block) {
    return <span className={className} dangerouslySetInnerHTML={{ __html: toSafeHtml(text) }} />;
  }

  return (
    <div className={`rich-body ${className}`}>
      {lines.map((line, i) =>
        line ? (
          // eslint-disable-next-line react/no-array-index-key
          <p key={i} className="rich-line" dangerouslySetInnerHTML={{ __html: line }} />
        ) : (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} className="rich-gap" aria-hidden="true" />
        ),
      )}
    </div>
  );
}
