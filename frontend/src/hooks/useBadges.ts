import { useState, useEffect, useCallback } from 'react';
import type { Badge, UserBadge } from '../services/badge.service';
import { badgeService } from '../services/badge.service';

export function useBadges(userId: string) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBadges = useCallback(async () => {
    try {
      setIsLoading(true);
      const [userBadges, allBadges] = await Promise.all([
        badgeService.getUserBadges(userId),
        badgeService.getAllBadges()
      ]);

      setBadges(userBadges);
      setAvailableBadges(allBadges);
      setError(null);
    } catch (err) {
      console.error('Error loading badges:', err);
      setError('Error al cargar las insignias');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadBadges();
    }
  }, [userId, loadBadges]);

  return {
    badges,
    availableBadges,
    isLoading,
    error,
    reloadBadges: loadBadges
  };
}