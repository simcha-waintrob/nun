import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

const client = generateClient();

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER'
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  synagogueId?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface Synagogue {
  id: string;
  name: string;
  hebrewName: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  adminUserId: string;
  active: boolean;
  createdAt: string;
  logoUrl?: string; // URL של לוגו בית הכנסת
  logoFile?: File; // קובץ הלוגו להעלאה
  settings?: {
    timezone: string;
    currency: string;
    language: string;
  };
}

interface AdminContextType {
  currentUser: AdminUser | null;
  userRole: UserRole;
  synagogues: Synagogue[];
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  
  // Synagogue management (Super Admin only)
  createSynagogue: (synagogue: Omit<Synagogue, 'id' | 'createdAt'>) => Promise<void>;
  updateSynagogue: (id: string, updates: Partial<Synagogue>) => Promise<void>;
  deleteSynagogue: (id: string) => Promise<void>;
  
  // User management
  createUser: (user: Omit<AdminUser, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<AdminUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // Permission checks
  canManageSynagogues: () => boolean;
  canManageUsers: (targetSynagogueId?: string) => boolean;
  canAccessSynagogue: (synagogueId: string) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [synagogues, setSynagogues] = useState<Synagogue[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      
      // Mock data for development - replace with actual GraphQL queries
      const mockCurrentUser: AdminUser = {
        id: user.userId,
        email: user.signInDetails?.loginId || 'admin@example.com',
        name: 'מנהל מערכת',
        role: UserRole.SUPER_ADMIN, // Default to super admin for development
        active: true,
        createdAt: new Date().toISOString()
      };

      const mockSynagogues: Synagogue[] = [
        {
          id: '1',
          name: 'Synagogue Nun',
          hebrewName: 'בית כנסת נון',
          address: 'ירושלים, ישראל',
          contactPhone: '02-1234567',
          contactEmail: 'contact@nun.org.il',
          adminUserId: 'admin-1',
          active: true,
          createdAt: new Date().toISOString(),
          logoUrl: 'https://via.placeholder.com/150x150/1976d2/ffffff?text=נון', // לוגו דמה
          settings: {
            timezone: 'Asia/Jerusalem',
            currency: 'ILS',
            language: 'he'
          }
        },
        {
          id: '2',
          name: 'Beth Shalom',
          hebrewName: 'בית שלום',
          address: 'תל אביב, ישראל',
          contactPhone: '03-7654321',
          contactEmail: 'admin@bethshalom.org.il',
          adminUserId: 'admin-2',
          active: true,
          createdAt: new Date().toISOString(),
          logoUrl: 'https://via.placeholder.com/150x150/dc004e/ffffff?text=שלום', // לוגו דמה
          settings: {
            timezone: 'Asia/Jerusalem',
            currency: 'ILS',
            language: 'he'
          }
        }
      ];

      const mockUsers: AdminUser[] = [
        mockCurrentUser,
        {
          id: 'admin-1',
          email: 'admin@nun.org.il',
          name: 'גבאי נון',
          role: UserRole.ADMIN,
          synagogueId: '1',
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'admin-2',
          email: 'admin@bethshalom.org.il',
          name: 'גבאי בית שלום',
          role: UserRole.ADMIN,
          synagogueId: '2',
          active: true,
          createdAt: new Date().toISOString()
        }
      ];

      setCurrentUser(mockCurrentUser);
      setSynagogues(mockSynagogues);
      setUsers(mockUsers);
    } catch (err) {
      setError('שגיאה בטעינת נתוני מנהל');
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSynagogue = async (synagogueData: Omit<Synagogue, 'id' | 'createdAt'>) => {
    try {
      const newSynagogue: Synagogue = {
        ...synagogueData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      setSynagogues(prev => [...prev, newSynagogue]);
    } catch (err) {
      setError('שגיאה ביצירת בית כנסת חדש');
      console.error('Error creating synagogue:', err);
    }
  };

  const updateSynagogue = async (id: string, updates: Partial<Synagogue>) => {
    try {
      setSynagogues(prev => 
        prev.map(synagogue => 
          synagogue.id === id ? { ...synagogue, ...updates } : synagogue
        )
      );
    } catch (err) {
      setError('שגיאה בעדכון בית הכנסת');
      console.error('Error updating synagogue:', err);
    }
  };

  const deleteSynagogue = async (id: string) => {
    try {
      setSynagogues(prev => prev.filter(synagogue => synagogue.id !== id));
      // Also remove users associated with this synagogue
      setUsers(prev => prev.filter(user => user.synagogueId !== id));
    } catch (err) {
      setError('שגיאה במחיקת בית הכנסת');
      console.error('Error deleting synagogue:', err);
    }
  };

  const createUser = async (userData: Omit<AdminUser, 'id' | 'createdAt'>) => {
    try {
      const newUser: AdminUser = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      setUsers(prev => [...prev, newUser]);
    } catch (err) {
      setError('שגיאה ביצירת משתמש חדש');
      console.error('Error creating user:', err);
    }
  };

  const updateUser = async (id: string, updates: Partial<AdminUser>) => {
    try {
      setUsers(prev => 
        prev.map(user => 
          user.id === id ? { ...user, ...updates } : user
        )
      );
    } catch (err) {
      setError('שגיאה בעדכון משתמש');
      console.error('Error updating user:', err);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      setError('שגיאה במחיקת משתמש');
      console.error('Error deleting user:', err);
    }
  };

  // Permission checks
  const canManageSynagogues = () => {
    return currentUser?.role === UserRole.SUPER_ADMIN;
  };

  const canManageUsers = (targetSynagogueId?: string) => {
    if (currentUser?.role === UserRole.SUPER_ADMIN) return true;
    if (currentUser?.role === UserRole.ADMIN && targetSynagogueId) {
      return currentUser.synagogueId === targetSynagogueId;
    }
    return false;
  };

  const canAccessSynagogue = (synagogueId: string) => {
    if (currentUser?.role === UserRole.SUPER_ADMIN) return true;
    return currentUser?.synagogueId === synagogueId;
  };

  const value: AdminContextType = {
    currentUser,
    userRole: currentUser?.role || UserRole.USER,
    synagogues,
    users,
    loading,
    error,
    createSynagogue,
    updateSynagogue,
    deleteSynagogue,
    createUser,
    updateUser,
    deleteUser,
    canManageSynagogues,
    canManageUsers,
    canAccessSynagogue
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
