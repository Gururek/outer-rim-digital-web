import type { CharacterDefinition, ShipDefinition } from './types.js';

// ─── CHARACTERS ───────────────────────────────────────────────────────────────
export const CHARACTERS: CharacterDefinition[] = [
  {
    id: 'boba_fett', name: 'Boba Fett', maxHealth: 8, groundCombatValue: 4,
    skills: ['STEALTH', 'TACTICS'],
    gearSlots: 2, jobBountySlots: 3, startingDataBankCard: 90,
    personalGoal: 'Have 2 captured bounties at the same time and deliver them.',
    portraitUrl: '/portraits/boba_fett.png',
  },
  {
    id: 'han_solo', name: 'Han Solo', maxHealth: 6, groundCombatValue: 3,
    skills: ['PILOTING', 'TACTICS'],
    gearSlots: 2, jobBountySlots: 2, startingDataBankCard: 91,
    personalGoal: 'Have 2 contacts at the same time.',
    portraitUrl: '/portraits/han_solo.png',
  },
  {
    id: 'lando_calrissian', name: 'Lando Calrissian', maxHealth: 6, groundCombatValue: 2,
    skills: ['INFLUENCE', 'PILOTING'],
    gearSlots: 2, jobBountySlots: 2, startingDataBankCard: 92,
    personalGoal: 'Win 2 ship combats against players.',
    portraitUrl: '/portraits/lando.png',
  },
  {
    id: 'doctor_aphra', name: 'Doctor Aphra', maxHealth: 5, groundCombatValue: 3,
    skills: ['KNOWLEDGE', 'STEALTH', 'TECH'],
    gearSlots: 3, jobBountySlots: 2, startingDataBankCard: 93,
    personalGoal: 'Complete 1 job and have at least 1 bounty puck.',
    portraitUrl: '/portraits/aphra.png',
  },
  {
    id: 'bossk', name: 'Bossk', maxHealth: 8, groundCombatValue: 4,
    skills: ['STRENGTH', 'TACTICS'],
    gearSlots: 2, jobBountySlots: 3, startingDataBankCard: 90,
    startingReputation: { faction: 'HUTT', status: 'POSITIVE' },
    personalGoal: 'Eliminate 2 bounties.',
    portraitUrl: '/portraits/bossk.png',
  },
  {
    id: 'jyn_erso', name: 'Jyn Erso', maxHealth: 7, groundCombatValue: 3,
    skills: ['INFLUENCE', 'TACTICS'],
    gearSlots: 2, jobBountySlots: 2, startingDataBankCard: 91,
    startingReputation: { faction: 'REBEL', status: 'POSITIVE' },
    personalGoal: 'Complete 2 jobs.',
    portraitUrl: '/portraits/jyn.png',
  },
  {
    id: 'ig88', name: 'IG-88', maxHealth: 8, groundCombatValue: 3,
    skills: ['STRENGTH', 'TECH'],
    gearSlots: 2, jobBountySlots: 3, startingDataBankCard: 92,
    personalGoal: 'Eliminate 3 targets (bounties or patrols).',
    portraitUrl: '/portraits/ig88.png',
  },
  {
    id: 'ketsu_onyo', name: 'Ketsu Onyo', maxHealth: 6, groundCombatValue: 3,
    skills: ['STEALTH', 'TACTICS'],
    gearSlots: 2, jobBountySlots: 3, startingDataBankCard: 93,
    personalGoal: 'Deliver 2 captured bounties.',
    portraitUrl: '/portraits/ketsu.png',
  },
  // ── Unfinished Business expansion ────────────────────────────────────────────
  {
    id: 'black_krrsantan', name: 'Black Krrsantan', maxHealth: 9, groundCombatValue: 5,
    skills: ['STRENGTH', 'TACTICS'],
    gearSlots: 2, jobBountySlots: 3, startingDataBankCard: 90,
    startingReputation: { faction: 'HUTT', status: 'POSITIVE' },
    personalGoal: 'Win your 3rd ground combat this game.',
    portraitUrl: '/portraits/black_krrsantan.png',
  },
  {
    id: 'cad_bane', name: 'Cad Bane', maxHealth: 7, groundCombatValue: 4,
    skills: ['STEALTH', 'TACTICS'],
    gearSlots: 3, jobBountySlots: 3, startingDataBankCard: 91,
    personalGoal: 'Have 3 or more gear at the same time.',
    portraitUrl: '/portraits/cad_bane.png',
  },
  {
    id: 'chewbacca', name: 'Chewbacca', maxHealth: 9, groundCombatValue: 4,
    skills: ['PILOTING', 'STRENGTH'],
    gearSlots: 2, jobBountySlots: 2, startingDataBankCard: 92,
    startingReputation: { faction: 'REBEL', status: 'POSITIVE' },
    personalGoal: 'Have another player\'s character as a crew in your ship.',
    portraitUrl: '/portraits/chewbacca.png',
  },
  {
    id: 'dengar', name: 'Dengar', maxHealth: 7, groundCombatValue: 3,
    skills: ['STEALTH', 'TACTICS'],
    gearSlots: 2, jobBountySlots: 3, startingDataBankCard: 93,
    startingReputation: { faction: 'IMPERIAL', status: 'POSITIVE' },
    personalGoal: 'Have 2 captured bounties at the same time.',
    portraitUrl: '/portraits/dengar.png',
  },
  {
    id: 'enfys_nest', name: 'Enfys Nest', maxHealth: 6, groundCombatValue: 3,
    skills: ['INFLUENCE', 'TACTICS'],
    gearSlots: 2, jobBountySlots: 2, startingDataBankCard: 90,
    startingReputation: { faction: 'REBEL', status: 'POSITIVE' },
    personalGoal: 'Complete a job where every skill check succeeded.',
    portraitUrl: '/portraits/enfys_nest.png',
  },
  {
    id: 'hera_syndulla', name: 'Hera Syndulla', maxHealth: 6, groundCombatValue: 3,
    skills: ['PILOTING', 'TACTICS'],
    gearSlots: 2, jobBountySlots: 2, startingDataBankCard: 91,
    startingReputation: { faction: 'REBEL', status: 'POSITIVE' },
    personalGoal: 'Win a ship combat against a level 3 or higher patrol.',
    portraitUrl: '/portraits/hera.png',
  },
  {
    id: 'hondo_ohnaka', name: 'Hondo Ohnaka', maxHealth: 7, groundCombatValue: 3,
    skills: ['INFLUENCE', 'PILOTING'],
    gearSlots: 3, jobBountySlots: 2, startingDataBankCard: 92,
    startingReputation: { faction: 'HUTT', status: 'POSITIVE' },
    personalGoal: 'Have 3 or more contacts.',
    portraitUrl: '/portraits/hondo.png',
  },
  {
    id: 'maz_kanata', name: 'Maz Kanata', maxHealth: 5, groundCombatValue: 2,
    skills: ['INFLUENCE', 'KNOWLEDGE'],
    gearSlots: 3, jobBountySlots: 2, startingDataBankCard: 93,
    personalGoal: 'Have 2 or more contacts at the same time.',
    portraitUrl: '/portraits/maz.png',
  },
];

