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

export interface Policy {
  id: number;
  title: string;
  category: string;
  overview?: string;
  content?: unknown;
  created_at?: string;
  updated_at?: string;
}

export interface ProtocolCategory {
  id: number;
  name: string;
  color: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProtocolItem {
  id: number;
  category_id: number;
  title: string;
  description?: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProtocolBlock {
  id: number;
  item_id: number;
  type: string;
  title?: string;
  content?: unknown;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface BoardingProcedure {
  id: number;
  title: string;
  category: string;
  overview?: string;
  content?: unknown;
  created_at?: string;
  updated_at?: string;
}

export type CustomTabType = 'cards' | 'form' | 'checklist';
export type CustomTabLocation = 'sidebar' | 'top';

export interface CustomTab {
  id: number;
  name: string;
  subtitle?: string;
  icon: string;
  type: CustomTabType;
  location: CustomTabLocation;
  columns?: number;
  searchBar?: boolean;
  created_at?: string;
  updated_at?: string;
}
