import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema';
import { PlayerState } from './PlayerState.js';

export class GameState extends Schema {
  @type('string') phase: string = 'WAITING_FOR_PLAYERS';
  @type('number') currentPlayerIndex: number = 0;
  @type('number') turnNumber: number = 1;
  @type('number') fameRequirement: number = 10;

  // Turn order (session IDs in order)
  @type(['string']) turnOrder = new ArraySchema<string>();

  // Players
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();

  // Market — top card ID of each deck
  @type('number') topBountyId: number = -1;
  @type('number') topCargoId: number = -1;
  @type('number') topGearModId: number = -1;
  @type('number') topJobId: number = -1;
  @type('number') topLuxuryId: number = -1;
  @type('number') topShipId: number = -1;

  // Patrol positions (node IDs)
  @type('number') huttPatrolNode: number = -1;
  @type('number') syndicatePatrolNode: number = -1;
  @type('number') imperialPatrolNode: number = -1;
  @type('number') rebelPatrolNode: number = -1;

  // Patrol levels
  @type('number') huttPatrolLevel: number = 1;
  @type('number') syndicatePatrolLevel: number = 1;
  @type('number') imperialPatrolLevel: number = 1;
  @type('number') rebelPatrolLevel: number = 1;
}