// ─── SHIPS ────────────────────────────────────────────────────────────────────
// Stats sourced from physical card scans.
// hyperdrive = max hops per move action; combat = ship combat dice; hull = HP.
export const SHIPS: ShipDefinition[] = [
  {
    id: 'g9_rigger', name: 'G9 Rigger', hyperdrive: 3, maxHull: 3,
    shipCombatValue: 2, cargoSlots: 1, crewSlots: 1, modSlots: 1, buyCost: 0,
    shipGoal: 'Starter ship.',
    modelUrl: '/models/g9_rigger.glb',
    cockpitTextureUrl: '/cockpits/g9_rigger.png',
  },
  {
    id: 'hwk290', name: 'HWK-290 Freighter', hyperdrive: 3, maxHull: 4,
    shipCombatValue: 3, cargoSlots: 1, crewSlots: 2, modSlots: 1, buyCost: 5000,
    shipGoal: 'If you have a mod, spend 1,000 to gain 1 fame and flip this sheet.',
    modelUrl: '/models/hwk290.glb',
    cockpitTextureUrl: '/cockpits/hwk290.png',
  },
  {
    id: 'gx1_short_hauler', name: 'GX1 Short Hauler', hyperdrive: 3, maxHull: 5,
    shipCombatValue: 2, cargoSlots: 2, crewSlots: 2, modSlots: 0, buyCost: 5000,
    shipGoal: 'Gain a crew while you have 2 crew to gain 1 fame and flip this sheet.',
    modelUrl: '/models/gx1.glb',
    cockpitTextureUrl: '/cockpits/gx1.png',
  },
  {
    id: 'porax38', name: 'Rogue-Class Porax-38 Starfighter', hyperdrive: 3, maxHull: 4,
    shipCombatValue: 4, cargoSlots: 1, crewSlots: 0, modSlots: 2, buyCost: 5000,
    shipGoal: 'Win 2 ship combats to gain 1 fame and flip this sheet.',
    modelUrl: '/models/porax38.glb',
    cockpitTextureUrl: '/cockpits/porax38.png',
  },
  {
    id: 'lancer', name: 'Lancer-Class Pursuit Craft', hyperdrive: 3, maxHull: 5,
    shipCombatValue: 4, cargoSlots: 1, crewSlots: 2, modSlots: 1, buyCost: 10000,
    shipGoal: 'Deliver a contact on 1 of your bounty cards to gain 1 fame and flip this sheet.',
    modelUrl: '/models/lancer.glb',
    cockpitTextureUrl: '/cockpits/lancer.png',
  },
  {
    id: 'heavy_duty_lifter', name: 'Heavy-Duty Lifter', hyperdrive: 2, maxHull: 5,
    shipCombatValue: 3, cargoSlots: 2, crewSlots: 3, modSlots: 0, buyCost: 10000,
    shipGoal: 'If you have at least 1 cargo, complete a job to gain 1 fame and flip this sheet.',
    modelUrl: '/models/heavy_lifter.glb',
    cockpitTextureUrl: '/cockpits/heavy_lifter.png',
  },
  {
    id: 'jumpmaster', name: 'Jumpmaster 5000', hyperdrive: 4, maxHull: 5,
    shipCombatValue: 5, cargoSlots: 1, crewSlots: 1, modSlots: 1, buyCost: 10000,
    shipGoal: 'Encounter 2 navpoint spaces to gain 1 fame and flip this sheet.',
    modelUrl: '/models/jumpmaster.glb',
    cockpitTextureUrl: '/cockpits/jumpmaster.png',
  },
  {
    id: 'auzituck', name: 'Auzituck Anti-Slaver Gunship', hyperdrive: 2, maxHull: 6,
    shipCombatValue: 4, cargoSlots: 1, crewSlots: 3, modSlots: 2, buyCost: 15000,
    shipGoal: 'Win 3 ground combats to gain 1 fame and flip this sheet.',
    modelUrl: '/models/auzituck.glb',
    cockpitTextureUrl: '/cockpits/auzituck.png',
  },
  {
    id: 'aggressor', name: 'Aggressor-Class Assault Fighter', hyperdrive: 2, maxHull: 5,
    shipCombatValue: 5, cargoSlots: 2, crewSlots: 2, modSlots: 1, buyCost: 15000,
    shipGoal: 'Win 2 combats against patrols to gain 1 fame and flip this sheet.',
    modelUrl: '/models/aggressor.glb',
    cockpitTextureUrl: '/cockpits/aggressor.png',
  },
  {
    id: 'yv666', name: 'YV-666 Light Freighter', hyperdrive: 3, maxHull: 5,
    shipCombatValue: 3, cargoSlots: 3, crewSlots: 2, modSlots: 0, buyCost: 15000,
    shipGoal: 'When you recover at least 3 damage from this ship, spend 7,000 to gain 1 fame and flip this sheet.',
    modelUrl: '/models/yv666.glb',
    cockpitTextureUrl: '/cockpits/yv666.png',
  },
  {
    id: 'firespray', name: 'Firespray-31 Patrol Craft', hyperdrive: 2, maxHull: 6,
    shipCombatValue: 5, cargoSlots: 2, crewSlots: 2, modSlots: 1, buyCost: 20000,
    shipGoal: 'Encounter: Fight a ship combat against a player in your space (even if on a planet) who has more fame than you. If you win, gain 1 fame and flip this sheet.',
    modelUrl: '/models/firespray.glb',
    cockpitTextureUrl: '/cockpits/firespray.png',
  },
  {
    id: 'yt1300', name: 'Modified YT-1300 Light Freighter', hyperdrive: 3, maxHull: 5,
    shipCombatValue: 4, cargoSlots: 2, crewSlots: 3, modSlots: 1, buyCost: 20000,
    shipGoal: 'If you have either 2 mods or 1 mod and the "Chewbacca" crew, deliver 1 cargo to gain 1 fame and flip this sheet.',
    modelUrl: '/models/yt1300.glb',
    cockpitTextureUrl: '/cockpits/yt1300.png',
  },
  {
    id: 'yt2400', name: 'YT-2400 Light Freighter', hyperdrive: 3, maxHull: 6,
    shipCombatValue: 4, cargoSlots: 3, crewSlots: 3, modSlots: 1, buyCost: 20000,
    shipGoal: 'Deliver 2 ILLEGAL cargo to gain 1 fame and flip this sheet.',
    modelUrl: '/models/yt2400.glb',
    cockpitTextureUrl: '/cockpits/yt2400.png',
  },
  {
    id: 'edgehawk', name: 'Edgehawk-Class Swoop Carrier', hyperdrive: 2, maxHull: 6,
    shipCombatValue: 5, cargoSlots: 2, crewSlots: 3, modSlots: 1, buyCost: 25000,
    shipGoal: 'If you have at least 1 gear, gain 1 fame and flip this sheet.',
    modelUrl: '/models/edgehawk.glb',
    cockpitTextureUrl: '/cockpits/edgehawk.png',
  },
  {
    id: 'vcx100', name: 'VCX-100 Light Freighter', hyperdrive: 4, maxHull: 5,
    shipCombatValue: 5, cargoSlots: 2, crewSlots: 2, modSlots: 1, buyCost: 25000,
    shipGoal: 'Encounter a level 3 or level 4 Imperial patrol to gain 1 fame and flip this sheet.',
    modelUrl: '/models/vcx100.glb',
    cockpitTextureUrl: '/cockpits/vcx100.png',
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export function getCharacter(id: string): CharacterDefinition | undefined {
  return CHARACTERS.find(c => c.id === id);
}

export function getShip(id: string): ShipDefinition | undefined {
  return SHIPS.find(s => s.id === id);
}
