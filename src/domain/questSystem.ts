/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PlayerProfile } from './player';
import { loadCityConstructions } from '../game/cityGridSystem';

/**
 * الواجهة الرسمية للمهمة وفق متطلبات التحديث:
 * id, title, description, targetAmount, currentAmount, isCompleted, reward
 */
export interface QuestTask {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  isCompleted: boolean;
  isClaimed?: boolean;
  reward: {
    type: 'gold' | 'diamonds';
    amount: number;
    label: string;
  };
  icon?: string;
  category?: 'construction' | 'wealth' | 'upgrade';
}

/**
 * 3 مهام افتراضية أساسية:
 * 1. "البداية الصغيرة": قم ببناء 1 مبنى (المكافأة: 5000 ذهب).
 * 2. "رجل الأعمال": اجمع 50,000 ذهب (المكافأة: 10 ألماس).
 * 3. "التوسع": قم بترقية أي مبنى للمستوى 2 (المكافأة: 15000 ذهب).
 */
export const DEFAULT_QUEST_TASKS: QuestTask[] = [
  {
    id: 'quest_small_beginning',
    title: 'البداية الصغيرة',
    description: 'قم ببناء 1 مبنى تجاري أو صناعي في إمبراطوريتك.',
    targetAmount: 1,
    currentAmount: 0,
    isCompleted: false,
    isClaimed: false,
    reward: {
      type: 'gold',
      amount: 5000,
      label: '5000 ذهب',
    },
    icon: '🏗️',
    category: 'construction',
  },
  {
    id: 'quest_businessman',
    title: 'رجل الأعمال',
    description: 'اجمع 50,000 ذهب في رصيدك المالي لتعزيز سيولتك.',
    targetAmount: 50000,
    currentAmount: 0,
    isCompleted: false,
    isClaimed: false,
    reward: {
      type: 'diamonds',
      amount: 10,
      label: '10 ألماس',
    },
    icon: '💰',
    category: 'wealth',
  },
  {
    id: 'quest_expansion',
    title: 'التوسع',
    description: 'قم بترقية أي مبنى أو شركة للمستوى 2 لزيادة الإنتاجية.',
    targetAmount: 1,
    currentAmount: 0,
    isCompleted: false,
    isClaimed: false,
    reward: {
      type: 'gold',
      amount: 15000,
      label: '15000 ذهب',
    },
    icon: '⚡',
    category: 'upgrade',
  },
];

const STORAGE_KEY_PREFIX = 'suly_quest_manager_state_';

/**
 * تحميل حالة المهام المخزنة للاعب
 */
export function loadQuestTasks(profileId: string): QuestTask[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${profileId}`);
    if (raw) {
      const parsed: QuestTask[] = JSON.parse(raw);
      // Merge with default tasks if any are missing
      return DEFAULT_QUEST_TASKS.map((defaultTask) => {
        const found = parsed.find((p) => p.id === defaultTask.id);
        return found ? { ...defaultTask, ...found } : defaultTask;
      });
    }
  } catch {
    // Ignore error
  }
  return DEFAULT_QUEST_TASKS;
}

/**
 * حفظ حالة المهام للاعب
 */
export function saveQuestTasks(profileId: string, tasks: QuestTask[]): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${profileId}`, JSON.stringify(tasks));
  } catch {
    // Ignore error
  }
}

/**
 * ربط أحداث اللعبة تلقائياً وتحديث currentAmount و isCompleted لكل مهمة
 */
export function syncQuestTasksWithGame(profile: PlayerProfile, currentTasks: QuestTask[]): QuestTask[] {
  // 1. حساب عدد المباني المشيدة (من الشركات أو شبكة المدينة)
  let buildingsCount = profile.companies?.length ?? 0;
  try {
    const constructions = loadCityConstructions(profile);
    const placedCount = Object.keys(constructions).length;
    buildingsCount = Math.max(buildingsCount, placedCount);
  } catch {
    // Ignore
  }

  // 2. حساب المال/الذهب المجمع
  const totalGoldOrMoney = profile.bankBalance ?? 0;

  // 3. التحقق من وجود أي مبنى تمت ترقيته للمستوى 2 على الأقل
  const hasUpgradedBuilding =
    (profile.companies?.some((c) => (c.upgradeLevel ?? 1) >= 2) ?? false) ||
    (profile.warehouseLevel ?? 1) >= 2 ||
    (profile.lands?.some((l) => (l.upgradeLevel ?? 1) >= 2) ?? false) ||
    (profile.cartelStrongholdLevel ?? 1) >= 2 ||
    (profile.level ?? 1) >= 2;

  return currentTasks.map((task) => {
    let currentAmount = task.currentAmount;

    if (task.id === 'quest_small_beginning') {
      currentAmount = Math.max(task.currentAmount, buildingsCount);
    } else if (task.id === 'quest_businessman') {
      currentAmount = Math.max(task.currentAmount, totalGoldOrMoney);
    } else if (task.id === 'quest_expansion') {
      currentAmount = hasUpgradedBuilding ? 1 : Math.max(task.currentAmount, 0);
    }

    const isCompleted = currentAmount >= task.targetAmount;

    return {
      ...task,
      currentAmount,
      isCompleted,
    };
  });
}
