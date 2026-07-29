# 魚機（フィッシュゲーム）開発エキスパート — Kiro Power

[English](README.md) | [繁體中文](README_ZH.md) | [简体中文](README_CN.md) | [日本語](README_JP.md) | [한국어](README_KR.md)

> 言語について：README は 5 言語で提供しています。Steering ファイル（ドメイン知識）は繁体字中国語で記述され、法律・技術用語は原語のまま意図的に保持しています——`電子遊戲場業管理條例 §14`、`Gambling Act 2005 §6`、`N.C. Gen. Stat. §14-306.4`、`GLI-11 v3.0` などの条項番号は原文どおりです。原典を検索し、試験機関と会話するにはこの正確な文字列が必要だからです。Steering ファイルの言語にかかわらず、本 Power はあなたの言語で応答します。

IDE を魚機（捕魚機 / fish shooting game / fish table）開発の専門コンサルタントに変えます。本 Power は法的分類、捕獲判定 RNG、マルチプレイヤー公平性、ペイアウト制御の完全性、認証対応、責任あるゲーミングを、コンセプトから提出審査までカバーします。

## ⛔ 日本の読者への最初のお知らせ

**日本では、遊技場の遊技結果を現金で払い出すことはできません。** 賭博罪の体系がこれを禁じており、遊技場は風俗営業関連法制のもとで公安委員会の許可・監督を受けます。博打の営業免許制度ではありません。

したがって日本市場での魚機は、**兌現層が景品または純粋な娯楽（払い出しなし）でなければ成立しません**。景品の価値上限と交換規範、遊技機の型式に関する事前審査の適用範囲については、本ビルドで一次資料を取得できていないため、市場プロファイルでは信頼度 `MEDIUM` および `UNVERIFIED` として記録し、検証チェックリストを添付しています。**推測値は入れていません。**

日本向けプロジェクトの最初の成果物は、製品仕様ではなく、刑法賭博罪の条文原文・風営法の営業種別要件・景品規範を確認する法的意見です。

## 本 Power の位置づけ

これは**コンプライアンス・アドバイザー**であり、コードジェネレーターではありません。機能を依頼されたとき、まずその機能が対象市場で合法かどうかを伝え、その後に適法な実装方法を示します。

| | Accelerator | 本 Power（Expert） |
|---|---|---|
| 機能を依頼された | そのまま実装する | まずその市場で合法かを問う |
| 数値を尋ねられた | 使える値を返す | 値に**信頼度・法的根拠・検証方法を添えて**返す |
| 成功の姿 | 動くこと | 自分が負っているリスクを把握していること |

すべての規制値には信頼度が付きます：`HIGH`（公式条文から直接読み取り）、`MEDIUM`（権威ある二次資料）、`UNVERIFIED`（**未確認——決して推測しない**）。数値を捏造するアドバイザーは空欄を残すアドバイザーより有害です。空欄は検証を促しますが、誤った数値はそのまま製品仕様に入り込みます。

魚機は `UNVERIFIED` がスロットより多くなります。これは調査不足ではなくドメインの性質です。技術標準の多くはシングルプレイヤー機器向けに書かれており、共有魚池のマルチプレイヤー形態を扱っていません。

## なぜスロット用 Power ではないのか

| 観点 | スロットマシン | 魚機 |
|---|---|---|
| プレイヤー入力 | 単一トリガー（Spin を押す） | 連続操作：照準角度、発射タイミング、砲倍、標的選択、アイテム使用 |
| 結果の単位 | 1 回のスピン | 1 発の弾丸；1 回の捕獲に数十発を要することがある |
| 法的分類 | 明確に偶然のゲーム | 市場により異なる：賭博機器、技能ゲーム、娯楽機器、違法装置 |
| 参加者 | 単独プレイヤー | 4〜10 席が 1 つの魚池を共有し、相互に影響 |
| 状態空間 | リール停止位置の組み合わせ、完全に列挙可能 | 魚の位置・速度・残 HP・アイテム状態、シミュレーションが必要 |
| よくあるレッドライン | クライアント側での結果決定、非暗号論的 RNG | 補償型ペイアウト制御、クライアント側捕獲判定、監査不能なダメージ帰属 |
| RTP の一致性 | 賭け金額間で一致 | **砲倍**間で一致し、かつあらゆる技能水準で成立 |
| 払い出し形態 | 現金 | 現金／チケット／景品／仮想通貨——分類上の帰結が大きく異なる |

## 主な機能

