import type { FactionType, MarketDeckType } from './types.js';

// ─── ENCOUNTER CARDS ──────────────────────────────────────────────────────────
// Drawn when a player chooses SPACE_ENCOUNTER in the Encounter phase.
// Each card has a planet context (or 'ANY') and a mechanical effect.

export type EncounterEffectType =
  | 'CREDITS_GAIN' | 'CREDITS_LOSE'
  | 'SHIP_DAMAGE' | 'CHAR_DAMAGE'
  | 'FAME_GAIN'
  | 'REP_GAIN' | 'REP_LOSE'
  | 'CARD_DRAW'
  | 'NOTHING';

export interface EncounterEffect {
  type: EncounterEffectType;
  amount?: number;
  faction?: FactionType;
  deckType?: MarketDeckType;
}

export interface EncounterCard {
  id: number;
  planetId: string;   // planet planetId or 'ANY' for all-planets deck
  title: string;
  description: string;
  effect: EncounterEffect;
}

export const ENCOUNTER_CARDS: EncounterCard[] = [

  // ── TATOOINE ─────────────────────────────────────────────────────────────
  {
    id: 1001, planetId: 'tatooine', title: 'Womp Rat Swarm',
    description: 'A pack of womp rats has chewed through your hull plating. Minor but irritating.',
    effect: { type: 'SHIP_DAMAGE', amount: 1 },
  },
  {
    id: 1002, planetId: 'tatooine', title: 'Tusken Raider Ambush',
    description: 'Sand People attack from the dunes. They vanish before you can retaliate.',
    effect: { type: 'CHAR_DAMAGE', amount: 1 },
  },
  {
    id: 1003, planetId: 'tatooine', title: 'Salvage Find',
    description: 'You stumble across a crashed cargo pod in the Dune Sea. Contents are intact.',
    effect: { type: 'CREDITS_GAIN', amount: 2000 },
  },
  {
    id: 1004, planetId: 'tatooine', title: 'Jabba\'s Toll',
    description: 'Hutt enforcers demand a "transit fee" in Hutt-controlled space. You pay up.',
    effect: { type: 'CREDITS_LOSE', amount: 1500 },
  },
  {
    id: 1005, planetId: 'tatooine', title: 'Cantina Rumor',
    description: 'A well-placed credit buys useful intel at the Mos Eisley Cantina.',
    effect: { type: 'CARD_DRAW', deckType: 'JOB' },
  },
  {
    id: 1006, planetId: 'tatooine', title: 'Krayt Dragon Sighting',
    description: 'A massive krayt dragon crosses your path. You give it a very wide berth.',
    effect: { type: 'NOTHING' },
  },

  // ── RODIA ─────────────────────────────────────────────────────────────────
  {
    id: 2001, planetId: 'rodia', title: 'Swamp Gas Leak',
    description: 'Methane pockets ignite near your hull. Minimal structural damage.',
    effect: { type: 'SHIP_DAMAGE', amount: 1 },
  },
  {
    id: 2002, planetId: 'rodia', title: 'Rodian Hunt Pack',
    description: 'A family hunting party mistakes you for prey. You lose them in the canopy.',
    effect: { type: 'CHAR_DAMAGE', amount: 1 },
  },
  {
    id: 2003, planetId: 'rodia', title: 'Black Market Score',
    description: 'A Rodian fence has rare cargo marked way below value. You buy immediately.',
    effect: { type: 'CREDITS_GAIN', amount: 1500 },
  },
  {
    id: 2004, planetId: 'rodia', title: 'Greedo\'s Cousin',
    description: 'Another Greedo relative tries to collect a supposed debt. You prove it\'s fake.',
    effect: { type: 'NOTHING' },
  },
  {
    id: 2005, planetId: 'rodia', title: 'Salvage Claim Dispute',
    description: 'You get tangled in a Rodian property dispute over abandoned cargo.',
    effect: { type: 'CREDITS_LOSE', amount: 1000 },
  },

  // ── RYLOTH ────────────────────────────────────────────────────────────────
  {
    id: 3001, planetId: 'ryloth', title: 'Separatist Debris Field',
    description: 'Old battle wreckage from the Clone Wars. You navigate through it for scrap.',
    effect: { type: 'CREDITS_GAIN', amount: 1000 },
  },
  {
    id: 3002, planetId: 'ryloth', title: 'Spice Runner Cooperation',
    description: 'Local smugglers offer passage intel in exchange for a blind eye.',
    effect: { type: 'REP_GAIN', faction: 'SYNDICATE', amount: 1 },
  },
  {
    id: 3003, planetId: 'ryloth', title: 'Imperial Blockade',
    description: 'An Imperial patrol forces you into evasive maneuvers. Your hull takes a graze.',
    effect: { type: 'SHIP_DAMAGE', amount: 1 },
  },
  {
    id: 3004, planetId: 'ryloth', title: 'Free Ryloth Movement',
    description: 'Twi\'lek resistance fighters mistake you for an ally. You decide to play along.',
    effect: { type: 'REP_GAIN', faction: 'REBEL', amount: 1 },
  },
  {
    id: 3005, planetId: 'ryloth', title: 'Mining Guild Shakedown',
    description: 'A Mining Guild enforcer demands an illegal "tariff" for passing through.',
    effect: { type: 'CREDITS_LOSE', amount: 1200 },
  },

  // ── MON CALA ──────────────────────────────────────────────────────────────
  {
    id: 4001, planetId: 'mon_cala', title: 'Storm Season',
    description: 'Plasma storms near the surface damage your ventral plating.',
    effect: { type: 'SHIP_DAMAGE', amount: 1 },
  },
  {
    id: 4002, planetId: 'mon_cala', title: 'Rebel Resupply',
    description: 'A Rebel convoy is distributing supplies. You help unload in exchange for payment.',
    effect: { type: 'CREDITS_GAIN', amount: 2000 },
  },
  {
    id: 4003, planetId: 'mon_cala', title: 'Alliance Recognition',
    description: 'Mon Cal officers recognize your service record. Your standing with the Alliance improves.',
    effect: { type: 'REP_GAIN', faction: 'REBEL', amount: 1 },
  },
  {
    id: 4004, planetId: 'mon_cala', title: 'Aquatic Hazard',
    description: 'Landing gear catches on an underwater structure. Minor frame stress.',
    effect: { type: 'SHIP_DAMAGE', amount: 1 },
  },
  {
    id: 4005, planetId: 'mon_cala', title: 'Alliance Intel Cache',
    description: 'A contact drops a job requisition at your feet.',
    effect: { type: 'CARD_DRAW', deckType: 'JOB' },
  },

  // ── GEONOSIS ──────────────────────────────────────────────────────────────
  {
    id: 5001, planetId: 'geonosis', title: 'Geonosian Swarm',
    description: 'Geonosian warriors emerge from the catacombs and swarm your hull.',
    effect: { type: 'SHIP_DAMAGE', amount: 2 },
  },
  {
    id: 5002, planetId: 'geonosis', title: 'Imperial Depot Find',
    description: 'You locate an abandoned Imperial supply cache from a recent withdrawal.',
    effect: { type: 'CREDITS_GAIN', amount: 3000 },
  },
  {
    id: 5003, planetId: 'geonosis', title: 'Sonic Blaster Strike',
    description: 'Geonosian sonic rounds bruise through your shields. You take personal injury.',
    effect: { type: 'CHAR_DAMAGE', amount: 1 },
  },
  {
    id: 5004, planetId: 'geonosis', title: 'Droid Factory Salvage',
    description: 'You strip an abandoned factory floor of useful components.',
    effect: { type: 'CARD_DRAW', deckType: 'GEAR_MOD' },
  },
  {
    id: 5005, planetId: 'geonosis', title: 'Asteroid Ring Debris',
    description: 'The ring debris around Geonosis is thicker than your charts showed.',
    effect: { type: 'SHIP_DAMAGE', amount: 1 },
  },

  // ── CORELLIA ──────────────────────────────────────────────────────────────
  {
    id: 6001, planetId: 'corellia', title: 'CorSec Inspection',
    description: 'Corellian Security Force inspectors delay you — and demand a "processing fee."',
    effect: { type: 'CREDITS_LOSE', amount: 1500 },
  },
  {
    id: 6002, planetId: 'corellia', title: 'Black Market Contact',
    description: 'A dockworker tips you to unregistered cargo going cheap.',
    effect: { type: 'CARD_DRAW', deckType: 'CARGO' },
  },
  {
    id: 6003, planetId: 'corellia', title: 'Shipyard Find',
    description: 'An abandoned berth contains useful ship components.',
    effect: { type: 'CARD_DRAW', deckType: 'GEAR_MOD' },
  },
  {
    id: 6004, planetId: 'corellia', title: 'Pirate Attack',
    description: 'Outlaws ambush you in the transit lanes. Your ship takes fire.',
    effect: { type: 'SHIP_DAMAGE', amount: 1 },
  },
  {
    id: 6005, planetId: 'corellia', title: 'Sabacc Windfall',
    description: 'A lucky hand at a dockside sabacc table.',
    effect: { type: 'CREDITS_GAIN', amount: 2500 },
  },

  // ── ORD MANTELL ───────────────────────────────────────────────────────────
  {
    id: 7001, planetId: 'ord_mantell', title: 'Scavenger Guild',
    description: 'Ord Mantell scavengers strip a component off your hull while you slept.',
    effect: { type: 'SHIP_DAMAGE', amount: 1 },
  },
  {
    id: 7002, planetId: 'ord_mantell', title: 'Junk Market Treasure',
    description: 'The famous Ord Mantell junk markets turn up something valuable.',
    effect: { type: 'CARD_DRAW', deckType: 'GEAR_MOD' },
  },
  {
    id: 7003, planetId: 'ord_mantell', title: 'Imperial Remnant Tip',
    description: 'An Imperial defector offers information for safe passage. You take the deal.',
    effect: { type: 'CREDITS_GAIN', amount: 2000 },
  },
  {
    id: 7004, planetId: 'ord_mantell', title: 'Separatist Cache',
    description: 'Old CIS war chest buried under the waste dumps. Still spendable.',
    effect: { type: 'CREDITS_GAIN', amount: 1500 },
  },
  {
    id: 7005, planetId: 'ord_mantell', title: 'Syndicate Tax',
    description: 'Black Sun collectors enforce their territory. Payment is non-optional.',
    effect: { type: 'CREDITS_LOSE', amount: 1000 },
  },

  // ── NAL HUTTA ─────────────────────────────────────────────────────────────
  {
    id: 8001, planetId: 'nal_hutta', title: 'Hutt Extortion',
    description: 'A Hutt lieutenant demands a personal tribute for using his airspace.',
    effect: { type: 'CREDITS_LOSE', amount: 2000 },
  },
  {
    id: 8002, planetId: 'nal_hutta', title: 'Cartel Favor',
    description: 'You did a small service for a Hutt associate. Reputation improved.',
    effect: { type: 'REP_GAIN', faction: 'HUTT', amount: 1 },
  },
  {
    id: 8003, planetId: 'nal_hutta', title: 'Swamp Toxic Vents',
    description: 'Chemical gas vents corrode your ship\'s lower hull.',
    effect: { type: 'SHIP_DAMAGE', amount: 1 },
  },
  {
    id: 8004, planetId: 'nal_hutta', title: 'Hutlaar Deal',
    description: 'A small-time Hutt broker offers a sweetheart deal to build goodwill.',
    effect: { type: 'CARD_DRAW', deckType: 'CARGO' },
  },
  {
    id: 8005, planetId: 'nal_hutta', title: 'Desilijic Debt Collector',
    description: 'A case of mistaken identity costs you a scuffle and some credits.',
    effect: { type: 'CREDITS_LOSE', amount: 1000 },
  },

  // ── KESSEL ───────────────────────────────────────────────────────────────
  {
    id: 9001, planetId: 'kessel', title: 'Spice Mine Fumes',
    description: 'Kessel\'s atmospheric toxins seep through your hull seals.',
    effect: { type: 'CHAR_DAMAGE', amount: 2 },
  },
  {
    id: 9002, planetId: 'kessel', title: 'Mining Guild Patrol',
    description: 'A Guild corvette challenges you. You talk your way through but pay a fee.',
    effect: { type: 'CREDITS_LOSE', amount: 2000 },
  },
  {
    id: 9003, planetId: 'kessel', title: 'Abandoned Spice Cache',
    description: 'Escaped slaves left behind a partial spice haul. You "recover" it.',
    effect: { type: 'CREDITS_GAIN', amount: 3500 },
  },
  {
    id: 9004, planetId: 'kessel', title: 'Maw Navigation Hazard',
    description: 'The black hole cluster near Kessel plays havoc with your nav systems.',
    effect: { type: 'SHIP_DAMAGE', amount: 2 },
  },
  {
    id: 9005, planetId: 'kessel', title: 'Droid Uprising Remnant',
    description: 'Malfunctioning mining droids attack your landing struts before shutdown.',
    effect: { type: 'SHIP_DAMAGE', amount: 1 },
  },

  // ── ANY PLANET (wild draws) ───────────────────────────────────────────────
  {
    id: 9901, planetId: 'ANY', title: 'Deep Space Debris',
    description: 'Uncharted debris field in the transit lane. Minor hull impact.',
    effect: { type: 'SHIP_DAMAGE', amount: 1 },
  },
  {
    id: 9902, planetId: 'ANY', title: 'Hyperspace Miscalculation',
    description: 'Rough re-entry on the far side. Your co-pilot is not impressed.',
    effect: { type: 'NOTHING' },
  },
  {
    id: 9903, planetId: 'ANY', title: 'Freelance Reward',
    description: 'A grateful recipient of an earlier job forwards a small honorarium.',
    effect: { type: 'CREDITS_GAIN', amount: 1500 },
  },
  {
    id: 9904, planetId: 'ANY', title: 'Equipment Malfunction',
    description: 'A critical system fails mid-transit. Emergency repair costs credits.',
    effect: { type: 'CREDITS_LOSE', amount: 1000 },
  },
  {
    id: 9905, planetId: 'ANY', title: 'Black Market Tip',
    description: 'An anonymous comm drop leads to a lucrative opportunity.',
    effect: { type: 'CARD_DRAW', deckType: 'JOB' },
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export function getEncountersForPlanet(planetId: string): EncounterCard[] {
  return ENCOUNTER_CARDS.filter(c => c.planetId === planetId || c.planetId === 'ANY');
}

export function drawRandomEncounter(planetId: string): EncounterCard {
  const pool = getEncountersForPlanet(planetId);
  const fallback = ENCOUNTER_CARDS.filter(c => c.planetId === 'ANY');
  const deck = pool.length > 0 ? pool : fallback;
  return deck[Math.floor(Math.random() * deck.length)];
}
