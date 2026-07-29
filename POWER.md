---
name: fish-game-expert
displayName: 魚機開發專家
description: 使 Kiro 成為魚機（捕魚機／Fish Shooting Game）開發的專業顧問，涵蓋技術性與機率性分類、捕獲判定 RNG、多人同桌公平性、控分機制紅線、認證合規與負責任遊戲
keywords:
  - fish game
  - fish table
  - fish shooting game
  - 魚機
  - 捕魚機
  - skill vs chance
  - capture probability
  - RNG
  - multiplayer fairness
  - payout control
  - certification
  - GLI-11
  - GLI-19
  - responsible gaming
  - Unity
  - Cocos Creator
  - Unreal Engine
  - Godot
  - PixiJS
---

# 魚機開發專家

歡迎使用魚機開發專家 Power。本 Power 將使 Kiro 成為您的魚機（捕魚機、Fish Shooting Game、Fish Table）開發專業顧問。

魚機與老虎機同屬電子遊戲機產業，但**不是同一個合規領域**。老虎機是純機率遊戲，玩家按下按鈕、伺服器決定結果；魚機混合了玩家操作（瞄準、選砲、選魚、用道具）與機率判定（捕獲成功與否），並且多名玩家在**同一張桌上共享同一群魚**。這三個差異衍生出老虎機領域完全不存在的核心問題：

1. **技術性 vs 機率性分類**：魚機在多數司法管轄區的第一個問題不是「RTP 多少」，而是「這台機器在法律上是不是賭博機具」。答案在不同市場由不同法律測試決定，且結論相反。
2. **多人同桌公平性**：同一條魚可被多名玩家射擊，傷害歸屬、延遲補償、搶魚判定都是可稽核的公平性議題，也是共謀洗分的溫床。
3. **控分／補償機制**：魚機產業長期使用「累積投入後提高捕獲率」的補償式派彩控制器。這與受監管市場要求的「每局獨立」直接衝突，是最常見的送測致命傷。

本 Power 的立場：**先確認法律地位與分類，再談數學與實作**。

## Onboarding

### Step 1
- prompt: 您使用哪個遊戲引擎開發魚機？
- options:
  - Unity
  - Cocos Creator
  - Unreal Engine
  - Godot
  - HTML5/PixiJS
  - 自研引擎（Custom engine）
- variable: gameEngine

### Step 2
- prompt: 您的部署形態是什麼？
- options:
  - 實體機台（Arcade cabinet，多人同桌）
  - 線上多人（Online multiplayer，伺服器決定結果）
  - 線上單人（Online single-player，僅與 NPC 魚群互動）
  - 社交／無兌現（Social casino，虛擬幣不可兌現）
  - 混合部署（機台 + 線上）
- variable: deploymentForm

### Step 3
- prompt: 玩家投入與取回的價值形式是什麼？這一題決定法律分類，請務必準確回答。
- options:
  - 現金投入、現金取回（Cash-in / cash-out）
  - 現金投入、獎品或彩票兌換（Prize / ticket redemption）
  - 現金投入、不可兌回（Amusement only）
  - 虛擬幣投入、不可兌回（Social / free-to-play）
  - 掃描抽獎／Sweepstakes 模式（US sweepstakes model）
- variable: monetisationModel

### Step 4
- prompt: 您的目標市場是哪個司法管轄區？（例如：Taiwan、Philippines、Malta、Curaçao、UK、Ontario/Canada、Nevada/US、Brazil、其他）
- variable: targetMarket

### Step 5
- prompt: 同桌座位數與砲台配置是什麼？
- options:
  - 4 人桌
  - 6 人桌
  - 8 人桌
  - 10 人桌
  - 線上動態座位（Dynamic seating）
  - 單人（Single seat）
- variable: tableTopology

### Step 6
- prompt: 您目前處於哪個開發階段？
- options:
  - 新專案（Starting a new project）
  - 既有專案改進（Improving an existing project）
  - 既有機台移植到線上（Porting a cabinet title online）
  - 送測前準備（Preparing for certification submission）
- variable: developmentStage

## Steering

### skill-chance-classification.md
- file: steering/skill-chance-classification.md
- trigger: 當開發者詢問魚機的法律分類、技術性遊戲與機率性遊戲的界線、「我們的遊戲是技術遊戲所以不用牌照嗎」、predominant factor test／material element test／any-chance test、Skill With Prizes（SWP）與 gaming machine 的區別、技術貢獻度量化、或詢問如何在產品設計上證明技術成分時觸發
- description: 技術性與機率性分類指引，涵蓋三種美國法律測試、英國 Gambling Act 2005 的「任何機率成分即為 game of chance」規則、技術貢獻度量化方法與分類舉證卷宗（dossier）製作

### jurisdiction-matrix.md
- file: steering/jurisdiction-matrix.md
- trigger: 當開發者詢問特定市場或跨市場合規差異時觸發，包括魚機在該市場是否合法、獎品價值上限、可否使用真幣或儲值卡、年齡分級、最低派彩率、同桌人數限制、資料落地、稽核日誌保存期、測試實驗室市場接受度、以及多市場產品架構策略
- description: 全球司法管轄區合規矩陣，提供逐市場魚機法律地位與技術約束對照、資料信心等級標註、跨市場架構策略與查證 SOP

### advisory-engagement.md
- file: steering/advisory-engagement.md
- trigger: 當開發者尋求合規諮詢、市場進入評估、落差分析、風險評估，或詢問「我們該怎麼開始」「需要準備什麼」類型的顧問問題時觸發；亦於需要釐清機台製造商／軟體供應商／場所業者／線上營運商責任邊界時觸發
- description: 顧問參與流程指引，涵蓋需求釐清、合規落差評估、風險登記冊、修復路線圖、交付物與四方責任邊界劃分

