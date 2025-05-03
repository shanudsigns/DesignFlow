import React, { createContext, useContext, useState, useEffect } from 'react';
import { Designer, UserRole, DesignerSkill, DesignerAvailability } from '../types';
import { generateRandomColor } from '../utils/colors';

type DesignersContextType = {
  designers: Designer[];
  addDesigner: (name: string, role: UserRole, isAdmin?: boolean) => void;
  updateDesigner: (id: string, updates: Partial<Designer>) => void;
  removeDesigner: (id: string) => void;
  getDesignerById: (id: string) => Designer | undefined;
  updateDesignerSkills: (id: string, skills: DesignerSkill[]) => void;
  updateDesignerAvailability: (id: string, availability: DesignerAvailability[]) => void;
  updateWorkingHours: (id: string, workingHours: Designer['workingHours']) => void;
  getAvailableDesigners: (date: string, requiredSkills?: string[]) => Designer[];
};

const DesignersContext = createContext<DesignersContextType | undefined>(undefined);

// Sample initial designers with skills and availability
const initialDesigners: Designer[] = [
  {
    id: '1',
    name: 'Alex Kim',
    color: '#4f46e5',
    active: true,
    role: 'designer',
    isAdmin: true,
    skills: [
      { name: 'UI Design', level: 'expert' },
      { name: 'Branding', level: 'intermediate' }
    ],
    maxDailyHours: 9,
    workingHours: {
      sunday: { start: '09:00', end: '18:00' },
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '18:00' }
    }
  },
  {
    id: '2',
    name: 'Jordan Smith',
    color: '#0ea5e9',
    active: true,
    role: 'designer',
    skills: [
      { name: 'Web Design', level: 'expert' },
      { name: 'Motion Graphics', level: 'intermediate' }
    ],
    maxDailyHours: 9,
    workingHours: {
      sunday: { start: '09:00', end: '18:00' },
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '18:00' }
    }
  },
  {
    id: '3',
    name: 'Taylor Johnson',
    color: '#14b8a6',
    active: true,
    role: 'designer',
    skills: [
      { name: 'Print Design', level: 'expert' },
      { name: 'Typography', level: 'expert' }
    ],
    maxDailyHours: 9,
    workingHours: {
      sunday: { start: '09:00', end: '18:00' },
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '18:00' }
    }
  },
  {
    id: '4',
    name: 'Morgan Lee',
    color: '#f59e0b',
    active: true,
    role: 'production-manager',
    maxDailyHours: 9,
    workingHours: {
      sunday: { start: '09:00', end: '18:00' },
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '18:00' }
    }
  },
];

export const DesignersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [designers, setDesigners] = useState<Designer[]>(() => {
    const savedDesigners = localStorage.getItem('designers');
    return savedDesigners ? JSON.parse(savedDesigners) : initialDesigners;
  });

  useEffect(() => {
    localStorage.setItem('designers', JSON.stringify(designers));
  }, [designers]);

  const addDesigner = (name: string, role: UserRole, isAdmin: boolean = false) => {
    const newDesigner: Designer = {
      id: Date.now().toString(),
      name,
      color: generateRandomColor(),
      active: true,
      role,
      isAdmin,
      maxDailyHours: 9,
      workingHours: {
        sunday: { start: '09:00', end: '18:00' },
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' }
      }
    };
    setDesigners([...designers, newDesigner]);
  };

  const updateDesigner = (id: string, updates: Partial<Designer>) => {
    setDesigners(
      designers.map((designer) =>
        designer.id === id ? { ...designer, ...updates } : designer
      )
    );
  };

  const removeDesigner = (id: string) => {
    setDesigners(designers.filter((designer) => designer.id !== id));
  };

  const getDesignerById = (id: string) => {
    return designers.find((designer) => designer.id === id);
  };

  const updateDesignerSkills = (id: string, skills: DesignerSkill[]) => {
    updateDesigner(id, { skills });
  };

  const updateDesignerAvailability = (id: string, availability: DesignerAvailability[]) => {
    updateDesigner(id, { availability });
  };

  const updateWorkingHours = (id: string, workingHours: Designer['workingHours']) => {
    updateDesigner(id, { workingHours });
  };

  const getAvailableDesigners = (date: string, requiredSkills?: string[]) => {
    return designers.filter(designer => {
      // Check if designer is active
      if (!designer.active) return false;

      // Check if designer has required skills
      if (requiredSkills && requiredSkills.length > 0) {
        const designerSkills = designer.skills?.map(skill => skill.name) || [];
        if (!requiredSkills.every(skill => designerSkills.includes(skill))) {
          return false;
        }
      }

      // Check if designer is available on the given date
      if (designer.availability?.some(a => a.date === date)) {
        return false;
      }

      return true;
    });
  };

  return (
    <DesignersContext.Provider
      value={{
        designers,
        addDesigner,
        updateDesigner,
        removeDesigner,
        getDesignerById,
        updateDesignerSkills,
        updateDesignerAvailability,
        updateWorkingHours,
        getAvailableDesigners
      }}
    >
      {children}
    </DesignersContext.Provider>
  );
};

export const useDesigners = () => {
  const context = useContext(DesignersContext);
  if (context === undefined) {
    throw new Error('useDesigners must be used within a DesignersProvider');
  }
  return context;
};