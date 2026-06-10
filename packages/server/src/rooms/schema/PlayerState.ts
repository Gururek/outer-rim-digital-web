import { Schema, type, ArraySchema } from '@colyseus/schema';

export class CardSlot extends Schema {
  @type('number') cardDefinitionId: number = -1;
  @type('boolean') isOccupied: boolean = false;
  @type('boolean') isRotated: boolean = false;
}

export class PlayerState extends Schema {
  @type('string') sessionId: string = '';
  @type('string') displayName: string = 'Scoundrel';
  @type('string') characterId: string = '';
  @type('string') shipId: string = '';
  @type('boolean') isReady: boolean = false;

  // Core resources
  @type('number') fame: number = 0;
  @type('number') credits: number = 0;

  // Damage
  @type('number') characterDamage: number = 0;
  @type('number') shipDamage: number = 0;

  // Location
  @type('number') currentNodeId: number = -1;

  // Turn actions
  @type('number') actionsRemaining: number = 2;

  // Reputation (-1 = Negative, 0 = Neutral, 1 = Positive)
  @type('number') repHutt: number = 0;
  @type('number') repSyndicate: number = 0;
  @type('number') repImperial: number = 0;
  @type('number') repRebel: number = 0;

  // Inventory slots
  @type([CardSlot]) cargoSlots = new ArraySchema<CardSlot>();
  @type([CardSlot]) crewSlots = new ArraySchema<CardSlot>();
  @type([CardSlot]) gearSlots = new ArraySchema<CardSlot>();
  @type([CardSlot]) modSlots = new ArraySchema<CardSlot>();
  @type([CardSlot]) jobBountySlots = new ArraySchema<CardSlot>();
}
