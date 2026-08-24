export type UserRole = 'staff' | 'manager' | 'admin';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  clinicId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}
