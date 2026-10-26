import type { PlayerProfile } from '../domain/player';
import type { SectionId } from '../domain/navigation';
import { isSectionUnlocked } from './onboarding';
import type { GameNotification } from './notifications';
import type { StoryEventAlert } from '../components/StoryEventPopup';

/**
 * Validates if an action, notification or event is currently allowed by
 * the player's true game progression and unlocked subsystems.
 */
export function canAccessSystem(
  arg1: PlayerProfile | SectionId,
  arg2: SectionId | PlayerProfile,
): boolean {
  const profile = (typeof arg1 === 'object' && arg1 !== null && 'level' in arg1 ? arg1 : arg2) as PlayerProfile;
  const section = (typeof arg1 === 'string' ? arg1 : arg2) as SectionId;
  return isSectionUnlocked(profile, section);
}

/**
 * Validates if a single notification is allowed based on section lock status.
 */
export function isNotificationAllowed(
  arg1: GameNotification | PlayerProfile,
  arg2: PlayerProfile | GameNotification,
): boolean {
  const profile = (typeof arg1 === 'object' && arg1 !== null && 'level' in arg1 ? arg1 : arg2) as PlayerProfile;
  const notif = (typeof arg1 === 'object' && arg1 !== null && 'id' in arg1 && 'title' in arg1 ? arg1 : arg2) as GameNotification;
  const targetSection = (notif.targetSection || notif.section) as SectionId | undefined;
  if (targetSection && !isSectionUnlocked(profile, targetSection)) {
    return false;
  }
  return true;
}

/**
 * Filters out any game notification targeting a locked subsystem.
 * Enforces rule: No stock notifications before stock market is unlocked,
 * no bank notifications before bank is unlocked, etc.
 */
export function filterSynchronizedNotifications(
  arg1: PlayerProfile | GameNotification[],
  arg2: GameNotification[] | PlayerProfile,
): GameNotification[] {
  const profile = (typeof arg1 === 'object' && arg1 !== null && 'level' in arg1 ? arg1 : arg2) as PlayerProfile;
  const notifications = (Array.isArray(arg1) ? arg1 : arg2) as GameNotification[];
  return notifications.filter((notification) => {
    return isNotificationAllowed(notification, profile);
  });
}

/**
 * Checks whether a story event or popup is permitted to appear.
 * Prevents showing an event targeting a locked subsystem (e.g. stock event before stock exchange opens).
 */
export function isStoryEventAllowed(
  arg1: PlayerProfile | StoryEventAlert,
  arg2: StoryEventAlert | PlayerProfile,
): boolean {
  const profile = (typeof arg1 === 'object' && arg1 !== null && 'level' in arg1 ? arg1 : arg2) as PlayerProfile;
  const event = (typeof arg1 === 'object' && arg1 !== null && 'targetSection' in arg1 ? arg1 : arg2) as StoryEventAlert;

  // 1. Check if already dismissed
  const dismissedIds = new Set(profile.dismissedStoryEventIds ?? []);
  if (dismissedIds.has(event.id)) {
    return false;
  }

  // 2. Target section MUST be unlocked
  if (event.targetSection && !isSectionUnlocked(profile, event.targetSection)) {
    return false;
  }

  return true;
}
