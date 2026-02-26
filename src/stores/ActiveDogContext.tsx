/**
 * ActiveDogContext — 멀티독 전환 상태 관리 (무료 1마리, PRO 5마리)
 * Parity: APP-001
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Dog } from 'types/dog';

interface ActiveDogContextValue {
  activeDog: Dog | null;
  dogs: Dog[];
  setActiveDog: (dog: Dog) => void;
  setDogs: (dogs: Dog[]) => void;
  canAddDog: (isPro: boolean) => boolean;
}

const ActiveDogContext = createContext<ActiveDogContextValue | null>(null);

const DOG_LIMITS = { FREE: 1, PRO: 5 } as const;

export function ActiveDogProvider({ children }: { children: React.ReactNode }) {
  const [activeDog, setActiveDogState] = useState<Dog | null>(null);
  const [dogs, setDogsState] = useState<Dog[]>([]);

  const setActiveDog = useCallback((dog: Dog) => {
    setActiveDogState(dog);
  }, []);

  const setDogs = useCallback((newDogs: Dog[]) => {
    setDogsState(newDogs);
    if (!newDogs.find((d) => d.id === activeDog?.id)) {
      setActiveDogState(newDogs[0] ?? null);
    }
  }, [activeDog?.id]);

  const canAddDog = useCallback(
    (isPro: boolean) => {
      const limit = isPro ? DOG_LIMITS.PRO : DOG_LIMITS.FREE;
      return dogs.length < limit;
    },
    [dogs.length]
  );

  const value = useMemo(
    () => ({ activeDog, dogs, setActiveDog, setDogs, canAddDog }),
    [activeDog, dogs, setActiveDog, setDogs, canAddDog]
  );

  return <ActiveDogContext.Provider value={value}>{children}</ActiveDogContext.Provider>;
}

export function useActiveDog(): ActiveDogContextValue {
  const ctx = useContext(ActiveDogContext);
  if (!ctx) throw new Error('useActiveDog must be used within ActiveDogProvider');
  return ctx;
}
