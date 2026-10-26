import type { PlayerProfile } from '../domain/player';
import type { FinanceLedgerEntry } from '../domain/futureSystems';
import type { GameResult } from './engine';
import { PRODUCT_CATALOG, MATERIAL_CATALOG } from './catalog';
import { getMarketQuote } from './market';
import { normalizeWarehouseLevel, getWarehouseCapacity, getWarehouseUsage } from './warehouse';

export type BotPersonality = 'conservative' | 'balanced' | 'aggressive' | 'speculative' | 'whale';
export type BotIndustryFocus = 'food' | 'petroleum' | 'construction' | 'electronics' | 'transport' | 'real_estate' | 'general';

export interface EconomicBot {
  id: string;
  name: string;
  title: string;
  avatar: string;
  organization: string;
  personality: BotPersonality;
  focus: BotIndustryFocus;
  baseBudget: number;
  currentBudget: number;
  experienceLevel: number; // 1 to 10
  riskTolerance: number; // 0.1 to 1.0
  description: string;
  dialogueGreeting: string;
}

export interface BotMarketOffer {
  id: string;
  botId: string;
  botName: string;
  botAvatar: string;
  botTitle: string;
  type: 'buy_player_product' | 'sell_discounted_raw' | 'commercial_partnership';
  itemId: string;
  itemName: string;
  itemUnit: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  marketPriceComparison: number; // percentage difference vs base/market
  expiresOnDay: number;
  dialogueNote: string;
  createdOnDay: number;
}

export const BASE_ECONOMIC_BOTS: readonly EconomicBot[] = [
  {
    id: 'bot-mamdouh',
    name: 'الحاج ممدوح الصياد',
    title: 'حوت التجارة وكبير موردي الدلتا',
    avatar: '🧔🏻‍♂️',
    organization: 'مجموعة الصياد للتجارة والتوريدات',
    personality: 'aggressive',
    focus: 'food',
    baseBudget: 28_000_000,
    currentBudget: 28_000_000,
    experienceLevel: 9,
    riskTolerance: 0.75,
    description: 'تاجر مخضرم يبسط نفوذه على سلاسل إمداد الأغذية، يشتري المحاصيل والسلع تامة الصنع بالجملة.',
    dialogueGreeting: 'السوق يحتاج نفَساً طويلاً يا بني.. إن كانت بضاعتك مطابقة للمواصفات فلدي سيولة جاهزة للشراء.',
  },
  {
    id: 'bot-laila',
    name: 'ليلى رشدي',
    title: 'مؤسسة صندوق استثمار التكنولوجيا',
    avatar: '👩🏻‍💼',
    organization: 'صندوق فينيكس للاستثمار والابتكار',
    personality: 'balanced',
    focus: 'electronics',
    baseBudget: 35_000_000,
    currentBudget: 35_000_000,
    experienceLevel: 8,
    riskTolerance: 0.60,
    description: 'مستثمرة تكنولوجية حديثة تبحث عن خطوط الإنتاج المتطورة ومكونات السيليكون والأجهزة.',
    dialogueGreeting: 'أبحث عن كفاءة التشغيل وسرعة دوران رأس المال؛ مصانعك الذكية محل اهتمام صندوقنا.',
  },
  {
    id: 'bot-tarek',
    name: 'طارق الألفي',
    title: 'الوريث والمضارب العقاري',
    avatar: '👔',
    organization: 'مجموعة الألفي القابضة',
    personality: 'speculative',
    focus: 'real_estate',
    baseBudget: 45_000_000,
    currentBudget: 45_000_000,
    experienceLevel: 7,
    riskTolerance: 0.90,
    description: 'مضارب شرس يعتمد على ثروته الوراثية لاقتناص الأراضي والمواقع الاستراتيجية في المزادات.',
    dialogueGreeting: 'في عالم الأعمال، البقاء للأقوى ميزانية.. سنرى إن كنت تصمد في جلسات المزايدة القادمة.',
  },
  {
    id: 'bot-fahad',
    name: 'الشيخ فهد الناصر',
    title: 'ملياردير الفرص الاستثمارية الكبرى',
    avatar: '👑',
    organization: 'صندوق المشرق للاستثمار الدولي',
    personality: 'whale',
    focus: 'petroleum',
    baseBudget: 85_000_000,
    currentBudget: 85_000_000,
    experienceLevel: 10,
    riskTolerance: 0.85,
    description: 'مستثمر ومصرفي دولي يبرم الصفقات السيادية ومشاريع البنية التحتية العملاقة ومجمعات الطاقة.',
    dialogueGreeting: 'نتحرك حين تتاح الفرص الاستثنائية؛ الاقتصاد الحقيقي يبنى على الأصول الثابتة والشراكات الموثوقة.',
  },
  {
    id: 'bot-enmaa',
    name: 'شركة الإنماء للتطوير',
    title: 'تكتل المقاولات ومواد البناء',
    avatar: '🏗️',
    organization: 'تكتل الإنماء للتعمير والصناعة',
    personality: 'balanced',
    focus: 'construction',
    baseBudget: 22_000_000,
    currentBudget: 22_000_000,
    experienceLevel: 7,
    riskTolerance: 0.50,
    description: 'تكتل صناعي ومقاولات يطلب كميات هائلة من الحديد والإسمنت ومواد البناء المجهزة لتنفيذ الأبراج.',
    dialogueGreeting: 'مشاريعنا العمرانية لا تتوقف، ونحتاج لمورّدين ملتزمين بجودة منتجات البناء والمعايير القياسية.',
  },
  {
    id: 'bot-alsharq',
    name: 'صندوق الشرق للسيولة',
    title: 'إدارة محافظ الديون وتسييل الأصول',
    avatar: '💼',
    organization: 'الشرق للاستحواذ وإعادة الهيكلة',
    personality: 'conservative',
    focus: 'general',
    baseBudget: 18_000_000,
    currentBudget: 18_000_000,
    experienceLevel: 6,
    riskTolerance: 0.35,
    description: 'صندوق استثماري محافظ يشتري الأصول الموثوقة بأسعار محسوبة ويوفر سيولة نقدية فورية.',
    dialogueGreeting: 'نحلل الأرقام بحذر ودقة؛ نقدّم عروضاً نقدية حاسمة تضمن تخفيف الأعباء وتعظيم السيولة الحرة.',
  },
];