### math-model.md
- file: steering/math-model.md
- trigger: 當開發者詢問魚機數學模型設計相關問題時觸發，包括魚種賠率表（species payout table）設計、生命值與捕獲機率配置、砲倍與彈值設計、各砲倍 RTP 一致性、場景與 BOSS 關卡的 RTP 貢獻、特殊武器（雷射、冰凍、鎖定）的 RTP 貢獻、波動性調校
- description: 魚機數學模型設計工作流程指引，涵蓋魚種賠率表、捕獲機率與生命值模型、砲倍矩陣、RTP 構成拆解與波動性調校

### math-verification.md
- file: steering/math-verification.md
- trigger: 當開發者詢問 RTP 驗證、蒙地卡羅模擬樣本量、模擬值與理論值不一致的排查、玩家技術水準對 RTP 的影響、PAR sheet 撰寫、砲倍配置矩陣、或送測前數學驗證時觸發
- description: 數學模型驗證與 PAR Sheet 指引，涵蓋理論 RTP 計算、技術水準敏感度分析、模擬樣本量推導、一致性判定與魚機 PAR sheet 規格

### rng-capture-determination.md
- file: steering/rng-capture-determination.md
- trigger: 當開發者詢問 RNG 實作或捕獲判定邏輯相關問題時觸發，包括 CSPRNG 選擇、種子管理、每發子彈的獨立性、捕獲判定生命週期、魚群生成與路徑排程、命中偵測與伺服器權威判定、規則引擎開發、稽核日誌欄位
- description: RNG 與捕獲判定實作工作流程指引，涵蓋密碼學安全隨機數生成器選擇、每發子彈的判定生命週期、魚群排程、伺服器權威命中判定與稽核日誌設計

### payout-control-integrity.md
- file: steering/payout-control-integrity.md
- trigger: 當開發者詢問控分、場控、抽水率、補償機制、「機台記憶」、累積投入後提高捕獲率、動態難度調整（DDA）、獎池回收、或詢問「我們的機率控制程式能不能送測」時觸發
- description: 派彩控制完整性指引，界定合規的長期 RTP 設計與違規的補償式控分機制紅線，涵蓋每局獨立性要求、可接受的動態調整範圍與送測揭露義務

### multiplayer-fairness.md
- file: steering/multiplayer-fairness.md
- trigger: 當開發者詢問多人同桌機制時觸發，包括共享魚池、傷害歸屬、搶魚與最後一擊判定、延遲補償、客戶端預測與伺服器回滾、座位間公平性、共謀與對打洗分偵測、觀戰與資訊對稱性
- description: 多人同桌公平性指引，涵蓋共享魚池的傷害歸屬模型、延遲補償與伺服器權威、座位公平性驗證、共謀洗分偵測與可稽核性設計

### platform-systems-compliance.md
- file: steering/platform-systems-compliance.md
- trigger: 當開發者詢問系統層合規時觸發，包括遊戲伺服器架構、伺服器端結果決定、斷線與未完成局處理、上下分與錢包幂等性、game recall 與對局重播、軟體完整性驗證、監管機關中央系統整合、稽核日誌基礎設施、資料落地部署拓撲、跨桌獎池控制器
- description: 平台與系統層合規指引，涵蓋 GLI-19 系統範圍、韌性設計、對局重播、中央系統整合與部署架構要求

### cabinet-hardware-compliance.md
- file: steering/cabinet-hardware-compliance.md
- trigger: 當開發者詢問實體機台硬體合規時觸發，包括投幣器與鈔票器、代幣規格、彩票出票機、讀卡機與會員卡、上下分按鍵與後台選單、主板與程式 ROM 完整性、機門開關與竄改偵測、電磁相容與電氣安全、機台銘牌與必要標示
- description: 機台硬體合規指引，涵蓋金流裝置、代幣與彩票規格、竄改偵測、程式完整性驗證、必要標示與電氣安全認證對應

### certification-prep.md
- file: steering/certification-prep.md
- trigger: 當開發者詢問認證或合規送測相關問題時觸發，包括適用哪一份 GLI 標準、認證文件準備、實驗室選擇、認證時程與費用、最低派彩率門檻、台灣評鑑分類申請、以及魚機特有的送測項目
- description: 認證準備工作流程指引，涵蓋 GLI 標準適用性判定、認證文件清單、測試計畫、實驗室對接流程與各市場型式核准程序

### responsible-gaming.md
- file: steering/responsible-gaming.md
- trigger: 當開發者詢問負責任遊戲功能相關問題時觸發，包括投入限制、自我排除、會話時間限制、淨勝負顯示、自動發射（auto-fire）管控、風險訊息顯示、以及魚機特有的沉浸與連續投入風險
- description: 負責任遊戲實作工作流程指引，涵蓋玩家保護功能開發、自動發射與連續投入風險管控與合規檢查清單

### change-management-recert.md
- file: steering/change-management-recert.md
- trigger: 當開發者詢問認證後的變更、是否需要重新送測、魚種或賠率調整的影響、版本管理、熱修復流程、法規變動影響，或詢問「改這個需要重新認證嗎」時觸發
- description: 變更管理與重新認證指引，涵蓋變更分類框架、各市場通報要求、台灣「視為新型機種」規則、建置與認證綁定管理及法規變動追蹤

### incident-malfunction-handling.md
- file: steering/incident-malfunction-handling.md
- trigger: 當開發者詢問故障處理、事故分級、玩家補償、監管機關通報、證據保全、malfunction voids pays 條款，或發生 RTP 偏離、上下分錯誤、傷害歸屬錯判、同桌結算不一致等事故時觸發
- description: 事故與故障處理指引，涵蓋事故分類、止血與證據保全程序、多人同桌事故的特殊處理、玩家補償判定、監管通報與預防性設計

