/**
 * Runtime text configuration.
 *
 * Edit public/config/text.json and refresh the page. The file can override
 * Japanese and Chinese text for dialogue, narration and interface strings.
 * `mode` may be "both", "ja", or "zh".
 */
export interface TextEntry {
  ja: string;
  zh: string;
  sourceZh?: string;
  speaker?: string;
  speakerZh?: string;
}

export interface TextConfig {
  mode?: 'both' | 'ja' | 'zh';
  dialogue?: Record<string, TextEntry>;
  ui?: Record<string, TextEntry>;
}

type Mode = 'both' | 'ja' | 'zh';

let config: TextConfig = {};
let mode: Mode = 'both';
let dialogueMap = new Map<string, TextEntry>();
let uiMap = new Map<string, TextEntry>();
let byJa = new Map<string, TextEntry>();
let byZh = new Map<string, TextEntry>();
let observer: MutationObserver | null = null;
let scheduled = false;
let applying = false;
const localizedZh = new WeakSet<Text>();

function normalizeEntry(entry: Partial<TextEntry> | undefined): TextEntry | null {
  if (!entry) return null;
  const ja = typeof entry.ja === 'string' ? entry.ja : '';
  const zh = typeof entry.zh === 'string' ? entry.zh : '';
  if (!ja && !zh) return null;
  return {
    ja: ja || zh,
    zh: zh || ja,
    sourceZh: typeof entry.sourceZh === 'string' ? entry.sourceZh : zh,
    speaker: typeof entry.speaker === 'string' ? entry.speaker : undefined,
    speakerZh: typeof entry.speakerZh === 'string' ? entry.speakerZh : undefined,
  };
}

function index(): void {
  dialogueMap = new Map();
  uiMap = new Map();
  byJa = new Map();
  byZh = new Map();
  const add = (map: Map<string, TextEntry>, entry: TextEntry) => {
    if (entry.ja) map.set(entry.ja, entry);
    if (entry.sourceZh) map.set(entry.sourceZh, entry);
  };
  Object.entries(config.dialogue ?? {}).forEach(([key, raw]) => {
    const entry = normalizeEntry(raw);
    if (!entry) return;
    dialogueMap.set(key, entry);
    byJa.set(key, entry);
    if (entry.sourceZh) byZh.set(entry.sourceZh, entry);
  });
  Object.entries(config.ui ?? {}).forEach(([key, raw]) => {
    const entry = normalizeEntry(raw);
    if (!entry) return;
    uiMap.set(key, entry);
    byJa.set(key, entry);
    if (entry.sourceZh) byZh.set(entry.sourceZh, entry);
  });
  mode = config.mode === 'ja' || config.mode === 'zh' ? config.mode : 'both';
}

export async function loadTextConfig(): Promise<void> {
  try {
    const response = await fetch('config/text.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`text config ${response.status}`);
    config = (await response.json()) as TextConfig;
  } catch (error) {
    console.warn('Text config unavailable; using built-in text.', error);
    config = {};
  }
  index();
}

export function getMode(): Mode {
  return mode;
}

export function getDialogue(key: string): TextEntry | undefined {
  return dialogueMap.get(key);
}

export function getUi(key: string): TextEntry | undefined {
  return uiMap.get(key) ?? dialogueMap.get(key);
}

export function getUiText(key: string, fallbackJa: string, fallbackZh = ''): { ja: string; zh: string } {
  const entry = getUi(key);
  return {
    ja: entry?.ja ?? fallbackJa,
    zh: entry?.zh ?? fallbackZh,
  };
}

function rewriteNode(node: Text): boolean {
  if (localizedZh.has(node)) return false;
  const raw = node.nodeValue;
  if (!raw) return false;
  const trimmed = raw.trim();
  if (!trimmed) return false;
  const jaEntry = byJa.get(trimmed);
  const zhEntry = jaEntry ? null : byZh.get(trimmed);
  const entry = jaEntry ?? zhEntry;
  if (!entry) return false;
  let next: string;
  if (mode === 'zh') {
    next = zhEntry ? '' : entry.zh;
  } else if (mode === 'ja') {
    next = zhEntry ? '' : entry.ja;
  } else {
    next = zhEntry ? entry.zh : entry.ja;
  }
  if (next === trimmed) return false;
  if (mode === 'zh' && jaEntry) localizedZh.add(node);
  const offset = raw.indexOf(trimmed);
  node.nodeValue = raw.slice(0, offset) + next + raw.slice(offset + trimmed.length);
  return true;
}

function shouldSkip(node: Text): boolean {
  const parent = node.parentElement;
  if (!parent) return true;
  if (parent.closest('script, style, textarea')) return true;
  // Dialogue text is rendered directly from the config by StoryUI; avoid
  // fighting the typewriter animation and its secondary translation line.
  if (parent.closest('#dialogue-text, #dialogue-translation, #speaker-name, #speaker-zh')) return true;
  return false;
}

export function applyTextConfig(root: ParentNode = document.getElementById('stage') ?? document.body): void {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const text = node as Text;
    if (!shouldSkip(text)) rewriteNode(text);
    node = walker.nextNode();
  }
}

function hasRelevantMutation(mutations: MutationRecord[]): boolean {
  return mutations.some((mutation) => {
    const target = mutation.target;
    const element = target.nodeType === Node.TEXT_NODE ? (target.parentElement as Element | null) : (target as Element);
    return !element?.closest('#dialogue-text, #dialogue-translation, #speaker-name, #speaker-zh');
  });
}

export function observeTextConfig(root: HTMLElement | null = document.getElementById('stage')): void {
  if (!root) return;
  observer?.disconnect();
  const run = () => {
    scheduled = false;
    applying = true;
    applyTextConfig(root);
    applying = false;
  };
  observer = new MutationObserver((mutations) => {
    if (applying || scheduled) return;
    if (!hasRelevantMutation(mutations)) return;
    scheduled = true;
    requestAnimationFrame(run);
  });
  observer.observe(root, { subtree: true, childList: true, characterData: true });
}