/**
 * Calculates adaptive bots reflecting the player's progression and net worth
 * without arbitrary rigging or unearned advantages.
 */
export function getAdaptiveBots(profile: PlayerProfile): EconomicBot[] {
  const playerNetWorth = Math.max(
    10_000,
    (profile.bankBalance || 0) +
      (profile.lands?.length || 0) * 85_000 +
      (profile.companies?.length || 0) * 160_000 +
      (profile.inventory?.reduce((acc, lot) => acc + lot.quantity * lot.unitCost, 0) || 0)
  );

  const playerLevel = Math.max(1, profile.level || 1);

  // Scale multiplier: scales bot active budget appropriately to challenge the player
  // Early stage (level 1-3): bots act with accessible localized budgets
  // Mid stage (level 4-7): bots deploy enterprise capital
  // Late stage (level 8+): bots deploy institutional sovereign capital
  const scaleFactor = Math.min(3.5, 0.4 + (playerLevel * 0.15) + (playerNetWorth / 5_000_000) * 0.4);

  return BASE_ECONOMIC_BOTS.map((bot) => {
    const budget = Math.round(bot.baseBudget * scaleFactor);
    return {
      ...bot,
      currentBudget: budget,
    };
  });
}

/**
 * Generates dynamic, realistic economic bot offers tailored to the player's current assets and inventory.
 * Each offer is given a unique deterministic/session-safe ID.
 */