### aml-kyc-player-account.md
- file: steering/aml-kyc-player-account.md
- trigger: 當開發者詢問年齡驗證、身分驗證（KYC）、反洗錢監控、玩家帳戶狀態機、重複帳戶偵測、玩家限額的帳戶層實作、以及魚機特有的同桌對打送分與價值轉移風險時觸發
- description: AML／KYC 與玩家帳戶合規指引，涵蓋各市場最低年齡、帳戶狀態機、同桌價值轉移的洗錢風式樣態與支付約束

### data-protection-privacy.md
- file: steering/data-protection-privacy.md
- trigger: 當開發者詢問 GDPR、個資處理、資料保存與刪除的衝突、資料落地與跨境傳輸、資料主體權利、控制者與處理者角色、資料外洩通報、資安標準對應，或詢問對局錄影與行為資料的保存時觸發
- description: 資料保護與隱私合規指引，處理博彩監管長期保存義務與資料保護最小化要求的衝突，涵蓋對局重播資料分類、跨境傳輸與資安標準對應

## 魚機與老虎機的領域差異（Why this is not a slot Power）

| 面向 | 老虎機 | 魚機 |
|------|--------|------|
| 玩家輸入 | 單一觸發（按下 Spin） | 連續操作：瞄準角度、發射時機、砲倍切換、目標選擇、道具使用 |
| 結果決定單位 | 一次旋轉（spin） | 一發子彈（bullet）；一次捕獲可能需要數十發 |
| 法律分類 | 明確為機率遊戲 | 依市場而定：可能是賭博機具、技術遊戲、娛樂機具或違法裝置 |
| 參與者 | 單一玩家 | 4–10 人同桌共享魚池，彼此結果互相影響 |
| 狀態空間 | 捲軸位置組合，可完全列舉 | 魚群位置、速度、剩餘生命值、道具狀態，需模擬而非列舉 |
| 常見合規紅線 | 客戶端決定結果、非密碼學 RNG | 補償式控分、客戶端命中判定、傷害歸屬不可稽核 |
| RTP 一致性要求 | 各投注額 RTP 一致 | 各**砲倍**RTP 一致，且需在不同技術水準下都成立 |
| 兌現形式 | 現金 | 現金／彩票／獎品／虛擬幣，分類後果差異極大 |

## 技術棧建議（Tech Stack Recommendations）

依據遊戲引擎與部署形態，以下為 2026 年適用的魚機開發技術棧建議。

### 遊戲引擎與主要語言映射

| 遊戲引擎 | 主要語言 | 適用場景 |
|----------|---------|---------|
| Unity | C# | 實體機台與跨平台線上魚機，支援大尺寸橫置螢幕與多點觸控同桌互動 |
| Cocos Creator | TypeScript | H5 與行動端線上魚機，亞洲市場最常見的魚機客戶端技術棧 |
| Unreal Engine | C++/Blueprint | 高階 3D 魚機與大型機台，適合需要頂級水體與粒子效果的專案 |
| Godot | GDScript/C# | 獨立開發與原型驗證，開源且輕量 |
| HTML5/PixiJS | JavaScript/TypeScript | 純瀏覽器魚機，無需安裝即可加入同桌 |

### 伺服器端技術棧

魚機的伺服器需求與老虎機不同：魚機必須維持一個**持續運行的權威世界狀態**（魚群位置、速度、剩餘生命值），而不是無狀態的單次請求回應。

| 技術 | 語言 | 適用場景 |
|------|------|---------|
| Node.js (Socket.io / uWebSockets.js) | JavaScript/TypeScript | 同桌即時狀態同步、房間管理、事件廣播 |
| Go (gorilla/websocket) | Go | 高併發同桌權威模擬，goroutine 模型適合每桌一個 tick loop |
| C# (.NET / Magic Onion) | C# | 與 Unity 客戶端共用資料模型與判定程式碼，降低雙端邏輯漂移 |
| Python (FastAPI + NumPy) | Python | 數學模型模擬、RTP 驗算與統計分析，非即時路徑 |

### 引擎專屬專案結構範本

#### Unity (C#)

```
Assets/
├── Scripts/
│   ├── Core/
│   │   ├── FishTableController.cs   # 同桌主控制器
│   │   ├── CannonController.cs      # 砲台與發射控制
│   │   ├── BulletManager.cs         # 子彈生命週期與碰撞
│   │   └── ArenaScheduler.cs        # 場景／關卡輪替與 BOSS 排程
│   ├── Fish/
│   │   ├── FishSpawner.cs           # 魚群生成
│   │   ├── FishPathController.cs    # 泳徑與速度
│   │   └── FishState.cs             # 剩餘生命值與狀態
│   ├── RNG/
│   │   └── CryptoRNG.cs             # System.Security.Cryptography 封裝
│   ├── Math/
│   │   ├── SpeciesPayoutConfig.cs   # 魚種賠率表配置
│   │   ├── CaptureResolver.cs       # 捕獲判定（僅供離線驗算與展示）
│   │   └── RTPCalculator.cs         # RTP 計算引擎
│   ├── Net/
│   │   ├── AuthoritativeClient.cs   # 伺服器權威狀態同步
│   │   └── DamageAttribution.cs     # 傷害歸屬結果套用
│   └── UI/
│       ├── FishTableUI.cs           # 遊戲介面
│       └── ResponsibleGaming.cs     # 負責任遊戲 UI
├── Resources/
│   ├── SpeciesTables/               # 魚種賠率表 JSON
│   └── CaptureModels/               # 捕獲機率模型 JSON
└── Plugins/
```

