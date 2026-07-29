# 鱼机开发专家 — Kiro Power

[English](README.md) | [繁體中文](README_ZH.md) | [简体中文](README_CN.md) | [日本語](README_JP.md) | [한국어](README_KR.md)

> 语言说明：README 提供 5 种语言。Steering 文件（领域知识）以繁体中文撰写，并刻意保留英文与原文的法律及技术术语——`電子遊戲場業管理條例 §14`、`Gambling Act 2005 §6`、`N.C. Gen. Stat. §14-306.4`、`GLI-11 v3.0` 等条号一律照原文保留，因为您需要这些精确字串才能回头调阅法源，也才能与测试实验室沟通。无论 steering 文件使用哪种语言，本 Power 都会以您的语言回应。

把您的 IDE 变成鱼机（捕鱼机 / fish shooting game / fish table）开发的专业顾问。本 Power 涵盖法律分类、捕获判定 RNG、多人同桌公平性、派彩控制完整性、认证合规与负责任游戏，从概念到送测的完整开发周期。

> 核心概念：
>
> • **一发子弹是原子投注单位。** 一次捕获可能消耗数十发，因此几乎所有以「一次游戏」表述的监管规则，都需要先明确对应才能适用
> • **技术性与机率性分类**决定这台机器是需牌照的赌博机具、合法娱乐机具，还是查扣即刑事案件的违法装置——而答案依市场而异
> • **补偿式派彩控制**（控分／场控／保底／记血）是送测失败最常见的单一原因。它是架构违规，不是可以调整的参数
> • **共享鱼池**使一个座位的期望值依赖同桌组成，这在老虎机领域没有对应物
> • **鱼机的 RTP 是策略相依区间**，不是单一数字

## 本 Power 的定位

这是一个**合规顾问**，不是代码生成器。当您要求一个功能时，它会先告诉您该功能在目标市场是否合法，再给您合规的实作方式。

| | Accelerator | 本 Power（Expert） |
|---|---|---|
| 被要求做一个功能 | 直接实作 | 先问这个功能在您的市场是否合法 |
| 被问一个数字 | 给一个可用的值 | 给值**加上信心等级、法律来源，以及如何查证** |
| 成功的样子 | 它能运作 | 您知道自己承担了什么风险 |

每一个监管数值都标注信心等级：`HIGH`（直接读自官方法规本文）、`MEDIUM`（权威次级来源）、`UNVERIFIED`（**未经确认——绝不推测**）。一个会编造数字的合规顾问比留白的更糟，因为留白会触发查证，而错误的数字会直接写进产品规格。

鱼机的 `UNVERIFIED` 比老虎机多，这是领域性质而非研究不足：多数技术标准是为单人机具撰写的，根本没有处理多人共享鱼池的形态。

## 为什么这不是老虎机 Power

| 面向 | 老虎机 | 鱼机 |
|---|---|---|
| 玩家输入 | 单一触发（按下 Spin） | 连续操作：瞄准角度、发射时机、炮倍、目标选择、道具使用 |
| 结果单位 | 一次旋转 | 一发子弹；一次捕获可能需要数十发 |
| 法律分类 | 明确为机率游戏 | 依市场而定：赌博机具、技术游戏、娱乐机具或违法装置 |
| 参与者 | 单一玩家 | 4–10 座位共享鱼池，彼此互相影响 |
| 状态空间 | 卷轴位置组合，可完全列举 | 鱼的位置、速度、剩余生命值、道具状态，须模拟而非列举 |
| 常见红线 | 客户端决定结果、非密码学 RNG | 补偿式控分、客户端命中判定、伤害归属不可稽核 |
| RTP 一致性 | 各投注额一致 | 各**炮倍**一致，且需在各技术水准下都成立 |
| 兑现形式 | 现金 | 现金／彩票／奖品／虚拟币，分类后果差异极大 |

## 功能

