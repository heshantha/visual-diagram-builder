import type { UserDocument } from './user.ts';


export interface AuthState {
  user: UserDocument | null;
  loading: boolean;
  error: string | null;
}
