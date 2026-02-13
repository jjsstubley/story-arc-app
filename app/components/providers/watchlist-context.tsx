"use client"
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface WatchlistContextType {
  // Update a watchlist
  updateWatchlist: (watchlistId: string) => void;
  
  // Check if a watchlist has been updated (for triggering re-renders)
  isWatchlistUpdated: (watchlistId: string) => boolean;
  
  // Reset the update flag
  resetUpdate: (watchlistId: string) => void;
  isOtherWatchlistsOpen: boolean;
  setIsOtherWatchlistsOpen: (isOpen: boolean) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [updatedFlags, setUpdatedFlags] = useState<Set<string>>(new Set());
  const [isOtherWatchlistsOpen, setIsOtherWatchlistsOpen] = useState(false);

  const updateWatchlist = useCallback((watchlistId: string) => {
    setUpdatedFlags(prev => new Set(prev).add(watchlistId));
  }, []);


  const isWatchlistUpdated = useCallback((watchlistId: string) => {
    return updatedFlags.has(watchlistId);
  }, [updatedFlags]);

  const resetUpdate = useCallback((watchlistId: string) => {
    setUpdatedFlags(prev => {
      const newSet = new Set(prev);
      newSet.delete(watchlistId);
      return newSet;
    });
  }, []);

  const value: WatchlistContextType = {
    updateWatchlist,
    isWatchlistUpdated,
    resetUpdate,
    isOtherWatchlistsOpen,
    setIsOtherWatchlistsOpen
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlistContext() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlistContext must be used within a WatchlistProvider');
  }
  return context;
}