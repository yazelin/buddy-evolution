#!/usr/bin/env node
import { rollCompanionBones } from '@buddy-evolution/core';
import { loadEvolutionState } from './evolution-store.js';
import { renderEvoStatus, renderEvoStats } from './display.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getSyncConfigPath, getDataDir } from './paths.js';
function loadSyncConfig() {
    const path = getSyncConfigPath();
    if (!existsSync(path))
        return null;
    try {
        return JSON.parse(readFileSync(path, 'utf-8'));
    }
    catch {
        return null;
    }
}
function saveSyncConfig(config) {
    const dir = getDataDir();
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    writeFileSync(getSyncConfigPath(), JSON.stringify(config, null, 2), 'utf-8');
}
function getBones(config) {
    if (config?.customBones)
        return config.customBones;
    return rollCompanionBones(config?.userId || 'default-user');
}
async function handleSync() {
    const config = loadSyncConfig();
    if (!config || !config.apiToken) {
        console.log('  Not configured. Visit the platform to get your sync token.');
        console.log('  Then run: /evo sync <token>');
        return;
    }
    const state = loadEvolutionState();
    const bones = getBones(config);
    try {
        const res = await fetch(`${config.platformUrl}/api/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiToken}`,
            },
            body: JSON.stringify({
                bones,
                evolution: state,
                companionName: config.companionName,
                githubUsername: config.userId,
            }),
        });
        if (res.ok) {
            console.log('  Synced to platform!');
            console.log(`  Profile: ${config.platformUrl}/u/${config.userId}`);
        }
        else {
            console.log(`  Sync failed: ${res.status} ${res.statusText}`);
        }
    }
    catch (err) {
        console.log(`  Sync failed: ${err instanceof Error ? err.message : 'network error'}`);
    }
}
function handleSetup(jsonArg) {
    if (!jsonArg) {
        console.log('  Usage: /evo setup \'<JSON>\'');
        console.log('  Example: /evo setup \'{"species":"blob","rarity":"epic","eye":"✦","hat":"none","shiny":false,"stats":{"DEBUGGING":27,"PATIENCE":72,"CHAOS":49,"WISDOM":100,"SNARK":70},"name":"Zephyrost"}\'');
        return;
    }
    let data;
    try {
        data = JSON.parse(jsonArg);
    }
    catch {
        console.log('  Error: Invalid JSON');
        return;
    }
    const { species, rarity, eye, hat, shiny, stats, name } = data;
    if (!species || !rarity || !eye || !stats) {
        console.log('  Error: Missing required fields (species, rarity, eye, stats)');
        return;
    }
    const customBones = {
        species,
        rarity,
        eye,
        hat: hat || 'none',
        shiny: shiny || false,
        stats: {
            DEBUGGING: stats.DEBUGGING || 0,
            PATIENCE: stats.PATIENCE || 0,
            CHAOS: stats.CHAOS || 0,
            WISDOM: stats.WISDOM || 0,
            SNARK: stats.SNARK || 0,
        },
        inspirationSeed: 0,
    };
    const config = loadSyncConfig() || {
        userId: '',
        apiToken: '',
        platformUrl: 'https://buddy-evolution-web.vercel.app',
        companionName: name || 'Buddy',
    };
    config.customBones = customBones;
    if (name)
        config.companionName = name;
    saveSyncConfig(config);
    console.log(`  Buddy imported: ${name || species} the ${species.charAt(0).toUpperCase() + species.slice(1)}`);
    console.log(`  Rarity: ${rarity}, Eye: ${eye}, Shiny: ${shiny || false}`);
    console.log(`  Stats: DEBUG=${stats.DEBUGGING} PAT=${stats.PATIENCE} CHAOS=${stats.CHAOS} WIS=${stats.WISDOM} SNARK=${stats.SNARK}`);
    console.log('');
    console.log('  Run /evo to see your buddy!');
    registerHooks();
}
function registerHooks() {
    const settingsPath = join(process.env.HOME || '', '.claude', 'settings.json');
    if (!existsSync(settingsPath)) {
        console.log('  ⚠ ~/.claude/settings.json not found, skipping hook registration');
        return;
    }
    let settings;
    try {
        settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    }
    catch {
        console.log('  ⚠ Could not parse settings.json');
        return;
    }
    if (!settings.hooks)
        settings.hooks = {};
    const cacheBase = join(process.env.HOME || '', '.claude', 'plugins', 'cache', 'buddy-evolution', 'buddy-evolution');
    let pluginRoot = '';
    if (existsSync(cacheBase)) {
        const versions = readdirSync(cacheBase).sort();
        if (versions.length > 0) {
            pluginRoot = join(cacheBase, versions[versions.length - 1]);
        }
    }
    if (!pluginRoot) {
        console.log('  ⚠ Could not find plugin cache directory');
        return;
    }
    const hookDefs = [
        { event: 'SessionStart', script: 'on-session-start.sh', timeout: 5 },
        { event: 'PostToolUse', matcher: 'Bash|Edit|Write|NotebookEdit', script: 'on-tool-use.sh', timeout: 3, async: true },
        { event: 'PostToolUseFailure', script: 'on-tool-fail.sh', timeout: 3, async: true },
        { event: 'PostCompact', script: 'on-compact.sh', timeout: 3, async: true },
        { event: 'SessionEnd', script: 'on-session-end.sh', timeout: 30 },
    ];
    let added = 0;
    for (const def of hookDefs) {
        if (!settings.hooks[def.event])
            settings.hooks[def.event] = [];
        const arr = settings.hooks[def.event];
        const alreadyExists = arr.some((e) => e.hooks?.some((h) => h.command?.includes('buddy-evolution')));
        if (alreadyExists)
            continue;
        const entry = {
            ...(def.matcher ? { matcher: def.matcher } : {}),
            hooks: [{
                    type: 'command',
                    command: `bash "${pluginRoot}/hooks/${def.script}"`,
                    timeout: def.timeout,
                    ...(def.async ? { async: true } : {}),
                }],
        };
        arr.push(entry);
        added++;
    }
    if (added === 0) {
        console.log('  ✓ Hooks already registered');
    }
    else {
        writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
        console.log(`  ✓ Registered ${added} hooks in settings.json`);
        console.log('  ⚡ Restart Claude Code (new session) for hooks to take effect');
    }
}
function handleConnect(tokenArg) {
    if (!tokenArg) {
        console.log('  Usage: /evo connect <token>');
        console.log('');
        console.log('  Get your token at: https://buddy-evolution-web.vercel.app/login');
        console.log('  Sign in → Settings → Generate Token → copy the token string');
        return;
    }
    // Token might be the raw token or a JSON config blob
    let userId = '';
    let apiToken = tokenArg.trim();
    try {
        const parsed = JSON.parse(tokenArg);
        if (parsed.apiToken) {
            apiToken = parsed.apiToken;
            userId = parsed.userId || '';
        }
    }
    catch {
        // Not JSON, treat as raw token
    }
    const config = loadSyncConfig() || {
        userId: '',
        apiToken: '',
        platformUrl: 'https://buddy-evolution-web.vercel.app',
        companionName: 'Buddy',
    };
    config.apiToken = apiToken;
    if (userId)
        config.userId = userId;
    config.platformUrl = 'https://buddy-evolution-web.vercel.app';
    saveSyncConfig(config);
    console.log('  Connected to platform!');
    if (userId)
        console.log(`  User: ${userId}`);
    console.log(`  Token: ${apiToken.slice(0, 8)}...${apiToken.slice(-4)}`);
    console.log('');
    console.log('  Run /evo sync to upload your buddy.');
}
async function main() {
    const args = process.argv.slice(2);
    const subcommand = args[0] || 'status';
    const config = loadSyncConfig();
    const companionName = config?.companionName || 'Buddy';
    const bones = getBones(config);
    const state = loadEvolutionState();
    switch (subcommand) {
        case 'status':
            console.log(renderEvoStatus(bones, state, companionName));
            break;
        case 'stats':
            console.log(renderEvoStats(state));
            break;
        case 'sync':
            await handleSync();
            break;
        case 'setup':
            handleSetup(args.slice(1).join(' '));
            break;
        case 'connect':
            handleConnect(args.slice(1).join(' '));
            break;
        case 'install-hooks':
            registerHooks();
            break;
        default:
            console.log('Usage: /evo [status|stats|sync|setup|connect|install-hooks]');
            break;
    }
}
main().catch(console.error);
//# sourceMappingURL=cli.js.map