最佳實踐：
- 使用 `System.Security.Cryptography.RandomNumberGenerator` 作為 CSPRNG，並且**只在伺服器端使用**
- 客戶端的 `CaptureResolver` 僅用於視覺預測，權威結果一律由伺服器回傳後覆蓋
- 將魚種賠率表與捕獲模型外部化為 ScriptableObject 或 JSON，便於認證審查與版本比對

#### Cocos Creator (TypeScript)

```
assets/
├── scripts/
│   ├── core/
│   │   ├── FishTableController.ts   # 同桌主控制器
│   │   ├── CannonController.ts      # 砲台與發射控制
│   │   ├── BulletManager.ts         # 子彈生命週期
│   │   └── ArenaScheduler.ts        # 場景輪替
│   ├── fish/
│   │   ├── FishSpawner.ts
│   │   ├── FishPathController.ts
│   │   └── FishState.ts
│   ├── rng/
│   │   └── WebCryptoRNG.ts          # Web Crypto API 封裝（僅離線工具用）
│   ├── math/
│   │   ├── SpeciesPayoutConfig.ts
│   │   └── RTPCalculator.ts
│   ├── net/
│   │   ├── RoomClient.ts            # WebSocket 同桌連線
│   │   └── StateReconciler.ts       # 客戶端預測與伺服器回滾對帳
│   └── ui/
│       ├── FishTableUI.ts
│       └── ResponsibleGaming.ts
├── resources/
│   ├── species-tables/
│   └── capture-models/
└── extensions/
```

最佳實踐：
- 伺服器端使用 Node.js `crypto.randomBytes()` 產生所有捕獲判定隨機數
- 客戶端 `crypto.getRandomValues()` 僅用於非結果性用途（例如視覺抖動），不得參與捕獲判定
- 使用 Cocos 的物件池管理子彈與魚體節點，避免同桌高密度發射時的 GC 停頓造成判定延遲

#### Unreal Engine (C++/Blueprint)

```
Source/
├── FishTable/
│   ├── Core/
│   │   ├── FishTableGameMode.cpp/.h
│   │   ├── CannonActor.cpp/.h
│   │   ├── BulletSubsystem.cpp/.h
│   │   └── ArenaSubsystem.cpp/.h
│   ├── Fish/
│   │   ├── FishActor.cpp/.h
│   │   └── FishSpawnDataAsset.cpp/.h
│   ├── RNG/
│   │   └── CryptoRNGComponent.cpp/.h   # OpenSSL CSPRNG 封裝
│   ├── Math/
│   │   ├── SpeciesPayoutDataAsset.cpp/.h
│   │   └── RTPCalculator.cpp/.h
│   └── UI/
│       └── FishTableHUD.cpp/.h
Content/
├── Blueprints/
├── DataTables/                          # 魚種賠率、生成表
└── UI/
```

最佳實踐：
- 捕獲判定與傷害歸屬使用 C++ 實作，並以 `Server` RPC 標註確保只在伺服器執行
- 使用 OpenSSL `RAND_bytes()` 整合 CSPRNG，避免 `FMath::RandRange`
- 以 DataTable 管理魚種賠率與生成表，便於認證機構逐列審查

#### Godot (GDScript/C#)

```
project/
├── scripts/
│   ├── core/
│   │   ├── fish_table_controller.gd
│   │   ├── cannon_controller.gd
│   │   ├── bullet_manager.gd
│   │   └── arena_scheduler.gd
│   ├── fish/
│   │   ├── fish_spawner.gd
│   │   └── fish_state.gd
│   ├── rng/
│   │   └── crypto_rng.gd            # Godot Crypto class 封裝
│   ├── math/
│   │   ├── species_payout_config.gd
│   │   └── rtp_calculator.gd
│   └── ui/
│       ├── fish_table_ui.gd
│       └── responsible_gaming.gd
├── resources/
│   ├── species_tables/
│   └── capture_models/
└── addons/
```

最佳實踐：
- 使用 Godot 內建 `Crypto.generate_random_bytes()` 產生安全隨機數
- 使用 Godot 的高階多人 API 時，將捕獲判定明確標註為伺服器端 RPC
- 以 Resource 類別管理魚種與捕獲模型配置

#### HTML5/PixiJS (JavaScript/TypeScript)

```
src/
├── core/
│   ├── FishTableController.ts
│   ├── CannonController.ts
│   ├── BulletManager.ts
│   └── ArenaScheduler.ts
├── fish/
│   ├── FishSpawner.ts
│   └── FishState.ts
├── rng/
│   └── WebCryptoRNG.ts
├── math/
│   ├── SpeciesPayoutConfig.ts
│   └── RTPCalculator.ts
├── net/
│   ├── RoomClient.ts
│   └── StateReconciler.ts
├── rendering/
│   ├── FishRenderer.ts
│   └── BulletRenderer.ts
├── ui/
│   ├── FishTableUI.ts
│   └── ResponsibleGaming.ts
├── config/
│   ├── species-payout.json
│   └── capture-model.json
└── index.ts
```

最佳實踐：
- 使用 PixiJS `Ticker` 驅動渲染，但**不要**用渲染 tick 決定判定時序；判定時序由伺服器 tick 決定
- 使用 Webpack 或 Vite 打包，並在建置產物中嵌入版本與雜湊值供認證比對
- 同桌高密度粒子場景使用 `ParticleContainer` 降低 draw call

### 引擎專屬 RNG 整合方式

