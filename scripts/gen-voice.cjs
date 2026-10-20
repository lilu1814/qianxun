const fs = require('fs');
const path = require('path');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const src = fs.readFileSync('src/three/ChapterOne.ts', 'utf8');
const re = /this\.ui\.(say|narrate|think)\(\s*(?:'([^']*)'\s*,\s*)?'([^']*)'\s*\)/g;
const lines = [];
const seen = new Set();
let m;
while ((m = re.exec(src))) {
  const kind = m[1];
  const speaker = kind === 'narrate' ? '' : (m[2] || '');
  const text = m[3];
  const key = `${speaker}|${text}`;
  if (seen.has(key)) continue;
  seen.add(key);
  lines.push({ speaker, text });
}

function hash(key) {
  let h = 2166136261;
  for (const b of Buffer.from(key, 'utf8')) {
    h ^= b;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

const voices = {
  '': { voice: 'zh-CN-YunjianNeural', rate: 0.88, pitch: '-5Hz' },
  '千寻': { voice: 'zh-CN-XiaoyiNeural', rate: 1.0, pitch: '+4Hz' },
  '爸爸': { voice: 'zh-CN-YunxiNeural', rate: 0.92, pitch: '-6Hz' },
  '妈妈': { voice: 'zh-CN-XiaoxiaoNeural', rate: 0.94, pitch: '-1Hz' },
  '白龙': { voice: 'zh-CN-YunxiNeural', rate: 0.9, pitch: '-2Hz' },
  '汤婆婆': { voice: 'zh-CN-XiaoxiaoNeural', rate: 0.76, pitch: '-18Hz' },
  '锅炉爷爷': { voice: 'zh-CN-YunjianNeural', rate: 0.8, pitch: '-10Hz' },
  '小玲': { voice: 'zh-CN-XiaoyiNeural', rate: 1.0, pitch: '+2Hz' },
};

(async () => {
  const tts = new MsEdgeTTS();
  let made = 0;
  for (const line of lines) {
    if (!line.speaker) { console.log('skip narrator', line.text.slice(0, 16)); continue; }
    const key = `${line.speaker}|${line.text}`;
    const id = hash(key);
    const out = path.join('public/voice', `${id}.mp3`);
    if (fs.existsSync(out)) { console.log('skip', id, line.text.slice(0, 12)); continue; }
    const cfg = voices[line.speaker] || voices[''];
    await tts.setMetadata(cfg.voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const tmp = fs.mkdtempSync('/tmp/qx-voice-');
    const res = await tts.toFile(tmp, line.text, { rate: cfg.rate, pitch: cfg.pitch });
    fs.copyFileSync(res.audioFilePath, out);
    fs.rmSync(tmp, { recursive: true, force: true });
    made++;
    console.log('made', id, line.speaker || '旁白', line.text.slice(0, 20));
  }
  tts.close();
  console.log('TOTAL', lines.length, 'NEW', made);
})().catch((err) => { console.error(err); process.exit(1); });
