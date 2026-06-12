// Databank cards — revealed when making contact with NPCs

export interface DatabankCard {
  id: number;
  name: string;
  contactClass: 'WHITE' | 'GREEN' | 'YELLOW' | 'ORANGE';
  description: string;
}

export const DATABANK_CARDS: DatabankCard[] = [
  // ── ORANGE (rare, high-value contacts) ──────────────────────────────────
  { id: 1,  name: 'Maz Kanata',       contactClass: 'ORANGE', description: 'Ancient pirate queen of Takodana. She\'s been running her castle for a thousand years and knows everyone in the Outer Rim. Speaks in riddles, pays in credits.' },
  { id: 2,  name: 'Hondo Ohnaka',     contactClass: 'ORANGE', description: 'Weequay pirate captain turned opportunist. His loyalty goes to the highest bidder, but he\'s never dull company. Controls smuggling routes through the Mid Rim.' },
  { id: 3,  name: 'Jabba the Hutt',   contactClass: 'ORANGE', description: 'Crime lord of Tatooine and patriarch of the Hutt Cartel. His palace is the hub of the Outer Rim criminal underworld. Never welch on a deal with Jabba.' },
  { id: 4,  name: 'Doctor Aphra',     contactClass: 'ORANGE', description: 'Rogue archaeologist and weapons dealer. Brilliant and utterly amoral. Her droids are terrifying. She\'ll sell to anyone with enough credits.' },
  { id: 5,  name: 'Admiral Ackbar',   contactClass: 'ORANGE', description: 'Mon Calamari commander of the Rebel fleet. His tactical genius is matched only by his distrust of anyone who isn\'t clearly on the side of the Rebellion.' },
  { id: 6,  name: 'Boba Fett',        contactClass: 'ORANGE', description: 'The galaxy\'s most feared bounty hunter. A man of few words and absolute professionalism. His Mandalorian armor has never been scratched — that you know of.' },

  // ── YELLOW (uncommon, established underworld figures) ────────────────────
  { id: 7,  name: 'IG-88',            contactClass: 'YELLOW', description: 'Assassin droid bounty hunter with a galaxy-wide tracking network. Cold, efficient, and terrifyingly effective. Has a standing offer for any bounty puck.' },
  { id: 8,  name: 'Ziro the Hutt',    contactClass: 'YELLOW', description: 'Flamboyant Hutt crime lord based in Coruscant. The black sheep of the Hutt family. His ambitions often exceed his reach — but his connections are real.' },
  { id: 9,  name: 'Saw Gerrera',      contactClass: 'YELLOW', description: 'Extremist Rebel partisan. Will do anything for the cause — including things the Alliance won\'t sanction. His network operates in the darkest corners of the Rim.' },
  { id: 10, name: 'Crix Madine',      contactClass: 'YELLOW', description: 'Former Imperial general, now Rebel intelligence chief. Defected after witnessing a massacre. He vets every contractor personally and pays only in results.' },
  { id: 11, name: 'Plo Koon',         contactClass: 'YELLOW', description: 'Kel Dor Jedi Master known for his compassion. Disappeared during Order 66 but rumors persist. Any message from him is worth its weight in Kyber crystals.' },
  { id: 12, name: 'Fennec Shand',     contactClass: 'YELLOW', description: 'Elite mercenary and assassin. Impeccable track record. Expensive but professional. She takes only jobs that interest her — which means unusual ones pay a premium.' },
  { id: 13, name: 'Bossk',            contactClass: 'YELLOW', description: 'Trandoshan bounty hunter with a legendary career. Famous for his Wookiee kills. Currently working for the Hutt Cartel, but always available for the right fee.' },

  // ── GREEN (common, accessible underworld contacts) ───────────────────────
  { id: 14, name: 'Mon Mothma',       contactClass: 'GREEN', description: 'Chandrila senator and leader of the Rebel Alliance. Principled, methodical, and uncompromising. She needs operatives who understand discretion above all else.' },
  { id: 15, name: 'Hera Syndulla',    contactClass: 'GREEN', description: 'Twi\'lek pilot and general of the Ghost Squadron. Fiercely loyal to the Rebellion. She evaluates contractors by their actions, not their credentials.' },
  { id: 16, name: 'Chewbacca',        contactClass: 'GREEN', description: 'Wookiee co-pilot of the Millennium Falcon. Han Solo\'s partner in everything. He\'ll vouch for you if you\'ve proven yourself. Don\'t mistake his silence for indifference.' },
  { id: 17, name: 'Wedge Antilles',   contactClass: 'GREEN', description: 'Rogue Squadron ace pilot and Rebel hero. Survived the Death Star assault twice. His contacts in the Alliance supply chain can source almost any ship part.' },
  { id: 18, name: 'Nien Nunb',        contactClass: 'GREEN', description: 'Sullustan co-pilot and Alliance hero. Controls a network of safe houses along the Corellian Run. Laconic but deeply connected.' },
  { id: 19, name: 'Cassian Andor',    contactClass: 'GREEN', description: 'Rebel intelligence officer. Has done things for the cause he doesn\'t talk about. Uses contractors for jobs that require deniability. Pays in full, no questions asked.' },
  { id: 20, name: 'Bo-Katan Kryze',   contactClass: 'GREEN', description: 'Mandalorian warrior and leader of the Nite Owls. Her vendetta against the Empire is personal. Hires only those who can handle Mandalorian-grade opposition.' },

  // ── WHITE (common, street-level contacts) ────────────────────────────────
  { id: 21, name: 'Greedo',           contactClass: 'WHITE', description: 'Rodian bounty hunter in Jabba\'s employ. Unreliable and overconfident. Still, he knows who\'s who in the Tatooine underworld and talks cheap.' },
  { id: 22, name: 'Dr. Evazan',       contactClass: 'WHITE', description: 'Deranged surgeon with a death sentence in twelve systems. His "medical" skills are horrifying but sometimes useful. Avoid looking him in the eye.' },
  { id: 23, name: 'Ponda Baba',       contactClass: 'WHITE', description: 'Aqualish thug and Dr. Evazan\'s muscle. Short on brains, long on aggression. Useful as a distraction. Don\'t expect him to come out ahead in a fight.' },
  { id: 24, name: 'Garindan',         contactClass: 'WHITE', description: 'Kubaz Imperial informant known as Long Snoot. He\'ll sell information to whoever pays more — which is usually the Empire. Approach with extreme caution.' },
  { id: 25, name: 'Watto',            contactClass: 'WHITE', description: 'Toydarian junk dealer on Tatooine. His mind-trick immunity makes him suspicious of everyone. But if you need parts, he has them — at a price.' },
  { id: 26, name: 'Mos Eisley Fence', contactClass: 'WHITE', description: 'Anonymous buyer of questionable merchandise. Pays below market but asks no questions. Has contacts in every cantina between Tatooine and Nar Shaddaa.' },
  { id: 27, name: 'Ketsu Onyo',       contactClass: 'WHITE', description: 'Former Shadow Guard assassin turned bounty hunter. Old partner of Sabine Wren. Pragmatic about allegiances. Has a ship, skills, and moderate ethics.' },
  { id: 28, name: 'Rotta the Hutt',   contactClass: 'WHITE', description: 'Jabba\'s son — young, small, and surprisingly resilient. His connections through the Hutt family are real, but his judgment is terrible.' },
  { id: 29, name: 'Seventh Sister',   contactClass: 'WHITE', description: 'Former Inquisitor operating as a freelance contractor. Her Force abilities make her valuable — and unpredictable. The Empire still wants her back.' },
  { id: 30, name: 'Qi\'ra',           contactClass: 'WHITE', description: 'Head of Crimson Dawn. Cool, calculating, and seemingly loyal to whoever she works for this week. Her past with Solo is complicated. Her network is not.' },

  // ── Additional contacts ───────────────────────────────────────────────────
  { id: 31, name: 'Lando Calrissian', contactClass: 'ORANGE', description: 'Baron Administrator of Cloud City and professional gambler. Charming, adaptable, and perpetually on the edge of a bad deal that turns great. Or vice versa.' },
  { id: 32, name: 'Dengar',           contactClass: 'YELLOW', description: 'Corellian bounty hunter wrapped in head bandages. He\'s survived things that should have killed him multiple times. Grudge-holding and thorough.' },
  { id: 33, name: 'Asajj Ventress',   contactClass: 'YELLOW', description: 'Former Sith assassin turned bounty hunter. Her lightsabers are for sale alongside her skills. She prefers jobs against Separatists or the Empire.' },
  { id: 34, name: 'Enfys Nest',       contactClass: 'GREEN',  description: 'Leader of the Cloud-Riders — not pirates, but proto-Rebels fighting the Crimson Dawn. She\'ll work with anyone who opposes the cartels.' },
  { id: 35, name: 'Sabine Wren',      contactClass: 'GREEN',  description: 'Mandalorian weapons expert and Rebel artist. Her explosives are as beautiful as they are destructive. Loyal to her crew, wary of strangers.' },
  { id: 36, name: 'Ezra Bridger',     contactClass: 'GREEN',  description: 'Force-sensitive Rebel operative from Lothal. Young, reckless, but with real talent. His connection to the Ghost crew opens doors with the Rebellion.' },
  { id: 37, name: 'Kuiil',            contactClass: 'GREEN',  description: 'Ugnaught moisture farmer turned engineer. "I have spoken." Retired from Imperial indentured service. His technical skills are exceptional.' },
  { id: 38, name: 'Cara Dune',        contactClass: 'WHITE',  description: 'Former Rebel shock trooper turned mercenary. Blunt, direct, and professional. Takes jobs on merit, not politics. Doesn\'t do side deals.' },
  { id: 39, name: 'Migs Mayfeld',     contactClass: 'WHITE',  description: 'Ex-Imperial sharpshooter with a complicated conscience. Currently running various freelance operations. His Imperial codes are still active — mostly.' },
  { id: 40, name: 'The Client',       contactClass: 'WHITE',  description: 'An Imperial remnant officer who operates through proxies. Always wears white. Pays extremely well for retrieval operations. Doesn\'t explain why.' },
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