| 遊戲引擎 | CSPRNG 整合方式 | 備註 |
|----------|----------------|------|
| Unity | `System.Security.Cryptography.RandomNumberGenerator` | 產生 byte 陣列後轉換為所需數值範圍；僅伺服器端使用 |
| Cocos Creator | `crypto.getRandomValues()` (瀏覽器) / `crypto.randomBytes()` (Node.js) | 捕獲判定只能使用 Node.js 端 |
| Unreal Engine | OpenSSL `RAND_bytes()` 整合 | 避免僅使用 `FMath::RandRange`（非密碼學安全） |
| Godot | `Crypto.generate_random_bytes()` | Godot 4.x 內建密碼學安全隨機數生成 |
| HTML5/PixiJS | `window.crypto.getRandomValues()` | 僅供離線工具與視覺用途，不得決定捕獲結果 |
| 伺服器端 (Node.js) | `crypto.randomBytes()` | 同桌權威判定的主要 RNG 來源 |
| 伺服器端 (Go) | `crypto/rand` | 適合每桌獨立 tick loop 的高併發場景 |
| 伺服器端 (Python) | `secrets` / `os.urandom()` | 用於離線模擬與 RTP 驗算 |

### 2026 年魚機開發趨勢

1. **伺服器權威成為市場門檻**：受監管市場已普遍要求結果由伺服器決定且可完整重播。過去機台端自行判定、只把分數上傳的架構無法通過現行系統層審查，機台移植線上時通常需要重寫判定層而非包一層網路。

2. **對局重播（Round Replay）取代靜態日誌**：魚機的爭議多半是「那條魚到底是誰打死的」，靜態欄位無法回答。市場趨勢是保存足以完整重播該桌時間窗的確定性事件流，並提供客服與監管檢視工具。

3. **技術貢獻度的量化舉證**：在以技術性作為法律論據的市場，監管機關與法院越來越要求可量化的證據（不同技術水準玩家的實測 RTP 分佈），而非行銷話術。無法量化就無法主張。

4. **共謀與價值轉移偵測**：同桌結構讓兩個帳號可以透過刻意讓分完成價值移轉。線上魚機營運商正把座位共現分析、異常讓分模式偵測納入 AML 監控標準配備。

5. **AI 動態難度的合規壓力**：以機器學習調整捕獲率、魚群密度與獎勵節奏的做法，若使結果依玩家歷史而變，將直接牴觸每局獨立要求。趨勢是把個人化限縮在**不影響期望值**的表現層（美術、音效、任務），並在送測文件中明確劃界。

## 參考資料（References）

以下為本 Power 所引用的知識來源。所有 URL 均指向官方機構或法院／立法機關的正式公開頁面，經查證可達。

### 技術性與機率性分類（魚機核心法律問題）

1. **UK Gambling Commission — Skill with prizes (SWPs)**
   - URL: https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/skill-with-prizes-swps
   - 說明: 英國博彩委員會對「技術獎品機」與「gaming machine」的界線指引。關鍵規則：只要遊戲結果**可以被機率影響**，即為 Gambling Act 2005 意義下的 game of chance，機率成分是否大於技術成分、能否被高超技術消除，均不影響此認定；且一組技術遊戲中只要有一款屬機率遊戲，整台機器即為 gaming machine。另含「呈現上像賭博」也可能被認定的四項判準。
   - 驗證狀態: ✅ 官方頁面確認可達

2. **UK Gambling Commission — Gaming machine categories**
   - URL: https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/gaming-machine-categories
   - 說明: 英國 A–D 類遊戲機的投注額、獎金上限與可設置場所。魚機若被認定為 gaming machine，即受此分類與場所限制拘束。
   - 驗證狀態: ✅ 官方頁面確認可達

3. **Gambling Act 2005 §6 — Gaming & game of chance（英國）**
   - URL: https://www.legislation.gov.uk/ukpga/2005/19/section/6
   - 說明: 「gaming」與「game of chance」的法定定義本文，UKGC 上述指引的法源。
   - 驗證狀態: ✅ 英國立法資料庫確認可達

4. **The Categories of Gaming Machine Regulations 2007 (SI 2007/2158) — 說明備忘錄**
   - URL: https://www.legislation.gov.uk/uksi/2007/2158/pdfs/uksiem_20072158_en.pdf
   - 說明: 依 Gambling Act 2005 §236 定義 A/B/C/D 四類機器的法規說明，含各類投注與獎金限制的立法理由。
   - 驗證狀態: ✅ 英國立法資料庫確認可達

5. **UK DCMS — Consultation on Category D gaming machines**
   - URL: https://www.gov.uk/government/consultations/consultation-on-category-d-gaming-machines-and-licensing-for-bingo-premises/category-d-gaming-machines
   - 說明: C 類與 D 類的年齡與限額對比（C 類限 18 歲以上、投注上限 £1、獎金上限 £100；D 類無年齡限制）。魚機常被廠商定位為家庭娛樂中心機台，此文件說明該定位的法律代價。
   - 驗證狀態: ✅ 官方頁面確認可達

6. **Gift Surplus, LLC v. State ex rel. Cooper（北卡羅來納州最高法院，2022）**
   - URL: https://www.nccourts.gov/documents/appellate-court-opinions/gift-surplus-llc-v-state-ex-rel-cooper
   - 說明: ⚠️ 魚機與 sweepstakes 型機台最重要的美國判決之一。法院認定該款遊戲中機率成分優於技術成分，屬 N.C. Gen. Stat. §14-306.4 禁止的機率性視訊遊戲。此判決是北卡魚機場所大規模關閉的直接原因。
   - 驗證狀態: ✅ 北卡州法院官方頁面確認可達

