# Buddy Evolution System — Design Spec

## Overview

一個 Claude Code plugin + 線上平台，讓 `/buddy` 寵物根據實際使用量成長進化。

- **Plugin**: 透過 hooks 追蹤使用指標，本地計算 XP/屬性/升階，`/evo` slash command 顯示進化後的寵物
- **Platform**: Next.js + Supabase 線上平台，排行榜、個人檔案、比較、成就

基於 [RaphaelRUzan/buddy-evolution](https://github.com/RaphaelRUzan/buddy-evolution) PoC 的設計延伸。

---

## Part 1: Plugin

### 1.1 目錄結構

```
buddy-evolution-plugin/
├── plugin.json                  # Plugin manifest
├── hooks/
│   ├── hooks.json               # Hook 定義
│   ├── on-session-start.sh      # SessionStart hook
│   ├── on-session-end.sh        # SessionEnd hook — 算 XP、解析 transcript
│   ├── on-tool-use.sh           # PostToolUse hook — 計數 tool calls
│   ├── on-tool-fail.sh          # PostToolUseFailure hook — 計數 rejected
│   └── on-compact.sh            # PostCompact hook — 計數 context resets
├── skills/
│   └── evo/
│       ├── skill.md             # /evo slash command 定義
│       └── evo.sh               # 渲染腳本
├── src/
│   ├── engine/
│   │   ├── xp.ts                # XP 計算（復用 PoC）
│   │   ├── stats.ts             # 屬性成長（復用 PoC）
│   │   ├── evolution.ts         # 核心調度器（復用 PoC）
│   │   ├── tiers.ts             # 階段定義與常數
│   │   └── transcript-parser.ts # 解析 transcript.jsonl 提取 token 數
│   ├── tracker/
│   │   ├── session-state.ts     # 當前 session 的暫存指標
│   │   └── accumulator.ts       # Hook 呼叫時累加指標到暫存檔
│   ├── store/
│   │   ├── evolution-store.ts   # 讀寫本地 evolution state JSON
│   │   └── paths.ts             # $CLAUDE_PLUGIN_DATA 路徑管理
│   ├── render/
│   │   ├── sprites.ts           # 基礎 sprite（復用 PoC）
│   │   ├── evolution-sprites.ts # 進化視覺疊加（復用 PoC）
│   │   └── display.ts           # 終端機輸出格式化（XP bar、數值表）
│   ├── sync/
│   │   └── upload.ts            # 上傳快照到平台 API
│   └── cli.ts                   # 入口：解析 /evo 子命令 (status/sync/stats)
├── dist/                        # 編譯後 JS
├── package.json
└── tsconfig.json
```

### 1.2 Plugin Manifest (`plugin.json`)

```json
{
  "name": "buddy-evolution",
  "version": "0.1.0",
  "description": "RPG evolution system for /buddy — pets grow from actual usage",
  "skills": ["skills/evo"],
  "hooks": "hooks/hooks.json"
}
```

### 1.3 Hooks 設計

#### hooks.json

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PLUGIN_ROOT/hooks/on-session-start.sh\"",
            "timeout": 5
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash|Edit|Write|NotebookEdit",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PLUGIN_ROOT/hooks/on-tool-use.sh\"",
            "timeout": 3,
            "async": true
          }
        ]
      }
    ],
    "PostToolUseFailure": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PLUGIN_ROOT/hooks/on-tool-fail.sh\"",
            "timeout": 3,
            "async": true
          }
        ]
      }
    ],
    "PostCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PLUGIN_ROOT/hooks/on-compact.sh\"",
            "timeout": 3,
            "async": true
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PLUGIN_ROOT/hooks/on-session-end.sh\"",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

#### Hook 行為

| Hook | 觸發時機 | 做什麼 |
|------|---------|--------|
| `on-session-start.sh` | 對話開始 | 建立 `$CLAUDE_PLUGIN_DATA/current-session.json` 暫存檔，記錄 start time |
| `on-tool-use.sh` | 每次 tool 成功 | 讀 stdin JSON，判斷 tool_name 累加到 current-session.json（tool_calls++, 若為 Edit/Write 則 file_edits++, 若為 Bash 且 command 含 test/jest/vitest/pytest 則 test_runs++） |
| `on-tool-fail.sh` | tool 失敗 | rejected_tool_calls++ |
| `on-compact.sh` | context 壓縮 | context_resets++ |
| `on-session-end.sh` | 對話結束 | 1) 解析 transcript.jsonl 算 token 數 2) 讀 current-session.json 3) 執行 processSessionEnd() 4) 存 evolution state 5) 自動上傳到平台（靜默失敗） |

