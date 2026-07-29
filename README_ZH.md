# 魚機開發專家 — Kiro Power

[English](README.md) | [繁體中文](README_ZH.md) | [简体中文](README_CN.md) | [日本語](README_JP.md) | [한국어](README_KR.md)

> 語言說明：README 提供 5 種語言。Steering 檔案（領域知識）以繁體中文撰寫，並刻意保留英文與原文的法律及技術術語——`電子遊戲場業管理條例 §14`、`Gambling Act 2005 §6`、`N.C. Gen. Stat. §14-306.4`、`GLI-11 v3.0` 等條號一律照原文保留，因為您需要這些精確字串才能回頭調閱法源，也才能與測試實驗室溝通。無論 steering 檔案使用哪種語言，本 Power 都會以您的語言回應。

把您的 IDE 變成魚機（捕魚機 / fish shooting game / fish table）開發的專業顧問。本 Power 涵蓋法律分類、捕獲判定 RNG、多人同桌公平性、派彩控制完整性、認證合規與負責任遊戲，從概念到送測的完整開發週期。

> 核心概念：
>
> • **一發子彈是原子投注單位。** 一次捕獲可能消耗數十發，因此幾乎所有以「一次遊戲」表述的監管規則，都需要先明確對應才能適用
> • **技術性與機率性分類**決定這台機器是需牌照的賭博機具、合法娛樂機具，還是查扣即刑事案件的違法裝置——而答案依市場而異
> • **補償式派彩控制**（控分／場控／保底／記血）是送測失敗最常見的單一原因。它是架構違規，不是可以調整的參數
> • **共享魚池**使一個座位的期望值依賴同桌組成，這在老虎機領域沒有對應物
> • **魚機的 RTP 是策略相依區間**，不是單一數字

## 本 Power 的定位

這是一個**合規顧問**，不是程式碼產生器。當您要求一個功能時，它會先告訴您該功能在目標市場是否合法，再給您合規的實作方式。

這個定位決定了每一個回答的形狀：

| | Accelerator | 本 Power（Expert） |
|---|---|---|
| 被要求做一個功能 | 直接實作 | 先問這個功能在您的市場是否合法 |
| 被問一個數字 | 給一個可用的值 | 給值**加上信心等級、法律來源，以及如何查證** |
| 成功的樣子 | 它能運作 | 您知道自己承擔了什麼風險 |

每一個監管數值都標註信心等級：`HIGH`（直接讀自官方法規本文）、`MEDIUM`（權威次級來源）、`UNVERIFIED`（**未經確認——絕不推測**）。一個會編造數字的合規顧問比留白的更糟，因為留白會觸發查證，而錯誤的數字會直接寫進產品規格。

魚機的 `UNVERIFIED` 比老虎機多，這是領域性質而非研究不足：多數技術標準是為單人機具撰寫的，根本沒有處理多人共享魚池的形態。

## 為什麼這不是老虎機 Power

| 面向 | 老虎機 | 魚機 |
|---|---|---|
| 玩家輸入 | 單一觸發（按下 Spin） | 連續操作：瞄準角度、發射時機、砲倍、目標選擇、道具使用 |
| 結果單位 | 一次旋轉 | 一發子彈；一次捕獲可能需要數十發 |
| 法律分類 | 明確為機率遊戲 | 依市場而定：賭博機具、技術遊戲、娛樂機具或違法裝置 |
| 參與者 | 單一玩家 | 4–10 座位共享魚池，彼此互相影響 |
| 狀態空間 | 捲軸位置組合，可完全列舉 | 魚的位置、速度、剩餘生命值、道具狀態，須模擬而非列舉 |
| 常見紅線 | 客戶端決定結果、非密碼學 RNG | 補償式控分、客戶端命中判定、傷害歸屬不可稽核 |
| RTP 一致性 | 各投注額一致 | 各**砲倍**一致，且需在各技術水準下都成立 |
| 兌現形式 | 現金 | 現金／彩票／獎品／虛擬幣，分類後果差異極大 |

