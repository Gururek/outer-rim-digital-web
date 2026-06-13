# Star Wars: Outer Rim Digital — Project Context

## What This Is
A browser-based multiplayer implementation of the Star Wars Outer Rim board game.
- Local LAN play only — no external hosting needed
- `./start.sh` builds the server and starts both server (:2567) and client (:5173)

## Stack
- **Monorepo**: pnpm workspaces + Turborepo
- **Packages**: `@outer-rim/shared`, `@outer-rim/server` (Colyseus v0.15), `@outer-rim/client` (React + Vite + React Three Fiber)
- **Server**: Must compile via `tsc` then run with `node dist/index.js` — tsx/esbuild breaks Colyseus decorators
- **TypeScript**: strict mode across all packages
- **GitHub remote**: `git@github.com:Gururek/outer-rim-digital-web.git` (SSH key auth)

## Architecture
```
packages/
  shared/      — Types, constants, MAP_NODES, CHARACTERS (16), SHIPS (15), MARKET_CARDS, DATABANK_CARDS
  server/      — Colyseus GameRoom + TurnMachine + CombatResolver + DeckManager + PatrolManager
  client/      — React + R3F scene, Zustand stores, Cockpit UI
```

## Client Scene Files (3D)
```
src/scenes/
  GalaxyMap.tsx              — Canvas, lights, Stars, post-processing (Bloom 0.5 + mipmapBlur, Vignette, ChromaticAberration)
  fx/
    NebulaBackground.tsx     — Multi-layer cloud nebula (5 cloud textures, 7 planes at varied heights), arch tube glow
    HyperspaceLines.tsx      — TubeGeometry dual-lane (bright core + additive glow halo)
  nodes/
    PlanetNode.tsx           — Canvas textures per planet type, dual additive atmosphere spheres, volcanic/anomaly emissive
    NavPointNode.tsx         — Triple-ring holographic beacon (3 counter-rotating torii + icosahedron gem)
  ships/
    PlayerShip.tsx           — 4 geometry classes: fighter / freighter / heavy / gunship
    PatrolShip.tsx           — Faction-specific geometry: Imperial wedge, Rebel X-foil, Hutt barge, Syndicate shard
    CameraAnimator.tsx
```

## Client UI Files
```
src/ui/
  LobbyScreen.tsx            — Character/ship select, SVG hex portraits, join/create
  CockpitOverlay.tsx         — Header bar, minimap, systems panel
  SettingsPanel.tsx          — uiScale slider (0.5-2), sfxVolume, musicVolume
  CombatOverlay.tsx          — Cinematic patrol intercept banner + 3D dice combat sequence (R3F canvas)
  JobSequenceOverlay.tsx     — Per-player job result: skill rows, outcome, earned credits
  PlanetEnvironment.tsx      — Corner atmosphere glows + canon lore label per current planet
  FactionInsignia.tsx        — SVG faction insignias (Imperial cog, Rebel starbird, Hutt crest, Syndicate gem)
  Cockpit/Cockpit.tsx        — RepBar with insignia icons + faction full names
src/stores/
  gameStore.ts               — Zustand, mirrors Colyseus server state; connectionStatus union
  settingsStore.ts           — localStorage-persisted settings
src/hooks/
  useAudio.ts                — Howler faction music (Star Wars OST via archive.org CDN) + Web Audio API SFX
  useGameRoom.ts             — Colyseus connect/join/leave + auto-reconnect (reconnectionToken, 4s retry, 28s timeout)
```

## Game Data (packages/shared/src/characters.ts)
- **16 characters**: 8 base + 8 Unfinished Business expansion — real stats from physical cards
- **15 ships**: G9 Rigger (free starter), through Firespray-31 (20k), VCX-100 (25k)
- Real HP, combat values, skills, faction reputations, personal goals, ship stats

## Audio
Faction music via Howler + Internet Archive CDN (CORS: `access-control-allow-origin: *`):
- MENU: Star Wars Main Theme (tvtunes_7011)
- IMPERIAL: Imperial March (tvtunes_12997)
- REBEL: Battle of Yavin — X-Wings Draw Fire / Use the Force (0413BinarySunsetAlternate_201707, track 0510)
- HUTT: Cantina Band (cantina-band-star-wars)
- SYNDICATE: Duel of the Fates (star-wars-episode-1-soundtrack-duel-of-the-fates)
- Local override: drop `{KEY}.mp3` in `packages/client/public/audio/` — Howler `src` array tries local first
- `html5: true` on all Howl instances (follows 302 redirects)
- SFX: Web Audio API FM synthesis (R2-D2 chirps), noise bursts (blasters), oscillator synth (hyperspace)

## UI Scaling
- `useLayoutEffect` in App.tsx applies CSS zoom to root + inverse dimensions
- Settings: uiScale 0.5–2.0, presets for 4K / 1080p / Couch

## Known Gaps / TODO
- Solo testing mode (requires ≥2 players to start)
- Encounter decks — server has TODO stubs
