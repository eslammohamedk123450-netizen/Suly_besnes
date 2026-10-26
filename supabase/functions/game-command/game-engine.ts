// src/domain/countries.ts
function buildIndustryFees() {
  return {
    petroleum: 3500,
    electricity: 2600,
    gas: 3e3,
    water: 2200,
    detergents: 1400,
    food: 1200,
    construction: 1800,
    electronics: 2400,
    transport: 1500
  };
}
var COUNTRIES = [
  // 1. Egypt
  {
    id: "egypt",
    name: "\u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u0645\u0635\u0631 \u0627\u0644\u0639\u0631\u0628\u064A\u0629",
    flag: "\u{1F1EA}\u{1F1EC}",
    storyTitle: "\u0627\u0644\u0625\u0631\u062B \u0648\u062A\u062D\u062F\u064A \u0627\u0644\u0639\u0627\u0634\u0631 \u0645\u0646 \u0631\u0645\u0636\u0627\u0646 \u0648\u0627\u0644\u0642\u0627\u0647\u0631\u0629",
    storySummary: "\u0637\u0631\u062F\u062A\u0643 \u0639\u0627\u0626\u0644\u062A\u0643 \u0630\u0627\u062A \u0627\u0644\u0646\u0641\u0648\u0630 \u0645\u0646 \u0627\u0644\u0642\u0635\u0631 \u0628\u062A\u0647\u0645\u0629 \u0627\u0644\u062C\u0628\u0646 \u0648\u0627\u0644\u0641\u0634\u0644 \u0627\u0644\u0645\u0627\u0644\u064A. \u0633\u0631\u0651\u0628\u062A \u0644\u0643 \u0623\u0645\u0643 25,000$ \u0643\u0627\u0634 \u0644\u062A\u062B\u0628\u062A \u062C\u062F\u0627\u0631\u062A\u0643 \u0648\u062A\u0628\u0646\u064A \u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631\u064A\u062A\u0643 \u0645\u0646 \u062C\u062F\u064A\u062F.",
    storyFull: [
      "\u0623\u0647\u0644\u064B\u0627 \u0628\u0643 \u064A\u0627 \u0628\u0646\u064A\u2026 \u0644\u0642\u062F \u0642\u0631\u0631 \u0648\u0627\u0644\u062F\u0643 \u0648\u0625\u062E\u0648\u062A\u0643 \u0637\u0631\u062F\u0643 \u0646\u0647\u0627\u0626\u064A\u0627\u064B \u0645\u0646 \u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u0648\u062A\u062C\u0631\u064A\u062F\u0643 \u0645\u0646 \u0643\u0644 \u0634\u064A\u0621\u060C \u0648\u0627\u0639\u062A\u0628\u0631\u0648\u0643 \u0641\u0627\u0634\u0644\u0627\u064B \u0644\u0627 \u064A\u0633\u062A\u0637\u064A\u0639 \u0625\u062F\u0627\u0631\u0629 \u0623\u0645\u0648\u0627\u0644 \u0627\u0644\u0639\u0627\u0626\u0644\u0629.",
      "\u0644\u0643\u0646\u0646\u064A \u0645\u0624\u0645\u0646\u0629 \u0628\u0643! \u062A\u0633\u0644\u0644\u062A \u0625\u0644\u064A\u0643 \u0633\u0631\u0627\u064B \u0648\u0623\u0639\u0637\u064A\u062A\u0643 \u062E\u0645\u0633\u0629 \u0648\u0639\u0634\u0631\u064A\u0646 \u0623\u0644\u0641 \u062F\u0648\u0644\u0627\u0631 (25,000$) \u0643\u0627\u0646\u062A \u0645\u062F\u062E\u0631\u0627\u062A\u064A \u0627\u0644\u062E\u0627\u0635\u0629\u2026 \u0627\u0630\u0647\u0628 \u0625\u0644\u0649 \u0627\u0644\u0639\u0627\u0634\u0631 \u0645\u0646 \u0631\u0645\u0636\u0627\u0646 \u0648\u0645\u0648\u0627\u0646\u0626 \u0627\u0644\u0633\u0648\u064A\u0633 \u0648\u0628\u0648\u0631\u0633\u0639\u064A\u062F \u0648\u0627\u0628\u0646\u0650 \u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631\u064A\u0629 \u062A\u0647\u0632 \u0627\u0644\u0623\u0633\u0648\u0627\u0642!",
      "\u0644\u0627 \u062A\u0631\u062C\u0639 \u0625\u0644\u064A\u0646\u0627 \u0625\u0644\u0627 \u0648\u0623\u0646\u062A \u0627\u0644\u0623\u0633\u0637\u0648\u0631\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0627\u0644\u062A\u064A \u064A\u0631\u0643\u0639 \u0644\u0647\u0627 \u0627\u0644\u0645\u0646\u0627\u0641\u0633\u0648\u0646 \u0648\u062A\u062B\u0628\u062A \u0644\u0648\u0627\u0644\u062F\u0643 \u0623\u0646\u0643 \u0627\u0644\u0633\u0646\u062F \u0627\u0644\u062D\u0642\u064A\u0642\u064A \u0648\u0627\u0644\u0642\u0627\u0626\u062F \u0627\u0644\u0623\u0639\u0638\u0645."
    ],
    currency: { code: "USD", symbol: "$", name: "\u0627\u0644\u062F\u0648\u0644\u0627\u0631 \u0627\u0644\u0623\u0645\u0631\u064A\u0643\u064A" },
    startingBalance: 25e3,
    startingBalanceEgpEquivalent: 25e3,
    economy: {
      exchangeRateToEgp: 1,
      companySetupFee: 2e3,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.12,
      customsRate: 0.02,
      operatingCostMultiplier: 1
    }
  },
  // 2. Saudi Arabia
  {
    id: "saudi",
    name: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
    flag: "\u{1F1F8}\u{1F1E6}",
    storyTitle: "\u062A\u062D\u062F\u064A \u0627\u0644\u0631\u064A\u0627\u0636 \u0648\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0643\u0628\u0631\u0649",
    storySummary: "\u0637\u0631\u062F\u062A\u0643 \u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u0645\u0646 \u0645\u062C\u0644\u0633 \u0627\u0644\u0631\u064A\u0627\u0636 \u0627\u0644\u0645\u0631\u0645\u0648\u0642. \u0633\u0644\u0651\u0645\u062A\u0643 \u0623\u0645\u0643 25,000$ \u0644\u062A\u062A\u0635\u062F\u0649 \u0644\u0644\u062A\u062D\u062F\u064A \u0648\u062A\u0642\u062A\u062D\u0645 \u0645\u062F\u0646 \u0627\u0644\u0635\u0646\u0627\u0639\u0629 \u0648\u0627\u0644\u062C\u0628\u064A\u0644 \u0648\u0633\u062F\u064A\u0631.",
    storyFull: [
      "\u064A\u0627 \u0628\u0646\u064A\u2026 \u0627\u062A\u0647\u0645\u0643 \u0623\u0647\u0644\u0643 \u0641\u064A \u0627\u0644\u0631\u064A\u0627\u0636 \u0628\u0639\u062F\u0645 \u0627\u0644\u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0651\u0629\u060C \u0648\u062C\u0631\u0651\u062F\u0648\u0643 \u0645\u0646 \u0645\u0646\u0627\u0635\u0628 \u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u0648\u0637\u0631\u062F\u0648\u0643 \u0645\u0646 \u0627\u0644\u0645\u062C\u0644\u0633 \u0627\u0644\u0643\u0628\u064A\u0631.",
      "\u0644\u0643\u0646 \u0642\u0644\u0628\u064A \u0645\u0639\u0643! \u0647\u0631\u0628\u062A \u0644\u0643 \u0633\u0631\u0627\u064B 25,000 \u062F\u0648\u0644\u0627\u0631 \u0643\u0627\u0634\u2026 \u0627\u0646\u0637\u0644\u0642 \u0646\u062D\u0648 \u0645\u062F\u0646 \u0627\u0644\u0631\u064A\u0627\u0636 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0648\u0645\u0648\u0627\u0646\u0626 \u062C\u062F\u0629 \u0648\u0627\u0644\u062C\u0628\u064A\u0644!",
      "\u0627\u0642\u062A\u062D\u0645 \u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0631\u0624\u064A\u0629 \u0648\u0627\u0644\u062A\u0639\u062F\u064A\u0646 \u0648\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0644\u064A\u0627\u0631\u064A\u0629 \u0648\u0623\u062B\u0628\u062A \u0644\u0648\u0627\u0644\u062F\u0643 \u0648\u0639\u0627\u0626\u0644\u062A\u0643 \u0623\u0646\u0643 \u0623\u0642\u0648\u0649 \u062A\u062C\u0627\u0631 \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0642\u0627\u062F\u0645\u0648\u0646!"
    ],
    currency: { code: "USD", symbol: "$", name: "\u0627\u0644\u062F\u0648\u0644\u0627\u0631 \u0627\u0644\u0623\u0645\u0631\u064A\u0643\u064A" },
    startingBalance: 25e3,
    startingBalanceEgpEquivalent: 25e3,
    economy: {
      exchangeRateToEgp: 1,
      companySetupFee: 2e3,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.15,
      customsRate: 0.03,
      operatingCostMultiplier: 1.05
    }
  },
  // 3. United Arab Emirates
  {
    id: "uae",
    name: "\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629",
    flag: "\u{1F1E6}\u{1F1EA}",
    storyTitle: "\u0623\u0628\u0631\u0627\u062C \u062F\u0628\u064A \u0648\u0645\u0648\u0627\u0646\u0626 \u062C\u0628\u0644 \u0639\u0644\u064A \u0648\u0623\u0628\u0648\u0638\u0628\u064A",
    storySummary: "\u062C\u0631\u0651\u062F\u062A\u0643 \u0639\u0627\u0626\u0644\u062A\u0643 \u0645\u0646 \u062D\u0635\u062A\u0643 \u0641\u064A \u0634\u0631\u0643\u0627\u062A \u062F\u0628\u064A. \u0632\u0648\u0651\u062F\u062A\u0643 \u0623\u0645\u0643 \u0628\u0640 25,000$ \u0644\u062A\u0646\u0637\u0644\u0642 \u0641\u064A \u0645\u0648\u0627\u0646\u0626 \u062C\u0628\u0644 \u0639\u0644\u064A \u0627\u0644\u062D\u0631\u0629 \u0648\u0643\u064A\u0632\u0627\u062F \u0628\u0623\u0628\u0648\u0638\u0628\u064A.",
    storyFull: [
      "\u0633\u062D\u0628 \u0625\u062E\u0648\u062A\u0643 \u0648\u0648\u0627\u0644\u062F\u0643 \u0643\u0644 \u0635\u0644\u0627\u062D\u064A\u0627\u062A\u0643 \u0641\u064A \u0645\u0643\u0627\u062A\u0628 \u062F\u0628\u064A \u0627\u0644\u0641\u0627\u062E\u0631\u0629\u060C \u0648\u0648\u0635\u0641\u0648\u0643 \u0628\u0627\u0644\u0639\u062C\u0632 \u0627\u0644\u0645\u0627\u0644\u064A \u0648\u0637\u0631\u062F\u0648\u0643 \u0645\u0646 \u0645\u062C\u0627\u0644\u0633 \u0627\u0644\u0625\u062F\u0627\u0631\u0629.",
      "\u0644\u0643\u0646\u0646\u064A \u0623\u0639\u0644\u0645 \u0623\u0646\u0643 \u0627\u0644\u0639\u0642\u0644 \u0627\u0644\u0645\u0627\u0644\u064A \u0627\u0644\u062D\u0642\u064A\u0642\u064A! \u062D\u0648\u0644\u062A \u0644\u0643 \u0633\u0631\u0627\u064B 25,000 \u062F\u0648\u0644\u0627\u0631 \u0623\u0645\u0631\u064A\u0643\u064A\u2026 \u0627\u062A\u062C\u0647 \u0641\u0648\u0631\u0627\u064B \u0625\u0644\u0649 \u0645\u0646\u0637\u0642\u0629 \u062C\u0628\u0644 \u0639\u0644\u064A \u0627\u0644\u062D\u0631\u0629 JAFZA \u0648\u0645\u0648\u0627\u0646\u0626 \u0623\u0628\u0648\u0638\u0628\u064A!",
      "\u0627\u0628\u0646\u0650 \u0645\u062C\u0645\u0639\u0627\u062A\u0643 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629 \u0648\u062A\u062F\u0627\u0648\u0644 \u0641\u064A \u0628\u0648\u0631\u0635\u0629 \u062F\u0628\u064A \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629 \u062D\u062A\u0649 \u062A\u0633\u062A\u0639\u064A\u062F \u0645\u0643\u0627\u0646\u062A\u0643 \u0648\u062A\u062C\u0628\u0631 \u0627\u0644\u062C\u0645\u064A\u0639 \u0639\u0644\u0649 \u0627\u062D\u062A\u0631\u0627\u0645\u0643."
    ],
    currency: { code: "USD", symbol: "$", name: "\u0627\u0644\u062F\u0648\u0644\u0627\u0631 \u0627\u0644\u0623\u0645\u0631\u064A\u0643\u064A" },
    startingBalance: 25e3,
    startingBalanceEgpEquivalent: 25e3,
    economy: {
      exchangeRateToEgp: 1,
      companySetupFee: 2200,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.09,
      customsRate: 0.02,
      operatingCostMultiplier: 1.1
    }
  },
  // 4. USA
  {
    id: "usa",
    name: "\u0627\u0644\u0648\u0644\u0627\u064A\u0627\u062A \u0627\u0644\u0645\u062A\u062D\u062F\u0629 \u0627\u0644\u0623\u0645\u0631\u064A\u0643\u064A\u0629",
    flag: "\u{1F1FA}\u{1F1F8}",
    storyTitle: "\u0648\u0648\u0644 \u0633\u062A\u0631\u064A\u062A \u0648\u0648\u0627\u062F\u064A \u0627\u0644\u0633\u064A\u0644\u064A\u0643\u0648\u0646",
    storySummary: "\u0637\u064F\u0631\u062F\u062A \u0645\u0646 \u0642\u0635\u0631 \u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u0628\u0646\u064A\u0648\u064A\u0648\u0631\u0643. \u0633\u0644\u0651\u0645\u062A\u0643 \u0648\u0627\u0644\u062F\u062A\u0643 25,000$ \u0644\u062A\u0642\u062A\u062D\u0645 \u0648\u0648\u0644 \u0633\u062A\u0631\u064A\u062A \u0648\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0628\u0647\u064A\u0648\u0633\u062A\u0646 \u0648\u0634\u064A\u0643\u0627\u063A\u0648.",
    storyFull: [
      "\u0644\u0642\u062F \u0637\u0631\u062F\u0643 \u0648\u0627\u0644\u062F\u0643 \u0648\u0625\u062E\u0648\u062A\u0643 \u0645\u0646 \u0642\u0635\u0631 \u0646\u064A\u0648\u064A\u0648\u0631\u0643 \u0648\u0633\u062D\u0628\u0648\u0627 \u0645\u0646\u0643 \u062C\u0645\u064A\u0639 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062A\u060C \u0645\u0639\u062A\u0628\u0631\u064A\u0646 \u0623\u0646\u0643 \u0641\u0627\u0634\u0644 \u0648\u0644\u0627 \u062A\u0641\u0647\u0645 \u0634\u064A\u0626\u0627\u064B \u0641\u064A \u0644\u063A\u0629 \u0627\u0644\u0645\u0644\u064A\u0627\u0631\u0627\u062A.",
      "\u0648\u0644\u0643\u0646\u0646\u064A \u0623\u0639\u0644\u0645 \u0645\u0639\u062F\u0646\u0643 \u0627\u0644\u062D\u0642\u064A\u0642\u064A! \u062D\u0648\u0644\u062A \u0644\u0643 \u0633\u0631\u0627\u064B 25,000 \u062F\u0648\u0644\u0627\u0631 \u0623\u0645\u0631\u064A\u0643\u064A\u2026 \u0627\u062A\u062C\u0647 \u0625\u0644\u0649 \u0648\u0627\u062F\u064A \u0627\u0644\u0633\u064A\u0644\u064A\u0643\u0648\u0646 \u0648\u0648\u0648\u0644 \u0633\u062A\u0631\u064A\u062A \u0648\u0647\u064A Houston Energy Corridor!",
      "\u062A\u062F\u0627\u0648\u0644\u060C \u0648\u0627\u0628\u0646\u0650 \u0634\u0631\u0643\u0627\u062A\u0643\u060C \u0648\u0627\u062D\u062A\u0644 \u0627\u0644\u0623\u0633\u0647\u0645 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629 \u062D\u062A\u0649 \u064A\u0639\u0644\u0645 \u0627\u0644\u062C\u0645\u064A\u0639 \u0623\u0646\u0643 \u0627\u0644\u0623\u0633\u0637\u0648\u0631\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0627\u0644\u0642\u0627\u062F\u0645\u0629 \u0627\u0644\u062A\u064A \u062A\u0647\u0632 \u0627\u0644\u0639\u0627\u0644\u0645."
    ],
    currency: { code: "USD", symbol: "$", name: "\u0627\u0644\u062F\u0648\u0644\u0627\u0631 \u0627\u0644\u0623\u0645\u0631\u064A\u0643\u064A" },
    startingBalance: 25e3,
    startingBalanceEgpEquivalent: 25e3,
    economy: {
      exchangeRateToEgp: 1,
      companySetupFee: 2500,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.21,
      customsRate: 0.02,
      operatingCostMultiplier: 1.15
    }
  },
  // 5. Kuwait
  {
    id: "kuwait",
    name: "\u062F\u0648\u0644\u0629 \u0627\u0644\u0643\u0648\u064A\u062A",
    flag: "\u{1F1F0}\u{1F1FC}",
    storyTitle: "\u062F\u064A\u0648\u0627\u0646\u064A\u0629 \u0627\u0644\u0639\u0627\u0635\u0645\u0629 \u0648\u0627\u0633\u062A\u062B\u0645\u0627\u0631\u0627\u062A \u0627\u0644\u0634\u0648\u064A\u062E \u0648\u0627\u0644\u0623\u062D\u0645\u062F\u064A",
    storySummary: "\u0637\u064F\u0631\u0650\u062F\u062A \u0645\u0646 \u062F\u064A\u0648\u0627\u0646\u064A\u0629 \u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u0628\u0627\u0644\u0639\u0627\u0635\u0645\u0629. \u0623\u0639\u0637\u062A\u0643 \u0623\u0645\u0643 25,000$ \u0644\u062A\u062B\u0628\u062A \u0646\u062C\u0627\u062D\u0643 \u0641\u064A \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0634\u0648\u064A\u062E \u0648\u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0623\u062D\u0645\u062F\u064A.",
    storyFull: [
      "\u062D\u0631\u0645\u062A\u0643 \u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u0645\u0646 \u0646\u0635\u064A\u0628\u0643 \u0641\u064A \u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0639\u0627\u0635\u0645\u0629 \u0648\u0637\u0631\u062F\u0648\u0643 \u0645\u0646 \u0627\u0644\u062F\u064A\u0648\u0627\u0646\u064A\u0629 \u0628\u062A\u0647\u0645\u0629 \u0639\u062F\u0645 \u0627\u0644\u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629.",
      "\u0644\u0643\u0646 \u0623\u064F\u0645\u0643 \u0644\u0646 \u062A\u062A\u0631\u0643\u0643! \u062D\u0648\u0644\u062A \u0644\u0643 25,000 \u062F\u0648\u0644\u0627\u0631 \u0623\u0645\u0631\u064A\u0643\u064A \u0643\u0627\u0634\u2026 \u0627\u0628\u062F\u0623 \u0641\u0648\u0631\u0627\u064B \u0641\u064A \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631!",
      "\u0627\u0642\u062A\u062D\u0645 \u0645\u062C\u0645\u0639\u0627\u062A \u0627\u0644\u0634\u0648\u064A\u062E \u0648\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0646\u0641\u0637 \u0628\u0627\u0644\u0623\u062D\u0645\u062F\u064A \u0648\u0627\u0644\u0628\u0648\u0631\u0635\u0629 \u0644\u062A\u0635\u0628\u062D \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0623\u0647\u0645 \u0648\u0627\u0644\u0645\u0644\u064A\u0627\u0631\u062F\u064A\u0631 \u0627\u0644\u0623\u0648\u0644 \u0641\u064A \u0627\u0644\u0633\u0648\u0642."
    ],
    currency: { code: "USD", symbol: "$", name: "\u0627\u0644\u062F\u0648\u0644\u0627\u0631 \u0627\u0644\u0623\u0645\u0631\u064A\u0643\u064A" },
    startingBalance: 25e3,
    startingBalanceEgpEquivalent: 25e3,
    economy: {
      exchangeRateToEgp: 1,
      companySetupFee: 2e3,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.15,
      customsRate: 0.03,
      operatingCostMultiplier: 1.05
    }
  },
  // 6. Qatar
  {
    id: "qatar",
    name: "\u062F\u0648\u0644\u0629 \u0642\u0637\u0631",
    flag: "\u{1F1F6}\u{1F1E6}",
    storyTitle: "\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u062F\u0648\u062D\u0629 \u0648\u0627\u0644\u063A\u0627\u0632 \u0628\u0631\u0623\u0633 \u0644\u0641\u0627\u0646",
    storySummary: "\u0637\u064F\u0631\u0650\u062F\u062A \u0645\u0646 \u0645\u062C\u0644\u0633 \u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u0628\u0627\u0644\u062F\u0648\u062D\u0629. \u0633\u0644\u0651\u0645\u062A\u0643 \u0623\u0645\u0643 25,000$ \u0644\u062A\u0642\u062A\u062D\u0645 \u0645\u0634\u0627\u0631\u064A\u0639 \u0631\u0623\u0633 \u0644\u0641\u0627\u0646 \u0648\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0648\u0645\u064A\u0646\u0627\u0621 \u062D\u0645\u062F.",
    storyFull: [
      "\u062A\u0645 \u0637\u0631\u062F\u0643 \u0645\u0646 \u0645\u062C\u0644\u0633 \u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u0628\u0627\u0644\u062F\u0648\u062D\u0629 \u0648\u0627\u0639\u062A\u0628\u0627\u0631\u0643 \u063A\u064A\u0631 \u0642\u0627\u062F\u0631 \u0639\u0644\u0649 \u0645\u0648\u0627\u0643\u0628\u0629 \u0635\u0641\u0642\u0627\u062A \u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u0627\u0644\u0636\u062E\u0645\u0629 \u0648\u062A\u0633\u064A\u064A\u0631 \u0623\u0645\u0648\u0627\u0644\u0647\u0627.",
      "\u0633\u0644\u0651\u0645\u062A\u0643 \u0633\u0631\u0627\u064B 25,000 \u062F\u0648\u0644\u0627\u0631 \u0623\u0645\u0631\u064A\u0643\u064A\u2026 \u0627\u0646\u0637\u0644\u0642 \u0641\u064A \u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u062F\u0648\u062D\u0629 \u0648\u0627\u0644\u0644\u0624\u0644\u0624\u0629 \u0648\u0631\u0623\u0633 \u0644\u0641\u0627\u0646 \u0648\u0645\u064A\u0646\u0627\u0621 \u062D\u0645\u062F!",
      "\u0634\u064A\u062F \u0627\u0644\u0645\u0635\u0627\u0646\u0639 \u0648\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0648\u0623\u0639\u062F \u0635\u064A\u0627\u063A\u0629 \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u0628\u0623\u0633\u0644\u0648\u0628\u0643 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631\u064A \u0627\u0644\u0641\u0630 \u0648\u0627\u0644\u0633\u064A\u0637\u0631\u0629 \u0627\u0644\u0634\u0627\u0645\u0644\u0629."
    ],
    currency: { code: "USD", symbol: "$", name: "\u0627\u0644\u062F\u0648\u0644\u0627\u0631 \u0627\u0644\u0623\u0645\u0631\u064A\u0643\u064A" },
    startingBalance: 25e3,
    startingBalanceEgpEquivalent: 25e3,
    economy: {
      exchangeRateToEgp: 1,
      companySetupFee: 2100,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.1,
      customsRate: 0.03,
      operatingCostMultiplier: 1.05
    }
  },
  // 7. United Kingdom
  {
    id: "uk",
    name: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629 (\u0628\u0631\u064A\u0637\u0627\u0646\u064A\u0627)",
    flag: "\u{1F1EC}\u{1F1E7}",
    storyTitle: "\u0642\u0644\u0639\u0629 \u0644\u0646\u062F\u0646 \u0648\u062D\u064A \u0627\u0644\u0633\u064A\u062A\u064A \u0648\u062A\u0631\u0627\u0641\u0648\u0631\u062F \u0645\u0627\u0646\u0634\u0633\u062A\u0631",
    storySummary: "\u0637\u064F\u0631\u0650\u062F\u062A \u0645\u0646 \u0627\u0644\u0642\u0635\u0631 \u0628\u0645\u062F\u064A\u0646\u0629 \u0644\u0646\u062F\u0646. \u0632\u0648\u062F\u062A\u0643 \u0623\u0645\u0643 \u0628\u0640 25,000$ \u0644\u062A\u0642\u062A\u062D\u0645 \u062D\u064A \u0643\u0627\u0646\u0627\u0631\u064A \u0648\u0627\u0631\u0641 \u0648\u0645\u062C\u0645\u0639\u0627\u062A \u0645\u0627\u0646\u0634\u0633\u062A\u0631 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629.",
    storyFull: [
      "\u0637\u0631\u062F\u062A\u0643 \u0639\u0627\u0626\u0644\u062A\u0643 \u0627\u0644\u0623\u0631\u0633\u062A\u0642\u0631\u0627\u0637\u064A\u0629 \u0645\u0646 \u0642\u0635\u0631 \u0644\u0646\u062F\u0646 \u0648\u0648\u0635\u0641\u0648\u0643 \u0628\u0639\u062F\u0645 \u0627\u0644\u0642\u062F\u0631\u0629 \u0639\u0644\u0649 \u0625\u062F\u0627\u0631\u0629 \u062B\u0631\u0648\u0627\u062A\u0647\u0645 \u0627\u0644\u0636\u062E\u0645\u0629.",
      "\u0644\u0643\u0646\u0646\u064A \u0645\u0639\u0643! \u062D\u0648\u0644\u062A \u0644\u0643 25,000 \u062F\u0648\u0644\u0627\u0631 \u0623\u0645\u0631\u064A\u0643\u064A\u2026 \u0627\u062A\u062C\u0647 \u0641\u0648\u0631\u0627\u064B \u0644\u0640 City of London \u0648\u0645\u062C\u0645\u0639\u0627\u062A \u0645\u0627\u0646\u0634\u0633\u062A\u0631 \u0648\u0644\u064A\u0641\u0631\u0628\u0648\u0644!",
      "\u0627\u0633\u062A\u062B\u0645\u0631 \u0641\u064A \u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0628\u062D\u0631\u064A\u0629 \u0648\u0627\u0644\u0623\u0633\u0647\u0645 \u0648\u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0644\u062A\u062C\u0628\u0631\u0647\u0645 \u0639\u0644\u0649 \u0627\u062D\u062A\u0631\u0627\u0645 \u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631\u064A\u062A\u0643 \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0639\u062A\u0628\u0627\u0631\u0643 \u0623\u0645\u0627\u0645 \u0627\u0644\u062C\u0645\u064A\u0639."
    ],
    currency: { code: "USD", symbol: "$", name: "\u0627\u0644\u062F\u0648\u0644\u0627\u0631 \u0627\u0644\u0623\u0645\u0631\u064A\u0643\u064A" },
    startingBalance: 25e3,
    startingBalanceEgpEquivalent: 25e3,
    economy: {
      exchangeRateToEgp: 1,
      companySetupFee: 2300,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.19,
      customsRate: 0.02,
      operatingCostMultiplier: 1.1
    }
  },
  // 8. Germany
  {
    id: "germany",
    name: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627 \u0648\u0627\u0644\u0627\u062A\u062D\u0627\u062F \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064A",
    flag: "\u{1F1E9}\u{1F1EA}",
    storyTitle: "\u0635\u0646\u0627\u0639\u0627\u062A \u0627\u0644\u0631\u0648\u0631 \u0648\u0627\u0644\u0642\u0644\u0627\u0639 \u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064A\u0629",
    storySummary: "\u0637\u064F\u0631\u0650\u062F\u062A \u0645\u0646 \u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A \u0645\u062A\u0647\u0645\u0627\u064B \u0628\u0627\u0644\u0641\u0634\u0644. \u0633\u0644\u0645\u062A\u0643 \u0623\u0645\u0643 25,000$ \u0644\u062A\u063A\u0632\u0648 \u0642\u0644\u0627\u0639 \u0627\u0644\u0635\u0646\u0627\u0639\u0629 \u0641\u064A \u062D\u0632\u0627\u0645 \u0627\u0644\u0631\u0648\u0631 \u0648\u0645\u064A\u0646\u0627\u0621 \u0647\u0627\u0645\u0628\u0648\u0631\u063A.",
    storyFull: [
      "\u0627\u062A\u0647\u0645\u062A\u0643 \u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u0628\u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A \u0628\u0627\u0644\u0636\u0639\u0641 \u0648\u0639\u062F\u0645 \u0627\u0644\u0641\u0647\u0645 \u0641\u064A \u0627\u0644\u0635\u0646\u0627\u0639\u0629\u060C \u0648\u0637\u0631\u062F\u0648\u0643 \u062F\u0648\u0646 \u0641\u0644\u0633 \u0648\u0627\u062D\u062F \u0645\u0646 \u0623\u0645\u0648\u0627\u0644 \u0627\u0644\u0642\u0635\u0631.",
      "\u0633\u0644\u0651\u0645\u062A\u0643 \u0633\u0631\u0627\u064B 25,000 \u062F\u0648\u0644\u0627\u0631 \u0623\u0645\u0631\u064A\u0643\u064A\u2026 \u0627\u0646\u0637\u0644\u0642 \u0625\u0644\u0649 \u0642\u0644\u0627\u0639 \u062D\u0632\u0627\u0645 \u0627\u0644\u0631\u0648\u0631 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0648\u0645\u064A\u0646\u0627\u0621 \u0647\u0627\u0645\u0628\u0648\u0631\u063A \u0648\u0645\u064A\u0648\u0646\u064A\u062E!",
      "\u0623\u0637\u0644\u0642 \u062E\u0637\u0648\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0648\u0627\u0644\u062D\u0644\u0648\u0644 \u0627\u0644\u0630\u0643\u064A\u0629 \u0644\u062A\u0628\u0631\u0647\u0646 \u0644\u0644\u062C\u0645\u064A\u0639 \u0623\u0646\u0643 \u0627\u0644\u0639\u0642\u0644 \u0627\u0644\u0645\u062F\u0628\u0631 \u0627\u0644\u062D\u0642\u064A\u0642\u064A \u0648\u0627\u0644\u0645\u0633\u062A\u062B\u0645\u0631 \u0627\u0644\u0623\u0642\u0648\u0649 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627."
    ],
    currency: { code: "USD", symbol: "$", name: "\u0627\u0644\u062F\u0648\u0644\u0627\u0631 \u0627\u0644\u0623\u0645\u0631\u064A\u0643\u064A" },
    startingBalance: 25e3,
    startingBalanceEgpEquivalent: 25e3,
    economy: {
      exchangeRateToEgp: 1,
      companySetupFee: 2300,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.19,
      customsRate: 0.02,
      operatingCostMultiplier: 1.1
    }
  },
  // 9. Japan
  {
    id: "japan",
    name: "\u0643\u0648\u0643\u0628 \u0627\u0644\u064A\u0627\u0628\u0627\u0646",
    flag: "\u{1F1EF}\u{1F1F5}",
    storyTitle: "\u0627\u0628\u062A\u0643\u0627\u0631\u0627\u062A \u062E\u0644\u064A\u062C \u0637\u0648\u0643\u064A\u0648 \u0648\u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627 \u0648\u0623\u0648\u0633\u0627\u0643\u0627",
    storySummary: "\u0637\u064F\u0631\u0650\u062F\u062A \u0645\u0646 \u0645\u0642\u0631 \u0637\u0648\u0643\u064A\u0648. \u0623\u0639\u0637\u062A\u0643 \u0623\u0645\u0643 25,000$ \u0644\u062A\u0633\u062A\u062B\u0645\u0631 \u0641\u064A \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0648\u0627\u0644\u0623\u062A\u0645\u062A\u0629 \u0628\u062E\u0644\u064A\u062C \u0637\u0648\u0643\u064A\u0648 \u0648\u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627.",
    storyFull: [
      "\u0637\u0631\u062F\u0643 \u0648\u0627\u0644\u062F\u0643 \u0648\u0643\u0628\u0627\u0631 \u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u0641\u064A \u0637\u0648\u0643\u064A\u0648 \u0648\u0627\u0639\u062A\u0628\u0631\u0648\u0643 \u063A\u064A\u0631 \u0645\u0624\u0647\u0644 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062A\u0643\u062A\u0644\u0627\u062A \u0627\u0644\u062A\u0642\u0646\u064A\u0629 \u0627\u0644\u0645\u0639\u0642\u062F\u0629.",
      "\u0647\u0631\u0628\u062A \u0644\u0643 \u0633\u0631\u0627\u064B 25,000 \u062F\u0648\u0644\u0627\u0631 \u0623\u0645\u0631\u064A\u0643\u064A\u2026 \u0627\u0628\u062F\u0623 \u0641\u064A \u0645\u062C\u0645\u0639\u0627\u062A \u062E\u0644\u064A\u062C \u0637\u0648\u0643\u064A\u0648 \u0648\u0645\u0648\u0627\u0646\u0626 \u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629!",
      "\u0627\u0628\u0646\u0650 \u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631\u064A\u0629 \u064A\u0627\u0628\u0627\u0646\u064A\u0629 \u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0629 \u0644\u0627 \u062A\u064F\u0642\u0647\u0631 \u0644\u062A\u062B\u0628\u062A \u0644\u0644\u0639\u0627\u0626\u0644\u0629 \u0623\u0646 \u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644 \u0628\u064A\u062F\u0643 \u0648\u0623\u0646\u0643 \u0627\u0644\u0623\u0633\u0637\u0648\u0631\u0629 \u0627\u0644\u062A\u064A \u0644\u0627 \u062A\u062A\u0643\u0631\u0631."
    ],
    currency: { code: "USD", symbol: "$", name: "\u0627\u0644\u062F\u0648\u0644\u0627\u0631 \u0627\u0644\u0623\u0645\u0631\u064A\u0643\u064A" },
    startingBalance: 25e3,
    startingBalanceEgpEquivalent: 25e3,
    economy: {
      exchangeRateToEgp: 1,
      companySetupFee: 2200,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.15,
      customsRate: 0.02,
      operatingCostMultiplier: 1.1
    }
  }
];
function findCountry(countryId) {
  return COUNTRIES.find((country) => country.id === countryId);
}

// src/game/catalog.ts
var INDUSTRY_CATALOG = [
  { id: "petroleum", name: "\u0627\u0644\u0628\u062A\u0631\u0648\u0644 \u0648\u0627\u0644\u0637\u0627\u0642\u0629", requiredLandType: "industrial", setupFee: 2e3, licenseFee: 3500, dailyOperatingCost: 360, energyCapacity: 80, dailyEnergySupply: 42 },
  { id: "electricity", name: "\u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621", requiredLandType: "industrial", setupFee: 2e3, licenseFee: 2600, dailyOperatingCost: 320, energyCapacity: 100, dailyEnergySupply: 55 },
  { id: "gas", name: "\u0627\u0644\u063A\u0627\u0632 \u0627\u0644\u0637\u0628\u064A\u0639\u064A", requiredLandType: "industrial", setupFee: 2e3, licenseFee: 3e3, dailyOperatingCost: 300, energyCapacity: 80, dailyEnergySupply: 46 },
  { id: "water", name: "\u0627\u0644\u0645\u064A\u0627\u0647", requiredLandType: "industrial", setupFee: 2e3, licenseFee: 2200, dailyOperatingCost: 220, energyCapacity: 70, dailyEnergySupply: 40 },
  { id: "detergents", name: "\u0627\u0644\u0645\u0646\u0638\u0641\u0627\u062A \u0648\u0627\u0644\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A", requiredLandType: "industrial", setupFee: 2e3, licenseFee: 1400, dailyOperatingCost: 140, energyCapacity: 60, dailyEnergySupply: 36 },
  { id: "food", name: "\u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u0632\u0631\u0627\u0639\u0629", requiredLandType: "agricultural", setupFee: 2e3, licenseFee: 1200, dailyOperatingCost: 120, energyCapacity: 60, dailyEnergySupply: 34 },
  { id: "construction", name: "\u0645\u0648\u0627\u062F \u0627\u0644\u0628\u0646\u0627\u0621 \u0648\u0627\u0644\u062A\u0639\u0645\u064A\u0631", requiredLandType: "industrial", setupFee: 2e3, licenseFee: 1800, dailyOperatingCost: 180, energyCapacity: 75, dailyEnergySupply: 40 },
  { id: "electronics", name: "\u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A \u0648\u0627\u0644\u062A\u0642\u0646\u064A\u0629", requiredLandType: "commercial", setupFee: 2e3, licenseFee: 2400, dailyOperatingCost: 200, energyCapacity: 75, dailyEnergySupply: 40 },
  { id: "transport", name: "\u0627\u0644\u0646\u0642\u0644 \u0648\u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A", requiredLandType: "commercial", setupFee: 2e3, licenseFee: 1500, dailyOperatingCost: 160, energyCapacity: 70, dailyEnergySupply: 42 }
];
var MATERIAL_CATALOG = [
  { id: "crude-oil", name: "\u062E\u0627\u0645 \u0627\u0644\u0646\u0641\u0637", unit: "\u0628\u0631\u0645\u064A\u0644", pricePerUnit: 80, storageLimit: 500 },
  { id: "natural-gas", name: "\u0627\u0644\u063A\u0627\u0632 \u0627\u0644\u0637\u0628\u064A\u0639\u064A", unit: "\u0648\u062D\u062F\u0629", pricePerUnit: 60, storageLimit: 500 },
  { id: "water", name: "\u0645\u064A\u0627\u0647 \u0645\u0639\u0627\u0644\u062C\u0629", unit: "\u0648\u062D\u062F\u0629", pricePerUnit: 5, storageLimit: 2e3 },
  { id: "chemicals", name: "\u0645\u0631\u0643\u0628\u0627\u062A \u0643\u064A\u0645\u064A\u0627\u0626\u064A\u0629", unit: "\u0643\u062C\u0645", pricePerUnit: 24, storageLimit: 800 },
  { id: "grain", name: "\u062D\u0628\u0648\u0628 \u0632\u0631\u0627\u0639\u064A\u0629", unit: "\u0643\u062C\u0645", pricePerUnit: 10, storageLimit: 1e3 },
  { id: "steel", name: "\u0641\u0648\u0644\u0627\u0630 \u0635\u0646\u0627\u0639\u064A", unit: "\u0637\u0646", pricePerUnit: 160, storageLimit: 400 },
  { id: "cement", name: "\u0623\u0633\u0645\u0646\u062A", unit: "\u0637\u0646", pricePerUnit: 40, storageLimit: 800 },
  { id: "silicon", name: "\u0631\u0642\u0627\u0626\u0642 \u0633\u064A\u0644\u064A\u0643\u0648\u0646", unit: "\u0648\u062D\u062F\u0629", pricePerUnit: 200, storageLimit: 250 },
  { id: "fuel", name: "\u0648\u0642\u0648\u062F \u062A\u0634\u063A\u064A\u0644", unit: "\u0648\u062D\u062F\u0629", pricePerUnit: 50, storageLimit: 500 },
  { id: "components", name: "\u0645\u0643\u0648\u0646\u0627\u062A \u0645\u064A\u0643\u0627\u0646\u064A\u0643\u064A\u0629", unit: "\u0648\u062D\u062F\u0629", pricePerUnit: 120, storageLimit: 300 },
  { id: "packaging", name: "\u0645\u0648\u0627\u062F \u062A\u063A\u0644\u064A\u0641", unit: "\u0648\u062D\u062F\u0629", pricePerUnit: 7, storageLimit: 1e3 }
];
var PRODUCT_CATALOG = [
  { id: "refined-fuel", name: "\u0648\u0642\u0648\u062F \u0645\u0643\u0631\u0631", unit: "\u0648\u062D\u062F\u0629", baseSellPrice: 280, storageLimit: 500 },
  { id: "power-units", name: "\u0648\u062D\u062F\u0627\u062A \u0643\u0647\u0631\u0628\u0627\u0621", unit: "\u0648\u062D\u062F\u0629", baseSellPrice: 60, storageLimit: 1e3 },
  { id: "bottled-gas", name: "\u063A\u0627\u0632 \u0645\u0639\u0628\u0623", unit: "\u0648\u062D\u062F\u0629", baseSellPrice: 200, storageLimit: 500 },
  { id: "clean-water", name: "\u0645\u064A\u0627\u0647 \u0646\u0638\u064A\u0641\u0629", unit: "\u0648\u062D\u062F\u0629", baseSellPrice: 40, storageLimit: 2e3 },
  { id: "detergent", name: "\u0645\u0646\u0638\u0641\u0627\u062A \u062A\u062C\u0627\u0631\u064A\u0629", unit: "\u0639\u0628\u0648\u0629", baseSellPrice: 80, storageLimit: 800 },
  { id: "food-pack", name: "\u0639\u0628\u0648\u0627\u062A \u063A\u0630\u0627\u0626\u064A\u0629", unit: "\u0639\u0628\u0648\u0629", baseSellPrice: 50, storageLimit: 1e3 },
  { id: "building-blocks", name: "\u0645\u0648\u0627\u062F \u0628\u0646\u0627\u0621 \u0645\u062C\u0647\u0632\u0629", unit: "\u0648\u062D\u062F\u0629", baseSellPrice: 320, storageLimit: 500 },
  { id: "electronics", name: "\u0623\u062C\u0647\u0632\u0629 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629", unit: "\u062C\u0647\u0627\u0632", baseSellPrice: 900, storageLimit: 250 },
  { id: "freight-service", name: "\u062E\u062F\u0645\u0627\u062A \u0646\u0642\u0644 \u0628\u062D\u0631\u064A/\u0628\u0631\u064A", unit: "\u0631\u062D\u0644\u0629", baseSellPrice: 440, storageLimit: 300 }
];
var RECIPE_CATALOG = [
  { id: "recipe-petroleum", industryId: "petroleum", productId: "refined-fuel", productName: "\u0648\u0642\u0648\u062F \u0645\u0643\u0631\u0631", outputQuantity: 4, outputUnit: "\u0648\u062D\u062F\u0629", inputs: [{ materialId: "crude-oil", quantity: 5 }], energyUnits: 10, energyCost: 30, baseSellPrice: 280 },
  { id: "recipe-electricity", industryId: "electricity", productId: "power-units", productName: "\u0648\u062D\u062F\u0627\u062A \u0643\u0647\u0631\u0628\u0627\u0621", outputQuantity: 12, outputUnit: "\u0648\u062D\u062F\u0629", inputs: [{ materialId: "fuel", quantity: 2 }], energyUnits: 18, energyCost: 20, baseSellPrice: 60 },
  { id: "recipe-gas", industryId: "gas", productId: "bottled-gas", productName: "\u063A\u0627\u0632 \u0645\u0639\u0628\u0623", outputQuantity: 3, outputUnit: "\u0648\u062D\u062F\u0629", inputs: [{ materialId: "natural-gas", quantity: 4 }], energyUnits: 8, energyCost: 24, baseSellPrice: 200 },
  { id: "recipe-water", industryId: "water", productId: "clean-water", productName: "\u0645\u064A\u0627\u0647 \u0646\u0638\u064A\u0641\u0629", outputQuantity: 12, outputUnit: "\u0648\u062D\u062F\u0629", inputs: [{ materialId: "water", quantity: 8 }], energyUnits: 6, energyCost: 14, baseSellPrice: 40 },
  { id: "recipe-detergents", industryId: "detergents", productId: "detergent", productName: "\u0645\u0646\u0638\u0641\u0627\u062A \u062A\u062C\u0627\u0631\u064A\u0629", outputQuantity: 5, outputUnit: "\u0639\u0628\u0648\u0629", inputs: [{ materialId: "chemicals", quantity: 2 }, { materialId: "water", quantity: 2 }], energyUnits: 5, energyCost: 12, baseSellPrice: 80 },
  { id: "recipe-food", industryId: "food", productId: "food-pack", productName: "\u0639\u0628\u0648\u0627\u062A \u063A\u0630\u0627\u0626\u064A\u0629", outputQuantity: 8, outputUnit: "\u0639\u0628\u0648\u0629", inputs: [{ materialId: "grain", quantity: 4 }, { materialId: "packaging", quantity: 1 }], energyUnits: 6, energyCost: 11, baseSellPrice: 50 },
  { id: "recipe-construction", industryId: "construction", productId: "building-blocks", productName: "\u0645\u0648\u0627\u062F \u0628\u0646\u0627\u0621 \u0645\u062C\u0647\u0632\u0629", outputQuantity: 4, outputUnit: "\u0648\u062D\u062F\u0629", inputs: [{ materialId: "steel", quantity: 2 }, { materialId: "cement", quantity: 4 }], energyUnits: 10, energyCost: 20, baseSellPrice: 320 },
  { id: "recipe-electronics", industryId: "electronics", productId: "electronics", productName: "\u0623\u062C\u0647\u0632\u0629 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629", outputQuantity: 1, outputUnit: "\u062C\u0647\u0627\u0632", inputs: [{ materialId: "silicon", quantity: 1 }, { materialId: "components", quantity: 2 }], energyUnits: 12, energyCost: 28, baseSellPrice: 900 },
  { id: "recipe-transport", industryId: "transport", productId: "freight-service", productName: "\u062E\u062F\u0645\u0627\u062A \u0646\u0642\u0644 \u0628\u062D\u0631\u064A/\u0628\u0631\u064A", outputQuantity: 2, outputUnit: "\u0631\u062D\u0644\u0629", inputs: [{ materialId: "fuel", quantity: 3 }, { materialId: "components", quantity: 1 }], energyUnits: 14, energyCost: 18, baseSellPrice: 440 }
];
var GOLD_PRICE_PER_GRAM = 110;
var TASK_CATALOG = [
  { id: "task-first-land", title: "\u0623\u0648\u0644 \u0645\u0644\u0643\u064A\u0629", description: "\u0627\u0645\u062A\u0644\u0643 \u0642\u0637\u0639\u0629 \u0623\u0631\u0636 \u0627\u0633\u062A\u062B\u0645\u0627\u0631\u064A\u0629 \u0648\u0627\u062D\u062F\u0629.", condition: "own-land", reward: 500 },
  { id: "task-first-company", title: "\u062A\u0623\u0633\u064A\u0633 \u0627\u0644\u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631\u064A\u0629", description: "\u0623\u0633\u0633 \u0634\u0631\u0643\u062A\u0643 \u0627\u0644\u0623\u0648\u0644\u0649.", condition: "own-company", reward: 700 },
  { id: "task-first-material", title: "\u0627\u0644\u0645\u062E\u0632\u0646 \u0627\u0644\u0623\u0648\u0644", description: "\u0627\u0634\u062A\u0631\u0650 \u062F\u0641\u0639\u0629 \u0645\u0648\u0627\u062F \u062E\u0627\u0645.", condition: "buy-material", reward: 200 },
  { id: "task-first-production", title: "\u062E\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C", description: "\u0634\u063A\u0651\u0644 \u062F\u0641\u0639\u0629 \u0625\u0646\u062A\u0627\u062C \u0628\u0646\u062C\u0627\u062D.", condition: "run-production", reward: 600 },
  { id: "task-first-sale", title: "\u0623\u0648\u0644 \u0635\u0641\u0642\u0629 \u0628\u064A\u0639", description: "\u0628\u0639 \u0645\u0646\u062A\u062C\u064B\u0627 \u062A\u0645\u0644\u0643\u0647 \u0641\u064A \u0627\u0644\u0633\u0648\u0642.", condition: "sell-product", reward: 400 },
  { id: "task-first-investment", title: "\u062A\u0646\u0648\u064A\u0639 \u0631\u0623\u0633 \u0627\u0644\u0645\u0627\u0644", description: "\u0623\u0646\u0634\u0626 \u0627\u0633\u062A\u062B\u0645\u0627\u0631\u064B\u0627 \u0639\u0627\u0626\u062F\u064A\u064B\u0627.", condition: "make-investment", reward: 400 },
  { id: "task-day-three", title: "\u062B\u0644\u0627\u062B\u0629 \u0623\u064A\u0627\u0645", description: "\u0645\u0631\u0651\u0631 \u062B\u0644\u0627\u062B\u0629 \u0623\u064A\u0627\u0645 \u0645\u0646 \u0627\u0644\u0645\u062D\u0627\u0643\u0627\u0629 \u0628\u0646\u062C\u0627\u062D.", condition: "reach-day-3", reward: 800 }
];
var INVESTMENT_CATALOG = [
  { id: "treasury-note", name: "\u0633\u0646\u062F \u0627\u0644\u062E\u0632\u064A\u0646\u0629 \u0627\u0644\u062D\u0643\u0648\u0645\u064A", minimumAmount: 1e3, maximumAmount: 1e4, durationDays: 3, returnRate: 0.08, riskRate: 0 },
  { id: "warehouse-fund", name: "\u0635\u0646\u062F\u0648\u0642 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A", minimumAmount: 2e3, maximumAmount: 15e3, durationDays: 5, returnRate: 0.18, riskRate: 0.08 }
];
var COUNTRY_REAL_ASSETS = {
  egypt: {
    starterLand: "\u0623\u0631\u0636 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 \xB7 \u0627\u0644\u0639\u0627\u0634\u0631 \u0645\u0646 \u0631\u0645\u0636\u0627\u0646",
    directLands: [
      { id: "starter-village-land", label: "\u0623\u0631\u0636 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 \xB7 \u0627\u0644\u0639\u0627\u0634\u0631 \u0645\u0646 \u0631\u0645\u0636\u0627\u0646", landType: "agricultural", areaSquareMeters: 520, price: 3600 },
      { id: "direct-land-port-said", label: "\u0645\u062C\u0645\u0639 \u0628\u0648\u0631\u0633\u0639\u064A\u062F \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A \u0627\u0644\u062D\u0631\u0629", landType: "commercial", areaSquareMeters: 420, price: 5700 },
      { id: "direct-land-minya-farm", label: "\u0623\u0631\u0636 \u0645\u0632\u0627\u0631\u0639 \u0648\u0627\u062F\u064A \u0627\u0644\u0646\u0637\u0631\u0648\u0646 \u0627\u0644\u062E\u0635\u0628\u0629", landType: "agricultural", areaSquareMeters: 900, price: 4800 },
      { id: "direct-land-sokhna-industrial", label: "\u0645\u0648\u0642\u0639 \u0627\u0644\u0639\u064A\u0646 \u0627\u0644\u0633\u062E\u0646\u0629 \u0644\u0644\u0628\u062A\u0631\u0648\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A", landType: "industrial", areaSquareMeters: 520, price: 7200 }
    ],
    directCompanies: [
      { id: "direct-company-food", name: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0646\u064A\u0644 \u0644\u0644\u062A\u0635\u0646\u064A\u0639 \u0627\u0644\u063A\u0630\u0627\u0626\u064A", industryId: "food", landType: "agricultural", areaSquareMeters: 650, price: 8600 },
      { id: "direct-company-logistics", name: "\u0634\u0631\u0643\u0629 \u0642\u0646\u0627\u0629 \u0627\u0644\u0633\u0648\u064A\u0633 \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629", industryId: "transport", landType: "commercial", areaSquareMeters: 500, price: 10400 },
      { id: "direct-company-energy", name: "\u0645\u062C\u0645\u0639 \u0645\u0635\u0631 \u0644\u062A\u0648\u0644\u064A\u062F \u0648\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0637\u0627\u0642\u0629", industryId: "electricity", landType: "industrial", areaSquareMeters: 600, price: 13600 }
    ],
    auctions: [
      { id: "land-cairo-industrial", lotType: "land", label: "\u0642\u0637\u0639\u0629 \u0645\u062F\u064A\u0646\u0629 \u0628\u062F\u0631 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629", landType: "industrial", areaSquareMeters: 400, minimumBid: 3200, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-alexandria-farm", lotType: "land", label: "\u0623\u0631\u0636 \u0628\u0631\u062C \u0627\u0644\u0639\u0631\u0628 \u0627\u0644\u0632\u0631\u0627\u0639\u064A\u0629 \u0627\u0644\u0645\u0631\u0648\u064A\u0629", landType: "agricultural", areaSquareMeters: 650, minimumBid: 2700, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-suez-commerce", lotType: "land", label: "\u0645\u0648\u0642\u0639 \u0627\u0644\u0633\u0648\u064A\u0633 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0627\u0644\u0645\u0637\u0644 \u0639\u0644\u0649 \u0627\u0644\u0642\u0646\u0627\u0629", landType: "commercial", areaSquareMeters: 300, minimumBid: 4200, bidIncrement: 300, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "factory-petroleum-expansion", lotType: "factory", label: "\u062E\u0637 \u062A\u0643\u0631\u064A\u0631 \u0625\u0636\u0627\u0641\u064A \u0628\u0645\u062C\u0645\u0639 \u0627\u0644\u0633\u062E\u0646\u0629", landType: "industrial", areaSquareMeters: 0, minimumBid: 4800, bidIncrement: 400, closesAt: "2099-12-31T00:00:00.000Z", status: "open", energyCapacityBonus: 40 },
      { id: "bulk-crude-oil", lotType: "raw-material", label: "\u0634\u062D\u0646\u0629 \u062E\u0627\u0645 \u0646\u0641\u0637 \u0643\u0628\u0631\u0649 \u0645\u0646 \u062D\u0642\u0644 \u0628\u0644\u0627\u0639\u064A\u0645", landType: "industrial", areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: "2099-12-31T00:00:00.000Z", status: "open", materialId: "crude-oil", quantity: 15 }
    ]
  },
  saudi: {
    starterLand: "\u0623\u0631\u0636 \u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629 \xB7 \u0627\u0644\u0631\u064A\u0627\u0636",
    directLands: [
      { id: "starter-village-land", label: "\u0623\u0631\u0636 \u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629 \xB7 \u0627\u0644\u0631\u064A\u0627\u0636", landType: "agricultural", areaSquareMeters: 520, price: 3600 },
      { id: "direct-land-port-said", label: "\u0645\u062C\u0645\u0639 \u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0645\u0644\u0643 \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A \xB7 \u0627\u0644\u062F\u0645\u0627\u0645", landType: "commercial", areaSquareMeters: 420, price: 5700 },
      { id: "direct-land-minya-farm", label: "\u0645\u0632\u0631\u0639\u0629 \u0648\u0627\u062D\u0629 \u0627\u0644\u062E\u0631\u062C \u0627\u0644\u0646\u0645\u0648\u0630\u062C\u064A\u0629 \u0644\u0644\u0625\u0646\u062A\u0627\u062C", landType: "agricultural", areaSquareMeters: 900, price: 4800 },
      { id: "direct-land-sokhna-industrial", label: "\u0645\u0648\u0642\u0639 \u0627\u0644\u062C\u0628\u064A\u0644 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0644\u0644\u0628\u062A\u0631\u0648\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A", landType: "industrial", areaSquareMeters: 520, price: 7200 }
    ],
    directCompanies: [
      { id: "direct-company-food", name: "\u0634\u0631\u0643\u0629 \u0646\u062C\u062F \u0644\u0644\u062A\u0635\u0646\u064A\u0639 \u0627\u0644\u063A\u0630\u0627\u0626\u064A \u0648\u0627\u0644\u062A\u0645\u0648\u064A\u0646", industryId: "food", landType: "agricultural", areaSquareMeters: 650, price: 8600 },
      { id: "direct-company-logistics", name: "\u0634\u0631\u0643\u0629 \u0633\u0647\u0645 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629 \u0644\u0646\u0642\u0644 \u0648\u0634\u062D\u0646 \u0627\u0644\u0628\u0636\u0627\u0626\u0639", industryId: "transport", landType: "commercial", areaSquareMeters: 500, price: 10400 },
      { id: "direct-company-energy", name: "\u0634\u0631\u0643\u0629 \u0643\u0647\u0631\u0628\u0627\u0621 \u0648\u0637\u0627\u0642\u0629 \u0627\u0644\u0634\u0631\u0642\u064A\u0629", industryId: "electricity", landType: "industrial", areaSquareMeters: 600, price: 13600 }
    ],
    auctions: [
      { id: "land-cairo-industrial", lotType: "land", label: "\u0642\u0637\u0639\u0629 \u0645\u062F\u064A\u0646\u0629 \u0633\u062F\u064A\u0631 \u0644\u0644\u0635\u0646\u0627\u0639\u0629 \u0648\u0627\u0644\u0623\u0639\u0645\u0627\u0644", landType: "industrial", areaSquareMeters: 400, minimumBid: 3200, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-alexandria-farm", lotType: "land", label: "\u0623\u0631\u0636 \u0645\u0632\u0627\u0631\u0639 \u0648\u0627\u062D\u0629 \u0627\u0644\u0623\u062D\u0633\u0627\u0621", landType: "agricultural", areaSquareMeters: 650, minimumBid: 2700, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-suez-commerce", lotType: "land", label: "\u0645\u0648\u0642\u0639 \u0645\u064A\u0646\u0627\u0621 \u062C\u062F\u0629 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A \u0627\u0644\u062A\u062C\u0627\u0631\u064A", landType: "commercial", areaSquareMeters: 300, minimumBid: 4200, bidIncrement: 300, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "factory-petroleum-expansion", lotType: "factory", label: "\u062E\u0637 \u0645\u0639\u0627\u0644\u062C\u0629 \u0648\u062A\u0643\u0631\u064A\u0631 \u0625\u0636\u0627\u0641\u064A \u0628\u0627\u0644\u062C\u0628\u064A\u0644", landType: "industrial", areaSquareMeters: 0, minimumBid: 4800, bidIncrement: 400, closesAt: "2099-12-31T00:00:00.000Z", status: "open", energyCapacityBonus: 40 },
      { id: "bulk-crude-oil", lotType: "raw-material", label: "\u0634\u062D\u0646\u0629 \u062E\u0627\u0645 \u0646\u0641\u0637 \u0642\u064A\u0627\u0633\u064A\u0629 \u0645\u0646 \u062D\u0642\u0644 \u0627\u0644\u063A\u0648\u0627\u0631", landType: "industrial", areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: "2099-12-31T00:00:00.000Z", status: "open", materialId: "crude-oil", quantity: 15 }
    ]
  },
  uae: {
    starterLand: "\u0645\u062C\u0645\u0639 \u0645\u0646\u0637\u0642\u0629 \u062C\u0628\u0644 \u0639\u0644\u064A \u0627\u0644\u062D\u0631\u0629 (JAFZA) \xB7 \u062F\u0628\u064A",
    directLands: [
      { id: "starter-village-land", label: "\u0645\u062C\u0645\u0639 \u0645\u0646\u0637\u0642\u0629 \u062C\u0628\u0644 \u0639\u0644\u064A \u0627\u0644\u062D\u0631\u0629 (JAFZA) \xB7 \u062F\u0628\u064A", landType: "agricultural", areaSquareMeters: 520, price: 3600 },
      { id: "direct-land-port-said", label: "\u0645\u062C\u0645\u0639 \u0643\u064A\u0632\u0627\u062F \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A \u0627\u0644\u062A\u062C\u0627\u0631\u064A \xB7 \u0623\u0628\u0648\u0638\u0628\u064A", landType: "commercial", areaSquareMeters: 420, price: 5700 },
      { id: "direct-land-minya-farm", label: "\u0645\u0632\u0627\u0631\u0639 \u0648\u0627\u062D\u0629 \u0627\u0644\u0639\u064A\u0646 \u0648\u0627\u0644\u0630\u064A\u062F \u0627\u0644\u062E\u0636\u0631\u0627\u0621", landType: "agricultural", areaSquareMeters: 900, price: 4800 },
      { id: "direct-land-sokhna-industrial", label: "\u0645\u0648\u0642\u0639 \u0627\u0644\u0631\u0648\u064A\u0633 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0644\u0644\u0628\u062A\u0631\u0648\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A", landType: "industrial", areaSquareMeters: 520, price: 7200 }
    ],
    directCompanies: [
      { id: "direct-company-food", name: "\u0634\u0631\u0643\u0629 \u062F\u0628\u064A \u0644\u0644\u0623\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u0636\u064A\u0627\u0641\u0629", industryId: "food", landType: "agricultural", areaSquareMeters: 650, price: 8600 },
      { id: "direct-company-logistics", name: "\u0634\u0631\u0643\u0629 \u0645\u0648\u0627\u0646\u0626 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629", industryId: "transport", landType: "commercial", areaSquareMeters: 500, price: 10400 },
      { id: "direct-company-energy", name: "\u0634\u0631\u0643\u0629 \u0634\u0645\u0633 \u0644\u062A\u0648\u0644\u064A\u062F \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0646\u0638\u064A\u0641\u0629", industryId: "electricity", landType: "industrial", areaSquareMeters: 600, price: 13600 }
    ],
    auctions: [
      { id: "land-cairo-industrial", lotType: "land", label: "\u0642\u0637\u0639\u0629 \u0648\u0627\u062D\u0629 \u062F\u0628\u064A \u0644\u0644\u0633\u064A\u0644\u064A\u0643\u0648\u0646 \u0644\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627", landType: "industrial", areaSquareMeters: 400, minimumBid: 3200, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-alexandria-farm", lotType: "land", label: "\u0623\u0631\u0636 \u0645\u0632\u0627\u0631\u0639 \u0644\u064A\u0648\u0627 \u0627\u0644\u0646\u0645\u0648\u0630\u062C\u064A\u0629", landType: "agricultural", areaSquareMeters: 650, minimumBid: 2700, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-suez-commerce", lotType: "land", label: "\u0645\u0648\u0642\u0639 \u062C\u0632\u064A\u0631\u0629 \u0627\u0644\u0645\u0627\u0631\u064A\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0627\u0644\u0645\u0627\u0644\u064A", landType: "commercial", areaSquareMeters: 300, minimumBid: 4200, bidIncrement: 300, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "factory-petroleum-expansion", lotType: "factory", label: "\u062A\u0648\u0633\u0639\u0629 \u062E\u0637 \u062A\u0643\u0631\u064A\u0631 \u0628\u0645\u062C\u0645\u0639 \u0627\u0644\u0631\u0648\u064A\u0633", landType: "industrial", areaSquareMeters: 0, minimumBid: 4800, bidIncrement: 400, closesAt: "2099-12-31T00:00:00.000Z", status: "open", energyCapacityBonus: 40 },
      { id: "bulk-crude-oil", lotType: "raw-material", label: "\u0634\u062D\u0646\u0629 \u062E\u0627\u0645 \u0646\u0641\u0637 \u0643\u0628\u0631\u0649 \u0645\u0646 \u062D\u0642\u0644 \u0632\u0627\u0643\u0648\u0645", landType: "industrial", areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: "2099-12-31T00:00:00.000Z", status: "open", materialId: "crude-oil", quantity: 15 }
    ]
  },
  usa: {
    starterLand: "\u0645\u062C\u0645\u0639 \u0643\u0648\u064A\u0646\u0632 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0648\u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A \xB7 \u0646\u064A\u0648\u064A\u0648\u0631\u0643",
    directLands: [
      { id: "starter-village-land", label: "\u0645\u062C\u0645\u0639 \u0643\u0648\u064A\u0646\u0632 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0648\u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A \xB7 \u0646\u064A\u0648\u064A\u0648\u0631\u0643", landType: "agricultural", areaSquareMeters: 520, price: 3600 },
      { id: "direct-land-port-said", label: "\u0645\u064A\u0646\u0627\u0621 \u0634\u064A\u0643\u0627\u063A\u0648 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0648\u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A", landType: "commercial", areaSquareMeters: 420, price: 5700 },
      { id: "direct-land-minya-farm", label: "\u0645\u0632\u0627\u0631\u0639 \u0627\u0644\u0648\u0627\u062F\u064A \u0627\u0644\u0623\u0648\u0633\u0637 \u0628\u0643\u0627\u0644\u064A\u0641\u0648\u0631\u0646\u064A\u0627 (Central Valley)", landType: "agricultural", areaSquareMeters: 900, price: 4800 },
      { id: "direct-land-sokhna-industrial", label: "\u0645\u062C\u0645\u0639 \u0647\u064A\u0648\u0633\u062A\u0646 \u0644\u0644\u0637\u0627\u0642\u0629 \u0648\u0627\u0644\u0628\u062A\u0631\u0648\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A \xB7 \u062A\u0643\u0633\u0627\u0633", landType: "industrial", areaSquareMeters: 520, price: 7200 }
    ],
    directCompanies: [
      { id: "direct-company-food", name: "\u0634\u0631\u0643\u0629 \u0645\u0627\u0646\u0647\u0627\u062A\u0646 \u0644\u0644\u062A\u0635\u0646\u064A\u0639 \u0648\u0627\u0644\u0633\u0644\u0639 \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A\u0629", industryId: "food", landType: "agricultural", areaSquareMeters: 650, price: 8600 },
      { id: "direct-company-logistics", name: "\u0634\u0631\u0643\u0629 \u0623\u0645\u0631\u064A\u0643\u0627\u0646 \u0641\u0631\u064A\u062A \u0644\u0644\u0634\u062D\u0646 \u0648\u0633\u0644\u0627\u0633\u0644 \u0627\u0644\u0625\u0645\u062F\u0627\u062F", industryId: "transport", landType: "commercial", areaSquareMeters: 500, price: 10400 },
      { id: "direct-company-energy", name: "\u0634\u0631\u0643\u0629 \u0647\u064A\u0648\u0633\u062A\u0646 \u0644\u0644\u0643\u0647\u0631\u0628\u0627\u0621 \u0648\u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u062A\u062C\u062F\u062F\u0629", industryId: "electricity", landType: "industrial", areaSquareMeters: 600, price: 13600 }
    ],
    auctions: [
      { id: "land-cairo-industrial", lotType: "land", label: "\u0642\u0637\u0639\u0629 \u0648\u0627\u062F\u064A \u0627\u0644\u0633\u064A\u0644\u064A\u0643\u0648\u0646 \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0629 \xB7 \u0633\u0627\u0646 \u062E\u0648\u0633\u064A\u0647", landType: "industrial", areaSquareMeters: 400, minimumBid: 3200, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-alexandria-farm", lotType: "land", label: "\u0623\u0631\u0636 \u0645\u0632\u0627\u0631\u0639 \u0622\u064A\u0648\u0627 \u0644\u0644\u062D\u0628\u0648\u0628 \u0648\u0627\u0644\u0630\u0631\u0629", landType: "agricultural", areaSquareMeters: 650, minimumBid: 2700, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-suez-commerce", lotType: "land", label: "\u0645\u0648\u0642\u0639 \u0645\u064A\u0627\u0645\u064A \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0627\u0644\u0628\u062D\u0631\u064A \u0627\u0644\u062F\u0648\u0644\u064A", landType: "commercial", areaSquareMeters: 300, minimumBid: 4200, bidIncrement: 300, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "factory-petroleum-expansion", lotType: "factory", label: "\u062E\u0637 \u0645\u0639\u0627\u0644\u062C\u0629 \u0648\u062A\u0643\u0631\u064A\u0631 \u0625\u0636\u0627\u0641\u064A \u0628\u062D\u0648\u0636 \u0628\u064A\u0631\u0645\u064A\u0627\u0646", landType: "industrial", areaSquareMeters: 0, minimumBid: 4800, bidIncrement: 400, closesAt: "2099-12-31T00:00:00.000Z", status: "open", energyCapacityBonus: 40 },
      { id: "bulk-crude-oil", lotType: "raw-material", label: "\u0634\u062D\u0646\u0629 \u062E\u0627\u0645 \u0646\u0641\u0637 \u063A\u0631\u0628 \u062A\u0643\u0633\u0627\u0633 (WTI)", landType: "industrial", areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: "2099-12-31T00:00:00.000Z", status: "open", materialId: "crude-oil", quantity: 15 }
    ]
  },
  kuwait: {
    starterLand: "\u0623\u0631\u0636 \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0634\u0648\u064A\u062E \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \xB7 \u0627\u0644\u0639\u0627\u0635\u0645\u0629",
    directLands: [
      { id: "starter-village-land", label: "\u0623\u0631\u0636 \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0634\u0648\u064A\u062E \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \xB7 \u0627\u0644\u0639\u0627\u0635\u0645\u0629", landType: "agricultural", areaSquareMeters: 520, price: 3600 },
      { id: "direct-land-port-said", label: "\u0645\u062C\u0645\u0639 \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0635\u0644\u064A\u0628\u064A\u0629 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A \u0627\u0644\u062A\u062C\u0627\u0631\u064A", landType: "commercial", areaSquareMeters: 420, price: 5700 },
      { id: "direct-land-minya-farm", label: "\u0645\u0632\u0627\u0631\u0639 \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0648\u0641\u0631\u0629 \u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629 \u0627\u0644\u062E\u0635\u0628\u0629", landType: "agricultural", areaSquareMeters: 900, price: 4800 },
      { id: "direct-land-sokhna-industrial", label: "\u0645\u0648\u0642\u0639 \u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0623\u062D\u0645\u062F\u064A \u0644\u0644\u0628\u062A\u0631\u0648\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A", landType: "industrial", areaSquareMeters: 520, price: 7200 }
    ],
    directCompanies: [
      { id: "direct-company-food", name: "\u0634\u0631\u0643\u0629 \u0627\u0644\u062F\u064A\u0631\u0629 \u0644\u0644\u0635\u0646\u0627\u0639\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \u0648\u0627\u0644\u062A\u062C\u0647\u064A\u0632", industryId: "food", landType: "agricultural", areaSquareMeters: 650, price: 8600 },
      { id: "direct-company-logistics", name: "\u0634\u0631\u0643\u0629 \u0628\u0648\u0628\u064A\u0627\u0646 \u0644\u0644\u0646\u0642\u0644 \u0648\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0628\u0631\u064A \u0648\u0627\u0644\u0628\u062D\u0631\u064A", industryId: "transport", landType: "commercial", areaSquareMeters: 500, price: 10400 },
      { id: "direct-company-energy", name: "\u0634\u0631\u0643\u0629 \u0643\u0648\u064A\u062A \u0625\u0646\u0631\u062C\u064A \u0644\u062A\u0648\u0644\u064A\u062F \u0627\u0644\u0637\u0627\u0642\u0629", industryId: "electricity", landType: "industrial", areaSquareMeters: 600, price: 13600 }
    ],
    auctions: [
      { id: "land-cairo-industrial", lotType: "land", label: "\u0642\u0637\u0639\u0629 \u0645\u0646\u0637\u0642\u0629 \u0635\u0628\u062D\u0627\u0646 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u062D\u062F\u064A\u062B\u0629", landType: "industrial", areaSquareMeters: 400, minimumBid: 3200, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-alexandria-farm", lotType: "land", label: "\u0623\u0631\u0636 \u0645\u0632\u0627\u0631\u0639 \u0627\u0644\u0639\u0628\u062F\u0644\u064A \u0627\u0644\u0632\u0631\u0627\u0639\u064A\u0629", landType: "agricultural", areaSquareMeters: 650, minimumBid: 2700, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-suez-commerce", lotType: "land", label: "\u0645\u0648\u0642\u0639 \u0627\u0644\u0639\u0627\u0635\u0645\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0641\u064A \u0645\u0646\u0637\u0642\u0629 \u0634\u0631\u0642", landType: "commercial", areaSquareMeters: 300, minimumBid: 4200, bidIncrement: 300, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "factory-petroleum-expansion", lotType: "factory", label: "\u062A\u0648\u0633\u0639\u0629 \u062E\u0637 \u062A\u0643\u0631\u064A\u0631 \u0645\u0635\u0641\u0627\u0629 \u0645\u064A\u0646\u0627\u0621 \u0639\u0628\u062F\u0627\u0644\u0644\u0647", landType: "industrial", areaSquareMeters: 0, minimumBid: 4800, bidIncrement: 400, closesAt: "2099-12-31T00:00:00.000Z", status: "open", energyCapacityBonus: 40 },
      { id: "bulk-crude-oil", lotType: "raw-material", label: "\u0634\u062D\u0646\u0629 \u062E\u0627\u0645 \u0646\u0641\u0637 \u0643\u0648\u064A\u062A\u064A\u0629 \u0645\u0646 \u062D\u0642\u0644 \u0628\u0631\u0642\u0627\u0646", landType: "industrial", areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: "2099-12-31T00:00:00.000Z", status: "open", materialId: "crude-oil", quantity: 15 }
    ]
  },
  qatar: {
    starterLand: "\u0623\u0631\u0636 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \xB7 \u0627\u0644\u062F\u0648\u062D\u0629",
    directLands: [
      { id: "starter-village-land", label: "\u0623\u0631\u0636 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \xB7 \u0627\u0644\u062F\u0648\u062D\u0629", landType: "agricultural", areaSquareMeters: 520, price: 3600 },
      { id: "direct-land-port-said", label: "\u0645\u062C\u0645\u0639 \u0645\u064A\u0646\u0627\u0621 \u062D\u0645\u062F \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A \u0627\u0644\u062F\u0648\u0644\u064A", landType: "commercial", areaSquareMeters: 420, price: 5700 },
      { id: "direct-land-minya-farm", label: "\u0645\u0632\u0627\u0631\u0639 \u0627\u0644\u0634\u0645\u0627\u0644 \u0627\u0644\u0642\u0637\u0631\u064A\u0629 \u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629", landType: "agricultural", areaSquareMeters: 900, price: 4800 },
      { id: "direct-land-sokhna-industrial", label: "\u0645\u062F\u064A\u0646\u0629 \u0631\u0623\u0633 \u0644\u0641\u0627\u0646 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0644\u0644\u063A\u0627\u0632 \u0648\u0627\u0644\u0637\u0627\u0642\u0629", landType: "industrial", areaSquareMeters: 520, price: 7200 }
    ],
    directCompanies: [
      { id: "direct-company-food", name: "\u0634\u0631\u0643\u0629 \u0627\u0644\u062F\u0648\u062D\u0629 \u0644\u0644\u0625\u0646\u062A\u0627\u062C \u0627\u0644\u063A\u0630\u0627\u0626\u064A \u0648\u0627\u0644\u062A\u0639\u0628\u0626\u0629", industryId: "food", landType: "agricultural", areaSquareMeters: 650, price: 8600 },
      { id: "direct-company-logistics", name: "\u0634\u0631\u0643\u0629 \u0645\u0644\u0627\u062D\u0629 \u0642\u0637\u0631 \u0644\u0644\u0634\u062D\u0646 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A", industryId: "transport", landType: "commercial", areaSquareMeters: 500, price: 10400 },
      { id: "direct-company-energy", name: "\u0634\u0631\u0643\u0629 \u0642\u0637\u0631 \u0644\u0644\u0637\u0627\u0642\u0629 \u0648\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621", industryId: "electricity", landType: "industrial", areaSquareMeters: 600, price: 13600 }
    ],
    auctions: [
      { id: "land-cairo-industrial", lotType: "land", label: "\u0642\u0637\u0639\u0629 \u0644\u0624\u0644\u0624\u0629 \u0642\u0637\u0631 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0627\u0644\u0641\u0627\u062E\u0631\u0629", landType: "industrial", areaSquareMeters: 400, minimumBid: 3200, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-alexandria-farm", lotType: "land", label: "\u0623\u0631\u0636 \u0627\u0644\u0634\u062D\u0627\u0646\u064A\u0629 \u0627\u0644\u0632\u0631\u0627\u0639\u064A\u0629 \u0627\u0644\u062E\u0636\u0631\u0627\u0621", landType: "agricultural", areaSquareMeters: 650, minimumBid: 2700, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-suez-commerce", lotType: "land", label: "\u0645\u0648\u0642\u0639 \u0631\u0648\u0636\u0629 \u0627\u0644\u062E\u064A\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0627\u0644\u062D\u064A\u0648\u064A", landType: "commercial", areaSquareMeters: 300, minimumBid: 4200, bidIncrement: 300, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "factory-petroleum-expansion", lotType: "factory", label: "\u062A\u0648\u0633\u0639\u0629 \u062E\u0637 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u063A\u0627\u0632 \u0628\u0631\u0623\u0633 \u0644\u0641\u0627\u0646", landType: "industrial", areaSquareMeters: 0, minimumBid: 4800, bidIncrement: 400, closesAt: "2099-12-31T00:00:00.000Z", status: "open", energyCapacityBonus: 40 },
      { id: "bulk-crude-oil", lotType: "raw-material", label: "\u0634\u062D\u0646\u0629 \u0645\u0643\u062B\u0641\u0627\u062A \u0648\u063A\u0627\u0632 \u0645\u0646 \u062D\u0642\u0644 \u0627\u0644\u0634\u0645\u0627\u0644 \u0627\u0644\u0642\u0637\u0631\u064A", landType: "industrial", areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: "2099-12-31T00:00:00.000Z", status: "open", materialId: "crude-oil", quantity: 15 }
    ]
  },
  uk: {
    starterLand: "\u0645\u062C\u0645\u0639 \u0645\u0627\u0646\u0634\u0633\u062A\u0631 \u0627\u0644\u0635\u0646\u0627\u0639\u064A (Trafford Park)",
    directLands: [
      { id: "starter-village-land", label: "\u0645\u062C\u0645\u0639 \u0645\u0627\u0646\u0634\u0633\u062A\u0631 \u0627\u0644\u0635\u0646\u0627\u0639\u064A (Trafford Park)", landType: "agricultural", areaSquareMeters: 520, price: 3600 },
      { id: "direct-land-port-said", label: "\u062D\u0648\u0636 \u0644\u064A\u0641\u0631\u0628\u0648\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A \u0627\u0644\u062F\u0648\u0644\u064A", landType: "commercial", areaSquareMeters: 420, price: 5700 },
      { id: "direct-land-minya-farm", label: "\u0645\u0632\u0627\u0631\u0639 \u064A\u0648\u0631\u0643\u0634\u0627\u064A\u0631 \u0627\u0644\u0632\u0631\u0627\u0639\u064A\u0629 \u0627\u0644\u062E\u0635\u0628\u0629", landType: "agricultural", areaSquareMeters: 900, price: 4800 },
      { id: "direct-land-sokhna-industrial", label: "\u0645\u062C\u0645\u0639 \u0623\u0628\u0631\u062F\u064A\u0646 \u0644\u0644\u0628\u062A\u0631\u0648\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A \u0648\u0637\u0627\u0642\u0629 \u0627\u0644\u0628\u062D\u0631", landType: "industrial", areaSquareMeters: 520, price: 7200 }
    ],
    directCompanies: [
      { id: "direct-company-food", name: "\u0634\u0631\u0643\u0629 \u0627\u0644\u062A\u0627\u064A\u0645\u0632 \u0644\u0644\u0635\u0646\u0627\u0639\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \u0627\u0644\u062D\u062F\u064A\u062B\u0629", industryId: "food", landType: "agricultural", areaSquareMeters: 650, price: 8600 },
      { id: "direct-company-logistics", name: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0645\u0644\u0643\u064A\u0629 \u0627\u0644\u0628\u0631\u064A\u0637\u0627\u0646\u064A\u0629", industryId: "transport", landType: "commercial", areaSquareMeters: 500, price: 10400 },
      { id: "direct-company-energy", name: "\u0634\u0631\u0643\u0629 \u0628\u0631\u064A\u062A\u064A\u0634 \u0628\u0627\u0648\u0631 \u0644\u0644\u0637\u0627\u0642\u0629 \u0648\u062A\u0648\u0644\u064A\u062F \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621", industryId: "electricity", landType: "industrial", areaSquareMeters: 600, price: 13600 }
    ],
    auctions: [
      { id: "land-cairo-industrial", lotType: "land", label: "\u0642\u0637\u0639\u0629 \u062D\u064A \u0643\u0627\u0646\u0627\u0631\u064A \u0648\u0627\u0631\u0641 \u0627\u0644\u0645\u0627\u0644\u064A \u0628\u0644\u0646\u062F\u0646", landType: "industrial", areaSquareMeters: 400, minimumBid: 3200, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-alexandria-farm", lotType: "land", label: "\u0623\u0631\u0636 \u0643\u064A\u0646\u062A \u0627\u0644\u0632\u0631\u0627\u0639\u064A\u0629 \u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629 (\u062D\u062F\u064A\u0642\u0629 \u0625\u0646\u062C\u0644\u062A\u0631\u0627)", landType: "agricultural", areaSquareMeters: 650, minimumBid: 2700, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-suez-commerce", lotType: "land", label: "\u0645\u0648\u0642\u0639 \u0633\u0627\u0648\u062B\u0647\u0627\u0645\u0628\u062A\u0648\u0646 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A", landType: "commercial", areaSquareMeters: 300, minimumBid: 4200, bidIncrement: 300, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "factory-petroleum-expansion", lotType: "factory", label: "\u062A\u0648\u0633\u0639\u0629 \u062E\u0637 \u062A\u0643\u0631\u064A\u0631 \u0628\u062D\u0631 \u0627\u0644\u0634\u0645\u0627\u0644 (Brent)", landType: "industrial", areaSquareMeters: 0, minimumBid: 4800, bidIncrement: 400, closesAt: "2099-12-31T00:00:00.000Z", status: "open", energyCapacityBonus: 40 },
      { id: "bulk-crude-oil", lotType: "raw-material", label: "\u0634\u062D\u0646\u0629 \u062E\u0627\u0645 \u0646\u0641\u0637 \u0628\u0631\u0646\u062A \u0628\u0631\u064A\u0637\u0627\u0646\u064A\u0629", landType: "industrial", areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: "2099-12-31T00:00:00.000Z", status: "open", materialId: "crude-oil", quantity: 15 }
    ]
  },
  germany: {
    starterLand: "\u062D\u0632\u0627\u0645 \u0627\u0644\u0631\u0648\u0631 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0627\u0644\u062D\u062F\u064A\u062B \xB7 \u062F\u0648\u0633\u0644\u062F\u0648\u0631\u0641",
    directLands: [
      { id: "starter-village-land", label: "\u062D\u0632\u0627\u0645 \u0627\u0644\u0631\u0648\u0631 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0627\u0644\u062D\u062F\u064A\u062B \xB7 \u062F\u0648\u0633\u0644\u062F\u0648\u0631\u0641", landType: "agricultural", areaSquareMeters: 520, price: 3600 },
      { id: "direct-land-port-said", label: "\u0645\u062C\u0645\u0639 \u0645\u064A\u0646\u0627\u0621 \u0647\u0627\u0645\u0628\u0648\u0631\u063A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A \u0627\u0644\u062A\u062C\u0627\u0631\u064A", landType: "commercial", areaSquareMeters: 420, price: 5700 },
      { id: "direct-land-minya-farm", label: "\u0645\u0632\u0627\u0631\u0639 \u0628\u0627\u0641\u0627\u0631\u064A\u0627 \u0627\u0644\u0632\u0631\u0627\u0639\u064A\u0629 \u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629", landType: "agricultural", areaSquareMeters: 900, price: 4800 },
      { id: "direct-land-sokhna-industrial", label: "\u0645\u062C\u0645\u0639 \u0644\u0648\u062F\u0641\u064A\u063A\u0633\u0647\u0627\u0641\u0646 \u0644\u0644\u0635\u0646\u0627\u0639\u0627\u062A \u0627\u0644\u0643\u064A\u0645\u0627\u0648\u064A\u0629", landType: "industrial", areaSquareMeters: 520, price: 7200 }
    ],
    directCompanies: [
      { id: "direct-company-food", name: "\u0634\u0631\u0643\u0629 \u0628\u0627\u0641\u0627\u0631\u064A\u0627 \u0644\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629", industryId: "food", landType: "agricultural", areaSquareMeters: 650, price: 8600 },
      { id: "direct-company-logistics", name: "\u0634\u0631\u0643\u0629 \u062F\u0648\u064A\u062A\u0634\u0647 \u0644\u0644\u0634\u062D\u0646 \u0648\u0633\u0644\u0627\u0633\u0644 \u0627\u0644\u062A\u0648\u0631\u064A\u062F", industryId: "transport", landType: "commercial", areaSquareMeters: 500, price: 10400 },
      { id: "direct-company-energy", name: "\u0634\u0631\u0643\u0629 \u0631\u0627\u064A\u0646-\u0625\u0644\u0643\u062A\u0631\u064A\u0643 \u0644\u062A\u0648\u0644\u064A\u062F \u0627\u0644\u0637\u0627\u0642\u0629", industryId: "electricity", landType: "industrial", areaSquareMeters: 600, price: 13600 }
    ],
    auctions: [
      { id: "land-cairo-industrial", lotType: "land", label: "\u0642\u0637\u0639\u0629 \u0634\u062A\u0648\u062A\u063A\u0627\u0631\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u062A\u0642\u0646\u064A\u0629", landType: "industrial", areaSquareMeters: 400, minimumBid: 3200, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-alexandria-farm", lotType: "land", label: "\u0623\u0631\u0636 \u0628\u0631\u0627\u0646\u062F\u0646\u0628\u0648\u0631\u063A \u0627\u0644\u0632\u0631\u0627\u0639\u064A\u0629 \u0627\u0644\u0645\u0645\u062A\u062F\u0629", landType: "agricultural", areaSquareMeters: 650, minimumBid: 2700, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-suez-commerce", lotType: "land", label: "\u0645\u0648\u0642\u0639 \u062D\u064A \u0627\u0644\u0645\u0627\u0644 \u0628\u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A (Bankenviertel)", landType: "commercial", areaSquareMeters: 300, minimumBid: 4200, bidIncrement: 300, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "factory-petroleum-expansion", lotType: "factory", label: "\u062E\u0637 \u0645\u0639\u0627\u0644\u062C\u0629 \u0648\u062A\u0643\u0631\u064A\u0631 \u0625\u0636\u0627\u0641\u064A \u0628\u0645\u062C\u0645\u0639 \u0634\u0641\u064A\u064A\u062F\u062A", landType: "industrial", areaSquareMeters: 0, minimumBid: 4800, bidIncrement: 400, closesAt: "2099-12-31T00:00:00.000Z", status: "open", energyCapacityBonus: 40 },
      { id: "bulk-crude-oil", lotType: "raw-material", label: "\u0634\u062D\u0646\u0629 \u062E\u0627\u0645 \u0646\u0641\u0637 \u0623\u0644\u0645\u0627\u0646\u064A\u0629 \u0645\u0643\u0631\u0631\u0629 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u062C\u0648\u062F\u0629", landType: "industrial", areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: "2099-12-31T00:00:00.000Z", status: "open", materialId: "crude-oil", quantity: 15 }
    ]
  },
  japan: {
    starterLand: "\u0645\u062C\u0645\u0639 \u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627 \u0627\u0644\u0628\u062D\u0631\u064A \u0627\u0644\u0635\u0646\u0627\u0639\u064A \xB7 \u062E\u0644\u064A\u062C \u0637\u0648\u0643\u064A\u0648",
    directLands: [
      { id: "starter-village-land", label: "\u0645\u062C\u0645\u0639 \u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627 \u0627\u0644\u0628\u062D\u0631\u064A \u0627\u0644\u0635\u0646\u0627\u0639\u064A \xB7 \u062E\u0644\u064A\u062C \u0637\u0648\u0643\u064A\u0648", landType: "agricultural", areaSquareMeters: 520, price: 3600 },
      { id: "direct-land-port-said", label: "\u0645\u064A\u0646\u0627\u0621 \u0646\u0627\u063A\u0648\u064A\u0627 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0627\u0644\u062F\u0648\u0644\u064A", landType: "commercial", areaSquareMeters: 420, price: 5700 },
      { id: "direct-land-minya-farm", label: "\u0645\u0632\u0627\u0631\u0639 \u0647\u0648\u0643\u0627\u064A\u062F\u0648 \u0627\u0644\u0632\u0631\u0627\u0639\u064A\u0629 \u0627\u0644\u062E\u0635\u0628\u0629", landType: "agricultural", areaSquareMeters: 900, price: 4800 },
      { id: "direct-land-sokhna-industrial", label: "\u0645\u062C\u0645\u0639 \u0623\u0648\u0633\u0627\u0643\u0627 \u0644\u062A\u0643\u0631\u064A\u0631 \u0627\u0644\u0637\u0627\u0642\u0629 \u0648\u0627\u0644\u0635\u0646\u0627\u0639\u0627\u062A \u0627\u0644\u062B\u0642\u064A\u0644\u0629", landType: "industrial", areaSquareMeters: 520, price: 7200 }
    ],
    directCompanies: [
      { id: "direct-company-food", name: "\u0634\u0631\u0643\u0629 \u0637\u0648\u0643\u064A\u0648 \u0644\u0644\u062A\u0635\u0646\u064A\u0639 \u0627\u0644\u063A\u0630\u0627\u0626\u064A", industryId: "food", landType: "agricultural", areaSquareMeters: 650, price: 8600 },
      { id: "direct-company-logistics", name: "\u0634\u0631\u0643\u0629 \u0646\u064A\u0628\u0648\u0646 \u0644\u0644\u0646\u0642\u0644 \u0627\u0644\u0633\u0631\u064A\u0639 \u0648\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062F\u0648\u0644\u064A", industryId: "transport", landType: "commercial", areaSquareMeters: 500, price: 10400 },
      { id: "direct-company-energy", name: "\u0634\u0631\u0643\u0629 \u0643\u0627\u0646\u0633\u0627\u064A \u0625\u0644\u0643\u062A\u0631\u064A\u0643 \u0644\u0644\u0637\u0627\u0642\u0629 \u0648\u062A\u0648\u0644\u064A\u062F \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621", industryId: "electricity", landType: "industrial", areaSquareMeters: 600, price: 13600 }
    ],
    auctions: [
      { id: "land-cairo-industrial", lotType: "land", label: "\u0642\u0637\u0639\u0629 \u0641\u0648\u0643\u0648\u0643\u0627 \u0644\u0644\u0627\u0628\u062A\u0643\u0627\u0631 \u0648\u0627\u0644\u0623\u062A\u0645\u062A\u0629", landType: "industrial", areaSquareMeters: 400, minimumBid: 3200, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-alexandria-farm", lotType: "land", label: "\u0623\u0631\u0636 \u0646\u0627\u063A\u0627\u0646\u0648 \u0627\u0644\u0632\u0631\u0627\u0639\u064A\u0629 \u0627\u0644\u0646\u0645\u0648\u0630\u062C\u064A\u0629", landType: "agricultural", areaSquareMeters: 650, minimumBid: 2700, bidIncrement: 200, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "land-suez-commerce", lotType: "land", label: "\u0645\u0648\u0642\u0639 \u062D\u064A \u0634\u064A\u0646\u062C\u0648\u0643\u0648 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0628\u0637\u0648\u0643\u064A\u0648", landType: "commercial", areaSquareMeters: 300, minimumBid: 4200, bidIncrement: 300, closesAt: "2099-12-31T00:00:00.000Z", status: "open" },
      { id: "factory-petroleum-expansion", lotType: "factory", label: "\u062A\u0648\u0633\u0639\u0629 \u062E\u0637 \u062A\u0643\u0631\u064A\u0631 \u0628\u0645\u062C\u0645\u0639 \u0643\u0627\u0646\u0627\u063A\u0627\u0648\u0627", landType: "industrial", areaSquareMeters: 0, minimumBid: 4800, bidIncrement: 400, closesAt: "2099-12-31T00:00:00.000Z", status: "open", energyCapacityBonus: 40 },
      { id: "bulk-crude-oil", lotType: "raw-material", label: "\u0634\u062D\u0646\u0629 \u062E\u0627\u0645 \u0646\u0641\u0637 \u0645\u0633\u062A\u0648\u0631\u062F\u0629 \u0641\u0627\u0626\u0642\u0629 \u0627\u0644\u0646\u0642\u0627\u0648\u0629", landType: "industrial", areaSquareMeters: 0, minimumBid: 600, bidIncrement: 80, closesAt: "2099-12-31T00:00:00.000Z", status: "open", materialId: "crude-oil", quantity: 15 }
    ]
  }
};
function getDirectLandsForCountry(countryId) {
  const cId = countryId || "egypt";
  return COUNTRY_REAL_ASSETS[cId]?.directLands || COUNTRY_REAL_ASSETS.egypt.directLands;
}
function getDirectCompaniesForCountry(countryId) {
  const cId = countryId || "egypt";
  return COUNTRY_REAL_ASSETS[cId]?.directCompanies || COUNTRY_REAL_ASSETS.egypt.directCompanies;
}
function getAuctionsForCountry(countryId) {
  const cId = countryId || "egypt";
  return (COUNTRY_REAL_ASSETS[cId]?.auctions || COUNTRY_REAL_ASSETS.egypt.auctions).map((a) => ({
    ...a,
    countryId: cId
  }));
}
var DIRECT_LAND_CATALOG = COUNTRY_REAL_ASSETS.egypt.directLands;
var DIRECT_COMPANY_CATALOG = COUNTRY_REAL_ASSETS.egypt.directCompanies;
var AUCTION_CATALOG = COUNTRY_REAL_ASSETS.egypt.auctions.map((a) => ({ ...a, countryId: "egypt" }));
function findIndustry(industryId) {
  return INDUSTRY_CATALOG.find((entry) => entry.id === industryId);
}
function findMaterial(materialId) {
  return MATERIAL_CATALOG.find((entry) => entry.id === materialId);
}
function findRecipeForIndustry(industryId) {
  return RECIPE_CATALOG.find((entry) => entry.industryId === industryId);
}
function findInvestment(investmentId) {
  return INVESTMENT_CATALOG.find((entry) => entry.id === investmentId);
}

// src/game/economyBalance.ts
var ECONOMY_BALANCE = {
  operatingCostGrowthPerDay: 15e-4,
  operatingCostGrowthCap: 0.35,
  marketPriceGrowthPerDay: 8e-4,
  marketPriceGrowthCap: 0.25
};
function getOperatingCostProgression(day) {
  return 1 + Math.min(ECONOMY_BALANCE.operatingCostGrowthCap, Math.max(0, day - 1) * ECONOMY_BALANCE.operatingCostGrowthPerDay);
}
function getMarketPriceProgression(day) {
  return 1 + Math.min(ECONOMY_BALANCE.marketPriceGrowthCap, Math.max(0, day - 1) * ECONOMY_BALANCE.marketPriceGrowthPerDay);
}
function getInvestmentPayoutRate(returnRate, durationDays) {
  return returnRate * durationDays / 30;
}

// src/game/market.ts
function seededValue(seed) {
  let hash2 = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash2 ^= seed.charCodeAt(index);
    hash2 = Math.imul(hash2, 16777619);
  }
  return hash2 >>> 0;
}
function getMarketQuote(profile, productId, day = profile.day) {
  const product = PRODUCT_CATALOG.find((item) => item.id === productId);
  if (!product) return null;
  const productIndex = PRODUCT_CATALOG.findIndex((item) => item.id === productId);
  const seed = seededValue(`${profile.id}:${productId}:${day}`);
  const priceShift = seed % 31 - 15;
  const demandShift = Math.floor(seed / 31) % 11 - 5;
  const baseDemand = 16 + productIndex * 5 % 13;
  const eventDemandMultiplier = profile.events.filter((event) => event.productId === productId && event.day <= day && (event.effectExpiresOnDay ?? event.day) >= day && typeof event.demandMultiplier === "number").reduce((multiplier, event) => multiplier * (event.demandMultiplier ?? 1), 1);
  const currentPrice = Math.max(1, Math.round(product.baseSellPrice * getMarketPriceProgression(day) * (1 + priceShift / 100)));
  const trend = priceShift >= 6 ? "up" : priceShift <= -6 ? "down" : "steady";
  return {
    productId,
    demandUnits: Math.max(4, Math.round((baseDemand + demandShift) * eventDemandMultiplier)),
    currentPrice,
    basePrice: product.baseSellPrice,
    trend,
    trendLabel: trend === "up" ? "\u0637\u0644\u0628 \u0645\u0631\u062A\u0641\u0639" : trend === "down" ? "\u0633\u0648\u0642 \u0647\u0627\u062F\u0626" : "\u0633\u0648\u0642 \u0645\u0633\u062A\u0642\u0631"
  };
}

// src/game/time.ts
var GAME_DAY_MS = 24 * 60 * 1e3;

// src/game/auctions.ts
var AUCTION_CYCLE_DAYS = 1;
function getAuctionCloseAt(profile, listing) {
  const parsedStart = Date.parse(profile.createdAt);
  const worldStart = Number.isFinite(parsedStart) ? parsedStart : Date.now();
  return listing.closesAt || new Date(worldStart + AUCTION_CYCLE_DAYS * GAME_DAY_MS).toISOString();
}
function wasWon(profile, listingId) {
  return profile.lands.some((land) => land.id === listingId || land.id.startsWith(`${listingId}-renewed-`)) || profile.assets.some((asset) => asset.id === listingId || asset.id.startsWith(`${listingId}-renewed-`)) || profile.auctionHistory.some((bid) => bid.listingId.startsWith(listingId) && bid.bidder === "player");
}
function getAuctionListings(profile) {
  const worldStart = Number.isFinite(Date.parse(profile.createdAt)) ? Date.parse(profile.createdAt) : Date.now();
  const closesAt = new Date(worldStart + (profile.day + AUCTION_CYCLE_DAYS) * GAME_DAY_MS).toISOString();
  const countryAuctions = getAuctionsForCountry(profile.countryId);
  const regular = countryAuctions.map((base) => ({
    ...base,
    countryId: profile.countryId,
    id: `${base.id}-day-${profile.day}`,
    label: `${base.label} \xB7 \u062F\u0648\u0631\u0629 \u0627\u0644\u064A\u0648\u0645 ${profile.day}`,
    closesAt,
    status: "open"
  })).filter((listing) => !wasWon(profile, listing.id));
  const rareId = `season-rare-${profile.day}`;
  const rare = {
    id: rareId,
    countryId: profile.countryId,
    lotType: "factory",
    label: `\u0645\u0632\u0627\u062F \u0627\u0633\u062A\u062B\u0645\u0627\u0631\u064A \u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A \xB7 \u062A\u0648\u0633\u0639\u0629 \u0627\u0644\u064A\u0648\u0645 ${profile.day}`,
    landType: "industrial",
    areaSquareMeters: 0,
    minimumBid: 9e3 + profile.day % 3 * 500,
    bidIncrement: 500,
    closesAt,
    status: "open",
    energyCapacityBonus: 90
  };
  return profile.auctionHistory.some((bid) => bid.listingId === rareId && bid.bidder === "player") ? regular : [...regular, rare];
}
function resolveAuctionListing(profile, listingId) {
  return getAuctionListings(profile).find((listing) => listing.id === listingId);
}
function isAuctionOpen(profile, listing) {
  return listing.status === "open" && Date.now() < Date.parse(getAuctionCloseAt(profile, listing));
}

// src/game/progressionEngine.ts
var EXPERIENCE_PER_LEVEL = 150;
var INTRO_UNLOCKED_SECTIONS = [
  "home",
  "store",
  "profile",
  "lands",
  "companies",
  "tasks",
  "auctions",
  "obligations"
];
function calculatePlayerProgress(profile) {
  const completedProduction = profile.productionOrders.filter((order) => order.status === "completed").length;
  const completedContracts = profile.contracts.filter((contract) => contract.status === "completed").length;
  const totalExperience = profile.lands.length * 35 + profile.companies.length * 75 + Math.min(completedProduction, 20) * 22 + Math.min(profile.sales.length, 30) * 12 + Math.min(completedContracts, 20) * 45 + Math.min(profile.completedTaskIds.length, 30) * 22 + Math.min(profile.achievements.length, 30) * 30 + Math.min(profile.investments.length, 20) * 15 + Math.min(profile.staff.length, 15) * 8;
  const activityLevel = 1 + Math.floor(totalExperience / EXPERIENCE_PER_LEVEL);
  const level = Math.max(1, profile.level || 1, activityLevel);
  const experienceInLevel = level > activityLevel ? 0 : totalExperience % EXPERIENCE_PER_LEVEL;
  let currentStoryStage = 1;
  const factoryRepaired = profile.companies.some((c) => (c.maintenanceCondition ?? 100) >= 90);
  if (factoryRepaired || profile.lands.length >= 2) currentStoryStage = 2;
  if (profile.inventory.length > 0 || profile.productionOrders.length > 0 || level >= 2) currentStoryStage = 3;
  if (completedProduction > 0 && profile.sales.length > 0 || level >= 3) currentStoryStage = 4;
  if (completedContracts >= 1 || profile.banking.loans.every((l) => l.status !== "active")) currentStoryStage = Math.max(currentStoryStage, 5);
  if (completedContracts >= 1 || level >= 4) currentStoryStage = Math.max(currentStoryStage, 6);
  if (level >= 5 || profile.staff.some((s) => s.status === "active")) currentStoryStage = Math.max(currentStoryStage, 7);
  if (level >= 6) currentStoryStage = Math.max(currentStoryStage, 8);
  if (level >= 9) currentStoryStage = Math.max(currentStoryStage, 9);
  if (level >= 12) currentStoryStage = 10;
  let currentChapter = 1;
  if (!profile.onboarding?.introCompleted) {
    currentChapter = 0;
  } else if (level >= 5 || profile.companies.length >= 3) {
    currentChapter = 4;
  } else if (completedContracts >= 1) {
    currentChapter = 3;
  } else if (completedProduction > 0) {
    currentChapter = 2;
  }
  return {
    level,
    totalExperience,
    experienceInLevel,
    experienceForNextLevel: EXPERIENCE_PER_LEVEL,
    currentStoryStage,
    currentChapter
  };
}
function computeUnlockedSections(profile) {
  if (!profile.onboarding?.introCompleted) {
    return [...INTRO_UNLOCKED_SECTIONS];
  }
  const unlocked = new Set(INTRO_UNLOCKED_SECTIONS);
  const progress = calculatePlayerProgress(profile);
  const level = progress.level;
  const completedProduction = profile.productionOrders.some((order) => order.status === "completed");
  const completedSales = profile.sales.length > 0;
  const completedContracts = profile.contracts.filter((contract) => contract.status === "completed").length;
  if (profile.companies.length >= 1 || level >= 2) {
    unlocked.add("production");
    unlocked.add("inventory");
  }
  if (completedProduction && completedSales || level >= 3) {
    unlocked.add("contracts");
  }
  if (completedContracts >= 1 || level >= 4) {
    unlocked.add("bank");
  }
  if (level >= 5 || completedContracts >= 2 && profile.companies.length >= 2) {
    unlocked.add("investments");
    unlocked.add("staff");
    unlocked.add("reports");
  }
  if (level >= 6) unlocked.add("tech_tree");
  if (level >= 7) unlocked.add("territory");
  if (level >= 8) unlocked.add("luxury");
  if (level >= 9) unlocked.add("cartel");
  if (level >= 10) unlocked.add("maritime");
  if (level >= 12) unlocked.add("megaprojects");
  if (level >= 15) unlocked.add("incubator");
  return [...unlocked];
}

// src/game/countryScenarios.ts
var COUNTRY_SEEDS = {
  egypt: {
    countryId: "egypt",
    scenarioTitle: "\u0646\u0647\u0636\u0629 \u0627\u0644\u0639\u0627\u0634\u0631 \u0645\u0646 \u0631\u0645\u0636\u0627\u0646 \u0648\u0645\u0648\u0627\u0646\u0626 \u0627\u0644\u0642\u0646\u0627\u0629",
    cityShort: "\u0627\u0644\u0642\u0627\u0647\u0631\u0629 \u0648\u0627\u0644\u0639\u0627\u0634\u0631",
    industrialHub: "\u0645\u062C\u0645\u0639 \u0627\u0644\u0639\u0627\u0634\u0631 \u0645\u0646 \u0631\u0645\u0636\u0627\u0646 \u0627\u0644\u0635\u0646\u0627\u0639\u064A",
    portHub: "\u0645\u062D\u0648\u0631 \u0645\u0648\u0627\u0646\u0626 \u0628\u0648\u0631\u0633\u0639\u064A\u062F \u0648\u0627\u0644\u0639\u064A\u0646 \u0627\u0644\u0633\u062E\u0646\u0629",
    bankName: "\u0628\u0646\u0643 \u0645\u0635\u0631",
    exchangeName: "\u0627\u0644\u0628\u0648\u0631\u0635\u0629 \u0627\u0644\u0645\u0635\u0631\u064A\u0629 EGX",
    inheritedFactoryName: "\u0645\u0635\u0646\u0639 \u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0627\u0644\u0646\u0645\u0648\u0630\u062C\u064A \xB7 \u0627\u0644\u0639\u0627\u0634\u0631 \u0645\u0646 \u0631\u0645\u0636\u0627\u0646",
    inheritedLandName: "\u0623\u0631\u0636 \u0645\u062C\u0645\u0639 \u0627\u0644\u0639\u0627\u0634\u0631 \u0645\u0646 \u0631\u0645\u0636\u0627\u0646 \u0627\u0644\u0635\u0646\u0627\u0639\u064A",
    starterLandOfferName: "\u0623\u0631\u0636 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 \xB7 \u0627\u0644\u0639\u0627\u0634\u0631 \u0645\u0646 \u0631\u0645\u0636\u0627\u0646",
    headline: "\u0633\u0648\u0642 \u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A \u0636\u062E\u0645 \u0648\u062A\u0643\u0627\u0644\u064A\u0641 \u062A\u0634\u063A\u064A\u0644 \u062A\u0646\u0627\u0641\u0633\u064A\u0629 \u0628\u0631\u0628\u0637 \u0645\u0628\u0627\u0634\u0631 \u0645\u0639 \u0642\u0646\u0627\u0629 \u0627\u0644\u0633\u0648\u064A\u0633.",
    strengths: [
      "\u0623\u0642\u0644 \u0645\u0636\u0627\u0639\u0641 \u062A\u0643\u0644\u0641\u0629 \u062A\u0634\u063A\u064A\u0644 \u064A\u0648\u0645\u064A (1.0x) \u0648\u0636\u0631\u064A\u0628\u0629 \u0645\u0628\u064A\u0639\u0627\u062A \u0645\u0639\u062A\u062F\u0644\u0629 (12%)",
      "\u0637\u0644\u0628 \u062F\u0627\u062E\u0644\u064A \u0642\u0648\u064A \u0648\u0645\u0633\u062A\u0642\u0631 \u0639\u0644\u0649 \u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0648\u0645\u0648\u0627\u062F \u0627\u0644\u0628\u0646\u0627\u0621 \u0648\u0627\u0644\u0645\u0646\u0638\u0641\u0627\u062A",
      "\u0645\u0648\u0642\u0639 \u0645\u062D\u0648\u0631\u064A \u0628\u064A\u0646 \u0645\u0648\u0627\u0646\u0626 \u0628\u0648\u0631\u0633\u0639\u064A\u062F \u0648\u0627\u0644\u0633\u062E\u0646\u0629 \u0644\u0644\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0628\u062D\u0631\u064A \u0627\u0644\u0633\u0631\u064A\u0639"
    ],
    challenges: [
      "\u0627\u0644\u0645\u0635\u0646\u0639 \u0627\u0644\u0645\u0648\u0631\u0648\u062B \u064A\u0639\u0645\u0644 \u0628\u0643\u0641\u0627\u0621\u0629 25% \u0648\u064A\u062D\u062A\u0627\u062C \u0635\u064A\u0627\u0646\u0629 \u0641\u0648\u0631\u064A\u0629 \u0642\u0628\u0644 \u0627\u0644\u062A\u0648\u0633\u0639",
      "\u0642\u0631\u0636 \u0645\u0648\u0631\u0648\u062B \u0628\u0642\u064A\u0645\u0629 5,250 $ \u0644\u062F\u0649 \u0628\u0646\u0643 \u0645\u0635\u0631 \u064A\u0633\u062A\u062D\u0642 \u0628\u0639\u062F \u0645\u0647\u0644\u0629 7 \u0623\u064A\u0627\u0645"
    ],
    signatureSectors: ["\u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u0632\u0631\u0627\u0639\u0629", "\u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0648\u0642\u0646\u0627\u0629 \u0627\u0644\u0633\u0648\u064A\u0633", "\u0627\u0644\u0628\u062A\u0631\u0648\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A \u0648\u0627\u0644\u0637\u0627\u0642\u0629"],
    strategicTip: "\u0627\u0633\u062A\u0641\u062F \u0645\u0646 \u0627\u0646\u062E\u0641\u0627\u0636 \u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0641\u064A \u0645\u0635\u0631 \u0644\u0628\u0646\u0627\u0621 \u0641\u0627\u0626\u0636 \u0646\u0642\u062F\u064A \u0645\u0628\u0643\u0631 \u0642\u0628\u0644 \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0632\u0627\u062F\u0627\u062A.",
    elder: { name: "\u0627\u0644\u062D\u0627\u062C \u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0627\u0644\u0645\u0646\u0634\u0627\u0648\u064A", title: "\u0643\u0628\u064A\u0631 \u0645\u0633\u062A\u0634\u0627\u0631\u064A \u0639\u0627\u0626\u0644\u0629 \u0627\u0644\u0646\u064A\u0644", initials: "\u0625\u0645" },
    operations: { name: "\u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u0641\u0627\u0631\u0648\u0642 \u0639\u0628\u062F\u0627\u0644\u062D\u0645\u064A\u062F", title: "\u0645\u062F\u064A\u0631 \u062A\u0634\u063A\u064A\u0644 \u0645\u0635\u0627\u0646\u0639 \u0627\u0644\u0639\u0627\u0634\u0631", initials: "\u0641\u0639" },
    finance: { name: "\u062F. \u0633\u0644\u0645\u0649 \u0627\u0644\u0634\u0627\u0630\u0644\u064A", title: "\u0645\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0627\u0626\u062A\u0645\u0627\u0646 \u0648\u0628\u0648\u0631\u0635\u0629 \u0627\u0644\u0642\u0627\u0647\u0631\u0629", initials: "\u0633\u0634" },
    logistics: { name: "\u0627\u0644\u0642\u0628\u0637\u0627\u0646 \u0637\u0627\u0631\u0642 \u062F\u0645\u064A\u0627\u0637\u064A", title: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0648\u0645\u062D\u0648\u0631 \u0627\u0644\u0642\u0646\u0627\u0629", initials: "\u0637\u062F" },
    rivals: [
      { id: "eg-rival-1", name: "\u062A\u0643\u062A\u0644 \u0627\u0644\u0623\u0647\u0631\u0627\u0645 \u0627\u0644\u0635\u0646\u0627\u0639\u064A", avatar: "\u{1F3DB}\uFE0F", activeSector: "\u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u0635\u0648\u0627\u0645\u0639 \u0627\u0644\u0643\u0628\u0631\u0649", netWorth: 145e4 },
      { id: "eg-rival-2", name: "\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u062F\u0644\u062A\u0627 \u0644\u0644\u0645\u0644\u0627\u062D\u0629", avatar: "\u{1F6A2}", activeSector: "\u0645\u0648\u0627\u0646\u0626 \u0628\u0648\u0631\u0633\u0639\u064A\u062F \u0648\u0627\u0644\u0633\u062E\u0646\u0629", netWorth: 28e5 },
      { id: "eg-rival-3", name: "\u0627\u0644\u0642\u0627\u0628\u0636\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0628\u0627\u0644\u0642\u0627\u0647\u0631\u0629", avatar: "\u{1F3E6}", activeSector: "\u0627\u0644\u0628\u0646\u0648\u0643 \u0648\u0627\u0644\u0623\u0633\u0647\u0645 \u0627\u0644\u0642\u064A\u0627\u062F\u064A\u0629", netWorth: 52e5 }
    ],
    clients: [
      { name: "\u0633\u0644\u0627\u0633\u0644 \u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u0645\u062D\u0631\u0648\u0633\u0629 \u0627\u0644\u0627\u0642\u062A\u0635\u0627\u062F\u064A\u0629", type: "budget", multiplier: 0.94, minimumQuality: 0, description: "\u062A\u0648\u0631\u064A\u062F \u0645\u0646\u062A\u0638\u0645 \u0644\u0644\u0623\u062D\u064A\u0627\u0621 \u0627\u0644\u0633\u0643\u0646\u064A\u0629 \u0641\u064A \u0627\u0644\u0642\u0627\u0647\u0631\u0629 \u0627\u0644\u0643\u0628\u0631\u0649 \u0628\u0633\u0639\u0631 \u062A\u0646\u0627\u0641\u0633\u064A." },
      { name: "\u0641\u0646\u0627\u062F\u0642 \u0648\u0645\u0646\u062A\u062C\u0639\u0627\u062A \u0627\u0644\u0646\u064A\u0644 \u0627\u0644\u0641\u0627\u062E\u0631\u0629", type: "quality", multiplier: 1.18, minimumQuality: 90, description: "\u062A\u0634\u062A\u0631\u0637 \u062C\u0648\u062F\u0629 \u0625\u0646\u062A\u0627\u062C \u0644\u0627 \u062A\u0642\u0644 \u0639\u0646 90% \u0645\u0642\u0627\u0628\u0644 \u0639\u0644\u0627\u0648\u0629 \u0633\u0639\u0631\u064A\u0629 \u0645\u0645\u062A\u0627\u0632\u0629." },
      { name: "\u0645\u062E\u0627\u0632\u0646 \u0627\u0644\u062C\u0645\u0644\u0629 \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A\u0629 \u0628\u0627\u0644\u0639\u0627\u0634\u0631", type: "bulk", multiplier: 1.05, minimumQuality: 75, description: "\u062A\u0633\u062A\u0648\u0639\u0628 \u0643\u0645\u064A\u0627\u062A \u0643\u0628\u064A\u0631\u0629 \u0644\u062A\u0648\u0632\u064A\u0639\u0647\u0627 \u0639\u0644\u0649 \u0645\u062D\u0627\u0641\u0638\u0627\u062A \u0627\u0644\u062F\u0644\u062A\u0627 \u0648\u0627\u0644\u0635\u0639\u064A\u062F." },
      { name: "\u0647\u064A\u0626\u0629 \u062A\u0645\u0648\u064A\u0646 \u0633\u0641\u0646 \u0645\u062D\u0648\u0631 \u0642\u0646\u0627\u0629 \u0627\u0644\u0633\u0648\u064A\u0633", type: "urgent", multiplier: 1.28, minimumQuality: 70, description: "\u0637\u0644\u0628\u064A\u0629 \u0639\u0627\u062C\u0644\u0629 \u0644\u0639\u0628\u0648\u0631 \u0627\u0644\u0642\u0648\u0627\u0641\u0644 \u0627\u0644\u0645\u0644\u0627\u062D\u064A\u0629 \u0628\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u062A\u0632\u0627\u0645 \u0645\u0631\u062A\u0641\u0639\u0629." }
    ],
    eventExportTitle: "\u0641\u0631\u0635\u0629 \u062A\u0635\u062F\u064A\u0631 \u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A\u0629"
  },
  saudi: {
    countryId: "saudi",
    scenarioTitle: "\u0635\u0639\u0648\u062F \u0627\u0644\u0631\u064A\u0627\u0636 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0648\u0639\u0645\u0627\u0644\u0642\u0629 \u0627\u0644\u062C\u0628\u064A\u0644",
    cityShort: "\u0627\u0644\u0631\u064A\u0627\u0636 \u0648\u0627\u0644\u062C\u0628\u064A\u0644",
    industrialHub: "\u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629 \u0628\u0627\u0644\u0631\u064A\u0627\u0636 \u0648\u0633\u062F\u064A\u0631",
    portHub: "\u0645\u064A\u0646\u0627\u0621 \u062C\u062F\u0629 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A \u0648\u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0645\u0644\u0643 \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0628\u0627\u0644\u062F\u0645\u0627\u0645",
    bankName: "\u0645\u0635\u0631\u0641 \u0627\u0644\u0631\u0627\u062C\u062D\u064A",
    exchangeName: "\u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629 (\u062A\u062F\u0627\u0648\u0644)",
    inheritedFactoryName: "\u0645\u0635\u0646\u0639 \u0646\u062C\u062F \u0644\u0644\u0623\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u062A\u0645\u0648\u064A\u0646 \xB7 \u0627\u0644\u0631\u064A\u0627\u0636",
    inheritedLandName: "\u0623\u0631\u0636 \u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629 \u0628\u0627\u0644\u0631\u064A\u0627\u0636",
    starterLandOfferName: "\u0623\u0631\u0636 \u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629 \xB7 \u0627\u0644\u0631\u064A\u0627\u0636",
    headline: "\u0645\u0634\u0627\u0631\u064A\u0639 \u0643\u0628\u0631\u0649 \u0648\u062A\u0645\u0648\u064A\u0644 \u0642\u0648\u064A \u0648\u0637\u0644\u0628 \u0645\u062A\u0633\u0627\u0631\u0639 \u0639\u0644\u0649 \u0627\u0644\u062A\u0645\u0648\u064A\u0646 \u0648\u0645\u0648\u0627\u062F \u0627\u0644\u0628\u0646\u0627\u0621 \u0648\u0627\u0644\u0637\u0627\u0642\u0629.",
    strengths: [
      "\u0642\u0648\u0629 \u0634\u0631\u0627\u0626\u064A\u0629 \u0639\u0627\u0644\u064A\u0629 \u0648\u0639\u0642\u0648\u062F \u062A\u0648\u0631\u064A\u062F \u0636\u062E\u0645\u0629 \u0644\u0644\u0645\u062F\u0646 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0648\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0643\u0628\u0631\u0649",
      "\u0631\u0633\u0648\u0645 \u062A\u0623\u0633\u064A\u0633 \u0634\u0631\u0643\u0627\u062A \u062A\u0646\u0627\u0641\u0633\u064A\u0629 (2,000 $) \u0648\u0628\u0646\u064A\u0629 \u0644\u0648\u062C\u0633\u062A\u064A\u0629 \u062D\u062F\u064A\u062B\u0629",
      "\u0641\u0631\u0635 \u062A\u0648\u0633\u0639 \u0635\u0646\u0627\u0639\u064A \u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A\u0629 \u0641\u064A \u0627\u0644\u062C\u0628\u064A\u0644 \u0648\u0633\u062F\u064A\u0631 \u0648\u0627\u0644\u062F\u0645\u0627\u0645"
    ],
    challenges: [
      "\u0636\u0631\u064A\u0628\u0629 \u0642\u064A\u0645\u0629 \u0645\u0636\u0627\u0641\u0629 15% \u062A\u062A\u0637\u0644\u0628 \u0625\u062F\u0627\u0631\u0629 \u062F\u0642\u064A\u0642\u0629 \u0644\u0647\u0648\u0627\u0645\u0634 \u0631\u0628\u062D \u0627\u0644\u0639\u0642\u0648\u062F",
      "\u0645\u0635\u0646\u0639 \u0646\u062C\u062F \u0627\u0644\u0645\u0648\u0631\u0648\u062B \u0645\u062A\u0647\u0627\u0644\u0643 (25%) \u0648\u0639\u0644\u064A\u0647 \u0642\u0633\u0637 5,250 $ \u0644\u062F\u0649 \u0645\u0635\u0631\u0641 \u0627\u0644\u0631\u0627\u062C\u062D\u064A"
    ],
    signatureSectors: ["\u0627\u0644\u0628\u062A\u0631\u0648\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A \u0648\u0627\u0644\u0637\u0627\u0642\u0629", "\u0645\u0648\u0627\u062F \u0627\u0644\u0628\u0646\u0627\u0621 \u0648\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639", "\u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u062A\u0645\u0648\u064A\u0646"],
    strategicTip: "\u0631\u0643\u0632 \u0639\u0644\u0649 \u0639\u0642\u0648\u062F \u0627\u0644\u062C\u0645\u0644\u0629 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0644\u062A\u0639\u0648\u064A\u0636 \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0640 15% \u0648\u0628\u0646\u0627\u0621 \u0633\u064A\u0648\u0644\u0629 \u0633\u0631\u064A\u0639\u0629.",
    elder: { name: "\u0627\u0644\u0634\u064A\u062E \u0639\u0628\u062F\u0627\u0644\u0639\u0632\u064A\u0632 \u0627\u0644\u0633\u062F\u064A\u0631\u064A", title: "\u0645\u0633\u062A\u0634\u0627\u0631 \u0645\u062C\u0644\u0633 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0628\u0627\u0644\u0631\u064A\u0627\u0636", initials: "\u0639\u0633" },
    operations: { name: "\u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u0641\u0647\u062F \u0627\u0644\u0642\u062D\u0637\u0627\u0646\u064A", title: "\u0645\u062F\u064A\u0631 \u062A\u0634\u063A\u064A\u0644 \u0645\u062F\u0646 \u0633\u062F\u064A\u0631 \u0648\u0627\u0644\u0631\u064A\u0627\u0636", initials: "\u0641\u0642" },
    finance: { name: "\u0623. \u0646\u0648\u0631\u0629 \u0627\u0644\u0639\u0644\u064A\u0627\u0646", title: "\u062E\u0628\u064A\u0631\u0629 \u0627\u0644\u062A\u0645\u0648\u064A\u0644 \u0648\u0633\u0648\u0642 \u062A\u062F\u0627\u0648\u0644", initials: "\u0646\u0639" },
    logistics: { name: "\u0627\u0644\u0643\u0627\u0628\u062A\u0646 \u0628\u0646\u062F\u0631 \u0627\u0644\u062D\u0631\u0628\u064A", title: "\u0645\u062F\u064A\u0631 \u0625\u0645\u062F\u0627\u062F\u0627\u062A \u062C\u062F\u0629 \u0648\u0627\u0644\u062F\u0645\u0627\u0645", initials: "\u0628\u062D" },
    rivals: [
      { id: "sa-rival-1", name: "\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u064A\u0645\u0627\u0645\u0629 \u0644\u0644\u062A\u0639\u0645\u064A\u0631", avatar: "\u{1F3D7}\uFE0F", activeSector: "\u0627\u0644\u0645\u0642\u0627\u0648\u0644\u0627\u062A \u0648\u0645\u0648\u0627\u062F \u0627\u0644\u0628\u0646\u0627\u0621", netWorth: 185e4 },
      { id: "sa-rival-2", name: "\u0634\u0631\u0643\u0629 \u0627\u0644\u062E\u0644\u064A\u062C \u0644\u0644\u0628\u062A\u0631\u0648\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A", avatar: "\u26FD", activeSector: "\u0627\u0644\u0637\u0627\u0642\u0629 \u0648\u062A\u0643\u0631\u064A\u0631 \u0627\u0644\u062C\u0628\u064A\u0644", netWorth: 34e5 },
      { id: "sa-rival-3", name: "\u062A\u0643\u062A\u0644 \u0646\u062C\u062F \u0627\u0644\u0642\u0627\u0628\u0636\u0629 \u0644\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631", avatar: "\u{1F451}", activeSector: "\u0627\u0644\u062A\u0645\u0648\u064A\u0644 \u0648\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0639\u0645\u0644\u0627\u0642\u0629", netWorth: 61e5 }
    ],
    clients: [
      { name: "\u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u062A\u0645\u0648\u064A\u0646 \u0627\u0644\u0645\u0631\u0643\u0632\u064A\u0629 \u0628\u0627\u0644\u0631\u064A\u0627\u0636", type: "budget", multiplier: 0.94, minimumQuality: 0, description: "\u0637\u0644\u0628\u064A\u0627\u062A \u064A\u0648\u0645\u064A\u0629 \u0633\u0631\u064A\u0639\u0629 \u0627\u0644\u062F\u0648\u0631\u0627\u0646 \u0644\u0645\u062A\u0627\u062C\u0631 \u0627\u0644\u062A\u062C\u0632\u0626\u0629 \u0641\u064A \u0627\u0644\u0639\u0627\u0635\u0645\u0629." },
      { name: "\u0645\u0646\u062A\u062C\u0639\u0627\u062A \u0648\u0641\u0646\u0627\u062F\u0642 \u0627\u0644\u0628\u062D\u0631 \u0627\u0644\u0623\u062D\u0645\u0631", type: "quality", multiplier: 1.2, minimumQuality: 90, description: "\u062A\u0634\u062A\u0631\u0637 \u0645\u0639\u0627\u064A\u064A\u0631 \u062C\u0648\u062F\u0629 \u0641\u0627\u062E\u0631\u0629 \u0645\u0642\u0627\u0628\u0644 \u0623\u0633\u0639\u0627\u0631 \u0645\u062C\u0632\u064A\u0629." },
      { name: "\u0645\u0631\u0627\u0643\u0632 \u0625\u0645\u062F\u0627\u062F \u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u062C\u0628\u064A\u0644 \u0648\u0633\u062F\u064A\u0631", type: "bulk", multiplier: 1.06, minimumQuality: 75, description: "\u0639\u0642\u0648\u062F \u062A\u0648\u0631\u064A\u062F \u0628\u0643\u0645\u064A\u0627\u062A \u0643\u0628\u064A\u0631\u0629 \u0644\u062A\u063A\u0630\u064A\u0629 \u0627\u0644\u0645\u062F\u0646 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629." },
      { name: "\u062A\u0645\u0648\u064A\u0646 \u0645\u062D\u0637\u0627\u062A \u0645\u064A\u0646\u0627\u0621 \u062C\u062F\u0629 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A", type: "urgent", multiplier: 1.28, minimumQuality: 70, description: "\u062A\u0648\u0631\u064A\u062F \u0641\u0648\u0631\u064A \u0628\u0645\u0647\u0644\u0629 \u0642\u0635\u064A\u0631\u0629 \u0648\u0639\u0644\u0627\u0648\u0629 \u0627\u0644\u062A\u0632\u0627\u0645 \u0639\u0627\u0644\u064A\u0629." }
    ]
  },
  uae: {
    countryId: "uae",
    scenarioTitle: "\u0628\u0648\u0627\u0628\u0629 \u062C\u0628\u0644 \u0639\u0644\u064A \u0648\u0623\u0628\u0631\u0627\u062C \u0627\u0644\u0645\u0627\u0644 \u0641\u064A \u062F\u0628\u064A \u0648\u0623\u0628\u0648\u0638\u0628\u064A",
    cityShort: "\u062F\u0628\u064A \u0648\u0623\u0628\u0648\u0638\u0628\u064A",
    industrialHub: "\u0645\u0646\u0637\u0642\u0629 \u062C\u0628\u0644 \u0639\u0644\u064A \u0627\u0644\u062D\u0631\u0629 (JAFZA) \u0648\u0643\u064A\u0632\u0627\u062F",
    portHub: "\u0645\u064A\u0646\u0627\u0621 \u062C\u0628\u0644 \u0639\u0644\u064A \u0627\u0644\u0639\u0627\u0644\u0645\u064A \u0648\u0645\u0648\u0627\u0646\u0626 \u0623\u0628\u0648\u0638\u0628\u064A",
    bankName: "\u0628\u0646\u0643 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A \u062F\u0628\u064A \u0627\u0644\u0648\u0637\u0646\u064A",
    exchangeName: "\u0633\u0648\u0642 \u062F\u0628\u064A \u0627\u0644\u0645\u0627\u0644\u064A \u0648\u0633\u0648\u0642 \u0623\u0628\u0648\u0638\u0628\u064A ADX",
    inheritedFactoryName: "\u0645\u0635\u0646\u0639 \u062F\u0628\u064A \u0644\u0644\u0623\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u0636\u064A\u0627\u0641\u0629 \xB7 \u062C\u0628\u0644 \u0639\u0644\u064A",
    inheritedLandName: "\u0623\u0631\u0636 \u0645\u0646\u0637\u0642\u0629 \u062C\u0628\u0644 \u0639\u0644\u064A \u0627\u0644\u062D\u0631\u0629 JAFZA \u0628\u062F\u0628\u064A",
    starterLandOfferName: "\u0645\u062C\u0645\u0639 \u0645\u0646\u0637\u0642\u0629 \u062C\u0628\u0644 \u0639\u0644\u064A \u0627\u0644\u062D\u0631\u0629 (JAFZA) \xB7 \u062F\u0628\u064A",
    headline: "\u0623\u0642\u0644 \u0636\u0631\u064A\u0628\u0629 \u0634\u0631\u0643\u0627\u062A (9%) \u0648\u0645\u0631\u0643\u0632 \u0625\u0639\u0627\u062F\u0629 \u062A\u0635\u062F\u064A\u0631 \u0639\u0627\u0644\u0645\u064A \u064A\u0631\u0628\u0637 \u0627\u0644\u0634\u0631\u0642 \u0628\u0627\u0644\u063A\u0631\u0628.",
    strengths: [
      "\u0636\u0631\u064A\u0628\u0629 \u0645\u0646\u062E\u0641\u0636\u0629 \u062C\u062F\u0627\u064B (9%) \u062A\u0645\u0646\u062D\u0643 \u0635\u0627\u0641\u064A \u0631\u0628\u062D \u0623\u0639\u0644\u0649 \u0641\u064A \u0643\u0644 \u0639\u0645\u0644\u064A\u0629 \u0628\u064A\u0639 \u0648\u0639\u0642\u062F",
      "\u0645\u0646\u0637\u0642\u0629 \u062D\u0631\u0629 \u0639\u0627\u0644\u0645\u064A\u0629 \u0641\u064A \u062C\u0628\u0644 \u0639\u0644\u064A \u0648\u0643\u064A\u0632\u0627\u062F \u062A\u0633\u0631\u0651\u0639 \u062D\u0631\u0643\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0648\u0627\u0644\u0634\u062D\u0646",
      "\u0628\u064A\u0626\u0629 \u0645\u062B\u0627\u0644\u064A\u0629 \u0644\u0644\u062A\u0648\u0633\u0639 \u0641\u064A \u0627\u0644\u0636\u064A\u0627\u0641\u0629 \u0648\u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0648\u0627\u0644\u0623\u0633\u0647\u0645 \u0627\u0644\u0639\u0642\u0627\u0631\u064A\u0629"
    ],
    challenges: [
      "\u062A\u0643\u0644\u0641\u0629 \u062A\u0623\u0633\u064A\u0633 \u0648\u062A\u0634\u063A\u064A\u0644 \u0623\u0639\u0644\u0649 \u0646\u0633\u0628\u064A\u0627\u064B (1.10x) \u062A\u062A\u0637\u0644\u0628 \u0639\u062F\u0645 \u062A\u0631\u0643 \u0627\u0644\u0645\u0635\u0627\u0646\u0639 \u062E\u0627\u0645\u0644\u0629",
      "\u0645\u0635\u0646\u0639 \u062C\u0628\u0644 \u0639\u0644\u064A \u0627\u0644\u0645\u0648\u0631\u0648\u062B \u064A\u062D\u062A\u0627\u062C \u0635\u064A\u0627\u0646\u0629 \u0639\u0627\u062C\u0644\u0629 \u0648\u0642\u0631\u0636 5,250 $ \u064A\u0642\u062A\u0631\u0628 \u0645\u0646 \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642"
    ],
    signatureSectors: ["\u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0648\u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u062D\u0631\u0629", "\u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u0636\u064A\u0627\u0641\u0629", "\u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0646\u0638\u064A\u0641\u0629 \u0648\u0627\u0644\u0639\u0642\u0627\u0631"],
    strategicTip: "\u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0640 9% \u062A\u062C\u0639\u0644 \u0643\u0644 \u0639\u0642\u062F \u0645\u0643\u062A\u0645\u0644 \u0641\u064A \u062F\u0628\u064A \u0623\u0643\u062B\u0631 \u0631\u0628\u062D\u064A\u0629\u061B \u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u062F\u0648\u0631\u0627\u0646 \u0645\u0633\u062A\u0645\u0631 \u0644\u0644\u0645\u062E\u0632\u0648\u0646.",
    elder: { name: "\u0631\u0627\u0634\u062F \u0628\u0646 \u0645\u0627\u062C\u062F \u0627\u0644\u0641\u0644\u0627\u0633\u064A", title: "\u062D\u0643\u064A\u0645 \u0627\u0644\u062A\u062C\u0627\u0631 \u0641\u064A \u062E\u0648\u0631 \u062F\u0628\u064A \u0648\u062C\u0628\u0644 \u0639\u0644\u064A", initials: "\u0631\u0641" },
    operations: { name: "\u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u062D\u0645\u062F\u0627\u0646 \u0627\u0644\u0645\u0632\u0631\u0648\u0639\u064A", title: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0641\u064A JAFZA", initials: "\u062D\u0645" },
    finance: { name: "\u0645\u0631\u064A\u0645 \u0627\u0644\u0633\u0648\u064A\u062F\u064A", title: "\u0645\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0645\u0635\u0627\u0631\u0641 \u0648\u0633\u0648\u0642 \u062F\u0628\u064A \u0627\u0644\u0645\u0627\u0644\u064A", initials: "\u0645\u0633" },
    logistics: { name: "\u0627\u0644\u0642\u0628\u0637\u0627\u0646 \u0633\u0644\u0637\u0627\u0646 \u0627\u0644\u0634\u0627\u0645\u0633\u064A", title: "\u0645\u062F\u064A\u0631 \u062E\u0637\u0648\u0637 \u0627\u0644\u0634\u062D\u0646 \u0628\u0645\u0648\u0627\u0646\u0626 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A", initials: "\u0633\u0634" },
    rivals: [
      { id: "ae-rival-1", name: "\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u0645\u062F\u0627\u0631 \u0644\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u062D\u0631\u0629", avatar: "\u{1F3D9}\uFE0F", activeSector: "\u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0648\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u062F\u0648\u0644\u064A", netWorth: 21e5 },
      { id: "ae-rival-2", name: "\u062A\u0643\u062A\u0644 \u0627\u0644\u062E\u0644\u064A\u062C \u0644\u0644\u0636\u064A\u0627\u0641\u0629 \u0648\u0627\u0644\u062A\u0645\u0648\u064A\u0646", avatar: "\u2728", activeSector: "\u062A\u0645\u0648\u064A\u0646 \u0627\u0644\u0641\u0646\u0627\u062F\u0642 \u0648\u0627\u0644\u0637\u064A\u0631\u0627\u0646", netWorth: 36e5 },
      { id: "ae-rival-3", name: "\u0642\u0627\u0628\u0636\u0629 \u0623\u0628\u0631\u0627\u062C \u0627\u0644\u0645\u0627\u0631\u064A\u0646\u0627 \u0627\u0644\u0645\u0627\u0644\u064A\u0629", avatar: "\u{1F48E}", activeSector: "\u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0627\u0644\u0641\u0627\u062E\u0631\u0629", netWorth: 68e5 }
    ],
    clients: [
      { name: "\u0645\u0631\u0627\u0643\u0632 \u062A\u0633\u0648\u0642 \u0627\u0644\u062F\u064A\u0631\u0629 \u0648\u0627\u0644\u0634\u0627\u0631\u0642\u0629", type: "budget", multiplier: 0.94, minimumQuality: 0, description: "\u0633\u062D\u0628 \u0645\u0633\u062A\u0645\u0631 \u0644\u0644\u0633\u0644\u0639 \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A\u0629 \u0628\u0623\u0633\u0639\u0627\u0631 \u062A\u0646\u0627\u0641\u0633\u064A\u0629." },
      { name: "\u0623\u0628\u0631\u0627\u062C \u0627\u0644\u0636\u064A\u0627\u0641\u0629 \u0648\u0627\u0644\u0637\u064A\u0631\u0627\u0646 \u0628\u062F\u0628\u064A", type: "quality", multiplier: 1.2, minimumQuality: 90, description: "\u0639\u0642\u0648\u062F \u0645\u0631\u0645\u0648\u0642\u0629 \u062A\u062A\u0637\u0644\u0628 \u062C\u0648\u062F\u0629 \u0641\u0627\u0626\u0642\u0629 \u0648\u0627\u0644\u062A\u0632\u0627\u0645\u0627\u064B \u0635\u0627\u0631\u0645\u0627\u064B." },
      { name: "\u0645\u0633\u062A\u0648\u062F\u0639\u0627\u062A \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0641\u064A \u062C\u0628\u0644 \u0639\u0644\u064A", type: "bulk", multiplier: 1.06, minimumQuality: 75, description: "\u0634\u062D\u0646\u0627\u062A \u062C\u0645\u0644\u0629 \u0636\u062E\u0645\u0629 \u0645\u0648\u062C\u0647\u0629 \u0644\u0644\u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A\u0629." },
      { name: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0625\u0645\u062F\u0627\u062F \u0627\u0644\u0633\u0631\u064A\u0639 \u0628\u0645\u064A\u0646\u0627\u0621 \u0643\u064A\u0632\u0627\u062F", type: "urgent", multiplier: 1.29, minimumQuality: 70, description: "\u0637\u0644\u0628\u064A\u0629 \u0634\u062D\u0646 \u0639\u0627\u062C\u0644\u0629 \u0628\u0639\u0627\u0626\u062F \u0645\u0645\u062A\u0627\u0632 \u0644\u0645\u0646 \u064A\u0645\u0644\u0643 \u0645\u062E\u0632\u0648\u0646\u0627\u064B \u062C\u0627\u0647\u0632\u0627\u064B." }
    ]
  },
  usa: {
    countryId: "usa",
    scenarioTitle: "\u0645\u0639\u0631\u0643\u0629 \u0648\u0648\u0644 \u0633\u062A\u0631\u064A\u062A \u0648\u0627\u0644\u0645\u062C\u0645\u0639\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u0623\u0645\u0631\u064A\u0643\u064A\u0629",
    cityShort: "\u0646\u064A\u0648\u064A\u0648\u0631\u0643 \u0648\u0647\u064A\u0648\u0633\u062A\u0646",
    industrialHub: "\u0645\u062C\u0645\u0639 \u0643\u0648\u064A\u0646\u0632 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0648\u0645\u0645\u0631 \u0627\u0644\u0637\u0627\u0642\u0629 \u0628\u0647\u064A\u0648\u0633\u062A\u0646",
    portHub: "\u0645\u0648\u0627\u0646\u0626 \u0646\u064A\u0648\u064A\u0648\u0631\u0643 \u0648\u0634\u064A\u0643\u0627\u063A\u0648 \u0648\u0645\u064A\u0627\u0645\u064A",
    bankName: "\u062C\u064A \u0628\u064A \u0645\u0648\u0631\u063A\u0627\u0646 \u062A\u0634\u064A\u0633",
    exchangeName: "\u0628\u0648\u0631\u0635\u0629 \u0646\u064A\u0648\u064A\u0648\u0631\u0643 Wall Street (NYSE)",
    inheritedFactoryName: "\u0645\u0635\u0646\u0639 \u0645\u0627\u0646\u0647\u0627\u062A\u0646 \u0644\u0644\u0633\u0644\u0639 \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \xB7 \u0646\u064A\u0648\u064A\u0648\u0631\u0643",
    inheritedLandName: "\u0623\u0631\u0636 \u0645\u062C\u0645\u0639 \u0643\u0648\u064A\u0646\u0632 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0648\u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A \xB7 \u0646\u064A\u0648\u064A\u0648\u0631\u0643",
    starterLandOfferName: "\u0645\u062C\u0645\u0639 \u0643\u0648\u064A\u0646\u0632 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0648\u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A \xB7 \u0646\u064A\u0648\u064A\u0648\u0631\u0643",
    headline: "\u0623\u0643\u0628\u0631 \u0633\u0648\u0642 \u0645\u0627\u0644\u064A \u0648\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A \u0641\u064A \u0627\u0644\u0639\u0627\u0644\u0645 \u0628\u0645\u0646\u0627\u0641\u0633\u0629 \u0634\u0631\u0633\u0629 \u0648\u0639\u0648\u0627\u0626\u062F \u0636\u062E\u0645\u0629 \u0644\u0644\u0623\u0643\u0641\u0623.",
    strengths: [
      "\u0623\u0639\u0645\u0642 \u0633\u0648\u0642 \u0623\u0633\u0647\u0645 \u0648\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u062C\u0631\u064A\u0621 (VC) \u0648\u0634\u0631\u0643\u0627\u062A \u0646\u0627\u0634\u0626\u0629 \u0641\u064A \u0645\u0631\u0627\u062D\u0644 \u0627\u0644\u062A\u0648\u0633\u0639",
      "\u062A\u0646\u0648\u0639 \u0647\u0627\u0626\u0644 \u0628\u064A\u0646 \u0632\u0631\u0627\u0639\u0629 \u0643\u0627\u0644\u064A\u0641\u0648\u0631\u0646\u064A\u0627 \u0648\u0637\u0627\u0642\u0629 \u062A\u0643\u0633\u0627\u0633 \u0648\u062A\u0642\u0646\u064A\u0629 \u0648\u0627\u062F\u064A \u0627\u0644\u0633\u064A\u0644\u064A\u0643\u0648\u0646",
      "\u0639\u0642\u0648\u062F \u0634\u0631\u0643\u0627\u062A \u0643\u0628\u0631\u0649 \u062A\u0631\u0641\u0639 \u0633\u0645\u0639\u062A\u0643 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0628\u0633\u0631\u0639\u0629 \u0639\u0646\u062F \u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 \u0628\u0627\u0644\u062C\u0648\u062F\u0629"
    ],
    challenges: [
      "\u0623\u0639\u0644\u0649 \u0636\u0631\u064A\u0628\u0629 \u0634\u0631\u0643\u0627\u062A (21%) \u0648\u062A\u0643\u0644\u0641\u0629 \u062A\u0634\u063A\u064A\u0644 \u0645\u0631\u062A\u0641\u0639\u0629 (1.15x) \u062A\u0639\u0627\u0642\u0628 \u0633\u0648\u0621 \u0627\u0644\u0625\u062F\u0627\u0631\u0629",
      "\u0627\u0644\u062A\u0632\u0627\u0645 \u0627\u0626\u062A\u0645\u0627\u0646\u064A \u0645\u0648\u0631\u0648\u062B \u0628\u0640 5,250 $ \u0644\u062F\u0649 \u062C\u064A \u0628\u064A \u0645\u0648\u0631\u063A\u0627\u0646 \u062A\u0634\u064A\u0633 \u0648\u0645\u0635\u0646\u0639 \u0645\u062A\u0639\u062B\u0631 \u0628\u0643\u0648\u064A\u0646\u0632"
    ],
    signatureSectors: ["\u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A \u0648\u0648\u0627\u062F\u064A \u0627\u0644\u0633\u064A\u0644\u064A\u0643\u0648\u0646", "\u0627\u0644\u0637\u0627\u0642\u0629 \u0648\u0627\u0644\u0646\u0641\u0637 (\u062A\u0643\u0633\u0627\u0633)", "\u0627\u0644\u0633\u0644\u0639 \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A\u0629 \u0648\u0627\u0644\u062A\u0645\u0648\u064A\u0644"],
    strategicTip: "\u0641\u064A \u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0623\u0645\u0631\u064A\u0643\u064A \u0644\u0627 \u0645\u062C\u0627\u0644 \u0644\u0644\u0647\u062F\u0631: \u0639\u064A\u0651\u0646 \u0645\u062D\u0627\u0633\u0628\u0627\u064B \u0648\u0645\u062F\u064A\u0631\u0627\u064B \u0641\u0648\u0631 \u0641\u062A\u062D \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646 \u0644\u062A\u062E\u0641\u064A\u0641 \u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0648\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u062A\u0634\u063A\u064A\u0644.",
    elder: { name: "\u0622\u0631\u062B\u0631 \u0641\u0627\u0646\u062F\u0631\u0628\u064A\u0644\u062A", title: "\u0627\u0644\u0645\u0633\u062A\u0634\u0627\u0631 \u0627\u0644\u0645\u062E\u0636\u0631\u0645 \u0641\u064A \u0645\u0627\u0646\u0647\u0627\u062A\u0646", initials: "\u0623\u0641" },
    operations: { name: "\u0645\u0627\u0631\u0643\u0648\u0633 \u0631\u064A\u0646\u0648\u0644\u062F\u0632", title: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0647\u0646\u062F\u0633\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0628\u0643\u0648\u064A\u0646\u0632", initials: "\u0645\u0631" },
    finance: { name: "\u0625\u064A\u0644\u064A\u0646\u0627 \u0633\u062A\u064A\u0631\u0644\u0646\u063A", title: "\u0645\u062D\u0644\u0644\u0629 \u0627\u0644\u0627\u0626\u062A\u0645\u0627\u0646 \u0641\u064A \u0648\u0648\u0644 \u0633\u062A\u0631\u064A\u062A", initials: "\u0625\u0633" },
    logistics: { name: "\u0627\u0644\u0643\u0627\u0628\u062A\u0646 \u062C\u0627\u0643 \u0647\u0627\u0631\u0628\u0631", title: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0623\u0637\u0644\u0633\u064A \u0648\u0633\u0644\u0627\u0633\u0644 \u0627\u0644\u0625\u0645\u062F\u0627\u062F", initials: "\u062C\u0647" },
    rivals: [
      { id: "us-rival-1", name: "\u062A\u0643\u062A\u0644 \u0623\u0637\u0644\u0633 \u0644\u0644\u0635\u0646\u0627\u0639\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A\u0629", avatar: "\u{1F985}", activeSector: "\u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0648\u0633\u0644\u0627\u0633\u0644 \u0627\u0644\u062A\u0648\u0632\u064A\u0639", netWorth: 26e5 },
      { id: "us-rival-2", name: "\u0647\u064A\u0648\u0633\u062A\u0646 \u062A\u0643\u0633\u0627\u0633 \u0644\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0642\u0627\u0628\u0636\u0629", avatar: "\u{1F6E2}\uFE0F", activeSector: "\u0627\u0644\u0646\u0641\u0637 \u0648\u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621 \u0627\u0644\u062B\u0642\u064A\u0644\u0629", netWorth: 45e5 },
      { id: "us-rival-3", name: "\u0648\u0648\u0644 \u0633\u062A\u0631\u064A\u062A \u0643\u0627\u0628\u064A\u062A\u0627\u0644 \u0628\u0627\u0631\u062A\u0646\u0631\u0632", avatar: "\u{1F4C8}", activeSector: "\u0627\u0644\u0628\u0648\u0631\u0635\u0629 \u0648\u0635\u0646\u0627\u062F\u064A\u0642 \u0627\u0644\u0640 VC", netWorth: 89e5 }
    ],
    clients: [
      { name: "\u0645\u062A\u0627\u062C\u0631 \u0645\u062A\u0631\u0648 \u0643\u0648\u064A\u0646\u0632 \u0627\u0644\u062A\u0648\u0641\u064A\u0631\u064A\u0629", type: "budget", multiplier: 0.93, minimumQuality: 0, description: "\u0637\u0644\u0628\u064A\u0627\u062A \u0645\u0633\u062A\u0645\u0631\u0629 \u0644\u0644\u0623\u062D\u064A\u0627\u0621 \u0627\u0644\u0633\u0643\u0646\u064A\u0629 \u0641\u064A \u0646\u064A\u0648\u064A\u0648\u0631\u0643." },
      { name: "\u0633\u0644\u0633\u0644\u0629 \u0645\u062A\u0627\u062C\u0631 \u0645\u0627\u0646\u0647\u0627\u062A\u0646 \u0627\u0644\u0639\u0636\u0648\u064A\u0629 \u0627\u0644\u0641\u0627\u062E\u0631\u0629", type: "quality", multiplier: 1.22, minimumQuality: 92, description: "\u062A\u062F\u0641\u0639 \u0628\u0633\u062E\u0627\u0621 \u0645\u0642\u0627\u0628\u0644 \u0623\u0639\u0644\u0649 \u062F\u0631\u062C\u0627\u062A \u0627\u0644\u062C\u0648\u062F\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629." },
      { name: "\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0641\u064A\u062F\u0631\u0627\u0644\u064A\u0629 \u0628\u0634\u064A\u0643\u0627\u063A\u0648", type: "bulk", multiplier: 1.07, minimumQuality: 75, description: "\u0639\u0642\u0648\u062F \u062A\u0648\u0631\u064A\u062F \u0642\u0627\u0631\u064A\u0629 \u0628\u0643\u0645\u064A\u0627\u062A \u0643\u0628\u064A\u0631\u0629." },
      { name: "\u0625\u0645\u062F\u0627\u062F \u0645\u0648\u0627\u0646\u0626 \u0627\u0644\u0633\u0627\u062D\u0644 \u0627\u0644\u0634\u0631\u0642\u064A \u0627\u0644\u0639\u0627\u062C\u0644", type: "urgent", multiplier: 1.3, minimumQuality: 72, description: "\u0634\u062D\u0646\u0629 \u0633\u0631\u064A\u0639\u0629 \u0628\u062C\u062F\u0648\u0644 \u0632\u0645\u0646\u064A \u0635\u0627\u0631\u0645 \u0648\u0645\u0643\u0627\u0641\u0623\u0629 \u0641\u0648\u0631\u064A\u0629." }
    ]
  },
  kuwait: {
    countryId: "kuwait",
    scenarioTitle: "\u0639\u0648\u062F\u0629 \u0627\u0644\u0647\u064A\u0628\u0629 \u0645\u0646 \u0627\u0644\u0634\u0648\u064A\u062E \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0625\u0644\u0649 \u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0623\u062D\u0645\u062F\u064A",
    cityShort: "\u0627\u0644\u0643\u0648\u064A\u062A \u0648\u0627\u0644\u0634\u0648\u064A\u062E",
    industrialHub: "\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0634\u0648\u064A\u062E \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0648\u0635\u0628\u062D\u0627\u0646",
    portHub: "\u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0634\u0648\u064A\u062E \u0648\u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0623\u062D\u0645\u062F\u064A \u0627\u0644\u0646\u0641\u0637\u064A",
    bankName: "\u0628\u0646\u0643 \u0627\u0644\u0643\u0648\u064A\u062A \u0627\u0644\u0648\u0637\u0646\u064A",
    exchangeName: "\u0628\u0648\u0631\u0635\u0629 \u0627\u0644\u0643\u0648\u064A\u062A \u0644\u0644\u0645\u0627\u0644 \u0648\u0627\u0644\u0623\u0639\u0645\u0627\u0644",
    inheritedFactoryName: "\u0645\u0635\u0646\u0639 \u0627\u0644\u062F\u064A\u0631\u0629 \u0644\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \xB7 \u0627\u0644\u0634\u0648\u064A\u062E",
    inheritedLandName: "\u0623\u0631\u0636 \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0634\u0648\u064A\u062E \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \xB7 \u0627\u0644\u0639\u0627\u0635\u0645\u0629",
    starterLandOfferName: "\u0623\u0631\u0636 \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0634\u0648\u064A\u062E \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \xB7 \u0627\u0644\u0639\u0627\u0635\u0645\u0629",
    headline: "\u062A\u0627\u0631\u064A\u062E \u062A\u062C\u0627\u0631\u064A \u0639\u0631\u064A\u0642 \u0648\u0633\u064A\u0648\u0644\u0629 \u0646\u0641\u0637\u064A\u0629 \u0648\u0645\u0635\u0631\u0641\u064A\u0629 \u062A\u062F\u0639\u0645 \u0627\u0644\u062A\u0627\u062C\u0631 \u0627\u0644\u0645\u0644\u062A\u0632\u0645 \u0628\u0633\u0645\u0639\u062A\u0647.",
    strengths: [
      "\u0631\u0633\u0648\u0645 \u062A\u0623\u0633\u064A\u0633 \u0634\u0631\u0643\u0627\u062A \u0645\u0639\u062A\u062F\u0644\u0629 (2,000 $) \u0648\u062A\u0643\u0644\u0641\u0629 \u062A\u0634\u063A\u064A\u0644 \u0645\u062A\u0648\u0627\u0632\u0646\u0629 (1.05x)",
      "\u0642\u0631\u0628 \u0627\u0644\u0645\u062C\u0645\u0639\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0641\u064A \u0627\u0644\u0634\u0648\u064A\u062E \u0648\u0635\u0628\u062D\u0627\u0646 \u0645\u0646 \u0645\u0648\u0627\u0646\u0626 \u0627\u0644\u062A\u0635\u062F\u064A\u0631",
      "\u0641\u0631\u0635 \u0645\u0645\u062A\u0627\u0632\u0629 \u0641\u064A \u0642\u0637\u0627\u0639\u0627\u062A \u0627\u0644\u0637\u0627\u0642\u0629 \u0648\u0627\u0644\u062A\u0645\u0648\u064A\u0646 \u0627\u0644\u063A\u0630\u0627\u0626\u064A \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629"
    ],
    challenges: [
      "\u0645\u0646\u0627\u0641\u0633\u0629 \u0642\u0648\u064A\u0629 \u0645\u0646 \u0627\u0644\u062A\u0643\u062A\u0644\u0627\u062A \u0627\u0644\u0639\u0627\u0626\u0644\u064A\u0629 \u0627\u0644\u0643\u0628\u0631\u0649 \u0641\u064A \u0627\u0644\u0645\u0632\u0627\u062F\u0627\u062A \u0648\u0627\u0644\u0639\u0642\u0648\u062F",
      "\u0645\u0635\u0646\u0639 \u0627\u0644\u062F\u064A\u0631\u0629 \u0627\u0644\u0645\u0648\u0631\u0648\u062B \u0628\u062D\u0627\u062C\u0629 \u0644\u0625\u0635\u0644\u0627\u062D \u0641\u0648\u0631\u064A \u0645\u0639 \u0642\u0631\u0636 \u0645\u0633\u062A\u062D\u0642 \u0644\u0628\u0646\u0643 \u0627\u0644\u0643\u0648\u064A\u062A \u0627\u0644\u0648\u0637\u0646\u064A"
    ],
    signatureSectors: ["\u0627\u0644\u0646\u0641\u0637 \u0648\u062A\u0643\u0631\u064A\u0631 \u0627\u0644\u0623\u062D\u0645\u062F\u064A", "\u0627\u0644\u0635\u0646\u0627\u0639\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \u0648\u0627\u0644\u062A\u0645\u0648\u064A\u0646", "\u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0628\u062D\u0631\u064A\u0629 \u0648\u0627\u0644\u0645\u0635\u0627\u0631\u0641"],
    strategicTip: "\u0627\u0644\u0633\u0645\u0639\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0641\u064A \u0633\u0648\u0642 \u0627\u0644\u0643\u0648\u064A\u062A \u062A\u0641\u062A\u062D \u0644\u0643 \u0623\u0641\u0636\u0644 \u0627\u0644\u0639\u0642\u0648\u062F\u061B \u0644\u0627 \u062A\u0642\u0628\u0644 \u0639\u0642\u062F\u0627\u064B \u0644\u0627 \u062A\u0636\u0645\u0646 \u062A\u0633\u0644\u064A\u0645\u0647 \u0628\u0627\u0644\u0645\u0648\u0639\u062F.",
    elder: { name: "\u0627\u0644\u0639\u0645 \u062C\u0627\u0633\u0645 \u0627\u0644\u062E\u0631\u0627\u0641\u064A", title: "\u0645\u0633\u062A\u0634\u0627\u0631 \u062F\u064A\u0648\u0627\u0646\u064A\u0629 \u0627\u0644\u062A\u062C\u0627\u0631 \u0628\u0627\u0644\u0639\u0627\u0635\u0645\u0629", initials: "\u062C\u062E" },
    operations: { name: "\u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u0645\u0634\u0627\u0631\u064A \u0627\u0644\u0645\u0637\u064A\u0631\u064A", title: "\u0645\u062F\u064A\u0631 \u062A\u0634\u063A\u064A\u0644 \u0645\u0635\u0627\u0646\u0639 \u0627\u0644\u0634\u0648\u064A\u062E", initials: "\u0645\u0645" },
    finance: { name: "\u062F\u0644\u0627\u0644 \u0627\u0644\u0635\u0642\u0631", title: "\u0645\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0627\u0626\u062A\u0645\u0627\u0646 \u0648\u0628\u0648\u0631\u0635\u0629 \u0627\u0644\u0643\u0648\u064A\u062A", initials: "\u062F\u0635" },
    logistics: { name: "\u0627\u0644\u0646\u0648\u062E\u0630\u0629 \u0628\u062F\u0631 \u0627\u0644\u0639\u0648\u0636\u064A", title: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0645\u0644\u0627\u062D\u0629 \u0648\u0645\u0648\u0627\u0646\u0626 \u0627\u0644\u0634\u0648\u064A\u062E \u0648\u0627\u0644\u0623\u062D\u0645\u062F\u064A", initials: "\u0628\u0639" },
    rivals: [
      { id: "kw-rival-1", name: "\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u062F\u064A\u0631\u0629 \u0644\u0644\u062A\u062C\u0627\u0631\u0629 \u0648\u0627\u0644\u062A\u0645\u0648\u064A\u0646", avatar: "\u{1F3E2}", activeSector: "\u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639\u0627\u062A", netWorth: 17e5 },
      { id: "kw-rival-2", name: "\u0634\u0631\u0643\u0629 \u0628\u0631\u0642\u0627\u0646 \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0646\u0641\u0637\u064A\u0629", avatar: "\u26FD", activeSector: "\u0627\u0644\u0628\u062A\u0631\u0648\u0644 \u0648\u0627\u0644\u0637\u0627\u0642\u0629", netWorth: 325e4 },
      { id: "kw-rival-3", name: "\u062A\u0643\u062A\u0644 \u0627\u0644\u0623\u0628\u0631\u0627\u062C \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631\u064A \u0627\u0644\u0643\u0648\u064A\u062A\u064A", avatar: "\u{1F3E6}", activeSector: "\u0627\u0644\u0628\u0646\u0648\u0643 \u0648\u0627\u0644\u0623\u0633\u0647\u0645 \u0627\u0644\u0639\u0642\u0627\u0631\u064A\u0629", netWorth: 56e5 }
    ],
    clients: [
      { name: "\u0627\u0644\u062C\u0645\u0639\u064A\u0627\u062A \u0627\u0644\u062A\u0639\u0627\u0648\u0646\u064A\u0629 \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A\u0629", type: "budget", multiplier: 0.95, minimumQuality: 0, description: "\u0633\u0648\u0642 \u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A \u0645\u0636\u0645\u0648\u0646 \u0648\u0645\u0633\u062A\u0642\u0631 \u0641\u064A \u0645\u062E\u062A\u0644\u0641 \u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u0643\u0648\u064A\u062A." },
      { name: "\u0641\u0646\u0627\u062F\u0642 \u0648\u0623\u0628\u0631\u0627\u062C \u0627\u0644\u062E\u0644\u064A\u062C \u0628\u0627\u0644\u0639\u0627\u0635\u0645\u0629", type: "quality", multiplier: 1.19, minimumQuality: 90, description: "\u062A\u0648\u0631\u064A\u062F \u0639\u0627\u0644\u064A \u0627\u0644\u062C\u0648\u062F\u0629 \u0644\u0642\u0637\u0627\u0639 \u0627\u0644\u0636\u064A\u0627\u0641\u0629 \u0627\u0644\u0641\u0627\u062E\u0631\u0629." },
      { name: "\u0645\u0633\u062A\u0648\u062F\u0639\u0627\u062A \u0627\u0644\u062C\u0645\u0644\u0629 \u0628\u0627\u0644\u0635\u0644\u064A\u0628\u064A\u0629 \u0648\u0627\u0644\u0634\u0648\u064A\u062E", type: "bulk", multiplier: 1.06, minimumQuality: 75, description: "\u0637\u0644\u0628\u064A\u0627\u062A \u062C\u0645\u0644\u0629 \u0643\u0628\u064A\u0631\u0629 \u0644\u0644\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0645\u062D\u0644\u064A \u0648\u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A." },
      { name: "\u062A\u0645\u0648\u064A\u0646 \u0646\u0627\u0642\u0644\u0627\u062A \u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0623\u062D\u0645\u062F\u064A \u0627\u0644\u0639\u0627\u062C\u0644", type: "urgent", multiplier: 1.28, minimumQuality: 70, description: "\u0639\u0642\u062F \u062A\u0645\u0648\u064A\u0646 \u0633\u0631\u064A\u0639 \u0628\u0639\u0644\u0627\u0648\u0629 \u0646\u0642\u062F\u064A\u0629 \u0648\u0633\u0645\u0639\u0629 \u0645\u0631\u062A\u0641\u0639\u0629." }
    ]
  },
  qatar: {
    countryId: "qatar",
    scenarioTitle: "\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u062F\u0648\u062D\u0629 \u0648\u0639\u0645\u0644\u0627\u0642 \u0627\u0644\u063A\u0627\u0632 \u0641\u064A \u0631\u0623\u0633 \u0644\u0641\u0627\u0646 \u0648\u0645\u064A\u0646\u0627\u0621 \u062D\u0645\u062F",
    cityShort: "\u0627\u0644\u062F\u0648\u062D\u0629 \u0648\u0631\u0623\u0633 \u0644\u0641\u0627\u0646",
    industrialHub: "\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u0628\u0627\u0644\u062F\u0648\u062D\u0629 \u0648\u0631\u0623\u0633 \u0644\u0641\u0627\u0646",
    portHub: "\u0645\u064A\u0646\u0627\u0621 \u062D\u0645\u062F \u0627\u0644\u062F\u0648\u0644\u064A",
    bankName: "\u0628\u0646\u0643 \u0642\u0637\u0631 \u0627\u0644\u0648\u0637\u0646\u064A QNB",
    exchangeName: "\u0628\u0648\u0631\u0635\u0629 \u0642\u0637\u0631 \u0644\u0644\u0623\u0648\u0631\u0627\u0642 \u0627\u0644\u0645\u0627\u0644\u064A\u0629",
    inheritedFactoryName: "\u0645\u0635\u0646\u0639 \u0627\u0644\u062F\u0648\u062D\u0629 \u0644\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629",
    inheritedLandName: "\u0623\u0631\u0636 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u0628\u0627\u0644\u062F\u0648\u062D\u0629",
    starterLandOfferName: "\u0623\u0631\u0636 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \xB7 \u0627\u0644\u062F\u0648\u062D\u0629",
    headline: "\u0636\u0631\u064A\u0628\u0629 \u0645\u0646\u062E\u0641\u0636\u0629 (10%) \u0648\u0628\u0646\u064A\u0629 \u062A\u062D\u062A\u064A\u0629 \u0641\u0627\u0626\u0642\u0629 \u0641\u064A \u0627\u0644\u063A\u0627\u0632 \u0627\u0644\u0637\u0628\u064A\u0639\u064A \u0648\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0628\u062D\u0631\u064A.",
    strengths: [
      "\u0645\u0639\u062F\u0644 \u0636\u0631\u064A\u0628\u064A \u062C\u0627\u0630\u0628 \u0644\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 (10% \u0641\u0642\u0637) \u064A\u0639\u0632\u0632 \u0635\u0627\u0641\u064A \u0623\u0631\u0628\u0627\u062D \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A",
      "\u062A\u0643\u0644\u0641\u0629 \u062A\u0634\u063A\u064A\u0644 \u0645\u0633\u062A\u0642\u0631\u0629 (1.05x) \u0645\u0639 \u062A\u0641\u0648\u0642 \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A \u0641\u064A \u0627\u0644\u063A\u0627\u0632 \u0648\u0627\u0644\u0637\u0627\u0642\u0629",
      "\u0645\u064A\u0646\u0627\u0621 \u062D\u0645\u062F \u0627\u0644\u062F\u0648\u0644\u064A \u064A\u0645\u0646\u062D\u0643 \u0645\u0646\u0635\u0629 \u0645\u062B\u0627\u0644\u064A\u0629 \u0644\u0639\u0642\u0648\u062F \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0648\u0627\u0644\u0645\u0646\u0627\u0642\u0635\u0627\u062A \u0627\u0644\u0643\u0628\u0631\u0649"
    ],
    challenges: [
      "\u062D\u0627\u062C\u0629 \u0639\u0627\u062C\u0644\u0629 \u0644\u0625\u0639\u0627\u062F\u0629 \u062A\u0623\u0647\u064A\u0644 \u0645\u0635\u0646\u0639 \u0627\u0644\u062F\u0648\u062D\u0629 \u0627\u0644\u0645\u0648\u0631\u0648\u062B \u0642\u0628\u0644 \u0646\u0641\u0627\u062F \u0645\u0647\u0644\u0629 \u0627\u0644\u0640 7 \u0623\u064A\u0627\u0645",
      "\u0642\u0631\u0636 \u062A\u0623\u0633\u064A\u0633\u064A \u0628\u0642\u064A\u0645\u0629 5,250 $ \u0645\u0633\u062C\u0644 \u0644\u062F\u0649 \u0628\u0646\u0643 \u0642\u0637\u0631 \u0627\u0644\u0648\u0637\u0646\u064A QNB"
    ],
    signatureSectors: ["\u0627\u0644\u063A\u0627\u0632 \u0627\u0644\u0637\u0628\u064A\u0639\u064A \u0648\u0627\u0644\u0637\u0627\u0642\u0629 (\u0631\u0623\u0633 \u0644\u0641\u0627\u0646)", "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A (\u0645\u064A\u0646\u0627\u0621 \u062D\u0645\u062F)", "\u0627\u0644\u062A\u0639\u0645\u064A\u0631 \u0648\u0627\u0644\u0623\u063A\u0630\u064A\u0629"],
    strategicTip: "\u0627\u0633\u062A\u063A\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0645\u0646\u062E\u0641\u0636\u0629 (10%) \u0644\u0644\u062A\u0648\u0633\u0639 \u0627\u0644\u0645\u0628\u0643\u0631 \u0645\u0646 \u0642\u0637\u0627\u0639 \u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0646\u062D\u0648 \u0627\u0644\u063A\u0627\u0632 \u0648\u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621.",
    elder: { name: "\u0627\u0644\u0634\u064A\u062E \u062D\u0645\u062F \u0628\u0646 \u062C\u0628\u0631 \u0627\u0644\u0643\u0648\u0627\u0631\u064A", title: "\u0643\u0628\u064A\u0631 \u0645\u0633\u062A\u0634\u0627\u0631\u064A \u0645\u062C\u0644\u0633 \u0627\u0644\u062F\u0648\u062D\u0629", initials: "\u062D\u0643" },
    operations: { name: "\u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u062A\u0645\u064A\u0645 \u0627\u0644\u0645\u0647\u0646\u062F\u064A", title: "\u0645\u062F\u064A\u0631 \u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629", initials: "\u062A\u0645" },
    finance: { name: "\u0639\u0627\u0626\u0634\u0629 \u0627\u0644\u0645\u0633\u0646\u062F", title: "\u0645\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0645\u0635\u0627\u0631\u0641 \u0648\u0628\u0648\u0631\u0635\u0629 \u0642\u0637\u0631", initials: "\u0639\u0645" },
    logistics: { name: "\u0627\u0644\u0642\u0628\u0637\u0627\u0646 \u062C\u0627\u0633\u0645 \u0627\u0644\u0633\u0644\u064A\u0637\u064A", title: "\u0645\u062F\u064A\u0631 \u0625\u0645\u062F\u0627\u062F\u0627\u062A \u0645\u064A\u0646\u0627\u0621 \u062D\u0645\u062F \u0627\u0644\u062F\u0648\u0644\u064A", initials: "\u062C\u0633" },
    rivals: [
      { id: "qa-rival-1", name: "\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u0644\u0624\u0644\u0624\u0629 \u0644\u0644\u062A\u0637\u0648\u064A\u0631 \u0648\u0627\u0644\u062A\u062C\u0627\u0631\u0629", avatar: "\u{1F3D9}\uFE0F", activeSector: "\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u0645\u0648\u064A\u0646 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", netWorth: 19e5 },
      { id: "qa-rival-2", name: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0634\u0645\u0627\u0644 \u0644\u0644\u063A\u0627\u0632 \u0648\u0627\u0644\u0628\u062A\u0631\u0648\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A", avatar: "\u{1F525}", activeSector: "\u0627\u0644\u063A\u0627\u0632 \u0627\u0644\u0637\u0628\u064A\u0639\u064A \u0648\u0627\u0644\u0637\u0627\u0642\u0629", netWorth: 39e5 },
      { id: "qa-rival-3", name: "\u0642\u0627\u0628\u0636\u0629 \u0627\u0644\u062E\u0644\u064A\u062C \u0644\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0627\u0644\u0633\u064A\u0627\u062F\u064A", avatar: "\u{1F451}", activeSector: "\u0627\u0644\u0645\u0646\u0627\u0642\u0635\u0627\u062A \u0648\u0627\u0644\u0623\u0633\u0647\u0645 \u0627\u0644\u0643\u0628\u0631\u0649", netWorth: 64e5 }
    ],
    clients: [
      { name: "\u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u062F\u0648\u062D\u0629 \u0627\u0644\u0645\u0631\u0643\u0632\u064A\u0629 \u0644\u0644\u062A\u0645\u0648\u064A\u0646", type: "budget", multiplier: 0.95, minimumQuality: 0, description: "\u0637\u0644\u0628 \u064A\u0648\u0645\u064A \u0645\u0646\u062A\u0638\u0645 \u0644\u062A\u063A\u0637\u064A\u0629 \u0627\u062D\u062A\u064A\u0627\u062C\u0627\u062A \u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0645\u062D\u0644\u064A." },
      { name: "\u0641\u0646\u0627\u062F\u0642 \u0648\u0645\u0631\u0627\u0641\u0642 \u0627\u0644\u0644\u0624\u0644\u0624\u0629 \u0648\u0644\u0648\u0633\u064A\u0644", type: "quality", multiplier: 1.2, minimumQuality: 90, description: "\u062A\u0637\u0644\u0628 \u0645\u0646\u062A\u062C\u0627\u062A \u0641\u0627\u0626\u0642\u0629 \u0627\u0644\u062C\u0648\u062F\u0629 \u0628\u0645\u0639\u0627\u064A\u064A\u0631 \u0639\u0627\u0644\u0645\u064A\u0629." },
      { name: "\u0645\u062C\u0645\u0639 \u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A \u0628\u0645\u064A\u0646\u0627\u0621 \u062D\u0645\u062F", type: "bulk", multiplier: 1.06, minimumQuality: 75, description: "\u0639\u0642\u0648\u062F \u062A\u0648\u0631\u064A\u062F \u0636\u062E\u0645\u0629 \u0644\u0644\u0634\u062D\u0646 \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A." },
      { name: "\u0625\u0645\u062F\u0627\u062F \u0645\u0646\u0634\u0622\u062A \u0631\u0623\u0633 \u0644\u0641\u0627\u0646 \u0627\u0644\u0639\u0627\u062C\u0644", type: "urgent", multiplier: 1.28, minimumQuality: 70, description: "\u0637\u0644\u0628\u064A\u0629 \u062A\u0634\u063A\u064A\u0644\u064A\u0629 \u0645\u0633\u062A\u0639\u062C\u0644\u0629 \u0628\u0645\u0643\u0627\u0641\u0623\u0629 \u0646\u0642\u062F\u064A\u0629 \u0645\u0645\u062A\u0627\u0632\u0629." }
    ]
  },
  uk: {
    countryId: "uk",
    scenarioTitle: "\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u062C\u062F \u0628\u064A\u0646 \u0645\u0627\u0646\u0634\u0633\u062A\u0631 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0648\u062D\u064A \u0627\u0644\u0645\u0627\u0644 \u0628\u0644\u0646\u062F\u0646",
    cityShort: "\u0644\u0646\u062F\u0646 \u0648\u0645\u0627\u0646\u0634\u0633\u062A\u0631",
    industrialHub: "\u062A\u0631\u0627\u0641\u0648\u0631\u062F \u0628\u0627\u0631\u0643 \u0645\u0627\u0646\u0634\u0633\u062A\u0631 \u0648\u062D\u0648\u0636 \u0644\u064A\u0641\u0631\u0628\u0648\u0644",
    portHub: "\u0645\u0648\u0627\u0646\u0626 \u0644\u064A\u0641\u0631\u0628\u0648\u0644 \u0648\u0633\u0627\u0648\u062B\u0647\u0627\u0645\u0628\u062A\u0648\u0646",
    bankName: "\u0628\u0646\u0643 \u0628\u0627\u0631\u0643\u0644\u064A\u0632",
    exchangeName: "\u0628\u0648\u0631\u0635\u0629 \u0644\u0646\u062F\u0646 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629 (LSE)",
    inheritedFactoryName: "\u0645\u0635\u0646\u0639 \u0627\u0644\u062A\u0627\u064A\u0645\u0632 \u0644\u0644\u0635\u0646\u0627\u0639\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \xB7 \u0645\u0627\u0646\u0634\u0633\u062A\u0631",
    inheritedLandName: "\u0623\u0631\u0636 \u0645\u062C\u0645\u0639 \u062A\u0631\u0627\u0641\u0648\u0631\u062F \u0628\u0627\u0631\u0643 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \xB7 \u0645\u0627\u0646\u0634\u0633\u062A\u0631",
    starterLandOfferName: "\u0645\u062C\u0645\u0639 \u0645\u0627\u0646\u0634\u0633\u062A\u0631 \u0627\u0644\u0635\u0646\u0627\u0639\u064A (Trafford Park)",
    headline: "\u0639\u0631\u0627\u0642\u0629 \u0635\u0646\u0627\u0639\u064A\u0629 \u0641\u064A \u0645\u0627\u0646\u0634\u0633\u062A\u0631 \u0648\u0623\u0633\u0648\u0627\u0642 \u062A\u0645\u0648\u064A\u0644 \u0648\u0645\u0644\u0627\u062D\u0629 \u062F\u0648\u0644\u064A\u0629 \u0641\u064A \u0642\u0644\u0628 \u0644\u0646\u062F\u0646.",
    strengths: [
      "\u0633\u0648\u0642 \u0639\u0642\u0648\u062F \u0639\u0627\u0644\u064A \u0627\u0644\u0645\u0648\u062B\u0648\u0642\u064A\u0629 \u064A\u0643\u0627\u0641\u0626 \u0627\u0644\u062C\u0648\u062F\u0629 \u0648\u0627\u0644\u0627\u0646\u0636\u0628\u0627\u0637 \u0627\u0644\u0645\u0627\u0644\u064A",
      "\u062A\u0643\u0627\u0645\u0644 \u0642\u0648\u064A \u0628\u064A\u0646 \u0627\u0644\u0635\u0646\u0627\u0639\u0629 \u0641\u064A \u0627\u0644\u0634\u0645\u0627\u0644 \u0648\u0627\u0644\u0645\u0644\u0627\u062D\u0629 \u0627\u0644\u0628\u062D\u0631\u064A\u0629 \u0648\u0627\u0644\u062A\u0645\u0648\u064A\u0644 \u0641\u064A \u0644\u0646\u062F\u0646",
      "\u0641\u0631\u0635 \u0645\u0645\u062A\u0627\u0632\u0629 \u0641\u064A \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0628\u062D\u0631\u064A \u0648\u0637\u0627\u0642\u0629 \u0628\u062D\u0631 \u0627\u0644\u0634\u0645\u0627\u0644 \u0648\u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0627\u0644\u0645\u0624\u0633\u0633\u064A"
    ],
    challenges: [
      "\u0636\u0631\u064A\u0628\u0629 \u0634\u0631\u0643\u0627\u062A 19% \u0648\u062A\u0643\u0644\u0641\u0629 \u062A\u0634\u063A\u064A\u0644 1.10x \u062A\u062A\u0637\u0644\u0628 \u062A\u062E\u0637\u064A\u0637\u0627\u064B \u062F\u0642\u064A\u0642\u0627\u064B \u0644\u0644\u0633\u064A\u0648\u0644\u0629",
      "\u0645\u0635\u0646\u0639 \u0645\u0627\u0646\u0634\u0633\u062A\u0631 \u0627\u0644\u0645\u0648\u0631\u0648\u062B \u064A\u0639\u0645\u0644 \u0628\u0640 25% \u0641\u0642\u0637 \u0648\u0639\u0644\u064A\u0647 \u0642\u0631\u0636 \u0645\u0633\u062A\u062D\u0642 \u0644\u0628\u0646\u0643 \u0628\u0627\u0631\u0643\u0644\u064A\u0632"
    ],
    signatureSectors: ["\u0627\u0644\u0645\u0644\u0627\u062D\u0629 \u0648\u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0628\u062D\u0631\u064A\u0629", "\u0627\u0644\u062A\u0645\u0648\u064A\u0644 \u0648\u0628\u0648\u0631\u0635\u0629 \u0644\u0646\u062F\u0646", "\u0627\u0644\u0635\u0646\u0627\u0639\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \u0648\u0627\u0644\u0637\u0627\u0642\u0629"],
    strategicTip: "\u0627\u062D\u0631\u0635 \u0639\u0644\u0649 \u0631\u0641\u0639 \u062C\u0648\u062F\u0629 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0644\u0635\u064A\u062F \u0639\u0642\u0648\u062F \u0644\u0646\u062F\u0646 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0647\u0627\u0645\u0634 \u0648\u062A\u062C\u0627\u0648\u0632 \u0623\u062B\u0631 \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0640 19%.",
    elder: { name: "\u0627\u0644\u0644\u0648\u0631\u062F \u0625\u062F\u0648\u0627\u0631\u062F \u0643\u064A\u0646\u063A\u0632\u0644\u064A", title: "\u0645\u0633\u062A\u0634\u0627\u0631 \u0627\u0644\u0623\u0635\u0648\u0644 \u0627\u0644\u0639\u0627\u0626\u0644\u064A\u0629 \u0628\u0644\u0646\u062F\u0646", initials: "\u0625\u0643" },
    operations: { name: "\u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u0623\u0648\u0644\u064A\u0641\u0631 \u0643\u0631\u0627\u0648\u0641\u0648\u0631\u062F", title: "\u0645\u062F\u064A\u0631 \u0645\u0635\u0627\u0646\u0639 \u062A\u0631\u0627\u0641\u0648\u0631\u062F \u0628\u0627\u0631\u0643 \u0628\u0645\u0627\u0646\u0634\u0633\u062A\u0631", initials: "\u0623\u0643" },
    finance: { name: "\u0641\u064A\u0643\u062A\u0648\u0631\u064A\u0627 \u0628\u064A\u0644\u063A\u0631\u064A\u0641", title: "\u0645\u062F\u064A\u0631\u0629 \u0627\u0644\u0627\u0626\u062A\u0645\u0627\u0646 \u0641\u064A \u062D\u064A \u0627\u0644\u0633\u064A\u062A\u064A \u0628\u0644\u0646\u062F\u0646", initials: "\u0641\u0628" },
    logistics: { name: "\u0627\u0644\u0642\u0628\u0637\u0627\u0646 \u0647\u0646\u0631\u064A \u0646\u064A\u0644\u0633\u0648\u0646", title: "\u0645\u062F\u064A\u0631 \u0623\u0633\u0627\u0637\u064A\u0644 \u0644\u064A\u0641\u0631\u0628\u0648\u0644 \u0648\u0633\u0627\u0648\u062B\u0647\u0627\u0645\u0628\u062A\u0648\u0646", initials: "\u0647\u0646" },
    rivals: [
      { id: "uk-rival-1", name: "\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u062A\u0627\u062C \u0644\u0644\u0633\u0644\u0639 \u0648\u0627\u0644\u0623\u063A\u0630\u064A\u0629", avatar: "\u{1F3A9}", activeSector: "\u0627\u0644\u0635\u0646\u0627\u0639\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u0647\u0644\u0627\u0643\u064A\u0629", netWorth: 22e5 },
      { id: "uk-rival-2", name: "\u0623\u0644\u0628\u064A\u0646 \u0644\u0644\u0634\u062D\u0646 \u0648\u0637\u0627\u0642\u0629 \u0628\u062D\u0631 \u0627\u0644\u0634\u0645\u0627\u0644", avatar: "\u2693", activeSector: "\u0627\u0644\u0645\u0644\u0627\u062D\u0629 \u0648\u0627\u0644\u0646\u0641\u0637 \u0627\u0644\u0628\u062D\u0631\u064A", netWorth: 41e5 },
      { id: "uk-rival-3", name: "\u0643\u0627\u0646\u0627\u0631\u064A \u0648\u0627\u0631\u0641 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0627\u0644\u0642\u0627\u0628\u0636\u0629", avatar: "\u{1F3DB}\uFE0F", activeSector: "\u0627\u0644\u0645\u0635\u0627\u0631\u0641 \u0648\u0628\u0648\u0631\u0635\u0629 \u0644\u0646\u062F\u0646", netWorth: 75e5 }
    ],
    clients: [
      { name: "\u0633\u0644\u0627\u0633\u0644 \u0645\u062A\u0627\u062C\u0631 \u0645\u064A\u062F\u0644\u0627\u0646\u062F\u0632 \u0627\u0644\u0627\u0642\u062A\u0635\u0627\u062F\u064A\u0629", type: "budget", multiplier: 0.94, minimumQuality: 0, description: "\u0639\u0642\u0648\u062F \u062A\u0648\u0631\u064A\u062F \u0645\u0646\u062A\u0638\u0645\u0629 \u0644\u0645\u062F\u0646 \u0627\u0644\u0648\u0633\u0637 \u0648\u0627\u0644\u0634\u0645\u0627\u0644 \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A." },
      { name: "\u0645\u062A\u0627\u062C\u0631 \u0646\u0627\u064A\u062A\u0633\u0628\u0631\u064A\u062F\u062C \u0648\u0645\u0627\u064A\u0641\u064A\u0631 \u0627\u0644\u0641\u0627\u062E\u0631\u0629", type: "quality", multiplier: 1.21, minimumQuality: 92, description: "\u062A\u0634\u062A\u0631\u0637 \u062C\u0648\u062F\u0629 \u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A\u0629 \u0648\u062A\u0645\u0646\u062D \u0623\u0639\u0644\u0649 \u0647\u0627\u0645\u0634 \u0631\u0628\u062D." },
      { name: "\u0645\u0631\u0627\u0643\u0632 \u0625\u0645\u062F\u0627\u062F \u062D\u0648\u0636 \u0644\u064A\u0641\u0631\u0628\u0648\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", type: "bulk", multiplier: 1.06, minimumQuality: 75, description: "\u0637\u0644\u0628\u064A\u0627\u062A \u062C\u0645\u0644\u0629 \u0643\u0628\u064A\u0631\u0629 \u0644\u0644\u062A\u0648\u0632\u064A\u0639 \u0639\u0628\u0631 \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629." },
      { name: "\u062A\u0645\u0648\u064A\u0646 \u0633\u0641\u0646 \u0633\u0627\u0648\u062B\u0647\u0627\u0645\u0628\u062A\u0648\u0646 \u0627\u0644\u0639\u0627\u062C\u0644", type: "urgent", multiplier: 1.29, minimumQuality: 70, description: "\u0637\u0644\u0628\u064A\u0629 \u0634\u062D\u0646 \u0628\u062D\u0631\u064A \u0639\u0627\u062C\u0644\u0629 \u0628\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u062A\u0632\u0627\u0645 \u0645\u062C\u0632\u064A\u0629." }
    ]
  },
  germany: {
    countryId: "germany",
    scenarioTitle: "\u0642\u0644\u0627\u0639 \u062D\u0632\u0627\u0645 \u0627\u0644\u0631\u0648\u0631 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0648\u0628\u0648\u0627\u0628\u0629 \u0647\u0627\u0645\u0628\u0648\u0631\u063A \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064A\u0629",
    cityShort: "\u062F\u0648\u0633\u0644\u062F\u0648\u0631\u0641 \u0648\u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A",
    industrialHub: "\u062D\u0632\u0627\u0645 \u0627\u0644\u0631\u0648\u0631 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0648\u0634\u062A\u0648\u062A\u063A\u0627\u0631\u062A",
    portHub: "\u0645\u064A\u0646\u0627\u0621 \u0647\u0627\u0645\u0628\u0648\u0631\u063A \u0627\u0644\u062F\u0648\u0644\u064A",
    bankName: "\u062F\u0648\u064A\u062A\u0634\u0647 \u0628\u0646\u0643",
    exchangeName: "\u0628\u0648\u0631\u0635\u0629 \u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A (DAX)",
    inheritedFactoryName: "\u0645\u0635\u0646\u0639 \u0628\u0627\u0641\u0627\u0631\u064A\u0627 \u0644\u0644\u0635\u0646\u0627\u0639\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \xB7 \u0627\u0644\u0631\u0648\u0631",
    inheritedLandName: "\u0623\u0631\u0636 \u062D\u0632\u0627\u0645 \u0627\u0644\u0631\u0648\u0631 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \xB7 \u062F\u0648\u0633\u0644\u062F\u0648\u0631\u0641",
    starterLandOfferName: "\u062D\u0632\u0627\u0645 \u0627\u0644\u0631\u0648\u0631 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0627\u0644\u062D\u062F\u064A\u062B \xB7 \u062F\u0648\u0633\u0644\u062F\u0648\u0631\u0641",
    headline: "\u0642\u0644\u0628 \u0627\u0644\u0647\u0646\u062F\u0633\u0629 \u0648\u0627\u0644\u0623\u062A\u0645\u062A\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627 \u0628\u0645\u0639\u0627\u064A\u064A\u0631 \u062C\u0648\u062F\u0629 \u0644\u0627 \u062A\u0642\u0628\u0644 \u0627\u0644\u0645\u0633\u0627\u0648\u0645\u0629.",
    strengths: [
      "\u0628\u064A\u0626\u0629 \u0645\u062B\u0627\u0644\u064A\u0629 \u0644\u0644\u0635\u0646\u0627\u0639\u0627\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644\u064A\u0629 \u0648\u0627\u0644\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A \u0648\u0627\u0644\u0623\u0628\u062D\u0627\u062B \u0648\u0627\u0644\u0623\u062A\u0645\u062A\u0629 \u0627\u0644\u0630\u0643\u064A\u0629",
      "\u0645\u064A\u0646\u0627\u0621 \u0647\u0627\u0645\u0628\u0648\u0631\u063A \u064A\u0641\u062A\u062D \u0639\u0642\u0648\u062F \u062A\u0635\u062F\u064A\u0631 \u0623\u0648\u0631\u0648\u0628\u064A\u0629 \u0636\u062E\u0645\u0629 \u0648\u0645\u0633\u062A\u0642\u0631\u0629",
      "\u0627\u0633\u062A\u0642\u0631\u0627\u0631 \u0645\u0627\u0644\u064A \u0642\u0648\u064A \u0641\u064A \u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A \u064A\u062F\u0639\u0645 \u0627\u0644\u062A\u0648\u0633\u0639 \u0627\u0644\u0645\u062F\u0631\u0648\u0633"
    ],
    challenges: [
      "\u0636\u0631\u064A\u0628\u0629 19% \u0648\u062A\u0643\u0644\u0641\u0629 \u062A\u0634\u063A\u064A\u0644 1.10x \u062A\u062C\u0639\u0644 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0644\u0644\u0645\u0635\u0627\u0646\u0639 \u0636\u0631\u0648\u0631\u0629 \u0642\u0635\u0648\u0649",
      "\u0645\u0635\u0646\u0639 \u0627\u0644\u0631\u0648\u0631 \u0627\u0644\u0645\u0648\u0631\u0648\u062B \u0645\u062A\u0639\u062B\u0631 \u0628\u0643\u0641\u0627\u0621\u0629 25% \u0648\u0642\u0631\u0636 \u062F\u0648\u064A\u062A\u0634\u0647 \u0628\u0646\u0643 \u064A\u0633\u062A\u062D\u0642 \u062E\u0644\u0627\u0644 7 \u0623\u064A\u0627\u0645"
    ],
    signatureSectors: ["\u0627\u0644\u0647\u0646\u062F\u0633\u0629 \u0648\u0627\u0644\u0635\u0646\u0627\u0639\u0627\u062A \u0627\u0644\u0643\u064A\u0645\u0627\u0648\u064A\u0629", "\u0627\u0644\u0623\u062A\u0645\u062A\u0629 \u0648\u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627", "\u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064A\u0629"],
    strategicTip: "\u0644\u0627 \u062A\u062A\u0631\u0643 \u0643\u0641\u0627\u0621\u0629 \u0645\u0627\u0643\u064A\u0646\u0627\u062A\u0643 \u062A\u0647\u0628\u0637 \u0641\u064A \u0623\u0644\u0645\u0627\u0646\u064A\u0627\u061B \u0627\u0644\u062C\u0648\u062F\u0629 \u0627\u0644\u0639\u0627\u0644\u064A\u0629 \u062A\u0641\u062A\u062D \u0644\u0643 \u0639\u0642\u0648\u062F \u0627\u0644\u0627\u062A\u062D\u0627\u062F \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064A \u0627\u0644\u0623\u0643\u062B\u0631 \u0631\u0628\u062D\u0627\u064B.",
    elder: { name: "\u0647\u0627\u0646\u0632 \u0641\u0631\u064A\u062F\u0631\u064A\u0634 \u0634\u062A\u064A\u0631\u0646", title: "\u0643\u0628\u064A\u0631 \u0645\u0633\u062A\u0634\u0627\u0631\u064A \u0627\u0644\u0635\u0646\u0627\u0639\u0629 \u0641\u064A \u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A", initials: "\u0647\u0634" },
    operations: { name: "\u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u0643\u0644\u0627\u0648\u0633 \u0641\u0627\u063A\u0646\u0631", title: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0647\u0646\u062F\u0633\u0629 \u0648\u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0641\u064A \u062D\u0632\u0627\u0645 \u0627\u0644\u0631\u0648\u0631", initials: "\u0643\u0641" },
    finance: { name: "\u0623\u0646\u0647\u0627\u0644\u064A\u0632\u0627 \u0628\u0631\u0627\u0646\u062F\u062A", title: "\u062E\u0628\u064A\u0631\u0629 \u0627\u0644\u0645\u0635\u0627\u0631\u0641 \u0648\u0628\u0648\u0631\u0635\u0629 \u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A", initials: "\u0623\u0628" },
    logistics: { name: "\u0627\u0644\u0642\u0628\u0637\u0627\u0646 \u0644\u0648\u0643\u0627\u0633 \u0645\u0627\u064A\u0631", title: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062F\u0648\u0644\u064A \u0628\u0645\u064A\u0646\u0627\u0621 \u0647\u0627\u0645\u0628\u0648\u0631\u063A", initials: "\u0644\u0645" },
    rivals: [
      { id: "de-rival-1", name: "\u0631\u0627\u064A\u0646\u0644\u0627\u0646\u062F \u0644\u0644\u0635\u0646\u0627\u0639\u0627\u062A \u0627\u0644\u0645\u062A\u0643\u0627\u0645\u0644\u0629", avatar: "\u2699\uFE0F", activeSector: "\u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0648\u0627\u0644\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A", netWorth: 24e5 },
      { id: "de-rival-2", name: "\u0647\u0627\u0646\u0632\u0627 \u0647\u0627\u0645\u0628\u0648\u0631\u063A \u0644\u0644\u062E\u0637\u0648\u0637 \u0627\u0644\u0628\u062D\u0631\u064A\u0629", avatar: "\u{1F6A2}", activeSector: "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064A \u0648\u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A", netWorth: 42e5 },
      { id: "de-rival-3", name: "\u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A \u064A\u0648\u0646\u064A\u0648\u0646 \u0643\u0627\u0628\u064A\u062A\u0627\u0644", avatar: "\u{1F3E6}", activeSector: "\u0627\u0644\u062A\u0645\u0648\u064A\u0644 \u0648\u0645\u0624\u0634\u0631 DAX", netWorth: 78e5 }
    ],
    clients: [
      { name: "\u0633\u0644\u0627\u0633\u0644 \u0627\u0644\u062A\u062C\u0632\u0626\u0629 \u0627\u0644\u0627\u0642\u062A\u0635\u0627\u062F\u064A\u0629 \u0641\u064A \u0627\u0644\u0631\u0648\u0631", type: "budget", multiplier: 0.94, minimumQuality: 0, description: "\u062A\u0648\u0631\u064A\u062F \u0645\u0646\u062A\u0638\u0645 \u0644\u0644\u0645\u062F\u0646 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0641\u064A \u063A\u0631\u0628 \u0623\u0644\u0645\u0627\u0646\u064A\u0627." },
      { name: "\u0645\u0624\u0633\u0633\u0627\u062A \u0627\u0644\u062C\u0648\u062F\u0629 \u0627\u0644\u0628\u0627\u0641\u0627\u0631\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629", type: "quality", multiplier: 1.22, minimumQuality: 92, description: "\u062A\u0634\u062A\u0631\u0637 \u062F\u0642\u0629 \u062A\u0635\u0646\u064A\u0639 \u0644\u0627 \u062A\u0642\u0644 \u0639\u0646 92% \u0628\u0639\u0627\u0626\u062F \u0645\u0645\u062A\u0627\u0632." },
      { name: "\u0645\u0631\u0643\u0632 \u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064A \u0641\u064A \u0647\u0627\u0645\u0628\u0648\u0631\u063A", type: "bulk", multiplier: 1.07, minimumQuality: 78, description: "\u0634\u062D\u0646\u0627\u062A \u062C\u0645\u0644\u0629 \u0636\u062E\u0645\u0629 \u0644\u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u0627\u062A\u062D\u0627\u062F \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064A." },
      { name: "\u062E\u0637 \u0627\u0644\u0625\u0645\u062F\u0627\u062F \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0627\u0644\u0633\u0631\u064A\u0639 \u0628\u0634\u062A\u0648\u062A\u063A\u0627\u0631\u062A", type: "urgent", multiplier: 1.29, minimumQuality: 72, description: "\u0639\u0642\u062F \u0639\u0627\u062C\u0644 \u0644\u062A\u0641\u0627\u062F\u064A \u062A\u0648\u0642\u0641 \u0633\u0644\u0627\u0633\u0644 \u0627\u0644\u062A\u0648\u0631\u064A\u062F \u0628\u0645\u0643\u0627\u0641\u0623\u0629 \u0643\u0628\u064A\u0631\u0629." }
    ]
  },
  japan: {
    countryId: "japan",
    scenarioTitle: "\u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631\u064A\u0629 \u062E\u0644\u064A\u062C \u0637\u0648\u0643\u064A\u0648 \u0648\u0627\u0644\u0623\u062A\u0645\u062A\u0629 \u0627\u0644\u0641\u0627\u0626\u0642\u0629 \u0641\u064A \u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627",
    cityShort: "\u0637\u0648\u0643\u064A\u0648 \u0648\u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627",
    industrialHub: "\u0645\u062C\u0645\u0639 \u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627 \u0627\u0644\u0628\u062D\u0631\u064A \u0648\u0623\u0648\u0633\u0627\u0643\u0627 \u0627\u0644\u0635\u0646\u0627\u0639\u064A",
    portHub: "\u0645\u0648\u0627\u0646\u0626 \u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627 \u0648\u0646\u0627\u063A\u0648\u064A\u0627 \u0648\u062E\u0644\u064A\u062C \u0637\u0648\u0643\u064A\u0648",
    bankName: "\u0645\u064A\u062A\u0633\u0648\u0628\u064A\u0634\u064A \u064A\u0648 \u0625\u0641 \u062C\u064A\u0647",
    exchangeName: "\u0628\u0648\u0631\u0635\u0629 \u0637\u0648\u0643\u064A\u0648 \u0644\u0644\u0623\u0648\u0631\u0627\u0642 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 (TSE)",
    inheritedFactoryName: "\u0645\u0635\u0646\u0639 \u0637\u0648\u0643\u064A\u0648 \u0644\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \xB7 \u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627",
    inheritedLandName: "\u0623\u0631\u0636 \u0645\u062C\u0645\u0639 \u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627 \u0627\u0644\u0628\u062D\u0631\u064A \u0627\u0644\u0635\u0646\u0627\u0639\u064A \xB7 \u062E\u0644\u064A\u062C \u0637\u0648\u0643\u064A\u0648",
    starterLandOfferName: "\u0645\u062C\u0645\u0639 \u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627 \u0627\u0644\u0628\u062D\u0631\u064A \u0627\u0644\u0635\u0646\u0627\u0639\u064A \xB7 \u062E\u0644\u064A\u062C \u0637\u0648\u0643\u064A\u0648",
    headline: "\u0627\u0646\u0636\u0628\u0627\u0637 \u062A\u0634\u063A\u064A\u0644\u064A \u0635\u0627\u0631\u0645 \u0648\u0636\u0631\u064A\u0628\u0629 \u0645\u062A\u0648\u0627\u0632\u0646\u0629 (15%) \u0648\u062A\u0641\u0648\u0642 \u0641\u064A \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A \u0648\u0627\u0644\u0645\u0648\u0627\u0646\u0626.",
    strengths: [
      "\u0636\u0631\u064A\u0628\u0629 \u0645\u0639\u062A\u062F\u0644\u0629 (15%) \u0645\u0642\u0627\u0631\u0646\u0629 \u0628\u0627\u0644\u0627\u0642\u062A\u0635\u0627\u062F\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0627\u0644\u0643\u0628\u0631\u0649",
      "\u0639\u0648\u0627\u0626\u062F \u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A\u0629 \u0639\u0646\u062F \u0627\u0644\u062A\u0648\u0633\u0639 \u0646\u062D\u0648 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A \u0648\u0634\u062C\u0631\u0629 \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0648\u0627\u0644\u0623\u062A\u0645\u062A\u0629",
      "\u0631\u0628\u0637 \u0628\u062D\u0631\u064A \u0645\u0628\u0627\u0634\u0631 \u0639\u0628\u0631 \u062E\u0644\u064A\u062C \u0637\u0648\u0643\u064A\u0648 \u0648\u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627 \u0648\u0646\u0627\u063A\u0648\u064A\u0627 \u0644\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0622\u0633\u064A\u0648\u064A\u0629"
    ],
    challenges: [
      "\u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u064A\u0627\u0628\u0627\u0646\u064A\u0648\u0646 \u062D\u0633\u0627\u0633\u0648\u0646 \u062C\u062F\u0627\u064B \u0644\u0644\u062C\u0648\u062F\u0629 \u0648\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u062F\u0648\u0646 \u0623\u064A \u062A\u0623\u062E\u064A\u0631",
      "\u0645\u0635\u0646\u0639 \u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627 \u0627\u0644\u0645\u0648\u0631\u0648\u062B \u064A\u0639\u0645\u0644 \u0628\u0643\u0641\u0627\u0621\u0629 25% \u0648\u0642\u0631\u0636 \u0645\u064A\u062A\u0633\u0648\u0628\u064A\u0634\u064A \u064A\u0633\u062A\u062D\u0642 \u0628\u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u0633\u0627\u0628\u0639"
    ],
    signatureSectors: ["\u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A \u0648\u0631\u0642\u0627\u0626\u0642 \u0627\u0644\u0633\u064A\u0644\u064A\u0643\u0648\u0646", "\u0627\u0644\u0623\u062A\u0645\u062A\u0629 \u0627\u0644\u0630\u0643\u064A\u0629 \u0648\u0627\u0644\u0623\u0628\u062D\u0627\u062B", "\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0628\u062D\u0631\u064A (\u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627)"],
    strategicTip: "\u0637\u0628\u0651\u0642 \u0641\u0644\u0633\u0641\u0629 \u0627\u0644\u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u0645\u0633\u062A\u0645\u0631 (Kaizen): \u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0645\u0635\u0646\u0639 100% \u0644\u0628\u0646\u0627\u0621 \u0633\u0645\u0639\u0629 \u0633\u0631\u064A\u0639\u0629 \u0641\u064A \u0637\u0648\u0643\u064A\u0648.",
    elder: { name: "\u0643\u064A\u0646\u062C\u064A \u062A\u0627\u0643\u0627\u0647\u0627\u0634\u064A", title: "\u0643\u0628\u064A\u0631 \u0645\u0633\u062A\u0634\u0627\u0631\u064A \u0627\u0644\u062A\u0643\u062A\u0644 \u0641\u064A \u0637\u0648\u0643\u064A\u0648", initials: "\u0643\u062A" },
    operations: { name: "\u0627\u0644\u0645\u0647\u0646\u062F\u0633 \u0647\u064A\u0631\u0648\u0634\u064A \u0633\u0627\u062A\u0648", title: "\u0645\u062F\u064A\u0631 \u0627\u0644\u062C\u0648\u062F\u0629 \u0648\u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0641\u064A \u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627", initials: "\u0647\u0633" },
    finance: { name: "\u0623\u0643\u0627\u0631\u064A \u064A\u0627\u0645\u0627\u0645\u0648\u062A\u0648", title: "\u0645\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0627\u0626\u062A\u0645\u0627\u0646 \u0648\u0628\u0648\u0631\u0635\u0629 \u0637\u0648\u0643\u064A\u0648", initials: "\u0623\u064A" },
    logistics: { name: "\u0627\u0644\u0642\u0628\u0637\u0627\u0646 \u0631\u064A\u0648 \u0646\u0627\u0643\u0627\u0645\u0648\u0631\u0627", title: "\u0645\u062F\u064A\u0631 \u0623\u0633\u0627\u0637\u064A\u0644 \u062E\u0644\u064A\u062C \u0637\u0648\u0643\u064A\u0648 \u0648\u0646\u0627\u063A\u0648\u064A\u0627", initials: "\u0631\u0646" },
    rivals: [
      { id: "jp-rival-1", name: "\u0645\u062C\u0645\u0648\u0639\u0629 \u0643\u0627\u0646\u0633\u0627\u064A \u0644\u0644\u0635\u0646\u0627\u0639\u0627\u062A \u0627\u0644\u062F\u0642\u064A\u0642\u0629", avatar: "\u{1F3ED}", activeSector: "\u0627\u0644\u062A\u0635\u0646\u064A\u0639 \u0627\u0644\u063A\u0630\u0627\u0626\u064A \u0648\u0627\u0644\u0625\u0645\u062F\u0627\u062F", netWorth: 23e5 },
      { id: "jp-rival-2", name: "\u0646\u064A\u0628\u0648\u0646 \u0628\u0627\u0633\u064A\u0641\u064A\u0643 \u0644\u0644\u0645\u0644\u0627\u062D\u0629 \u0627\u0644\u0628\u062D\u0631\u064A\u0629", avatar: "\u{1F6F3}\uFE0F", activeSector: "\u0645\u0648\u0627\u0646\u0626 \u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627 \u0648\u0646\u0627\u063A\u0648\u064A\u0627", netWorth: 43e5 },
      { id: "jp-rival-3", name: "\u0632\u0627\u064A\u0628\u0627\u062A\u0633\u0648 \u0637\u0648\u0643\u064A\u0648 \u0644\u0644\u062A\u0642\u0646\u064A\u0629 \u0648\u0627\u0644\u0645\u0627\u0644", avatar: "\u26A1", activeSector: "\u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A \u0648\u0628\u0648\u0631\u0635\u0629 \u0637\u0648\u0643\u064A\u0648", netWorth: 82e5 }
    ],
    clients: [
      { name: "\u0645\u062A\u0627\u062C\u0631 \u0637\u0648\u0643\u064A\u0648 \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0627\u0644\u0633\u0631\u064A\u0639\u0629 (Konbini)", type: "budget", multiplier: 0.95, minimumQuality: 0, description: "\u0633\u062D\u0628 \u064A\u0648\u0645\u064A \u0645\u0646\u062A\u0638\u0645 \u0644\u0622\u0644\u0627\u0641 \u0627\u0644\u0641\u0631\u0648\u0639 \u0641\u064A \u0637\u0648\u0643\u064A\u0648 \u0648\u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627." },
      { name: "\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u062A\u0633\u0648\u0642 \u0627\u0644\u0641\u0627\u062E\u0631\u0629 \u0641\u064A \u063A\u064A\u0646\u0632\u0627", type: "quality", multiplier: 1.22, minimumQuality: 92, description: "\u062A\u0634\u062A\u0631\u0637 \u0625\u062A\u0642\u0627\u0646\u0627\u064B \u062A\u0627\u0645\u0627\u064B \u0628\u0627\u0644\u062C\u0648\u062F\u0629 \u0645\u0642\u0627\u0628\u0644 \u0623\u0633\u0639\u0627\u0631 \u0645\u0645\u062A\u0627\u0632\u0629." },
      { name: "\u0634\u0628\u0643\u0629 \u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0641\u064A \u0623\u0648\u0633\u0627\u0643\u0627 \u0648\u0646\u0627\u063A\u0648\u064A\u0627", type: "bulk", multiplier: 1.07, minimumQuality: 78, description: "\u0639\u0642\u0648\u062F \u062C\u0645\u0644\u0629 \u0643\u0628\u0631\u0649 \u0644\u062A\u063A\u0637\u064A\u0629 \u0627\u0644\u0623\u0631\u062E\u0628\u064A\u0644 \u0627\u0644\u064A\u0627\u0628\u0627\u0646\u064A." },
      { name: "\u062A\u0645\u0648\u064A\u0646 \u0633\u0641\u0646 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0633\u0631\u064A\u0639 \u0628\u062E\u0644\u064A\u062C \u0637\u0648\u0643\u064A\u0648", type: "urgent", multiplier: 1.3, minimumQuality: 72, description: "\u062A\u0648\u0631\u064A\u062F \u062F\u0642\u064A\u0642 \u0627\u0644\u0645\u0648\u0639\u062F \u0628\u0639\u0644\u0627\u0648\u0629 \u0627\u0644\u062A\u0632\u0627\u0645 \u0648\u0633\u0645\u0639\u0629 \u0639\u0627\u0644\u064A\u0629." }
    ]
  }
};
function buildStagesForSeed(seed) {
  return [
    { stageNumber: 1, title: `\u0627\u0644\u0628\u062F\u0627\u064A\u0629 \u0627\u0644\u0645\u062A\u0639\u062B\u0631\u0629 \u0641\u064A ${seed.cityShort}`, focus: `\u0627\u0633\u062A\u0644\u0627\u0645 \u0633\u064A\u0648\u0644\u0629 \u0627\u0644\u0625\u0646\u0642\u0627\u0630 (25,000 $) \u0648\u0641\u062D\u0635 ${seed.inheritedFactoryName}.`, unlockSection: "home", requiredLevel: 1 },
    { stageNumber: 2, title: "\u0625\u0635\u0644\u0627\u062D \u0627\u0644\u0623\u0635\u0644 \u0627\u0644\u0645\u0648\u0631\u0648\u062B \u0648\u062A\u0623\u0645\u064A\u0646 \u0627\u0644\u0623\u0631\u0636", focus: `\u0631\u0641\u0639 \u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0645\u0627\u0643\u064A\u0646\u0627\u062A \u0625\u0644\u0649 100% \u0648\u0636\u0645 \u0623\u0631\u0636 \u062C\u062F\u064A\u062F\u0629 \u0641\u064A ${seed.industrialHub}.`, unlockSection: "companies", requiredLevel: 1 },
    { stageNumber: 3, title: "\u0633\u0644\u0627\u0633\u0644 \u0627\u0644\u0625\u0645\u062F\u0627\u062F \u0648\u062F\u0648\u0631\u0627\u0646 \u0627\u0644\u0625\u0646\u062A\u0627\u062C", focus: "\u0634\u0631\u0627\u0621 \u0627\u0644\u062D\u0628\u0648\u0628 \u0648\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0648\u062A\u0634\u063A\u064A\u0644 \u0623\u0648\u0644 \u062E\u0637 \u0625\u0646\u062A\u0627\u062C \u0641\u0639\u0644\u064A.", unlockSection: "production", requiredLevel: 2 },
    { stageNumber: 4, title: "\u0623\u0648\u0644 \u0635\u0641\u0642\u0629 \u0633\u0648\u0642\u064A\u0629 \u0648\u0639\u0642\u0648\u062F \u0627\u0644\u062A\u062C\u0627\u0631", focus: `\u0628\u064A\u0639 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0648\u0625\u0628\u0631\u0627\u0645 \u0623\u0648\u0644 \u0639\u0642\u062F \u0631\u0633\u0645\u064A \u0645\u0639 \u0639\u0645\u0644\u0627\u0621 ${seed.cityShort}.`, unlockSection: "contracts", requiredLevel: 3 },
    { stageNumber: 5, title: "\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0646\u0642\u062F\u064A \u0648\u062A\u0633\u0648\u064A\u0629 \u0627\u0644\u062F\u064A\u0648\u0646", focus: `\u0633\u062F\u0627\u062F \u0642\u0631\u0636 ${seed.bankName} \u0642\u0628\u0644 \u0646\u0647\u0627\u064A\u0629 \u0645\u0647\u0644\u0629 \u0627\u0644\u0640 7 \u0623\u064A\u0627\u0645 \u0648\u062A\u0641\u0627\u062F\u064A \u062A\u0648\u0642\u0641 \u0627\u0644\u0637\u0627\u0642\u0629.`, unlockSection: "obligations", requiredLevel: 3 },
    { stageNumber: 6, title: `\u0631\u0641\u0639 \u0627\u0644\u062A\u062C\u0645\u064A\u062F \u0627\u0644\u0628\u0646\u0643\u064A \u0648\u062F\u062E\u0648\u0644 ${seed.exchangeName}`, focus: `\u0641\u062A\u062D \u062A\u0633\u0647\u064A\u0644\u0627\u062A ${seed.bankName} \u0648\u0627\u0644\u0648\u062F\u0627\u0626\u0639 \u0648\u0627\u0644\u0627\u0646\u0637\u0644\u0627\u0642 \u0646\u062D\u0648 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0627\u0644\u0645\u0627\u0644\u064A.`, unlockSection: "bank", requiredLevel: 4 },
    { stageNumber: 7, title: "\u0628\u0646\u0627\u0621 \u0627\u0644\u0641\u0631\u064A\u0642 \u0627\u0644\u062A\u0646\u0641\u064A\u0630\u064A \u0648\u0627\u0644\u062D\u0648\u0643\u0645\u0629", focus: "\u062A\u0639\u064A\u064A\u0646 \u0645\u062F\u064A\u0631 \u062A\u0634\u063A\u064A\u0644 \u0648\u0645\u062D\u0627\u0633\u0628 \u0648\u0645\u062D\u0627\u0645\u064D \u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0647\u0648\u0627\u0645\u0634 \u0648\u062A\u0642\u0644\u064A\u0644 \u0627\u0644\u0636\u0631\u0627\u0626\u0628.", unlockSection: "staff", requiredLevel: 5 },
    { stageNumber: 8, title: "\u0627\u0644\u0623\u0628\u062D\u0627\u062B \u0648\u0627\u0644\u0623\u062A\u0645\u062A\u0629 \u0648\u0627\u0644\u0647\u064A\u0628\u0629 \u0627\u0644\u062A\u0646\u0641\u064A\u0630\u064A\u0629", focus: "\u062A\u0637\u0648\u064A\u0631 \u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0635\u0627\u0646\u0639 \u0627\u0644\u0630\u0643\u064A\u0629 \u0648\u0628\u0646\u0627\u0621 \u0623\u0635\u0648\u0644 \u0627\u0644\u0647\u064A\u0628\u0629.", unlockSection: "tech_tree", requiredLevel: 6 },
    { stageNumber: 9, title: "\u0627\u0644\u0633\u064A\u0637\u0631\u0629 \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A\u0629 \u0648\u0627\u0644\u062A\u062D\u0627\u0644\u0641\u0627\u062A", focus: "\u0627\u0644\u0627\u0633\u062A\u062D\u0648\u0627\u0630 \u0639\u0644\u0649 \u062D\u0635\u0635 \u0627\u0644\u0645\u062F\u0646 \u0648\u062A\u0623\u0633\u064A\u0633 \u0627\u0644\u0643\u0627\u0631\u062A\u064A\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A.", unlockSection: "territory", requiredLevel: 7 },
    { stageNumber: 10, title: `\u0633\u064A\u0627\u062F\u0629 ${seed.portHub} \u0648\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0642\u0648\u0645\u064A\u0629`, focus: "\u0627\u0645\u062A\u0644\u0627\u0643 \u0623\u0633\u0627\u0637\u064A\u0644 \u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u0645\u0646\u0627\u0642\u0635\u0627\u062A \u0627\u0644\u0633\u064A\u0627\u062F\u064A\u0629 \u0648\u0635\u0646\u0627\u062F\u064A\u0642 \u0627\u0644\u064A\u0648\u0646\u064A\u0643\u0648\u0631\u0646.", unlockSection: "maritime", requiredLevel: 10 }
  ];
}
function buildChaptersForSeed(seed) {
  return [
    {
      id: 1,
      title: `\u062E\u0637\u0629 \u0627\u0644\u0625\u0646\u0642\u0627\u0630 \u0641\u064A ${seed.industrialHub}`,
      subtitle: `\u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u0623\u0648\u0644: \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0643\u0631\u0627\u0645\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0641\u064A ${seed.cityShort}`,
      characterName: seed.elder.name,
      characterAvatar: "\u{1F454}",
      characterTitle: seed.elder.title,
      dialogueText: `\u0627\u0644\u0645\u0646\u0627\u0641\u0633\u0648\u0646 \u0641\u064A \xAB${seed.rivals[0].name}\xBB \u064A\u0631\u0627\u0647\u0646\u0648\u0646 \u0639\u0644\u0649 \u0633\u0642\u0648\u0637\u0643 \u0642\u0628\u0644 \u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u0633\u0627\u0628\u0639! \u0623\u0635\u0644\u062D ${seed.inheritedFactoryName}\u060C \u0648\u0633\u062F\u0651\u062F \u0642\u0631\u0636 ${seed.bankName}\u060C \u0648\u0623\u062B\u0628\u062A \u0644\u0644\u062C\u0645\u064A\u0639 \u0623\u0646\u0643 \u0627\u0644\u0642\u0627\u0626\u062F \u0627\u0644\u0634\u0631\u0639\u064A \u0644\u0644\u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631\u064A\u0629.`,
      objectiveText: "\u0627\u0645\u062A\u0644\u0643 \u0634\u0631\u0643\u062A\u064A\u0646 \u0623\u0648 \u0637\u0648\u0631 \u0623\u0639\u0645\u0627\u0644\u0643 \u0648\u062D\u0642\u0642 \u0635\u0627\u0641\u064A \u0623\u0631\u0628\u0627\u062D \u0628\u0642\u064A\u0645\u0629 15,000 $ \u0641\u064A \u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u0623\u0648\u0644",
      requiredLevel: 2,
      requiredCompanies: 1,
      requiredProfit: 15e3,
      rewardDiamonds: 15,
      rewardGoldGrams: 5,
      rewardTitle: `\u0631\u0627\u0626\u062F ${seed.cityShort} \u0627\u0644\u0635\u0627\u0639\u062F`,
      choices: [
        {
          id: `${seed.countryId}_c1_local_suppliers`,
          text: `\u062A\u0648\u062B\u064A\u0642 \u0634\u0631\u0627\u0643\u0629 \u0645\u0639 \u0645\u0648\u0631\u062F\u064A ${seed.industrialHub} \u0627\u0644\u0645\u062D\u0644\u064A\u064A\u0646`,
          effectDescription: "\u0631\u0641\u0639 \u0627\u0644\u0633\u0645\u0639\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 +5 \u0648\u062F\u0639\u0645 \u0646\u0642\u062F\u064A \u062A\u0634\u063A\u064A\u0644\u064A +3,500 $",
          reputationDelta: 5,
          rewardMoney: 3500
        },
        {
          id: `${seed.countryId}_c1_quality_push`,
          text: "\u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0641\u064A \u0636\u0628\u0637 \u0627\u0644\u062C\u0648\u062F\u0629 \u0644\u0643\u0633\u0628 \u0639\u0642\u0648\u062F \u0627\u0644\u0641\u0626\u0629 \u0627\u0644\u0645\u0645\u062A\u0627\u0632\u0629",
          effectDescription: "\u0645\u0643\u0627\u0641\u0623\u0629 +8 \u0645\u0627\u0633\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629 \u0644\u062A\u0633\u0631\u064A\u0639 \u062E\u0637\u0648\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C",
          rewardDiamonds: 8
        }
      ]
    },
    {
      id: 2,
      title: `\u0643\u0633\u0631 \u0627\u0644\u062D\u0635\u0627\u0631 \u0627\u0644\u0645\u0627\u0644\u064A \u0648\u062F\u062E\u0648\u0644 ${seed.exchangeName}`,
      subtitle: "\u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u062B\u0627\u0646\u064A: \u0627\u0644\u062A\u0648\u0633\u0639 \u0627\u0644\u0635\u0646\u0627\u0639\u064A \u0648\u0631\u0641\u0639 \u0627\u0644\u062D\u0638\u0631 \u0627\u0644\u0645\u0635\u0631\u0641\u064A",
      characterName: seed.finance.name,
      characterAvatar: "\u{1F4CA}",
      characterTitle: seed.finance.title,
      dialogueText: `\u0623\u062F\u0627\u0624\u0643 \u0627\u0644\u0645\u0627\u0644\u064A \u0644\u0641\u062A \u0623\u0646\u0638\u0627\u0631 ${seed.bankName}! \u0627\u0644\u0622\u0646 \u0648\u0642\u062F \u0627\u0642\u062A\u0631\u0628\u0646\u0627 \u0645\u0646 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u062E\u0627\u0645\u0633\u060C \u062A\u062D\u0627\u0644\u0641 \xAB${seed.rivals[1].name}\xBB \u064A\u062D\u0627\u0648\u0644 \u0627\u062D\u062A\u0643\u0627\u0631 \u0639\u0642\u0648\u062F \u0627\u0644\u0637\u0627\u0642\u0629. \u0648\u0633\u0651\u0639 \u0634\u0631\u0643\u0627\u062A\u0643 \u0644\u0646\u0641\u0631\u0636 \u0643\u0644\u0645\u062A\u0646\u0627 \u0641\u064A ${seed.exchangeName}.`,
      objectiveText: "\u0628\u0644\u0648\u063A \u0627\u0644\u0645\u0633\u062A\u0648\u0649 5 \u0648\u0627\u0645\u062A\u0644\u0627\u0643 \u0634\u0631\u0643\u062A\u064A\u0646 \u0645\u0639 \u062A\u062D\u0642\u064A\u0642 \u0635\u0627\u0641\u064A \u0623\u0631\u0628\u0627\u062D 75,000 $",
      requiredLevel: 5,
      requiredCompanies: 2,
      requiredProfit: 75e3,
      rewardDiamonds: 30,
      rewardGoldGrams: 12,
      rewardTitle: `\u0642\u0637\u0628 \u0627\u0644\u0635\u0646\u0627\u0639\u0629 \u0641\u064A ${seed.cityShort}`,
      choices: [
        {
          id: `${seed.countryId}_c2_energy_shield`,
          text: "\u062A\u0623\u0645\u064A\u0646 \u0627\u062D\u062A\u064A\u0627\u0637\u064A \u062A\u0634\u063A\u064A\u0644\u064A \u0644\u0645\u0648\u0627\u062C\u0647\u0629 \u062A\u0642\u0644\u0628\u0627\u062A \u0627\u0644\u0637\u0627\u0642\u0629",
          effectDescription: "\u062F\u0639\u0645 \u0633\u064A\u0648\u0644\u0629 +10,000 $ \u0648\u0631\u0641\u0639 \u0627\u0644\u0633\u0645\u0639\u0629 +5",
          rewardMoney: 1e4,
          reputationDelta: 5
        },
        {
          id: `${seed.countryId}_c2_auction_expansion`,
          text: "\u062A\u0648\u062C\u064A\u0647 \u0627\u0644\u0641\u0627\u0626\u0636 \u0644\u0627\u0642\u062A\u0646\u0627\u0635 \u0627\u0644\u0641\u0631\u0635 \u0641\u064A \u0627\u0644\u0645\u0632\u0627\u062F\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629",
          effectDescription: "\u0645\u0643\u0627\u0641\u0623\u0629 +15 \u0645\u0627\u0633\u0629 \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629",
          rewardDiamonds: 15
        }
      ]
    },
    {
      id: 3,
      title: `\u0645\u0639\u0631\u0643\u0629 ${seed.portHub} \u0648\u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0639\u0627\u0628\u0631\u0629 \u0644\u0644\u062D\u062F\u0648\u062F`,
      subtitle: "\u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u062B\u0627\u0644\u062B: \u0627\u0644\u0623\u0633\u0627\u0637\u064A\u0644 \u0648\u0627\u0644\u062A\u062D\u0627\u0644\u0641\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629",
      characterName: seed.logistics.name,
      characterAvatar: "\u{1F6A2}",
      characterTitle: seed.logistics.title,
      dialogueText: `\u0628\u0648\u0627\u0628\u0627\u062A \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0641\u064A ${seed.portHub} \u0623\u0635\u0628\u062D\u062A \u0633\u0627\u062D\u0629 \u0627\u0644\u0645\u0646\u0627\u0641\u0633\u0629 \u0627\u0644\u062D\u0642\u064A\u0642\u064A\u0629! \u0628\u0627\u0645\u062A\u0644\u0627\u0643 3 \u0634\u0631\u0643\u0627\u062A \u0648\u0628\u0644\u0648\u063A \u0627\u0644\u0645\u0633\u062A\u0648\u0649 10\u060C \u0633\u0646\u0641\u062A\u062D \u062E\u0637\u0648\u0637 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0628\u062D\u0631\u064A \u0648\u0646\u0643\u0633\u0631 \u0627\u062D\u062A\u0643\u0627\u0631 \xAB${seed.rivals[1].name}\xBB \u0646\u0647\u0627\u0626\u064A\u0627\u064B.`,
      objectiveText: "\u0628\u0644\u0648\u063A \u0627\u0644\u0645\u0633\u062A\u0648\u0649 10 \u0648\u0627\u0645\u062A\u0644\u0627\u0643 3 \u0634\u0631\u0643\u0627\u062A \u0645\u0639 \u062A\u062D\u0642\u064A\u0642 \u0635\u0627\u0641\u064A \u0623\u0631\u0628\u0627\u062D 300,000 $",
      requiredLevel: 10,
      requiredCompanies: 3,
      requiredProfit: 3e5,
      rewardDiamonds: 60,
      rewardGoldGrams: 25,
      rewardTitle: `\u0633\u064A\u062F \u0645\u0648\u0627\u0646\u0626 ${seed.cityShort}`,
      choices: [
        {
          id: `${seed.countryId}_c3_fleet_launch`,
          text: `\u062A\u062F\u0634\u064A\u0646 \u062E\u0637 \u0634\u062D\u0646 \u0645\u0628\u0627\u0634\u0631 \u0645\u0646 ${seed.portHub}`,
          effectDescription: "\u0631\u0641\u0639 \u0627\u0644\u0633\u0645\u0639\u0629 +12 \u0648\u0645\u0643\u0627\u0641\u0623\u0629 +25,000 $",
          reputationDelta: 12,
          rewardMoney: 25e3
        },
        {
          id: `${seed.countryId}_c3_global_hedge`,
          text: "\u062A\u0646\u0648\u064A\u0639 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A \u0628\u0627\u0644\u0645\u0627\u0633 \u0648\u0627\u0644\u0630\u0647\u0628 \u0644\u0644\u062A\u062D\u0648\u0637 \u0627\u0644\u062F\u0648\u0644\u064A",
          effectDescription: "\u0645\u0643\u0627\u0641\u0623\u0629 +30 \u0645\u0627\u0633\u0629 \u0625\u0636\u0627\u0641\u064A\u0629",
          rewardDiamonds: 30
        }
      ]
    },
    {
      id: 4,
      title: `\u0639\u0631\u0634 \u0627\u0644\u0633\u064A\u0627\u062F\u0629 \u0627\u0644\u0627\u0642\u062A\u0635\u0627\u062F\u064A\u0629 \u0641\u064A ${seed.cityShort}`,
      subtitle: "\u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u0631\u0627\u0628\u0639: \u0627\u0644\u0645\u0646\u0627\u0642\u0635\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u0627\u0642\u0629 \u0648\u0635\u0646\u0627\u062F\u064A\u0642 \u0627\u0644\u064A\u0648\u0646\u064A\u0643\u0648\u0631\u0646",
      characterName: seed.elder.name,
      characterAvatar: "\u{1F451}",
      characterTitle: seed.elder.title,
      dialogueText: `\u0644\u0642\u062F \u062A\u062D\u0642\u0642\u062A \u0646\u0628\u0648\u0621\u0629 \u0648\u0627\u0644\u062F\u062A\u0643! \u062D\u062A\u0649 \xAB${seed.rivals[2].name}\xBB \u064A\u0637\u0644\u0628\u0648\u0646 \u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u062A\u062D\u0627\u0644\u0641 \u0645\u0639\u0643. \u062D\u0627\u0646 \u0648\u0642\u062A \u0642\u064A\u0627\u062F\u0629 \u0627\u0644\u0645\u0646\u0627\u0642\u0635\u0627\u062A \u0627\u0644\u0633\u064A\u0627\u062F\u064A\u0629 \u0648\u0631\u0639\u0627\u064A\u0629 \u0634\u0631\u0643\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644 \u0645\u0646 \u0639\u0631\u0634 ${seed.exchangeName}.`,
      objectiveText: "\u0628\u0644\u0648\u063A \u0627\u0644\u0645\u0633\u062A\u0648\u0649 15 \u0648\u0627\u0645\u062A\u0644\u0627\u0643 4 \u0634\u0631\u0643\u0627\u062A \u0645\u0639 \u0635\u0627\u0641\u064A \u0623\u0631\u0628\u0627\u062D 1,000,000 $",
      requiredLevel: 15,
      requiredCompanies: 4,
      requiredProfit: 1e6,
      rewardDiamonds: 120,
      rewardGoldGrams: 50,
      rewardTitle: "\u0627\u0644\u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631 \u0627\u0644\u0627\u0642\u062A\u0635\u0627\u062F\u064A \u0627\u0644\u0623\u0639\u0644\u0649",
      choices: [
        {
          id: `${seed.countryId}_c4_sovereign_fund`,
          text: "\u0625\u0637\u0644\u0627\u0642 \u0630\u0631\u0627\u0639 \u0627\u0633\u062A\u062D\u0648\u0627\u0630 \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u0627\u0641\u0633\u064A\u0646",
          effectDescription: "\u0645\u0643\u0627\u0641\u0623\u0629 +75,000 $ \u0646\u0642\u062F\u064A\u0629 \u0644\u062A\u0639\u0632\u064A\u0632 \u0627\u0644\u0633\u064A\u0648\u0644\u0629 \u0627\u0644\u0633\u064A\u0627\u062F\u064A\u0629",
          rewardMoney: 75e3
        },
        {
          id: `${seed.countryId}_c4_legacy_foundation`,
          text: "\u062A\u0623\u0633\u064A\u0633 \u0648\u0642\u0641 \u0627\u0628\u062A\u0643\u0627\u0631 \u0648\u0637\u0646\u064A \u0644\u0642\u064A\u0627\u062F\u0629 \u0627\u0644\u062C\u064A\u0644 \u0627\u0644\u0642\u0627\u062F\u0645",
          effectDescription: "\u0633\u0645\u0639\u0629 \u0642\u0635\u0648\u0649 +20 \u0648\u0645\u0643\u0627\u0641\u0623\u0629 +50 \u0645\u0627\u0633\u0629 \u0645\u0644\u0643\u064A\u0629",
          reputationDelta: 20,
          rewardDiamonds: 50
        }
      ]
    }
  ];
}
function buildQuestsForSeed(seed) {
  return [
    {
      id: `${seed.countryId}-quest-1-repair`,
      countryId: seed.countryId,
      stepNumber: 1,
      stageNumber: 2,
      title: `\u0625\u0639\u0627\u062F\u0629 \u062A\u0623\u0647\u064A\u0644 ${seed.inheritedFactoryName}`,
      shortDescription: `\u0627\u0631\u0641\u0639 \u0643\u0641\u0627\u0621\u0629 \u0645\u0627\u0643\u064A\u0646\u0627\u062A \u0627\u0644\u0645\u0635\u0646\u0639 \u0627\u0644\u0645\u0648\u0631\u0648\u062B \u0645\u0646 25% \u0625\u0644\u0649 100% \u0645\u0646 \u0642\u0633\u0645 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0644\u0628\u062F\u0621 \u062E\u0637\u0629 \u0627\u0644\u0625\u0646\u0642\u0627\u0630 \u0641\u064A ${seed.cityShort}.`,
      icon: "\u2699\uFE0F",
      targetSection: "companies",
      cashReward: 1500,
      diamondReward: 3,
      briefing: {
        advisorRole: "operations",
        pages: [
          `\u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u0641\u064A \u0623\u0631\u0636 \u0627\u0644\u0645\u064A\u062F\u0627\u0646 \u0628\u0640 ${seed.industrialHub}. \u0627\u0644\u0645\u0635\u0646\u0639 \u0627\u0644\u0630\u064A \u062A\u0631\u0643\u062A\u0647 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629 \u064A\u0639\u0627\u0646\u064A \u0625\u0647\u0645\u0627\u0644\u0627\u064B \u0634\u062F\u064A\u062F\u0627\u064B \u0648\u0643\u0641\u0627\u0621\u0629 \u062E\u0637\u0648\u0637\u0647 \u0645\u062A\u0648\u0642\u0641\u0629 \u0639\u0646\u062F 25% \u0641\u0642\u0637.`,
          "\u0625\u0630\u0627 \u062D\u0627\u0648\u0644\u0646\u0627 \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0628\u0647\u0630\u0647 \u0627\u0644\u062D\u0627\u0644\u0629 \u0641\u0633\u062A\u062A\u0639\u0637\u0644 \u0627\u0644\u0645\u0627\u0643\u064A\u0646\u0627\u062A \u0648\u062A\u0647\u0628\u0637 \u062C\u0648\u062F\u0629 \u0627\u0644\u0633\u0644\u0639. \u0627\u062F\u062E\u0644 \u0627\u0644\u0622\u0646 \u0625\u0644\u0649 \u0642\u0633\u0645 \xAB\u0627\u0644\u0634\u0631\u0643\u0627\u062A\xBB\u060C \u0648\u0627\u0641\u062A\u062D \u0644\u0648\u062D\u0629 \u0634\u0631\u0643\u0627\u062A\u0643 \u0627\u0644\u0642\u0627\u0626\u0645\u0629\u060C \u0648\u0627\u0636\u063A\u0637 \u0628\u0646\u0641\u0633\u0643 \u0639\u0644\u0649 \u0632\u0631 \u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0645\u0635\u0646\u0639."
        ],
        goal: "\u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0645\u0635\u0646\u0639 \u0627\u0644\u0645\u0648\u0631\u0648\u062B \u0648\u0631\u0641\u0639 \u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0645\u0627\u0643\u064A\u0646\u0627\u062A \u0625\u0644\u0649 100%.",
        whyItMatters: "\u0627\u0644\u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u062A\u062D\u0645\u064A \u062E\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0645\u0646 \u0627\u0644\u062A\u0639\u0637\u0644 \u0627\u0644\u0645\u0641\u0627\u062C\u0626 \u0648\u062A\u0631\u0641\u0639 \u062C\u0648\u062F\u0629 \u0627\u0644\u0633\u0644\u0639 \u0644\u062A\u0644\u0628\u064A\u0629 \u0634\u0631\u0648\u0637 \u0643\u0628\u0627\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u0621.",
        steps: [
          "\u0627\u0646\u062A\u0642\u0644 \u0625\u0644\u0649 \u0642\u0633\u0645 \xAB\u0627\u0644\u0634\u0631\u0643\u0627\u062A\xBB \u0645\u0646 \u0634\u0631\u064A\u0637 \u0627\u0644\u062A\u0646\u0642\u0644 \u0623\u0648 \u0644\u0648\u062D\u0629 \u0627\u0644\u0642\u064A\u0627\u062F\u0629.",
          "\u0627\u0641\u062A\u062D \u0644\u0648\u062D\u0629 \xAB\u0634\u0631\u0643\u0627\u062A\u0643 \u0627\u0644\u0642\u0627\u0626\u0645\u0629\xBB \u0644\u0645\u0639\u0627\u064A\u0646\u0629 \u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0635\u0646\u0639 \u0627\u0644\u0645\u0648\u0631\u0648\u062B (25%).",
          "\u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u0632\u0631 \xAB\u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0645\u0635\u0646\u0639\xBB \u0644\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0625\u0635\u0644\u0627\u062D \u0627\u0644\u0641\u0639\u0644\u064A."
        ],
        requiredResources: "5,000 $ \u0645\u0646 \u0627\u0644\u0633\u064A\u0648\u0644\u0629 \u0627\u0644\u0646\u0642\u062F\u064A\u0629 \u0627\u0644\u0645\u062A\u0627\u062D\u0629 (\u0631\u0635\u064A\u062F \u0627\u0644\u0628\u062F\u0627\u064A\u0629 25,000 $).",
        expectedOutcome: "\u062A\u0631\u062A\u0641\u0639 \u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0645\u0635\u0646\u0639 \u0625\u0644\u0649 100% \u0648\u062A\u0635\u0628\u062D \u062E\u0637\u0648\u0637\u0647 \u062C\u0627\u0647\u0632\u0629 \u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062E\u0627\u0645.",
        riskWarning: "\u0625\u0647\u0645\u0627\u0644 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u062A\u062D\u062A 25% \u064A\u0645\u0646\u0639 \u062A\u0634\u063A\u064A\u0644 \u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0648\u064A\u062E\u0641\u0636 \u062C\u0648\u062F\u0629 \u0627\u0644\u0628\u0636\u0627\u0626\u0639."
      },
      isAvailable: () => true,
      isCompleted: (p) => p.companies.some((c) => (c.maintenanceCondition ?? 100) >= 90),
      getProgressText: (p) => {
        const cond = Math.round(p.companies[0]?.maintenanceCondition ?? 0);
        return `\u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0645\u0635\u0646\u0639 \u0627\u0644\u062D\u0627\u0644\u064A\u0629: ${cond}% / 100%`;
      }
    },
    {
      id: `${seed.countryId}-quest-2-debt`,
      countryId: seed.countryId,
      stepNumber: 2,
      stageNumber: 2,
      title: `\u062A\u0633\u0648\u064A\u0629 \u0642\u064A\u062F ${seed.bankName} \u0627\u0644\u0645\u0648\u0631\u0648\u062B`,
      shortDescription: `\u0633\u062F\u0651\u062F \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0645\u0648\u0631\u0648\u062B (5,250 $) \u0645\u0646 \u0642\u0633\u0645 \u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A \u0644\u062D\u0645\u0627\u064A\u0629 \u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u0635\u0646\u0639 \u0648\u062A\u0646\u0638\u064A\u0641 \u0633\u062C\u0644\u0643 \u0627\u0644\u0645\u0627\u0644\u064A.`,
      icon: "\u{1F6E1}\uFE0F",
      targetSection: "obligations",
      cashReward: 1800,
      diamondReward: 3,
      briefing: {
        advisorRole: "finance",
        pages: [
          `\u0631\u0627\u062C\u0639\u0646\u0627 \u062F\u0641\u0627\u062A\u0631 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u0641\u064A ${seed.cityShort}: \u0647\u0646\u0627\u0643 \u0642\u0631\u0636 \u0637\u0627\u0631\u0626 \u0645\u0648\u0631\u0648\u062B \u0628\u0642\u064A\u0645\u0629 5,250 $ \u0644\u0635\u0627\u0644\u062D ${seed.bankName} \u0645\u0634\u0645\u0648\u0644 \u0628\u0645\u0647\u0644\u0629 \u0633\u0645\u0627\u062D 7 \u0623\u064A\u0627\u0645.`,
          "\u0631\u063A\u0645 \u0623\u0646 \u0642\u0633\u0645 \u0627\u0644\u0628\u0646\u0643 \u0645\u0642\u0641\u0644 \u062D\u0627\u0644\u064A\u0627\u064B \u0628\u0633\u0628\u0628 \u0627\u0644\u062A\u062C\u0645\u064A\u062F \u0627\u0644\u0627\u0626\u062A\u0645\u0627\u0646\u064A\u060C \u064A\u0645\u0643\u0646\u0643 \u0625\u0628\u0631\u0627\u0621 \u0630\u0645\u062A\u0643 \u0641\u0648\u0631\u0627\u064B \u0645\u0646 \u0642\u0633\u0645 \xAB\u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A\xBB \u0627\u0644\u0645\u062A\u0627\u062D \u0644\u0643\u060C \u0644\u062A\u062A\u0641\u0631\u063A \u0644\u0644\u062A\u0648\u0633\u0639 \u062F\u0648\u0646 \u062A\u0647\u062F\u064A\u062F \u0628\u062A\u0648\u0642\u0641 \u0627\u0644\u0637\u0627\u0642\u0629 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u0633\u0627\u0628\u0639."
        ],
        goal: `\u0633\u062F\u0627\u062F \u0627\u0644\u0642\u0631\u0636 \u0627\u0644\u0645\u0648\u0631\u0648\u062B \u0628\u0642\u064A\u0645\u0629 5,250 $ \u0639\u0628\u0631 \u0642\u0633\u0645 \u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A.`,
        whyItMatters: "\u0623\u064A \u0627\u0644\u062A\u0632\u0627\u0645 \u0645\u062A\u0623\u062E\u0631 \u063A\u064A\u0631 \u0645\u0633\u062F\u062F \u064A\u0648\u0642\u0641 \u0625\u0645\u062F\u0627\u062F \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u064A\u0648\u0645\u064A \u0644\u0644\u0645\u0635\u0627\u0646\u0639 \u0648\u064A\u062C\u0645\u062F \u0646\u0645\u0648 \u0627\u0644\u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631\u064A\u0629.",
        steps: [
          "\u0627\u0641\u062A\u062D \u0642\u0633\u0645 \xAB\u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A\xBB \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629.",
          "\u0627\u0641\u062A\u062D \u0644\u0648\u062D\u0629 \xAB\u062E\u0631\u064A\u0637\u0629 \u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A \u0648\u0627\u0644\u062F\u064A\u0648\u0646\xBB \u0648\u0627\u0633\u062A\u0639\u0631\u0636 \u0627\u0644\u0642\u0631\u0636 \u0627\u0644\u0645\u0648\u0631\u0648\u062B.",
          "\u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u0632\u0631 \xAB\u0633\u062F\u0627\u062F \u0642\u0633\u0637 \u0637\u0648\u0639\u064A\xBB \u0644\u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0645\u062F\u064A\u0648\u0646\u064A\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644."
        ],
        requiredResources: "5,250 $ \u0643\u0627\u0634 \u0644\u062A\u0633\u0648\u064A\u0629 \u0623\u0635\u0644 \u0627\u0644\u0642\u0631\u0636 \u0648\u0641\u0627\u0626\u062F\u062A\u0647.",
        expectedOutcome: "\u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0645\u062F\u064A\u0648\u0646\u064A\u0629 \u0627\u0644\u0645\u0648\u0631\u0648\u062B\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0648\u062D\u0645\u0627\u064A\u0629 \u0637\u0627\u0642\u0629 \u0645\u0635\u0627\u0646\u0639\u0643 \u0645\u0646 \u0623\u064A \u062A\u062C\u0645\u064A\u062F \u0645\u0633\u062A\u0642\u0628\u0644\u064A.",
        riskWarning: "\u062A\u0631\u0643 \u0627\u0644\u0642\u0631\u0636 \u062F\u0648\u0646 \u0633\u064A\u0648\u0644\u0629 \u0643\u0627\u0641\u064A\u0629 \u0639\u0646\u062F \u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u0633\u0627\u0628\u0639 \u064A\u062D\u0648\u0644\u0647 \u0625\u0644\u0649 \u0627\u0644\u062A\u0632\u0627\u0645 \u0645\u062A\u0623\u062E\u0631 \u064A\u0648\u0642\u0641 \u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u0635\u0627\u0646\u0639."
      },
      isAvailable: (p) => computeUnlockedSections(p).includes("obligations"),
      isCompleted: (p) => {
        const activeLoans = p.banking?.loans?.filter((l) => l.status === "active") ?? [];
        return activeLoans.length === 0 && p.payables === 0;
      },
      getProgressText: (p) => {
        const activeLoans = p.banking?.loans?.filter((l) => l.status === "active") ?? [];
        return activeLoans.length === 0 ? "\u062A\u0645 \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0642\u0631\u0636 \u0627\u0644\u0645\u0648\u0631\u0648\u062B \u0628\u0627\u0644\u0643\u0627\u0645\u0644" : `\u0645\u062A\u0628\u0642\u064A \u0642\u0631\u0636 \u0646\u0634\u0637 \u0628\u0642\u064A\u0645\u0629 ${activeLoans[0].remainingBalance.toLocaleString("ar-EG")} $`;
      }
    },
    {
      id: `${seed.countryId}-quest-3-land`,
      countryId: seed.countryId,
      stepNumber: 3,
      stageNumber: 2,
      title: `\u062D\u064A\u0627\u0632\u0629 \u0623\u0631\u0636 \u0627\u0644\u062A\u0648\u0633\u0639 \u0641\u064A ${seed.cityShort}`,
      shortDescription: `\u0627\u0634\u062A\u0631\u0650 \xAB${seed.starterLandOfferName}\xBB \u0645\u0646 \u0642\u0633\u0645 \u0627\u0644\u0623\u0631\u0627\u0636\u064A \u0644\u062A\u0623\u0645\u064A\u0646 \u0645\u0648\u0642\u0639 \u0644\u0644\u062A\u0648\u0633\u0639 \u0627\u0644\u0642\u0627\u062F\u0645.`,
      icon: "\u{1F3DE}\uFE0F",
      targetSection: "lands",
      cashReward: 1500,
      diamondReward: 4,
      briefing: {
        advisorRole: "elder",
        pages: [
          `\u0645\u0635\u0646\u0639 \u0648\u0627\u062D\u062F \u0644\u0627 \u064A\u0635\u0646\u0639 \u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631\u064A\u0629 \u064A\u0627 \u0628\u0646\u064A! \u0648\u062C\u062F\u0646\u0627 \u0641\u0631\u0635\u0629 \u0645\u0645\u062A\u0627\u0632\u0629 \u0628\u0633\u0639\u0631 \u0645\u062F\u0639\u0648\u0645 \u0644\u0644\u0645\u0633\u062A\u062B\u0645\u0631\u064A\u0646 \u0627\u0644\u062C\u062F\u062F: \xAB${seed.starterLandOfferName}\xBB \u0645\u0642\u0627\u0628\u0644 3,600 $ \u0641\u0642\u0637.`,
          "\u0644\u0627\u062D\u0638 \u0642\u0627\u0639\u062F\u0629 \u0627\u0642\u062A\u0635\u0627\u062F\u064A\u0629 \u0645\u0647\u0645\u0629 \u0641\u064A \u0639\u0627\u0644\u0645 \u0627\u0644\u0623\u0639\u0645\u0627\u0644: \u0627\u0644\u0623\u0631\u0636 \u0627\u0644\u0645\u0634\u062A\u0631\u0627\u0629 \u0627\u0644\u064A\u0648\u0645 \u062A\u062E\u0636\u0639 \u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0646\u0642\u0644 \u0627\u0644\u0645\u0644\u0643\u064A\u0629 \u0648\u062A\u0635\u0628\u062D \u062C\u0627\u0647\u0632\u0629 \u0644\u062A\u0623\u0633\u064A\u0633 \u0634\u0631\u0643\u0629 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u062A\u0627\u0644\u064A\u060C \u0644\u0630\u0627 \u0641\u0625\u0646 \u062D\u062C\u0632\u0647\u0627 \u0645\u0628\u0643\u0631\u0627\u064B \u062E\u0637\u0648\u0629 \u0630\u0643\u064A\u0629."
        ],
        goal: "\u0634\u0631\u0627\u0621 \u0642\u0637\u0639\u0629 \u0623\u0631\u0636 \u062B\u0627\u0646\u064A\u0629 \u062A\u0631\u0641\u0639 \u0625\u062C\u0645\u0627\u0644\u064A \u0623\u0631\u0627\u0636\u064A\u0643 \u0627\u0644\u0645\u0645\u0644\u0648\u0643\u0629 \u0625\u0644\u0649 \u0642\u0637\u0639\u062A\u064A\u0646.",
        whyItMatters: "\u0643\u0644 \u0634\u0631\u0643\u0629 \u062C\u062F\u064A\u062F\u0629 \u062A\u0634\u062A\u0631\u0637 \u0623\u0631\u0636\u0627\u064B \u0645\u0645\u0644\u0648\u0643\u0629 \u063A\u064A\u0631 \u0645\u0634\u063A\u0648\u0644\u0629 \u0648\u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0646\u0648\u0639 \u0627\u0644\u0642\u0637\u0627\u0639 (\u0635\u0646\u0627\u0639\u064A \u0623\u0648 \u0632\u0631\u0627\u0639\u064A \u0623\u0648 \u062A\u062C\u0627\u0631\u064A).",
        steps: [
          "\u0627\u0646\u062A\u0642\u0644 \u0625\u0644\u0649 \u0642\u0633\u0645 \xAB\u0627\u0644\u0623\u0631\u0627\u0636\u064A\xBB.",
          "\u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \xAB\u0641\u062A\u062D \u0639\u0631\u0636 \u0627\u0644\u0628\u062F\u0627\u064A\u0629\xBB \u0644\u0645\u0639\u0627\u064A\u0646\u0629 \u0627\u0644\u0645\u0633\u0627\u062D\u0629 \u0648\u0627\u0644\u0633\u0639\u0631 \u0648\u0646\u0648\u0639 \u0627\u0644\u0623\u0631\u0636.",
          "\u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \xAB\u0634\u0631\u0627\u0621 \u0627\u0644\u0623\u0631\u0636 \u0646\u0642\u062F\u064B\u0627\xBB \u0644\u0625\u062A\u0645\u0627\u0645 \u0646\u0642\u0644 \u0627\u0644\u0645\u0644\u0643\u064A\u0629."
        ],
        requiredResources: "3,600 $ \u0643\u0627\u0634 \u0644\u0639\u0631\u0636 \u0627\u0644\u0628\u062F\u0627\u064A\u0629 (\u0623\u0648 \u0639\u0631\u0636 \u0623\u0631\u0636 \u0645\u0628\u0627\u0634\u0631).",
        expectedOutcome: "\u0627\u0631\u062A\u0641\u0627\u0639 \u0623\u0635\u0648\u0644\u0643 \u0627\u0644\u0639\u0642\u0627\u0631\u064A\u0629 \u0625\u0644\u0649 \u0642\u0637\u0639\u062A\u064A \u0623\u0631\u0636 \u0648\u0627\u0643\u062A\u0633\u0627\u0628 \u0646\u0642\u0627\u0637 \u062E\u0628\u0631\u0629 \u062A\u0642\u0631\u0628\u0643 \u0645\u0646 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u062A\u0627\u0644\u064A.",
        riskWarning: "\u0625\u0646\u0641\u0627\u0642 \u0643\u0644 \u0627\u0644\u0633\u064A\u0648\u0644\u0629 \u0639\u0644\u0649 \u0623\u0631\u0627\u0636\u064D \u0628\u0627\u0647\u0638\u0629 \u0642\u062F \u064A\u062D\u0631\u0645\u0643 \u0645\u0646 \u0633\u064A\u0648\u0644\u0629 \u0634\u0631\u0627\u0621 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062E\u0627\u0645 \u0644\u0644\u062A\u0634\u063A\u064A\u0644."
      },
      isAvailable: (p) => computeUnlockedSections(p).includes("lands"),
      isCompleted: (p) => (p.lands?.length ?? 0) >= 2,
      getProgressText: (p) => `\u0627\u0644\u0623\u0631\u0627\u0636\u064A \u0627\u0644\u0645\u0633\u062C\u0644\u0629 \u0628\u0627\u0633\u0645\u0643: ${p.lands?.length ?? 0} / 2`
    },
    {
      id: `${seed.countryId}-quest-4-produce`,
      countryId: seed.countryId,
      stepNumber: 4,
      stageNumber: 3,
      title: "\u062A\u0623\u0645\u064A\u0646 \u0627\u0644\u062E\u0627\u0645\u0627\u062A \u0648\u062A\u0634\u063A\u064A\u0644 \u062E\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0627\u0644\u0623\u0648\u0644",
      shortDescription: "\u0627\u0634\u062A\u0631\u0650 \u0627\u0644\u062D\u0628\u0648\u0628 \u0648\u0645\u0648\u0627\u062F \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0645\u0646 \u0627\u0644\u0645\u062E\u0627\u0632\u0646 (\u0623\u0648 \u0627\u0644\u062A\u0648\u0631\u064A\u062F \u0627\u0644\u0641\u0648\u0631\u064A) \u0648\u0623\u0637\u0644\u0642 \u0623\u0648\u0644 \u0623\u0645\u0631 \u0625\u0646\u062A\u0627\u062C \u0644\u0644\u0639\u0628\u0648\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629.",
      icon: "\u{1F3ED}",
      targetSection: "production",
      cashReward: 2e3,
      diamondReward: 5,
      briefing: {
        advisorRole: "operations",
        pages: [
          `\u062D\u0627\u0646 \u0648\u0642\u062A \u062F\u0648\u0631\u0627\u0646 \u0639\u062C\u0644\u0629 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0641\u064A ${seed.inheritedFactoryName}! \u0648\u0635\u0641\u0629 \u0627\u0644\u0639\u0628\u0648\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 4 \u0643\u062C\u0645 \u062D\u0628\u0648\u0628 \u0632\u0631\u0627\u0639\u064A\u0629 + 1 \u0648\u062D\u062F\u0629 \u0645\u0648\u0627\u062F \u062A\u063A\u0644\u064A\u0641 + 6 \u0648\u062D\u062F\u0627\u062A \u0637\u0627\u0642\u0629 \u0644\u0643\u0644 \u062F\u0641\u0639\u0629.`,
          "\u064A\u0645\u0643\u0646\u0643 \u0634\u0631\u0627\u0621 \u0627\u0644\u062D\u0628\u0648\u0628 \u0648\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0628\u0623\u0641\u0636\u0644 \u0633\u0639\u0631 \u0645\u0646 \xAB\u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062E\u0627\u0645 \u0648\u0627\u0644\u0645\u062E\u0627\u0632\u0646\xBB \u062B\u0645 \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u062F\u0641\u0639\u0629 \u0645\u0646 \xAB\u0627\u0644\u0645\u0635\u0627\u0646\u0639 \u0648\u0627\u0644\u0625\u0646\u062A\u0627\u062C\xBB\u060C \u0623\u0648 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u062A\u0648\u0631\u064A\u062F \u0648\u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0641\u0648\u0631\u064A \u0628\u0639\u062F \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u062A\u0643\u0644\u0641\u0629."
        ],
        goal: "\u0625\u0637\u0644\u0627\u0642 \u0623\u0648\u0644 \u0623\u0645\u0631 \u0625\u0646\u062A\u0627\u062C \u0641\u0639\u0644\u064A \u0641\u064A \u0645\u0635\u0646\u0639\u0643.",
        whyItMatters: "\u0627\u0644\u0625\u0646\u062A\u0627\u062C \u064A\u062D\u0648\u0644 \u0627\u0644\u0633\u064A\u0648\u0644\u0629 \u0627\u0644\u0633\u0627\u0643\u0646\u0629 \u0625\u0644\u0649 \u0628\u0636\u0627\u0626\u0639 \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u0628\u064A\u0639 \u0628\u0631\u0628\u062D \u0635\u0627\u0641\u064D \u0648\u064A\u0643\u0633\u0628\u0643 \u0646\u0642\u0627\u0637 \u062E\u0628\u0631\u0629 \u0644\u0641\u062A\u062D \u0627\u0644\u0639\u0642\u0648\u062F.",
        steps: [
          "\u062A\u0623\u0643\u062F \u0645\u0646 \u062A\u0648\u0641\u0631 \u0627\u0644\u062D\u0628\u0648\u0628 \u0627\u0644\u0632\u0631\u0627\u0639\u064A\u0629 \u0648\u0645\u0648\u0627\u062F \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0641\u064A \u0642\u0633\u0645 \xAB\u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062E\u0627\u0645 \u0648\u0627\u0644\u0645\u062E\u0627\u0632\u0646\xBB.",
          "\u0627\u0646\u062A\u0642\u0644 \u0625\u0644\u0649 \u0642\u0633\u0645 \xAB\u0627\u0644\u0645\u0635\u0627\u0646\u0639 \u0648\u0627\u0644\u0625\u0646\u062A\u0627\u062C\xBB \u0648\u0627\u0641\u062A\u062D \u0644\u0648\u062D\u0629 \xAB\u062E\u0637\u0648\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C\xBB.",
          "\u062D\u062F\u062F \u0627\u0644\u0645\u0635\u0646\u0639 \u0648\u0639\u062F\u062F \u0627\u0644\u062F\u0641\u0639\u0627\u062A \u062B\u0645 \u0627\u0636\u063A\u0637 \u0644\u062A\u0634\u063A\u064A\u0644 \u062E\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C."
        ],
        requiredResources: "\u0646\u062D\u0648 60\u2013300 $ \u062D\u0633\u0628 \u0639\u062F\u062F \u0627\u0644\u062F\u0641\u0639\u0627\u062A \u0644\u062A\u063A\u0637\u064A\u0629 \u0627\u0644\u062E\u0627\u0645\u0627\u062A \u0648\u0627\u0644\u0637\u0627\u0642\u0629 \u0648\u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0648\u0642\u0627\u0626\u064A\u0629.",
        expectedOutcome: "\u062C\u062F\u0648\u0644\u0629 \u0623\u0645\u0631 \u0625\u0646\u062A\u0627\u062C \u0641\u0639\u0644\u064A \u064A\u0643\u062A\u0645\u0644 \u0645\u0639 \u062A\u0631\u062D\u064A\u0644 \u0627\u0644\u064A\u0648\u0645 \u0648\u064A\u0636\u064A\u0641 \u0639\u0628\u0648\u0627\u062A \u063A\u0630\u0627\u0626\u064A\u0629 \u062C\u0627\u0647\u0632\u0629 \u0644\u0645\u062E\u0632\u0646\u0643.",
        riskWarning: "\u062A\u0634\u063A\u064A\u0644 \u062F\u0641\u0639\u0627\u062A \u062A\u0641\u0648\u0642 \u0633\u0639\u0629 \u0627\u0644\u0645\u062E\u0632\u0646 \u0623\u0648 \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u0633\u064A\u064F\u0631\u0641\u0636 \u0644\u062D\u0645\u0627\u064A\u0629 \u0645\u0648\u0627\u0631\u062F\u0643."
      },
      isAvailable: (p) => computeUnlockedSections(p).includes("production"),
      isCompleted: (p) => (p.productionOrders?.length ?? 0) > 0,
      getProgressText: (p) => `\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0627\u0644\u0645\u0633\u062C\u0644\u0629: ${p.productionOrders?.length ?? 0} / 1`
    },
    {
      id: `${seed.countryId}-quest-5-sell`,
      countryId: seed.countryId,
      stepNumber: 5,
      stageNumber: 4,
      title: `\u0625\u062A\u0645\u0627\u0645 \u0623\u0648\u0644 \u0635\u0641\u0642\u0629 \u0628\u064A\u0639 \u0641\u064A \u0633\u0648\u0642 ${seed.cityShort}`,
      shortDescription: "\u0627\u0646\u062A\u0638\u0631 \u0627\u0643\u062A\u0645\u0627\u0644 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0641\u064A \u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u062A\u0627\u0644\u064A\u060C \u062B\u0645 \u0628\u0650\u0639 \u0627\u0644\u0639\u0628\u0648\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \u0645\u0646 \u0642\u0633\u0645 \u0627\u0644\u0645\u062E\u0627\u0632\u0646 \u0644\u062A\u062D\u0642\u064A\u0642 \u0623\u0648\u0644 \u0625\u064A\u0631\u0627\u062F \u062A\u062C\u0627\u0631\u064A.",
      icon: "\u{1F4B0}",
      targetSection: "inventory",
      cashReward: 2400,
      diamondReward: 5,
      briefing: {
        advisorRole: "logistics",
        pages: [
          `\u0627\u0644\u0633\u0644\u0639 \u0627\u0644\u0645\u062E\u0632\u0646\u0629 \u0641\u064A \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639 \u0647\u064A \u0631\u0623\u0633 \u0645\u0627\u0644 \u0645\u062C\u0645\u0651\u062F \u0625\u0644\u0649 \u0623\u0646 \u062A\u062A\u062D\u0648\u0644 \u0625\u0644\u0649 \u0646\u0642\u062F \u0641\u064A \u062E\u0632\u064A\u0646\u062A\u0643! \u0628\u0645\u062C\u0631\u062F \u062A\u0631\u062D\u064A\u0644 \u0627\u0644\u064A\u0648\u0645 \u0648\u0627\u0643\u062A\u0645\u0627\u0644 \u0623\u0645\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C\u060C \u0633\u062A\u062C\u062F \u0627\u0644\u0639\u0628\u0648\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \u0641\u064A \u0642\u0633\u0645 \xAB\u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062E\u0627\u0645 \u0648\u0627\u0644\u0645\u062E\u0627\u0632\u0646\xBB.`,
          `\u0631\u0627\u0642\u0628 \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u064A\u0648\u0645\u064A \u0648\u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u0645\u062A\u0627\u062D \u0641\u064A \u0633\u0648\u0642 ${seed.cityShort}\u060C \u062B\u0645 \u0646\u0641\u0651\u0630 \u0623\u0648\u0644 \u0639\u0645\u0644\u064A\u0629 \u0628\u064A\u0639 \u0644\u0641\u062A\u062D \u0628\u0627\u0628 \xAB\u0627\u0644\u0639\u0642\u0648\u062F \u0648\u0627\u0644\u0639\u0645\u0644\u0627\u0621\xBB \u0641\u064A \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629!`
        ],
        goal: "\u0625\u0643\u0645\u0627\u0644 \u0625\u0646\u062A\u0627\u062C \u0634\u062D\u0646\u0629 \u0648\u0628\u064A\u0639\u0647\u0627 \u0641\u0639\u0644\u064A\u0627\u064B \u0641\u064A \u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0645\u062D\u0644\u064A.",
        whyItMatters: "\u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0645\u0639 \u0623\u0648\u0644 \u0639\u0645\u0644\u064A\u0629 \u0628\u064A\u0639 \u064A\u0641\u062A\u062D \u0642\u0633\u0645 \xAB\u0627\u0644\u0639\u0642\u0648\u062F \u0648\u0627\u0644\u0639\u0645\u0644\u0627\u0621\xBB \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0648\u064A\u062D\u0642\u0642 \u0623\u0648\u0644 \u062A\u062F\u0641\u0642 \u0646\u0642\u062F\u064A \u062A\u0634\u063A\u064A\u0644\u064A.",
        steps: [
          "\u0625\u0630\u0627 \u0643\u0627\u0646 \u0623\u0645\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0644\u0627 \u064A\u0632\u0627\u0644 \u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630\u060C \u0627\u0646\u062A\u0638\u0631 \u0623\u0648 \u0631\u062D\u0651\u0644 \u0627\u0644\u064A\u0648\u0645 \u062D\u062A\u0649 \u064A\u0643\u062A\u0645\u0644.",
          "\u0627\u0641\u062A\u062D \u0642\u0633\u0645 \xAB\u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062E\u0627\u0645 \u0648\u0627\u0644\u0645\u062E\u0627\u0632\u0646\xBB \u062B\u0645 \u0644\u0648\u062D\u0629 \xAB\u0628\u064A\u0639 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A\xBB.",
          "\u062D\u062F\u062F \u0627\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0644\u0637\u0644\u0628 \u0627\u0644\u064A\u0648\u0645\u064A \u0648\u0627\u0636\u063A\u0637 \xAB\u0628\u064A\u0639 \u0628\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\xBB."
        ],
        requiredResources: "\u0645\u0646\u062A\u062C\u0627\u062A \u0645\u0643\u062A\u0645\u0644\u0629 \u0627\u0644\u0635\u0646\u0639 \u062F\u0627\u062E\u0644 \u0627\u0644\u0645\u062E\u0632\u0646 (\u0645\u062B\u0644 \u0627\u0644\u0639\u0628\u0648\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629).",
        expectedOutcome: "\u062A\u062D\u0635\u064A\u0644 \u0625\u064A\u0631\u0627\u062F \u0646\u0642\u062F\u064A \u0628\u0639\u062F \u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u0648\u0641\u062A\u062D \u0646\u0638\u0627\u0645 \u0627\u0644\u0639\u0642\u0648\u062F \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0645\u0639 \u0643\u0628\u0627\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u0621.",
        riskWarning: "\u0645\u062D\u0627\u0648\u0644\u0629 \u0628\u064A\u0639 \u0643\u0645\u064A\u0629 \u062A\u062A\u062C\u0627\u0648\u0632 \u062D\u062C\u0645 \u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u064A\u0648\u0645\u064A \u0644\u0644\u0633\u0648\u0642 \u0633\u062A\u064F\u0631\u0641\u0636\u061B \u0628\u0650\u0639 \u0639\u0644\u0649 \u0642\u062F\u0631 \u0627\u0633\u062A\u064A\u0639\u0627\u0628 \u0627\u0644\u0633\u0648\u0642."
      },
      isAvailable: (p) => computeUnlockedSections(p).includes("inventory"),
      isCompleted: (p) => (p.sales?.length ?? 0) > 0,
      getProgressText: (p) => `\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0628\u064A\u0639 \u0627\u0644\u0645\u0643\u062A\u0645\u0644\u0629: ${p.sales?.length ?? 0} / 1`
    },
    {
      id: `${seed.countryId}-quest-6-contract`,
      countryId: seed.countryId,
      stepNumber: 6,
      stageNumber: 6,
      title: `\u062A\u0633\u0644\u064A\u0645 \u0623\u0648\u0644 \u0639\u0642\u062F \u0631\u0633\u0645\u064A \u0648\u0631\u0641\u0639 \u062D\u0638\u0631 ${seed.bankName}`,
      shortDescription: `\u0627\u0642\u0628\u0644 \u0639\u0642\u062F\u0627\u064B \u062A\u062C\u0627\u0631\u064A\u0627\u064B \u0645\u0646\u0627\u0633\u0628\u0627\u064B \u0645\u0646 \u0642\u0633\u0645 \u0627\u0644\u0639\u0642\u0648\u062F \u0648\u0633\u0644\u0651\u0645 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0628\u0627\u0644\u0645\u0648\u0639\u062F \u0644\u0631\u0641\u0639 \u0627\u0644\u062D\u0638\u0631 \u0639\u0646 ${seed.bankName}.`,
      icon: "\u{1F4DC}",
      targetSection: "contracts",
      cashReward: 3500,
      diamondReward: 8,
      briefing: {
        advisorRole: "logistics",
        pages: [
          `\u0633\u0645\u0639\u062A\u0643 \u0628\u062F\u0623\u062A \u062A\u0646\u062A\u0634\u0631 \u0628\u064A\u0646 \u062A\u062C\u0627\u0631 ${seed.cityShort}! \u0642\u0633\u0645 \xAB\u0627\u0644\u0639\u0642\u0648\u062F \u0648\u0627\u0644\u0639\u0645\u0644\u0627\u0621\xBB \u0623\u0635\u0628\u062D \u0645\u0641\u062A\u0648\u062D\u0627\u064B \u0627\u0644\u0622\u0646 \u0648\u064A\u0639\u0631\u0636 \u0637\u0644\u0628\u064A\u0627\u062A \u062D\u0642\u064A\u0642\u064A\u0629 \u0645\u0646 \u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0645\u062D\u0644\u064A.`,
          `\u0625\u0646\u062C\u0627\u0632 \u0623\u0648\u0644 \u0639\u0642\u062F \u0648\u062A\u0633\u0644\u064A\u0645\u0647 \u0642\u0628\u0644 \u0645\u0648\u0639\u062F\u0647 \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u0633\u064A\u0642\u0646\u0639 \u0625\u062F\u0627\u0631\u0629 ${seed.bankName} \u0628\u0631\u0641\u0639 \u0627\u0644\u062A\u062C\u0645\u064A\u062F \u0627\u0644\u0645\u0635\u0631\u0641\u064A \u0641\u0648\u0631\u0627\u064B \u0648\u0641\u062A\u062D \u0642\u0633\u0645 \u0627\u0644\u0628\u0646\u0643 \u0648\u0627\u0644\u062A\u0645\u0648\u064A\u0644!`
        ],
        goal: "\u0642\u0628\u0648\u0644 \u0639\u0642\u062F \u062A\u062C\u0627\u0631\u064A \u0648\u062A\u0635\u0646\u064A\u0639 \u0627\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0648\u062A\u0633\u0644\u064A\u0645\u0647\u0627 \u0628\u0646\u062C\u0627\u062D \u0642\u0628\u0644 \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0645\u0647\u0644\u0629.",
        whyItMatters: "\u0627\u0644\u0639\u0642\u0648\u062F \u062A\u0645\u0646\u062D \u0639\u0644\u0627\u0648\u0629 \u0631\u0628\u062D \u0625\u0636\u0627\u0641\u064A\u0629 + \u0646\u0642\u0627\u0637 \u0633\u0645\u0639\u0629 \u062A\u062C\u0627\u0631\u064A\u0629 + \u0641\u062A\u062D \u0642\u0633\u0645 \u0627\u0644\u0628\u0646\u0643 \u0648\u0627\u0644\u062A\u0645\u0648\u064A\u0644 \u0631\u0633\u0645\u064A\u0627\u064B.",
        steps: [
          "\u0627\u062F\u062E\u0644 \u0625\u0644\u0649 \u0642\u0633\u0645 \xAB\u0627\u0644\u0639\u0642\u0648\u062F \u0648\u0627\u0644\u0639\u0645\u0644\u0627\u0621\xBB \u0648\u0631\u0627\u062C\u0639 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u0643\u0645\u064A\u0629 \u0648\u0627\u0644\u062C\u0648\u062F\u0629 \u0648\u0627\u0644\u0645\u0647\u0644\u0629.",
          "\u0627\u0642\u0628\u0644 \u0639\u0642\u062F\u0627\u064B \u062A\u0633\u062A\u0637\u064A\u0639 \u0625\u0646\u062A\u0627\u062C\u0647 (\u0645\u062B\u0644 \u0639\u0642\u062F \u0639\u0628\u0648\u0627\u062A \u063A\u0630\u0627\u0626\u064A\u0629).",
          "\u0648\u0641\u0651\u0631 \u0627\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0641\u064A \u0645\u062E\u0632\u0646\u0643 \u062B\u0645 \u0627\u0636\u063A\u0637 \xAB\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0639\u0642\u062F\xBB \u0645\u0646 \u0644\u0648\u062D\u0629 \u0627\u0644\u0639\u0642\u0648\u062F \u0627\u0644\u0646\u0634\u0637\u0629."
        ],
        requiredResources: "\u0645\u062E\u0632\u0648\u0646 \u0645\u0637\u0627\u0628\u0642 \u0644\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u0643\u0645\u064A\u0629 \u0648\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 \u0644\u0644\u062C\u0648\u062F\u0629 \u0642\u0628\u0644 \u064A\u0648\u0645 \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0639\u0642\u062F.",
        expectedOutcome: `\u062A\u062D\u0635\u064A\u0644 \u0642\u064A\u0645\u0629 \u0627\u0644\u0639\u0642\u062F + \u0639\u0644\u0627\u0648\u0629 \u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645 + \u0631\u0641\u0639 \u0627\u0644\u062A\u062C\u0645\u064A\u062F \u0639\u0646 \u0642\u0633\u0645 \xAB\u0627\u0644\u0628\u0646\u0643 \u0648\u0627\u0644\u062A\u0645\u0648\u064A\u0644\xBB.`,
        riskWarning: "\u0627\u0644\u062A\u0623\u062E\u0631 \u0639\u0646 \u0645\u0648\u0639\u062F \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u064A\u0648\u0642\u0639 \u063A\u0631\u0627\u0645\u0629 2,000 $ \u0648\u064A\u062E\u0635\u0645 6 \u0646\u0642\u0627\u0637 \u0645\u0646 \u0633\u0645\u0639\u062A\u0643 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629."
      },
      isAvailable: (p) => computeUnlockedSections(p).includes("contracts"),
      isCompleted: (p) => p.contracts.some((c) => c.status === "completed"),
      getProgressText: (p) => {
        const done = p.contracts.filter((c) => c.status === "completed").length;
        const active = p.contracts.filter((c) => c.status === "active").length;
        if (done > 0) return "\u062A\u0645 \u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0639\u0642\u062F \u0627\u0644\u0623\u0648\u0644 \u0628\u0646\u062C\u0627\u062D!";
        if (active > 0) return `\u0644\u062F\u064A\u0643 ${active} \u0639\u0642\u062F \u0646\u0634\u0637 \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u064A\u062F\u0648\u064A`;
        return "\u0644\u0645 \u064A\u062A\u0645 \u062A\u0633\u0644\u064A\u0645 \u0639\u0642\u062F \u0628\u0639\u062F (0 / 1)";
      }
    }
  ];
}
function buildEconomicEventsForSeed(seed) {
  const exportTitle = seed.eventExportTitle ?? `\u0641\u0631\u0635\u0629 \u062A\u0635\u062F\u064A\u0631 \u0639\u0628\u0631 ${seed.portHub}`;
  return [
    {
      title: `\u0637\u0644\u0628 \u0645\u062D\u0644\u064A \u0645\u0631\u062A\u0641\u0639 \u0641\u064A ${seed.cityShort}`,
      description: `\u064A\u0632\u062F\u0627\u062F \u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u064A\u0648\u0645\u064A \u0639\u0644\u0649 \u0639\u0628\u0648\u0627\u062A \u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0641\u064A \u0623\u0633\u0648\u0627\u0642 ${seed.cityShort} \u0628\u0646\u0633\u0628\u0629 \u0662\u0660\u066A \u0644\u0645\u062F\u0629 \u0663 \u0623\u064A\u0627\u0645.`,
      cashImpact: 18e3,
      industryId: "food",
      productId: "food-pack",
      demandMultiplier: 1.2,
      durationDays: 3
    },
    {
      title: `\u0636\u063A\u0637 \u0644\u0648\u062C\u0633\u062A\u064A \u0641\u064A ${seed.portHub}`,
      description: `\u064A\u0631\u062A\u0641\u0639 \u0633\u0639\u0631 \u0648\u0642\u0648\u062F \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0628\u0646\u0633\u0628\u0629 \u0661\u0660\u066A \u0644\u0645\u062F\u0629 \u064A\u0648\u0645\u064A\u0646 \u0628\u0633\u0628\u0628 \u0627\u0632\u062F\u062D\u0627\u0645 \u0627\u0644\u0634\u062D\u0646 \u0641\u064A ${seed.portHub}.`,
      cashImpact: -14e3,
      industryId: "transport",
      materialId: "fuel",
      materialPriceMultiplier: 1.1,
      durationDays: 2
    },
    {
      title: `\u064A\u0648\u0645 \u0627\u0633\u062A\u0642\u0631\u0627\u0631 \u0627\u0642\u062A\u0635\u0627\u062F\u064A \u0641\u064A ${seed.cityShort}`,
      description: `\u0645\u0624\u0634\u0631\u0627\u062A ${seed.exchangeName} \u0648\u0633\u0644\u0627\u0633\u0644 \u0627\u0644\u062A\u0648\u0631\u064A\u062F \u0645\u0633\u062A\u0642\u0631\u0629 \u0627\u0644\u064A\u0648\u0645 \u062F\u0648\u0646 \u0635\u062F\u0645\u0627\u062A \u0633\u0639\u0631\u064A\u0629 \u0625\u0636\u0627\u0641\u064A\u0629.`,
      cashImpact: 0
    },
    {
      title: `\u062D\u0627\u0641\u0632 \u062F\u0639\u0645 \u0635\u0646\u0627\u0639\u064A \u0641\u064A ${seed.industrialHub}`,
      description: `\u0645\u0646\u062D\u0629 \u062A\u062D\u0641\u064A\u0632\u064A\u0629 \u0644\u062F\u0639\u0645 \u062E\u0637\u0648\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0627\u0644\u063A\u0630\u0627\u0626\u064A \u0627\u0644\u0645\u0646\u062A\u0638\u0645\u0629 \u0641\u064A ${seed.industrialHub}.`,
      cashImpact: 26e3,
      industryId: "food"
    },
    {
      title: "\u0646\u0642\u0635 \u0645\u0624\u0642\u062A \u0641\u064A \u0627\u0644\u0641\u0648\u0644\u0627\u0630 \u0627\u0644\u0635\u0646\u0627\u0639\u064A",
      description: `\u062A\u0631\u0627\u062C\u0639 \u0627\u0644\u0645\u0639\u0631\u0648\u0636 \u0645\u0646 \u0627\u0644\u0641\u0648\u0644\u0627\u0630 \u0641\u064A ${seed.cityShort} \u064A\u0631\u0641\u0639 \u0633\u0639\u0631\u0647 \u0628\u0646\u0633\u0628\u0629 \u0662\u0665\u066A \u0644\u0645\u062F\u0629 \u0664 \u0623\u064A\u0627\u0645.`,
      cashImpact: -22e3,
      industryId: "construction",
      materialId: "steel",
      materialPriceMultiplier: 1.25,
      durationDays: 4
    },
    {
      title: exportTitle,
      description: `\u0637\u0644\u0628\u064A\u0627\u062A \u062E\u0627\u0631\u062C\u064A\u0629 \u0639\u0628\u0631 ${seed.portHub} \u062A\u0631\u0641\u0639 \u0627\u0644\u0637\u0644\u0628 \u0639\u0644\u0649 \u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629 \u0628\u0646\u0633\u0628\u0629 \u0662\u0660\u066A \u0644\u0645\u062F\u0629 \u0663 \u0623\u064A\u0627\u0645.`,
      cashImpact: 34e3,
      industryId: "electronics",
      productId: "electronics",
      demandMultiplier: 1.2,
      durationDays: 3
    },
    {
      title: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0645\u062A\u062B\u0627\u0644 \u0648\u0645\u0639\u0627\u064A\u064A\u0631 \u0628\u064A\u0626\u064A\u0629",
      description: `\u0631\u0633\u0648\u0645 \u0641\u062D\u0635 \u062A\u0646\u0638\u064A\u0645\u064A \u0648\u0645\u0639\u0627\u064A\u064A\u0631 \u0633\u0644\u0627\u0645\u0629 \u0625\u0636\u0627\u0641\u064A\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u0634\u0622\u062A \u0627\u0644\u0646\u0641\u0637\u064A\u0629 \u0641\u064A ${seed.industrialHub}.`,
      cashImpact: -18e3,
      industryId: "petroleum"
    },
    {
      title: `\u0645\u0648\u0633\u0645 \u062A\u062C\u0627\u0631\u064A \u0645\u0632\u062F\u0647\u0631 \u0641\u064A ${seed.cityShort}`,
      description: `\u0627\u0646\u062A\u0639\u0627\u0634 \u0627\u0644\u0642\u0648\u0629 \u0627\u0644\u0634\u0631\u0627\u0626\u064A\u0629 \u064A\u0631\u0641\u0639 \u0627\u0644\u0637\u0644\u0628 \u0639\u0644\u0649 \u0627\u0644\u0639\u0628\u0648\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \u0628\u0646\u0633\u0628\u0629 \u0662\u0665\u066A \u0644\u0645\u062F\u0629 \u0665 \u0623\u064A\u0627\u0645.`,
      cashImpact: 42e3,
      industryId: "food",
      productId: "food-pack",
      demandMultiplier: 1.25,
      durationDays: 5
    }
  ];
}
function buildStoryAlertsForSeed(seed) {
  return [
    {
      id: `${seed.countryId}_alert_raw_materials`,
      countryId: seed.countryId,
      advisorRole: "operations",
      urgencyLevel: "high",
      speechBubble: `\u062A\u062D\u0630\u064A\u0631 \u062A\u0634\u063A\u064A\u0644\u064A \u0645\u0646 ${seed.industrialHub}: \u062A\u062C\u0627\u0631 \u0627\u0644\u062C\u0645\u0644\u0629 \u064A\u062A\u0648\u0642\u0639\u0648\u0646 \u062A\u062D\u0631\u0643\u0627\u064B \u0641\u064A \u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u062D\u0628\u0648\u0628 \u0648\u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u063A\u062F\u0627\u064B. \u0631\u0627\u062C\u0639 \u0645\u062E\u0632\u0648\u0646\u0643 \u0641\u064A \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639 \u0648\u0623\u0645\u0651\u0646 \u0627\u062D\u062A\u064A\u0627\u062C\u0627\u062A \u062E\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0628\u0630\u0643\u0627\u0621.`,
      actionText: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062E\u0627\u0645 \u0648\u0627\u0644\u0645\u062E\u0632\u0646 \u{1F4E6}",
      targetSection: "inventory",
      rewardText: "\u062D\u0645\u0627\u064A\u0629 \u062E\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0645\u0646 \u0627\u0644\u062A\u0648\u0642\u0641 \u0648\u0646\u0642\u0635 \u0627\u0644\u0645\u062F\u062E\u0644\u0627\u062A",
      requiresActiveCompany: true
    },
    {
      id: `${seed.countryId}_alert_maintenance`,
      countryId: seed.countryId,
      advisorRole: "operations",
      urgencyLevel: "medium",
      speechBubble: `\u062A\u0642\u0631\u064A\u0631 \u0641\u0646\u064A \u0645\u0646 ${seed.inheritedFactoryName}: \u0641\u062D\u0635 \u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0645\u0627\u0643\u064A\u0646\u0627\u062A \u0628\u0627\u0646\u062A\u0638\u0627\u0645 \u064A\u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u062C\u0648\u062F\u0629 \u0627\u0644\u0633\u0644\u0639 \u0641\u0648\u0642 90% \u0648\u064A\u062D\u0645\u064A\u0643 \u0645\u0646 \u0631\u0641\u0636 \u0627\u0644\u0639\u0642\u0648\u062F.`,
      actionText: "\u0641\u062D\u0635 \u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u2699\uFE0F",
      targetSection: "companies",
      rewardText: "\u0636\u0645\u0627\u0646 \u0623\u0639\u0644\u0649 \u062C\u0648\u062F\u0629 \u0625\u0646\u062A\u0627\u062C \u0648\u0631\u0628\u062D\u064A\u0629 \u0628\u064A\u0639",
      requiresActiveCompany: true
    },
    {
      id: `${seed.countryId}_alert_contracts`,
      countryId: seed.countryId,
      advisorRole: "logistics",
      urgencyLevel: "opportunity",
      speechBubble: `\u0641\u0631\u0635\u0629 \u062A\u062C\u0627\u0631\u064A\u0629 \u0641\u064A ${seed.cityShort}! \u0643\u0628\u0627\u0631 \u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0646 \u0639\u0628\u0631 ${seed.portHub} \u0637\u0631\u062D\u0648\u0627 \u0639\u0642\u0648\u062F \u062A\u0648\u0631\u064A\u062F \u0628\u0639\u0644\u0627\u0648\u0627\u062A \u0645\u062C\u0632\u064A\u0629 \u0644\u0645\u0646 \u064A\u0644\u062A\u0632\u0645 \u0628\u0645\u0648\u0639\u062F \u0627\u0644\u062A\u0633\u0644\u064A\u0645.`,
      actionText: "\u0627\u0633\u062A\u0639\u0631\u0627\u0636 \u0627\u0644\u0639\u0642\u0648\u062F \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u{1F4DC}",
      targetSection: "contracts",
      rewardText: "\u0639\u0644\u0627\u0648\u0629 \u0646\u0642\u062F\u064A\u0629 \u0641\u0648\u0631\u064A\u0629 + \u0646\u0642\u0627\u0637 \u0633\u0645\u0639\u0629 \u062A\u062C\u0627\u0631\u064A\u0629",
      requiresContractUnlock: true
    },
    {
      id: `${seed.countryId}_alert_banking`,
      countryId: seed.countryId,
      advisorRole: "finance",
      urgencyLevel: "opportunity",
      speechBubble: `\u062A\u062D\u062F\u064A\u062B \u0645\u0635\u0631\u0641\u064A \u0645\u0646 ${seed.bankName}: \u064A\u0645\u0643\u0646\u0643 \u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0627\u0644\u0633\u064A\u0648\u0644\u0629 \u0627\u0644\u0641\u0627\u0626\u0636\u0629 \u0639\u0646 \u062D\u0627\u062C\u0629 \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0641\u064A \u0648\u062F\u0627\u0626\u0639 \u0642\u0635\u064A\u0631\u0629 \u0627\u0644\u0623\u062C\u0644 \u0628\u062F\u0644\u0627\u064B \u0645\u0646 \u062A\u0631\u0643\u0647\u0627 \u0645\u062C\u0645\u062F\u0629 \u0628\u0644\u0627 \u0639\u0627\u0626\u062F.`,
      actionText: "\u0641\u062A\u062D \u0627\u0644\u0628\u0646\u0643 \u0648\u0627\u0644\u062A\u0645\u0648\u064A\u0644 \u{1F3E6}",
      targetSection: "bank",
      rewardText: "\u0639\u0627\u0626\u062F \u0641\u0627\u0626\u062F\u0629 \u0645\u0636\u0645\u0648\u0646 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642",
      requiresBankUnlock: true
    },
    {
      id: `${seed.countryId}_alert_stocks`,
      countryId: seed.countryId,
      advisorRole: "finance",
      urgencyLevel: "opportunity",
      speechBubble: `\u062D\u0631\u0643\u0629 \u0646\u0634\u0637\u0629 \u0641\u064A ${seed.exchangeName}! \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629 \u0648\u0633\u0646\u062F\u0627\u062A \u0627\u0644\u062E\u0632\u064A\u0646\u0629 \u062A\u0633\u062C\u0644 \u0639\u0648\u0627\u0626\u062F \u062C\u0627\u0630\u0628\u0629 \u0644\u0645\u0646 \u064A\u0645\u0644\u0643 \u0641\u0627\u0626\u0636\u0627\u064B \u0646\u0642\u062F\u064A\u0627\u064B \u0641\u0648\u0642 \u0633\u064A\u0648\u0644\u0629 \u0627\u0644\u062A\u0634\u063A\u064A\u0644.`,
      actionText: "\u0641\u062A\u062D \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u0628\u0648\u0631\u0635\u0629 \u{1F4C8}",
      targetSection: "investments",
      rewardText: "\u062A\u0646\u0648\u064A\u0639 \u0645\u0635\u0627\u062F\u0631 \u0627\u0644\u062F\u062E\u0644 \u062E\u0627\u0631\u062C \u0627\u0644\u0645\u0635\u0627\u0646\u0639",
      requiresStockUnlock: true
    }
  ];
}
function createScenarioFromSeed(seed) {
  const advisors = {
    elder: {
      id: `${seed.countryId}-advisor-elder`,
      role: "elder",
      name: seed.elder.name,
      title: seed.elder.title,
      avatarEmoji: "\u{1F454}",
      initials: seed.elder.initials,
      accentGradient: "from-amber-500 to-yellow-600"
    },
    operations: {
      id: `${seed.countryId}-advisor-ops`,
      role: "operations",
      name: seed.operations.name,
      title: seed.operations.title,
      avatarEmoji: "\u{1F477}\u200D\u2642\uFE0F",
      initials: seed.operations.initials,
      accentGradient: "from-cyan-500 to-blue-600"
    },
    finance: {
      id: `${seed.countryId}-advisor-fin`,
      role: "finance",
      name: seed.finance.name,
      title: seed.finance.title,
      avatarEmoji: "\u{1F4BC}",
      initials: seed.finance.initials,
      accentGradient: "from-emerald-500 to-teal-600"
    },
    logistics: {
      id: `${seed.countryId}-advisor-log`,
      role: "logistics",
      name: seed.logistics.name,
      title: seed.logistics.title,
      avatarEmoji: "\u{1F6A2}",
      initials: seed.logistics.initials,
      accentGradient: "from-indigo-500 to-purple-600"
    }
  };
  return {
    countryId: seed.countryId,
    scenarioTitle: seed.scenarioTitle,
    economicProfile: {
      headline: seed.headline,
      strengths: seed.strengths,
      challenges: seed.challenges,
      signatureSectors: seed.signatureSectors,
      bankName: seed.bankName,
      exchangeName: seed.exchangeName,
      industrialHub: seed.industrialHub,
      portHub: seed.portHub,
      inheritedFactoryName: seed.inheritedFactoryName,
      inheritedLandName: seed.inheritedLandName,
      strategicTip: seed.strategicTip
    },
    advisors,
    stages: buildStagesForSeed(seed),
    chapters: buildChaptersForSeed(seed),
    rivals: seed.rivals,
    quests: buildQuestsForSeed(seed),
    clients: seed.clients,
    economicEvents: buildEconomicEventsForSeed(seed),
    storyAlerts: buildStoryAlertsForSeed(seed)
  };
}
var COUNTRY_SCENARIOS = {
  egypt: createScenarioFromSeed(COUNTRY_SEEDS.egypt),
  saudi: createScenarioFromSeed(COUNTRY_SEEDS.saudi),
  uae: createScenarioFromSeed(COUNTRY_SEEDS.uae),
  usa: createScenarioFromSeed(COUNTRY_SEEDS.usa),
  kuwait: createScenarioFromSeed(COUNTRY_SEEDS.kuwait),
  qatar: createScenarioFromSeed(COUNTRY_SEEDS.qatar),
  uk: createScenarioFromSeed(COUNTRY_SEEDS.uk),
  germany: createScenarioFromSeed(COUNTRY_SEEDS.germany),
  japan: createScenarioFromSeed(COUNTRY_SEEDS.japan)
};
function getCountryScenario(countryId) {
  const id = countryId && countryId in COUNTRY_SCENARIOS ? countryId : "egypt";
  return COUNTRY_SCENARIOS[id];
}
function getCountryEconomicEvent(day, countryId) {
  const scenario = getCountryScenario(countryId);
  const events = scenario.economicEvents;
  const baseIndex = Math.max(0, Math.floor(day) - 1) % events.length;
  return events[baseIndex];
}

// src/game/contracts.ts
function hash(value) {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return result >>> 0;
}
function getContractOffers(profile) {
  const clients = getCountryScenario(profile.countryId).clients;
  const ownedProductIds = (profile.companies ?? []).map((company) => findRecipeForIndustry(company.industryId)?.productId).filter((id) => Boolean(id));
  const rawProducts = [0, 1, 2].map((slot) => {
    const index = hash(`${profile.id}:${profile.day}:${slot}`) % PRODUCT_CATALOG.length;
    return PRODUCT_CATALOG[index];
  });
  if (ownedProductIds.length > 0 && !rawProducts.some((p) => ownedProductIds.includes(p.id))) {
    const ownedProduct = PRODUCT_CATALOG.find((p) => p.id === ownedProductIds[0]);
    if (ownedProduct) {
      rawProducts[0] = ownedProduct;
    }
  }
  return [0, 1, 2].map((slot) => {
    const product = rawProducts[slot];
    const client = clients[hash(`${profile.id}:${profile.day}:client:${slot}`) % clients.length];
    const quote = getMarketQuote(profile, product.id) ?? { currentPrice: product.baseSellPrice, demandUnits: 12 };
    const quantity = client.type === "bulk" ? 18 + hash(`${profile.day}:${slot}`) % 12 : 5 + hash(`${profile.day}:qty:${slot}`) % 8;
    const deadline = profile.day + (client.type === "urgent" ? 1 : client.type === "bulk" ? 4 : 3);
    const unitPrice = Math.max(1, Math.round(quote.currentPrice * client.multiplier));
    return {
      id: `contract-${profile.day}-${slot}`,
      clientName: client.name,
      clientType: client.type,
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice,
      reward: Math.round(unitPrice * quantity * 0.12),
      reputationReward: client.type === "urgent" ? 8 : 5,
      minimumQuality: client.minimumQuality,
      deadlineDay: deadline,
      description: client.description
    };
  });
}

// src/game/synergy.ts
function getSynergyBonuses(profile) {
  const companies = profile.companies;
  const has = (industryId) => companies.filter((company) => company.industryId === industryId);
  const bonuses = [];
  const food = has("food");
  const transport = has("transport");
  const production = companies.filter((company) => !["transport", "food"].includes(company.industryId));
  if (food.length > 0 && transport.length > 0) bonuses.push({ id: "supply-chain", title: "\u0633\u0644\u0633\u0644\u0629 \u0627\u0644\u063A\u0630\u0627\u0621 \u0648\u0627\u0644\u0646\u0642\u0644", description: "\u0631\u0628\u0637 \u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0628\u0627\u0644\u0646\u0642\u0644 \u064A\u062E\u0641\u0636 \u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u062A\u0634\u063A\u064A\u0644 8% \u0648\u064A\u062D\u0633\u0646 \u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0625\u0646\u062A\u0627\u062C 5%.", companyIds: [...food, ...transport].map((company) => company.id), costMultiplier: 0.92, productionMultiplier: 1.05 });
  if (transport.length > 0 && production.length > 0) bonuses.push({ id: "industrial-logistics", title: "\u0644\u0648\u062C\u0633\u062A\u064A\u0627\u062A \u0627\u0644\u0625\u0646\u062A\u0627\u062C", description: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0646\u0642\u0644 \u062A\u062E\u062F\u0645 \u062E\u0637\u0648\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0648\u062A\u062E\u0641\u0636 \u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A 6%.", companyIds: [...transport, ...production].map((company) => company.id), costMultiplier: 0.94, productionMultiplier: 1 });
  if (companies.length >= 2 && profile.inventory.some((lot) => lot.quantity > 0)) bonuses.push({ id: "shared-warehouse", title: "\u0645\u062E\u0632\u0646 \u0645\u0634\u062A\u0631\u0643", description: "\u062A\u0639\u062F\u062F \u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0645\u0639 \u0645\u062E\u0632\u0648\u0646 \u0642\u0627\u0626\u0645 \u064A\u0642\u0644\u0644 \u0645\u0635\u0631\u0648\u0641 \u0627\u0644\u062A\u0634\u063A\u064A\u0644 3%.", companyIds: companies.map((company) => company.id), costMultiplier: 0.97, productionMultiplier: 1 });
  return bonuses;
}
function getSynergyOperatingMultiplier(profile) {
  return getSynergyBonuses(profile).reduce((multiplier, bonus) => multiplier * bonus.costMultiplier, 1);
}
function getSynergyProductionMultiplier(profile) {
  return getSynergyBonuses(profile).reduce((multiplier, bonus) => multiplier * bonus.productionMultiplier, 1);
}

// src/game/globalMarket.ts
var COMMODITY_ORIGIN_META = {
  "crude-oil": {
    sector: "energy",
    certSupplierId: "sup-arabian-tankers",
    certSupplierName: "\u0627\u0644\u0634\u0631\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0644\u0646\u0627\u0642\u0644\u0627\u062A \u0627\u0644\u062E\u0627\u0645 \u0627\u0644\u0645\u0639\u062A\u0645\u062F",
    certCountry: "\u0627\u0644\u062E\u0644\u064A\u062C \u0627\u0644\u0639\u0631\u0628\u064A",
    certPort: "\u0631\u0623\u0633 \u062A\u0646\u0648\u0631\u0629 / \u0627\u0644\u0641\u062C\u064A\u0631\u0629",
    certFlag: "\u{1F6E2}\uFE0F",
    bulkSupplierId: "sup-brent-spot",
    bulkSupplierName: "\u062A\u062C\u0645\u0639 \u062A\u0635\u0641\u064A\u0629 \u0646\u0627\u0642\u0644\u0627\u062A \u0628\u062D\u0631 \u0627\u0644\u0634\u0645\u0627\u0644",
    bulkCountry: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629",
    bulkPort: "\u0645\u064A\u0646\u0627\u0621 \u0623\u0628\u0631\u062F\u064A\u0646 \u0627\u0644\u0646\u0641\u0637\u064A",
    bulkFlag: "\u{1F1EC}\u{1F1E7}",
    seaTransitDays: 1
  },
  "natural-gas": {
    sector: "energy",
    certSupplierId: "sup-lng-gulf",
    certSupplierName: "\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u062E\u0644\u064A\u062C \u0644\u0644\u063A\u0627\u0632 \u0627\u0644\u0645\u0633\u0627\u0644 LNG",
    certCountry: "\u0642\u0637\u0631",
    certPort: "\u0645\u064A\u0646\u0627\u0621 \u0631\u0627\u0633 \u0644\u0641\u0627\u0646 \u0627\u0644\u0635\u0646\u0627\u0639\u064A",
    certFlag: "\u{1F1F6}\u{1F1E6}",
    bulkSupplierId: "sup-sabine-lng",
    bulkSupplierName: "\u0645\u062D\u0637\u0629 \u0633\u0627\u0628\u064A\u0646 \u0628\u0627\u0633 \u0644\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u063A\u0627\u0632",
    bulkCountry: "\u0627\u0644\u0648\u0644\u0627\u064A\u0627\u062A \u0627\u0644\u0645\u062A\u062D\u062F\u0629",
    bulkPort: "\u0645\u064A\u0646\u0627\u0621 \u0647\u064A\u0648\u0633\u062A\u0646 \xB7 \u062A\u0643\u0633\u0627\u0633",
    bulkFlag: "\u{1F1FA}\u{1F1F8}",
    seaTransitDays: 2
  },
  fuel: {
    sector: "energy",
    certSupplierId: "sup-rotterdam-refinery",
    certSupplierName: "\u0645\u062C\u0645\u0639 \u0645\u0635\u0627\u0641\u064A \u0631\u0648\u062A\u0631\u062F\u0627\u0645 \u0627\u0644\u062F\u0648\u0644\u064A\u0629",
    certCountry: "\u0647\u0648\u0644\u0646\u062F\u0627",
    certPort: "\u0645\u064A\u0646\u0627\u0621 \u0631\u0648\u062A\u0631\u062F\u0627\u0645 \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064A",
    certFlag: "\u{1F1EA}\u{1F1FA}",
    bulkSupplierId: "sup-jurong-bunkers",
    bulkSupplierName: "\u062A\u0648\u0631\u064A\u062F\u0627\u062A \u062C\u0648\u0631\u0648\u0646\u063A \u0644\u0644\u0648\u0642\u0648\u062F \u0627\u0644\u062A\u062C\u0627\u0631\u064A",
    bulkCountry: "\u0633\u0646\u063A\u0627\u0641\u0648\u0631\u0629",
    bulkPort: "\u0645\u0636\u064A\u0642 \u0633\u0646\u063A\u0627\u0641\u0648\u0631\u0629 \u0627\u0644\u0645\u0644\u0627\u062D\u064A",
    bulkFlag: "\u{1F1F8}\u{1F1EC}",
    seaTransitDays: 1
  },
  water: {
    sector: "agri",
    certSupplierId: "sup-desal-tech",
    certSupplierName: "\u0627\u0644\u0634\u0631\u0643\u0629 \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A\u0629 \u0644\u0644\u062A\u062D\u0644\u064A\u0629 \u0648\u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0646\u0642\u064A\u0629",
    certCountry: "\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A",
    certPort: "\u0645\u062D\u0637\u0627\u062A \u062C\u0628\u0644 \u0639\u0644\u064A \u0648\u0627\u0644\u0641\u062C\u064A\u0631\u0629",
    certFlag: "\u{1F1E6}\u{1F1EA}",
    bulkSupplierId: "sup-med-utility",
    bulkSupplierName: "\u0634\u0628\u0643\u0629 \u0625\u0645\u062F\u0627\u062F \u0627\u0644\u062D\u0648\u0636 \u0627\u0644\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629",
    bulkCountry: "\u0645\u0635\u0631",
    bulkPort: "\u0645\u062C\u0645\u0639 \u0634\u0631\u0642 \u0628\u0648\u0631\u0633\u0639\u064A\u062F",
    bulkFlag: "\u{1F1EA}\u{1F1EC}",
    seaTransitDays: 1
  },
  chemicals: {
    sector: "tech-chem",
    certSupplierId: "sup-rhine-chem",
    certSupplierName: "\u0643\u0648\u0646\u0633\u0648\u0631\u062A\u064A\u0648\u0645 \u0631\u0627\u064A\u0646\u0644\u0627\u0646\u062F \u0644\u0644\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A \u0627\u0644\u062F\u0642\u064A\u0642\u0629",
    certCountry: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627",
    certPort: "\u0645\u064A\u0646\u0627\u0621 \u0647\u0627\u0645\u0628\u0648\u0631\u063A \u0627\u0644\u0635\u0646\u0627\u0639\u064A",
    certFlag: "\u{1F1E9}\u{1F1EA}",
    bulkSupplierId: "sup-jubail-petrochem",
    bulkSupplierName: "\u0627\u062A\u062D\u0627\u062F \u0627\u0644\u062C\u0628\u064A\u0644 \u0644\u0644\u0628\u062A\u0631\u0648\u0643\u064A\u0645\u0627\u0648\u064A\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629",
    bulkCountry: "\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
    bulkPort: "\u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0645\u0644\u0643 \u0641\u0647\u062F \u0627\u0644\u0635\u0646\u0627\u0639\u064A",
    bulkFlag: "\u{1F1F8}\u{1F1E6}",
    seaTransitDays: 1
  },
  grain: {
    sector: "agri",
    certSupplierId: "sup-midwest-grain",
    certSupplierName: "\u062A\u062D\u0627\u0644\u0641 \u0635\u0648\u0627\u0645\u0639 \u0627\u0644\u062D\u0628\u0648\u0628 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u0627\u0644\u062F\u0648\u0644\u064A\u0629",
    certCountry: "\u0627\u0644\u0648\u0644\u0627\u064A\u0627\u062A \u0627\u0644\u0645\u062A\u062D\u062F\u0629",
    certPort: "\u0645\u064A\u0646\u0627\u0621 \u0646\u064A\u0648 \u0623\u0648\u0631\u0644\u064A\u0646\u0632 \u0644\u0644\u062D\u0628\u0648\u0628",
    certFlag: "\u{1F1FA}\u{1F1F8}",
    bulkSupplierId: "sup-blacksea-agro",
    bulkSupplierName: "\u062A\u0648\u0631\u064A\u062F\u0627\u062A \u0627\u0644\u0628\u062D\u0631 \u0627\u0644\u0623\u0633\u0648\u062F \u0644\u0644\u062D\u0627\u0635\u0644\u0627\u062A \u0627\u0644\u0633\u0627\u0626\u0628\u0629",
    bulkCountry: "\u062D\u0648\u0636 \u0627\u0644\u0628\u062D\u0631 \u0627\u0644\u0623\u0633\u0648\u062F",
    bulkPort: "\u0631\u0635\u064A\u0641 \u0627\u0644\u0635\u0627\u062F\u0631\u0627\u062A \u0627\u0644\u0632\u0631\u0627\u0639\u064A\u0629",
    bulkFlag: "\u{1F33E}",
    seaTransitDays: 1
  },
  steel: {
    sector: "metals",
    certSupplierId: "sup-ruhr-steel",
    certSupplierName: "\u0627\u062A\u062D\u0627\u062F \u0627\u0644\u0631\u0648\u0631 \u0644\u0644\u0635\u0644\u0628 \u0627\u0644\u0647\u0646\u062F\u0633\u064A \u0627\u0644\u0645\u0639\u062A\u0645\u062F",
    certCountry: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627",
    certPort: "\u0645\u062C\u0645\u0639 \u062F\u0648\u064A\u0633\u0628\u0648\u0631\u063A \u0627\u0644\u0646\u0647\u0631\u064A",
    certFlag: "\u{1F1E9}\u{1F1EA}",
    bulkSupplierId: "sup-baoshan-metals",
    bulkSupplierName: "\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u0634\u0631\u0642 \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u0644\u0641\u0648\u0644\u0627\u0630 \u0627\u0644\u062A\u062C\u0627\u0631\u064A",
    bulkCountry: "\u0622\u0633\u064A\u0627",
    bulkPort: "\u0645\u064A\u0646\u0627\u0621 \u0628\u0648\u0633\u0627\u0646 / \u0634\u0646\u063A\u0647\u0627\u064A",
    bulkFlag: "\u{1F6A2}",
    seaTransitDays: 2
  },
  cement: {
    sector: "metals",
    certSupplierId: "sup-med-cement",
    certSupplierName: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u0645\u062A\u0648\u0633\u0637\u064A\u0629 \u0644\u0644\u0643\u0644\u0646\u0643\u0631 \u0648\u0627\u0644\u0623\u0633\u0645\u0646\u062A \u0627\u0644\u0645\u0642\u0627\u0648\u0645",
    certCountry: "\u0645\u0635\u0631",
    certPort: "\u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0633\u062E\u0646\u0629 / \u062F\u0645\u064A\u0627\u0637",
    certFlag: "\u{1F1EA}\u{1F1EC}",
    bulkSupplierId: "sup-gulf-clinker",
    bulkSupplierName: "\u0641\u0627\u0626\u0636 \u0623\u0631\u0635\u0641\u0629 \u0627\u0644\u062A\u0639\u0645\u064A\u0631 \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A\u0629",
    bulkCountry: "\u0627\u0644\u062E\u0644\u064A\u062C",
    bulkPort: "\u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0634\u0648\u064A\u062E / \u0631\u0623\u0633 \u0627\u0644\u062E\u064A\u0631",
    bulkFlag: "\u{1F3D7}\uFE0F",
    seaTransitDays: 1
  },
  silicon: {
    sector: "tech-chem",
    certSupplierId: "sup-tokyo-wafer",
    certSupplierName: "\u0634\u0631\u0643\u0629 \u0637\u0648\u0643\u064A\u0648 - \u062A\u0627\u064A\u0628\u064A\u0647 \u0644\u0631\u0642\u0627\u0626\u0642 \u0627\u0644\u0633\u064A\u0644\u064A\u0643\u0648\u0646 \u0627\u0644\u0646\u0642\u064A\u0629",
    certCountry: "\u0627\u0644\u064A\u0627\u0628\u0627\u0646",
    certPort: "\u0645\u064A\u0646\u0627\u0621 \u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627 \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A",
    certFlag: "\u{1F1EF}\u{1F1F5}",
    bulkSupplierId: "sup-shenzhen-semi",
    bulkSupplierName: "\u0633\u0648\u0642 \u0641\u0627\u0626\u0636 \u0623\u0634\u0628\u0627\u0647 \u0627\u0644\u0645\u0648\u0635\u0644\u0627\u062A \u0627\u0644\u0622\u0633\u064A\u0648\u064A",
    bulkCountry: "\u0634\u0631\u0642 \u0622\u0633\u064A\u0627",
    bulkPort: "\u0645\u0646\u0637\u0642\u0629 \u0634\u0646\u062A\u0634\u0646 \u0627\u0644\u062D\u0631\u0629",
    bulkFlag: "\u{1F52C}",
    seaTransitDays: 2
  },
  components: {
    sector: "metals",
    certSupplierId: "sup-nippon-precision",
    certSupplierName: "\u0645\u062C\u0645\u0648\u0639\u0629 \u0646\u064A\u0628\u0648\u0646 \u0648\u0628\u0627\u0641\u0627\u0631\u064A\u0627 \u0644\u0644\u0647\u0646\u062F\u0633\u0629 \u0627\u0644\u062F\u0642\u064A\u0642\u0629",
    certCountry: "\u0627\u0644\u064A\u0627\u0628\u0627\u0646 / \u0623\u0644\u0645\u0627\u0646\u064A\u0627",
    certPort: "\u0645\u064A\u0646\u0627\u0621 \u0643\u0648\u0628\u064A \u0627\u0644\u0635\u0646\u0627\u0639\u064A",
    certFlag: "\u{1F1EF}\u{1F1F5}",
    bulkSupplierId: "sup-global-parts",
    bulkSupplierName: "\u062A\u0635\u0641\u064A\u0629 \u0645\u0633\u062A\u0648\u062F\u0639\u0627\u062A \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629",
    bulkCountry: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629",
    bulkPort: "\u0645\u064A\u0646\u0627\u0621 \u0641\u064A\u0644\u064A\u0643\u0633\u062A\u0648 \u0627\u0644\u062A\u062C\u0627\u0631\u064A",
    bulkFlag: "\u{1F1EC}\u{1F1E7}",
    seaTransitDays: 2
  },
  packaging: {
    sector: "agri",
    certSupplierId: "sup-euro-pack",
    certSupplierName: "\u0627\u0644\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064A\u0629 \u0644\u0644\u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u063A\u0630\u0627\u0626\u064A \u0627\u0644\u0622\u0645\u0646",
    certCountry: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627",
    certPort: "\u0645\u064A\u0646\u0627\u0621 \u0628\u0631\u064A\u0645\u0631\u0647\u0627\u0641\u0646",
    certFlag: "\u{1F1E9}\u{1F1EA}",
    bulkSupplierId: "sup-asia-pack-bulk",
    bulkSupplierName: "\u062A\u062C\u0645\u0639 \u0645\u0635\u0627\u0646\u0639 \u0627\u0644\u062A\u063A\u0644\u064A\u0641 \u0627\u0644\u062A\u062C\u0627\u0631\u064A \u0628\u0627\u0644\u062C\u0645\u0644\u0629",
    bulkCountry: "\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A",
    bulkPort: "\u0645\u0646\u0637\u0642\u0629 \u062C\u0628\u0644 \u0639\u0644\u064A \u0627\u0644\u062D\u0631\u0629 JAFZA",
    bulkFlag: "\u{1F1E6}\u{1F1EA}",
    seaTransitDays: 1
  }
};
var COUNTRY_TRADE_PROFILES = {
  egypt: {
    advantagedMaterials: ["grain", "cement", "water", "packaging"],
    advantageDiscountPct: 8,
    baseCustomsTariffRate: 0.05,
    seaFreightMultiplier: 0.78,
    // Suez Canal strategic transit advantage
    exportHubBonusPct: 5
  },
  saudi: {
    advantagedMaterials: ["crude-oil", "natural-gas", "fuel", "chemicals"],
    advantageDiscountPct: 12,
    baseCustomsTariffRate: 0.04,
    seaFreightMultiplier: 0.88,
    exportHubBonusPct: 6
  },
  uae: {
    advantagedMaterials: ["fuel", "packaging", "water", "crude-oil"],
    advantageDiscountPct: 9,
    baseCustomsTariffRate: 0.01,
    // JAFZA / global free-zone hub
    seaFreightMultiplier: 0.75,
    exportHubBonusPct: 8
  },
  usa: {
    advantagedMaterials: ["grain", "silicon", "natural-gas", "components"],
    advantageDiscountPct: 10,
    baseCustomsTariffRate: 0.04,
    seaFreightMultiplier: 0.9,
    exportHubBonusPct: 7
  },
  kuwait: {
    advantagedMaterials: ["crude-oil", "fuel", "natural-gas", "chemicals"],
    advantageDiscountPct: 12,
    baseCustomsTariffRate: 0.04,
    seaFreightMultiplier: 0.86,
    exportHubBonusPct: 5
  },
  qatar: {
    advantagedMaterials: ["natural-gas", "crude-oil", "fuel", "chemicals"],
    advantageDiscountPct: 13,
    baseCustomsTariffRate: 0.03,
    seaFreightMultiplier: 0.85,
    exportHubBonusPct: 6
  },
  uk: {
    advantagedMaterials: ["components", "chemicals", "packaging"],
    advantageDiscountPct: 8,
    baseCustomsTariffRate: 0.02,
    // Maritime financial center
    seaFreightMultiplier: 0.82,
    exportHubBonusPct: 7
  },
  germany: {
    advantagedMaterials: ["steel", "components", "chemicals"],
    advantageDiscountPct: 11,
    baseCustomsTariffRate: 0.03,
    seaFreightMultiplier: 0.86,
    exportHubBonusPct: 9
  },
  japan: {
    advantagedMaterials: ["silicon", "components", "steel"],
    advantageDiscountPct: 12,
    baseCustomsTariffRate: 0.03,
    seaFreightMultiplier: 0.84,
    exportHubBonusPct: 9
  }
};
var BULK_TIERS_STANDARD = [
  { minQty: 20, discountPct: 4 },
  { minQty: 50, discountPct: 8 },
  { minQty: 100, discountPct: 12 }
];
var BULK_TIERS_SURPLUS = [
  { minQty: 15, discountPct: 5 },
  { minQty: 40, discountPct: 10 },
  { minQty: 80, discountPct: 15 }
];
function seededHash(value) {
  let result = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    result ^= value.charCodeAt(i);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}
function getCountryTradeProfile(countryId) {
  return COUNTRY_TRADE_PROFILES[countryId] ?? COUNTRY_TRADE_PROFILES.egypt;
}
function getOwnedMaritimeFleetCount(profileId) {
  try {
    const raw = globalThis.localStorage?.getItem(`suly_mega_expansion_v2_${profileId}`);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.maritime?.ownedVesselIds) ? parsed.maritime.ownedVesselIds.length : 0;
  } catch {
    return 0;
  }
}
function getMaterialSpotBenchmarkAtDay(profile, materialId, day) {
  const material = findMaterial(materialId);
  if (!material) return 10;
  const tradeProfile = getCountryTradeProfile(profile.countryId);
  const advantageFactor = tradeProfile.advantagedMaterials.includes(materialId) ? 1 - tradeProfile.advantageDiscountPct / 100 : 1;
  const waveSeed = seededHash(`spot:${materialId}:${day}`);
  const dailySwingPct = (waveSeed % 19 - 9) / 100;
  const eventMultiplier = (profile.events ?? []).filter(
    (ev) => ev.materialId === materialId && ev.day <= day && (ev.effectExpiresOnDay ?? ev.day) >= day && typeof ev.materialPriceMultiplier === "number"
  ).reduce((acc, ev) => acc * (ev.materialPriceMultiplier ?? 1), 1);
  return Math.max(2, Math.round(material.pricePerUnit * advantageFactor * (1 + dailySwingPct) * eventMultiplier));
}
function getPlayerFactoryMaterialIds(profile) {
  const ids = /* @__PURE__ */ new Set();
  for (const company of profile.companies ?? []) {
    const recipe = findRecipeForIndustry(company.industryId);
    if (recipe) {
      for (const input of recipe.inputs) {
        ids.add(input.materialId);
      }
    }
  }
  return ids;
}
function getSupplierTrustScore(profile, supplierId) {
  return Math.max(0, Math.min(100, Math.round(profile.supplierTrust?.[supplierId] ?? 0)));
}
function getGlobalMarketOffers(profile) {
  const country = findCountry(profile.countryId);
  const scenario = getCountryScenario(profile.countryId);
  const tradeProfile = getCountryTradeProfile(profile.countryId);
  const countryName = country?.name ?? "\u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0645\u062D\u0644\u064A";
  const countryFlag = country?.flag ?? "\u{1F310}";
  return MATERIAL_CATALOG.flatMap((material, materialIndex) => {
    const meta = COMMODITY_ORIGIN_META[material.id] ?? COMMODITY_ORIGIN_META.grain;
    const spotBenchmark = getMaterialSpotBenchmarkAtDay(profile, material.id, profile.day);
    return [0, 1, 2].map((offerIndex) => {
      if (offerIndex === 0) {
        const unitPrice2 = Math.max(1, Math.round(spotBenchmark * 1));
        const negotiable = (profile.day + materialIndex) % 3 !== 2;
        return {
          id: `global-${material.id}-day-${profile.day}-offer-0`,
          materialId: material.id,
          sellerName: `\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062D\u0631\u0629 \xB7 ${scenario.economicProfile.portHub} (${countryName})`,
          supplierId: `sup-local-freezone-${profile.countryId}`,
          originCountry: countryName,
          originPort: scenario.economicProfile.portHub,
          originFlag: countryFlag,
          sector: meta.sector,
          grade: "B",
          qualityScore: 88,
          unitPrice: unitPrice2,
          floorPrice: negotiable ? Math.max(1, Math.round(unitPrice2 * 0.9)) : unitPrice2,
          negotiable,
          confidence: "medium",
          availableStock: Math.min(material.storageLimit, 250 + seededHash(`${material.id}:${profile.day}:0`) % 5 * 50),
          minOrderQty: 1,
          isLocalFreeZone: true,
          seaDiscountRate: 0.12,
          seaTransitDays: 1,
          customsTariffRate: 0,
          bulkTiers: BULK_TIERS_STANDARD
        };
      }
      if (offerIndex === 1) {
        const unitPrice2 = Math.max(2, Math.round(spotBenchmark * 1.14));
        const negotiable = (profile.day + materialIndex) % 2 === 0;
        return {
          id: `global-${material.id}-day-${profile.day}-offer-1`,
          materialId: material.id,
          sellerName: meta.certSupplierName,
          supplierId: meta.certSupplierId,
          originCountry: meta.certCountry,
          originPort: meta.certPort,
          originFlag: meta.certFlag,
          sector: meta.sector,
          grade: "A+",
          qualityScore: 97,
          unitPrice: unitPrice2,
          floorPrice: negotiable ? Math.max(1, Math.round(unitPrice2 * 0.93)) : unitPrice2,
          negotiable,
          confidence: "high",
          availableStock: Math.min(material.storageLimit, 180 + seededHash(`${material.id}:${profile.day}:1`) % 4 * 40),
          minOrderQty: 1,
          isLocalFreeZone: false,
          seaDiscountRate: 0.18,
          seaTransitDays: meta.seaTransitDays,
          customsTariffRate: tradeProfile.baseCustomsTariffRate,
          bulkTiers: BULK_TIERS_STANDARD
        };
      }
      const unitPrice = Math.max(1, Math.round(spotBenchmark * 0.9));
      return {
        id: `global-${material.id}-day-${profile.day}-offer-2`,
        materialId: material.id,
        sellerName: meta.bulkSupplierName,
        supplierId: meta.bulkSupplierId,
        originCountry: meta.bulkCountry,
        originPort: meta.bulkPort,
        originFlag: meta.bulkFlag,
        sector: meta.sector,
        grade: "C",
        qualityScore: 78,
        unitPrice,
        floorPrice: Math.max(1, Math.round(unitPrice * 0.85)),
        negotiable: true,
        confidence: "low",
        availableStock: material.storageLimit,
        minOrderQty: 1,
        isLocalFreeZone: false,
        seaDiscountRate: 0.22,
        seaTransitDays: meta.seaTransitDays,
        customsTariffRate: tradeProfile.baseCustomsTariffRate,
        bulkTiers: BULK_TIERS_SURPLUS
      };
    });
  });
}
function resolveGlobalMarketOffer(profile, offerId) {
  return getGlobalMarketOffers(profile).find((offer) => offer.id === offerId);
}
function calculateImportQuote(profile, offer, quantity, options) {
  const safeQty = Math.max(1, Math.floor(quantity || 1));
  const shippingMode = options?.shippingMode ?? "spot-ddp";
  const paymentTerm = options?.paymentTerm ?? "cash-spot";
  const baseUnitPrice = options?.negotiatedUnitPrice ?? offer.unitPrice;
  const tradeProfile = getCountryTradeProfile(profile.countryId);
  let bulkDiscountPct = 0;
  for (const tier of offer.bulkTiers) {
    if (safeQty >= tier.minQty) {
      bulkDiscountPct = tier.discountPct;
    }
  }
  const trustScore = getSupplierTrustScore(profile, offer.supplierId);
  const trustDiscountPct = trustScore >= 50 ? 5 : trustScore >= 25 ? 3 : 0;
  const modeMultiplier = shippingMode === "sea-cif" ? 1 - offer.seaDiscountRate : shippingMode === "air-express" ? 1.08 : 1;
  const combinedDiscountMultiplier = (1 - bulkDiscountPct / 100) * (1 - trustDiscountPct / 100);
  const shippingModeUnitPrice = shippingMode === "spot-ddp" && bulkDiscountPct === 0 && trustDiscountPct === 0 ? baseUnitPrice : Math.max(1, Math.round(baseUnitPrice * modeMultiplier * combinedDiscountMultiplier));
  const merchandiseSubtotal = safeQty * shippingModeUnitPrice;
  const fleetCount = options?.fleetCount ?? getOwnedMaritimeFleetCount(profile.id);
  const fleetReductionFactor = Math.max(0.2, 1 - fleetCount * 0.35);
  let rawFreight = 0;
  if (shippingMode === "sea-cif") {
    rawFreight = Math.max(12, Math.round(merchandiseSubtotal * 0.04 * tradeProfile.seaFreightMultiplier));
  } else if (shippingMode === "air-express") {
    rawFreight = Math.max(35, Math.round(merchandiseSubtotal * 0.14));
  }
  const freightCost = shippingMode === "sea-cif" ? Math.round(rawFreight * fleetReductionFactor) : rawFreight;
  const fleetDiscountSaved = Math.max(0, rawFreight - freightCost);
  const customsDuty = shippingMode === "spot-ddp" || offer.isLocalFreeZone ? 0 : Math.round(merchandiseSubtotal * offer.customsTariffRate);
  const insuranceCost = shippingMode === "spot-ddp" ? 0 : Math.max(5, Math.round(merchandiseSubtotal * 0.01));
  const totalLandedCost = merchandiseSubtotal + freightCost + customsDuty + insuranceCost;
  const effectiveUnitCost = Math.round(totalLandedCost / safeQty * 100) / 100;
  const canUseLC = paymentTerm === "lc-net2" && shippingMode === "sea-cif" && (trustScore >= 40 || (profile.reputation ?? 50) >= 65);
  const upfrontCashDue = canUseLC ? Math.max(1, Math.round(totalLandedCost * 0.3)) : totalLandedCost;
  const deferredBalanceDue = canUseLC ? Math.max(0, totalLandedCost - upfrontCashDue) : 0;
  const transitDays = shippingMode === "sea-cif" ? offer.seaTransitDays : 0;
  return {
    quantity: safeQty,
    shippingMode,
    paymentTerm: canUseLC ? "lc-net2" : "cash-spot",
    baseUnitPrice,
    bulkDiscountPct,
    trustDiscountPct,
    shippingModeUnitPrice,
    merchandiseSubtotal,
    freightCost,
    fleetDiscountSaved,
    customsDuty,
    insuranceCost,
    totalLandedCost,
    effectiveUnitCost,
    upfrontCashDue,
    deferredBalanceDue,
    transitDays,
    arrivesOnDay: profile.day + transitDays
  };
}
var GLOBAL_EXPORT_BUYERS = [
  { id: "exp-rotterdam", name: "\u0628\u0648\u0631\u0635\u0629 \u0631\u0648\u062A\u0631\u062F\u0627\u0645 \u0644\u0644\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064A", port: "\u0645\u064A\u0646\u0627\u0621 \u0631\u0648\u062A\u0631\u062F\u0627\u0645 \xB7 \u0647\u0648\u0644\u0646\u062F\u0627", flag: "\u{1F1EA}\u{1F1FA}", minQual: 88, mult: 1.18, minQty: 6, maxQty: 60, incoterm: "CIF Rotterdam" },
  { id: "exp-singapore", name: "\u0645\u0631\u0643\u0632 \u0633\u0646\u063A\u0627\u0641\u0648\u0631\u0629 \u0644\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0622\u0633\u064A\u0648\u064A\u0629", port: "\u0645\u064A\u0646\u0627\u0621 \u0633\u0646\u063A\u0627\u0641\u0648\u0631\u0629 \u0627\u0644\u062F\u0648\u0644\u064A", flag: "\u{1F1F8}\u{1F1EC}", minQual: 84, mult: 1.14, minQty: 5, maxQty: 75, incoterm: "FOB Container" },
  { id: "exp-jebelali", name: "\u0634\u0628\u0643\u0629 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A\u0629", port: "\u0645\u064A\u0646\u0627\u0621 \u062C\u0628\u0644 \u0639\u0644\u064A \xB7 \u062F\u0628\u064A", flag: "\u{1F1E6}\u{1F1EA}", minQual: 78, mult: 1.09, minQty: 4, maxQty: 80, incoterm: "EXW / FOB" },
  { id: "exp-hamburg", name: "\u0627\u062A\u062D\u0627\u062F \u0627\u0644\u0645\u0633\u062A\u0648\u0631\u062F\u064A\u0646 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u064A\u0646 \xB7 \u0647\u0627\u0645\u0628\u0648\u0631\u063A", port: "\u0645\u064A\u0646\u0627\u0621 \u0647\u0627\u0645\u0628\u0648\u0631\u063A \xB7 \u0623\u0644\u0645\u0627\u0646\u064A\u0627", flag: "\u{1F1E9}\u{1F1EA}", minQual: 90, mult: 1.24, minQty: 8, maxQty: 50, incoterm: "DDP Europe" },
  { id: "exp-newyork", name: "\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u0633\u0627\u062D\u0644 \u0627\u0644\u0634\u0631\u0642\u064A \u0644\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F", port: "\u0645\u064A\u0646\u0627\u0621 \u0646\u064A\u0648\u064A\u0648\u0631\u0643 \u0648\u0646\u064A\u0648\u062C\u064A\u0631\u0633\u064A", flag: "\u{1F1FA}\u{1F1F8}", minQual: 85, mult: 1.16, minQty: 6, maxQty: 65, incoterm: "CIF Atlantic" },
  { id: "exp-yokohama", name: "\u0634\u0631\u0643\u0629 \u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627 \u0644\u0644\u062A\u0648\u0631\u064A\u062F \u0627\u0644\u0645\u062A\u0642\u062F\u0645", port: "\u0645\u064A\u0646\u0627\u0621 \u064A\u0648\u0643\u0648\u0647\u0627\u0645\u0627 \xB7 \u0627\u0644\u064A\u0627\u0628\u0627\u0646", flag: "\u{1F1EF}\u{1F1F5}", minQual: 91, mult: 1.26, minQty: 6, maxQty: 45, incoterm: "CIF Pacific" }
];
function getGlobalExportBids(profile) {
  const tradeProfile = getCountryTradeProfile(profile.countryId);
  const ownedProductIds = (profile.companies ?? []).map((c) => findRecipeForIndustry(c.industryId)?.productId).filter((id) => Boolean(id));
  const selectedProducts = [0, 1, 2, 3, 4, 5].map((slot) => {
    if (slot < ownedProductIds.length) {
      const owned = PRODUCT_CATALOG.find((p) => p.id === ownedProductIds[slot]);
      if (owned) return owned;
    }
    const idx = seededHash(`export-prod:${profile.id}:${profile.day}:${slot}`) % PRODUCT_CATALOG.length;
    return PRODUCT_CATALOG[idx];
  });
  const stockedProductIds = (profile.inventory ?? []).map((lot) => PRODUCT_CATALOG.find((p) => p.id === lot.materialOrProductId)).filter((p) => Boolean(p));
  stockedProductIds.forEach((prod, i) => {
    if (!selectedProducts.some((p) => p.id === prod.id) && i < selectedProducts.length) {
      selectedProducts[selectedProducts.length - 1 - i] = prod;
    }
  });
  return selectedProducts.map((product, slot) => {
    const buyer = slot === 0 ? GLOBAL_EXPORT_BUYERS[2] : GLOBAL_EXPORT_BUYERS[seededHash(`export-buyer:${profile.day}:${slot}:${product.id}`) % GLOBAL_EXPORT_BUYERS.length];
    const localRef = Math.max(1, Math.round(product.baseSellPrice * getMarketPriceProgression(profile.day)));
    const exportBonusMultiplier = 1 + tradeProfile.exportHubBonusPct / 100;
    const wave = 1 + (seededHash(`exp-wave:${product.id}:${profile.day}:${slot}`) % 13 - 5) / 100;
    const unitPrice = Math.max(localRef, Math.round(localRef * buyer.mult * exportBonusMultiplier * wave));
    const premiumPct = Math.max(0, Math.round((unitPrice - localRef) / Math.max(1, localRef) * 100));
    return {
      id: `export-bid-${profile.day}-${slot}-${product.id}`,
      buyerId: buyer.id,
      buyerName: buyer.name,
      destinationPort: buyer.port,
      destinationFlag: buyer.flag,
      productId: product.id,
      productName: product.name,
      unit: product.unit,
      minQuantity: buyer.minQty,
      maxQuantity: buyer.maxQty,
      unitPrice,
      localReferencePrice: localRef,
      premiumPct,
      exportClearanceRate: 0.02,
      // 2% export port clearance instead of high domestic sales tax
      minimumQuality: buyer.minQual,
      reputationReward: buyer.minQual >= 90 ? 4 : 2,
      incotermLabel: buyer.incoterm
    };
  });
}
function getForwardContractTemplates(profile) {
  const factoryMatIds = getPlayerFactoryMaterialIds(profile);
  const prioritized = [
    ...MATERIAL_CATALOG.filter((m) => factoryMatIds.has(m.id)),
    ...MATERIAL_CATALOG.filter((m) => !factoryMatIds.has(m.id))
  ].slice(0, 6);
  return prioritized.map((material) => {
    const meta = COMMODITY_ORIGIN_META[material.id] ?? COMMODITY_ORIGIN_META.grain;
    const spotUnitPrice = getMaterialSpotBenchmarkAtDay(profile, material.id, profile.day);
    const lockedUnitPrice = Math.max(1, Math.round(spotUnitPrice * 0.92));
    const dailyQuota = 25;
    const durationDays = 4;
    const totalContractUnits = dailyQuota * durationDays;
    const marginDeposit = Math.max(25, Math.round(totalContractUnits * lockedUnitPrice * 0.15));
    return {
      id: `fwd-${material.id}-day-${profile.day}`,
      materialId: material.id,
      materialName: material.name,
      unit: material.unit,
      supplierId: meta.certSupplierId,
      supplierName: meta.certSupplierName,
      originHub: `${meta.certPort} \xB7 ${meta.certCountry}`,
      spotUnitPrice,
      lockedUnitPrice,
      savingsPct: Math.max(5, Math.round((spotUnitPrice - lockedUnitPrice) / Math.max(1, spotUnitPrice) * 100)),
      dailyQuota,
      durationDays,
      totalContractUnits,
      marginDeposit,
      qualityScore: 94
    };
  });
}

// src/game/economicEvents.ts
var ECONOMIC_EVENT_TEMPLATES = [
  { title: "\u0637\u0644\u0628 \u0645\u062D\u0644\u064A \u0645\u0631\u062A\u0641\u0639", description: "\u064A\u0632\u062F\u0627\u062F \u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u064A\u0648\u0645\u064A \u0639\u0644\u0649 \u0639\u0628\u0648\u0627\u062A \u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0628\u0646\u0633\u0628\u0629 \u0662\u0660\u066A \u0644\u0645\u062F\u0629 \u0663 \u0623\u064A\u0627\u0645.", cashImpact: 18e3, industryId: "food", productId: "food-pack", demandMultiplier: 1.2, durationDays: 3 },
  { title: "\u0627\u0631\u062A\u0641\u0627\u0639 \u0644\u0648\u062C\u0633\u062A\u064A \u0645\u0624\u0642\u062A", description: "\u064A\u0631\u062A\u0641\u0639 \u0633\u0639\u0631 \u0648\u0642\u0648\u062F \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0628\u0646\u0633\u0628\u0629 \u0661\u0660\u066A \u0644\u0645\u062F\u0629 \u064A\u0648\u0645\u064A\u0646 \u0628\u0633\u0628\u0628 \u0636\u063A\u0637 \u0627\u0644\u0646\u0642\u0644.", cashImpact: -14e3, industryId: "transport", materialId: "fuel", materialPriceMultiplier: 1.1, durationDays: 2 },
  { title: "\u064A\u0648\u0645 \u0627\u0633\u062A\u0642\u0631\u0627\u0631 \u0627\u0642\u062A\u0635\u0627\u062F\u064A", description: "\u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0648\u0627\u0644\u0637\u0644\u0628 \u0645\u0633\u062A\u0642\u0631\u0627\u0646 \u0627\u0644\u064A\u0648\u0645\u060C \u0648\u0644\u0627 \u064A\u0648\u062C\u062F \u0623\u062B\u0631 \u0633\u0648\u0642\u064A \u0625\u0636\u0627\u0641\u064A.", cashImpact: 0 },
  { title: "\u0645\u0646\u062D\u0629 \u062F\u0639\u0645 \u0644\u0644\u0645\u0635\u0627\u0646\u0639 \u0627\u0644\u0635\u063A\u064A\u0631\u0629", description: "\u062F\u0639\u0645 \u0645\u0627\u0644\u064A \u0645\u062E\u0635\u0635 \u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0627\u0644\u0635\u063A\u064A\u0631\u0629.", cashImpact: 26e3, industryId: "food" },
  { title: "\u0646\u0642\u0635 \u0645\u0624\u0642\u062A \u0641\u064A \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062E\u0627\u0645", description: "\u064A\u0642\u0644 \u0627\u0644\u0645\u0639\u0631\u0648\u0636 \u0645\u0646 \u0627\u0644\u0641\u0648\u0644\u0627\u0630\u060C \u0641\u064A\u0631\u062A\u0641\u0639 \u0633\u0639\u0631\u0647 \u0628\u0646\u0633\u0628\u0629 \u0662\u0665\u066A \u0644\u0645\u062F\u0629 \u0664 \u0623\u064A\u0627\u0645.", cashImpact: -22e3, industryId: "construction", materialId: "steel", materialPriceMultiplier: 1.25, durationDays: 4 },
  { title: "\u0641\u0631\u0635\u0629 \u062A\u0635\u062F\u064A\u0631 \u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A\u0629", description: "\u064A\u0631\u062A\u0641\u0639 \u0627\u0644\u0637\u0644\u0628 \u0639\u0644\u0649 \u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629 \u0628\u0646\u0633\u0628\u0629 \u0662\u0660\u066A \u0644\u0645\u062F\u0629 \u0663 \u0623\u064A\u0627\u0645.", cashImpact: 34e3, industryId: "electronics", productId: "electronics", demandMultiplier: 1.2, durationDays: 3 },
  { title: "\u0641\u062D\u0635 \u062A\u0646\u0638\u064A\u0645\u064A \u0648\u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0645\u062A\u062B\u0627\u0644", description: "\u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0645\u062A\u062B\u0627\u0644 \u0625\u0636\u0627\u0641\u064A\u0629 \u0639\u0644\u0649 \u0642\u0637\u0627\u0639 \u0627\u0644\u0628\u062A\u0631\u0648\u0644.", cashImpact: -18e3, industryId: "petroleum" },
  { title: "\u0645\u0648\u0633\u0645 \u062A\u062C\u0627\u0631\u064A \u0642\u0648\u064A", description: "\u0645\u0648\u0633\u0645 \u0628\u064A\u0639 \u0642\u0648\u064A \u064A\u0631\u0641\u0639 \u0627\u0644\u0637\u0644\u0628 \u0639\u0644\u0649 \u0639\u0628\u0648\u0627\u062A \u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0628\u0646\u0633\u0628\u0629 \u0662\u0665\u066A \u0644\u0645\u062F\u0629 \u0665 \u0623\u064A\u0627\u0645.", cashImpact: 42e3, industryId: "food", productId: "food-pack", demandMultiplier: 1.25, durationDays: 5 }
];
function getEconomicEventTemplate(day, countryId) {
  if (countryId) {
    return getCountryEconomicEvent(day, countryId);
  }
  const index = Math.max(0, Math.floor(day) - 1) % ECONOMIC_EVENT_TEMPLATES.length;
  return ECONOMIC_EVENT_TEMPLATES[index];
}

// src/domain/accountFeatures.ts
var SPEED_CARD_LABELS = {
  "production-25": "\u062A\u0633\u0631\u064A\u0639 \u0627\u0644\u0625\u0646\u062A\u0627\u062C 25%",
  "production-50": "\u062A\u0633\u0631\u064A\u0639 \u0627\u0644\u0625\u0646\u062A\u0627\u062C 50%",
  "production-instant": "\u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0641\u0648\u0631\u064B\u0627",
  "capacity-boost": "\u0632\u064A\u0627\u062F\u0629 \u0627\u0644\u0633\u0639\u0629 \u0627\u0644\u0645\u0624\u0642\u062A\u0629",
  "day-speed-2x": "\u062A\u0633\u0631\u064A\u0639 \u0627\u0644\u064A\u0648\u0645 \xD72",
  "day-speed-3x": "\u062A\u0633\u0631\u064A\u0639 \u0627\u0644\u064A\u0648\u0645 \xD73"
};
var SPEED_CARD_DIAMOND_COSTS = {
  "production-25": 1,
  "production-50": 2,
  "production-instant": 3,
  "capacity-boost": 36,
  "day-speed-2x": 10,
  "day-speed-3x": 60
};

// src/game/warehouse.ts
var CAPACITIES = [
  { materials: 0, products: 0 },
  { materials: 8050, products: 6850 },
  { materials: 1e4, products: 9e3 },
  { materials: 13500, products: 12e3 },
  { materials: 18e3, products: 16e3 },
  { materials: 24e3, products: 22e3 }
];
var WAREHOUSE_UPGRADE_REQUIREMENTS = {
  2: { cash: 4e4, materials: { steel: 2, cement: 5 } },
  3: { cash: 9e4, materials: { steel: 8, cement: 16, components: 2 } },
  4: { cash: 18e4, materials: { steel: 20, cement: 45, components: 8 } },
  5: { cash: 35e4, materials: { steel: 50, cement: 100, components: 25 } }
};
function normalizeWarehouseLevel(level) {
  return typeof level === "number" && Number.isInteger(level) && level >= 1 && level <= 5 ? level : 1;
}
function getWarehouseCapacity(level) {
  return CAPACITIES[normalizeWarehouseLevel(level)];
}
function getWarehouseItemCapacity(itemId, level) {
  const multiplier = 1 + (normalizeWarehouseLevel(level) - 1) * 0.5;
  const item = MATERIAL_CATALOG.find((entry) => entry.id === itemId) ?? PRODUCT_CATALOG.find((entry) => entry.id === itemId);
  return item ? Math.floor(item.storageLimit * multiplier) : void 0;
}
function getWarehouseUsage(inventory, productionOrders) {
  const materials = new Set(MATERIAL_CATALOG.map((item) => item.id));
  const products = new Set(PRODUCT_CATALOG.map((item) => item.id));
  const materialUsage = inventory.reduce((sum, lot) => sum + (materials.has(lot.materialOrProductId) ? lot.quantity : 0), 0);
  const storedProducts = inventory.reduce((sum, lot) => sum + (products.has(lot.materialOrProductId) ? lot.quantity : 0), 0);
  const reservedProducts = productionOrders.reduce((sum, order) => sum + (order.status === "active" ? order.outputQuantity : 0), 0);
  return { materials: materialUsage, products: storedProducts + reservedProducts };
}
function getWarehouseMaterialQuantity(profile, materialId) {
  return profile.inventory.filter((lot) => lot.materialOrProductId === materialId).reduce((sum, lot) => sum + lot.quantity, 0);
}
function removeWarehouseMaterials(profile, requirements) {
  const remaining = new Map(Object.entries(requirements));
  const updated = profile.inventory.map((lot) => {
    const needed = remaining.get(lot.materialOrProductId) ?? 0;
    if (needed <= 0) return lot;
    const removed = Math.min(needed, lot.quantity);
    remaining.set(lot.materialOrProductId, needed - removed);
    return { ...lot, quantity: lot.quantity - removed };
  });
  return updated.filter((lot) => lot.quantity > 0);
}

// src/game/purchasePricing.ts
var DIAMOND_VALUE_USD = 200;
var DIAMOND_PURCHASE_DISCOUNT_RATE = 0.01;
function getDiscountedDiamondPrice(cashPrice) {
  if (!Number.isFinite(cashPrice) || cashPrice <= 0) return 0;
  return Math.floor(cashPrice * (1 - DIAMOND_PURCHASE_DISCOUNT_RATE) / DIAMOND_VALUE_USD);
}
function getCashPriceForDiamondPrice(diamondPrice) {
  if (!Number.isFinite(diamondPrice) || diamondPrice <= 0) return 0;
  return Math.ceil(diamondPrice * DIAMOND_VALUE_USD / (1 - DIAMOND_PURCHASE_DISCOUNT_RATE));
}

// src/game/season.ts
var SEASON_LENGTH_DAYS = 30;
var SEASON_ID_PREFIX = "expansion-season-";
function happenedOnDay(day, profile, occurredAt) {
  if (day !== void 0) return day === profile.day;
  if (!occurredAt) return false;
  const createdAt = Date.parse(profile.createdAt);
  const eventAt = Date.parse(occurredAt);
  return Number.isFinite(createdAt) && Number.isFinite(eventAt) && Math.max(1, Math.floor((eventAt - createdAt) / 864e5) + 1) === profile.day;
}
function startedInSeason(day, season) {
  return day !== void 0 && day >= season.startedOnDay && day <= season.endsOnDay;
}
var SEASON_CHALLENGES = [
  { id: "daily-empire", kind: "daily", title: "\u062D\u0631\u0651\u0643 \u0627\u0644\u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631\u064A\u0629", description: "\u0627\u0645\u062A\u0644\u0643 \u0634\u0631\u0643\u0629 \u0623\u0648 \u0623\u0631\u0636\u064B\u0627 \u0644\u062A\u062B\u0628\u062A \u0623\u0646 \u0627\u0644\u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631\u064A\u0629 \u062A\u062A\u062D\u0631\u0643.", points: 10, reward: 1e4, available: (profile) => profile.companies.some((item) => happenedOnDay(item.foundedOnDay, profile, item.foundedAt)) || profile.lands.some((item) => happenedOnDay(item.acquiredOnDay, profile, item.acquiredAt)) },
  { id: "daily-market", kind: "daily", title: "\u0646\u0628\u0636 \u0627\u0644\u0633\u0648\u0642", description: "\u0646\u0641\u0651\u0630 \u0639\u0645\u0644\u064A\u0629 \u0628\u064A\u0639 \u0648\u0627\u062D\u062F\u0629 \u0641\u064A \u0627\u0644\u0633\u0648\u0642.", points: 15, reward: 15e3, available: (profile) => profile.sales.some((item) => happenedOnDay(item.soldOnDay, profile, item.soldAt)) },
  { id: "daily-auction", kind: "daily", title: "\u0635\u0648\u062A \u0627\u0644\u0645\u0637\u0631\u0642\u0629", description: "\u0634\u0627\u0631\u0643 \u0641\u064A \u0645\u0632\u0627\u062F \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.", points: 15, reward: 15e3, available: (profile) => profile.auctionHistory.some((item) => item.bidder === "player" && item.day === profile.day) },
  { id: "weekly-builder", kind: "weekly", title: "\u0645\u0648\u0633\u0651\u0639 \u0627\u0644\u0623\u0639\u0645\u0627\u0644", description: "\u0623\u0633\u0633 \u0634\u0631\u0643\u062A\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u062E\u0644\u0627\u0644 \u0627\u0644\u0645\u0648\u0633\u0645.", points: 45, reward: 45e3, available: (profile, season) => profile.companies.filter((item) => startedInSeason(item.foundedOnDay, season)).length >= 2 },
  { id: "weekly-operator", kind: "weekly", title: "\u0642\u0627\u0626\u062F \u0627\u0644\u062A\u0634\u063A\u064A\u0644", description: "\u0634\u063A\u0651\u0644 \u0623\u0645\u0631 \u0625\u0646\u062A\u0627\u062C \u0648\u0627\u062D\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.", points: 35, reward: 35e3, available: (profile, season) => profile.productionOrders.some((item) => startedInSeason(item.startedOnDay, season)) },
  { id: "weekly-investor", kind: "weekly", title: "\u0639\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644", description: "\u0623\u0646\u0634\u0626 \u0627\u0633\u062A\u062B\u0645\u0627\u0631\u064B\u0627 \u0623\u0648 \u0648\u062F\u064A\u0639\u0629 \u0645\u062D\u0627\u0643\u0627\u0629.", points: 30, reward: 3e4, available: (profile, season) => profile.investments.some((item) => startedInSeason(item.startedOnDay, season)) || profile.banking.deposits.some((item) => startedInSeason(item.startedOnDay, season)) }
];
var LOGIN_REWARDS = [
  { id: "cash", title: "\u0633\u064A\u0648\u0644\u0629 \u0641\u0648\u0631\u064A\u0629", description: "25,000 \u062C\u0646\u064A\u0647 \u0645\u062D\u0627\u0643\u0627\u0629", points: 5 },
  { id: "gold", title: "\u0630\u0647\u0628 \u0644\u0644\u0645\u062D\u0641\u0638\u0629", description: "0.5 \u063A\u0631\u0627\u0645 \u0630\u0647\u0628 \u0645\u062D\u0627\u0643\u0627\u0629", points: 5 },
  { id: "diamonds", title: "\u0645\u0627\u0633 \u0627\u0644\u0625\u0645\u0628\u0631\u0627\u0637\u0648\u0631\u064A\u0629", description: "8 \u0645\u0627\u0633\u0627\u062A \u0645\u062C\u0627\u0646\u064A\u0629 \u0644\u0644\u0628\u0637\u0627\u0642\u0627\u062A", points: 5 }
];
function getSeasonId(day) {
  return `${SEASON_ID_PREFIX}${Math.floor(Math.max(0, day - 1) / SEASON_LENGTH_DAYS) + 1}`;
}
function activeSeason(profile) {
  const seasonId = getSeasonId(profile.day);
  const start = Math.floor(Math.max(0, profile.day - 1) / SEASON_LENGTH_DAYS) * SEASON_LENGTH_DAYS + 1;
  const current = profile.season;
  if (current?.seasonId === seasonId) return current;
  return { seasonId, startedOnDay: start, endsOnDay: start + SEASON_LENGTH_DAYS - 1, points: 0, claimedChallengeKeys: [] };
}
function getSeasonSnapshot(profile) {
  const season = activeSeason(profile);
  const challenges = SEASON_CHALLENGES.map((challenge) => {
    const key = `${profile.day}:${challenge.id}`;
    const claimed = challenge.kind === "daily" ? season.claimedChallengeKeys.includes(key) : season.claimedChallengeKeys.includes(challenge.id);
    return { ...challenge, claimed, available: !claimed && challenge.available(profile, season) };
  });
  const nextReward = Math.min(100, 100 - season.points % 100);
  return { season, challenges, nextReward, progressPercent: Math.min(100, season.points % 100), loginRewardClaimed: season.claimedLoginRewardDay === profile.day };
}
function withLedger(profile, amount, note, extra = {}) {
  const entry = { id: `season-${profile.day}-${(profile.ledger ?? []).length + 1}`, category: "revenue", amount, countryId: profile.countryId, occurredAt: (/* @__PURE__ */ new Date()).toISOString(), note };
  const ledger = [...profile.ledger, entry];
  const totalRevenue = ledger.filter((item) => item.category === "revenue").reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = ledger.filter((item) => item.category === "expense").reduce((sum, item) => sum + item.amount, 0);
  return { ...profile, ...extra, bankBalance: profile.bankBalance + amount, ledger, finances: { netProfit: totalRevenue - totalExpenses, totalRevenue, totalExpenses } };
}
function claimSeasonChallenge(profile, challengeId) {
  const snapshot = getSeasonSnapshot(profile);
  const challenge = snapshot.challenges.find((item) => item.id === challengeId);
  if (!challenge) return { ok: false, profile, reason: "not-found", message: "\u062A\u062D\u062F\u064A \u0627\u0644\u0645\u0648\u0633\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F." };
  if (challenge.claimed) return { ok: false, profile, reason: "already-claimed", message: "\u062A\u0645 \u062A\u062D\u0635\u064A\u0644 \u0647\u0630\u0627 \u0627\u0644\u062A\u062D\u062F\u064A \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0641\u062A\u0631\u0629." };
  if (!challenge.available) return { ok: false, profile, reason: "condition-not-met", message: "\u0644\u0645 \u064A\u062A\u062D\u0642\u0642 \u0634\u0631\u0637 \u0627\u0644\u062A\u062D\u062F\u064A \u0628\u0639\u062F." };
  const key = challenge.kind === "daily" ? `${profile.day}:${challenge.id}` : challenge.id;
  const season = { ...snapshot.season, points: snapshot.season.points + challenge.points, claimedChallengeKeys: [...snapshot.season.claimedChallengeKeys, key] };
  const nextProfile = withLedger(profile, challenge.reward, `\u0645\u0643\u0627\u0641\u0623\u0629 \u0645\u0648\u0633\u0645 \u0627\u0644\u062A\u0648\u0633\u0639: ${challenge.title}`, { season });
  return { ok: true, profile: nextProfile, message: `\u0623\u062D\u0633\u0646\u062A! \u062D\u0635\u0644\u062A \u0639\u0644\u0649 ${challenge.points} \u0646\u0642\u0637\u0629 \u0648${challenge.reward.toLocaleString("ar-EG")} $ \u0645\u0646 \u0627\u0644\u0645\u0648\u0633\u0645.`, data: { challengeId, points: challenge.points } };
}
function claimLoginReward(profile, rewardId) {
  const snapshot = getSeasonSnapshot(profile);
  if (snapshot.loginRewardClaimed) return { ok: false, profile, reason: "already-claimed", message: "\u0627\u0633\u062A\u0644\u0645\u062A \u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u064A\u0648\u0645." };
  const reward = LOGIN_REWARDS.find((item) => item.id === rewardId);
  if (!reward) return { ok: false, profile, reason: "not-found", message: "\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u062F\u062E\u0648\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629." };
  const season = { ...snapshot.season, points: snapshot.season.points + reward.points, claimedLoginRewardDay: profile.day };
  if (rewardId === "gold") {
    const nextProfile2 = withLedger(profile, 0, "\u0645\u0643\u0627\u0641\u0623\u0629 \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0633\u0645: 0.5 \u063A\u0631\u0627\u0645 \u0630\u0647\u0628", { season, goldGrams: Math.round((profile.goldGrams + 0.5) * 10) / 10, goldCostBasis: profile.goldCostBasis + 3e3 });
    return { ok: true, profile: nextProfile2, message: "\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 0.5 \u063A\u0631\u0627\u0645 \u0630\u0647\u0628 \u0645\u062D\u0627\u0643\u0627\u0629 \u0625\u0644\u0649 \u0645\u062D\u0641\u0638\u062A\u0643.", data: { rewardId } };
  }
  if (rewardId === "diamonds") {
    const nextProfile2 = withLedger(profile, 0, "\u0645\u0643\u0627\u0641\u0623\u0629 \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0633\u0645: 8 \u0645\u0627\u0633\u0627\u062A", { season, diamonds: profile.diamonds + 8 });
    return { ok: true, profile: nextProfile2, message: "\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 8 \u0645\u0627\u0633\u0627\u062A \u0645\u062C\u0627\u0646\u064A\u0629 \u0625\u0644\u0649 \u062D\u0633\u0627\u0628\u0643.", data: { rewardId } };
  }
  const nextProfile = withLedger(profile, 25e3, "\u0645\u0643\u0627\u0641\u0623\u0629 \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0648\u0633\u0645: \u0633\u064A\u0648\u0644\u0629 \u0641\u0648\u0631\u064A\u0629", { season });
  return { ok: true, profile: nextProfile, message: "\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 25,000 $ \u0645\u062D\u0627\u0643\u0627\u0629 \u0625\u0644\u0649 \u0631\u0635\u064A\u062F\u0643.", data: { rewardId } };
}
var SEASON_EVENTS = [
  { title: "\u0641\u0631\u0635\u0629 \u062A\u0648\u0631\u064A\u062F \u0639\u0627\u062C\u0644\u0629", description: "\u0648\u0635\u0644 \u0637\u0644\u0628 \u0643\u0628\u064A\u0631 \u0645\u0646 \u0627\u0644\u0633\u0648\u0642\u060C \u0644\u0643\u0646 \u0627\u0644\u0642\u0631\u0627\u0631 \u064A\u062D\u062A\u0627\u062C \u0633\u0631\u0639\u0629.", choices: [{ id: "safe", label: "\u0628\u064A\u0639 \u0645\u0646 \u0627\u0644\u0645\u062E\u0632\u0648\u0646", description: "12,000 $ \u06485 \u0646\u0642\u0627\u0637", reward: 12e3, points: 5 }, { id: "bold", label: "\u0627\u0642\u0628\u0644 \u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u0643\u0628\u064A\u0631", description: "24,000 $ \u064810 \u0646\u0642\u0627\u0637", reward: 24e3, points: 10 }] },
  { title: "\u0645\u0648\u0642\u0639 \u062A\u0648\u0633\u0639\u0629 \u062C\u062F\u064A\u062F", description: "\u0638\u0647\u0631 \u0645\u0648\u0642\u0639 \u0645\u0646\u0627\u0633\u0628 \u0642\u0631\u0628 \u0645\u0646\u0634\u0622\u062A\u0643 \u0648\u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u063A\u0644\u0627\u0644\u0647 \u0627\u0644\u064A\u0648\u0645.", choices: [{ id: "reserve", label: "\u0627\u062D\u062C\u0632 \u0627\u0644\u0645\u0648\u0642\u0639", description: "18,000 $ \u06488 \u0646\u0642\u0627\u0637", reward: 18e3, points: 8 }, { id: "wait", label: "\u0627\u0646\u062A\u0638\u0631 \u0641\u0631\u0635\u0629 \u0623\u0641\u0636\u0644", description: "8,000 $ \u06484 \u0646\u0642\u0627\u0637", reward: 8e3, points: 4 }] },
  { title: "\u0645\u0646\u0627\u0641\u0633 \u064A\u0636\u063A\u0637 \u0627\u0644\u0633\u0648\u0642", description: "\u062E\u0641\u0636 \u0645\u0646\u0627\u0641\u0633 \u0623\u0633\u0639\u0627\u0631\u0647\u060C \u0648\u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0631\u062F \u0628\u0647\u062F\u0648\u0621 \u0623\u0648 \u0628\u0627\u0644\u0645\u062E\u0627\u0637\u0631\u0629.", choices: [{ id: "steady", label: "\u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u0627\u0644\u0633\u0639\u0631", description: "10,000 $ \u06485 \u0646\u0642\u0627\u0637", reward: 1e4, points: 5 }, { id: "compete", label: "\u0646\u0627\u0641\u0633 \u0628\u0642\u0648\u0629", description: "22,000 $ \u06489 \u0646\u0642\u0627\u0637", reward: 22e3, points: 9 }] }
];
function getSeasonEventSnapshot(profile) {
  const season = getSeasonSnapshot(profile);
  const event = SEASON_EVENTS[(profile.day - 1) % SEASON_EVENTS.length];
  return { event, claimed: season.season.claimedChallengeKeys.includes(`event:${profile.day}`) };
}
function chooseSeasonEvent(profile, choiceId) {
  const snapshot = getSeasonEventSnapshot(profile);
  if (snapshot.claimed) return { ok: false, profile, reason: "already-claimed", message: "\u0627\u062A\u062E\u0630\u062A \u0642\u0631\u0627\u0631 \u062D\u062F\u062B \u0627\u0644\u064A\u0648\u0645 \u0628\u0627\u0644\u0641\u0639\u0644." };
  const choice = snapshot.event.choices.find((item) => item.id === choiceId);
  if (!choice) return { ok: false, profile, reason: "not-found", message: "\u062E\u064A\u0627\u0631 \u0627\u0644\u062D\u062F\u062B \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F." };
  const currentSeason = getSeasonSnapshot(profile).season;
  const season = { ...currentSeason, points: currentSeason.points + choice.points, claimedChallengeKeys: [...currentSeason.claimedChallengeKeys, `event:${profile.day}`] };
  const nextProfile = withLedger(profile, choice.reward, `\u0642\u0631\u0627\u0631 \u0645\u0648\u0633\u0645 \u0627\u0644\u062A\u0648\u0633\u0639: ${snapshot.event.title} \xB7 ${choice.label}`, { season });
  return { ok: true, profile: nextProfile, message: `\u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0642\u0631\u0627\u0631 \u0648\u062D\u0635\u0644\u062A \u0639\u0644\u0649 ${choice.reward.toLocaleString("ar-EG")} $ \u0648${choice.points} \u0646\u0642\u0627\u0637 \u0645\u0648\u0633\u0645.`, data: { choiceId } };
}

// src/game/engine.ts
var DAY_MS = GAME_DAY_MS;
function timestampFor(profile) {
  const base = Date.parse(profile.createdAt);
  return new Date((Number.isFinite(base) ? base : 0) + Math.max(0, profile.day - 1) * DAY_MS).toISOString();
}
function nextId(profile, prefix, collectionLength) {
  return `${prefix}-${profile.day}-${collectionLength + 1}`;
}
function success(profile, message, data) {
  return { ok: true, profile, message, data };
}
function failure(profile, reason, message) {
  return { ok: false, profile, reason, message };
}
function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}
function resolvePurchaseDebit(profile, cashPrice, paymentMethod = "cash", fixedDiamondPrice) {
  if (paymentMethod !== "cash" && paymentMethod !== "diamonds") return { message: "\u0648\u0633\u064A\u0644\u0629 \u0627\u0644\u062F\u0641\u0639 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629." };
  if (!Number.isFinite(cashPrice) || cashPrice <= 0) return { message: "\u0633\u0639\u0631 \u0627\u0644\u0634\u0631\u0627\u0621 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D." };
  if (paymentMethod === "cash") {
    if (profile.bankBalance < cashPrice) return { message: "\u0644\u0627 \u064A\u0643\u0641\u064A \u0631\u0635\u064A\u062F \u0627\u0644\u0628\u0646\u0643 \u0644\u0625\u062A\u0645\u0627\u0645 \u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u0634\u0631\u0627\u0621." };
    return { bankBalance: profile.bankBalance - cashPrice, diamonds: profile.diamonds, diamondsSpent: 0 };
  }
  const diamondsSpent = fixedDiamondPrice ?? getDiscountedDiamondPrice(cashPrice);
  if (!Number.isInteger(diamondsSpent) || diamondsSpent < 1) return { message: "\u0642\u064A\u0645\u0629 \u0627\u0644\u0633\u0644\u0639\u0629 \u0623\u0642\u0644 \u0645\u0646 \u062D\u062F \u0627\u0644\u062F\u0641\u0639 \u0628\u0645\u0627\u0633\u0629 \u0643\u0627\u0645\u0644\u0629\u061B \u0627\u062E\u062A\u0631 \u0627\u0644\u062F\u0641\u0639 \u0646\u0642\u062F\u064B\u0627." };
  if (profile.diamonds < diamondsSpent) return { message: `\u0644\u0627 \u064A\u0643\u0641\u064A \u0631\u0635\u064A\u062F \u0627\u0644\u0645\u0627\u0633\u061B \u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 ${diamondsSpent} \u0645\u0627\u0633\u0629.` };
  return { bankBalance: profile.bankBalance, diamonds: profile.diamonds - diamondsSpent, diamondsSpent };
}
function unpaidSalaryTotal(profile) {
  return profile.staff.filter((employee) => employee.status === "active").reduce((sum, employee) => sum + (employee.unpaidSalary ?? 0), 0);
}
function addLedger(profile, entries, bankBalance, extra = {}) {
  const currentPayables = Math.max(0, extra.payables ?? profile.payables);
  const cashInflow = Math.max(0, bankBalance - profile.bankBalance);
  const automaticSettlement = Math.min(currentPayables, cashInflow);
  const settlementEntries = automaticSettlement > 0 ? [ledgerEntry(profile, "settlement", automaticSettlement, "\u0633\u062F\u0627\u062F \u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A \u0645\u0646 \u0625\u064A\u0631\u0627\u062F \u062D\u062F\u064A\u062B", entries.length)] : [];
  const ledger = [...profile.ledger ?? [], ...entries, ...settlementEntries];
  const totalRevenue = ledger.filter((entry) => entry.category === "revenue").reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = ledger.filter((entry) => entry.category === "expense").reduce((sum, entry) => sum + entry.amount, 0);
  return {
    ...profile,
    ...extra,
    bankBalance: Math.max(0, bankBalance - automaticSettlement),
    payables: currentPayables - automaticSettlement,
    ledger,
    finances: { netProfit: totalRevenue - totalExpenses, totalRevenue, totalExpenses }
  };
}
function ledgerEntry(profile, category, amount, note, index) {
  return { id: nextId(profile, "ledger", (profile.ledger ?? []).length + index), category, amount, countryId: profile.countryId, occurredAt: timestampFor(profile), note };
}
function syncTasks(profile) {
  const existing = new Map((profile.tasks ?? []).map((task) => [task.taskId, task]));
  const automaticBadges = [
    profile.companies.length > 0 ? "\u0634\u0627\u0631\u0629 \u0627\u0644\u0645\u0624\u0633\u0633" : null,
    profile.productionOrders.length > 0 ? "\u0645\u0634\u063A\u0651\u0644 \u0645\u0635\u0646\u0639" : null,
    profile.sales.length >= 3 ? "\u0635\u0627\u0626\u062F \u0627\u0644\u0633\u0648\u0642" : null,
    profile.staff.filter((member) => member.status === "active").length >= 2 ? "\u0642\u0627\u0626\u062F \u0641\u0631\u064A\u0642" : null,
    profile.investments.length > 0 || profile.banking.deposits.length > 0 ? "\u0639\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644" : null
  ].filter((badge) => Boolean(badge));
  return {
    ...profile,
    tasks: TASK_CATALOG.map((task) => existing.get(task.id) ?? { taskId: task.id, claimed: false }),
    badges: [.../* @__PURE__ */ new Set([...profile.badges ?? [], ...automaticBadges])]
  };
}
function conditionMet(profile, condition) {
  switch (condition) {
    case "own-land":
      return profile.lands.length > 0;
    case "own-company":
      return profile.companies.length > 0;
    case "buy-material":
      return profile.ledger.some((entry) => entry.note.startsWith("\u0634\u0631\u0627\u0621 "));
    case "run-production":
      return profile.productionOrders.length > 0;
    case "sell-product":
      return profile.sales.length > 0;
    case "make-investment":
      return profile.investments.length > 0;
    case "reach-day-3":
      return profile.day >= 3;
  }
}
function ensureEgypt(profile) {
  return findCountry(profile.countryId) ? null : failure(profile, "wrong-country", "\u0627\u0644\u062F\u0648\u0644\u0629 \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629.");
}
function placeBid(profile, listingId, amount, targetCompanyId) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount <= 0) return failure(profile, "invalid-input", "\u0642\u064A\u0645\u0629 \u0627\u0644\u0639\u0631\u0636 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0645\u0628\u0644\u063A\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627 \u0645\u0648\u062C\u0628\u064B\u0627.");
  const listing = resolveAuctionListing(profile, listingId);
  if (listing && !isAuctionOpen(profile, listing)) return failure(profile, "not-found", "\u0627\u0644\u0645\u0632\u0627\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u0645\u063A\u0644\u0642.");
  if (!listing) return failure(profile, "not-found", "\u0627\u0644\u0645\u0632\u0627\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u0645\u063A\u0644\u0642.");
  if (profile.lands.some((land2) => land2.id === listing.id) || profile.assets.some((asset) => asset.id === listing.id) || profile.ledger.some((entry) => entry.note.includes(listing.label))) return failure(profile, "already-owned", "\u0644\u0642\u062F \u0641\u0632\u062A \u0628\u0647\u0630\u0627 \u0627\u0644\u0645\u0632\u0627\u062F \u0628\u0627\u0644\u0641\u0639\u0644.");
  if (amount < listing.minimumBid) return failure(profile, "invalid-input", "\u064A\u062C\u0628 \u0623\u0646 \u064A\u0633\u0627\u0648\u064A \u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 \u0644\u0644\u0645\u0632\u0627\u062F \u0623\u0648 \u064A\u062A\u062C\u0627\u0648\u0632\u0647.");
  const highestBotBid = listing.minimumBid + listing.bidIncrement * 2;
  const botBids = [
    { bidderId: `${listing.id}-bot-a`, amount: listing.minimumBid + listing.bidIncrement },
    { bidderId: `${listing.id}-bot-b`, amount: highestBotBid }
  ];
  if (amount <= highestBotBid) {
    return failure(profile, "auction-lost", `\u062E\u0633\u0631 \u0639\u0631\u0636\u0643 \u0627\u0644\u0645\u0632\u0627\u062F\u061B \u0623\u0639\u0644\u0649 \u0639\u0631\u0636 \u0645\u0646\u0627\u0641\u0633 \u0643\u0627\u0646 ${highestBotBid.toLocaleString("ar-EG")} $.`);
  }
  if (profile.bankBalance < amount) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0631\u0635\u064A\u062F\u0643 \u0644\u062A\u0633\u062F\u064A\u062F \u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u0641\u0627\u0626\u0632.");
  const auctionHistory = [
    ...profile.auctionHistory,
    ...botBids.map((bid, index) => ({ id: `${listing.id}-bot-${profile.auctionHistory.length + index}`, listingId, bidder: "bot", bidderId: bid.bidderId, amount: bid.amount, day: profile.day, occurredAt: timestampFor(profile) })),
    { id: `${listing.id}-player-${profile.auctionHistory.length}`, listingId, bidder: "player", bidderId: profile.id, amount, day: profile.day, occurredAt: timestampFor(profile) }
  ];
  const acquiredAt = timestampFor(profile);
  if (listing.lotType === "factory") {
    const company = profile.companies.find((item) => item.id === targetCompanyId) ?? profile.companies[0];
    if (!company) return failure(profile, "condition-not-met", "\u0623\u0633\u0633 \u0634\u0631\u0643\u0629 \u0623\u0648\u0644\u064B\u0627 \u062D\u062A\u0649 \u062A\u0631\u0628\u0637 \u0628\u0647\u0627 \u062E\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0627\u0644\u0641\u0627\u0626\u0632 \u0628\u0627\u0644\u0645\u0632\u0627\u062F.");
    const bonus = listing.energyCapacityBonus ?? 40;
    const companyId = company.id;
    const assetId = listing.id;
    const asset = { id: assetId, label: `\u0645\u0635\u0646\u0639 \u0625\u0636\u0627\u0641\u064A: ${listing.label}`, value: amount, acquiredAt };
    const companies = profile.companies.map((item) => item.id === companyId ? { ...item, energyCapacity: (item.energyCapacity ?? 0) + bonus, energyUnits: (item.energyUnits ?? 0) + bonus } : item);
    const nextProfile2 = addLedger(
      { ...profile, assets: [...profile.assets, asset], companies, auctionHistory },
      [ledgerEntry(profile, "asset", amount, `\u0634\u0631\u0627\u0621 \u0645\u0635\u0646\u0639 \u0628\u0627\u0644\u0645\u0632\u0627\u062F: ${listing.label}`, 0)],
      profile.bankBalance - amount
    );
    return success(syncTasks(nextProfile2), `\u0641\u0632\u062A \u0628\u062E\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0648\u0631\u0628\u0637\u062A\u0647 \u0628\u0634\u0631\u0643\u0629 ${company.name}.`, { listingId, winner: "player", winningAmount: amount, botBids, assetId, companyId });
  }
  if (listing.lotType === "raw-material") {
    const material = findMaterial(listing.materialId ?? "");
    const quantity = listing.quantity ?? 0;
    if (!material || !isPositiveInteger(quantity)) return failure(profile, "not-found", "\u0628\u064A\u0627\u0646\u0627\u062A \u0634\u062D\u0646\u0629 \u0627\u0644\u0645\u0632\u0627\u062F \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629.");
    const existing = profile.inventory.find((lot) => lot.materialOrProductId === material.id);
    const level = normalizeWarehouseLevel(profile.warehouseLevel);
    const itemLimit = getWarehouseItemCapacity(material.id, level) ?? material.storageLimit;
    const warehouseUsage = getWarehouseUsage(profile.inventory, profile.productionOrders);
    const warehouseCapacity = getWarehouseCapacity(level);
    if ((existing?.quantity ?? 0) + quantity > itemLimit || warehouseUsage.materials + quantity > warehouseCapacity.materials) return failure(profile, "storage-limit", "\u0633\u0639\u0629 \u0627\u0644\u0645\u062E\u0632\u0646 \u0644\u0627 \u062A\u0643\u0641\u064A \u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0634\u062D\u0646\u0629 \u0627\u0644\u0641\u0627\u0626\u0632\u0629\u061B \u0637\u0648\u0651\u0631 \u0627\u0644\u0645\u062E\u0632\u0646 \u0623\u0648 \u0623\u0641\u0631\u063A \u0645\u0633\u0627\u062D\u0629.");
    const inventoryLotId = existing?.id ?? nextId(profile, "inventory", profile.inventory.length);
    const unitCost = amount / quantity;
    const inventory = existing ? profile.inventory.map((lot) => lot.id === existing.id ? { ...lot, quantity: lot.quantity + quantity, unitCost: (lot.quantity * lot.unitCost + amount) / (lot.quantity + quantity) } : lot) : [...profile.inventory, { id: inventoryLotId, materialOrProductId: material.id, quantity, unit: material.unit, unitCost }];
    const nextProfile2 = addLedger(
      { ...profile, inventory, auctionHistory },
      [ledgerEntry(profile, "asset", amount, `\u0634\u0631\u0627\u0621 ${quantity} ${material.unit} \u0645\u0646 ${material.name} \u0628\u0627\u0644\u0645\u0632\u0627\u062F: ${listing.label}`, 0)],
      profile.bankBalance - amount
    );
    return success(syncTasks(nextProfile2), `\u0641\u0632\u062A \u0628\u0634\u062D\u0646\u0629 ${quantity} ${material.unit} \u0645\u0646 ${material.name} \u0648\u0623\u064F\u0636\u064A\u0641\u062A \u0625\u0644\u0649 \u0627\u0644\u0645\u062E\u0632\u0646.`, { listingId, winner: "player", winningAmount: amount, botBids, inventoryLotId });
  }
  const land = {
    id: listing.id,
    label: listing.label,
    areaSquareMeters: listing.areaSquareMeters,
    purchasePrice: amount,
    acquiredAt,
    acquiredOnDay: profile.day,
    availableForCompanyOnDay: profile.day + 1,
    landType: listing.landType
  };
  const nextProfile = addLedger(
    { ...profile, lands: [...profile.lands, land], auctionHistory },
    [ledgerEntry(profile, "asset", amount, `\u0634\u0631\u0627\u0621 \u0623\u0631\u0636 \u0628\u0627\u0644\u0645\u0632\u0627\u062F: ${listing.label}`, 0)],
    profile.bankBalance - amount
  );
  return success(syncTasks(nextProfile), `\u062A\u0645 \u0627\u0644\u0641\u0648\u0632 \u0628\u0627\u0644\u0645\u0632\u0627\u062F. \u0628\u062F\u0623 \u0625\u0646\u0647\u0627\u0621 \u0639\u0642\u0648\u062F \u0646\u0642\u0644 \u0627\u0644\u0645\u0644\u0643\u064A\u0629\u061B \u0633\u062A\u0643\u0648\u0646 \u0627\u0644\u0623\u0631\u0636 \u0645\u062A\u0627\u062D\u0629 \u0628\u0639\u062F \u064A\u0648\u0645 \u062F\u0627\u062E\u0644 \u0627\u0644\u0644\u0639\u0628\u0629\u060C \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${profile.day + 1}. \u062A\u062D\u0644\u0651\u064E \u0628\u0627\u0644\u0635\u0628\u0631.`, {
    listingId,
    winner: "player",
    winningAmount: amount,
    botBids,
    landId: land.id
  });
}
function buyDirectLand(profile, listingId, paymentMethod = "cash") {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const countryLands = getDirectLandsForCountry(profile.countryId);
  const listing = countryLands.find((entry) => entry.id === listingId) || DIRECT_LAND_CATALOG.find((entry) => entry.id === listingId);
  if (!listing) return failure(profile, "not-found", "\u0639\u0631\u0636 \u0627\u0644\u0623\u0631\u0636 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F.");
  if (profile.lands.some((land2) => land2.id === listing.id)) return failure(profile, "already-owned", "\u062A\u0645 \u0634\u0631\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0623\u0631\u0636 \u0628\u0627\u0644\u0641\u0639\u0644.");
  const price = listing.price;
  const payment = resolvePurchaseDebit(profile, price, paymentMethod);
  if ("message" in payment) return failure(profile, "insufficient-funds", payment.message);
  const land = { id: listing.id, label: listing.label, areaSquareMeters: listing.areaSquareMeters, purchasePrice: price, acquiredAt: timestampFor(profile), acquiredOnDay: profile.day, availableForCompanyOnDay: profile.day + 1, landType: listing.landType };
  const nextProfile = addLedger(
    { ...profile, lands: [...profile.lands, land] },
    [ledgerEntry(profile, "asset", price, `\u0634\u0631\u0627\u0621 \u0623\u0631\u0636 \u0645\u0628\u0627\u0634\u0631: ${listing.label}`, 0)],
    payment.bankBalance,
    { diamonds: payment.diamonds }
  );
  return success(syncTasks(nextProfile), `\u062A\u0645 \u0634\u0631\u0627\u0621 ${listing.label} ${paymentMethod === "diamonds" ? `\u0645\u0642\u0627\u0628\u0644 ${payment.diamondsSpent} \u0645\u0627\u0633\u0629` : "\u0646\u0642\u062F\u064B\u0627"}. \u0628\u062F\u0623 \u0625\u0646\u0647\u0627\u0621 \u0639\u0642\u0648\u062F \u0646\u0642\u0644 \u0627\u0644\u0645\u0644\u0643\u064A\u0629\u061B \u0633\u062A\u0643\u0648\u0646 \u0627\u0644\u0623\u0631\u0636 \u0645\u062A\u0627\u062D\u0629 \u0628\u0639\u062F \u064A\u0648\u0645 \u062F\u0627\u062E\u0644 \u0627\u0644\u0644\u0639\u0628\u0629\u060C \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${profile.day + 1}. \u062A\u062D\u0644\u0651\u064E \u0628\u0627\u0644\u0635\u0628\u0631.`, { landId: land.id, price, diamondsSpent: payment.diamondsSpent });
}
function buyDirectCompany(profile, listingId, paymentMethod = "cash") {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const countryCompanies = getDirectCompaniesForCountry(profile.countryId);
  const listing = countryCompanies.find((entry) => entry.id === listingId) || DIRECT_COMPANY_CATALOG.find((entry) => entry.id === listingId);
  const industry = listing ? findIndustry(listing.industryId) : void 0;
  if (!listing || !industry) return failure(profile, "not-found", "\u0639\u0631\u0636 \u0627\u0644\u0634\u0631\u0643\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F.");
  if (profile.companies.some((company2) => company2.id === listing.id)) return failure(profile, "already-owned", "\u062A\u0645 \u0634\u0631\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0634\u0631\u0643\u0629 \u0628\u0627\u0644\u0641\u0639\u0644.");
  const price = listing.price;
  const payment = resolvePurchaseDebit(profile, price, paymentMethod);
  if ("message" in payment) return failure(profile, "insufficient-funds", payment.message);
  const landId = `${listing.id}-land`;
  const licenseId = `${listing.id}-license`;
  const land = { id: landId, label: `${listing.name} \xB7 \u0623\u0631\u0636 \u0627\u0644\u0634\u0631\u0643\u0629`, areaSquareMeters: listing.areaSquareMeters, purchasePrice: Math.floor(price * 0.45), acquiredAt: timestampFor(profile), acquiredOnDay: profile.day, availableForCompanyOnDay: profile.day + 1, landType: listing.landType };
  const company = { id: listing.id, name: listing.name, industryId: listing.industryId, countryId: profile.countryId, foundedAt: timestampFor(profile), operationalFromDay: profile.day + 1, landId, licenseIds: [licenseId], energyUnits: industry.energyCapacity, energyCapacity: industry.energyCapacity, operatingCostPerDay: industry.dailyOperatingCost };
  const license = { id: licenseId, countryId: profile.countryId, industryId: listing.industryId, feePaid: Math.floor(price * 0.15), issuedAt: timestampFor(profile) };
  const nextProfile = addLedger(
    { ...profile, lands: [...profile.lands, land], companies: [...profile.companies, company], licenses: [...profile.licenses, license] },
    [ledgerEntry(profile, "asset", price, `\u0634\u0631\u0627\u0621 \u0634\u0631\u0643\u0629 \u0645\u0628\u0627\u0634\u0631: ${listing.name}`, 0)],
    payment.bankBalance,
    { diamonds: payment.diamonds }
  );
  return success(syncTasks(nextProfile), `\u062A\u0645 \u0634\u0631\u0627\u0621 ${listing.name} ${paymentMethod === "diamonds" ? `\u0645\u0642\u0627\u0628\u0644 ${payment.diamondsSpent} \u0645\u0627\u0633\u0629` : "\u0646\u0642\u062F\u064B\u0627"}. \u064A\u062C\u0631\u064A \u0625\u0646\u0647\u0627\u0621 \u0639\u0642\u0648\u062F \u0646\u0642\u0644 \u0627\u0644\u0645\u0644\u0643\u064A\u0629\u060C \u0648\u064A\u0628\u062F\u0623 \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0628\u0639\u062F \u064A\u0648\u0645 \u062F\u0627\u062E\u0644 \u0627\u0644\u0644\u0639\u0628\u0629 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${profile.day + 1}. \u062A\u062D\u0644\u0651\u064E \u0628\u0627\u0644\u0635\u0628\u0631.`, { companyId: company.id, landId, price, diamondsSpent: payment.diamondsSpent });
}
function sellLand(profile, landId) {
  const land = profile.lands.find((item) => item.id === landId);
  if (!land) return failure(profile, "not-found", "\u0627\u0644\u0623\u0631\u0636 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.");
  if (profile.companies.some((company) => company.landId === landId)) return failure(profile, "condition-not-met", "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0628\u064A\u0639 \u0623\u0631\u0636 \u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0634\u0631\u0643\u0629. \u0628\u0639 \u0627\u0644\u0634\u0631\u0643\u0629 \u0623\u0648 \u0627\u0646\u0642\u0644\u0647\u0627 \u0623\u0648\u0644\u064B\u0627.");
  const payout = Math.floor(land.purchasePrice * 0.5);
  const nextProfile = addLedger({ ...profile, lands: profile.lands.filter((item) => item.id !== landId) }, [ledgerEntry(profile, "revenue", payout, `\u0628\u064A\u0639 \u0623\u0631\u0636: ${land.label} \u0628\u0646\u0635\u0641 \u0627\u0644\u0642\u064A\u0645\u0629`, 0)], profile.bankBalance + payout);
  return success(nextProfile, `\u062A\u0645 \u0628\u064A\u0639 ${land.label} \u0648\u0627\u0633\u062A\u0631\u062F\u0627\u062F 50% \u0645\u0646 \u0642\u064A\u0645\u062A\u0647\u0627.`, { landId, payout });
}
function upgradeLand(profile, landId, paymentMethod = "cash") {
  const land = profile.lands.find((item) => item.id === landId);
  if (!land) return failure(profile, "not-found", "\u0627\u0644\u0623\u0631\u0636 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.");
  const level = land.upgradeLevel ?? 1;
  if (level >= 5) return failure(profile, "condition-not-met", "\u0648\u0635\u0644\u062A \u0627\u0644\u0623\u0631\u0636 \u0625\u0644\u0649 \u0623\u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u062A\u0637\u0648\u064A\u0631.");
  const cost = Math.round(8e4 * Math.pow(1.55, level - 1));
  const payment = resolvePurchaseDebit(profile, cost, paymentMethod);
  if ("message" in payment) return failure(profile, "insufficient-funds", payment.message);
  const upgraded = { ...land, upgradeLevel: level + 1, areaSquareMeters: Math.round(land.areaSquareMeters * 1.1), purchasePrice: land.purchasePrice + cost };
  const nextProfile = addLedger({ ...profile, lands: profile.lands.map((item) => item.id === landId ? upgraded : item) }, [ledgerEntry(profile, "expense", cost, `\u062A\u0637\u0648\u064A\u0631 \u0623\u0631\u0636 ${land.label} \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${level + 1}`, 0)], payment.bankBalance, { diamonds: payment.diamonds });
  return success(nextProfile, `\u062A\u0645 \u062A\u0637\u0648\u064A\u0631 ${land.label} \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${level + 1} ${paymentMethod === "diamonds" ? `\u0645\u0642\u0627\u0628\u0644 ${payment.diamondsSpent} \u0645\u0627\u0633\u0629` : "\u0646\u0642\u062F\u064B\u0627"}.`, { landId, level: level + 1, cost, diamondsSpent: payment.diamondsSpent });
}
function sellCompany(profile, companyId) {
  const company = profile.companies.find((item) => item.id === companyId);
  if (!company) return failure(profile, "not-found", "\u0627\u0644\u0634\u0631\u0643\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.");
  if (profile.productionOrders.some((order) => order.companyId === companyId && order.status === "active")) return failure(profile, "condition-not-met", "\u0623\u0648\u0642\u0641 \u0623\u0648 \u0623\u0643\u0645\u0644 \u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0642\u0628\u0644 \u0628\u064A\u0639 \u0627\u0644\u0634\u0631\u0643\u0629.");
  if (profile.staff.some((member) => member.companyId === companyId && member.status === "active")) return failure(profile, "condition-not-met", "\u0623\u0646\u0647 \u0639\u0642\u0648\u062F \u0645\u0648\u0638\u0641\u064A \u0627\u0644\u0634\u0631\u0643\u0629 \u0642\u0628\u0644 \u0628\u064A\u0639\u0647\u0627.");
  const industry = findIndustry(company.industryId);
  const land = company.landId ? profile.lands.find((item) => item.id === company.landId) : void 0;
  const value = (industry?.setupFee ?? 0) + (industry?.licenseFee ?? 0) + (land?.purchasePrice ?? 0);
  const payout = Math.floor(value * 0.5);
  const nextProfile = addLedger({ ...profile, companies: profile.companies.filter((item) => item.id !== companyId), lands: land ? profile.lands.filter((item) => item.id !== land.id) : profile.lands, licenses: profile.licenses.filter((license) => !company.licenseIds?.includes(license.id)) }, [ledgerEntry(profile, "revenue", payout, `\u0628\u064A\u0639 \u0634\u0631\u0643\u0629: ${company.name} \u0628\u0646\u0635\u0641 \u0627\u0644\u0642\u064A\u0645\u0629`, 0)], profile.bankBalance + payout);
  return success(nextProfile, `\u062A\u0645 \u0628\u064A\u0639 ${company.name} \u0648\u0627\u0633\u062A\u0631\u062F\u0627\u062F 50% \u0645\u0646 \u0642\u064A\u0645\u0629 \u0627\u0644\u0634\u0631\u0643\u0629 \u0648\u0623\u0631\u0636\u0647\u0627.`, { companyId, payout });
}
function sellAsset(profile, assetId) {
  const asset = profile.assets.find((item) => item.id === assetId);
  if (!asset) return failure(profile, "not-found", "\u0627\u0644\u0623\u0635\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F.");
  const payout = Math.floor(asset.value * 0.5);
  const nextProfile = addLedger({ ...profile, assets: profile.assets.filter((item) => item.id !== assetId) }, [ledgerEntry(profile, "revenue", payout, `\u0628\u064A\u0639 \u0623\u0635\u0644: ${asset.label} \u0628\u0646\u0635\u0641 \u0627\u0644\u0642\u064A\u0645\u0629`, 0)], profile.bankBalance + payout);
  return success(nextProfile, `\u062A\u0645 \u0628\u064A\u0639 ${asset.label} \u0648\u0627\u0633\u062A\u0631\u062F\u0627\u062F 50% \u0645\u0646 \u0642\u064A\u0645\u062A\u0647.`, { assetId, payout });
}
function buyMaterial(profile, _materialId, _quantity) {
  return failure(profile, "condition-not-met", "\u0627\u0644\u0634\u0631\u0627\u0621 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0644\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062E\u0627\u0645 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D. \u0627\u0633\u062A\u062E\u062F\u0645 \u0639\u0631\u0648\u0636 \u0627\u0644\u0633\u0648\u0642 \u0623\u0648 \u0627\u0644\u0645\u0632\u0627\u062F.");
}
function buyGlobalMaterial(profile, offerId, quantity, negotiatedUnitPrice, paymentMethod = "cash", tradeOptions) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveInteger(quantity)) return failure(profile, "invalid-input", "\u0627\u0644\u0643\u0645\u064A\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0639\u062F\u062F\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627 \u0645\u0648\u062C\u0628\u064B\u0627.");
  const offer = resolveGlobalMarketOffer(profile, offerId);
  const material = offer ? findMaterial(offer.materialId) : void 0;
  if (!offer || !material) return failure(profile, "not-found", "\u0639\u0631\u0636 \u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0639\u0627\u0644\u0645\u064A \u0644\u0645 \u064A\u0639\u062F \u0645\u062A\u0627\u062D\u064B\u0627.");
  const minAllowedFloor = Math.max(1, Math.round(offer.floorPrice * 0.88));
  const unitPrice = negotiatedUnitPrice ?? offer.unitPrice;
  if (!Number.isInteger(unitPrice) || unitPrice < minAllowedFloor || unitPrice > offer.unitPrice || !offer.negotiable && unitPrice !== offer.unitPrice) {
    return failure(profile, "invalid-input", "\u0627\u0644\u0633\u0639\u0631 \u0644\u0627 \u064A\u0637\u0627\u0628\u0642 \u0634\u0631\u0648\u0637 \u0627\u0644\u0639\u0631\u0636 \u0623\u0648 \u0627\u0644\u062A\u0641\u0627\u0648\u0636.");
  }
  const shippingMode = tradeOptions?.shippingMode ?? "spot-ddp";
  const quote = calculateImportQuote(profile, offer, quantity, {
    negotiatedUnitPrice: unitPrice,
    shippingMode,
    paymentTerm: tradeOptions?.paymentTerm ?? "cash-spot",
    fleetCount: tradeOptions?.fleetCount
  });
  const existing = profile.inventory.find((lot) => lot.materialOrProductId === material.id);
  const level = normalizeWarehouseLevel(profile.warehouseLevel);
  const itemLimit = getWarehouseItemCapacity(material.id, level) ?? material.storageLimit;
  const warehouseUsage = getWarehouseUsage(profile.inventory, profile.productionOrders);
  const warehouseCapacity = getWarehouseCapacity(level);
  const inTransitMatQty = (profile.globalShipments ?? []).filter((s) => s.status === "in-transit" && s.direction === "import").reduce((sum, s) => sum + s.quantity, 0);
  const inTransitSameItem = (profile.globalShipments ?? []).filter((s) => s.status === "in-transit" && s.direction === "import" && s.itemId === material.id).reduce((sum, s) => sum + s.quantity, 0);
  if ((existing?.quantity ?? 0) + inTransitSameItem + quantity > itemLimit || warehouseUsage.materials + inTransitMatQty + quantity > warehouseCapacity.materials) {
    const availItem = itemLimit - (existing?.quantity ?? 0) - inTransitSameItem;
    const availTotal = warehouseCapacity.materials - warehouseUsage.materials - inTransitMatQty;
    return failure(
      profile,
      "storage-limit",
      `\u0644\u0627 \u062A\u062A\u0633\u0639 \u0633\u0639\u0629 \u0627\u0644\u0645\u062E\u0632\u0646 \u0644\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629. \u0627\u0644\u0645\u062A\u0627\u062D ${Math.max(0, Math.min(availItem, availTotal))} ${material.unit}.`
    );
  }
  const chargeAmount = paymentMethod === "diamonds" ? quote.totalLandedCost : quote.upfrontCashDue;
  const payment = resolvePurchaseDebit(profile, chargeAmount, paymentMethod);
  if ("message" in payment) return failure(profile, "insufficient-funds", payment.message);
  const prevTrust = profile.supplierTrust?.[offer.supplierId] ?? 0;
  const nextSupplierTrust = {
    ...profile.supplierTrust ?? {},
    [offer.supplierId]: Math.min(100, prevTrust + (quantity >= 25 ? 16 : 10))
  };
  if (shippingMode === "sea-cif") {
    const shipmentId = nextId(profile, "shipment", (profile.globalShipments ?? []).length);
    const shipment = {
      id: shipmentId,
      direction: "import",
      itemId: material.id,
      itemName: material.name,
      quantity,
      unit: material.unit,
      unitCostOrPrice: quote.effectiveUnitCost,
      freightCost: quote.freightCost,
      customsDuty: quote.customsDuty + quote.insuranceCost,
      shippingMode: "sea-cif",
      originOrDestination: `${offer.originFlag} ${offer.originPort} \xB7 ${offer.originCountry}`,
      partnerName: offer.sellerName,
      qualityScore: offer.qualityScore,
      orderedOnDay: profile.day,
      arrivesOnDay: quote.arrivesOnDay,
      deferredBalanceDue: paymentMethod === "diamonds" ? 0 : quote.deferredBalanceDue,
      status: "in-transit"
    };
    const entries2 = [
      ledgerEntry(
        profile,
        "asset",
        chargeAmount,
        `\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0628\u062D\u0631\u064A CIF (${quantity} ${material.unit} ${material.name}) \u0645\u0646 ${offer.originPort}`,
        0
      )
    ];
    const nextProfile2 = addLedger(
      {
        ...profile,
        globalShipments: [...profile.globalShipments ?? [], shipment],
        supplierTrust: nextSupplierTrust
      },
      entries2,
      payment.bankBalance,
      { diamonds: payment.diamonds }
    );
    const lcNote = shipment.deferredBalanceDue > 0 ? ` \u0628\u0646\u0638\u0627\u0645 \u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u064A (\u0633\u064F\u062F\u062F 30% \u0648\u0627\u0644\u0628\u0627\u0642\u064A ${shipment.deferredBalanceDue.toLocaleString("ar-EG")} $ \u0639\u0646\u062F \u0627\u0644\u0648\u0635\u0648\u0644)` : "";
    return success(
      syncTasks(nextProfile2),
      `\u0623\u0628\u062D\u0631\u062A \u0634\u062D\u0646\u0629 ${quantity} ${material.unit} \u0645\u0646 ${material.name} (${offer.originPort})${lcNote}\u061B \u062A\u0635\u0644 \u0644\u0644\u0645\u064A\u0646\u0627\u0621 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${shipment.arrivesOnDay}.`,
      {
        materialId: material.id,
        quantity,
        totalCost: quote.totalLandedCost,
        unitPrice: quote.effectiveUnitCost,
        diamondsSpent: payment.diamondsSpent,
        inTransit: true,
        arrivesOnDay: shipment.arrivesOnDay
      }
    );
  }
  const landedTotal = quote.totalLandedCost;
  const landedUnitCost = landedTotal / quantity;
  const inventory = existing ? profile.inventory.map(
    (lot) => lot.materialOrProductId === material.id ? {
      ...lot,
      quantity: lot.quantity + quantity,
      unitCost: (lot.quantity * lot.unitCost + landedTotal) / (lot.quantity + quantity),
      qualityScore: Math.round(
        ((lot.qualityScore ?? 88) * lot.quantity + offer.qualityScore * quantity) / (lot.quantity + quantity) * 10
      ) / 10
    } : lot
  ) : [
    ...profile.inventory,
    {
      id: nextId(profile, "inventory", profile.inventory.length),
      materialOrProductId: material.id,
      quantity,
      unit: material.unit,
      unitCost: landedUnitCost,
      qualityScore: offer.qualityScore
    }
  ];
  const entries = [
    ledgerEntry(
      profile,
      "asset",
      landedTotal,
      shippingMode === "air-express" ? `\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u062C\u0648\u064A \u0633\u0631\u064A\u0639 (${quantity} ${material.unit} ${material.name}) \u0645\u0646 ${offer.originPort}` : `\u0634\u0631\u0627\u0621 \u0639\u0627\u0644\u0645\u064A ${quantity} ${material.unit} \u0645\u0646 ${offer.sellerName}`,
      0
    )
  ];
  const nextProfile = addLedger(
    { ...profile, inventory, supplierTrust: nextSupplierTrust },
    entries,
    payment.bankBalance,
    { diamonds: payment.diamonds }
  );
  return success(
    syncTasks(nextProfile),
    `\u062A\u0645 \u0642\u0628\u0648\u0644 \u0639\u0631\u0636 ${offer.sellerName} \u0648\u0627\u0633\u062A\u0644\u0627\u0645 ${quantity} ${material.name} (\u062F\u0631\u062C\u0629 ${offer.grade}) \u0641\u064A \u0627\u0644\u0645\u062E\u0632\u0646 ${paymentMethod === "diamonds" ? `\u0645\u0642\u0627\u0628\u0644 ${payment.diamondsSpent} \u0645\u0627\u0633\u0629` : "\u0646\u0642\u062F\u064B\u0627"}.`,
    {
      materialId: material.id,
      quantity,
      totalCost: landedTotal,
      unitPrice: landedUnitCost,
      diamondsSpent: payment.diamondsSpent,
      inTransit: false,
      arrivesOnDay: profile.day
    }
  );
}
function exportGlobalProduct(profile, bidId, quantity) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveInteger(quantity)) {
    return failure(profile, "invalid-input", "\u0643\u0645\u064A\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0639\u062F\u062F\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627 \u0645\u0648\u062C\u0628\u064B\u0627.");
  }
  const bid = getGlobalExportBids(profile).find((item) => item.id === bidId);
  if (!bid) {
    return failure(profile, "not-found", "\u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0637\u0644\u0628 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062F\u0648\u0644\u064A\u061B \u0631\u0627\u062C\u0639 \u062F\u0641\u062A\u0631 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u062D\u062F\u062B.");
  }
  if (quantity < bid.minQuantity || quantity > bid.maxQuantity) {
    return failure(
      profile,
      "market-limit",
      `\u062D\u062C\u0645 \u0627\u0644\u062D\u0627\u0648\u064A\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0644\u062F\u0649 ${bid.buyerName} \u064A\u062A\u0631\u0627\u0648\u062D \u0628\u064A\u0646 ${bid.minQuantity} \u0648${bid.maxQuantity} ${bid.unit}.`
    );
  }
  const lot = profile.inventory.find((item) => item.materialOrProductId === bid.productId);
  if (!lot || lot.quantity < quantity) {
    return failure(profile, "insufficient-materials", `\u0644\u0627 \u062A\u0645\u0644\u0643 ${quantity} ${bid.unit} \u0645\u0646 ${bid.productName} \u0641\u064A \u0627\u0644\u0645\u062E\u0632\u0646 \u0644\u0644\u062A\u0635\u062F\u064A\u0631.`);
  }
  const actualQuality = lot.qualityScore ?? 88;
  if (actualQuality < bid.minimumQuality) {
    return failure(
      profile,
      "condition-not-met",
      `\u062C\u0648\u062F\u0629 \u0627\u0644\u0634\u062D\u0646\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 (${Math.round(actualQuality)}%) \u0623\u0642\u0644 \u0645\u0646 \u0645\u0639\u064A\u0627\u0631 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u062F\u0648\u0644\u064A \u0644\u062F\u0649 ${bid.destinationPort} (${bid.minimumQuality}%). \u0627\u0633\u062A\u062E\u062F\u0645 \u062E\u0627\u0645\u0627\u062A Grade A+ \u0623\u0648 \u0639\u064A\u0651\u0646 \u0645\u062F\u064A\u0631\u0627\u064B \u0644\u0631\u0641\u0639 \u0627\u0644\u062C\u0648\u062F\u0629.`
    );
  }
  const grossRevenue = quantity * bid.unitPrice;
  const clearanceFee = Math.round(grossRevenue * bid.exportClearanceRate);
  const costOfGoods = Math.round(lot.unitCost * quantity);
  const netProceeds = grossRevenue - clearanceFee;
  const nextInventory = profile.inventory.flatMap(
    (item) => item.id !== lot.id ? [item] : item.quantity === quantity ? [] : [{ ...item, quantity: item.quantity - quantity }]
  );
  const sale = {
    id: nextId(profile, "sale", profile.sales.length),
    productId: bid.productId,
    quantity,
    unitPrice: bid.unitPrice,
    grossRevenue,
    tax: clearanceFee,
    costOfGoods,
    soldOnDay: profile.day,
    soldAt: timestampFor(profile)
  };
  const exportShipment = {
    id: nextId(profile, "shipment", (profile.globalShipments ?? []).length),
    direction: "export",
    itemId: bid.productId,
    itemName: bid.productName,
    quantity,
    unit: bid.unit,
    unitCostOrPrice: bid.unitPrice,
    freightCost: 0,
    customsDuty: clearanceFee,
    shippingMode: "spot-ddp",
    originOrDestination: `${bid.destinationFlag} ${bid.destinationPort}`,
    partnerName: bid.buyerName,
    qualityScore: actualQuality,
    orderedOnDay: profile.day,
    arrivesOnDay: profile.day,
    deferredBalanceDue: 0,
    status: "delivered"
  };
  const nextReputation = Math.min(100, (profile.reputation ?? 50) + bid.reputationReward);
  const nextProfile = addLedger(
    {
      ...profile,
      inventory: nextInventory,
      sales: [...profile.sales, sale],
      reputation: nextReputation,
      globalShipments: [...(profile.globalShipments ?? []).slice(-60), exportShipment]
    },
    [
      ledgerEntry(profile, "revenue", grossRevenue, `\u062A\u0635\u062F\u064A\u0631 \u062F\u0648\u0644\u064A (${bid.incotermLabel}) \u0625\u0644\u0649 ${bid.destinationPort}: ${quantity} ${bid.productName}`, 0),
      ...clearanceFee > 0 ? [ledgerEntry(profile, "expense", clearanceFee, `\u0631\u0633\u0648\u0645 \u062A\u062E\u0644\u064A\u0635 \u0648\u0634\u062D\u0646 \u062A\u0635\u062F\u064A\u0631\u064A (${bid.destinationPort})`, 1)] : [],
      ...costOfGoods > 0 ? [ledgerEntry(profile, "expense", costOfGoods, `\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0627\u0644\u0645\u0635\u062F\u0631\u0629: ${bid.productName}`, 2)] : []
    ],
    profile.bankBalance + netProceeds
  );
  return success(
    syncTasks(nextProfile),
    `\u062A\u0645 \u062A\u0635\u062F\u064A\u0631 \u062D\u0627\u0648\u064A\u0629 ${quantity} ${bid.unit} \u0645\u0646 ${bid.productName} \u0625\u0644\u0649 ${bid.destinationPort} \u0628\u0635\u0627\u0641\u064A \u0639\u0627\u0626\u062F ${netProceeds.toLocaleString("ar-EG")} $ (+${bid.reputationReward} \u0633\u0645\u0639\u0629 \u062F\u0648\u0644\u064A\u0629).`,
    { productId: bid.productId, quantity, netProceeds, reputationEarned: bid.reputationReward }
  );
}
function signForwardContract(profile, templateId) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const template = getForwardContractTemplates(profile).find((item) => item.id === templateId);
  if (!template) {
    return failure(profile, "not-found", "\u0639\u0642\u062F \u0627\u0644\u062A\u062D\u0648\u0637 \u0627\u0644\u0622\u062C\u0644 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u062C\u0644\u0633\u0629.");
  }
  const activeCount = (profile.forwardContracts ?? []).filter((c) => c.status === "active").length;
  if (activeCount >= 4) {
    return failure(profile, "condition-not-met", "\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0627\u062D\u062A\u0641\u0627\u0638 \u0628\u0623\u0643\u062B\u0631 \u0645\u0646 4 \u0639\u0642\u0648\u062F \u062A\u0648\u0631\u064A\u062F \u0622\u062C\u0644\u0629 \u0646\u0634\u0637\u0629 \u0641\u064A \u0646\u0641\u0633 \u0627\u0644\u0648\u0642\u062A.");
  }
  if ((profile.forwardContracts ?? []).some((c) => c.status === "active" && c.materialId === template.materialId)) {
    return failure(profile, "already-owned", `\u0644\u062F\u064A\u0643 \u0639\u0642\u062F \u062A\u0648\u0631\u064A\u062F \u0622\u062C\u0644 \u0646\u0634\u0637 \u0628\u0627\u0644\u0641\u0639\u0644 \u0644\u0645\u0627\u062F\u0629 ${template.materialName}.`);
  }
  if (profile.bankBalance < template.marginDeposit) {
    return failure(
      profile,
      "insufficient-funds",
      `\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 ${template.marginDeposit.toLocaleString("ar-EG")} $ \u0643\u0647\u0627\u0645\u0634 \u062A\u0623\u0645\u064A\u0646 (15%) \u0644\u062A\u062B\u0628\u064A\u062A \u0633\u0639\u0631 ${template.materialName}.`
    );
  }
  const contract = {
    id: nextId(profile, "fwd", (profile.forwardContracts ?? []).length),
    materialId: template.materialId,
    materialName: template.materialName,
    supplierName: template.supplierName,
    originHub: template.originHub,
    lockedUnitPrice: template.lockedUnitPrice,
    dailyQuota: template.dailyQuota,
    remainingQuota: template.totalContractUnits,
    marginPaid: template.marginDeposit,
    startedOnDay: profile.day,
    expiresOnDay: profile.day + template.durationDays,
    qualityScore: template.qualityScore,
    status: "active"
  };
  const prevTrust = profile.supplierTrust?.[template.supplierId] ?? 0;
  const nextProfile = addLedger(
    {
      ...profile,
      forwardContracts: [...profile.forwardContracts ?? [], contract],
      supplierTrust: {
        ...profile.supplierTrust ?? {},
        [template.supplierId]: Math.min(100, prevTrust + 15)
      }
    },
    [
      ledgerEntry(
        profile,
        "asset",
        template.marginDeposit,
        `\u0647\u0627\u0645\u0634 \u062A\u0623\u0645\u064A\u0646 \u0639\u0642\u062F \u062A\u0648\u0631\u064A\u062F \u0622\u062C\u0644 (15%) \xB7 ${template.materialName} \u0628\u0633\u0639\u0631 \u0645\u062B\u0628\u062A ${template.lockedUnitPrice} $`,
        0
      )
    ],
    profile.bankBalance - template.marginDeposit
  );
  return success(
    nextProfile,
    `\u062A\u0645 \u062A\u0648\u0642\u064A\u0639 \u0639\u0642\u062F \u0627\u0644\u062A\u0648\u0631\u064A\u062F \u0627\u0644\u0622\u062C\u0644 \u0644\u0645\u0627\u062F\u0629 ${template.materialName} \u0628\u0633\u0639\u0631 \u0645\u062B\u0628\u062A ${template.lockedUnitPrice.toLocaleString("ar-EG")} $ \u062D\u062A\u0649 \u0627\u0644\u064A\u0648\u0645 ${contract.expiresOnDay}.`,
    contract
  );
}
function drawFromForwardContract(profile, contractId, quantity) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveInteger(quantity)) {
    return failure(profile, "invalid-input", "\u0627\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0645\u0633\u062D\u0648\u0628\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0639\u062F\u062F\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627 \u0645\u0648\u062C\u0628\u064B\u0627.");
  }
  const contract = (profile.forwardContracts ?? []).find((c) => c.id === contractId && c.status === "active");
  if (!contract) {
    return failure(profile, "not-found", "\u0627\u0644\u0639\u0642\u062F \u0627\u0644\u0622\u062C\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u062A\u0647.");
  }
  if (profile.day > contract.expiresOnDay) {
    return failure(profile, "condition-not-met", "\u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0647\u0630\u0627 \u0627\u0644\u0639\u0642\u062F \u0627\u0644\u0622\u062C\u0644.");
  }
  if (quantity > contract.remainingQuota) {
    return failure(
      profile,
      "market-limit",
      `\u0627\u0644\u0631\u0635\u064A\u062F \u0627\u0644\u0645\u062A\u0628\u0642\u064A \u0641\u064A \u0627\u0644\u0639\u0642\u062F \u0627\u0644\u0622\u062C\u0644 \u0647\u0648 ${contract.remainingQuota} \u0648\u062D\u062F\u0629 \u0641\u0642\u0637.`
    );
  }
  const material = findMaterial(contract.materialId);
  if (!material) return failure(profile, "not-found", "\u0627\u0644\u0645\u0627\u062F\u0629 \u0627\u0644\u062E\u0627\u0645 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641\u0629.");
  const existing = profile.inventory.find((lot) => lot.materialOrProductId === material.id);
  const level = normalizeWarehouseLevel(profile.warehouseLevel);
  const itemLimit = getWarehouseItemCapacity(material.id, level) ?? material.storageLimit;
  const warehouseUsage = getWarehouseUsage(profile.inventory, profile.productionOrders);
  const warehouseCapacity = getWarehouseCapacity(level);
  if ((existing?.quantity ?? 0) + quantity > itemLimit || warehouseUsage.materials + quantity > warehouseCapacity.materials) {
    return failure(profile, "storage-limit", "\u0633\u0639\u0629 \u0627\u0644\u0645\u062E\u0632\u0646 \u0644\u0627 \u062A\u0643\u0641\u064A \u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u062F\u0641\u0639\u0629 \u0627\u0644\u0645\u0633\u062D\u0648\u0628\u0629 \u0645\u0646 \u0627\u0644\u0639\u0642\u062F \u0627\u0644\u0622\u062C\u0644.");
  }
  const settlementDue = Math.max(1, Math.round(quantity * contract.lockedUnitPrice * 0.85));
  if (profile.bankBalance < settlementDue) {
    return failure(
      profile,
      "insufficient-funds",
      `\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 ${settlementDue.toLocaleString("ar-EG")} $ \u0644\u062A\u0633\u0648\u064A\u0629 85% \u0627\u0644\u0645\u062A\u0628\u0642\u064A\u0629 \u0645\u0646 \u0642\u064A\u0645\u0629 \u0627\u0644\u062F\u0641\u0639\u0629 \u0627\u0644\u0645\u0633\u062D\u0648\u0628\u0629.`
    );
  }
  const totalLotValue = quantity * contract.lockedUnitPrice;
  const inventory = existing ? profile.inventory.map(
    (lot) => lot.materialOrProductId === material.id ? {
      ...lot,
      quantity: lot.quantity + quantity,
      unitCost: (lot.quantity * lot.unitCost + totalLotValue) / (lot.quantity + quantity),
      qualityScore: Math.round(
        ((lot.qualityScore ?? 88) * lot.quantity + contract.qualityScore * quantity) / (lot.quantity + quantity) * 10
      ) / 10
    } : lot
  ) : [
    ...profile.inventory,
    {
      id: nextId(profile, "inventory", profile.inventory.length),
      materialOrProductId: material.id,
      quantity,
      unit: material.unit,
      unitCost: contract.lockedUnitPrice,
      qualityScore: contract.qualityScore
    }
  ];
  const remainingQuota = contract.remainingQuota - quantity;
  const updatedContracts = (profile.forwardContracts ?? []).map(
    (c) => c.id === contract.id ? { ...c, remainingQuota, status: remainingQuota === 0 ? "completed" : "active" } : c
  );
  const nextProfile = addLedger(
    { ...profile, inventory, forwardContracts: updatedContracts },
    [
      ledgerEntry(
        profile,
        "asset",
        settlementDue,
        `\u0633\u062D\u0628 ${quantity} ${material.unit} ${material.name} \u0645\u0646 \u0639\u0642\u062F \u0627\u0644\u062A\u062D\u0648\u0637 \u0627\u0644\u0622\u062C\u0644 \u0628\u0633\u0639\u0631 \u0645\u062B\u0628\u062A ${contract.lockedUnitPrice} $`,
        0
      )
    ],
    profile.bankBalance - settlementDue
  );
  return success(
    syncTasks(nextProfile),
    `\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 ${quantity} ${material.unit} \u0645\u0646 ${material.name} \u0628\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0645\u062B\u0628\u062A (${contract.lockedUnitPrice} $ / ${material.unit}).`,
    { contractId: contract.id, materialId: material.id, quantity, cashPaid: settlementDue }
  );
}
function upgradeWarehouse(profile, paymentMethod = "cash") {
  const currentLevel = normalizeWarehouseLevel(profile.warehouseLevel);
  const nextLevel = currentLevel + 1;
  const requirement = WAREHOUSE_UPGRADE_REQUIREMENTS[nextLevel];
  if (!requirement) return failure(profile, "condition-not-met", "\u0648\u0635\u0644 \u0627\u0644\u0645\u062E\u0632\u0646 \u0625\u0644\u0649 \u0623\u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u062A\u0637\u0648\u064A\u0631.");
  const payment = resolvePurchaseDebit(profile, requirement.cash, paymentMethod);
  if ("message" in payment) return failure(profile, "insufficient-funds", `\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 ${requirement.cash.toLocaleString("ar-EG")} $ \u0623\u0648 \u0645\u0627 \u064A\u0639\u0627\u062F\u0644\u0647\u0627 \u0628\u0627\u0644\u0645\u0627\u0633 \u0644\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0645\u062E\u0632\u0646. ${payment.message}`);
  const missing = Object.entries(requirement.materials).filter(([materialId, quantity]) => getWarehouseMaterialQuantity(profile, materialId) < quantity);
  if (missing.length > 0) {
    const labels = missing.map(([materialId, quantity]) => {
      const material = findMaterial(materialId);
      const owned = getWarehouseMaterialQuantity(profile, materialId);
      return `${material?.name ?? materialId}: ${Math.max(0, quantity - owned)} ${material?.unit ?? "\u0648\u062D\u062F\u0629"}`;
    });
    return failure(profile, "insufficient-materials", `\u0645\u0648\u0627\u062F \u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0645\u062E\u0632\u0646 \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629: ${labels.join("\u060C ")}.`);
  }
  const inventory = removeWarehouseMaterials(profile, requirement.materials);
  const materialValue = Object.entries(requirement.materials).reduce((sum, [materialId, quantity]) => sum + quantity * (findMaterial(materialId)?.pricePerUnit ?? 0), 0);
  const entries = [
    ledgerEntry(profile, "expense", requirement.cash, `\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0645\u062E\u0632\u0646 \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${nextLevel}`, 0),
    ...materialValue > 0 ? [ledgerEntry(profile, "expense", materialValue, "\u0645\u0648\u0627\u062F \u062E\u0627\u0645 \u0645\u0633\u062A\u0647\u0644\u0643\u0629 \u0641\u064A \u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0645\u062E\u0632\u0646", 1)] : []
  ];
  const capacity = getWarehouseCapacity(nextLevel);
  const nextProfile = addLedger({ ...profile, inventory, warehouseLevel: nextLevel }, entries, payment.bankBalance, { diamonds: payment.diamonds });
  return success(nextProfile, `\u062A\u0645 \u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0645\u062E\u0632\u0646 \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${nextLevel} ${paymentMethod === "diamonds" ? `\u0645\u0642\u0627\u0628\u0644 ${payment.diamondsSpent} \u0645\u0627\u0633\u0629` : "\u0646\u0642\u062F\u064B\u0627"}. \u0633\u0639\u0629 \u0627\u0644\u062E\u0627\u0645\u0627\u062A ${capacity.materials.toLocaleString("ar-EG")} \u0648\u062D\u062F\u0629 \u0648\u0633\u0639\u0629 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A ${capacity.products.toLocaleString("ar-EG")} \u0648\u062D\u062F\u0629.`, { level: nextLevel, cost: requirement.cash, diamondsSpent: payment.diamondsSpent, capacity });
}
function foundCompany(profile, industryId, landId, name, paymentMethod = "cash") {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const industry = findIndustry(industryId);
  const country = findCountry(profile.countryId);
  if (!industry || !country) return failure(profile, "not-found", "\u0627\u0644\u0642\u0637\u0627\u0639 \u0623\u0648 \u0627\u0644\u062F\u0648\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F.");
  const land = profile.lands.find((item) => item.id === landId);
  if (!land) return failure(profile, "land-required", "\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0623\u0631\u0636 \u0645\u0645\u0644\u0648\u0643\u0629 \u0644\u062A\u0623\u0633\u064A\u0633 \u0627\u0644\u0634\u0631\u0643\u0629.");
  if ((land.availableForCompanyOnDay ?? land.acquiredOnDay ?? 1) > profile.day) return failure(profile, "condition-not-met", `\u0627\u0644\u0623\u0631\u0636 \u0642\u064A\u062F \u0625\u0646\u0647\u0627\u0621 \u0639\u0642\u0648\u062F \u0646\u0642\u0644 \u0627\u0644\u0645\u0644\u0643\u064A\u0629\u060C \u0648\u0633\u062A\u062A\u0627\u062D \u0644\u0644\u062A\u0623\u0633\u064A\u0633 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${land.availableForCompanyOnDay}.`);
  if (profile.companies.some((company2) => company2.landId === landId)) return failure(profile, "land-in-use", "\u0627\u0644\u0623\u0631\u0636 \u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0634\u0631\u0643\u0629 \u0623\u062E\u0631\u0649 \u0628\u0627\u0644\u0641\u0639\u0644.");
  if (land.landType && land.landType !== industry.requiredLandType) return failure(profile, "wrong-land-type", "\u0646\u0648\u0639 \u0627\u0644\u0623\u0631\u0636 \u0644\u0627 \u064A\u0646\u0627\u0633\u0628 \u0647\u0630\u0627 \u0627\u0644\u0642\u0637\u0627\u0639.");
  const companyName = name.trim();
  if (!companyName) return failure(profile, "invalid-input", "\u0623\u062F\u062E\u0644 \u0627\u0633\u0645\u064B\u0627 \u0644\u0644\u0634\u0631\u0643\u0629.");
  const setupFee = country.economy.companySetupFee ?? industry.setupFee;
  const licenseFee = country.economy.licenseFeesByIndustry[industryId] ?? industry.licenseFee;
  const totalCost = setupFee + licenseFee;
  const payment = resolvePurchaseDebit(profile, totalCost, paymentMethod);
  if ("message" in payment) return failure(profile, "insufficient-funds", `\u0644\u0627 \u064A\u0643\u0641\u064A \u0631\u0635\u064A\u062F\u0643 \u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u062A\u0623\u0633\u064A\u0633 \u0648\u0627\u0644\u062A\u0631\u062E\u064A\u0635. ${payment.message}`);
  const companyId = nextId(profile, "company", profile.companies.length);
  const licenseId = nextId(profile, "license", profile.licenses.length);
  const company = {
    id: companyId,
    name: companyName,
    industryId,
    countryId: profile.countryId,
    foundedAt: timestampFor(profile),
    foundedOnDay: profile.day,
    landId,
    licenseIds: [licenseId],
    energyUnits: industry.energyCapacity,
    energyCapacity: industry.energyCapacity,
    operatingCostPerDay: industry.dailyOperatingCost
  };
  const license = { id: licenseId, countryId: profile.countryId, industryId, feePaid: licenseFee, issuedAt: timestampFor(profile) };
  const nextProfile = addLedger(
    { ...profile, companies: [...profile.companies, company], licenses: [...profile.licenses, license] },
    [
      ledgerEntry(profile, "expense", setupFee, `\u0631\u0633\u0648\u0645 \u062A\u0623\u0633\u064A\u0633 \u0634\u0631\u0643\u0629 ${companyName}`, 0),
      ledgerEntry(profile, "expense", licenseFee, `\u062A\u0631\u062E\u064A\u0635 \u0642\u0637\u0627\u0639 ${industry.name}`, 1)
    ],
    payment.bankBalance,
    { diamonds: payment.diamonds }
  );
  return success(syncTasks(nextProfile), `\u062A\u0645 \u062A\u0623\u0633\u064A\u0633 ${companyName} \u0648\u062A\u0631\u062E\u064A\u0635\u0647\u0627 ${paymentMethod === "diamonds" ? `\u0645\u0642\u0627\u0628\u0644 ${payment.diamondsSpent} \u0645\u0627\u0633\u0629` : "\u0646\u0642\u062F\u064B\u0627"}.`, { companyId, totalCost, diamondsSpent: payment.diamondsSpent });
}
function upgradeCompany(profile, companyId, paymentMethod = "cash") {
  const company = profile.companies.find((item) => item.id === companyId);
  if (!company) return failure(profile, "not-found", "\u0627\u0644\u0634\u0631\u0643\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.");
  const level = company.upgradeLevel ?? 1;
  if (level >= 5) return failure(profile, "condition-not-met", "\u0648\u0635\u0644\u062A \u0647\u0630\u0647 \u0627\u0644\u0634\u0631\u0643\u0629 \u0625\u0644\u0649 \u0623\u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u062A\u0637\u0648\u064A\u0631.");
  const completedBatches = profile.productionOrders.filter((order) => order.companyId === companyId && order.status === "completed").reduce((sum, order) => sum + order.batches, 0);
  const requiredBatches = level * 2;
  if (completedBatches < requiredBatches) return failure(profile, "condition-not-met", `\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0625\u0643\u0645\u0627\u0644 ${requiredBatches} \u062F\u0641\u0639\u0627\u062A \u0625\u0646\u062A\u0627\u062C \u0642\u0628\u0644 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${level + 1}. \u0623\u0643\u0645\u0644\u062A ${completedBatches}.`);
  const cost = Math.round(12e4 * Math.pow(1.55, level - 1));
  const payment = resolvePurchaseDebit(profile, cost, paymentMethod);
  if ("message" in payment) return failure(profile, "insufficient-funds", `\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 ${cost.toLocaleString("ar-EG")} $ \u0623\u0648 \u0645\u0627 \u064A\u0639\u0627\u062F\u0644\u0647\u0627 \u0628\u0627\u0644\u0645\u0627\u0633 \u0644\u062A\u0637\u0648\u064A\u0631 \u0627\u0644\u0634\u0631\u0643\u0629. ${payment.message}`);
  const capacityBonus = 20 * level;
  const companies = profile.companies.map((item) => item.id === companyId ? { ...item, upgradeLevel: level + 1, energyCapacity: (item.energyCapacity ?? 0) + capacityBonus, energyUnits: (item.energyUnits ?? 0) + capacityBonus, maintenanceCondition: 100 } : item);
  const nextProfile = addLedger({ ...profile, companies }, [ledgerEntry(profile, "expense", cost, `\u062A\u0637\u0648\u064A\u0631 ${company.name} \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${level + 1}`, 0)], payment.bankBalance, { diamonds: payment.diamonds });
  return success(nextProfile, `\u062A\u0645 \u062A\u0637\u0648\u064A\u0631 ${company.name} \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${level + 1} ${paymentMethod === "diamonds" ? `\u0645\u0642\u0627\u0628\u0644 ${payment.diamondsSpent} \u0645\u0627\u0633\u0629` : "\u0646\u0642\u062F\u064B\u0627"} \u0648\u0632\u0627\u062F\u062A \u0637\u0627\u0642\u062A\u0647\u0627.`, { companyId, level: level + 1, cost, diamondsSpent: payment.diamondsSpent });
}
function runProduction(profile, companyId, batches) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveInteger(batches)) return failure(profile, "invalid-input", "\u0639\u062F\u062F \u062F\u0641\u0639\u0627\u062A \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0639\u062F\u062F\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627 \u0645\u0648\u062C\u0628\u064B\u0627.");
  const company = profile.companies.find((item) => item.id === companyId);
  if (!company) return failure(profile, "not-found", "\u0627\u0644\u0634\u0631\u0643\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.");
  if ((company.operationalFromDay ?? 1) > profile.day) return failure(profile, "condition-not-met", `\u064A\u062C\u0631\u064A \u0625\u0646\u0647\u0627\u0621 \u0639\u0642\u0648\u062F \u0646\u0642\u0644 \u0627\u0644\u0645\u0644\u0643\u064A\u0629\u061B \u064A\u0628\u062F\u0623 \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0634\u0631\u0643\u0629 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${company.operationalFromDay}.`);
  const recipe = findRecipeForIndustry(company.industryId);
  if (!recipe) return failure(profile, "not-found", "\u0644\u0627 \u062A\u0648\u062C\u062F \u0648\u0635\u0641\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0642\u0637\u0627\u0639.");
  const product = PRODUCT_CATALOG.find((item) => item.id === recipe.productId);
  if (!product) return failure(profile, "not-found", "\u0627\u0644\u0645\u0646\u062A\u062C \u0627\u0644\u0646\u0627\u062A\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C.");
  const maintenanceCondition = company.maintenanceCondition ?? 100;
  if (maintenanceCondition < 25) return failure(profile, "factory-maintenance", "\u0627\u0644\u0645\u0635\u0646\u0639 \u0645\u062A\u0639\u0637\u0644 \u0648\u064A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0635\u064A\u0627\u0646\u0629 \u0642\u0628\u0644 \u0628\u062F\u0621 \u0623\u0645\u0631 \u062C\u062F\u064A\u062F.");
  const energyAvailable = company.energyUnits ?? 0;
  if (energyAvailable < batches * recipe.energyUnits) return failure(profile, "insufficient-energy", "\u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u0644\u0627 \u062A\u0643\u0641\u064A \u0644\u0647\u0630\u0647 \u0627\u0644\u062F\u0641\u0639\u0627\u062A.");
  for (const input of recipe.inputs) {
    const lot = profile.inventory.find((item) => item.materialOrProductId === input.materialId);
    if (!lot || lot.quantity < input.quantity * batches) return failure(profile, "insufficient-materials", "\u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062E\u0627\u0645 \u0644\u0627 \u062A\u0643\u0641\u064A \u0644\u0647\u0630\u0647 \u0627\u0644\u062F\u0641\u0639\u0627\u062A.");
  }
  const energyCost = batches * recipe.energyCost;
  const maintenanceCost = Math.round((company.operatingCostPerDay ?? 0) * 0.15 * getOperatingCostProgression(profile.day));
  if (profile.bankBalance < energyCost + maintenanceCost) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0627\u0644\u0631\u0635\u064A\u062F \u0644\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0637\u0627\u0642\u0629 \u0648\u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0623\u0645\u0631.");
  const materialCost = recipe.inputs.reduce((sum, input) => {
    const lot = profile.inventory.find((item) => item.materialOrProductId === input.materialId);
    return sum + input.quantity * batches * (lot?.unitCost ?? 0);
  }, 0);
  const currentProductQuantity = profile.inventory.find((lot) => lot.materialOrProductId === product.id)?.quantity ?? 0;
  const plannedProductQuantity = profile.productionOrders.filter((order2) => order2.status === "active" && order2.productId === product.id).reduce((sum, order2) => sum + order2.outputQuantity, 0);
  const outputQuantity = Math.max(recipe.outputQuantity, Math.round(batches * recipe.outputQuantity * getSynergyProductionMultiplier(profile)));
  const warehouseLevel = normalizeWarehouseLevel(profile.warehouseLevel);
  const itemProductLimit = getWarehouseItemCapacity(product.id, warehouseLevel) ?? product.storageLimit;
  const warehouseUsage = getWarehouseUsage(profile.inventory, profile.productionOrders);
  const warehouseCapacity = getWarehouseCapacity(warehouseLevel);
  if (currentProductQuantity + plannedProductQuantity + outputQuantity > itemProductLimit || warehouseUsage.products + outputQuantity > warehouseCapacity.products) {
    const itemAvailable = itemProductLimit - currentProductQuantity - plannedProductQuantity;
    const totalAvailable = warehouseCapacity.products - warehouseUsage.products;
    return failure(profile, "storage-limit", `\u0633\u0639\u0629 \u0627\u0644\u0645\u062E\u0632\u0646 \u0644\u0627 \u062A\u0643\u0641\u064A \u0644\u0644\u0625\u0646\u062A\u0627\u062C \u0627\u0644\u0645\u062E\u0637\u0637\u061B \u0627\u0644\u0645\u062A\u0627\u062D \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062A\u062C ${Math.max(0, itemAvailable)} ${product.unit}\u060C \u0648\u0627\u0644\u0633\u0639\u0629 \u0627\u0644\u0643\u0644\u064A\u0629 \u0627\u0644\u0645\u062A\u0628\u0642\u064A\u0629 ${Math.max(0, totalAvailable)} \u0648\u062D\u062F\u0629.`);
  }
  const inventory = profile.inventory.map((lot) => {
    const input = recipe.inputs.find((item) => item.materialId === lot.materialOrProductId);
    return input ? { ...lot, quantity: lot.quantity - input.quantity * batches } : lot;
  }).filter((lot) => lot.quantity > 0);
  const companies = profile.companies.map((item) => item.id === companyId ? { ...item, energyUnits: energyAvailable - batches * recipe.energyUnits } : item);
  const manager = profile.staff.find((member) => member.status === "active" && member.role === "manager" && member.companyId === companyId);
  const managerLevel = staffLevel(manager);
  const durationDays = Math.min(3, Math.max(1, Math.ceil(batches / 3) - (manager ? 1 : 0)));
  const inputQualities = recipe.inputs.map((input) => {
    const lot = profile.inventory.find((item) => item.materialOrProductId === input.materialId);
    return lot?.qualityScore ?? 88;
  });
  const avgInputQuality = inputQualities.length > 0 ? inputQualities.reduce((sum, q) => sum + q, 0) / inputQualities.length : 88;
  const materialQualityDelta = Math.round((avgInputQuality - 88) * 0.7);
  const marketForecast = getMarketQuote(profile, recipe.productId, profile.day + durationDays);
  const qualityScore = Math.max(70, Math.min(100, 86 + materialQualityDelta + (manager ? 10 + (managerLevel - 1) * 3 : 0) - (maintenanceCondition < 60 ? 10 : 0)));
  const expectedUnitCost = (materialCost + energyCost + maintenanceCost) / outputQuantity;
  const nextMaintenanceCondition = Math.max(0, maintenanceCondition - Math.max(8, Math.ceil(batches / 2)));
  const order = { id: nextId(profile, "production", profile.productionOrders.length), companyId, productId: recipe.productId, productName: recipe.productName, batches, outputQuantity, outputUnit: recipe.outputUnit, materialCost, energyCost, expectedUnitCost, demandForecast: marketForecast?.demandUnits ?? 0, qualityScore, maintenanceCost, startedOnDay: profile.day, completesOnDay: profile.day + durationDays, status: "active" };
  const companiesWithMaintenance = companies.map((item) => item.id === companyId ? { ...item, maintenanceCondition: nextMaintenanceCondition } : item);
  const nextProfile = addLedger(
    { ...profile, inventory, companies: companiesWithMaintenance, productionOrders: [...profile.productionOrders, order] },
    [ledgerEntry(profile, "expense", energyCost, `\u062D\u062C\u0632 \u0637\u0627\u0642\u0629 \u0644\u0623\u0645\u0631 \u0625\u0646\u062A\u0627\u062C ${recipe.productName}`, 0), ledgerEntry(profile, "expense", maintenanceCost, `\u0635\u064A\u0627\u0646\u0629 \u0648\u0642\u0627\u0626\u064A\u0629 \u0644\u0623\u0645\u0631 \u0625\u0646\u062A\u0627\u062C ${recipe.productName}`, 1), ledgerEntry(profile, "asset", materialCost, `\u062D\u062C\u0632 \u0645\u0648\u0627\u062F \u0644\u0623\u0645\u0631 \u0625\u0646\u062A\u0627\u062C ${recipe.productName}`, 2)],
    profile.bankBalance - energyCost - maintenanceCost
  );
  return success(syncTasks(nextProfile), `\u0628\u062F\u0623 \u0623\u0645\u0631 \u0625\u0646\u062A\u0627\u062C ${recipe.productName} \u0648\u064A\u0643\u062A\u0645\u0644 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${order.completesOnDay}.`, { orderId: order.id, companyId, productId: recipe.productId, batches, outputQuantity, completesOnDay: order.completesOnDay });
}
function autoSupplyAndProduce(profile, companyId, batches) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveInteger(batches)) return failure(profile, "invalid-input", "\u0639\u062F\u062F \u062F\u0641\u0639\u0627\u062A \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0639\u062F\u062F\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627 \u0645\u0648\u062C\u0628\u064B\u0627.");
  const company = profile.companies.find((item) => item.id === companyId);
  if (!company) return failure(profile, "not-found", "\u0627\u0644\u0634\u0631\u0643\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.");
  if ((company.operationalFromDay ?? 1) > profile.day) return failure(profile, "condition-not-met", `\u064A\u062C\u0631\u064A \u0625\u0646\u0647\u0627\u0621 \u0639\u0642\u0648\u062F \u0646\u0642\u0644 \u0627\u0644\u0645\u0644\u0643\u064A\u0629\u061B \u064A\u0628\u062F\u0623 \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0634\u0631\u0643\u0629 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${company.operationalFromDay}.`);
  const recipe = findRecipeForIndustry(company.industryId);
  if (!recipe) return failure(profile, "not-found", "\u0644\u0627 \u062A\u0648\u062C\u062F \u0648\u0635\u0641\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0642\u0637\u0627\u0639.");
  let missingCost = 0;
  const purchases = [];
  for (const input of recipe.inputs) {
    const lot = profile.inventory.find((item) => item.materialOrProductId === input.materialId);
    const needed = input.quantity * batches;
    const owned = lot?.quantity ?? 0;
    if (owned < needed) {
      const missing = needed - owned;
      const mat = findMaterial(input.materialId);
      const unitPrice = mat?.pricePerUnit ?? 100;
      const cost = missing * unitPrice;
      missingCost += cost;
      purchases.push({ materialId: input.materialId, quantity: missing, unitPrice, cost, name: mat?.name ?? input.materialId });
    }
  }
  const energyCost = batches * recipe.energyCost;
  const maintenanceCost = Math.round((company.operatingCostPerDay ?? 0) * 0.15 * getOperatingCostProgression(profile.day));
  const totalFundsNeeded = missingCost + energyCost + maintenanceCost;
  if (profile.bankBalance < totalFundsNeeded) {
    return failure(profile, "insufficient-funds", `\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 ${totalFundsNeeded.toLocaleString("ar-EG")} $ \u0644\u062A\u0623\u0645\u064A\u0646 \u0627\u0644\u062E\u0627\u0645\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0648\u0627\u0644\u0637\u0627\u0642\u0629 \u0648\u0627\u0644\u0635\u064A\u0627\u0646\u0629.`);
  }
  if (purchases.length > 0) {
    const level = normalizeWarehouseLevel(profile.warehouseLevel);
    const warehouseCapacity = getWarehouseCapacity(level);
    const warehouseUsage = getWarehouseUsage(profile.inventory, profile.productionOrders);
    const totalNewMaterials = purchases.reduce((sum, p) => sum + p.quantity, 0);
    if (warehouseUsage.materials + totalNewMaterials > warehouseCapacity.materials) {
      return failure(profile, "storage-limit", `\u0633\u0639\u0629 \u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062E\u0627\u0645 \u0641\u064A \u0627\u0644\u0645\u062E\u0632\u0646 \u0644\u0627 \u062A\u0643\u0641\u064A \u0644\u0627\u0633\u062A\u064A\u0639\u0627\u0628 \u0627\u0644\u062E\u0627\u0645\u0627\u062A \u0627\u0644\u0646\u0627\u0642\u0635\u0629 (${totalNewMaterials} \u0648\u062D\u062F\u0629).`);
    }
  }
  let updatedInventory = [...profile.inventory];
  const ledgerEntries = [];
  for (const p of purchases) {
    const existing = updatedInventory.find((lot) => lot.materialOrProductId === p.materialId);
    if (existing) {
      const newQuantity = existing.quantity + p.quantity;
      const newUnitCost = (existing.quantity * existing.unitCost + p.cost) / newQuantity;
      updatedInventory = updatedInventory.map((lot) => lot.materialOrProductId === p.materialId ? { ...lot, quantity: newQuantity, unitCost: newUnitCost } : lot);
    } else {
      updatedInventory.push({
        id: nextId(profile, "inventory", updatedInventory.length),
        materialOrProductId: p.materialId,
        quantity: p.quantity,
        unit: findMaterial(p.materialId)?.unit ?? "\u0648\u062D\u062F\u0629",
        unitCost: p.unitPrice
      });
    }
    ledgerEntries.push(ledgerEntry(profile, "expense", p.cost, `\u0634\u0631\u0627\u0621 \u062E\u0627\u0645\u0627\u062A \u062A\u0634\u063A\u064A\u0644 \u0641\u0648\u0631\u064A\u0629: ${p.name} (${p.quantity} \u0648\u062D\u062F\u0629)`, ledgerEntries.length));
  }
  const suppliedProfile = purchases.length > 0 ? addLedger(
    { ...profile, inventory: updatedInventory },
    ledgerEntries,
    profile.bankBalance - missingCost
  ) : profile;
  const productionResult = runProduction(suppliedProfile, companyId, batches);
  if (!productionResult.ok) return productionResult;
  const supplyMsg = purchases.length > 0 ? `\u062A\u0645 \u062A\u0623\u0645\u064A\u0646 \u0627\u0644\u062E\u0627\u0645\u0627\u062A \u0627\u0644\u0646\u0627\u0642\u0635\u0629 \u0628\u0642\u064A\u0645\u0629 ${missingCost.toLocaleString("ar-EG")} $ \u0648` : "";
  return {
    ...productionResult,
    message: `${supplyMsg}${productionResult.message}`
  };
}
function serviceCompany(profile, companyId) {
  const company = profile.companies.find((item) => item.id === companyId);
  if (!company) return failure(profile, "not-found", "\u0627\u0644\u0634\u0631\u0643\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.");
  const cost = Math.max(5e3, Math.round((company.operatingCostPerDay ?? 0) * 0.4 * getOperatingCostProgression(profile.day)));
  if (profile.bankBalance < cost) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0627\u0644\u0631\u0635\u064A\u062F \u0644\u0625\u062C\u0631\u0627\u0621 \u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0645\u0635\u0646\u0639.");
  const nextProfile = addLedger(
    { ...profile, companies: profile.companies.map((item) => item.id === companyId ? { ...item, maintenanceCondition: 100 } : item) },
    [ledgerEntry(profile, "expense", cost, `\u0635\u064A\u0627\u0646\u0629 \u0643\u0627\u0645\u0644\u0629 \u0644\u0644\u0645\u0635\u0646\u0639: ${company.name}`, 0)],
    profile.bankBalance - cost
  );
  return success(nextProfile, `\u062A\u0645\u062A \u0635\u064A\u0627\u0646\u0629 ${company.name} \u0648\u0639\u0627\u062F\u062A \u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0645\u0635\u0646\u0639 \u0625\u0644\u0649 100%.`, { companyId, cost });
}
function cancelProductionOrder(profile, orderId) {
  const order = profile.productionOrders.find((item) => item.id === orderId);
  if (!order) return failure(profile, "not-found", "\u0623\u0645\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F.");
  if (order.status !== "active") return failure(profile, "production-not-cancellable", "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0625\u0644\u063A\u0627\u0621 \u0623\u0645\u0631 \u0645\u0643\u062A\u0645\u0644 \u0623\u0648 \u0645\u0644\u063A\u0649.");
  const refund = Math.round(order.materialCost * 0.7);
  const unrecoveredMaterialCost = Math.max(0, order.materialCost - refund);
  const nextProfile = addLedger(
    { ...profile, productionOrders: profile.productionOrders.map((item) => item.id === orderId ? { ...item, status: "cancelled" } : item) },
    [ledgerEntry(profile, "settlement", refund, `\u0627\u0633\u062A\u0631\u062F\u0627\u062F 70% \u0645\u0646 \u062D\u062C\u0632 \u0623\u0645\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C ${order.productName}`, 0), ...unrecoveredMaterialCost > 0 ? [ledgerEntry(profile, "expense", unrecoveredMaterialCost, `\u062E\u0633\u0627\u0631\u0629 \u0645\u0648\u0627\u062F \u063A\u064A\u0631 \u0645\u0633\u062A\u0631\u062F\u0629 \u0644\u0623\u0645\u0631 ${order.productName}`, 1)] : []],
    profile.bankBalance + refund
  );
  return success(nextProfile, `\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0623\u0645\u0631 \u0648\u0627\u0633\u062A\u0631\u062F\u0627\u062F ${refund.toLocaleString("ar-EG")} $ \u0645\u0646 \u0627\u0644\u062D\u062C\u0632.`, { orderId, refund });
}
function useProductionSpeedCard(profile, orderId, kind) {
  const card = profile.speedCards.find((item) => item.kind === kind && item.quantity > 0);
  if (!card) return failure(profile, "insufficient-funds", "\u0644\u0627 \u062A\u0645\u0644\u0643 \u0647\u0630\u0647 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0641\u064A \u0645\u062E\u0632\u0648\u0646\u0643.");
  if (kind === "capacity-boost" || kind.startsWith("day-speed-")) return failure(profile, "invalid-input", "\u0647\u0630\u0647 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0644\u064A\u0633\u062A \u0645\u062E\u0635\u0635\u0629 \u0644\u0623\u0648\u0627\u0645\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C.");
  const order = profile.productionOrders.find((item) => item.id === orderId);
  if (!order || order.status !== "active") return failure(profile, "not-found", "\u0623\u0645\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u063A\u064A\u0631 \u0646\u0634\u0637 \u0623\u0648 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F.");
  const remainingDays = Math.max(1, order.completesOnDay - profile.day);
  const reduction = kind === "production-instant" ? remainingDays : Math.max(1, Math.ceil(remainingDays * (kind === "production-50" ? 0.5 : 0.25)));
  const completesOnDay = Math.max(profile.day, order.completesOnDay - reduction);
  const speedCards = profile.speedCards.map((item) => item.kind === kind ? { ...item, quantity: item.quantity - 1 } : item).filter((item) => item.quantity > 0);
  const productionOrders = profile.productionOrders.map((item) => item.id === orderId ? { ...item, completesOnDay } : item);
  return success({ ...profile, speedCards, productionOrders }, `\u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u062A\u0633\u0631\u064A\u0639\u061B \u064A\u0643\u062A\u0645\u0644 \u0627\u0644\u0623\u0645\u0631 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${completesOnDay}.`, { orderId, kind, completesOnDay });
}
function useDaySpeedCard(profile, kind) {
  if (kind !== "day-speed-2x" && kind !== "day-speed-3x") return failure(profile, "invalid-input", "\u0627\u062E\u062A\u0631 \u0628\u0637\u0627\u0642\u0629 \u062A\u0633\u0631\u064A\u0639 \u0627\u0644\u064A\u0648\u0645 \xD72 \u0623\u0648 \xD73.");
  if (profile.activeDaySpeedMultiplier > 1) return failure(profile, "condition-not-met", "\u0628\u0637\u0627\u0642\u0629 \u062A\u0633\u0631\u064A\u0639 \u0627\u0644\u064A\u0648\u0645 \u0645\u0633\u062A\u062E\u062F\u0645\u0629 \u0628\u0627\u0644\u0641\u0639\u0644\u061B \u064A\u0645\u0643\u0646\u0643 \u062A\u0641\u0639\u064A\u0644 \u0628\u0637\u0627\u0642\u0629 \u062C\u062F\u064A\u062F\u0629 \u0628\u0639\u062F \u0627\u0646\u062A\u0642\u0627\u0644 \u0627\u0644\u064A\u0648\u0645.");
  const card = profile.speedCards.find((item) => item.kind === kind && item.quantity > 0);
  if (!card) return failure(profile, "insufficient-funds", "\u0644\u0627 \u062A\u0645\u0644\u0643 \u0647\u0630\u0647 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0641\u064A \u0645\u062E\u0632\u0648\u0646\u0643.");
  const multiplier = kind === "day-speed-2x" ? 2 : 3;
  const speedCards = profile.speedCards.map((item) => item.kind === kind ? { ...item, quantity: item.quantity - 1 } : item).filter((item) => item.quantity > 0);
  return success({ ...profile, speedCards, activeDaySpeedMultiplier: multiplier }, `\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0628\u0637\u0627\u0642\u0629 \xD7${multiplier} \u0644\u0647\u0630\u0627 \u0627\u0644\u064A\u0648\u0645\u061B \u0633\u064A\u0635\u0628\u062D \u0627\u0644\u064A\u0648\u0645 \u0623\u0633\u0631\u0639.`, { kind, multiplier });
}
function buySpeedCard(profile, kind, quantity, paymentMethod = "diamonds") {
  if (!isPositiveInteger(quantity)) return failure(profile, "invalid-input", "\u0639\u062F\u062F \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0639\u062F\u062F\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627 \u0645\u0648\u062C\u0628\u064B\u0627.");
  const cost = SPEED_CARD_DIAMOND_COSTS[kind];
  if (!cost) return failure(profile, "not-found", "\u0646\u0648\u0639 \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0633\u0631\u0639\u0629 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641.");
  const diamondsSpent = cost * quantity;
  const cashPrice = getCashPriceForDiamondPrice(diamondsSpent);
  const payment = resolvePurchaseDebit(profile, cashPrice, paymentMethod, diamondsSpent);
  if ("message" in payment) return failure(profile, "insufficient-funds", payment.message);
  const existing = profile.speedCards.find((card) => card.kind === kind);
  const speedCards = existing ? profile.speedCards.map((card) => card.kind === kind ? { ...card, quantity: card.quantity + quantity } : card) : [...profile.speedCards, { kind, quantity }];
  const updated = { ...profile, speedCards };
  const nextProfile = paymentMethod === "cash" ? addLedger(updated, [ledgerEntry(profile, "expense", cashPrice, `\u0634\u0631\u0627\u0621 ${quantity} \u0628\u0637\u0627\u0642\u0629 ${SPEED_CARD_LABELS[kind]} \u0646\u0642\u062F\u064B\u0627`, 0)], payment.bankBalance, { diamonds: payment.diamonds }) : { ...updated, diamonds: payment.diamonds };
  return success(nextProfile, `\u062A\u0645 \u0634\u0631\u0627\u0621 ${quantity} \u0628\u0637\u0627\u0642\u0629 ${paymentMethod === "diamonds" ? `\u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 ${diamondsSpent} \u0645\u0627\u0633\u0629` : `\u0645\u0642\u0627\u0628\u0644 ${cashPrice.toLocaleString("ar-EG")} $`}.`, { kind, quantity, diamondsSpent: payment.diamondsSpent, cashSpent: paymentMethod === "cash" ? cashPrice : 0 });
}
function sellProduct(profile, productId, quantity) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const product = PRODUCT_CATALOG.find((item) => item.id === productId);
  if (!product) return failure(profile, "not-found", "\u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C.");
  if (!isPositiveInteger(quantity)) return failure(profile, "invalid-input", "\u0627\u0644\u0643\u0645\u064A\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0639\u062F\u062F\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627 \u0645\u0648\u062C\u0628\u064B\u0627.");
  const lot = profile.inventory.find((item) => item.materialOrProductId === productId);
  if (!lot || lot.quantity < quantity) return failure(profile, "insufficient-materials", "\u0644\u0627 \u062A\u0645\u0644\u0643 \u0647\u0630\u0647 \u0627\u0644\u0643\u0645\u064A\u0629 \u0645\u0646 \u0627\u0644\u0645\u0646\u062A\u062C.");
  const marketQuote = getMarketQuote(profile, productId);
  if (!marketQuote) return failure(profile, "not-found", "\u0644\u0627 \u064A\u0648\u062C\u062F \u0639\u0631\u0636 \u0633\u0648\u0642 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062A\u062C \u0627\u0644\u064A\u0648\u0645.");
  if (quantity > marketQuote.demandUnits) return failure(profile, "market-limit", `\u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u0645\u062A\u0627\u062D \u0627\u0644\u064A\u0648\u0645 ${marketQuote.demandUnits} \u0648\u062D\u062F\u0629 \u0641\u0642\u0637\u061B \u062E\u0641\u0651\u0636 \u0627\u0644\u0643\u0645\u064A\u0629 \u0623\u0648 \u0627\u0646\u062A\u0638\u0631 \u064A\u0648\u0645\u064B\u0627 \u0622\u062E\u0631.`);
  const qualityMultiplier = lot.qualityScore === void 0 ? 1 : 0.85 + lot.qualityScore / 100 * 0.15;
  const grossRevenue = Math.round(quantity * marketQuote.currentPrice * qualityMultiplier);
  const accountant = profile.staff.find((member) => member.status === "active" && member.role === "accountant");
  const taxRate = (findCountry(profile.countryId)?.economy.taxRate ?? 0) * (accountant ? Math.max(0.82, 0.9 - (staffLevel(accountant) - 1) * 0.02) : 1);
  const tax = Math.round(grossRevenue * taxRate);
  const costOfGoods = Math.round(lot.unitCost * quantity);
  const nextInventory = profile.inventory.map((item) => item.materialOrProductId === productId ? { ...item, quantity: item.quantity - quantity } : item).filter((item) => item.quantity > 0);
  const sale = { id: nextId(profile, "sale", profile.sales.length), productId, quantity, unitPrice: marketQuote.currentPrice, grossRevenue, tax, costOfGoods, soldOnDay: profile.day, soldAt: timestampFor(profile) };
  const nextProfile = addLedger(
    { ...profile, inventory: nextInventory, sales: [...profile.sales, sale] },
    [
      ledgerEntry(profile, "revenue", grossRevenue, `\u0628\u064A\u0639 ${quantity} \u0645\u0646 ${product.name}`, 0),
      ledgerEntry(profile, "expense", tax, "\u0636\u0631\u064A\u0628\u0629 \u0645\u0628\u064A\u0639\u0627\u062A \u0645\u062D\u0627\u0643\u0627\u0629", 1),
      ledgerEntry(profile, "expense", costOfGoods, `\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0627\u0644\u0645\u0628\u0627\u0639\u0629: ${product.name}`, 2)
    ],
    profile.bankBalance + grossRevenue - tax
  );
  return success(syncTasks(nextProfile), `\u062A\u0645 \u0628\u064A\u0639 ${quantity} \u0645\u0646 ${product.name} \u0628\u0633\u0639\u0631 \u0633\u0648\u0642 ${marketQuote.currentPrice.toLocaleString("ar-EG")} $ \u0644\u0644\u0648\u062D\u062F\u0629 \u0628\u0639\u062F \u0627\u062D\u062A\u0633\u0627\u0628 \u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u0648\u0627\u0644\u062A\u0643\u0644\u0641\u0629.`, { productId, quantity, grossRevenue, tax, costOfGoods, netRevenue: grossRevenue - tax - costOfGoods });
}
var GOLD_SELL_SPREAD_RATE = 0.03;
function isPositiveTenth(value) {
  return Number.isFinite(value) && value > 0 && Math.abs(value * 10 - Math.round(value * 10)) < 1e-8;
}
function buyGold(profile, grams) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveTenth(grams)) return failure(profile, "invalid-input", "\u0623\u062F\u062E\u0644 \u0643\u0645\u064A\u0629 \u0630\u0647\u0628 \u0645\u0648\u062C\u0628\u0629 \u0628\u062E\u0637\u0648\u0629 0.1 \u063A\u0631\u0627\u0645.");
  const amount = Math.round(grams * GOLD_PRICE_PER_GRAM);
  if (profile.bankBalance < amount) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0631\u0635\u064A\u062F \u0627\u0644\u0628\u0646\u0643 \u0644\u0634\u0631\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0643\u0645\u064A\u0629 \u0645\u0646 \u0627\u0644\u0630\u0647\u0628.");
  const nextProfile = addLedger(
    profile,
    [ledgerEntry(profile, "asset", amount, `\u0634\u0631\u0627\u0621 ${grams.toFixed(1)} \u063A\u0631\u0627\u0645 \u0630\u0647\u0628 \u0628\u0633\u0639\u0631 \u0645\u062D\u0627\u0643\u0627\u0629`, 0)],
    profile.bankBalance - amount,
    { goldGrams: Math.round((profile.goldGrams + grams) * 10) / 10, goldCostBasis: profile.goldCostBasis + amount }
  );
  return success(nextProfile, `\u0627\u0634\u062A\u0631\u064A\u062A ${grams.toFixed(1)} \u063A\u0631\u0627\u0645 \u0630\u0647\u0628 \u0628\u0633\u0639\u0631 \u0645\u062D\u0627\u0643\u0627\u0629 ${GOLD_PRICE_PER_GRAM} $ \u0644\u0644\u063A\u0631\u0627\u0645.`, { grams, cashAmount: amount, pricePerGram: GOLD_PRICE_PER_GRAM });
}
var DIAMONDS_PER_GOLD_GRAM = 0.5;
function buyGoldWithDiamonds(profile, grams) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveTenth(grams)) return failure(profile, "invalid-input", "\u0623\u062F\u062E\u0644 \u0643\u0645\u064A\u0629 \u0630\u0647\u0628 \u0645\u0648\u062C\u0628\u0629 \u0628\u062E\u0637\u0648\u0629 0.1 \u063A\u0631\u0627\u0645.");
  const diamonds = grams * DIAMONDS_PER_GOLD_GRAM;
  if (!Number.isInteger(diamonds)) return failure(profile, "invalid-input", "\u0634\u0631\u0627\u0621 \u0627\u0644\u0630\u0647\u0628 \u0628\u0627\u0644\u0645\u0627\u0633 \u0645\u062A\u0627\u062D \u0628\u0632\u064A\u0627\u062F\u0629 2 \u063A\u0631\u0627\u0645 \u0644\u0643\u0644 \u0645\u0627\u0633\u0629 \u0643\u0627\u0645\u0644\u0629.");
  if (profile.diamonds < diamonds) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0631\u0635\u064A\u062F \u0627\u0644\u0645\u0627\u0633 \u0644\u0634\u0631\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0643\u0645\u064A\u0629 \u0645\u0646 \u0627\u0644\u0630\u0647\u0628.");
  const goldCost = Math.round(grams * GOLD_PRICE_PER_GRAM);
  const nextProfile = addLedger(
    profile,
    [ledgerEntry(profile, "asset", goldCost, `\u0634\u0631\u0627\u0621 ${grams.toFixed(1)} \u063A\u0631\u0627\u0645 \u0630\u0647\u0628 \u0645\u0642\u0627\u0628\u0644 ${diamonds} \u0645\u0627\u0633\u0629`, 0)],
    profile.bankBalance,
    {
      diamonds: profile.diamonds - diamonds,
      goldGrams: Math.round((profile.goldGrams + grams) * 10) / 10,
      goldCostBasis: profile.goldCostBasis + goldCost
    }
  );
  return success(nextProfile, `\u062A\u0645 \u0634\u0631\u0627\u0621 ${grams.toFixed(1)} \u063A\u0631\u0627\u0645 \u0630\u0647\u0628 \u0645\u0642\u0627\u0628\u0644 ${diamonds} \u0645\u0627\u0633\u0629.`, { grams, cashAmount: diamonds, pricePerGram: DIAMONDS_PER_GOLD_GRAM });
}
function sellGold(profile, grams) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  if (!isPositiveTenth(grams)) return failure(profile, "invalid-input", "\u0623\u062F\u062E\u0644 \u0643\u0645\u064A\u0629 \u0630\u0647\u0628 \u0645\u0648\u062C\u0628\u0629 \u0628\u062E\u0637\u0648\u0629 0.1 \u063A\u0631\u0627\u0645.");
  if (grams > profile.goldGrams) return failure(profile, "insufficient-materials", "\u0644\u0627 \u062A\u0645\u0644\u0643 \u0647\u0630\u0647 \u0627\u0644\u0643\u0645\u064A\u0629 \u0645\u0646 \u0627\u0644\u0630\u0647\u0628.");
  const proceeds = Math.round(grams * GOLD_PRICE_PER_GRAM * (1 - GOLD_SELL_SPREAD_RATE));
  const bookValue = grams === profile.goldGrams ? profile.goldCostBasis : Math.round(profile.goldCostBasis * grams / profile.goldGrams);
  const realizedDifference = proceeds - bookValue;
  const entries = [ledgerEntry(profile, "asset", bookValue, `\u0627\u0633\u062A\u0628\u0639\u0627\u062F \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u062F\u0641\u062A\u0631\u064A\u0629 \u0644\u0640 ${grams.toFixed(1)} \u063A\u0631\u0627\u0645 \u0630\u0647\u0628 \u0645\u0628\u0627\u0639`, 0)];
  if (realizedDifference > 0) entries.push(ledgerEntry(profile, "revenue", realizedDifference, "\u0631\u0628\u062D \u0645\u062D\u0627\u0643\u0627\u0629 \u0645\u0646 \u0628\u064A\u0639 \u0627\u0644\u0630\u0647\u0628", entries.length));
  if (realizedDifference < 0) entries.push(ledgerEntry(profile, "expense", Math.abs(realizedDifference), "\u0641\u0627\u0631\u0642 \u062A\u062F\u0627\u0648\u0644 \u0627\u0644\u0630\u0647\u0628 \u062F\u0627\u062E\u0644 \u0627\u0644\u0644\u0639\u0628\u0629", entries.length));
  const nextProfile = addLedger(
    profile,
    entries,
    profile.bankBalance + proceeds,
    {
      goldGrams: Math.round((profile.goldGrams - grams) * 10) / 10,
      goldCostBasis: Math.max(0, profile.goldCostBasis - bookValue)
    }
  );
  return success(nextProfile, `\u0628\u0639\u062A ${grams.toFixed(1)} \u063A\u0631\u0627\u0645 \u0630\u0647\u0628 \u0628\u0633\u0639\u0631 \u0645\u062D\u0627\u0643\u0627\u0629 \u0628\u0639\u062F \u0641\u0627\u0631\u0642 \u062A\u062F\u0627\u0648\u0644 3%.`, { grams, cashAmount: proceeds, pricePerGram: GOLD_PRICE_PER_GRAM });
}
function getDayBriefing(profile) {
  const day = profile.day + 1;
  const multiplier = findCountry(profile.countryId)?.economy.operatingCostMultiplier ?? 1;
  const operatingCost = profile.companies.reduce((sum, company) => {
    const manager = profile.staff.find((member) => member.status === "active" && member.role === "manager" && member.companyId === company.id);
    const managerDiscount = manager ? Math.min(0.18, 0.08 + (staffLevel(manager) - 1) * 0.025) : 0;
    return sum + (company.operatingCostPerDay ?? 0) * (1 - managerDiscount);
  }, 0) * multiplier * getOperatingCostProgression(profile.day) * getSynergyOperatingMultiplier(profile);
  const maturingInvestments = profile.investments.filter((investment) => investment.status === "active" && investment.maturityDay <= day).map((investment) => ({ id: investment.id, name: findInvestment(investment.investmentTypeId)?.name ?? investment.investmentTypeId }));
  const event = getEconomicEventTemplate(day, profile.countryId);
  const availableEnergy = profile.companies.reduce((sum, company) => sum + (company.energyUnits ?? 0), 0);
  const outstandingSalary = unpaidSalaryTotal(profile);
  return { day, operatingCost, existingPayables: profile.payables + outstandingSalary, maturingInvestments, event, availableEnergy, energyPaused: profile.payables > 0 || outstandingSalary > 0 };
}
var STAFF_ROLE_OPTIONS = {
  manager: { label: "\u0645\u062F\u064A\u0631 \u0634\u0631\u0643\u0629", dailySalary: 7e3, companyRequired: true },
  accountant: { label: "\u0645\u062D\u0627\u0633\u0628", dailySalary: 4500, companyRequired: false },
  lawyer: { label: "\u0645\u062D\u0627\u0645\u064D", dailySalary: 4e3, companyRequired: false },
  hr: { label: "\u0645\u062F\u064A\u0631 \u0645\u0648\u0627\u0631\u062F \u0628\u0634\u0631\u064A\u0629", dailySalary: 3500, companyRequired: false }
};
var MAX_STAFF_LEVEL = 5;
var STAFF_EXPERIENCE_PER_LEVEL = 100;
function staffLevel(employee) {
  return Math.max(1, Math.min(MAX_STAFF_LEVEL, Math.floor(employee?.level ?? 1)));
}
function staffExperience(employee) {
  return Math.max(0, Math.min(STAFF_EXPERIENCE_PER_LEVEL - 1, Math.floor(employee?.experience ?? 0)));
}
function getStaffUpgradeCost(employee) {
  return Math.round(employee.dailySalary * (2 + staffLevel(employee)));
}
function developStaff(employee) {
  let level = staffLevel(employee);
  let experience = staffExperience(employee) + (employee.role === "manager" ? 12 : 10);
  while (level < MAX_STAFF_LEVEL && experience >= STAFF_EXPERIENCE_PER_LEVEL) {
    experience -= STAFF_EXPERIENCE_PER_LEVEL;
    level += 1;
  }
  return { ...employee, level, experience };
}
function hireStaff(profile, role, name, companyId) {
  const option = STAFF_ROLE_OPTIONS[role];
  if (!option || name.trim().length < 2) return failure(profile, "invalid-input", "\u0623\u062F\u062E\u0644 \u0627\u0633\u0645\u064B\u0627 \u0635\u062D\u064A\u062D\u064B\u0627 \u0648\u0627\u062E\u062A\u0631 \u062F\u0648\u0631\u064B\u0627 \u0645\u0639\u0631\u0648\u0641\u064B\u0627.");
  if (option.companyRequired && !profile.companies.some((company) => company.id === companyId)) return failure(profile, "not-found", "\u0627\u0644\u0645\u062F\u064A\u0631 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0631\u062A\u0628\u0637 \u0628\u0634\u0631\u0643\u0629 \u0645\u0648\u062C\u0648\u062F\u0629.");
  if (role === "manager" && profile.staff.some((member) => member.status === "active" && member.role === "manager" && member.companyId === companyId)) return failure(profile, "invalid-input", "\u0647\u0630\u0647 \u0627\u0644\u0634\u0631\u0643\u0629 \u0644\u062F\u064A\u0647\u0627 \u0645\u062F\u064A\u0631 \u0646\u0634\u0637 \u0628\u0627\u0644\u0641\u0639\u0644.");
  const hr = profile.staff.find((member) => member.status === "active" && member.role === "hr");
  const contractCost = Math.round(option.dailySalary * (hr ? Math.max(0.68, 0.8 - (staffLevel(hr) - 1) * 0.03) : 1));
  if (profile.bankBalance < contractCost) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0627\u0644\u0631\u0635\u064A\u062F \u0644\u062A\u0648\u0642\u064A\u0639 \u0639\u0642\u062F \u0627\u0644\u0645\u0648\u0638\u0641 \u0648\u062F\u0641\u0639 \u064A\u0648\u0645 \u0627\u0644\u062A\u0639\u0627\u0642\u062F.");
  const staff = { id: nextId(profile, "staff", profile.staff.length), role, name: name.trim(), companyId, dailySalary: option.dailySalary, level: 1, experience: 0, hiredOnDay: profile.day, nextPayDay: profile.day + 1, status: "active" };
  const nextProfile = addLedger(
    { ...profile, staff: [...profile.staff, staff] },
    [ledgerEntry(profile, "expense", contractCost, `\u062A\u0648\u0642\u064A\u0639 \u0639\u0642\u062F ${option.label}: ${staff.name}`, 0)],
    profile.bankBalance - contractCost
  );
  return success(nextProfile, `\u062A\u0645 \u062A\u0639\u064A\u064A\u0646 ${staff.name} \u0628\u0648\u0638\u064A\u0641\u0629 ${option.label}\u061B \u0623\u0648\u0644 \u0631\u0627\u062A\u0628 \u062F\u0648\u0631\u064A \u0641\u064A \u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u062A\u0627\u0644\u064A.`, staff);
}
function upgradeStaff(profile, staffId) {
  const employee = profile.staff.find((member) => member.id === staffId && member.status === "active");
  if (!employee) return failure(profile, "not-found", "\u0639\u0642\u062F \u0627\u0644\u0645\u0648\u0638\u0641 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u063A\u064A\u0631 \u0646\u0634\u0637.");
  const level = staffLevel(employee);
  if (level >= MAX_STAFF_LEVEL) return failure(profile, "condition-not-met", "\u0648\u0635\u0644 \u0627\u0644\u0645\u0648\u0638\u0641 \u0625\u0644\u0649 \u0623\u0639\u0644\u0649 \u0645\u0633\u062A\u0648\u0649 \u0645\u062A\u0627\u062D.");
  const cost = getStaffUpgradeCost(employee);
  if (profile.bankBalance < cost) return failure(profile, "insufficient-funds", `\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 ${cost.toLocaleString("ar-EG")} $ \u0644\u062A\u0631\u0642\u064A\u0629 ${employee.name}.`);
  const updated = { ...employee, level: level + 1, experience: staffExperience(employee) };
  const nextProfile = addLedger(
    { ...profile, staff: profile.staff.map((member) => member.id === staffId ? updated : member) },
    [ledgerEntry(profile, "expense", cost, `\u062A\u0631\u0642\u064A\u0629 \u0627\u0644\u0645\u0648\u0638\u0641 ${employee.name} \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${level + 1}`, 0)],
    profile.bankBalance - cost
  );
  return success(nextProfile, `\u062A\u0645\u062A \u062A\u0631\u0642\u064A\u0629 ${employee.name} \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 ${level + 1}.`, updated);
}
function payStaffSalary(profile, staffId) {
  const employee = profile.staff.find((member) => member.id === staffId && member.status === "active");
  if (!employee) return failure(profile, "not-found", "\u0639\u0642\u062F \u0627\u0644\u0645\u0648\u0638\u0641 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u063A\u064A\u0631 \u0646\u0634\u0637.");
  const amount = employee.unpaidSalary ?? 0;
  if (amount <= 0) return failure(profile, "condition-not-met", "\u0644\u0627 \u064A\u0648\u062C\u062F \u0631\u0627\u062A\u0628 \u0645\u0633\u062A\u062D\u0642 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0638\u0641 \u062D\u0627\u0644\u064A\u064B\u0627.");
  if (profile.bankBalance < amount) return failure(profile, "insufficient-funds", `\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 ${amount.toLocaleString("ar-EG")} $ \u0644\u062F\u0641\u0639 \u0631\u0627\u062A\u0628 ${employee.name}.`);
  const nextProfile = addLedger(
    { ...profile, staff: profile.staff.map((member) => member.id === staffId ? { ...member, unpaidSalary: 0, nextPayDay: profile.day + 1 } : member) },
    [ledgerEntry(profile, "settlement", amount, `\u0633\u062F\u0627\u062F \u0631\u0627\u062A\u0628 \u0645\u0633\u062A\u062D\u0642: ${employee.name}`, 0)],
    profile.bankBalance - amount
  );
  return success(nextProfile, `\u062A\u0645 \u062F\u0641\u0639 ${amount.toLocaleString("ar-EG")} $ \u0644\u0644\u0645\u0648\u0638\u0641 ${employee.name}.`, { staffId, amount });
}
function terminateStaff(profile, staffId) {
  const employee = profile.staff.find((member) => member.id === staffId && member.status === "active");
  if (!employee) return failure(profile, "not-found", "\u0639\u0642\u062F \u0627\u0644\u0645\u0648\u0638\u0641 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u062A\u0645 \u0625\u0646\u0647\u0627\u0624\u0647.");
  const updated = { ...employee, status: "terminated" };
  return success({ ...profile, staff: profile.staff.map((member) => member.id === staffId ? updated : member) }, `\u062A\u0645 \u0625\u0646\u0647\u0627\u0621 \u0639\u0642\u062F ${employee.name}.`, updated);
}
var DEPOSIT_OPTIONS = [
  { durationDays: 3, annualRate: 0.05 },
  { durationDays: 7, annualRate: 0.08 },
  { durationDays: 14, annualRate: 0.12 }
];
function createDeposit(profile, amount, durationDays) {
  const option = DEPOSIT_OPTIONS.find((item) => item.durationDays === durationDays);
  if (!option) return failure(profile, "invalid-input", "\u0645\u062F\u0629 \u0627\u0644\u0648\u062F\u064A\u0639\u0629 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629. \u0627\u062E\u062A\u0631 3 \u0623\u0648 7 \u0623\u0648 14 \u064A\u0648\u0645\u064B\u0627.");
  if (profile.banking.deposits.filter((deposit2) => deposit2.status === "active").length >= 5) return failure(profile, "condition-not-met", "\u0648\u0635\u0644\u062A \u0625\u0644\u0649 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649: 5 \u0648\u062F\u0627\u0626\u0639 \u0646\u0634\u0637\u0629. \u0627\u062F\u0645\u062C \u0627\u0644\u0648\u062F\u0627\u0626\u0639 \u0623\u0648 \u0627\u0633\u062A\u0631\u062F \u0648\u062F\u064A\u0639\u0629 \u0645\u0633\u062A\u062D\u0642\u0629 \u0623\u0648\u0644\u064B\u0627.");
  if (!Number.isInteger(amount) || amount < 5e4) return failure(profile, "invalid-input", "\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 \u0644\u0644\u0648\u062F\u064A\u0639\u0629 50,000 \u062C\u0646\u064A\u0647 \u0645\u062D\u0627\u0643\u0627\u0629.");
  if (amount > profile.bankBalance) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0627\u0644\u0631\u0635\u064A\u062F \u0644\u0625\u0646\u0634\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0648\u062F\u064A\u0639\u0629.");
  const deposit = { id: nextId(profile, "deposit", profile.banking.deposits.length), principal: amount, annualRate: option.annualRate, startedOnDay: profile.day, maturityDay: profile.day + durationDays, status: "active" };
  const nextProfile = addLedger(
    { ...profile, banking: { ...profile.banking, deposits: [...profile.banking.deposits, deposit] } },
    [ledgerEntry(profile, "asset", amount, `\u0625\u064A\u062F\u0627\u0639 \u0648\u062F\u064A\u0639\u0629 \u0644\u0645\u062F\u0629 ${durationDays} \u0623\u064A\u0627\u0645`, 0)],
    profile.bankBalance - amount
  );
  return success(nextProfile, `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0648\u062F\u064A\u0639\u0629 \u0645\u062D\u0627\u0643\u0627\u0629 \u062A\u0633\u062A\u062D\u0642 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${deposit.maturityDay}.`, deposit);
}
function activeDepositTranches(deposit) {
  if (deposit.tranches) return deposit.tranches.filter((tranche) => tranche.status === "active");
  return deposit.status === "active" ? [{ id: deposit.id, principal: deposit.principal, annualRate: deposit.annualRate, startedOnDay: deposit.startedOnDay, maturityDay: deposit.maturityDay, status: "active" }] : [];
}
function getDepositExpectedInterest(deposit) {
  return activeDepositTranches(deposit).reduce((sum, tranche) => sum + Math.round(tranche.principal * tranche.annualRate * (tranche.maturityDay - tranche.startedOnDay) / 30), 0);
}
function hasMaturedDepositTranche(deposit, day) {
  return activeDepositTranches(deposit).some((tranche) => day >= tranche.maturityDay);
}
function getDepositMaturityRange(deposit) {
  const tranches = activeDepositTranches(deposit);
  if (tranches.length === 0) return { firstDay: deposit.maturityDay, lastDay: deposit.maturityDay };
  return { firstDay: Math.min(...tranches.map((tranche) => tranche.maturityDay)), lastDay: Math.max(...tranches.map((tranche) => tranche.maturityDay)) };
}
function mergeDeposits(profile, depositIds) {
  if (!Array.isArray(depositIds) || depositIds.some((id) => typeof id !== "string")) return failure(profile, "invalid-input", "\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0648\u062F\u0627\u0626\u0639 \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629.");
  const ids = [...new Set(depositIds)];
  if (ids.length < 2) return failure(profile, "invalid-input", "\u0627\u062E\u062A\u0631 \u0648\u062F\u064A\u0639\u062A\u064A\u0646 \u0646\u0634\u0637\u062A\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0644\u062F\u0645\u062C\u0647\u0645\u0627.");
  const deposits = ids.map((id) => profile.banking.deposits.find((deposit2) => deposit2.id === id));
  if (deposits.some((deposit2) => !deposit2 || deposit2.status !== "active")) return failure(profile, "not-found", "\u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u062E\u062A\u064A\u0627\u0631 \u0648\u062F\u0627\u0626\u0639 \u0646\u0634\u0637\u0629 \u0645\u0648\u062C\u0648\u062F\u0629.");
  const selected = deposits;
  const tranches = selected.flatMap(activeDepositTranches);
  if (tranches.length < 2) return failure(profile, "invalid-input", "\u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u062C\u0632\u0627\u0621 \u0646\u0634\u0637\u0629 \u0643\u0627\u0641\u064A\u0629 \u0644\u062F\u0645\u062C\u0647\u0627.");
  const principal = tranches.reduce((sum, tranche) => sum + tranche.principal, 0);
  const annualRate = principal > 0 ? tranches.reduce((sum, tranche) => sum + tranche.principal * tranche.annualRate, 0) / principal : 0;
  const deposit = {
    id: nextId(profile, "deposit", profile.banking.deposits.length),
    principal,
    annualRate,
    startedOnDay: Math.min(...tranches.map((tranche) => tranche.startedOnDay)),
    maturityDay: Math.max(...tranches.map((tranche) => tranche.maturityDay)),
    status: "active",
    tranches
  };
  const mergedIds = new Set(ids);
  const history = profile.banking.deposits.map((item) => mergedIds.has(item.id) ? { ...item, status: "merged", mergedIntoId: deposit.id } : item);
  const nextProfile = { ...profile, banking: { ...profile.banking, deposits: [...history, deposit] } };
  return success(nextProfile, `\u062A\u0645 \u062F\u0645\u062C ${ids.length} \u0648\u062F\u0627\u0626\u0639 \u0641\u064A \u0648\u062F\u064A\u0639\u0629 \u0648\u0627\u062D\u062F\u0629 \u0645\u0639 \u0627\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u0639\u0627\u0626\u062F \u0648\u0645\u0648\u0639\u062F \u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u0643\u0644 \u062C\u0632\u0621.`, deposit);
}
function withdrawDeposit(profile, depositId) {
  const deposit = profile.banking.deposits.find((item) => item.id === depositId);
  if (!deposit) return failure(profile, "not-found", "\u0627\u0644\u0648\u062F\u064A\u0639\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.");
  if (deposit.status !== "active") return failure(profile, "invalid-input", "\u0647\u0630\u0647 \u0627\u0644\u0648\u062F\u064A\u0639\u0629 \u062A\u0645\u062A \u062A\u0633\u0648\u064A\u062A\u0647\u0627 \u0645\u0646 \u0642\u0628\u0644.");
  const activeTranches = activeDepositTranches(deposit);
  const maturedTranches = activeTranches.filter((tranche) => profile.day >= tranche.maturityDay);
  if (maturedTranches.length === 0) return failure(profile, "deposit-not-mature", `\u062A\u0633\u062A\u062D\u0642 \u0627\u0644\u0648\u062F\u064A\u0639\u0629 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${Math.min(...activeTranches.map((tranche) => tranche.maturityDay))}.`);
  const principal = maturedTranches.reduce((sum, tranche) => sum + tranche.principal, 0);
  const interest = maturedTranches.reduce((sum, tranche) => sum + Math.round(tranche.principal * tranche.annualRate * (tranche.maturityDay - tranche.startedOnDay) / 30), 0);
  const amount = principal + interest;
  let updatedDeposit;
  if (deposit.tranches) {
    const maturedIds = new Set(maturedTranches.map((tranche) => tranche.id));
    const tranches = deposit.tranches.map((tranche) => maturedIds.has(tranche.id) ? { ...tranche, status: "paid", settledAmount: tranche.principal + Math.round(tranche.principal * tranche.annualRate * (tranche.maturityDay - tranche.startedOnDay) / 30) } : tranche);
    const remaining = tranches.filter((tranche) => tranche.status === "active");
    const remainingPrincipal = remaining.reduce((sum, tranche) => sum + tranche.principal, 0);
    const remainingRate = remainingPrincipal > 0 ? remaining.reduce((sum, tranche) => sum + tranche.principal * tranche.annualRate, 0) / remainingPrincipal : deposit.annualRate;
    updatedDeposit = { ...deposit, principal: remainingPrincipal, annualRate: remainingRate, startedOnDay: remaining.length ? Math.min(...remaining.map((tranche) => tranche.startedOnDay)) : deposit.startedOnDay, maturityDay: remaining.length ? Math.max(...remaining.map((tranche) => tranche.maturityDay)) : deposit.maturityDay, status: remaining.length ? "active" : "paid", settledAmount: (deposit.settledAmount ?? 0) + amount, tranches };
  } else {
    updatedDeposit = { ...deposit, status: "paid", settledAmount: amount };
  }
  const nextProfile = addLedger(
    { ...profile, banking: { ...profile.banking, deposits: profile.banking.deposits.map((item) => item.id === depositId ? updatedDeposit : item) } },
    [ledgerEntry(profile, "revenue", interest, `\u0641\u0627\u0626\u062F\u0629 \u0648\u062F\u064A\u0639\u0629 \u0645\u062D\u0627\u0643\u0627\u0629 ${deposit.id}`, 0), ledgerEntry(profile, "settlement", principal, `\u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0623\u0635\u0644 \u0627\u0644\u0648\u062F\u064A\u0639\u0629 ${deposit.id}`, 1)],
    profile.bankBalance + amount
  );
  return success(nextProfile, `\u062A\u0645 \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0627\u0644\u0645\u0633\u062A\u062D\u0642 \u0645\u0646 \u0627\u0644\u0648\u062F\u064A\u0639\u0629 \u0645\u0639 \u0641\u0627\u0626\u062F\u0629 ${interest.toLocaleString("ar-EG")} $.`, { depositId, amount, interest });
}
function collateralValue(profile, collateralType, collateralId) {
  if (collateralType === "land") return profile.lands.find((land) => land.id === collateralId)?.purchasePrice ?? 0;
  const company = profile.companies.find((item) => item.id === collateralId);
  const industry = company ? findIndustry(company.industryId) : void 0;
  const country = company ? findCountry(company.countryId) : void 0;
  return company && industry ? industry.setupFee + (country?.economy.licenseFeesByIndustry[company.industryId] ?? industry.licenseFee) + 1e5 : 0;
}
function takeLoan(profile, collateralType, collateralId, amount, termDays) {
  if (profile.banking.loans.filter((loan2) => loan2.status === "active").length >= 3) return failure(profile, "condition-not-met", "\u0648\u0635\u0644\u062A \u0625\u0644\u0649 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649: 3 \u0642\u0631\u0648\u0636 \u0646\u0634\u0637\u0629. \u0633\u062F\u0651\u062F \u0642\u0631\u0636\u064B\u0627 \u0642\u0627\u0626\u0645\u064B\u0627 \u0623\u0648\u0644\u064B\u0627.");
  const collateralAmount = collateralValue(profile, collateralType, collateralId);
  if (collateralAmount <= 0) return failure(profile, "not-found", "\u0627\u0644\u0636\u0645\u0627\u0646 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u063A\u064A\u0631 \u0645\u0624\u0647\u0644 \u0644\u0644\u062A\u0645\u0648\u064A\u0644.");
  if (profile.banking.loans.some((loan2) => loan2.status === "active" && loan2.collateralType === collateralType && loan2.collateralId === collateralId)) return failure(profile, "collateral-in-use", "\u0647\u0630\u0627 \u0627\u0644\u0636\u0645\u0627\u0646 \u0645\u0631\u062A\u0628\u0637 \u0628\u0642\u0631\u0636 \u0642\u0627\u0626\u0645 \u0628\u0627\u0644\u0641\u0639\u0644.");
  if (![7, 14, 30].includes(termDays)) return failure(profile, "invalid-input", "\u0645\u062F\u0629 \u0627\u0644\u0642\u0631\u0636 \u0627\u0644\u0645\u062A\u0627\u062D\u0629 7 \u0623\u0648 14 \u0623\u0648 30 \u064A\u0648\u0645\u064B\u0627.");
  const maximumLoan = Math.floor(collateralAmount * 0.6);
  if (!Number.isInteger(amount) || amount < 25e3 || amount > maximumLoan) return failure(profile, "invalid-input", `\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u0647\u0630\u0627 \u0627\u0644\u0636\u0645\u0627\u0646 ${maximumLoan.toLocaleString("ar-EG")} $ \u0645\u062D\u0627\u0643\u0627\u0629.`);
  const annualRate = termDays === 7 ? 0.18 : termDays === 14 ? 0.22 : 0.28;
  const totalRepayment = Math.round(amount * (1 + annualRate * termDays / 30));
  const loan = { id: nextId(profile, "loan", profile.banking.loans.length), collateralType, collateralId, principal: amount, totalRepayment, annualRate, startedOnDay: profile.day, termDays, nextPaymentDay: profile.day + 1, installmentAmount: Math.ceil(totalRepayment / termDays), remainingBalance: totalRepayment, status: "active" };
  const nextProfile = addLedger(
    { ...profile, banking: { ...profile.banking, loans: [...profile.banking.loans, loan] } },
    [ledgerEntry(profile, "liability", amount, `\u0635\u0631\u0641 \u0642\u0631\u0636 \u0628\u0636\u0645\u0627\u0646 ${collateralType === "land" ? "\u0623\u0631\u0636" : "\u0634\u0631\u0643\u0629"}`, 0)],
    profile.bankBalance + amount
  );
  return success(nextProfile, `\u062A\u0645 \u0635\u0631\u0641 \u0642\u0631\u0636 \u0645\u062D\u0627\u0643\u0627\u0629 \u0628\u0642\u064A\u0645\u0629 ${amount.toLocaleString("ar-EG")} $\u061B \u064A\u0628\u062F\u0623 \u0627\u0644\u0642\u0633\u0637 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u062A\u0627\u0644\u064A.`, loan);
}
function repayLoan(profile, loanId, installments) {
  const loan = profile.banking.loans.find((item) => item.id === loanId && item.status === "active");
  if (!loan) return failure(profile, "not-found", "\u0627\u0644\u0642\u0631\u0636 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u062A\u0645\u062A \u062A\u0633\u0648\u064A\u062A\u0647 \u0628\u0627\u0644\u0641\u0639\u0644.");
  const count = installments === "all" ? Math.ceil(loan.remainingBalance / loan.installmentAmount) : installments;
  if (!Number.isInteger(count) || count < 1) return failure(profile, "invalid-input", "\u0627\u062E\u062A\u0631 \u0642\u0633\u0637\u064B\u0627 \u0648\u0627\u062D\u062F\u064B\u0627 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.");
  const amount = installments === "all" ? loan.remainingBalance : Math.min(loan.remainingBalance, loan.installmentAmount * count);
  if (profile.bankBalance < amount) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0627\u0644\u0631\u0635\u064A\u062F \u0644\u062A\u0633\u062F\u064A\u062F \u0647\u0630\u0647 \u0627\u0644\u062F\u0641\u0639\u0629.");
  const remainingBalance = Math.max(0, loan.remainingBalance - amount);
  const updatedLoan = { ...loan, remainingBalance, nextPaymentDay: loan.nextPaymentDay + count, status: remainingBalance === 0 ? "paid" : loan.status };
  const nextProfile = addLedger(
    { ...profile, banking: { ...profile.banking, loans: profile.banking.loans.map((item) => item.id === loanId ? updatedLoan : item) } },
    [ledgerEntry(profile, "settlement", amount, `\u0633\u062F\u0627\u062F ${installments === "all" ? "\u0643\u0627\u0645\u0644" : `${count} \u0623\u0642\u0633\u0627\u0637`} \u0645\u0646 \u0627\u0644\u0642\u0631\u0636 ${loanId}`, 0)],
    profile.bankBalance - amount
  );
  return success(nextProfile, remainingBalance === 0 ? "\u062A\u0645 \u0633\u062F\u0627\u062F \u0627\u0644\u0642\u0631\u0636 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0648\u0625\u063A\u0644\u0627\u0642\u0647." : `\u062A\u0645 \u0633\u062F\u0627\u062F ${count} \u0623\u0642\u0633\u0627\u0637 \u062F\u0641\u0639\u0629 \u0648\u0627\u062D\u062F\u0629. \u0627\u0644\u0645\u062A\u0628\u0642\u064A ${remainingBalance.toLocaleString("ar-EG")} $.`, updatedLoan);
}
function createInvestment(profile, investmentId, amount) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const definition = findInvestment(investmentId);
  if (!definition) return failure(profile, "not-found", "\u062E\u064A\u0627\u0631 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F.");
  if (!Number.isInteger(amount) || amount < definition.minimumAmount || amount > definition.maximumAmount) return failure(profile, "invalid-input", "\u0627\u0644\u0645\u0628\u0644\u063A \u062E\u0627\u0631\u062C \u0646\u0637\u0627\u0642 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0627\u0644\u0645\u0633\u0645\u0648\u062D.");
  if (profile.bankBalance < amount) return failure(profile, "insufficient-funds", "\u0644\u0627 \u064A\u0643\u0641\u064A \u0631\u0635\u064A\u062F\u0643 \u0644\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631.");
  const investment = {
    id: nextId(profile, "investment", profile.investments.length),
    investmentTypeId: investmentId,
    principal: amount,
    expectedReturnRate: definition.returnRate,
    startedOnDay: profile.day,
    maturityDay: profile.day + definition.durationDays,
    status: "active"
  };
  const nextProfile = addLedger(
    { ...profile, investments: [...profile.investments, investment] },
    [ledgerEntry(profile, "asset", amount, `\u0625\u0646\u0634\u0627\u0621 \u0627\u0633\u062A\u062B\u0645\u0627\u0631 ${definition.name}`, 0)],
    profile.bankBalance - amount
  );
  return success(syncTasks(nextProfile), `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0648\u064A\u0633\u062A\u062D\u0642 \u0641\u064A \u0627\u0644\u064A\u0648\u0645 ${investment.maturityDay}.`, { investmentId: investment.id, maturityDay: investment.maturityDay, returnRate: definition.returnRate });
}
function advanceDay(profile) {
  const countryError = ensureEgypt(profile);
  if (countryError) return countryError;
  const briefing = getDayBriefing(profile);
  const nextDay = briefing.day;
  const now = timestampFor({ ...profile, day: nextDay });
  const operatingCost = briefing.operatingCost;
  const entries = [];
  let balance = profile.bankBalance;
  let payables = profile.payables;
  const paidPriorPayables = Math.min(balance, payables);
  if (paidPriorPayables > 0) {
    balance -= paidPriorPayables;
    payables -= paidPriorPayables;
    entries.push(ledgerEntry(profile, "settlement", paidPriorPayables, "\u0633\u062F\u0627\u062F \u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A \u0633\u0627\u0628\u0642\u0629", entries.length));
  }
  const loans = profile.banking.loans.map((loan) => {
    if (loan.status !== "active" || loan.nextPaymentDay > nextDay) return loan;
    const due = Math.min(loan.remainingBalance, loan.installmentAmount);
    const paid = Math.min(balance, due);
    balance -= paid;
    const unpaid = due - paid;
    const interestShare = Math.min(due, Math.max(0, loan.totalRepayment - loan.principal) / loan.termDays);
    const principalShare = due - interestShare;
    if (interestShare > 0) entries.push(ledgerEntry(profile, "expense", Math.round(interestShare), `\u0641\u0627\u0626\u062F\u0629 \u0642\u0633\u0637 \u0627\u0644\u0642\u0631\u0636 ${loan.id}`, entries.length));
    if (principalShare > 0 && paid > 0) entries.push(ledgerEntry(profile, "settlement", Math.min(paid, Math.round(principalShare)), `\u0633\u062F\u0627\u062F \u0623\u0635\u0644 \u0642\u0633\u0637 \u0627\u0644\u0642\u0631\u0636 ${loan.id}`, entries.length));
    if (unpaid > 0) {
      payables += unpaid;
      entries.push(ledgerEntry(profile, "liability", unpaid, `\u0642\u0633\u0637 \u0642\u0631\u0636 \u063A\u064A\u0631 \u0645\u0633\u062F\u062F ${loan.id}`, entries.length));
    }
    const remainingBalance = Math.max(0, loan.remainingBalance - due);
    return { ...loan, remainingBalance, nextPaymentDay: nextDay + 1, status: remainingBalance === 0 ? "paid" : "active" };
  });
  const staff = profile.staff.map((employee) => {
    if (employee.status !== "active") return employee;
    const developed = developStaff(employee);
    if (employee.nextPayDay > nextDay) return developed;
    const dueDays = Math.max(1, nextDay - employee.nextPayDay + 1);
    return { ...developed, nextPayDay: nextDay + 1, unpaidSalary: (employee.unpaidSalary ?? 0) + employee.dailySalary * dueDays };
  });
  const salaryAccrued = staff.reduce((sum, employee) => {
    const previous = profile.staff.find((item) => item.id === employee.id);
    return sum + Math.max(0, (employee.unpaidSalary ?? 0) - (previous?.unpaidSalary ?? 0));
  }, 0);
  if (salaryAccrued > 0) {
    entries.push(ledgerEntry(profile, "expense", salaryAccrued, "\u0631\u0648\u0627\u062A\u0628 \u0645\u0633\u062A\u062D\u0642\u0629 \u0639\u0646 \u0627\u0644\u064A\u0648\u0645", entries.length));
    entries.push(ledgerEntry(profile, "liability", salaryAccrued, "\u0627\u0644\u062A\u0632\u0627\u0645 \u0631\u0648\u0627\u062A\u0628 \u063A\u064A\u0631 \u0645\u0633\u062F\u062F", entries.length));
  }
  let inventory = [...profile.inventory];
  const newlyCompletedProductionIds = [];
  const productionOrders = profile.productionOrders.map((order) => {
    if (order.status !== "active" || order.completesOnDay > nextDay) return order;
    newlyCompletedProductionIds.push(order.id);
    const unitCost = order.materialCost / order.outputQuantity;
    const existingLot = inventory.find((lot) => lot.materialOrProductId === order.productId);
    inventory = existingLot ? inventory.map((lot) => lot.materialOrProductId === order.productId ? { ...lot, quantity: lot.quantity + order.outputQuantity, unitCost: (lot.quantity * lot.unitCost + order.outputQuantity * unitCost) / (lot.quantity + order.outputQuantity), qualityScore: ((lot.qualityScore ?? 90) * lot.quantity + order.qualityScore * order.outputQuantity) / (lot.quantity + order.outputQuantity) } : lot) : [...inventory, { id: nextId(profile, "inventory", inventory.length), materialOrProductId: order.productId, quantity: order.outputQuantity, unit: order.outputUnit, unitCost, qualityScore: order.qualityScore }];
    entries.push(ledgerEntry(profile, "asset", order.materialCost, `\u0627\u0643\u062A\u0645\u0644 \u0623\u0645\u0631 \u0625\u0646\u062A\u0627\u062C ${order.productName}`, entries.length));
    return { ...order, status: "completed" };
  });
  const warehouseLevel = normalizeWarehouseLevel(profile.warehouseLevel);
  const warehouseCapacity = getWarehouseCapacity(warehouseLevel);
  const globalShipments = (profile.globalShipments ?? []).map((shipment) => {
    if (shipment.status !== "in-transit" || shipment.direction !== "import" || shipment.arrivesOnDay > nextDay) {
      return shipment;
    }
    const itemLimit = getWarehouseItemCapacity(shipment.itemId, warehouseLevel) ?? (findMaterial(shipment.itemId)?.storageLimit ?? 1e3);
    const existingLot = inventory.find((lot) => lot.materialOrProductId === shipment.itemId);
    const currentMaterialsUsed = getWarehouseUsage(inventory, productionOrders).materials;
    if ((existingLot?.quantity ?? 0) + shipment.quantity > itemLimit || currentMaterialsUsed + shipment.quantity > warehouseCapacity.materials) {
      return { ...shipment, arrivesOnDay: nextDay + 1 };
    }
    const shipmentValue = Math.round(shipment.quantity * shipment.unitCostOrPrice);
    inventory = existingLot ? inventory.map(
      (lot) => lot.materialOrProductId === shipment.itemId ? {
        ...lot,
        quantity: lot.quantity + shipment.quantity,
        unitCost: (lot.quantity * lot.unitCost + shipmentValue) / (lot.quantity + shipment.quantity),
        qualityScore: Math.round(
          ((lot.qualityScore ?? 88) * lot.quantity + shipment.qualityScore * shipment.quantity) / (lot.quantity + shipment.quantity) * 10
        ) / 10
      } : lot
    ) : [
      ...inventory,
      {
        id: nextId(profile, "inventory", inventory.length),
        materialOrProductId: shipment.itemId,
        quantity: shipment.quantity,
        unit: shipment.unit,
        unitCost: shipment.unitCostOrPrice,
        qualityScore: shipment.qualityScore
      }
    ];
    if (shipment.deferredBalanceDue > 0) {
      const paidLC = Math.min(balance, shipment.deferredBalanceDue);
      balance -= paidLC;
      const unpaidLC = shipment.deferredBalanceDue - paidLC;
      if (paidLC > 0) {
        entries.push(ledgerEntry(profile, "asset", paidLC, `\u062A\u0633\u0648\u064A\u0629 \u0627\u0639\u062A\u0645\u0627\u062F \u0645\u0633\u062A\u0646\u062F\u064A \u0644\u0648\u0635\u0648\u0644 \u0634\u062D\u0646\u0629 ${shipment.itemName}`, entries.length));
      }
      if (unpaidLC > 0) {
        payables += unpaidLC;
        entries.push(ledgerEntry(profile, "liability", unpaidLC, `\u0645\u062A\u0628\u0642\u064A \u0627\u0639\u062A\u0645\u0627\u062F \u0645\u0633\u062A\u0646\u062F\u064A \u063A\u064A\u0631 \u0645\u0633\u062F\u062F \u0644\u0634\u062D\u0646\u0629 ${shipment.itemName}`, entries.length));
      }
    }
    return { ...shipment, deferredBalanceDue: 0, status: "delivered" };
  });
  const forwardContracts = (profile.forwardContracts ?? []).map(
    (fw) => fw.status === "active" && fw.expiresOnDay < nextDay ? { ...fw, status: "expired" } : fw
  );
  const paidOperatingCost = Math.min(balance, operatingCost);
  balance -= paidOperatingCost;
  if (operatingCost > 0) entries.push(ledgerEntry(profile, "expense", operatingCost, "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u064A\u0648\u0645\u064A\u0629 \u0627\u0644\u0645\u0633\u062A\u062D\u0642\u0629", entries.length));
  const unpaidOperatingCost = operatingCost - paidOperatingCost;
  if (unpaidOperatingCost > 0) {
    payables += unpaidOperatingCost;
    entries.push(ledgerEntry(profile, "liability", unpaidOperatingCost, "\u0645\u0633\u062A\u062D\u0642\u0627\u062A \u062A\u0634\u063A\u064A\u0644 \u063A\u064A\u0631 \u0645\u0633\u062F\u062F\u0629", entries.length));
  }
  let investmentPayout = 0;
  const investments = profile.investments.map((investment, index) => {
    if (investment.status !== "active" || investment.maturityDay > nextDay) return investment;
    const definition = findInvestment(investment.investmentTypeId);
    const riskRoll = (nextDay * 7919 + (index + 1) * 104729) % 1e4;
    const riskThreshold = Math.round((definition?.riskRate ?? 0) * 1e4);
    const hadLoss = Boolean(definition && riskThreshold > 0 && riskRoll < riskThreshold);
    const payoutRate = getInvestmentPayoutRate(investment.expectedReturnRate, definition?.durationDays ?? 1);
    const payout = Math.round(investment.principal * (hadLoss ? 1 - (definition?.riskRate ?? 0) : 1 + payoutRate));
    investmentPayout += payout;
    balance += payout;
    const difference = payout - investment.principal;
    if (difference > 0) entries.push(ledgerEntry(profile, "revenue", difference, `\u062A\u0633\u0648\u064A\u0629 \u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0631\u0627\u0628\u062D ${investment.id}`, entries.length));
    if (difference < 0) entries.push(ledgerEntry(profile, "expense", Math.abs(difference), `\u062E\u0633\u0627\u0631\u0629 \u0645\u062D\u0627\u0643\u0627\u0629 \u0641\u064A \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 ${investment.id}`, entries.length));
    return { ...investment, status: hadLoss ? "loss" : "paid", settledAmount: payout };
  });
  const ownsEventIndustry = !briefing.event.industryId || profile.companies.some((company) => company.industryId === briefing.event.industryId);
  let eventImpact = ownsEventIndustry ? briefing.event.cashImpact : 0;
  if (ownsEventIndustry && briefing.event.cashImpact > 0) {
    balance += briefing.event.cashImpact;
    entries.push(ledgerEntry(profile, "revenue", briefing.event.cashImpact, briefing.event.title, entries.length));
  } else if (ownsEventIndustry && briefing.event.cashImpact < 0) {
    const lawyer = profile.staff.find((member) => member.status === "active" && member.role === "lawyer");
    const eventCost = Math.round(Math.abs(briefing.event.cashImpact) * (lawyer ? Math.max(0.73, 0.85 - (staffLevel(lawyer) - 1) * 0.03) : 1));
    const paidEventCost = Math.min(balance, eventCost);
    balance -= paidEventCost;
    eventImpact = -paidEventCost;
    entries.push(ledgerEntry(profile, "expense", eventCost, briefing.event.title, entries.length));
    if (paidEventCost < eventCost) {
      const unpaidEventCost = eventCost - paidEventCost;
      payables += unpaidEventCost;
      entries.push(ledgerEntry(profile, "liability", unpaidEventCost, "\u0627\u0644\u062A\u0632\u0627\u0645 \u062D\u062F\u062B \u0627\u0642\u062A\u0635\u0627\u062F\u064A \u063A\u064A\u0631 \u0645\u0633\u062F\u062F", entries.length));
    }
  }
  const paidAtClose = Math.min(balance, payables);
  if (paidAtClose > 0) {
    balance -= paidAtClose;
    payables -= paidAtClose;
    entries.push(ledgerEntry(profile, "settlement", paidAtClose, "\u0633\u062F\u0627\u062F \u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A \u0645\u0646 \u0633\u064A\u0648\u0644\u0629 \u0627\u0644\u064A\u0648\u0645", entries.length));
  }
  const outstandingSalary = unpaidSalaryTotal({ ...profile, staff });
  const energyPaused = payables > 0 || outstandingSalary > 0;
  const companies = profile.companies.map((company) => {
    const industry = findIndustry(company.industryId);
    const capacity = company.energyCapacity ?? industry?.energyCapacity ?? 0;
    const supply = industry?.dailyEnergySupply ?? capacity;
    return { ...company, energyUnits: energyPaused ? 0 : Math.min(capacity, (company.energyUnits ?? 0) + supply) };
  });
  const expiredContracts = (profile.contracts ?? []).filter((contract) => contract.status === "active" && contract.deadlineDay < nextDay);
  const contracts = (profile.contracts ?? []).map((contract) => contract.status === "active" && contract.deadlineDay < nextDay ? { ...contract, status: "failed", failedOnDay: nextDay } : contract);
  const reputation = Math.max(0, Math.min(100, (profile.reputation ?? 50) - expiredContracts.length * 6));
  if (expiredContracts.length > 0) entries.push(ledgerEntry(profile, "expense", expiredContracts.length * 2e3, "\u063A\u0631\u0627\u0645\u0627\u062A \u0639\u0642\u0648\u062F \u0645\u062A\u0623\u062E\u0631\u0629", entries.length));
  const event = {
    id: `event-${nextDay}`,
    day: nextDay,
    title: expiredContracts.length > 0 ? `${briefing.event.title} \xB7 \u062A\u0623\u062E\u0631 \u0639\u0642\u062F` : briefing.event.title,
    description: briefing.event.description,
    cashImpact: eventImpact,
    ...briefing.event.industryId ? { industryId: briefing.event.industryId } : {},
    ...briefing.event.materialId ? { materialId: briefing.event.materialId } : {},
    ...briefing.event.productId ? { productId: briefing.event.productId } : {},
    ...briefing.event.materialPriceMultiplier !== void 0 ? { materialPriceMultiplier: briefing.event.materialPriceMultiplier } : {},
    ...briefing.event.demandMultiplier !== void 0 ? { demandMultiplier: briefing.event.demandMultiplier } : {},
    ...briefing.event.durationDays ? { effectExpiresOnDay: nextDay + briefing.event.durationDays - 1 } : {},
    occurredAt: now
  };
  const nextProfile = addLedger(
    {
      ...profile,
      day: nextDay,
      activeDaySpeedMultiplier: 1,
      companies,
      investments,
      banking: { ...profile.banking, loans },
      staff,
      productionOrders,
      inventory,
      unreadProductionOrderIds: [.../* @__PURE__ */ new Set([...profile.unreadProductionOrderIds ?? [], ...newlyCompletedProductionIds])].slice(-500),
      events: [...profile.events, event],
      payables,
      contracts,
      reputation,
      ...profile.globalShipments !== void 0 ? { globalShipments } : {},
      ...profile.forwardContracts !== void 0 ? { forwardContracts } : {}
    },
    entries,
    balance
  );
  const totalOutstanding = payables + outstandingSalary;
  const message = totalOutstanding > 0 ? `\u0645\u0631\u0651 \u0627\u0644\u064A\u0648\u0645 ${nextDay}\u060C \u0644\u0643\u0646 \u0628\u0642\u064A\u062A \u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A \u0648\u0631\u0648\u0627\u062A\u0628 \u063A\u064A\u0631 \u0645\u0633\u062F\u062F\u0629 \u0628\u0642\u064A\u0645\u0629 ${Math.round(totalOutstanding).toLocaleString("ar-EG")} $\u061B \u0623\u064F\u0648\u0642\u0641\u062A \u0627\u0644\u0637\u0627\u0642\u0629 \u0645\u0624\u0642\u062A\u064B\u0627 \u062D\u062A\u0649 \u0627\u0644\u0633\u062F\u0627\u062F.` : `\u0645\u0631\u0651 \u0627\u0644\u064A\u0648\u0645 ${nextDay} \u0648\u0639\u0648\u0644\u062C\u062A \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0648\u0627\u0644\u0623\u062D\u062F\u0627\u062B \u0648\u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631\u0627\u062A.`;
  return success(syncTasks(nextProfile), message, { day: nextDay, operatingCost, paidOperatingCost, payables, investmentPayout, event });
}
function awardAchievements(profile) {
  const current = profile.achievements ?? [];
  const rules = [
    { id: "first-contract", title: "\u0623\u0648\u0644 \u0635\u0641\u0642\u0629 \u0645\u0648\u062B\u0648\u0642\u0629", earned: (item) => item.contracts.some((contract) => contract.status === "completed") },
    { id: "trusted-partner", title: "\u0634\u0631\u064A\u0643 \u0645\u0648\u062B\u0648\u0642", earned: (item) => item.reputation >= 75 },
    { id: "contract-master", title: "\u0633\u064A\u062F \u0627\u0644\u0639\u0642\u0648\u062F", earned: (item) => item.contracts.filter((contract) => contract.status === "completed").length >= 5 },
    { id: "industrialist", title: "\u0635\u0646\u0627\u0639\u064A \u0635\u0627\u0639\u062F", earned: (item) => item.companies.length >= 3 }
  ];
  const additions = rules.filter((rule) => rule.earned(profile) && !current.some((achievement) => achievement.id === rule.id)).map((rule) => ({ id: rule.id, title: rule.title, earnedAtDay: profile.day }));
  return { achievements: [...current, ...additions], bonus: additions.length * 1e4 };
}
function acceptContract(profile, offerId) {
  const offer = getContractOffers(profile).find((item) => item.id === offerId);
  if (!offer) return failure(profile, "not-found", "\u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0647\u0630\u0627 \u0627\u0644\u0639\u0642\u062F\u061B \u0627\u0641\u062A\u062D \u0644\u0648\u062D\u0629 \u0627\u0644\u0639\u0642\u0648\u062F \u0644\u0631\u0624\u064A\u0629 \u0639\u0631\u0648\u0636 \u0627\u0644\u064A\u0648\u0645.");
  const previousContract = (profile.contracts ?? []).find((contract2) => contract2.id === offerId);
  if (previousContract?.status === "active") return failure(profile, "already-owned", "\u0647\u0630\u0627 \u0627\u0644\u0639\u0642\u062F \u0645\u0642\u0628\u0648\u0644 \u0628\u0627\u0644\u0641\u0639\u0644.");
  if (previousContract?.status === "completed") return failure(profile, "already-owned", "\u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636 \u0645\u0646 \u0642\u0628\u0644 \u0648\u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u0643\u0631\u0627\u0631\u0647.");
  if (previousContract?.status === "failed") return failure(profile, "already-owned", "\u0627\u0646\u062A\u0647\u0649 \u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636 \u0628\u0639\u062F \u0641\u0634\u0644\u0647 \u0648\u0644\u0627 \u064A\u0645\u0643\u0646 \u0625\u0639\u0627\u062F\u0629 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647.");
  if ((profile.contracts ?? []).filter((contract2) => contract2.status === "active").length >= 3) return failure(profile, "condition-not-met", "\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u0625\u062F\u0627\u0631\u0629 \u0623\u0643\u062B\u0631 \u0645\u0646 \u062B\u0644\u0627\u062B\u0629 \u0639\u0642\u0648\u062F \u0646\u0634\u0637\u0629 \u0641\u064A \u0648\u0642\u062A \u0648\u0627\u062D\u062F.");
  const { description: _offerDescription, ...contractOffer } = offer;
  const contract = { ...contractOffer, status: "active", acceptedOnDay: profile.day };
  return success({ ...profile, contracts: [...profile.contracts ?? [], contract] }, `\u062A\u0645 \u0642\u0628\u0648\u0644 \u0639\u0642\u062F ${contract.clientName} \u062D\u062A\u0649 \u0627\u0644\u064A\u0648\u0645 ${contract.deadlineDay}.`, contract);
}
function deliverContract(profile, contractId) {
  const contract = (profile.contracts ?? []).find((item) => item.id === contractId && item.status === "active");
  if (!contract) return failure(profile, "not-found", "\u0627\u0644\u0639\u0642\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u062A\u0645\u062A \u062A\u0633\u0648\u064A\u062A\u0647.");
  if (profile.day > contract.deadlineDay) return failure(profile, "condition-not-met", "\u0627\u0646\u062A\u0647\u062A \u0645\u0647\u0644\u0629 \u0627\u0644\u0639\u0642\u062F\u061B \u0627\u0646\u062A\u0638\u0631 \u062A\u0631\u062D\u064A\u0644 \u0627\u0644\u064A\u0648\u0645 \u0644\u062A\u0633\u062C\u064A\u0644 \u0641\u0634\u0644\u0647.");
  const lot = profile.inventory.find((item) => item.materialOrProductId === contract.productId && item.quantity >= contract.quantity);
  if (!lot) return failure(profile, "insufficient-materials", `\u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 ${contract.quantity} \u0648\u062D\u062F\u0629 \u0645\u0646 ${contract.productName} \u0642\u0628\u0644 \u0627\u0644\u062A\u0633\u0644\u064A\u0645.`);
  const minimumQuality = contract.minimumQuality ?? 0;
  const actualQuality = lot.qualityScore ?? 90;
  if (actualQuality < minimumQuality) return failure(profile, "condition-not-met", `\u062C\u0648\u062F\u0629 \u0627\u0644\u0645\u0646\u062A\u062C ${Math.round(actualQuality)}%\u060C \u0628\u064A\u0646\u0645\u0627 \u064A\u0634\u062A\u0631\u0637 \u0627\u0644\u0639\u0645\u064A\u0644 ${minimumQuality}% \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.`);
  const nextInventory = profile.inventory.flatMap((item) => item.id !== lot.id ? [item] : item.quantity === contract.quantity ? [] : [{ ...item, quantity: item.quantity - contract.quantity }]);
  const grossRevenue = contract.quantity * contract.unitPrice;
  const hasAccountant = profile.staff.some((member) => member.status === "active" && member.role === "accountant");
  const accountant = profile.staff.find((member) => member.status === "active" && member.role === "accountant");
  const taxRate = (findCountry(profile.countryId)?.economy.taxRate ?? 0) * (accountant ? Math.max(0.82, 0.9 - (staffLevel(accountant) - 1) * 0.02) : 1);
  const tax = Math.round(grossRevenue * taxRate);
  const costOfGoods = Math.round(lot.unitCost * contract.quantity);
  const sale = { id: nextId(profile, "sale", profile.sales.length), productId: contract.productId, quantity: contract.quantity, unitPrice: contract.unitPrice, grossRevenue, tax, costOfGoods, soldOnDay: profile.day, contractId: contract.id, soldAt: timestampFor(profile) };
  const revenue = grossRevenue + contract.reward;
  const completed = { ...contract, status: "completed", completedOnDay: profile.day };
  const contracts = (profile.contracts ?? []).map((item) => item.id === contract.id ? completed : item);
  const base = { ...profile, inventory: nextInventory, sales: [...profile.sales, sale], contracts, reputation: Math.min(100, (profile.reputation ?? 50) + contract.reputationReward) };
  const achievements = awardAchievements(base);
  const nextProfile = addLedger(
    { ...base, achievements: achievements.achievements },
    [
      ledgerEntry(profile, "revenue", grossRevenue, `\u0628\u064A\u0639 \u0639\u0642\u062F ${contract.clientName} \xB7 ${contract.productName}`, 0),
      ledgerEntry(profile, "revenue", contract.reward, `\u0639\u0644\u0627\u0648\u0629 \u0639\u0642\u062F ${contract.clientName}`, 1),
      ledgerEntry(profile, "expense", tax, "\u0636\u0631\u064A\u0628\u0629 \u0645\u0628\u064A\u0639\u0627\u062A \u0645\u062D\u0627\u0643\u0627\u0629 \u0639\u0644\u0649 \u0627\u0644\u0639\u0642\u062F", 2),
      ledgerEntry(profile, "expense", costOfGoods, `\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u0627\u0644\u0645\u0628\u0627\u0639\u0629 \u0628\u0639\u0642\u062F: ${contract.productName}`, 3),
      ...achievements.bonus > 0 ? [ledgerEntry(profile, "revenue", achievements.bonus, "\u0645\u0643\u0627\u0641\u0623\u0629 \u0625\u0646\u062C\u0627\u0632\u0627\u062A \u0627\u0644\u0639\u0642\u0648\u062F", 4)] : []
    ],
    profile.bankBalance + revenue - tax + achievements.bonus
  );
  return success(syncTasks(nextProfile), `\u062A\u0645 \u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0639\u0642\u062F \u0628\u0646\u062C\u0627\u062D. \u0627\u0644\u0625\u064A\u0631\u0627\u062F ${grossRevenue.toLocaleString("ar-EG")} $ \u0648\u0627\u0644\u0639\u0644\u0627\u0648\u0629 ${contract.reward.toLocaleString("ar-EG")} $ \u0628\u0639\u062F \u0627\u062D\u062A\u0633\u0627\u0628 \u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u0648\u0627\u0644\u062A\u0643\u0644\u0641\u0629.`, completed);
}
function negotiateContract(profile, contractId, mode) {
  const contract = (profile.contracts ?? []).find((item) => item.id === contractId && item.status === "active");
  if (!contract) return failure(profile, "not-found", "\u0627\u0644\u0639\u0642\u062F \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u062A\u0645\u062A \u062A\u0633\u0648\u064A\u062A\u0647.");
  if (contract.negotiated) return failure(profile, "already-owned", "\u062A\u0645 \u0627\u0644\u062A\u0641\u0627\u0648\u0636 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0639\u0642\u062F \u0645\u0646 \u0642\u0628\u0644.");
  const changes = mode === "price" ? { unitPrice: Math.round(contract.unitPrice * 1.08), negotiationNote: "\u0631\u0641\u0639 \u0627\u0644\u0633\u0639\u0631 8% \u0645\u0642\u0627\u0628\u0644 \u0642\u0628\u0648\u0644 \u0627\u0644\u0639\u0645\u064A\u0644 \u0628\u0645\u0647\u0644\u0629 \u0648\u0634\u0631\u0648\u0637 \u0627\u0644\u0639\u0642\u062F \u0646\u0641\u0633\u0647\u0627." } : mode === "deadline" ? { deadlineDay: contract.deadlineDay + 1, reward: Math.round(contract.reward * 0.95), negotiationNote: "\u062A\u0645\u062F\u064A\u062F \u064A\u0648\u0645 \u0648\u0627\u062D\u062F \u0645\u0642\u0627\u0628\u0644 \u062E\u0641\u0636 \u0639\u0644\u0627\u0648\u0629 \u0627\u0644\u062A\u0633\u0644\u064A\u0645 5%." } : { minimumQuality: Math.max(0, (contract.minimumQuality ?? 90) - 5), reward: Math.round(contract.reward * 0.92), negotiationNote: "\u062E\u0641\u0636 \u0627\u0644\u062C\u0648\u062F\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 5 \u0646\u0642\u0627\u0637 \u0645\u0642\u0627\u0628\u0644 \u062E\u0641\u0636 \u0627\u0644\u0639\u0644\u0627\u0648\u0629 8%." };
  const updated = { ...contract, ...changes, negotiated: true };
  return success({ ...profile, contracts: profile.contracts.map((item) => item.id === contractId ? updated : item) }, `\u062A\u0645 \u0627\u0644\u062A\u0641\u0627\u0648\u0636: ${updated.negotiationNote}`, updated);
}
function claimTask(profile, taskId) {
  const task = TASK_CATALOG.find((item) => item.id === taskId);
  if (!task) return failure(profile, "not-found", "\u0627\u0644\u0645\u0647\u0645\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.");
  const current = (profile.tasks ?? []).find((item) => item.taskId === taskId);
  if (current?.claimed || profile.completedTaskIds.includes(taskId)) return failure(profile, "already-claimed", "\u062A\u0645 \u062A\u062D\u0635\u064A\u0644 \u0645\u0643\u0627\u0641\u0623\u0629 \u0647\u0630\u0647 \u0627\u0644\u0645\u0647\u0645\u0629 \u0645\u0646 \u0642\u0628\u0644.");
  if (!conditionMet(profile, task.condition)) return failure(profile, "condition-not-met", "\u0644\u0645 \u064A\u062A\u062D\u0642\u0642 \u0634\u0631\u0637 \u0627\u0644\u0645\u0647\u0645\u0629 \u0628\u0639\u062F.");
  const tasks = [...(profile.tasks ?? []).filter((item) => item.taskId !== taskId), { taskId, claimed: true, claimedAt: timestampFor(profile) }];
  const nextProfile = addLedger(
    { ...profile, tasks, completedTaskIds: [...profile.completedTaskIds, taskId] },
    [ledgerEntry(profile, "revenue", task.reward, `\u0645\u0643\u0627\u0641\u0623\u0629 \u0627\u0644\u0645\u0647\u0645\u0629: ${task.title}`, 0)],
    profile.bankBalance + task.reward
  );
  return success(nextProfile, `\u062A\u0645 \u062A\u062D\u0635\u064A\u0644 \u0645\u0643\u0627\u0641\u0623\u0629 \u0645\u0647\u0645\u0629 \xAB${task.title}\xBB \u0645\u0631\u0629 \u0648\u0627\u062D\u062F\u0629.`, { taskId, reward: task.reward });
}
function claimAllTasks(profile) {
  const claimedIds = new Set(profile.completedTaskIds);
  const claimable = TASK_CATALOG.filter((task) => !claimedIds.has(task.id) && !(profile.tasks ?? []).some((item) => item.taskId === task.id && item.claimed) && conditionMet(profile, task.condition));
  if (!claimable.length) return failure(profile, "condition-not-met", "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0643\u0627\u0641\u0622\u062A \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u062A\u062D\u0635\u064A\u0644 \u0627\u0644\u0622\u0646.");
  const reward = claimable.reduce((sum, task) => sum + task.reward, 0);
  const tasks = [...(profile.tasks ?? [])].map((item) => claimable.some((task) => task.id === item.taskId) ? { ...item, claimed: true, claimedAt: timestampFor(profile) } : item);
  for (const task of claimable) if (!tasks.some((item) => item.taskId === task.id)) tasks.push({ taskId: task.id, claimed: true, claimedAt: timestampFor(profile) });
  const nextProfile = addLedger(
    { ...profile, tasks, completedTaskIds: [...profile.completedTaskIds, ...claimable.map((task) => task.id)] },
    [ledgerEntry(profile, "revenue", reward, `\u062A\u062D\u0635\u064A\u0644 \u062C\u0645\u0627\u0639\u064A \u0644\u0640${claimable.length} \u0645\u0647\u0627\u0645 \u062A\u0646\u0641\u064A\u0630\u064A\u0629`, 0)],
    profile.bankBalance + reward
  );
  return success(nextProfile, `\u062A\u0645 \u062C\u0645\u0639 ${claimable.length} \u0645\u0643\u0627\u0641\u0622\u062A \u0628\u0625\u062C\u0645\u0627\u0644\u064A ${reward.toLocaleString("ar-EG")}.`, { taskId: "all", reward });
}
var bidOnLand = placeBid;
var purchaseMaterial = buyMaterial;
var foundBusiness = foundCompany;
var produce = runProduction;
var sell = sellProduct;
var invest = createInvestment;
var passDay = advanceDay;
function updateNotificationState(profile, action, notificationIds) {
  if (action !== "read" && action !== "dismiss") return failure(profile, "invalid-input", "\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u062A\u0646\u0628\u064A\u0647 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D.");
  if (!Array.isArray(notificationIds) || notificationIds.length === 0 || notificationIds.length > 20) return failure(profile, "invalid-input", "\u0627\u062E\u062A\u0631 \u062A\u0646\u0628\u064A\u0647\u064B\u0627 \u0648\u0627\u062D\u062F\u064B\u0627 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.");
  const ids = [...new Set(notificationIds.filter((id) => typeof id === "string" && id.trim().length > 0 && id.length <= 512))];
  if (ids.length === 0 || ids.length !== notificationIds.length) return failure(profile, "invalid-input", "\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629.");
  const readIds = new Set(profile.readNotificationIds ?? []);
  const dismissedIds = new Set(profile.dismissedNotificationIds ?? []);
  for (const id of ids) (action === "read" ? readIds : dismissedIds).add(id);
  const productionIds = new Set(ids.flatMap((id) => id.startsWith("production-completed:") ? id.slice("production-completed:".length).split(",").filter(Boolean) : []));
  const nextProfile = {
    ...profile,
    readNotificationIds: [...readIds].slice(-500),
    dismissedNotificationIds: [...dismissedIds].slice(-500),
    unreadProductionOrderIds: (profile.unreadProductionOrderIds ?? []).filter((id) => !productionIds.has(id))
  };
  return success(nextProfile, action === "read" ? "\u062A\u0645 \u062A\u0639\u0644\u064A\u0645 \u0627\u0644\u062A\u0646\u0628\u064A\u0647 \u0643\u0645\u0642\u0631\u0648\u0621." : "\u062A\u0645 \u0625\u062E\u0641\u0627\u0621 \u0627\u0644\u062A\u0646\u0628\u064A\u0647.", { action, notificationIds: ids });
}
function executeGameCommand(profile, command) {
  switch (command.name) {
    case "place_bid":
      return placeBid(profile, command.args.listingId, command.args.amount, command.args.targetCompanyId);
    case "buy_direct_land":
      return buyDirectLand(profile, command.args.listingId, command.args.paymentMethod);
    case "buy_direct_company":
      return buyDirectCompany(profile, command.args.listingId, command.args.paymentMethod);
    case "sell_land":
      return sellLand(profile, command.args.landId);
    case "upgrade_land":
      return upgradeLand(profile, command.args.landId, command.args.paymentMethod);
    case "sell_company":
      return sellCompany(profile, command.args.companyId);
    case "sell_asset":
      return sellAsset(profile, command.args.assetId);
    case "buy_material":
      return buyMaterial(profile, command.args.materialId, command.args.quantity);
    case "buy_global_material":
      return buyGlobalMaterial(profile, command.args.offerId, command.args.quantity, command.args.negotiatedUnitPrice, command.args.paymentMethod, { shippingMode: command.args.shippingMode, paymentTerm: command.args.paymentTerm, fleetCount: command.args.fleetCount });
    case "export_global_product":
      return exportGlobalProduct(profile, command.args.bidId, command.args.quantity);
    case "sign_forward_contract":
      return signForwardContract(profile, command.args.templateId);
    case "draw_forward_contract":
      return drawFromForwardContract(profile, command.args.contractId, command.args.quantity);
    case "found_company":
      return foundCompany(profile, command.args.industryId, command.args.landId, command.args.name, command.args.paymentMethod);
    case "upgrade_company":
      return upgradeCompany(profile, command.args.companyId, command.args.paymentMethod);
    case "run_production":
      return runProduction(profile, command.args.companyId, command.args.batches);
    case "auto_supply_and_produce":
      return autoSupplyAndProduce(profile, command.args.companyId, command.args.batches);
    case "service_company":
      return serviceCompany(profile, command.args.companyId);
    case "cancel_production":
      return cancelProductionOrder(profile, command.args.orderId);
    case "use_speed_card":
      return useProductionSpeedCard(profile, command.args.orderId, command.args.kind);
    case "use_day_speed_card":
      return useDaySpeedCard(profile, command.args.kind);
    case "buy_speed_card":
      return buySpeedCard(profile, command.args.kind, command.args.quantity, command.args.paymentMethod);
    case "upgrade_warehouse":
      return upgradeWarehouse(profile, command.args.paymentMethod);
    case "sell_product":
      return sellProduct(profile, command.args.productId, command.args.quantity);
    case "buy_gold":
      return buyGold(profile, command.args.grams);
    case "buy_gold_with_diamonds":
      return buyGoldWithDiamonds(profile, command.args.grams);
    case "sell_gold":
      return sellGold(profile, command.args.grams);
    case "hire_staff":
      return hireStaff(profile, command.args.role, command.args.name, command.args.companyId);
    case "upgrade_staff":
      return upgradeStaff(profile, command.args.staffId);
    case "pay_staff_salary":
      return payStaffSalary(profile, command.args.staffId);
    case "terminate_staff":
      return terminateStaff(profile, command.args.staffId);
    case "create_deposit":
      return createDeposit(profile, command.args.amount, command.args.durationDays);
    case "merge_deposits":
      return mergeDeposits(profile, command.args.depositIds);
    case "withdraw_deposit":
      return withdrawDeposit(profile, command.args.depositId);
    case "take_loan":
      return takeLoan(profile, command.args.collateralType, command.args.collateralId, command.args.amount, command.args.termDays);
    case "repay_loan":
      return repayLoan(profile, command.args.loanId, command.args.installments);
    case "create_investment":
      return createInvestment(profile, command.args.investmentId, command.args.amount);
    case "advance_day":
      return advanceDay(profile);
    case "accept_contract":
      return acceptContract(profile, command.args.offerId);
    case "deliver_contract":
      return deliverContract(profile, command.args.contractId);
    case "negotiate_contract":
      return negotiateContract(profile, command.args.contractId, command.args.mode);
    case "claim_task":
      return claimTask(profile, command.args.taskId);
    case "claim_all_tasks":
      return claimAllTasks(profile);
    case "claim_season_challenge":
      return claimSeasonChallenge(profile, command.args.challengeId);
    case "claim_login_reward":
      return claimLoginReward(profile, command.args.rewardId);
    case "choose_season_event":
      return chooseSeasonEvent(profile, command.args.choiceId);
    case "update_notification_state":
      return updateNotificationState(profile, command.args.action, command.args.notificationIds);
  }
}
export {
  acceptContract,
  advanceDay,
  autoSupplyAndProduce,
  bidOnLand,
  buyDirectCompany,
  buyDirectLand,
  buyGlobalMaterial,
  buyGold,
  buyGoldWithDiamonds,
  buyMaterial,
  buySpeedCard,
  cancelProductionOrder,
  claimTask,
  createDeposit,
  createInvestment,
  deliverContract,
  drawFromForwardContract,
  executeGameCommand,
  exportGlobalProduct,
  foundBusiness,
  foundCompany,
  getDayBriefing,
  getDepositExpectedInterest,
  getDepositMaturityRange,
  getStaffUpgradeCost,
  hasMaturedDepositTranche,
  hireStaff,
  invest,
  mergeDeposits,
  negotiateContract,
  passDay,
  payStaffSalary,
  placeBid,
  produce,
  purchaseMaterial,
  repayLoan,
  runProduction,
  sell,
  sellAsset,
  sellCompany,
  sellGold,
  sellLand,
  sellProduct,
  serviceCompany,
  signForwardContract,
  staffExperience,
  staffLevel,
  takeLoan,
  terminateStaff,
  updateNotificationState,
  upgradeCompany,
  upgradeLand,
  upgradeStaff,
  upgradeWarehouse,
  useDaySpeedCard,
  useProductionSpeedCard,
  withdrawDeposit
};
