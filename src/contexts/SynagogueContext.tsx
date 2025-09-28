import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

const client = generateClient();

interface Synagogue {
  id: string;
  name: string;
  address?: string;
  contactPhone?: string;
  active: boolean;
  owner?: string;
}

interface SynagogueContextType {
  currentSynagogue: Synagogue | null;
  synagogues: Synagogue[];
  loading: boolean;
  error: string | null;
  selectSynagogue: (synagogue: Synagogue) => void;
  createSynagogue: (synagogue: Omit<Synagogue, 'id'>) => Promise<void>;
}

const SynagogueContext = createContext<SynagogueContextType | undefined>(undefined);

export const useSynagogue = () => {
  const context = useContext(SynagogueContext);
  if (context === undefined) {
    throw new Error('useSynagogue must be used within a SynagogueProvider');
  }
  return context;
};

interface SynagogueProviderProps {
  children: ReactNode;
}

export const SynagogueProvider: React.FC<SynagogueProviderProps> = ({ children }) => {
  const [currentSynagogue, setCurrentSynagogue] = useState<Synagogue | null>(null);
  const [synagogues, setSynagogues] = useState<Synagogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSynagogues();
  }, []);

  const loadSynagogues = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      
      // For now, create a mock synagogue until GraphQL is fully set up
      const mockSynagogue: Synagogue = {
        id: '1',
        name: 'בית כנסת נון',
        address: 'ירושלים, ישראל',
        contactPhone: '02-1234567',
        active: true,
        owner: user.userId
      };
      
      setSynagogues([mockSynagogue]);
      setCurrentSynagogue(mockSynagogue);
    } catch (err) {
      setError('שגיאה בטעינת בתי הכנסת');
      console.error('Error loading synagogues:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectSynagogue = (synagogue: Synagogue) => {
    setCurrentSynagogue(synagogue);
    localStorage.setItem('selectedSynagogue', JSON.stringify(synagogue));
  };

  const createSynagogue = async (synagogueData: Omit<Synagogue, 'id'>) => {
    try {
      // This would normally create via GraphQL
      const newSynagogue: Synagogue = {
        ...synagogueData,
        id: Date.now().toString()
      };
      
      setSynagogues(prev => [...prev, newSynagogue]);
      setCurrentSynagogue(newSynagogue);
    } catch (err) {
      setError('שגיאה ביצירת בית כנסת חדש');
      console.error('Error creating synagogue:', err);
    }
  };

  const value: SynagogueContextType = {
    currentSynagogue,
    synagogues,
    loading,
    error,
    selectSynagogue,
    createSynagogue
  };

  return (
    <SynagogueContext.Provider value={value}>
      {children}
    </SynagogueContext.Provider>
  );
};
