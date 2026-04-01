#!/bin/bash
# Session end: parse transcript, calculate XP, update evolution state
# Uses inline Node.js — no build step required

DATA_DIR="${CLAUDE_PLUGIN_DATA:-$HOME/.buddy-evolution}"
SESSION_FILE="$DATA_DIR/current-session.json"
EVO_FILE="$DATA_DIR/evolution-state.json"
SYNC_FILE="$DATA_DIR/sync-config.json"

[ -f "$SESSION_FILE" ] || exit 0

# Read hook input (transcript_path from stdin)
HOOK_INPUT=$(cat)

# Run all XP calculation inline with Node.js
node -e '
const fs = require("fs");
const dataDir = process.env.DATA_DIR;
const hookInput = process.env.HOOK_INPUT;

// --- Parse transcript ---
let inputTokens = 0, outputTokens = 0;
try {
  const parsed = JSON.parse(hookInput);
  const tp = parsed.transcript_path || "";
  if (tp && fs.existsSync(tp)) {
    const lines = fs.readFileSync(tp, "utf-8").split("\n").filter(l => l.trim());
    for (const line of lines) {
      try {
        const e = JSON.parse(line);
        const u = e?.message?.usage;
        if (u) { inputTokens += (u.input_tokens||0); outputTokens += (u.output_tokens||0); }
      } catch {}
    }
  }
} catch {}

// --- Read session state ---
let session;
try { session = JSON.parse(fs.readFileSync(dataDir + "/current-session.json", "utf-8")); } catch { process.exit(0); }
const durationMin = Math.floor((Date.now() - session.startTime) / 60000);
const today = new Date().toISOString().slice(0, 10);

// --- Read evolution state ---
let evo;
try { evo = JSON.parse(fs.readFileSync(dataDir + "/evolution-state.json", "utf-8")); } catch {
  evo = { totalXP:0, tier:"hatchling", lifetimeStats:{totalOutputTokens:0,totalInputTokens:0,totalToolCalls:0,totalSessions:0,totalSessionMinutes:0,rejectedToolCalls:0,forceSnips:0,contextResets:0,fileEdits:0,testRuns:0}, streak:{currentDays:0,lastSessionDate:""}, statGrowth:{DEBUGGING:0,PATIENCE:0,CHAOS:0,WISDOM:0,SNARK:0}, evolvedAt:{hatchling:null,juvenile:null,adult:null,elder:null,ascended:null} };
}

// --- Update streak ---
let streak = { ...evo.streak };
if (!streak.lastSessionDate) { streak = { currentDays: 1, lastSessionDate: today }; }
else {
  const diff = Math.round((new Date(today+"T00:00:00") - new Date(streak.lastSessionDate+"T00:00:00")) / 86400000);
  if (diff === 0) { /* same day */ }
  else if (diff === 1) { streak = { currentDays: streak.currentDays + 1, lastSessionDate: today }; }
  else { streak = { currentDays: 1, lastSessionDate: today }; }
}

// --- Calculate XP ---
const streakMult = Math.min(2.0, 1.0 + Math.max(0, streak.currentDays - 1) * 0.1);
const baseXP = outputTokens * 1.0 + inputTokens * 0.5 + session.toolCalls * 100 + (durationMin >= 30 ? 5000 : 0);
const xpGained = Math.floor(baseXP * streakMult);

// --- Accumulate ---
const totalXP = evo.totalXP + xpGained;
const ls = evo.lifetimeStats;
ls.totalOutputTokens += outputTokens;
ls.totalInputTokens += inputTokens;
ls.totalToolCalls += session.toolCalls;
ls.totalSessions += 1;
ls.totalSessionMinutes += durationMin;
ls.rejectedToolCalls += session.rejectedToolCalls;
ls.forceSnips += session.forceSnips;
ls.contextResets += session.contextResets;
ls.fileEdits += session.fileEdits;
ls.testRuns += session.testRuns;

// --- Stat growth ---
const sg = { ...evo.statGrowth };
const drivers = {
  DEBUGGING: (session.fileEdits*2 + session.testRuns*5) * 0.1,
  WISDOM: inputTokens * 0.0001,
  CHAOS: (session.rejectedToolCalls / Math.max(1, session.toolCalls)) * 10,
  PATIENCE: durationMin * 0.05,
  SNARK: (session.forceSnips*3 + session.contextResets*2) * 0.2,
};
for (const [stat, raw] of Object.entries(drivers)) {
  if (raw > 0) sg[stat] += raw * (100 / (100 + sg[stat]));
}

// --- Resolve tier ---
const tiers = [["ascended",100000000],["elder",10000000],["adult",1000000],["juvenile",100000],["hatchling",0]];
let newTier = "hatchling";
for (const [t, th] of tiers) { if (totalXP >= th) { newTier = t; break; } }

const tierChanged = newTier !== evo.tier;
const evolvedAt = { ...evo.evolvedAt };
if (tierChanged && evolvedAt[newTier] === null) evolvedAt[newTier] = Date.now();

// --- Save ---
const newEvo = { totalXP, tier: newTier, lifetimeStats: ls, streak, statGrowth: sg, evolvedAt };
if (newTier === "ascended" && !evo.customTitle) newEvo.customTitle = "The Ascended";
fs.writeFileSync(dataDir + "/evolution-state.json", JSON.stringify(newEvo, null, 2));

// --- Cleanup session file ---
try { fs.unlinkSync(dataDir + "/current-session.json"); } catch {}

// --- Auto sync (silent) ---
try {
  if (fs.existsSync(dataDir + "/sync-config.json")) {
    const cfg = JSON.parse(fs.readFileSync(dataDir + "/sync-config.json", "utf-8"));
    if (cfg.apiToken && cfg.platformUrl) {
      const bones = cfg.customBones || { species:"unknown", rarity:"common", eye:"·", hat:"none", shiny:false, stats:{DEBUGGING:50,PATIENCE:50,CHAOS:50,WISDOM:50,SNARK:50}, inspirationSeed:0 };
      fetch(cfg.platformUrl + "/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + cfg.apiToken },
        body: JSON.stringify({ bones, evolution: newEvo, companionName: cfg.companionName || "Buddy", githubUsername: cfg.userId })
      }).catch(() => {});
    }
  }
} catch {}

if (tierChanged) console.error("[buddy-evo] Evolved to " + newTier + "! (+" + xpGained + " XP)");
' 2>/dev/null

exit 0
