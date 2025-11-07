
import { AppData } from './types';

export const ZAKAT_PERCENTAGE = 0.025;
export const NISSAB_GOLD_GRAMS = 85;

export const INITIAL_APP_DATA: AppData = {
  transactions: [],
  debts: [],
  investments: [],
  zakatAssets: {
    cash: 0,
    goldInGrams: 0,
  },
  settings: {
    goldPricePerGram: 65, // Default value, user can update
  },
};

export const STORAGE_KEY = 'hadjFinanceData';
