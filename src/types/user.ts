export type UserRole = 'editor' | 'viewer';


export interface UserDocument {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  displayName?: string;
}