### 1.4 Transcript 解析

SessionEnd hook 收到 `transcript_path`，解析 JSONL 提取 token 使用量：

```typescript
// transcript-parser.ts
interface TranscriptTokens {
  inputTokens: number
  outputTokens: number
}

function parseTranscript(filePath: string): TranscriptTokens {
  // 逐行讀取 JSONL
  // 尋找含有 usage 欄位的行（API response 格式）
  // 累加 input_tokens 和 output_tokens
  // 容錯：格式不認識就回傳 0，不要炸掉
}
```

注意：transcript 格式是 Claude Code 內部的，可能隨版本變。需要防禦性解析，格式不對就 fallback 到 0 token，其他 XP 來源（tool calls 等）仍然正常運作。

### 1.5 資料持久化

所有資料存在 `$CLAUDE_PLUGIN_DATA/` 下：

```
$CLAUDE_PLUGIN_DATA/
├── evolution-state.json    # 永久：XP、tier、lifetime stats、streak、stat growth
├── current-session.json    # 暫存：當前 session 的累積指標（session end 後刪除）
└── sync-config.json        # 平台 auth token、user ID
```

#### evolution-state.json 結構

```json
{
  "totalXP": 245000,
  "tier": "juvenile",
  "lifetimeStats": {
    "totalOutputTokens": 180000,
    "totalInputTokens": 95000,
    "totalToolCalls": 420,
    "totalSessions": 15,
    "totalSessionMinutes": 380,
    "rejectedToolCalls": 12,
    "forceSnips": 3,
    "contextResets": 5,
    "fileEdits": 210,
    "testRuns": 45
  },
  "streak": {
    "currentDays": 4,
    "lastSessionDate": "2026-04-01"
  },
  "statGrowth": {
    "DEBUGGING": 23.5,
    "PATIENCE": 18.2,
    "CHAOS": 2.8,
    "WISDOM": 9.1,
    "SNARK": 4.3
  },
  "evolvedAt": {
    "hatchling": 1743465600000,
    "juvenile": 1743552000000,
    "adult": null,
    "elder": null,
    "ascended": null
  }
}
```

### 1.6 Slash Command: `/evo`

#### skill.md

```markdown
---
name: evo
description: Show your buddy's evolution status
argument: "[sync|stats]"
---

Run the buddy evolution viewer. 
- No argument: show sprite + summary
- `sync`: upload to platform
- `stats`: detailed stat breakdown
```

#### `/evo` 輸出範例（無參數）

```
  ✧  __    ✧               🦆 Quackers the Duck
+<(· )___+                  ══════════════════════
+ (~~._> +                  Tier: Juvenile ⚡
  ✧`--´  ✧                 XP: 245,000 / 1,000,000
                            ████████░░░░░░░░ 24.5%
  Rarity: Uncommon          Streak: 🔥 4 days (1.3x)

  DEBUGGING ████████████████████░░░░ 68 (+23)
  PATIENCE  ███████████████░░░░░░░░░ 53 (+18)
  WISDOM    ██████████████░░░░░░░░░░ 44 (+9)
  SNARK     ██████░░░░░░░░░░░░░░░░░░ 19 (+4)
  CHAOS     █████░░░░░░░░░░░░░░░░░░░ 12 (+2)

  Next evolution at 1,000,000 XP — keep coding!
```

#### `/evo sync` 輸出

```
  ✅ Synced to platform!
  Profile: https://buddy-evo.vercel.app/u/username
```

#### `/evo stats` 輸出

```
  📊 Lifetime Stats
  ─────────────────────
  Sessions: 15 (380 min total)
  Tool Calls: 420 (12 rejected)
  File Edits: 210
  Test Runs: 45
  Tokens: 180K output / 95K input
  Context Resets: 5
  Force Snips: 3