- 🧭 **技术性与机率性分类** — 美国三种法律测试（predominant factor、material element、any-chance）、英国更宽广的「结果可被机率影响」规则、台湾的行政评鉴路径、技术贡献度量化证据与分类举证卷宗
- 🌍 **司法管辖区合规矩阵** — 23 个市场的逐市场法律地位与技术约束，每项均附法源引用与信心等级
- ⛔ **禁止市场登记册** — 明确标示鱼机违法或已被列为执法目标的市场（佛罗里达、北卡罗来纳、夏威夷、中国大陆、南韩、日本），而不是暗示认证可以使进入变得可能
- 🎯 **数学模型** — 鱼种赔率表、生命值与捕获机率模型、炮倍矩阵与各炮倍 RTP 一致性、特殊武器与 BOSS 的 RTP 贡献、波动性调校
- 🔬 **数学验证** — 三层验证含四代理人技术水准敏感度分析、由实测 σ 反推的蒙地卡罗样本量、BOSS 与奖池的分层抽样、16 节鱼机 PAR sheet 规格、损失项揭露
- 🔐 **RNG 与捕获判定** — 各引擎的 CSPRNG、每发子弹的六阶段生命周期、鱼群生成这个最常被遗漏的随机数消耗点、确定性重播种子、含鱼离场事件的完整稽核栏位集
- 🚫 **派彩控制完整性** — 合规的长期 RTP 设计与违规的补偿式控分之间的界线、三项行为侦测测试，以及移除控分后商业模型会发生什么事
- 👥 **多人同桌公平性** — 共享鱼池模型 A/B/C、伤害归属、最后一击规则、有界回溯的延迟补偿、座位公平性验证、共谋侦测
- 🖧 **平台与系统** — 每桌权威 tick loop、钱包幂等性、取代静态 spin log 的对局重播、跨桌奖池控制器、稽核日志的资料量经济学
- 🏭 **机台硬体** — 投币器与钞票器、代币规格、彩票出票、上下分授权、后台选单揭露、窜改侦测、必要标示
- 📋 **认证准备** — 究竟适用哪一份 GLI 标准、11 份送测文件集、实验室选择、书面技术问答流程
- 🛡️ **负责任游戏** — 鱼机独有的连续投入风险、自动发射管控、炮倍升级、会话限制、在发射请求受理前执行的自我排除
- 🔁 **变更管理** — 以逐位元重播比对作为量测仪器的五级变更分类框架，以及台湾的「视为新型机种」规则
- 🚨 **事故处理** — 止血→保全→界定→修复的顺序，以及双向的多座位补救问题
- 🔍 **AML／KYC 与资料保护** — 同桌价值转移这个鱼机独有的洗钱管道，以及一张桌的重播涵盖最多 8 名资料主体的事实
- 🎮 **多引擎支援** — Unity、Cocos Creator、Unreal Engine、Godot、HTML5/PixiJS，附各引擎的 CSPRNG 指引

## 架构

```
开发者（自然语言）
    → AI 层（意图理解与规划）
        → 鱼机开发专家 Power（领域知识）
            → 先分类，再做风险知情的合规实作

鱼机开发专家（智慧层）
├── POWER.md              → 定义工作流程与参考资料的主文件
├── steering/             → 16 个领域知识文件
├── templates/
│   ├── market-profiles/  → 23 个市场档案 + schema + 禁止市场登记册
│   ├── certification/    → PAR sheet、RNG 提交包、分类举证卷宗、变更请求、GLI 检查清单
│   ├── advisory/         → 落差评估、风险登记册、路线图、事故报告
│   ├── species-payout/   → 鱼种赔率表工作范例（8 座位、96% RTP）
│   └── capture-model/    → 随机伤害生命值扣减捕获模型工作范例
├── hooks/                → IDE 自动化 hook
└── tests/                → 属性测试（fast-check + vitest）
```

## 市场涵盖

**受监管或有明确途径：** 台湾（经济部 电子游戏场业）、英国（UKGC）、马尔他（MGA）、菲律宾（PAGCOR）、库拉索（LOK）、巴西（SPA）、安大略（AGCO）、丹麦（Spillemyndigheden）、瑞典（Spelinspektionen）、内华达、麻州、新泽西、密西根、美国部落 Class III

**标示为禁止、灰区或过渡中：** 佛罗里达、北卡罗来纳、夏威夷、德州、中国大陆、南韩、日本、德国、宾州

各档案深度不同。无法取得官方来源的市场以**明确标注 `UNVERIFIED` 的研究骨架与查证清单**交付，而不是填入看起来合理的数字。台湾是最深入的档案，因为它的技术与兑现限制写在成文法而非不公开的牌照条件中，也因为它是这类产品的制造与出口重镇。