export function generateBotMarketOffers(profile: PlayerProfile): BotMarketOffer[] {
  const bots = getAdaptiveBots(profile);
  const day = profile.day;
  const processedOfferIds = new Set(profile.processedBotOfferIds ?? []);
  const offers: BotMarketOffer[] = [];

  // 1. Check player's finished products in warehouse for direct bot purchase offers
  const ownedFinishedLots = (profile.inventory ?? []).filter((lot) =>
    PRODUCT_CATALOG.some((p) => p.id === lot.materialOrProductId && lot.quantity >= 3)
  );

  for (const lot of ownedFinishedLots) {
    const product = PRODUCT_CATALOG.find((p) => p.id === lot.materialOrProductId)!;
    const quote = getMarketQuote(profile, product.id) ?? { currentPrice: product.baseSellPrice };
    
    // Select the most appropriate bot based on industry focus
    const matchingBot = bots.find((b) => {
      if (product.id === 'food-pack' || product.id === 'clean-water') return b.focus === 'food';
      if (product.id === 'refined-fuel' || product.id === 'bottled-gas' || product.id === 'power-units') return b.focus === 'petroleum';
      if (product.id === 'building-blocks') return b.focus === 'construction';
      if (product.id === 'electronics') return b.focus === 'electronics';
      return b.focus === 'general';
    }) ?? bots[0];

    // Purchase quantity: between 25% and 80% of lot quantity (max 50 units per batch)
    const purchaseQty = Math.max(1, Math.min(lot.quantity, Math.min(60, Math.ceil(lot.quantity * 0.6))));
    
    // Price premium based on bot aggressiveness (between +5% and +20% over market)
    const premiumPercent = matchingBot.personality === 'aggressive' ? 0.15
      : matchingBot.personality === 'whale' ? 0.20
      : matchingBot.personality === 'balanced' ? 0.08
      : 0.05;

    const offeredUnitPrice = Math.round(quote.currentPrice * (1 + premiumPercent));
    const totalAmount = offeredUnitPrice * purchaseQty;
    const offerId = `bot-offer-buy-${lot.materialOrProductId}-d${day}-${matchingBot.id}`;

    if (!processedOfferIds.has(offerId)) {
      offers.push({
        id: offerId,
        botId: matchingBot.id,
        botName: matchingBot.name,
        botAvatar: matchingBot.avatar,
        botTitle: matchingBot.title,
        type: 'buy_player_product',
        itemId: product.id,
        itemName: product.name,
        itemUnit: product.unit,
        quantity: purchaseQty,
        unitPrice: offeredUnitPrice,
        totalAmount,
        marketPriceComparison: Math.round(premiumPercent * 100),
        expiresOnDay: day + 2,
        dialogueNote: `مستعد لشراء ${purchaseQty} ${product.unit} من ${product.name} بسعر مميز ${offeredUnitPrice.toLocaleString()} $ (+${Math.round(premiumPercent * 100)}% عن سعر السوق) لتغطية عقود التوريد الفورية لدي.`,
        createdOnDay: day,
      });
    }
  }

  // 2. Supply offer: A bot offering discounted raw materials to help player manufacturing
  const warehouseLevel = normalizeWarehouseLevel(profile.warehouseLevel);
  const warehouseCapacity = getWarehouseCapacity(warehouseLevel);
  const currentUsage = getWarehouseUsage(profile.inventory, profile.productionOrders);
  const freeSpace = Math.max(0, warehouseCapacity.materials - currentUsage.materials);

  if (freeSpace >= 10) {
    const rawMaterials = MATERIAL_CATALOG.filter((m) => m.pricePerUnit > 0);
    const daySeed = (day * 7 + 13) % rawMaterials.length;
    const material = rawMaterials[daySeed];
    const supplierBot = bots.find((b) => b.id === 'bot-mamdouh' || b.id === 'bot-enmaa') ?? bots[1];
    
    const supplyQty = Math.min(freeSpace, Math.min(50, 15 + (day % 15)));
    const discountPercent = 0.12; // 12% discount
    const discountedUnitPrice = Math.max(1, Math.round(material.pricePerUnit * (1 - discountPercent)));
    const totalCost = discountedUnitPrice * supplyQty;
    const rawOfferId = `bot-offer-raw-${material.id}-d${day}-${supplierBot.id}`;

    if (!processedOfferIds.has(rawOfferId) && totalCost > 0) {
      offers.push({
        id: rawOfferId,
        botId: supplierBot.id,
        botName: supplierBot.name,
        botAvatar: supplierBot.avatar,
        botTitle: supplierBot.title,
        type: 'sell_discounted_raw',
        itemId: material.id,
        itemName: material.name,
        itemUnit: material.unit,
        quantity: supplyQty,
        unitPrice: discountedUnitPrice,
        totalAmount: totalCost,
        marketPriceComparison: -Math.round(discountPercent * 100),
        expiresOnDay: day + 2,
        dialogueNote: `لدي فائض شحنة ${supplyQty} ${material.unit} من ${material.name} في الميناء؛ أعرضها عليك بخصم ${Math.round(discountPercent * 100)}% لدعم تشغيل خطوطك.`,
        createdOnDay: day,
      });
    }
  }

  return offers;
}

/**
 * Atomically executes a deal with an economic bot, preventing duplicate payouts
 * or inventory discrepancies via strict idempotency checks.
 */