7. **In re: Three Pennsylvania Skill Amusement Devices（賓州最高法院，2026）**
   - URL: https://law.justia.com/cases/pennsylvania/supreme-court/2026/50-map-2024.html
   - 說明: 賓州「技術遊戲」機台的訴訟脈絡，含下級法院採用 predominant factor test 認定未持照營運不受 Crimes Code §5513(a) 禁止的爭點。說明同一台機器在不同州因法律測試不同而結論相反。
   - 驗證狀態: ✅ 判決資料庫確認可達

8. **Hawaii SB3281 SD1（2026 會期）— Gambling Enforcement**
   - URL: https://data.capitol.hawaii.gov/sessions/session2026/Bills/SB3281_SD1_.HTM
   - 說明: 立法findings 中直接以「fish games」「fish tables」「fishing games」點名此類裝置，並將其與 sweepstakes 機台並列為在州內擴散的違法電子博彩裝置。是立法者如何看待魚機的第一手證據。
   - 驗證狀態: ✅ 夏威夷州議會官方資料庫確認可達

9. **American Gaming Association — Illegal Gambling Market Research Report (2025)**
   - URL: https://www.americangaming.org/wp-content/uploads/2025/08/Illegal-Market-Research-Report.pdf
   - 說明: 美國非法博彩市場規模研究，含未受監管機台類裝置的市場評估。作為市場進入風險評估的產業側輸入。
   - 驗證狀態: ✅ 產業協會官方 PDF 確認可達

### 台灣（製造與出口重鎮）

10. **電子遊戲場業管理條例（中華民國）**
    - URL: https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0080024
    - 說明: 台灣魚機的核心法源，主管機關為經濟部。第 4 條定義電子遊戲機並明定**不得有賭博或妨害風化之設計及裝置**，分類為益智類、鋼珠類、娛樂類；第 5 條分為普通級與限制級（限制級僅供 18 歲以上）；第 6 條要求製造業、進口人或軟體設計廠商於製造或進口前申請評鑑分類，**專供出口者不在此限**；第 7 條規定機具結構或軟體經修改者視為新型機種須重新申請；第 14 條限制級每次兌換獎品價值上限新臺幣 2,000 元、普通級 1,000 元，並禁止以現金、有價證券或其他通貨為獎品、禁止買回獎品；第 17 條第 1 項第 5 款禁止在機台使用真幣、信用卡、金融卡、現金卡、儲值卡或其他支付性電磁紀錄物，娛樂用代幣不得與真幣相同或近似；第 22 條、第 27 條為相應罰則。
    - 驗證狀態: ✅ 全國法規資料庫確認可達（法規整編資料截止日 2026-07-17）

### 認證標準與測試實驗室

11. **Gaming Laboratories International — GLI Standards**
    - URL: https://gaminglabs.com/gli-standards/
    - 說明: GLI 標準統一下載入口。魚機依部署形態可能落入 GLI-11（Gaming Devices，實體機台）或 GLI-19（Interactive Gaming Systems，線上），跨桌獎池另涉 GLI-12。PDF 可免費下載。
    - 驗證狀態: ✅ 官方頁面確認可達

12. **GLI-11 Gaming Devices v3.0（PDF 全文）**
    - URL: https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-Gaming-Devices-V3-0.pdf
    - 說明: 電子遊戲機技術標準本文，2016-09-21 發布。含 gaming device 定義（隨機性決定獎項、具啟動機制、具結果交付方法）、RNG 要求與遊戲獨立性要求。魚機的補償式控分機制與此處的獨立性要求直接衝突。
    - 驗證狀態: ✅ 官方 PDF 確認可達

13. **Gaming Laboratories International — RNG Testing Technical Specifications**
    - URL: https://gaminglabs.com/getting-started/technical-specifications-for-rng-testing/
    - 說明: GLI 針對 RNG 提交測試的技術規格要求，含硬體與軟體需求。
    - 驗證狀態: ✅ 官方頁面確認可達

14. **GLI Product Certification Scheme (PC-QS-011)**
    - URL: https://gaminglabs.com/wp-content/uploads/2026/07/GLI-Product-Certification-Scheme-PC-QS-011_English.pdf
    - 說明: GLI 產品認證方案文件，說明提交流程、證書範圍與 GLIACCESS 線上查驗。用於界定「我們有 GLI 證書」實際涵蓋什麼。
    - 驗證狀態: ✅ 官方 PDF 確認可達

15. **Arizona Department of Gaming — Tribal Compact Appendix A（GLI 標準對照）**
    - URL: https://gaming.az.gov/sites/default/files/Appendix%20A%20-%20Generic_1.pdf
    - 說明: 官方文件中將設備類型逐一對應 GLI 標準編號：Gaming Devices→GLI-11、Progressive Gaming Devices→GLI-12、Online Monitoring Systems→GLI-13、Bonus Systems→GLI-17、Promotional Systems→GLI-18、Redemption Kiosks→GLI-20。用於判定魚機專案需要哪幾份標準，而非只送 GLI-11。
    - 驗證狀態: ✅ 亞利桑那州官方 PDF 確認可達

16. **BMM Testlabs**
    - URL: https://bmm.com/
    - 說明: 全球資深遊戲測試實驗室，提供 RNG 測試、遊戲數學審查與平台安全認證。
    - 驗證狀態: ✅ 官方網站確認可達

17. **iTech Labs**
    - URL: https://itechlabs.com/
    - 說明: 澳洲獨立測試實驗室，專精 RNG 評估與線上遊戲認證。
    - 驗證狀態: ✅ 官方網站確認可達

18. **eCOGRA**
    - URL: https://ecogra.org/ecogra-certification/
    - 說明: 獨立認證機構，提供 eGAP 認證，符合 ISO/IEC 17025:2017 與 ISO/IEC 17020:2012。
    - 驗證狀態: ✅ 官方頁面確認可達