⛔ **关于中国大陆的说明：** 具现金或变相兑现功能的机台属刑事范畴，中国大陆不存在合法的商业博彩机台制度。变相兑现（代币回收、第三方结算、线上帐户转移）同样落入认定范围。中国大陆对鱼机供应商的实际重要性主要在制造供应链，而非合法内销市场。相关条文原文本次未取得，因此登记册中该项标注为 `MEDIUM`，并附查证清单。

## 前置需求

- 已安装 [Kiro IDE](https://kiro.dev/docs/getting-started/installation)
- Node.js 18+（仅用于本 Power 的开发与测试）

## 安装

### 步骤 1 — 在 Kiro 中安装本 Power

开启 Kiro → 左侧面板点击 Powers 图示 → 点击「+」→ 选择「Add Custom Power」→ 选择本专案根目录

### 步骤 2 — 安装自动引导 Hook（建议）

此 hook 会把每个问题导向正确的 Steering File，并强制顾问姿态：先确认司法管辖区**与兑现模式**、绝不把未经确认的监管数值当作事实陈述、主动提出红旗。

```bash
mkdir -p .kiro/hooks

# 现行 agent-hook 格式（v1 schema：version + hooks[] + UserPromptSubmit）
cp hooks/fish-expert-guidance.json .kiro/hooks/

# 旧格式，适用于读取 .kiro.hook 的旧版 Kiro
cp hooks/pre-fish-tool.kiro.hook .kiro/hooks/
```

只安装一个。若不确定，先用 `fish-expert-guidance.json` 并确认 Power 是否自动启动。

### 验证安装

在 Kiro 输入任何鱼机问题（例如「设计一个 96% RTP 中波动 8 人桌鱼机数学模型」）。若 AI 先询问您的目标市场与兑现模式，而不是立刻产出赔率表，安装就是正确的。

## 使用方式

| 领域 | 范例问题 |
|---|---|
| 分类 | 「我们的鱼机算技术游戏吗？」「这台能卖到德州吗？」「怎么证明技术贡献度？」 |
| 数学模型 | 「设计 96% RTP 的鱼种赔率表」「为什么最高炮倍的 RTP 较低？」「计算雷射炮的 RTP 贡献」 |
| RNG | 「Unity 的捕获判定怎么用 CSPRNG？」「稽核日志要记哪些栏位？」「六阶段子弹生命周期是什么？」 |
| 派彩控制 | 「我们的机率控制程式能不能送测？」「怎么在旧程式码里找出补偿式控分？」 |
| 多人同桌 | 「8 个座位的伤害归属该怎么设计？」「延迟补偿怎么做才公平？」「怎么侦测座位间对打洗分？」 |
| 认证 | 「线上鱼机适用哪一份 GLI 标准？」「送测要准备哪些文件？」「台湾的评鉴分类要什么？」 |

## 支援的游戏引擎

| 引擎 | 语言 | CSPRNG |
|---|---|---|
| Unity | C# | `System.Security.Cryptography.RandomNumberGenerator` |
| Cocos Creator | TypeScript | Web Crypto API / Node.js `crypto` |
| Unreal Engine | C++/Blueprint | OpenSSL `RAND_bytes` |
| Godot | GDScript/C# | `Crypto` 类别 |
| HTML5/PixiJS | JS/TS | Web Crypto API（`crypto.getRandomValues`） |

所有情况下捕获判定都应在伺服器端。客户端 RNG 仅可用于非结果性用途，例如视觉抖动。

## 开发

```bash
npm install
npm test              # 执行全部测试
npx tsc --noEmit      # TypeScript 型别检查
```

## 官方参考资料

| 来源 | URL |
|---|---|
| 電子遊戲場業管理條例（台湾） | https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0080024 |
| UKGC Skill with prizes (SWPs) | https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/skill-with-prizes-swps |
| UKGC Gaming machine categories | https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/gaming-machine-categories |
| Gambling Act 2005 §6 | https://www.legislation.gov.uk/ukpga/2005/19/section/6 |
| Gift Surplus v. State ex rel. Cooper（北卡 2022） | https://www.nccourts.gov/documents/appellate-court-opinions/gift-surplus-llc-v-state-ex-rel-cooper |
| Hawaii SB3281 SD1（2026） | https://data.capitol.hawaii.gov/sessions/session2026/Bills/SB3281_SD1_.HTM |
| Florida Gaming Control Commission | https://flgaming.gov |
| GLI Standards（GLI-11／GLI-19） | https://gaminglabs.com/gli-standards/ |
| GLI-11 Gaming Devices v3.0 | https://gaminglabs.com/wp-content/uploads/2018/09/GLI-11-Gaming-Devices-V3-0.pdf |
| Arizona Tribal Compact Appendix A | https://gaming.az.gov/sites/default/files/Appendix%20A%20-%20Generic_1.pdf |
| NIGC 25 CFR Part 547 | https://www.ecfr.gov/current/title-25/chapter-III/subchapter-D/part-547 |
| Nevada Regulation 14 | https://gaming.nv.gov |
| Massachusetts 205 CMR 143 | https://www.mass.gov/doc/205-cmr-143-gaming-devices-and-electronic-gaming-equipment/download |
| AGCO Registrar's Standards | https://www.agco.ca/en/lottery-and-gaming/guides/registrars-standards-internet-gaming |
| 丹麦认证方案 SCP.00–SCP.07 | https://spillemyndigheden.dk/en-us/businesses-and-associations/games-which-require-a-licence/online-casino/certification-programme-for-online-casino |
| NIST SP 800-90A Rev.1 | https://csrc.nist.gov/pubs/sp/800/90/a/r1/final |
| NIST SP 800-90C | https://csrc.nist.gov/pubs/sp/800/90/c/final |
| NIST 改版 SP 800-22 之决定 | https://csrc.nist.gov/News/2022/decision-to-revise-nist-sp-800-22-rev-1a |
| W3C Web Crypto API | https://www.w3.org/TR/WebCryptoAPI/ |
| BMM Testlabs | https://bmm.com/ |
| iTech Labs | https://itechlabs.com/ |
| eCOGRA | https://ecogra.org/ecogra-certification/ |
| GamStop（英国） | https://www.gamstop.co.uk/ |
| Spelpaus（瑞典） | https://www.spelpaus.se/ |

完整参考清单见 POWER.md。

### 三个值得知道的纠正

1. **「我们的游戏有技术成分，所以不是赌博。」** 在 *Gift Surplus, LLC v. State ex rel. Cooper*（北卡 2022）中，一款以技术操作为核心的机台仍被认定为机率游戏，因为机率成分优于技术成分——而那是美国三种测试中**对供应商最有利**的一种。在英国这个论点失败得更快：只要结果*可以*被机率影响即为 game of chance，技术是否胜过机率、能否消除机率，均不影响认定。

2. **台湾的出口豁免不是对目的地的陈述。** 電子遊戲場業管理條例 §6 对**专供出口**的制造免除台湾的评鉴分类义务，但它完全没有说机器在落地市场是否合法。这是多数出口专案失败的原因，也是本 Power 最常需要纠正的单一误读。

3. **NIST 自身的立场是 SP 800-22 不应用于评估密码学 RNG**，但它仍被普遍引用为博彩 RNG 的合规基础。本 Power 主动指出这个落差，而不是沿用。

本 Power 另揭露 **GLI 与 iTech Labs 自 2023 年 5 月起同属一个集团**，这在市场或合约要求实验室独立性时具关键意义。

## 疑难排解

| 问题 | 解法 |
|---|---|
| AI 没有以专家身分回应 | 确认 hook 已复制到 `.kiro/hooks/`。若 `pre-fish-tool.kiro.hook` 没有触发，您的 Kiro 版本可能需要 v1 schema，请改用 `fish-expert-guidance.json` |
| AI 一直反问我市场而不回答 | 这是预期行为。鱼机的答案依市场而定；提供市场与兑现模式后它就会继续 |
| 测试失败 | 先执行 `npm install` 再重试 `npm test` |
| TypeScript 型别错误 | 执行 `npm install` 后再跑 `npx tsc --noEmit` |

## 安全性

安全问题回报方式见 [CONTRIBUTING.md](CONTRIBUTING.md#security-issue-notifications)。

## 授权

MIT License。详见 [LICENSE](LICENSE)。