export function acceptBotMarketOffer(
  profile: PlayerProfile,
  offerId: string
): GameResult<{ offer: BotMarketOffer; transactionId: string }> {
  // Idempotency check: verify offer was not processed before
  if ((profile.processedBotOfferIds ?? []).includes(offerId)) {
    return {
      ok: false,
      profile,
      reason: 'already-claimed',
      message: 'تمت تسوية هذه الصفقة التجارية واستلام مستحقاتها مسبقاً.',
    };
  }

  const currentOffers = generateBotMarketOffers(profile);
  const offer = currentOffers.find((o) => o.id === offerId);

  if (!offer) {
    return {
      ok: false,
      profile,
      reason: 'not-found',
      message: 'العرض التجاري غير موجود أو انتهت صلاحيته.',
    };
  }

  const transactionId = `tx-bot-trade-${offerId}-${Date.now()}`;
  const nowIso = new Date().toISOString();

  if (offer.type === 'buy_player_product') {
    // Check player has the product in inventory
    const lot = profile.inventory.find(
      (l) => l.materialOrProductId === offer.itemId && l.quantity >= offer.quantity
    );

    if (!lot) {
      return {
        ok: false,
        profile,
        reason: 'insufficient-materials',
        message: `لا تملك الكمية الكافية (${offer.quantity} ${offer.itemUnit}) من ${offer.itemName} في مخزنك لإتمام الصفقة.`,
      };
    }

    // Deduct items from inventory
    const updatedInventory = profile.inventory.flatMap((item) => {
      if (item.id !== lot.id) return [item];
      if (item.quantity === offer.quantity) return [];
      return [{ ...item, quantity: item.quantity - offer.quantity }];
    });

    const ledger: FinanceLedgerEntry = {
      id: transactionId,
      category: 'revenue',
      amount: offer.totalAmount,
      countryId: profile.countryId,
      occurredAt: nowIso,
      note: `صفقة تجارية خاصة مع [${offer.botName}]: بيع ${offer.quantity} ${offer.itemUnit} من ${offer.itemName}`,
    };

    const nextProfile: PlayerProfile = {
      ...profile,
      bankBalance: profile.bankBalance + offer.totalAmount,
      inventory: updatedInventory,
      processedBotOfferIds: [...(profile.processedBotOfferIds ?? []), offerId],
      finances: {
        ...profile.finances,
        totalRevenue: (profile.finances?.totalRevenue ?? 0) + offer.totalAmount,
        netProfit: (profile.finances?.netProfit ?? 0) + offer.totalAmount,
      },
      ledger: [ledger, ...(profile.ledger ?? [])],
    };

    return {
      ok: true,
      profile: nextProfile,
      message: `تمت الصفقة بنجاح مع ${offer.botName}! تم تسليم ${offer.quantity} ${offer.itemUnit} واستلام ${offer.totalAmount.toLocaleString()} $ نقداً.`,
      data: { offer, transactionId },
    };
  } else if (offer.type === 'sell_discounted_raw') {
    // Check player has enough funds
    if (profile.bankBalance < offer.totalAmount) {
      return {
        ok: false,
        profile,
        reason: 'insufficient-funds',
        message: `رصيدك لا يكفي لدفع قيمة الشحنة (${offer.totalAmount.toLocaleString()} $).`,
      };
    }

    // Check warehouse capacity
    const warehouseLevel = normalizeWarehouseLevel(profile.warehouseLevel);
    const capacity = getWarehouseCapacity(warehouseLevel);
    const usage = getWarehouseUsage(profile.inventory, profile.productionOrders);
    if (usage.materials + offer.quantity > capacity.materials) {
      return {
        ok: false,
        profile,
        reason: 'storage-limit',
        message: 'سعة المخزن لا تكفي لاستيعاب هذه الشحنة؛ طوّر المخزن أو أفرغ مساحة أولاً.',
      };
    }

    // Add material to inventory
    const existing = profile.inventory.find((l) => l.materialOrProductId === offer.itemId);
    const updatedInventory = existing
      ? profile.inventory.map((l) =>
          l.id === existing.id
            ? {
                ...l,
                quantity: l.quantity + offer.quantity,
                unitCost: Math.round((l.quantity * l.unitCost + offer.totalAmount) / (l.quantity + offer.quantity)),
              }
            : l
        )
      : [
          ...profile.inventory,
          {
            id: `inv-bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            materialOrProductId: offer.itemId,
            quantity: offer.quantity,
            unit: offer.itemUnit,
            unitCost: offer.unitPrice,
            qualityScore: 92,
          },
        ];

    const ledger: FinanceLedgerEntry = {
      id: transactionId,
      category: 'asset',
      amount: offer.totalAmount,
      countryId: profile.countryId,
      occurredAt: nowIso,
      note: `شراء خامات مخفضة من [${offer.botName}]: ${offer.quantity} ${offer.itemUnit} من ${offer.itemName}`,
    };

    const nextProfile: PlayerProfile = {
      ...profile,
      bankBalance: profile.bankBalance - offer.totalAmount,
      inventory: updatedInventory,
      processedBotOfferIds: [...(profile.processedBotOfferIds ?? []), offerId],
      ledger: [ledger, ...(profile.ledger ?? [])],
    };

    return {
      ok: true,
      profile: nextProfile,
      message: `تم شراء ${offer.quantity} ${offer.itemUnit} من ${offer.itemName} من ${offer.botName} بنجاح وإضافتها للمخزن.`,
      data: { offer, transactionId },
    };
  }

  return {
    ok: false,
    profile,
    reason: 'invalid-input',
    message: 'نوع العرض غير معروف.',
  };
}