```

### 1.7 進化引擎（復用 PoC）

直接復用 buddy-evolution PoC 的核心邏輯：

| 模組 | 來源 | 修改 |
|------|------|------|
| `xp.ts` | PoC 原封不動 | 無 |
| `stats.ts` | PoC 原封不動 | 無 |
| `evolution.ts` | PoC 原封不動 | 無 |
| `tiers.ts` | PoC `evolution-types.ts` | 拆出常數 |
| `sprites.ts` | PoC 原封不動 | 無 |
| `evolution-sprites.ts` | PoC 原封不動 | 無 |
| `companion.ts` | PoC 原封不動 | 無（需要 userId 來 roll bones） |

新增模組：
- `transcript-parser.ts` — 解析 transcript 拿 token 數
- `accumulator.ts` — hooks 累加暫存指標
- `display.ts` — 終端機格式化輸出
- `upload.ts` — 平台同步
- `cli.ts` — slash command 入口

### 1.8 User ID 問題

`rollCompanionBones(userId)` 需要 user ID 來產出對應的寵物。Plugin hooks 的 stdin 沒有直接提供 user ID。

**解法**：SessionStart hook 收到 `session_id`，但這不是 account ID。需要：
1. 第一次執行 `/evo` 時，引導用戶登入平台（GitHub OAuth），取得穩定的 user identifier
2. 或者用 `session_id` 的某個穩定前綴（如果 Claude Code 的 session_id 有帳號關聯的話）
3. 最差情況：讓用戶手動設定一個 seed，或用機器 fingerprint

建議採用方案 1 — 反正平台登入也需要 auth，一石二鳥。在 `sync-config.json` 存 GitHub user ID，同時作為 rollCompanionBones 的 seed。

---

## Part 2: Platform

### 2.1 Tech Stack

| 層 | 技術 | 理由 |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR、API routes、Vercel 原生 |
| Styling | Tailwind CSS 4 | 快速開發 |
| DB + Auth | Supabase (Postgres + Auth) | 免費額度夠、GitHub OAuth 內建 |
| 部署 | Vercel Free | 自動部署、HTTPS |
| 語言 | TypeScript | 和 plugin 共用型別 |

### 2.2 資料庫 Schema

```sql
-- 用戶（由 Supabase Auth 管理）
-- auth.users 自動建立

-- 寵物進化狀態（每次 sync 覆蓋）
create table buddies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  github_username text not null,
  
  -- Companion bones (deterministic, for display)
  species text not null,
  rarity text not null,
  eye text not null,
  hat text not null,
  shiny boolean default false,
  base_stats jsonb not null,        -- {"DEBUGGING":45,"PATIENCE":30,...}
  companion_name text,
  
  -- Evolution state
  total_xp bigint default 0,
  tier text default 'hatchling',
  stat_growth jsonb default '{}',   -- {"DEBUGGING":23.5,...}
  streak_days int default 0,
  
  -- Lifetime stats
  lifetime_stats jsonb default '{}',
  
  -- Timestamps
  evolved_at jsonb default '{}',    -- {"hatchling":timestamp,...}
  last_synced_at timestamptz default now(),
  created_at timestamptz default now(),
  
  unique(user_id)
);

-- 成就
create table achievements (
  id uuid primary key default gen_random_uuid(),
  buddy_id uuid references buddies(id) on delete cascade,
  achievement_key text not null,
  unlocked_at timestamptz default now(),
  unique(buddy_id, achievement_key)
);

