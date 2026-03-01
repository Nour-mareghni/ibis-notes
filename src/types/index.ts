export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
}

export interface Note {
  id: string;
  content: string;
  date: string;
  userId: string;
  userName: string;
  createdAt: string;
  done: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
}
