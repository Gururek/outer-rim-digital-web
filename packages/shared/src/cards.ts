import type { CargoCard, BountyCard, GearModCard, JobCard, CardDefinition } from './types.js';

// ─── BASE MARKET CARDS ────────────────────────────────────────────────────────
// These are the 70 core market cards from the base game.
// Each card has an id, name, deckType, buyCost, sellValue, and effect.

export const MARKET_CARDS: CardDefinition[] = [
  // ── CARGO cards ──────────────────────────────────────────────────────────
  {
    id: 1, name: 'Tibanna Gas', deckType: 'CARGO', buyCost: 2000, sellValue: 1000,
    effectDescription: 'Deliver to destination for 4000 credits.',
    flavorText: 'High-grade blaster gas from Bespin.'
  } as CargoCard,
  {
    id: 2, name: 'Spice', deckType: 'CARGO', buyCost: 3000, sellValue: 1500,
    effectDescription: 'Illegal cargo. Deliver to destination for 6000 credits.',
    flavorText: 'Glitterstim spice from the mines of Kessel.'
  } as CargoCard,
  {
    id: 3, name: 'Droid Parts', deckType: 'CARGO', buyCost: 1500, sellValue: 750,
    effectDescription: 'Deliver to destination for 3000 credits.',
    flavorText: 'Astromech servos and motivator units.'
  } as CargoCard,
  {
    id: 4, name: 'Medical Supplies', deckType: 'CARGO', buyCost: 1000, sellValue: 500,
    effectDescription: 'Deliver to destination for 2500 credits.',
    flavorText: 'Bacta canisters and kolto patches.'
  } as CargoCard,
  {
    id: 5, name: 'Weapons Crate', deckType: 'CARGO', buyCost: 4000, sellValue: 2000,
    effectDescription: 'Deliver to destination for 7000 credits. +1 Ground Combat while carried.',
    flavorText: 'A sealed crate of BlasTech E-11s.'
  } as CargoCard,

  // ── BOUNTY cards ─────────────────────────────────────────────────────────
  {
    id: 10, name: 'Wanted: Zerek Besh', deckType: 'BOUNTY', buyCost: 0, sellValue: 0,
    effectDescription: 'Eliminate: 3000cr + 1 Fame. Capture: 2000cr + 2 Fame.',
    flavorText: 'A disgraced Imperial officer on the run.',
    targetName: 'Zerek Besh',
    targetContactClass: 'WHITE' as const,
    contactCombatValue: 3,
    combatType: 'GROUND' as const,
    eliminationReward: { credits: 3000, fame: 1 },
    captureReward: { credits: 2000, fame: 2, planet: 'coruscant' },
    issuingFaction: 'IMPERIAL' as const
  } as BountyCard,
  {
    id: 11, name: 'Wanted: Kaevee', deckType: 'BOUNTY', buyCost: 0, sellValue: 0,
    effectDescription: 'Eliminate: 4000cr + 1 Fame. Capture: 3000cr + 3 Fame.',
    flavorText: 'Force-sensitive fugitive last seen near Tatooine.',
    targetName: 'Kaevee',
    targetContactClass: 'GREEN' as const,
    contactCombatValue: 4,
    combatType: 'GROUND' as const,
    eliminationReward: { credits: 4000, fame: 1 },
    captureReward: { credits: 3000, fame: 3, planet: 'tatooine' },
    issuingFaction: 'REBEL' as const
  } as BountyCard,
  {
    id: 12, name: 'Wanted: Dengar', deckType: 'BOUNTY', buyCost: 0, sellValue: 0,
    effectDescription: 'Eliminate: 5000cr + 2 Fame. Capture: 4000cr + 3 Fame.',
    flavorText: 'Corellian bounty hunter gone rogue.',
    targetName: 'Dengar',
    targetContactClass: 'YELLOW' as const,
    contactCombatValue: 5,
    combatType: 'GROUND' as const,
    eliminationReward: { credits: 5000, fame: 2 },
    captureReward: { credits: 4000, fame: 3, planet: 'corellia' },
    issuingFaction: 'SYNDICATE' as const
  } as BountyCard,
  {
    id: 13, name: 'Wanted: Rako Hardeen', deckType: 'BOUNTY', buyCost: 0, sellValue: 0,
    effectDescription: 'Eliminate: 3000cr + 1 Fame. Capture: 2500cr + 2 Fame.',
    flavorText: 'Sniper for hire, wanted by the Syndicate.',
    targetName: 'Rako Hardeen',
    targetContactClass: 'GREEN' as const,
    contactCombatValue: 4,
    combatType: 'GROUND' as const,
    eliminationReward: { credits: 3000, fame: 1 },
    captureReward: { credits: 2500, fame: 2, planet: 'nal_hutta' },
    issuingFaction: 'SYNDICATE' as const
  } as BountyCard,
  {
    id: 14, name: 'Wanted: 4-LOM', deckType: 'BOUNTY', buyCost: 0, sellValue: 0,
    effectDescription: 'Eliminate: 3500cr + 1 Fame. Capture: 3000cr + 2 Fame.',
    flavorText: 'Protocol droid turned bounty hunter.',
    targetName: '4-LOM',
    targetContactClass: 'YELLOW' as const,
    contactCombatValue: 5,
    combatType: 'GROUND' as const,
    eliminationReward: { credits: 3500, fame: 1 },
    captureReward: { credits: 3000, fame: 2, planet: 'tatooine' },
    issuingFaction: 'HUTT' as const
  } as BountyCard,

  // ── GEAR cards (isGear: true) ────────────────────────────────────────────
  {
    id: 20, name: 'Vibro-Ax', deckType: 'GEAR_MOD', buyCost: 3000, sellValue: 1500,
    effectDescription: '+2 Ground Combat. Single use: +4 Ground Combat for one combat.',
    flavorText: 'A brutal melee weapon favored by Gamorreans.'
  } as GearModCard,
  {
    id: 21, name: 'Blaster Pistol', deckType: 'GEAR_MOD', buyCost: 2000, sellValue: 1000,
    effectDescription: '+1 Ground Combat.',
    flavorText: 'A trusty DL-44 heavy blaster pistol.'
  } as GearModCard,
  {
    id: 22, name: 'Grappling Hook', deckType: 'GEAR_MOD', buyCost: 1000, sellValue: 500,
    effectDescription: '+1 Stealth skill. Single use.',
    flavorText: 'For when the high ground is the only way out.'
  } as GearModCard,
  {
    id: 23, name: 'Medpac', deckType: 'GEAR_MOD', buyCost: 1500, sellValue: 750,
    effectDescription: 'Single use: Heal 2 character damage.',
    flavorText: 'Emergency kolto injector.'
  } as GearModCard,
  {
    id: 24, name: 'Datapad', deckType: 'GEAR_MOD', buyCost: 2500, sellValue: 1250,
    effectDescription: '+1 Tech skill.',
    flavorText: 'Sliced and loaded with useful information.'
  } as GearModCard,

  // ── MOD cards (isGear: false) ────────────────────────────────────────────
  {
    id: 30, name: 'Upgraded Hyperdrive', deckType: 'GEAR_MOD', buyCost: 4000, sellValue: 2000,
    effectDescription: '+1 Hyperdrive.',
    flavorText: 'A class-1 hyperdrive motivator upgrade.'
  } as GearModCard,
  {
    id: 31, name: 'Shield Generator', deckType: 'GEAR_MOD', buyCost: 5000, sellValue: 2500,
    effectDescription: '+1 Hull.',
    flavorText: 'Deflector shield array augmentation.'
  } as GearModCard,
  {
    id: 32, name: 'Quad Laser Cannons', deckType: 'GEAR_MOD', buyCost: 6000, sellValue: 3000,
    effectDescription: '+1 Attack dice in ship combat.',
    flavorText: 'Aftermarket quad-linked laser cannons.'
  } as GearModCard,
  {
    id: 33, name: 'Smuggling Compartment', deckType: 'GEAR_MOD', buyCost: 2000, sellValue: 1000,
    effectDescription: '+1 Cargo slot.',
    flavorText: 'Hidden panels for the discerning scoundrel.'
  } as GearModCard,
  {
    id: 34, name: 'Crew Quarters', deckType: 'GEAR_MOD', buyCost: 3000, sellValue: 1500,
    effectDescription: '+1 Crew slot.',
    flavorText: 'Bunk expansion module.'
  } as GearModCard,

  // ── JOB cards ────────────────────────────────────────────────────────────
  {
    id: 40, name: 'Smuggling Run', deckType: 'JOB', buyCost: 0, sellValue: 0,
    effectDescription: 'Deliver to destination. Skill check: Piloting. Reward: 3000cr + 1 Fame.',
    flavorText: 'A simple transport job — what could go wrong?'
  } as JobCard,
  {
    id: 41, name: 'Bounty Collection', deckType: 'JOB', buyCost: 0, sellValue: 0,
    effectDescription: 'Find the target. Skill check: Tactics. Reward: 4000cr + 2 Fame.',
    flavorText: 'The Hutt Cartel needs collectors.'
  } as JobCard,
  {
    id: 42, name: 'Data Heist', deckType: 'JOB', buyCost: 0, sellValue: 0,
    effectDescription: 'Slice the mainframe. Skill check: Tech. Reward: 3500cr + 1 Fame.',
    flavorText: 'Imperial data banks are surprisingly vulnerable.'
  } as JobCard,
  {
    id: 43, name: 'Bodyguard Duty', deckType: 'JOB', buyCost: 0, sellValue: 0,
    effectDescription: 'Protect the VIP. Skill check: Strength. Reward: 3000cr + 1 Fame.',
    flavorText: 'Keep the client alive, get paid.'
  } as JobCard,
  {
    id: 44, name: 'Diplomatic Courier', deckType: 'JOB', buyCost: 0, sellValue: 0,
    effectDescription: 'Deliver sensitive materials. Skill check: Influence. Reward: 2500cr + 2 Fame.',
    flavorText: 'The Rebellion needs discreet couriers.'
  } as JobCard,

  // ── LUXURY cards ─────────────────────────────────────────────────────────
  {
    id: 50, name: 'Jedi Holocron', deckType: 'LUXURY', buyCost: 8000, sellValue: 4000,
    effectDescription: 'Worth 1 Fame just for owning. +1 Knowledge skill.',
    flavorText: 'An ancient artifact of immense value.'
  } as CardDefinition,
  {
    id: 51, name: 'Sith Artifact', deckType: 'LUXURY', buyCost: 7000, sellValue: 3500,
    effectDescription: 'Worth 1 Fame just for owning. Reroll one die per combat.',
    flavorText: 'Dark side energy emanates from within.'
  } as CardDefinition,
  {
    id: 52, name: 'Mandalorian Armor', deckType: 'LUXURY', buyCost: 9000, sellValue: 4500,
    effectDescription: '+2 Ground Combat. +1 Fame.',
    flavorText: 'Beskar-plated — the real thing.'
  } as CardDefinition,

  // ── SHIP cards ───────────────────────────────────────────────────────────
  {
    id: 60, name: 'YT-1300 Light Freighter', deckType: 'SHIP', buyCost: 10000, sellValue: 5000,
    effectDescription: 'Hyperdrive 4 | 6 Hull | 3 Cargo | 2 Crew | 2 Mods',
    flavorText: 'A heavily modified Corellian freighter.'
  } as CardDefinition,
  {
    id: 61, name: 'Firespray-31', deckType: 'SHIP', buyCost: 12000, sellValue: 6000,
    effectDescription: 'Hyperdrive 3 | 5 Hull | 2 Cargo | 2 Crew | 3 Mods',
    flavorText: 'Pursuit craft favored by bounty hunters.'
  } as CardDefinition,
  {
    id: 62, name: 'HWK-290', deckType: 'SHIP', buyCost: 8000, sellValue: 4000,
    effectDescription: 'Hyperdrive 5 | 4 Hull | 2 Cargo | 2 Crew | 1 Mod',
    flavorText: 'A fast light freighter for the discerning smuggler.'
  } as CardDefinition,
];

// ─── MARKET DECK HELPERS ──────────────────────────────────────────────────────
export function getCardsByDeck(deckType: string): CardDefinition[] {
  return MARKET_CARDS.filter(c => c.deckType === deckType);
}

export function getCardById(id: number): CardDefinition | undefined {
  return MARKET_CARDS.find(c => c.id === id);
}

export const MARKET_DECK_NAMES: Record<string, string> = {
  BOUNTY: 'Bounty Hunting',
  CARGO: 'Cargo',
  GEAR_MOD: 'Gear & Mods',
  JOB: 'Jobs',
  LUXURY: 'Luxury Items',
  SHIP: 'Ships',
};
