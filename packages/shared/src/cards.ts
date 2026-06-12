import type {
  CargoCard, BountyCard, GearModCard, JobCard, CardDefinition,
} from './types.js';

// ─── MARKET CARDS ─────────────────────────────────────────────────────────────
// ID ranges:  CARGO 1-15 | BOUNTY 101-115 | GEAR 201-210 | MOD 211-220
//             JOB 301-315 | LUXURY 401-410 | SHIP 501-510

export const MARKET_CARDS: CardDefinition[] = [

  // ════════════════════════════════════════════════════════
  // CARGO
  // ════════════════════════════════════════════════════════
  {
    id: 1, name: 'Tibanna Gas Canisters', deckType: 'CARGO',
    buyCost: 2000, sellValue: 1000,
    effectDescription: 'Deliver to Corellia for 4000 credits.',
    flavorText: 'High-grade blaster gas from Cloud City.',
    destinationPlanetId: 'corellia', deliveryReward: 4000, isIllegal: false,
  } as CargoCard,
  {
    id: 2, name: 'Glitterstim Spice', deckType: 'CARGO',
    buyCost: 3000, sellValue: 1500,
    effectDescription: 'ILLEGAL. Deliver to Tatooine for 6000 credits.',
    flavorText: 'Mined in the darkness of the Kessel spice mines.',
    destinationPlanetId: 'tatooine', deliveryReward: 6000, isIllegal: true,
    cannotBuyOnPlanetId: 'tatooine',
  } as CargoCard,
  {
    id: 3, name: 'Droid Chassis Parts', deckType: 'CARGO',
    buyCost: 1500, sellValue: 750,
    effectDescription: 'Deliver to Geonosis for 3000 credits.',
    flavorText: 'Bulk astromech and protocol droid components.',
    destinationPlanetId: 'geonosis', deliveryReward: 3000, isIllegal: false,
  } as CargoCard,
  {
    id: 4, name: 'Bacta Tanks', deckType: 'CARGO',
    buyCost: 1000, sellValue: 500,
    effectDescription: 'Deliver to Mon Cala for 2500 credits.',
    flavorText: 'Healing kolto suspension — urgently needed.',
    destinationPlanetId: 'mon_cala', deliveryReward: 2500, isIllegal: false,
  } as CargoCard,
  {
    id: 5, name: 'Blaster Shipment', deckType: 'CARGO',
    buyCost: 4000, sellValue: 2000,
    effectDescription: 'Deliver to Ord Mantell for 7000 credits. +1 Ground Combat while carried.',
    flavorText: 'A sealed crate of BlasTech E-11 carbines.',
    destinationPlanetId: 'ord_mantell', deliveryReward: 7000, isIllegal: false,
  } as CargoCard,
  {
    id: 6, name: 'Nuna Meat Crates', deckType: 'CARGO',
    buyCost: 800, sellValue: 400,
    effectDescription: 'Deliver to Rodia for 2000 credits.',
    flavorText: 'Swamp bird jerky — surprisingly popular.',
    destinationPlanetId: 'rodia', deliveryReward: 2000, isIllegal: false,
  } as CargoCard,
  {
    id: 7, name: 'Kyber Crystal Cache', deckType: 'CARGO',
    buyCost: 5000, sellValue: 2500,
    effectDescription: 'ILLEGAL. Deliver to Ryloth for 8000 credits.',
    flavorText: 'Imperial confiscation order pending. Handle discreetly.',
    destinationPlanetId: 'ryloth', deliveryReward: 8000, isIllegal: true,
  } as CargoCard,
  {
    id: 8, name: 'Contraband Holocrons', deckType: 'CARGO',
    buyCost: 3500, sellValue: 1750,
    effectDescription: 'ILLEGAL. Deliver to Nal Hutta for 5500 credits.',
    flavorText: 'Force artifacts the Hutts pay well for.',
    destinationPlanetId: 'nal_hutta', deliveryReward: 5500, isIllegal: true,
  } as CargoCard,
  {
    id: 9, name: 'Coaxium Canister', deckType: 'CARGO',
    buyCost: 4500, sellValue: 2250,
    effectDescription: 'ILLEGAL. Deliver to Kessel for 6000 credits.',
    flavorText: 'Refined hyperspace fuel. Volatile. Do not drop.',
    destinationPlanetId: 'kessel', deliveryReward: 6000, isIllegal: true,
    cannotBuyOnPlanetId: 'kessel',
  } as CargoCard,
  {
    id: 10, name: 'Mandalorian Iron', deckType: 'CARGO',
    buyCost: 2500, sellValue: 1250,
    effectDescription: 'Deliver to Geonosis for 4500 credits.',
    flavorText: 'Beskar ore — highly sought by weapons manufacturers.',
    destinationPlanetId: 'geonosis', deliveryReward: 4500, isIllegal: false,
  } as CargoCard,

  // ════════════════════════════════════════════════════════
  // BOUNTY
  // ════════════════════════════════════════════════════════
  {
    id: 101, name: 'Wanted: Zerek Besh', deckType: 'BOUNTY',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Eliminate: 3000cr + 1 Fame. Capture: 2000cr + 2 Fame.',
    flavorText: 'A disgraced Imperial officer gone underground.',
    targetName: 'Zerek Besh', targetContactClass: 'WHITE', contactCombatValue: 3,
    combatType: 'GROUND',
    eliminationReward: { credits: 3000, fame: 1 },
    captureReward: { credits: 2000, fame: 2, planet: 'corellia' },
    issuingFaction: 'IMPERIAL',
  } as BountyCard,
  {
    id: 102, name: 'Wanted: Kaevee', deckType: 'BOUNTY',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Eliminate: 4000cr + 1 Fame. Capture: 3000cr + 3 Fame.',
    flavorText: 'Force-sensitive fugitive last seen near Tatooine.',
    targetName: 'Kaevee', targetContactClass: 'GREEN', contactCombatValue: 4,
    combatType: 'GROUND',
    eliminationReward: { credits: 4000, fame: 1 },
    captureReward: { credits: 3000, fame: 3, planet: 'tatooine' },
    issuingFaction: 'REBEL',
  } as BountyCard,
  {
    id: 103, name: 'Wanted: Dengar', deckType: 'BOUNTY',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Eliminate: 5000cr + 2 Fame. Capture: 4000cr + 3 Fame.',
    flavorText: 'Corellian bounty hunter gone rogue.',
    targetName: 'Dengar', targetContactClass: 'YELLOW', contactCombatValue: 5,
    combatType: 'GROUND',
    eliminationReward: { credits: 5000, fame: 2 },
    captureReward: { credits: 4000, fame: 3, planet: 'corellia' },
    issuingFaction: 'SYNDICATE',
  } as BountyCard,
  {
    id: 104, name: 'Wanted: Rako Hardeen', deckType: 'BOUNTY',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Eliminate: 3000cr + 1 Fame. Capture: 2500cr + 2 Fame.',
    flavorText: 'Sharpshooter-for-hire, wanted dead or alive.',
    targetName: 'Rako Hardeen', targetContactClass: 'GREEN', contactCombatValue: 4,
    combatType: 'GROUND',
    eliminationReward: { credits: 3000, fame: 1 },
    captureReward: { credits: 2500, fame: 2, planet: 'nal_hutta' },
    issuingFaction: 'SYNDICATE',
  } as BountyCard,
  {
    id: 105, name: 'Wanted: 4-LOM', deckType: 'BOUNTY',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Eliminate: 3500cr + 1 Fame. Capture: 3000cr + 2 Fame.',
    flavorText: 'Protocol droid gone rogue — now hunts for profit.',
    targetName: '4-LOM', targetContactClass: 'YELLOW', contactCombatValue: 5,
    combatType: 'GROUND',
    eliminationReward: { credits: 3500, fame: 1 },
    captureReward: { credits: 3000, fame: 2, planet: 'tatooine' },
    issuingFaction: 'HUTT',
  } as BountyCard,
  {
    id: 106, name: 'Wanted: Aurra Sing', deckType: 'BOUNTY',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Eliminate: 4500cr + 2 Fame. Capture: 3500cr + 3 Fame.',
    flavorText: 'Pale assassin. Deadly at range. Wanted in 9 systems.',
    targetName: 'Aurra Sing', targetContactClass: 'YELLOW', contactCombatValue: 5,
    combatType: 'GROUND',
    eliminationReward: { credits: 4500, fame: 2 },
    captureReward: { credits: 3500, fame: 3, planet: 'nal_hutta' },
    issuingFaction: 'HUTT',
  } as BountyCard,
  {
    id: 107, name: 'Wanted: Cad Bane', deckType: 'BOUNTY',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Eliminate: 6000cr + 2 Fame. Capture: 5000cr + 3 Fame.',
    flavorText: 'The galaxy\'s most dangerous gun-for-hire.',
    targetName: 'Cad Bane', targetContactClass: 'ORANGE', contactCombatValue: 6,
    combatType: 'GROUND',
    eliminationReward: { credits: 6000, fame: 2 },
    captureReward: { credits: 5000, fame: 3, planet: 'tatooine' },
    issuingFaction: 'IMPERIAL',
  } as BountyCard,
  {
    id: 108, name: 'Wanted: Embo', deckType: 'BOUNTY',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Eliminate: 5000cr + 2 Fame. Capture: 4000cr + 3 Fame.',
    flavorText: 'Kyuzo hunter. Uses his hat as a lethal weapon.',
    targetName: 'Embo', targetContactClass: 'YELLOW', contactCombatValue: 5,
    combatType: 'GROUND',
    eliminationReward: { credits: 5000, fame: 2 },
    captureReward: { credits: 4000, fame: 3, planet: 'rodia' },
    issuingFaction: 'SYNDICATE',
  } as BountyCard,

  // ════════════════════════════════════════════════════════
  // GEAR  (isGear: true — equips to character gear slots)
  // ════════════════════════════════════════════════════════
  {
    id: 201, name: 'Vibro-Ax', deckType: 'GEAR_MOD',
    buyCost: 3000, sellValue: 1500,
    effectDescription: '+2 Ground Combat. Single use: +4 Ground Combat for one combat.',
    flavorText: 'A brutal melee weapon favored by Gamorrean guards.',
    isGear: true, groundCombatBonus: 2, isSingleUse: false,
  } as GearModCard,
  {
    id: 202, name: 'DL-44 Blaster', deckType: 'GEAR_MOD',
    buyCost: 2000, sellValue: 1000,
    effectDescription: '+1 Ground Combat.',
    flavorText: 'A trusty heavy blaster pistol. Shoots first.',
    isGear: true, groundCombatBonus: 1,
  } as GearModCard,
  {
    id: 203, name: 'Grappling Hook', deckType: 'GEAR_MOD',
    buyCost: 1000, sellValue: 500,
    effectDescription: '+1 Stealth. Single use.',
    flavorText: 'For when the high ground is the only exit.',
    isGear: true, skillBonus: [{ skill: 'STEALTH', count: 1 }], isSingleUse: true,
  } as GearModCard,
  {
    id: 204, name: 'Medpac', deckType: 'GEAR_MOD',
    buyCost: 1500, sellValue: 750,
    effectDescription: 'Single use: Heal 2 character damage.',
    flavorText: 'Emergency kolto injector and burn seal.',
    isGear: true, isSingleUse: true,
  } as GearModCard,
  {
    id: 205, name: 'Encrypted Datapad', deckType: 'GEAR_MOD',
    buyCost: 2500, sellValue: 1250,
    effectDescription: '+1 Tech and +1 Knowledge.',
    flavorText: 'Sliced and packed with slicing programs.',
    isGear: true, skillBonus: [{ skill: 'TECH', count: 1 }, { skill: 'KNOWLEDGE', count: 1 }],
  } as GearModCard,
  {
    id: 206, name: 'Thermal Detonator', deckType: 'GEAR_MOD',
    buyCost: 3500, sellValue: 1750,
    effectDescription: '+1 Ground Combat. Single use: +3 Ground Combat.',
    flavorText: 'Spherical explosive favored by Mandalorians.',
    isGear: true, groundCombatBonus: 1, isSingleUse: false,
  } as GearModCard,
  {
    id: 207, name: 'Plastoid Armor', deckType: 'GEAR_MOD',
    buyCost: 2000, sellValue: 1000,
    effectDescription: '+2 Ground Combat.',
    flavorText: 'Surplus Imperial stormtrooper plating.',
    isGear: true, groundCombatBonus: 2,
  } as GearModCard,
  {
    id: 208, name: 'Stealth Field Generator', deckType: 'GEAR_MOD',
    buyCost: 4000, sellValue: 2000,
    effectDescription: '+2 Stealth.',
    flavorText: 'Personal cloaking belt — military grade.',
    isGear: true, skillBonus: [{ skill: 'STEALTH', count: 2 }],
  } as GearModCard,

  // ════════════════════════════════════════════════════════
  // SHIP MODS  (isGear: false — equips to ship mod slots)
  // ════════════════════════════════════════════════════════
  {
    id: 211, name: 'Upgraded Hyperdrive', deckType: 'GEAR_MOD',
    buyCost: 4000, sellValue: 2000,
    effectDescription: '+1 Hyperdrive.',
    flavorText: 'Class-1 hyperdrive motivator — cuts travel time in half.',
    isGear: false, hyperdriveBonus: 1,
  } as GearModCard,
  {
    id: 212, name: 'Deflector Shields', deckType: 'GEAR_MOD',
    buyCost: 5000, sellValue: 2500,
    effectDescription: '+1 Hull.',
    flavorText: 'Military-surplus deflector shield array.',
    isGear: false, hullBonus: 1,
  } as GearModCard,
  {
    id: 213, name: 'Quad Laser Cannons', deckType: 'GEAR_MOD',
    buyCost: 6000, sellValue: 3000,
    effectDescription: '+1 Ship Combat.',
    flavorText: 'Quad-linked cannons — what they lack in precision they make up in volume.',
    isGear: false, attackDiceBonus: 1,
  } as GearModCard,
  {
    id: 214, name: 'Smuggling Compartment', deckType: 'GEAR_MOD',
    buyCost: 2000, sellValue: 1000,
    effectDescription: '+1 Cargo slot.',
    flavorText: 'Hidden panels — the discerning smuggler\'s best friend.',
    isGear: false, cargoSlotBonus: 1,
  } as GearModCard,
  {
    id: 215, name: 'Crew Bunk Module', deckType: 'GEAR_MOD',
    buyCost: 3000, sellValue: 1500,
    effectDescription: '+1 Crew slot.',
    flavorText: 'Foldout bunks in the cargo bay.',
    isGear: false, crewSlotBonus: 1,
  } as GearModCard,
  {
    id: 216, name: 'Targeting Computer', deckType: 'GEAR_MOD',
    buyCost: 5500, sellValue: 2750,
    effectDescription: '+2 Ship Combat.',
    flavorText: 'Aftermarket fire-control system. Stay on target.',
    isGear: false, attackDiceBonus: 2,
  } as GearModCard,

  // ════════════════════════════════════════════════════════
  // JOBS
  // ════════════════════════════════════════════════════════
  {
    id: 301, name: 'Smuggling Run', deckType: 'JOB',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Go to Tatooine. Skill: Piloting + Stealth. Reward: 3000cr + 1 Fame.',
    flavorText: 'A simple transport job — what could go wrong?',
    destinationPlanetId: 'tatooine', dataBankCardNumber: 11,
    skillsRequired: ['PILOTING'], skillsCritical: ['STEALTH'],
    reward: { credits: 3000, fame: 1 },
  } as JobCard,
  {
    id: 302, name: 'Data Heist', deckType: 'JOB',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Go to Geonosis. Skill: Tech + Stealth. Reward: 3500cr + 1 Fame.',
    flavorText: 'Imperial data banks are surprisingly porous.',
    destinationPlanetId: 'geonosis', dataBankCardNumber: 4,
    skillsRequired: ['TECH'], skillsCritical: ['STEALTH'],
    reward: { credits: 3500, fame: 1 },
  } as JobCard,
  {
    id: 303, name: 'Bodyguard Duty', deckType: 'JOB',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Go to Corellia. Skill: Strength + Tactics. Reward: 3000cr + 1 Fame.',
    flavorText: 'Keep the client breathing. Get paid.',
    destinationPlanetId: 'corellia', dataBankCardNumber: 2,
    skillsRequired: ['STRENGTH'], skillsCritical: ['TACTICS'],
    reward: { credits: 3000, fame: 1 },
  } as JobCard,
  {
    id: 304, name: 'Diplomatic Courier', deckType: 'JOB',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Go to Mon Cala. Skill: Influence + Knowledge. Reward: 2500cr + 2 Fame.',
    flavorText: 'The Rebellion needs discreet couriers.',
    destinationPlanetId: 'mon_cala', dataBankCardNumber: 15,
    skillsRequired: ['INFLUENCE'], skillsCritical: ['KNOWLEDGE'],
    reward: { credits: 2500, fame: 2 },
  } as JobCard,
  {
    id: 305, name: 'Artifact Recovery', deckType: 'JOB',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Go to Kessel. Skill: Knowledge + Tech. Reward: 4000cr + 2 Fame.',
    flavorText: 'Something old, something dangerous. Standard rate.',
    destinationPlanetId: 'kessel', dataBankCardNumber: 1,
    skillsRequired: ['KNOWLEDGE'], skillsCritical: ['TECH'],
    reward: { credits: 4000, fame: 2 },
  } as JobCard,
  {
    id: 306, name: 'Rebel Infiltration', deckType: 'JOB',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Go to Ord Mantell. Skill: Stealth + Tactics. Reward: 3500cr + 2 Fame.',
    flavorText: 'Get in, get the intel, get out.',
    destinationPlanetId: 'ord_mantell', dataBankCardNumber: 20,
    skillsRequired: ['STEALTH'], skillsCritical: ['TACTICS'],
    reward: { credits: 3500, fame: 2 },
  } as JobCard,
  {
    id: 307, name: 'Syndicate Errand', deckType: 'JOB',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Go to Nal Hutta. Skill: Influence. Reward: 2000cr + 1 Fame.',
    flavorText: 'The Hutts need a message delivered. Don\'t read it.',
    destinationPlanetId: 'nal_hutta', dataBankCardNumber: 13,
    skillsRequired: ['INFLUENCE'], skillsCritical: [],
    reward: { credits: 2000, fame: 1 },
  } as JobCard,
  {
    id: 308, name: 'Weapons Deal', deckType: 'JOB',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Go to Ryloth. Skill: Piloting + Influence. Reward: 3000cr + 1 Fame.',
    flavorText: 'The Free Ryloth movement pays well for discretion.',
    destinationPlanetId: 'ryloth', dataBankCardNumber: 2,
    skillsRequired: ['PILOTING'], skillsCritical: ['INFLUENCE'],
    reward: { credits: 3000, fame: 1 },
  } as JobCard,
  {
    id: 309, name: 'Prisoner Transport', deckType: 'JOB',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Go to Rodia. Skill: Strength + Piloting. Reward: 2500cr + 1 Fame.',
    flavorText: 'Transport a cuffed client to a Rodian contact. No questions.',
    destinationPlanetId: 'rodia', dataBankCardNumber: 7,
    skillsRequired: ['STRENGTH'], skillsCritical: ['PILOTING'],
    reward: { credits: 2500, fame: 1 },
  } as JobCard,
  {
    id: 310, name: 'Intel Gathering', deckType: 'JOB',
    buyCost: 0, sellValue: 0,
    effectDescription: 'Go to Geonosis. Skill: Stealth + Knowledge. Reward: 3000cr + 2 Fame.',
    flavorText: 'Map the Imperial installation. Leave no trace.',
    destinationPlanetId: 'geonosis', dataBankCardNumber: 14,
    skillsRequired: ['STEALTH'], skillsCritical: ['KNOWLEDGE'],
    reward: { credits: 3000, fame: 2 },
  } as JobCard,

  // ════════════════════════════════════════════════════════
  // LUXURY
  // ════════════════════════════════════════════════════════
  {
    id: 401, name: 'Jedi Holocron', deckType: 'LUXURY',
    buyCost: 8000, sellValue: 4000,
    effectDescription: '+1 Fame just for owning. +1 Knowledge.',
    flavorText: 'An ancient Jedi teaching device. Priceless.',
  } as CardDefinition,
  {
    id: 402, name: 'Sith Artifact', deckType: 'LUXURY',
    buyCost: 7000, sellValue: 3500,
    effectDescription: '+1 Fame just for owning. Reroll one die per combat.',
    flavorText: 'Dark side energy radiates from within.',
  } as CardDefinition,
  {
    id: 403, name: 'Mandalorian Armor', deckType: 'LUXURY',
    buyCost: 9000, sellValue: 4500,
    effectDescription: '+2 Ground Combat. +1 Fame.',
    flavorText: 'Beskar-plated — the real thing.',
  } as CardDefinition,
  {
    id: 404, name: 'Krayt Dragon Pearl', deckType: 'LUXURY',
    buyCost: 6000, sellValue: 3000,
    effectDescription: '+1 Fame. Worth 3000cr at any market.',
    flavorText: 'From the belly of a creature that hunts Banthas.',
  } as CardDefinition,
  {
    id: 405, name: 'Hutt Idol', deckType: 'LUXURY',
    buyCost: 5000, sellValue: 2500,
    effectDescription: '+1 Fame. +1 Reputation with the Hutt Cartel.',
    flavorText: 'A cultural artefact Jabba wants back. Badly.',
  } as CardDefinition,

  // ════════════════════════════════════════════════════════
  // SHIPS  (purchasable ship upgrades via market)
  // ════════════════════════════════════════════════════════
  {
    id: 501, name: 'YT-1300 Freighter', deckType: 'SHIP',
    buyCost: 10000, sellValue: 5000,
    effectDescription: 'Hyperdrive 4 | 6 Hull | 3 Cargo | 2 Crew | 2 Mods',
    flavorText: 'The most famous ship in the galaxy. Temperamental.',
  } as CardDefinition,
  {
    id: 502, name: 'Firespray-31', deckType: 'SHIP',
    buyCost: 12000, sellValue: 6000,
    effectDescription: 'Hyperdrive 3 | 5 Hull | 2 Cargo | 2 Crew | 3 Mods',
    flavorText: 'Boba Fett\'s Slave I. Agile and bristling with weapons.',
  } as CardDefinition,
  {
    id: 503, name: 'HWK-290', deckType: 'SHIP',
    buyCost: 8000, sellValue: 4000,
    effectDescription: 'Hyperdrive 5 | 4 Hull | 2 Cargo | 2 Crew | 1 Mod',
    flavorText: 'Fast and nimble — built for quick escapes.',
  } as CardDefinition,
  {
    id: 504, name: 'G-1A Starfighter', deckType: 'SHIP',
    buyCost: 9000, sellValue: 4500,
    effectDescription: 'Hyperdrive 4 | 4 Hull | 1 Cargo | 1 Crew | 3 Mods',
    flavorText: 'Dr. Aphra\'s personal vessel. Customized for combat.',
  } as CardDefinition,
  {
    id: 505, name: 'Lambda-class Shuttle', deckType: 'SHIP',
    buyCost: 11000, sellValue: 5500,
    effectDescription: 'Hyperdrive 2 | 5 Hull | 3 Cargo | 3 Crew | 2 Mods',
    flavorText: 'Tri-wing Imperial shuttle. Surprising cargo capacity.',
  } as CardDefinition,
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export function getCardsByDeck(deckType: string): CardDefinition[] {
  return MARKET_CARDS.filter(c => c.deckType === deckType);
}

export function getCardById(id: number): CardDefinition | undefined {
  return MARKET_CARDS.find(c => c.id === id);
}

export const MARKET_DECK_NAMES: Record<string, string> = {
  BOUNTY:   'Bounty Hunting',
  CARGO:    'Cargo',
  GEAR_MOD: 'Gear & Mods',
  JOB:      'Jobs',
  LUXURY:   'Luxury Items',
  SHIP:     'Ships',
};