## 功能

- 🧭 **技術性與機率性分類** — 美國三種法律測試（predominant factor、material element、any-chance）、英國更寬廣的「結果可被機率影響」規則、台灣的行政評鑑路徑、技術貢獻度量化證據與分類舉證卷宗
- 🌍 **司法管轄區合規矩陣** — 23 個市場的逐市場法律地位與技術約束，每項均附法源引用與信心等級
- ⛔ **禁止市場登記冊** — 明確標示魚機違法或已被列為執法目標的市場（佛羅里達、北卡羅來納、夏威夷、中國大陸、南韓、日本），而不是暗示認證可以使進入變得可能
- 🎯 **數學模型** — 魚種賠率表、生命值與捕獲機率模型、砲倍矩陣與各砲倍 RTP 一致性、特殊武器與 BOSS 的 RTP 貢獻、波動性調校
- 🔬 **數學驗證** — 三層驗證含四代理人技術水準敏感度分析、由實測 σ 反推的蒙地卡羅樣本量、BOSS 與獎池的分層抽樣、16 節魚機 PAR sheet 規格、損失項揭露
- 🔐 **RNG 與捕獲判定** — 各引擎的 CSPRNG、每發子彈的六階段生命週期、魚群生成這個最常被遺漏的隨機數消耗點、確定性重播種子、含魚離場事件的完整稽核欄位集
- 🚫 **派彩控制完整性** — 合規的長期 RTP 設計與違規的補償式控分之間的界線、三項行為偵測測試，以及移除控分後商業模型會發生什麼事
- 👥 **多人同桌公平性** — 共享魚池模型 A/B/C、傷害歸屬、最後一擊規則、有界回溯的延遲補償、座位公平性驗證、共謀偵測
- 🖧 **平台與系統** — 每桌權威 tick loop、錢包幂等性、取代靜態 spin log 的對局重播、跨桌獎池控制器、稽核日誌的資料量經濟學
- 🏭 **機台硬體** — 投幣器與鈔票器、代幣規格、彩票出票、上下分授權、後台選單揭露、竄改偵測、必要標示
- 📋 **認證準備** — 究竟適用哪一份 GLI 標準、11 份送測文件集、實驗室選擇、書面技術問答流程
- 🛡️ **負責任遊戲** — 魚機獨有的連續投入風險、自動發射管控、砲倍升級、會話限制、在發射請求受理前執行的自我排除
- 🔁 **變更管理** — 以逐位元重播比對作為量測儀器的五級變更分類框架，以及台灣的「視為新型機種」規則
- 🚨 **事故處理** — 止血→保全→界定→修復的順序，以及雙向的多座位補救問題
- 🔍 **AML／KYC 與資料保護** — 同桌價值轉移這個魚機獨有的洗錢管道，以及一張桌的重播涵蓋最多 8 名資料主體的事實
- 🎮 **多引擎支援** — Unity、Cocos Creator、Unreal Engine、Godot、HTML5/PixiJS，附各引擎的 CSPRNG 指引

## 架構