- 🧭 **技能と偶然の分類** — 米国の 3 つの法的テスト（predominant factor、material element、any-chance）、英国のより広い「結果が偶然に影響され得る」ルール、台湾の行政評鑑ルート、技能寄与度の定量的証拠、分類立証ドシエ
- 🌍 **法域コンプライアンス・マトリクス** — 23 市場の法的地位と技術的制約を市場別に整理、各項目に法的根拠と信頼度を付与
- ⛔ **禁止市場レジスター** — 魚機が違法または執行対象として明示されている市場（フロリダ、ノースカロライナ、ハワイ、中国本土、韓国、日本）を明記。認証によって参入が可能になるかのような示唆はしません
- 🎯 **数理モデル** — 魚種配当表、HP と捕獲確率モデル、砲倍マトリクスと砲倍ごとの RTP 一致性、特殊武器と BOSS の RTP 寄与、ボラティリティ調整
- 🔬 **数理検証** — 4 エージェントによる技能水準感度分析を含む 3 層検証、実測 σ から導くモンテカルロ標本数、BOSS と共通ジャックポットの層別抽出、16 節の魚機 PAR sheet 仕様、損失項目の開示
- 🔐 **RNG と捕獲判定** — エンジン別 CSPRNG、1 発ごとの 6 段階ライフサイクル、見落とされやすい乱数消費点としての魚群生成、決定論的リプレイのシード、魚の離脱イベントを含む完全な監査ログ項目
- 🚫 **ペイアウト制御の完全性** — 適法な長期 RTP 設計と違法な補償型制御の境界、3 つの挙動検出テスト、制御を除去した後にビジネスモデルに起こること
- 👥 **マルチプレイヤー公平性** — 共有魚池モデル A/B/C、ダメージ帰属、最終打撃ルール、上限付きロールバックによる遅延補償、席間公平性の検証、共謀検出
- 🖧 **プラットフォームとシステム** — テーブル単位の権威 tick loop、ウォレットの冪等性、静的スピンログに代わる対局リプレイ、クロステーブル・プール制御、監査ログの容量経済学
- 🏭 **筐体ハードウェア** — コイン／紙幣識別機、メダル仕様、チケット払い出し、クレジット投入・払い出しの権限管理、オペレーターメニューの開示、改造検出、必要表示
- 📋 **認証準備** — どの GLI 標準が実際に適用されるか、11 点の提出書類一式、試験機関の選定、書面による技術照会プロセス
- 🛡️ **責任あるゲーミング** — 魚機固有の連続消費リスク、オートファイア制御、砲倍のエスカレーション、セッション制限、発射要求受理前の自己排除
- 🔁 **変更管理** — ビット単位一致のリプレイ比較を測定器とする 5 段階の変更分類、台湾の「新型機種とみなす」ルール
- 🚨 **インシデント対応** — 止血→保全→範囲確定→修正の順序、双方向のマルチシート救済問題
- 🔍 **AML／KYC とデータ保護** — 魚機固有のマネーロンダリング経路である同卓価値移転、1 テーブルのリプレイが最大 8 名のデータ主体を含む事実
- 🎮 **マルチエンジン** — Unity、Cocos Creator、Unreal Engine、Godot、HTML5/PixiJS、エンジン別 CSPRNG 指針

## アーキテクチャ

```
開発者（自然言語）
    → AI レイヤー（意図理解と計画）
        → 魚機開発エキスパート Power（ドメイン知識）
            → まず分類、次にリスクを踏まえた適法な実装

魚機開発エキスパート（インテリジェンス層）
├── POWER.md              → ワークフローと参考文献を定義する主文書
├── steering/             → 16 のドメイン知識ファイル
├── templates/
│   ├── market-profiles/  → 23 市場プロファイル + スキーマ + 禁止市場レジスター
│   ├── certification/    → PAR sheet、RNG 提出パッケージ、分類立証ドシエ、変更申請、GLI チェックリスト
│   ├── advisory/         → ギャップ評価、リスクレジスター、ロードマップ、インシデント報告
│   ├── species-payout/   → 魚種配当表の実例（8 席、96% RTP）
│   └── capture-model/    → 確率的 HP 捕獲モデルの実例
├── hooks/                → IDE 自動化フック
└── tests/                → プロパティベーステスト（fast-check + vitest）
```

## 市場カバレッジ

**規制下または明確なルートがある市場：** 台湾（経済部 電子遊戲場業）、英国（UKGC）、マルタ（MGA）、フィリピン（PAGCOR）、キュラソー（LOK）、ブラジル（SPA）、オンタリオ（AGCO）、デンマーク（Spillemyndigheden）、スウェーデン（Spelinspektionen）、ネバダ、マサチューセッツ、ニュージャージー、ミシガン、米国部族 Class III

