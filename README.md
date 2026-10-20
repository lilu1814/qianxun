# 神隠し · 千と千尋の神隠し 3D

『千と千尋の神隠し』を題材にした、非商業の同人 3D インタラクティブストーリー。

第一章「トンネル」、第二章「契約」を収録。Three.js によるローポリの 3D シーン、三人称視点、日中点景から夜への遷移、湯屋の長橋、ボイラー室、湯婆婆の部屋、契約の名場面をプレイできます。

> 非公式のファンメイド作品です。原作・映像・キャラクターの権利は各有権者に帰属します。

## 起動

```bash
pnpm install
pnpm dev
```

Open http://127.0.0.1:4173/

Build:

```bash
pnpm build
pnpm preview
```

## 操作

- `A / D`：旋回
- `W / S`：前進 / 後退
- マウス：視点（画面クリックで固定、`Esc` で解除）
- `Shift`：速く歩く
- `Space` / `Enter`：会話を進める
- `E`：調べる / 長橋で息を止める
- ホイール：ズーム

## テキスト設定

`public/config/text.json` で、対話・ナレーション・UI テキストの日本語／中国語を実行時に上書きできます。

- `mode`: `both` / `ja` / `zh`
- `dialogue`: 対話・ナレーション
- `ui`: メニュー、HUD、目標、手記、章カード、エンディングなど

詳しくは `public/config/README.md` を参照してください。

## 主な構成

- `src/three/ChapterOne.ts`：章の進行、カメラ、入力、カットシーン
- `src/three/world.ts`：フィールド、トンネル、草原、旧市街、湯屋、ボイラー室、社長室
- `src/three/ui.ts`：対話、字幕、HUD、章カード
- `src/textConfig.ts`：実行時テキスト設定エンジン
- `src/audio.ts`：BGM / 環境音
- `public/models/chihiro_compact.glb`：実行時キャラクターモデル
- `public/config/text.json`：日中各テキスト設定

## Note

- 対話音声は現在無効です（BGM のみ）。
- `blender/source/` の大容量元モデルはリポジトリに含めていません。実行用モデルは `public/models/` にあります。
