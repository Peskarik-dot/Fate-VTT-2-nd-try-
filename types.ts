
export type FateDiceResult = -1 | 0 | 1;

export interface DiceRoll {
  id: string;
  sender: string;
  timestamp: number;
  label: string;
  results: [FateDiceResult, FateDiceResult, FateDiceResult, FateDiceResult];
  modifier: number;
  total: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  type: 'text' | 'roll' | 'system' | 'ai';
  roll?: DiceRoll;
}

export interface FateAspect {
  id: string;
  value: string;
}

export interface FateTempAspect {
  id: string;
  name: string;
  invokes: number;
}

export interface FateSkillSection {
  counts: Record<string, number>;
  inputs: Record<string, string>;
}

export interface FateStunt {
  id: string;
  value: string;
}

export interface FateStressTrack {
  id: string;
  name: string;
  count: number;
  values: boolean[];
  canDelete: boolean;
}

export interface FateConsequence {
  id: string;
  label: string;
  value: number;
  text: string;
}

export interface FateCharacter {
  id: string;
  name: string;
  concept: string;
  trouble: string;
  image?: string;
  fatePoints: number;
  aspects: FateAspect[];
  tempAspects: FateTempAspect[];
  skills: FateSkillSection;
  customSkills: FateSkillSection;
  stunts: FateStunt[];
  extras: string;
  stress: FateStressTrack[];
  consequences: FateConsequence[];
  ownerId: string;
}

export interface GameRoom {
  code: string;
  name: string;
  gmId: string;
  players: string[];
  characters: FateCharacter[];
  messages: ChatMessage[];
}

export enum UserRole {
  GM = 'GM',
  PLAYER = 'PLAYER'
}

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
}
