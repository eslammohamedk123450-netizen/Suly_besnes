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
export interface QuestReward {
  type: 'gold' | 'diamonds';
  amount: number;
  label: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  isCompleted: boolean;
  reward: QuestReward;
  isClaimed?: boolean;
  icon?: string;
  category?: 'construction' | 'wealth' | 'upgrade';
}

export type QuestTask = Quest;

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
    description: 'قم ببناء أو تملك مبنى أو شركة في إمبراطوريتك.',
    targetAmount: 1,
    currentAmount: 0,
    isCompleted: false,
    isClaimed: false,
    reward: {
      type: 'diamonds',
      amount: 20,
      label: '20 ماسة 💎',
    },
    icon: '🏗️',
    category: 'construction',
  },
  {
    id: 'quest_businessman',
    title: 'توليد الدخل المالي',
    description: 'قم بتوليد دخل مالي وتحقيق أرباح بقيمة 50,000 $ من استثماراتك ومبيعاتك.',
    targetAmount: 50000,
    currentAmount: 0,
    isCompleted: false,
    isClaimed: false,
    reward: {
      type: 'diamonds',
      amount: 50,
      label: '50 ماسة 💎',
    },
    icon: '💎',
    category: 'wealth',
  },
  {
    id: 'quest_expansion',
    title: 'التوسع الإمبراطوري',
    description: 'قم بترقية أي مبنى أو منشأة إلى المستوى 2 أو أعلى.',
    targetAmount: 1,
    currentAmount: 0,
    isCompleted: false,
    isClaimed: false,
    reward: {
      type: 'diamonds',
      amount: 30,
      label: '30 ماسة 💎',
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
    } else if (task.id === 'quest_businessman' || task.id === 'quest_generate_income') {
      const accumulatedRevenue = profile.finances?.totalRevenue ?? 0;
      currentAmount = Math.max(task.currentAmount, accumulatedRevenue, totalGoldOrMoney);
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

/**
 * تسجيل الدخل المالي وتحديث تقدم مهمة توليد الدخل فورياً عند زيادة أموال اللاعب
 */
export function recordIncomeForDailyQuests(
  profileId: string,
  amountEarned: number,
  currentTasks: QuestTask[]
): QuestTask[] {
  if (amountEarned <= 0) return currentTasks;
  const next = currentTasks.map((task) => {
    if (task.id === 'quest_businessman' || task.id === 'quest_generate_income') {
      const nextAmount = (task.currentAmount ?? 0) + amountEarned;
      const isCompleted = nextAmount >= task.targetAmount;
      return {
        ...task,
        currentAmount: nextAmount,
        isCompleted,
      };
    }
    return task;
  });
  saveQuestTasks(profileId, next);
  return next;
}