19. **Gaming Laboratories International — GLI 投資 iTech Labs 新聞稿**
    - URL: https://gaminglabs.com/press-releases/gaming-laboratories-international-gli-group-invests-in-itech-labs/
    - 說明: ⚠️ 實驗室獨立性揭露來源。GLI 於 2023-05-19 宣布取得 iTech Global Pty Ltd 全部股份。若市場或合約要求實驗室獨立性或第二意見認證，兩者不得視為獨立選項。
    - 驗證狀態: ✅ 官方新聞稿確認可達

### 監管機構與市場技術標準

20. **Nevada Gaming Control Board**
    - URL: https://gaming.nv.gov
    - 說明: 內華達博彩管制委員會官方入口，含法規與獨立測試實驗室提交要求。
    - 驗證狀態: ✅ 官方網站確認可達

21. **Nevada — Regulation 14（2026-02-26 生效版全文）**
    - URL: https://prod.gaming.nv.gov/contentassets/1a1da722f77249f3ad951853533a776a/regulation-14-manufacture-sale-distribution-and-approval-of-gaming-devices-and-games-adp-02.26.2026-eff-02.26.2026.pdf
    - 說明: 機台與遊戲的製造、銷售、發行與核准規例本文，含最低派彩率與獨立測試實驗室提交要求。魚機若在內華達以博彩機具形式部署，須依此核准。
    - 驗證狀態: ✅ 官方 PDF 確認可達

22. **Massachusetts — 205 CMR 143（Gaming Devices and Electronic Gaming Equipment）**
    - URL: https://www.mass.gov/doc/205-cmr-143-gaming-devices-and-electronic-gaming-equipment/download
    - 說明: 州級遊戲機具技術標準，含遊戲完整性與最低派彩率計算基礎（明確處理非現金獎品的計價方式），對彩票／獎品兌換型魚機的 RTP 計算特別有參考價值。
    - 驗證狀態: ✅ 麻州官方文件確認可達

23. **Florida Gaming Control Commission**
    - URL: https://flgaming.gov
    - 說明: 佛州博彩管制委員會。2025 年多次執法行動明確將 fish tables 與違法拉霸機並列查扣，是「魚機在該州無合法部署途徑」的直接證據。
    - 驗證狀態: ✅ 官方網站確認可達

24. **Alcohol and Gaming Commission of Ontario (AGCO) — Registrar's Standards for Internet Gaming**
    - URL: https://www.agco.ca/en/lottery-and-gaming/guides/registrars-standards-internet-gaming
    - 說明: 安大略網路博彩註冊官標準，含遊戲與 RNG 認證、產品設計約束與紀錄保存期。線上魚機進入安大略須對照此標準逐條檢核。
    - 驗證狀態: ✅ 官方頁面確認可達

25. **Spillemyndigheden（丹麥）— 線上娛樂場認證方案**
    - URL: https://spillemyndigheden.dk/en-us/businesses-and-associations/games-which-require-a-licence/online-casino/certification-programme-for-online-casino
    - 說明: 丹麥模組化認證方案 SCP.00–SCP.07（總則、RNG、基礎平台、ISMS、滲透測試、弱點掃描、變更管理、遊戲要求）。適合作為線上魚機內部合規檢查清單骨架。
    - 驗證狀態: ✅ 官方頁面確認可達

26. **Spelinspektionen（瑞典博彩管理局）**
    - URL: https://www.spelinspektionen.se/
    - 說明: 瑞典博彩監管機關，營運 Spelpaus 全國自我排除系統，所有持瑞典牌照營運商必須整合。
    - 驗證狀態: ✅ 官方網站確認可達

27. **Gemeinsame Glücksspielbehörde der Länder (GGL，德國)**
    - URL: https://www.gluecksspiel-behoerde.de/
    - 說明: 德國各邦共同博彩監理機關。德國線上遊戲許可類別以虛擬機台遊戲（virtuelle Automatenspiele）與線上撲克為主，魚機是否落入可許可類別需逐案向 GGL 確認，不可假設。
    - 驗證狀態: ✅ 官方網站確認可達

28. **Malta Gaming Authority (MGA) — Remote Gaming Services**
    - URL: https://www.mga.org.mt/remote-gaming/
    - 說明: 馬爾他遠端遊戲牌照資訊，含 B2C 與 B2B 牌照要求與遊戲類型分類。
    - 驗證狀態: ✅ 官方頁面確認可達

29. **PAGCOR（菲律賓）**
    - URL: https://www.pagcor.ph
    - 說明: 菲律賓娛樂博彩公司。境內線上遊戲需 PAGCOR 牌照；多數亞洲風格線上魚機供應商以菲律賓或 Curaçao 牌照供應內容。離岸（POGO／IGL）自 2024-12-31 起禁止。
    - 驗證狀態: ✅ 官方網站確認可達

30. **Curaçao Gaming Authority（LOK 制度）**
    - URL: https://gamingcontrolcuracao.org
    - 說明: 古拉索博彩管理局。LOK 廢除母／子牌照模式，要求古拉索法人與當地常駐董事，技術認證須由具資格測試機構執行。線上魚機常見的授權來源，須確認客戶實際處於哪一種牌照狀態。
    - 驗證狀態: ✅ 官方網站確認可達

31. **Brazil — Secretaria de Prêmios e Apostas (SPA), Ministério da Fazenda**
    - URL: https://www.gov.br/fazenda/pt-br/composicao/orgaos/secretaria-de-premios-e-apostas
    - 說明: 巴西博彩監管機關。Law 14.790/2023 開放線上娛樂場，2025-01-01 市場上線，要求巴西境內資料中心、巴西法人、`.bet.br` 網域並以葡萄牙文提交認證。魚機是否被歸入可供應的線上娛樂場遊戲類型須向 SPA 確認。
    - 驗證狀態: ✅ 官方網站確認可達