-- 成就定義（靜態）
create table achievement_definitions (
  key text primary key,
  name text not null,
  description text not null,
  icon text not null,              -- emoji
  category text not null,          -- 'milestone', 'streak', 'usage', 'rare'
  condition jsonb not null         -- {"type":"xp_threshold","value":1000000}
);
```

### 2.3 API Routes

```
POST /api/sync              — 上傳 evolution state（需 auth）
GET  /api/leaderboard       — 排行榜（公開，分頁）
GET  /api/buddy/:username   — 取得某用戶的 buddy（公開）
GET  /api/achievements      — 成就定義列表（公開）
POST /api/auth/token        — 交換 plugin auth token（GitHub OAuth callback 後）
```

#### POST /api/sync

Plugin 呼叫此 API 上傳快照：

```json
{
  "bones": {
    "species": "duck",
    "rarity": "uncommon",
    "eye": "·",
    "hat": "crown",
    "shiny": false,
    "stats": {"DEBUGGING": 45, "PATIENCE": 30, "CHAOS": 20, "WISDOM": 35, "SNARK": 15}
  },
  "evolution": {
    "totalXP": 245000,
    "tier": "juvenile",
    "statGrowth": {"DEBUGGING": 23.5, "PATIENCE": 18.2, "CHAOS": 2.8, "WISDOM": 9.1, "SNARK": 4.3},
    "streak": {"currentDays": 4, "lastSessionDate": "2026-04-01"},
    "lifetimeStats": { ... },
    "evolvedAt": { ... }
  },
  "companionName": "Quackers"
}
```

### 2.4 Pages

```
/                    — Landing page + 全域排行榜
/u/:username         — 個人檔案頁（buddy sprite + 數值 + 成就）
/compare?a=X&b=Y    — 兩隻 buddy 並排比較
/achievements        — 所有成就列表
/login               — GitHub OAuth 登入
/settings            — 設定（plugin token 管理）
```

### 2.5 頁面設計

#### Landing (`/`)

- Hero: ASCII art buddy 動畫 + tagline
- 排行榜 Top 20（XP 排名）
- 各 tier 人數統計
- CTA: "Install the plugin"

#### 個人檔案 (`/u/:username`)

- 大尺寸 buddy sprite（含進化效果，用 CSS 動畫替代 ASCII overlay）
- 物種、稀有度、tier 標籤
- XP 進度條
- 五維雷達圖（base stats + growth）
- 成就徽章牆
- Lifetime stats 摘要

#### 比較 (`/compare`)

- 兩隻 buddy 並排
- 數值對比（誰高誰亮）
- 分享按鈕（產生 OG image）

### 2.6 成就定義（初始）

| Key | 名稱 | 條件 | 類別 |
|-----|------|------|------|
| `first_session` | First Steps | 完成第一次 session | milestone |
| `juvenile` | Growing Up | 達到 Juvenile tier | milestone |
| `adult` | Coming of Age | 達到 Adult tier | milestone |
| `elder` | Ancient Power | 達到 Elder tier | milestone |
| `ascended` | Transcendence | 達到 Ascended tier | milestone |
| `streak_7` | Week Warrior | 連續 7 天 streak | streak |
| `streak_30` | Monthly Devotion | 連續 30 天 streak | streak |
| `tool_1000` | Tool Master | 累計 1000 tool calls | usage |
| `debug_100` | Bug Hunter | DEBUGGING 屬性達 100 | usage |
| `shiny` | Lucky Star | 擁有 shiny buddy | rare |
| `legendary` | One in a Hundred | legendary 稀有度 | rare |
| `million_tokens` | Token Millionaire | 累計 1M output tokens | usage |

### 2.7 Auth Flow

```
1. 用戶在 /login 點「Sign in with GitHub」
2. Supabase Auth 走 GitHub OAuth
3. 登入成功後，前端產生一個 plugin token（長效 JWT 或 random string 存 DB）
4. 用戶複製 token
5. 在 Claude Code 中執行 /evo sync，首次要求貼上 token
6. Token 存入 $CLAUDE_PLUGIN_DATA/sync-config.json
7. 之後的 sync 自動帶 token
```

---

## Part 3: 共用程式碼

Plugin 和 Platform 共用進化引擎和型別定義。結構：

```
buddy-evolution/
├── packages/
│   ├── core/                    # 共用：型別、引擎、sprites
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── evolution-types.ts
│   │   │   ├── xp.ts
│   │   │   ├── stats.ts
│   │   │   ├── evolution.ts
│   │   │   ├── companion.ts
│   │   │   ├── sprites.ts
│   │   │   └── evolution-sprites.ts
│   │   └── package.json
│   ├── plugin/                  # Claude Code plugin
│   │   ├── plugin.json
│   │   ├── hooks/
│   │   ├── skills/
│   │   ├── src/
│   │   └── package.json
│   └── web/                     # Next.js 平台
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   └── lib/
│       └── package.json
├── package.json                 # Monorepo root
├── pnpm-workspace.yaml
└── turbo.json
```

用 **pnpm workspaces + Turborepo** 管理 monorepo。

---

## Part 4: 開發順序

### Phase 1: Plugin MVP
1. 建立 monorepo 結構
2. 將 PoC 核心程式碼移入 `packages/core`
3. 實作 hooks（session tracking）
4. 實作 transcript parser
5. 實作 `/evo` slash command（本地顯示）
6. 測試：手動跑幾個 session 驗證 XP 累積

### Phase 2: Platform MVP
7. 建立 Next.js app
8. 設定 Supabase（DB schema + GitHub OAuth）
9. 實作 sync API
10. 實作 landing page + 排行榜
11. 實作個人檔案頁
12. Plugin 加入 `/evo sync`

### Phase 3: Polish
13. 比較頁面
14. 成就系統
15. OG image 產生（分享用）
16. Plugin 發布到社群

---

## 風險與緩解

| 風險 | 緩解 |
|------|------|
| transcript.jsonl 格式變動 | 防禦性解析，fallback 到 0 token，其他 XP 來源仍運作 |
| Plugin hook 拿不到 user ID | 首次登入平台時取得，存本地 |
| 作弊（假造 XP 上傳） | Phase 1 不處理；後續可加 transcript hash 驗證 |
| Supabase 免費額度用完 | 初期用量極低；若成長再考慮付費或自架 |
| `/buddy` 內建指令改版 | Plugin 完全獨立，不依賴 `/buddy` 的輸出 |
