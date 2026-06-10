// Databank card definitions — revealed when making contact with NPCs
// Each databank card has an id, name, contact class, and a brief description

export interface DatabankCard {
  id: number;
  name: string;
  contactClass: 'WHITE' | 'GREEN' | 'YELLOW' | 'ORANGE';
  description: string;
}

export const DATABANK_CARDS: DatabankCard[] = [
  { id: 1, name: 'Maz Kanata', contactClass: 'ORANGE', description: 'Ancient pirate queen. Knows everyone in the outer rim.' },
  { id: 2, name: 'Hondo Ohnaka', contactClass: 'YELLOW', description: 'Weequay pirate captain. Loyalty is negotiable.' },
  { id: 3, name: 'Lando Calrissian', contactClass: 'ORANGE', description: 'Smooth-talking administrator of Cloud City.' },
  { id: 4, name: 'Doctor Aphra', contactClass: 'YELLOW', description: 'Rogue archaeologist. Specializes in dangerous artifacts.' },
  { id: 5, name: 'Hera Syndulla', contactClass: 'GREEN', description: 'Twilek pilot and Rebel general.' },
  { id: 6, name: 'Chewbacca', contactClass: 'GREEN', description: 'Wookiee smuggler. Co-pilot of the Millennium Falcon.' },
  { id: 7, name: 'Greedo', contactClass: 'WHITE', description: 'Rodian bounty hunter. Works for Jabba the Hutt.' },
  { id: 8, name: 'Bossk', contactClass: 'WHITE', description: 'Trandoshan bounty hunter. Known for hunting Wookiees.' },
  { id: 9, name: 'Dengar', contactClass: 'WHITE', description: 'Corellian bounty hunter. Wrapped in bandages.' },
  { id: 10, name: 'IG-88', contactClass: 'YELLOW', description: 'Assassin droid with a galaxy-wide bounty network.' },
  { id: 11, name: 'Jabba the Hutt', contactClass: 'ORANGE', description: 'Crime lord of Tatooine. Runs the Hutt Cartel.' },
  { id: 12, name: 'Boba Fett', contactClass: 'ORANGE', description: 'The galaxy\'s most feared bounty hunter.' },
  { id: 13, name: 'Ziro the Hutt', contactClass: 'YELLOW', description: 'Flamboyant Hutt crime lord. Black sheep of the family.' },
  { id: 14, name: 'Crix Madine', contactClass: 'GREEN', description: 'Imperial defector turned Rebel general.' },
  { id: 15, name: 'Mon Mothma', contactClass: 'GREEN', description: 'Chandrila senator and leader of the Rebel Alliance.' },
  { id: 16, name: 'Dr. Evazan', contactClass: 'WHITE', description: 'Deranged surgeon with a death sentence in 12 systems.' },
  { id: 17, name: 'Ponda Baba', contactClass: 'WHITE', description: 'Aqualish thug. Dr. Evazan\'s muscle.' },
  { id: 18, name: 'Wedge Antilles', contactClass: 'GREEN', description: 'Legendary Rebel X-wing pilot. Rogue Squadron leader.' },
  { id: 19, name: 'Admiral Ackbar', contactClass: 'ORANGE', description: 'Mon Calamari military commander. It\'s a trap!' },
  { id: 20, name: 'Saw Gerrera', contactClass: 'YELLOW', description: 'Extremist Rebel partisan. Will do anything for the cause.' },
];

export function getDatabankCard(id: number): DatabankCard | undefined {
  return DATABANK_CARDS.find(c => c.id === id);
}

export function getRandomDatabankCard(classFilter?: string): DatabankCard {
  const pool = classFilter
    ? DATABANK_CARDS.filter(c => c.contactClass === classFilter)
    : DATABANK_CARDS;
  return pool[Math.floor(Math.random() * pool.length)];
}
