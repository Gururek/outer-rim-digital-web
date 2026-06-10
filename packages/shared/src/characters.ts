import type { CharacterDefinition, ShipDefinition } from './types.js';

// ─── CHARACTERS ───────────────────────────────────────────────────────────────
export const CHARACTERS: CharacterDefinition[] = [
  {
    id: 'boba_fett', name: 'Boba Fett', maxHealth: 8, groundCombatValue: 4,
    skills: ['TACTICS', 'STRENGTH', 'PILOTING'],
    gearSlots: 3, jobBountySlots: 2, startingDataBankCard: 90,
    personalGoal: 'Capture 2 bounties alive.',
    portraitUrl: '/portraits/boba_fett.png',
  },
  {
    id: 'han_solo', name: 'Han Solo', maxHealth: 7, groundCombatValue: 3,
    skills: ['PILOTING', 'INFLUENCE', 'STEALTH'],
    gearSlots: 2, jobBountySlots: 3, startingDataBankCard: 91,
    personalGoal: 'Complete 3 smuggling jobs.',
    portraitUrl: '/portraits/han_solo.png',
  },
  {
    id: 'lando_calrissian', name: 'Lando Calrissian', maxHealth: 6, groundCombatValue: 2,
    skills: ['INFLUENCE', 'KNOWLEDGE', 'PILOTING'],
    gearSlots: 2, jobBountySlots: 3, startingDataBankCard: 92,
    personalGoal: 'Own 3 ships or amass 25000 credits.',
    portraitUrl: '/portraits/lando.png',
  },
  {
    id: 'doctor_aphra', name: 'Doctor Aphra', maxHealth: 5, groundCombatValue: 2,
    skills: ['TECH', 'KNOWLEDGE', 'STEALTH'],
    gearSlots: 3, jobBountySlots: 2, startingDataBankCard: 93,
    personalGoal: 'Acquire 3 artifacts or complete 2 data heists.',
    portraitUrl: '/portraits/aphra.png',
  },
  {
    id: 'bossk', name: 'Bossk', maxHealth: 9, groundCombatValue: 5,
    skills: ['STRENGTH', 'TACTICS', 'PILOTING'],
    gearSlots: 2, jobBountySlots: 2, startingDataBankCard: 90,
    startingReputation: { faction: 'HUTT', status: 'POSITIVE' },
    personalGoal: 'Eliminate 3 bounties.',
    portraitUrl: '/portraits/bossk.png',
  },
  {
    id: 'jyn_erso', name: 'Jyn Erso', maxHealth: 6, groundCombatValue: 3,
    skills: ['STEALTH', 'TACTICS', 'INFLUENCE'],
    gearSlots: 2, jobBountySlots: 3, startingDataBankCard: 91,
    startingReputation: { faction: 'REBEL', status: 'POSITIVE' },
    personalGoal: 'Complete 3 Rebel-aligned jobs.',
    portraitUrl: '/portraits/jyn.png',
  },
  {
    id: 'ig88', name: 'IG-88', maxHealth: 7, groundCombatValue: 4,
    skills: ['TACTICS', 'TECH', 'STRENGTH'],
    gearSlots: 3, jobBountySlots: 2, startingDataBankCard: 92,
    personalGoal: 'Eliminate 4 targets (any type).',
    portraitUrl: '/portraits/ig88.png',
  },
  {
    id: 'kai_zerr', name: 'Kai Zerr', maxHealth: 6, groundCombatValue: 2,
    skills: ['PILOTING', 'INFLUENCE', 'STEALTH'],
    gearSlots: 2, jobBountySlots: 3, startingDataBankCard: 93,
    personalGoal: 'Complete 2 jobs and deliver 2 cargo.',
    portraitUrl: '/portraits/kai.png',
  },
];

// ─── SHIPS ────────────────────────────────────────────────────────────────────
export const SHIPS: ShipDefinition[] = [
  {
    id: 'firespray', name: 'Firespray-31', hyperdrive: 3, maxHull: 5,
    shipCombatValue: 3, cargoSlots: 2, crewSlots: 2, modSlots: 3, buyCost: 0,
    shipGoal: 'Destroy 2 patrol ships.',
    modelUrl: '/models/firespray.glb',
    cockpitTextureUrl: '/cockpits/firespray.png',
  },
  {
    id: 'yt1300', name: 'YT-1300 Freighter', hyperdrive: 4, maxHull: 6,
    shipCombatValue: 2, cargoSlots: 3, crewSlots: 2, modSlots: 2, buyCost: 0,
    shipGoal: 'Complete 3 delivery/cargo runs.',
    modelUrl: '/models/yt1300.glb',
    cockpitTextureUrl: '/cockpits/yt1300.png',
  },
  {
    id: 'hwk290', name: 'HWK-290', hyperdrive: 5, maxHull: 4,
    shipCombatValue: 2, cargoSlots: 2, crewSlots: 2, modSlots: 1, buyCost: 0,
    shipGoal: 'Complete 2 jobs in one system.',
    modelUrl: '/models/hwk290.glb',
    cockpitTextureUrl: '/cockpits/hwk290.png',
  },
  {
    id: 'yv666', name: 'YV-666', hyperdrive: 2, maxHull: 7,
    shipCombatValue: 4, cargoSlots: 4, crewSlots: 3, modSlots: 1, buyCost: 0,
    shipGoal: 'Eliminate or capture 2 targets.',
    modelUrl: '/models/yv666.glb',
    cockpitTextureUrl: '/cockpits/yv666.png',
  },
  {
    id: 'g1a', name: 'G-1A Starfighter', hyperdrive: 4, maxHull: 4,
    shipCombatValue: 3, cargoSlots: 1, crewSlots: 1, modSlots: 3, buyCost: 0,
    shipGoal: 'Win 2 ship combats.',
    modelUrl: '/models/g1a.glb',
    cockpitTextureUrl: '/cockpits/g1a.png',
  },
  {
    id: 'lambda', name: 'Lambda Shuttle', hyperdrive: 2, maxHull: 5,
    shipCombatValue: 2, cargoSlots: 3, crewSlots: 3, modSlots: 2, buyCost: 0,
    shipGoal: 'Complete 2 diplomatic/influence jobs.',
    modelUrl: '/models/lambda.glb',
    cockpitTextureUrl: '/cockpits/lambda.png',
  },
  {
    id: 'vcx100', name: 'VCX-100', hyperdrive: 3, maxHull: 7,
    shipCombatValue: 3, cargoSlots: 3, crewSlots: 3, modSlots: 1, buyCost: 0,
    shipGoal: 'Complete 2 jobs with crew assistance.',
    modelUrl: '/models/vcx100.glb',
    cockpitTextureUrl: '/cockpits/vcx100.png',
  },
  {
    id: 'jumpmaster', name: 'JumpMaster 5000', hyperdrive: 5, maxHull: 4,
    shipCombatValue: 2, cargoSlots: 2, crewSlots: 1, modSlots: 2, buyCost: 0,
    shipGoal: 'Visit 4 different planets in one game.',
    modelUrl: '/models/jumpmaster.glb',
    cockpitTextureUrl: '/cockpits/jumpmaster.png',
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export function getCharacter(id: string): CharacterDefinition | undefined {
  return CHARACTERS.find(c => c.id === id);
}

export function getShip(id: string): ShipDefinition | undefined {
  return SHIPS.find(s => s.id === id);
}