```
開發者（自然語言）
    → AI 層（意圖理解與規劃）
        → 魚機開發專家 Power（領域知識）
            → 先分類，再做風險知情的合規實作

魚機開發專家（智慧層）
├── POWER.md              → 定義工作流程與參考資料的主文件
├── steering/             → 16 份領域知識檔案
│   ├── skill-chance-classification.md    → 法律分類（第一個問題）
│   ├── jurisdiction-matrix.md            → 跨市場約束
│   ├── advisory-engagement.md            → 顧問流程與四方責任邊界
│   ├── math-model.md                     → 魚種表、捕獲模型、砲倍
│   ├── math-verification.md              → 三層驗證與 PAR sheet
│   ├── rng-capture-determination.md      → CSPRNG 與每發子彈生命週期
│   ├── payout-control-integrity.md       → 控分紅線
│   ├── multiplayer-fairness.md           → 共享魚池、傷害歸屬
│   ├── platform-systems-compliance.md    → 伺服器權威、重播、獎池
│   ├── cabinet-hardware-compliance.md    → 金流裝置、代幣、彩票
│   ├── certification-prep.md             → 標準選擇與送測
│   ├── responsible-gaming.md             → 連續投入、自動發射
│   ├── change-management-recert.md       → 變更分級與重新認證
│   ├── incident-malfunction-handling.md  → 多座位補救
│   ├── aml-kyc-player-account.md         → 同桌價值轉移
│   └── data-protection-privacy.md        → 重播資料的保存與刪除衝突
├── templates/
│   ├── market-profiles/  → 23 個市場檔案 + schema + 禁止市場登記冊
│   ├── certification/    → PAR sheet、RNG 提交包、分類舉證卷宗、變更請求、GLI 檢查清單
│   ├── advisory/         → 落差評估、風險登記冊、路線圖、事故報告
│   ├── species-payout/   → 魚種賠率表工作範例（8 座位、96% RTP）
│   └── capture-model/    → 隨機傷害生命值扣減捕獲模型工作範例
├── hooks/                → IDE 自動化 hook
└── tests/                → 屬性測試（fast-check + vitest）
```

## 市場涵蓋

**受監管或有明確途徑：** 台灣（經濟部 電子遊戲場業）、英國（UKGC）、馬爾他（MGA）、菲律賓（PAGCOR）、古拉索（LOK）、巴西（SPA）、安大略（AGCO）、丹麥（Spillemyndigheden）、瑞典（Spelinspektionen）、內華達、麻州、新澤西、密西根、美國部落 Class III

**標示為禁止、灰區或過渡中：** 佛羅里達、北卡羅來納、夏威夷、德州、中國大陸、南韓、日本、德國、賓州

各檔案深度不同。無法取得官方來源的市場以**明確標註 `UNVERIFIED` 的研究骨架與查證清單**交付，而不是填入看起來合理的數字。台灣是最深入的檔案，因為它的技術與兌現限制寫在成文法而非不公開的牌照條件中，也因為它是這類產品的製造與出口重鎮。

## 前置需求