32. **National Indian Gaming Commission (NIGC) — 25 CFR Part 547（Class II 技術標準）**
    - URL: https://www.ecfr.gov/current/title-25/chapter-III/subchapter-D/part-547
    - 說明: 美國部落 Class II 遊戲系統與設備的最低技術標準。**Class III 無聯邦技術標準**，其機台標準來自部落－州協議（compact）並由部落博彩監理機關執行。
    - 驗證狀態: ✅ 美國聯邦法規電子版確認可達

### 密碼學與隨機數標準

33. **NIST SP 800-90A Rev. 1 — DRBG 推薦標準**
    - URL: https://csrc.nist.gov/pubs/sp/800/90/a/r1/final
    - 說明: 確定性隨機位元生成器推薦標準，規定基於雜湊函數與區塊密碼的 DRBG 機制。
    - 驗證狀態: ✅ NIST 官方頁面確認可達

34. **NIST SP 800-90C — RBG Constructions**
    - URL: https://csrc.nist.gov/pubs/sp/800/90/c/final
    - 說明: 2025 年 9 月發布最終版，完成 SP 800-90 系列。定義 RBG1、RBG2、RBG3 與 RBGC 建構方式，與 800-90A、800-90B 共同構成 CSPRNG 設計與熵源評估依據。
    - 驗證狀態: ✅ NIST 官方頁面確認可達

35. **NIST — Decision to Revise SP 800-22 Rev. 1a**
    - URL: https://csrc.nist.gov/News/2022/decision-to-revise-nist-sp-800-22-rev-1a
    - 說明: ⚠️ 重要警告來源。NIST 的改版決定明確包含釐清該套件用途，並拒絕將其用於評估密碼學隨機數產生器。博彩業仍廣泛引用 SP 800-22 作為 RNG 評估基礎，此立場與現行 NIST 指引不一致，顧問應主動指出。
    - 驗證狀態: ✅ NIST 官方公告確認可達

36. **NIST — Random Bit Generation Project**
    - URL: https://csrc.nist.gov/Projects/Random-Bit-Generation
    - 說明: NIST 隨機位元生成專案總覽，含 SP 800-90 系列（90A/90B/90C）全部文件。
    - 驗證狀態: ✅ NIST 官方頁面確認可達

37. **W3C — Web Cryptography API**
    - URL: https://www.w3.org/TR/WebCryptoAPI/
    - 說明: 定義瀏覽器端密碼學操作 JavaScript API，含 `crypto.getRandomValues()`。2017 年成為 W3C Recommendation。
    - 驗證狀態: ✅ W3C 官方頁面確認可達

### 遊戲引擎官方文件

38. **Microsoft .NET — System.Security.Cryptography Namespace**
    - URL: https://learn.microsoft.com/en-us/dotnet/api/system.security.cryptography
    - 說明: Unity 使用的 C# CSPRNG 實作來源，含 `RandomNumberGenerator` 類別。
    - 驗證狀態: ✅ Microsoft Learn 確認可達

39. **Cocos Creator — Official Documentation**
    - URL: https://docs.cocos.com/creator/manual/en/
    - 說明: Cocos Creator 官方開發文件，含 TypeScript 元件系統、物件池與跨平台部署。
    - 驗證狀態: ✅ 官方文件確認可達

40. **Epic Games — Unreal Engine Documentation**
    - URL: https://dev.epicgames.com/documentation/en-us/unreal-engine/
    - 說明: Unreal Engine 官方文件入口，含 C++ API、網路複製與 Blueprint 系統。
    - 驗證狀態: ✅ 官方文件確認可達

41. **Godot Engine — Crypto Class Reference**
    - URL: https://docs.godotengine.org/en/stable/classes/class_crypto.html
    - 說明: Godot 4.x 內建 `Crypto` 類別，提供 `generate_random_bytes()`。
    - 驗證狀態: ✅ 官方文件確認可達

42. **PixiJS — Official Guides**
    - URL: https://pixijs.com/guides
    - 說明: PixiJS HTML5 渲染框架官方指引，適用於瀏覽器端魚機開發。
    - 驗證狀態: ✅ 官方文件確認可達

### 負責任遊戲與玩家保護

43. **GamCare — National Gambling Support Service (UK)**
    - URL: https://www.gamcare.org.uk/
    - 說明: 英國國家博彩支援服務，提供免費諮詢與治療轉介。
    - 驗證狀態: ✅ 官方網站確認可達

44. **BeGambleAware — UK Gambling Support**
    - URL: https://www.begambleaware.org/
    - 說明: 英國博彩意識慈善機構，UKGC 要求營運商顯示此連結。
    - 驗證狀態: ✅ 官方網站確認可達

45. **GamStop — UK National Self-Exclusion Scheme**
    - URL: https://www.gamstop.co.uk/
    - 說明: 英國國家級自我排除系統，所有持 UKGC 牌照的線上營運商必須整合。
    - 驗證狀態: ✅ 官方網站確認可達

46. **Spelpaus — Swedish National Self-Exclusion**
    - URL: https://www.spelpaus.se/
    - 說明: 瑞典國家級自我排除系統，所有持瑞典牌照的營運商必須整合。
    - 驗證狀態: ✅ 官方網站確認可達

47. **National Council on Problem Gambling (NCPG) — USA**
    - URL: https://www.ncpgambling.org/
    - 說明: 美國國家問題博彩委員會，營運 1-800-522-4700 全國求助熱線。
    - 驗證狀態: ✅ 官方網站確認可達
