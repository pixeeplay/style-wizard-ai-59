export type SeasonalThemeKey =
  | 'default'
  | 'noel'
  | 'valentine'
  | 'summer'
  | 'backtoschool'
  | 'halloween';

export const seasonalThemes: Array<{ key: SeasonalThemeKey; label: string; description: string }> = [
  { key: 'default', label: 'Default', description: 'Classic SmartStyle theme' },
  { key: 'noel', label: 'Christmas', description: 'Festive red & gold' },
  { key: 'valentine', label: 'Valentine', description: 'Romantic pink & rose' },
  { key: 'summer', label: 'Summer', description: 'Bright sun & ocean' },
  { key: 'backtoschool', label: 'Back to school', description: 'Clean slate & navy' },
  { key: 'halloween', label: 'Halloween', description: 'Pumpkin & midnight' },
];

export const SEASONAL_THEME_STORAGE_KEY = 'smartstyle.theme';