**禁止・グレー・移行中として明示：** フロリダ、ノースカロライナ、ハワイ、テキサス、中国本土、韓国、日本、ドイツ、ペンシルベニア

プロファイルの深さは市場により異なります。公式資料に到達できなかった市場は、もっともらしい数値を埋めるのではなく、**`UNVERIFIED` を明示した調査スケルトンと検証チェックリスト**として提供します。台湾が最も深いのは、技術・払い出し制限が非公開のライセンス条件ではなく成文法にあるためであり、またこの製品カテゴリの製造・輸出拠点であるためです。

## 前提条件

- [Kiro IDE](https://kiro.dev/docs/getting-started/installation) がインストール済み
- Node.js 18+（本 Power の開発・テスト用のみ）

## インストール

### ステップ 1 — Kiro に本 Power を追加

Kiro を開く → 左パネルの Powers アイコン → 「+」→ 「Add Custom Power」→ 本プロジェクトのルートディレクトリを選択

### ステップ 2 — 自動ガイダンス Hook のインストール（推奨）

この hook は各質問を適切な Steering File にルーティングし、アドバイザーとしての姿勢を強制します：まず法域**と兌現モデル**を確認し、未確認の規制値を事実として述べず、レッドフラグを能動的に提示します。

```bash
mkdir -p .kiro/hooks

# 現行の agent-hook 形式（v1 スキーマ：version + hooks[] + UserPromptSubmit）
cp hooks/fish-expert-guidance.json .kiro/hooks/

# 旧形式（.kiro.hook を読む旧バージョンの Kiro 向け）
cp hooks/pre-fish-tool.kiro.hook .kiro/hooks/
```

インストールするのはどちらか一方のみです。

### インストールの確認

Kiro に魚機に関する質問を入力してください（例：「96% RTP、中ボラティリティの 8 席魚機の数理モデルを設計して」）。AI がすぐに配当表を出す代わりに、**まず対象市場と兌現モデルを尋ねてきたら**、正しく動作しています。

## 使い方

| 領域 | 質問例 |
|---|---|
| 分類 | 「この魚機は技能ゲームですか？」「テキサスで販売できますか？」「技能寄与度をどう立証しますか？」 |
| 数理モデル | 「96% RTP の魚種配当表を設計して」「なぜ最高砲倍の RTP が低いのですか？」「レーザー砲の RTP 寄与を計算して」 |
| RNG | 「Unity の捕獲判定で CSPRNG をどう実装しますか？」「監査ログに必要な項目は？」「6 段階の弾丸ライフサイクルとは？」 |
| ペイアウト制御 | 「当社の確率制御プログラムは審査を通りますか？」「レガシーコードから補償型制御をどう検出しますか？」 |
| マルチプレイヤー | 「8 席のダメージ帰属はどう設計すべきですか？」「遅延補償を公平にするには？」「席間のチップダンピングをどう検出しますか？」 |
| 認証 | 「オンライン魚機にはどの GLI 標準が適用されますか？」「提出書類は何が必要ですか？」「台湾の評鑑分類には何が必要ですか？」 |

## 対応ゲームエンジン

| エンジン | 言語 | CSPRNG |
|---|---|---|
| Unity | C# | `System.Security.Cryptography.RandomNumberGenerator` |
| Cocos Creator | TypeScript | Web Crypto API / Node.js `crypto` |
| Unreal Engine | C++/Blueprint | OpenSSL `RAND_bytes` |
| Godot | GDScript/C# | `Crypto` クラス |
| HTML5/PixiJS | JS/TS | Web Crypto API（`crypto.getRandomValues`） |

いずれの場合も捕獲判定はサーバー側で行います。クライアント側 RNG は視覚的な揺らぎなど、結果に関与しない用途にのみ許容されます。

## 開発

```bash
npm install
npm test              # すべてのテストを実行
npx tsc --noEmit      # TypeScript 型チェック
```

## 公式リファレンス

| 出典 | URL |
|---|---|
| 電子遊戲場業管理條例（台湾） | https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0080024 |
| UKGC Skill with prizes (SWPs) | https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/skill-with-prizes-swps |
| UKGC Gaming machine categories | https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/gaming-machine-categories |
| Gambling Act 2005 §6 | https://www.legislation.gov.uk/ukpga/2005/19/section/6 |
| Gift Surplus v. State ex rel. Cooper（NC 2022） | https://www.nccourts.gov/documents/appellate-court-opinions/gift-surplus-llc-v-state-ex-rel-cooper |
| Hawaii SB3281 SD1（2026） | https://data.capitol.hawaii.gov/sessions/session2026/Bills/SB3281_SD1_.HTM |
| Florida Gaming Control Commission | https://flgaming.gov |
| GLI Standards（GLI-11／GLI-19） | https://gaminglabs.com/gli-standards/ |
| GLI-11 Gaming Devices v3.0 | https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-Gaming-Devices-V3-0.pdf |
| Arizona Tribal Compact Appendix A | https://gaming.az.gov/sites/default/files/Appendix%20A%20-%20Generic_1.pdf |
| NIGC 25 CFR Part 547 | https://www.ecfr.gov/current/title-25/chapter-III/subchapter-D/part-547 |
| Nevada Regulation 14 | https://gaming.nv.gov |
| Massachusetts 205 CMR 143 | https://www.mass.gov/doc/205-cmr-143-gaming-devices-and-electronic-gaming-equipment/download |
| AGCO Registrar's Standards | https://www.agco.ca/en/lottery-and-gaming/guides/registrars-standards-internet-gaming |
| デンマーク認証プログラム SCP.00–SCP.07 | https://spillemyndigheden.dk/en-us/businesses-and-associations/games-which-require-a-licence/online-casino/certification-programme-for-online-casino |
| NIST SP 800-90A Rev.1 | https://csrc.nist.gov/pubs/sp/800/90/a/r1/final |
| NIST SP 800-90C | https://csrc.nist.gov/pubs/sp/800/90/c/final |
| NIST の SP 800-22 改訂決定 | https://csrc.nist.gov/News/2022/decision-to-revise-nist-sp-800-22-rev-1a |
| W3C Web Crypto API | https://www.w3.org/TR/WebCryptoAPI/ |
| BMM Testlabs | https://bmm.com/ |
| iTech Labs | https://itechlabs.com/ |
| eCOGRA | https://ecogra.org/ecogra-certification/ |
| GamStop（英国） | https://www.gamstop.co.uk/ |
| Spelpaus（スウェーデン） | https://www.spelpaus.se/ |

完全なリストは POWER.md を参照してください。

### 知っておくべき 3 つの訂正

1. **「技能要素があるから賭博ではない」は通りません。** *Gift Surplus, LLC v. State ex rel. Cooper*（NC 2022）では、技能操作を中心に設計された機器が、偶然が優越するとして偶然のゲームと判断されました。しかもそれは米国の 3 つのテストのうち**供給者に最も有利な**テストのもとでの結論です。英国ではさらに早く破綻します：結果が偶然に影響され*得る*だけで game of chance であり、技能が偶然を上回るか、偶然を排除できるかは判断に影響しません。

2. **台湾の輸出免除は、輸出先について何も述べていません。** 電子遊戲場業管理條例 §6 は**専ら輸出向け**の製造を台湾の評鑑分類義務から免除しますが、その機器が到着先で合法かどうかには一切触れていません。輸出プロジェクトが失敗する最大の原因であり、本 Power が最も頻繁に訂正する誤読です。

3. **NIST 自身の立場は、SP 800-22 を暗号論的 RNG の評価に用いるべきではないというもの**ですが、依然としてゲーミング RNG のコンプライアンス根拠として広く引用されています。本 Power はこの齟齬を追認せず、明示します。

さらに本 Power は、**GLI と iTech Labs が 2023 年 5 月以降同一企業グループである**ことを開示します。市場や契約が試験機関の独立性を要求する場合に重要です。

## トラブルシューティング

| 症状 | 対処 |
|---|---|
| AI がエキスパートとして応答しない | hook が `.kiro/hooks/` にコピーされているか確認。`pre-fish-tool.kiro.hook` が発火しない場合、ご利用の Kiro は v1 スキーマを期待している可能性があるため `fish-expert-guidance.json` を使用 |
| AI が答えずに市場を聞き返してくる | 意図した動作です。魚機の答えは市場依存のため、市場と兌現モデルを伝えれば続行します |
| テストが失敗する | `npm install` を実行後、`npm test` を再試行 |
| TypeScript の型エラー | `npm install` 後に `npx tsc --noEmit` を実行 |

## セキュリティ

セキュリティ問題の報告方法は [CONTRIBUTING.md](CONTRIBUTING.md#security-issue-notifications) を参照してください。

## ライセンス

MIT License。[LICENSE](LICENSE) を参照してください。