- 已安裝 [Kiro IDE](https://kiro.dev/docs/getting-started/installation)
- Node.js 18+（僅用於本 Power 的開發與測試）

## 安裝

### 步驟 1 — 在 Kiro 中安裝本 Power

開啟 Kiro → 左側面板點擊 Powers 圖示 → 點擊「+」→ 選擇「Add Custom Power」→ 選擇本專案根目錄

### 步驟 2 — 安裝自動引導 Hook（建議）

此 hook 會把每個問題導向正確的 Steering File，並強制顧問姿態：先確認司法管轄區**與兌現模式**、絕不把未經確認的監管數值當作事實陳述、主動提出紅旗。

提供兩種格式，依您的 Kiro 版本選用其一：

```bash
mkdir -p .kiro/hooks

# 現行 agent-hook 格式（v1 schema：version + hooks[] + UserPromptSubmit）
cp hooks/fish-expert-guidance.json .kiro/hooks/

# 舊格式，適用於讀取 .kiro.hook 的舊版 Kiro
cp hooks/pre-fish-tool.kiro.hook .kiro/hooks/
```

只安裝一個。若不確定，先用 `fish-expert-guidance.json` 並確認 Power 是否自動啟動。

沒有 hook 時，您可能需要手動提醒 AI 使用專家知識。

### 驗證安裝

在 Kiro 輸入任何魚機問題（例如「設計一個 96% RTP 中波動 8 人桌魚機數學模型」）。若 AI 先詢問您的目標市場與兌現模式，而不是立刻產出賠率表，安裝就是正確的。

## 使用方式

安裝後直接以自然語言與 Kiro 對話。AI 會自動啟動 Power、載入相關 Steering File，並以魚機開發專家的身分回應。

### 可以問什麼？

| 領域 | 範例問題 |
|---|---|
| 分類 | 「我們的魚機算技術遊戲嗎？」「這台能賣到德州嗎？」「怎麼證明技術貢獻度？」 |
| 數學模型 | 「設計 96% RTP 的魚種賠率表」「為什麼最高砲倍的 RTP 較低？」「計算雷射砲的 RTP 貢獻」 |
| RNG | 「Unity 的捕獲判定怎麼用 CSPRNG？」「稽核日誌要記哪些欄位？」「六階段子彈生命週期是什麼？」 |
| 派彩控制 | 「我們的機率控制程式能不能送測？」「怎麼在舊程式碼裡找出補償式控分？」 |
| 多人同桌 | 「8 個座位的傷害歸屬該怎麼設計？」「延遲補償怎麼做才公平？」「怎麼偵測座位間對打洗分？」 |
| 認證 | 「線上魚機適用哪一份 GLI 標準？」「送測要準備哪些文件？」「台灣的評鑑分類要什麼？」 |

### 範例流程：把一台魚機從概念帶到送測

```
1. 「我要做一台 8 人桌魚機，台灣內銷、彩票兌換。我們該從哪裡開始？」

2. 「設計中波動、目標 96% RTP 的魚種賠率表，並符合 NT$2,000 兌換上限。」

3. 「建立捕獲機率模型，並證明各砲倍 RTP 一致。」

4. 「我們舊機台的後台選單有一個回收率設定。
    怎麼判斷它是不是補償式控分？」

5. 「設計傷害歸屬與最後一擊規則，並告訴我哪些必須向玩家揭露。」

6. 「執行技術水準敏感度分析，並產出 PAR sheet 各節。」

7. 「台灣的評鑑分類送審需要什麼，時程多久？」
```

## 支援的遊戲引擎

| 引擎 | 語言 | CSPRNG |
|---|---|---|
| Unity | C# | `System.Security.Cryptography.RandomNumberGenerator` |
| Cocos Creator | TypeScript | Web Crypto API / Node.js `crypto` |
| Unreal Engine | C++/Blueprint | OpenSSL `RAND_bytes` |
| Godot | GDScript/C# | `Crypto` 類別 |
| HTML5/PixiJS | JS/TS | Web Crypto API（`crypto.getRandomValues`） |

所有情況下捕獲判定都應在伺服器端。客戶端 RNG 僅可用於非結果性用途，例如視覺抖動。

## 開發

```bash
npm install
npm test              # 執行全部測試
npx tsc --noEmit      # TypeScript 型別檢查
```

## 官方參考資料

本 Power 的領域知識全部來自經查證的官方文件：

| 來源 | URL | 領域 |
|---|---|---|
| 電子遊戲場業管理條例（台灣） | https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0080024 | 分類、獎品上限、變更管理 |
| UKGC Skill with prizes (SWPs) | https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/skill-with-prizes-swps | 英國技術與機率界線 |
| UKGC Gaming machine categories | https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/gaming-machine-categories | 投注與獎金上限 |
| Gambling Act 2005 §6 | https://www.legislation.gov.uk/ukpga/2005/19/section/6 | game of chance 定義 |
| Gift Surplus v. State ex rel. Cooper（北卡 2022） | https://www.nccourts.gov/documents/appellate-court-opinions/gift-surplus-llc-v-state-ex-rel-cooper | 優勢因素測試之適用 |
| Hawaii SB3281 SD1（2026） | https://data.capitol.hawaii.gov/sessions/session2026/Bills/SB3281_SD1_.HTM | 立法理由指名 fish games |
| Florida Gaming Control Commission | https://flgaming.gov | fish table 執法 |
| GLI Standards（GLI-11／GLI-19） | https://gaminglabs.com/gli-standards/ | 認證標準 |
| GLI-11 Gaming Devices v3.0 | https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-Gaming-Devices-V3-0.pdf | 機具標準、遊戲獨立性 |
| Arizona Tribal Compact Appendix A | https://gaming.az.gov/sites/default/files/Appendix%20A%20-%20Generic_1.pdf | 設備與 GLI 標準對應 |
| NIGC 25 CFR Part 547 | https://www.ecfr.gov/current/title-25/chapter-III/subchapter-D/part-547 | Class II 標準；Class III 無聯邦標準 |
| Nevada Regulation 14 | https://gaming.nv.gov | 機具核准 |
| Massachusetts 205 CMR 143 | https://www.mass.gov/doc/205-cmr-143-gaming-devices-and-electronic-gaming-equipment/download | 非現金獎品計價 |
| AGCO Registrar's Standards | https://www.agco.ca/en/lottery-and-gaming/guides/registrars-standards-internet-gaming | 安大略線上標準 |
| 丹麥認證方案 | https://spillemyndigheden.dk/en-us/businesses-and-associations/games-which-require-a-licence/online-casino/certification-programme-for-online-casino | SCP.00–SCP.07 |
| NIST SP 800-90A Rev.1 | https://csrc.nist.gov/pubs/sp/800/90/a/r1/final | DRBG 標準 |
| NIST SP 800-90C | https://csrc.nist.gov/pubs/sp/800/90/c/final | RBG 建構（2025-09 最終版） |
| NIST 改版 SP 800-22 之決定 | https://csrc.nist.gov/News/2022/decision-to-revise-nist-sp-800-22-rev-1a | ⚠️ 拒絕用於評估密碼學 RNG |
| W3C Web Crypto API | https://www.w3.org/TR/WebCryptoAPI/ | 瀏覽器 CSPRNG |
| BMM Testlabs | https://bmm.com/ | 測試實驗室 |
| iTech Labs | https://itechlabs.com/ | 測試實驗室 |
| eCOGRA | https://ecogra.org/ecogra-certification/ | 測試實驗室 |
| GamStop（英國） | https://www.gamstop.co.uk/ | 自我排除 |
| Spelpaus（瑞典） | https://www.spelpaus.se/ | 自我排除 |

完整參考清單見 POWER.md。

### 三個值得知道的糾正

本 Power 的研究過程發現三個在魚機產業廣泛流傳、但一接觸一手來源就站不住腳的說法：

1. **「我們的遊戲有技術成分，所以不是賭博。」** 在 *Gift Surplus, LLC v. State ex rel. Cooper*（北卡 2022）中，一款以技術操作為核心的機台仍被認定為機率遊戲，因為機率成分優於技術成分——而那是美國三種測試中**對供應商最有利**的一種。在英國這個論點失敗得更快：只要結果*可以*被機率影響即為 game of chance，技術是否勝過機率、能否消除機率，均不影響認定。

2. **台灣的出口豁免不是對目的地的陳述。** 電子遊戲場業管理條例 §6 對**專供出口**的製造免除台灣的評鑑分類義務，但它完全沒有說機器在落地市場是否合法。這是多數出口專案失敗的原因，也是本 Power 最常需要糾正的單一誤讀。

3. **NIST 自身的立場是 SP 800-22 不應用於評估密碼學 RNG**，但它仍被普遍引用為博彩 RNG 的合規基礎。本 Power 主動指出這個落差，而不是沿用。

本 Power 另揭露 **GLI 與 iTech Labs 自 2023 年 5 月起同屬一個集團**，這在市場或合約要求實驗室獨立性時具關鍵意義。

## 疑難排解

| 問題 | 解法 |
|---|---|
| AI 沒有以專家身分回應 | 確認 hook 已複製到 `.kiro/hooks/`。若 `pre-fish-tool.kiro.hook` 沒有觸發，您的 Kiro 版本可能需要 v1 schema，請改用 `fish-expert-guidance.json` |
| AI 一直反問我市場而不回答 | 這是預期行為。魚機的答案依市場而定；提供市場與兌現模式後它就會繼續 |
| 測試失敗 | 先執行 `npm install` 再重試 `npm test` |
| TypeScript 型別錯誤 | 執行 `npm install` 後再跑 `npx tsc --noEmit` |

## 安全性

安全問題回報方式見 [CONTRIBUTING.md](CONTRIBUTING.md#security-issue-notifications)。

## 授權

MIT License。詳見 [LICENSE](LICENSE)。
