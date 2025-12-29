export type SeasonalThemeKey =
  | 'default'
  | 'noel'
  | 'valentine'
  | 'summer'
  | 'backtoschool'
  | 'halloween';

export interface SeasonalTheme {
  key: SeasonalThemeKey;
  labelEn: string;
  labelFr: string;
  descEn: string;
  descFr: string;
}

export const seasonalThemes: SeasonalTheme[] = [
  { key: 'default', labelEn: 'Default', labelFr: 'Par défaut', descEn: 'Classic SmartStyle theme', descFr: 'Thème SmartStyle classique' },
  { key: 'noel', labelEn: 'Christmas', labelFr: 'Noël', descEn: 'Festive red & gold', descFr: 'Rouge & or festif' },
  { key: 'valentine', labelEn: 'Valentine', labelFr: 'Saint-Valentin', descEn: 'Romantic pink & rose', descFr: 'Rose romantique' },
  { key: 'summer', labelEn: 'Summer', labelFr: 'Été', descEn: 'Bright sun & ocean', descFr: 'Soleil & océan' },
  { key: 'backtoschool', labelEn: 'Back to school', labelFr: 'Rentrée', descEn: 'Clean slate & navy', descFr: 'Épuré & marine' },
  { key: 'halloween', labelEn: 'Halloween', labelFr: 'Halloween', descEn: 'Pumpkin & midnight', descFr: 'Citrouille & minuit' },
];

export const SEASONAL_THEME_STORAGE_KEY = 'smartstyle.theme';
