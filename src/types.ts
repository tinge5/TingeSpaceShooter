export type PlayerProfile = {
  uid: string;
  email: string;
  username: string;
  shipColor: string;
  bestScore: number;
  bestLevel: number;
  updatedAt?: string;
  createdAt?: string;
};

export type AuthContextValue = {
  user: import('firebase/auth').User | null;
  profile: PlayerProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (username: string, shipColor: string) => Promise<void>;
  updateGameStats: (score: number, level: number) => Promise<void>;
};
