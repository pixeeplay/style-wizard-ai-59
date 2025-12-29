import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface WardrobeFilters {
  category: string;
  color: string;
  season: string;
  style: string;
}

interface WardrobeFiltersProps {
  filters: WardrobeFilters;
  onChange: (filters: WardrobeFilters) => void;
  uniqueColors: string[];
}

const categories = [
  { value: 'all', label: 'Toutes catégories' },
  { value: 'top', label: 'Hauts' },
  { value: 'bottom', label: 'Bas' },
  { value: 'dress', label: 'Robes' },
  { value: 'outerwear', label: 'Vestes' },
  { value: 'shoes', label: 'Chaussures' },
  { value: 'accessory', label: 'Accessoires' },
  { value: 'underwear', label: 'Sous-vêtements' },
  { value: 'swimwear', label: 'Maillots' },
  { value: 'sportswear', label: 'Sport' },
];

const seasons = [
  { value: 'all', label: 'Toutes saisons' },
  { value: 'spring', label: 'Printemps' },
  { value: 'summer', label: 'Été' },
  { value: 'fall', label: 'Automne' },
  { value: 'winter', label: 'Hiver' },
];

const styles = [
  { value: 'all', label: 'Tous styles' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formel' },
  { value: 'sport', label: 'Sport' },
  { value: 'business', label: 'Business' },
  { value: 'evening', label: 'Soirée' },
  { value: 'vacation', label: 'Vacances' },
];

export default function WardrobeFiltersComponent({ filters, onChange, uniqueColors }: WardrobeFiltersProps) {
  const hasActiveFilters = filters.category !== 'all' || filters.color !== 'all' || filters.season !== 'all' || filters.style !== 'all';

  const resetFilters = () => {
    onChange({ category: 'all', color: 'all', season: 'all', style: 'all' });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Select
          value={filters.category}
          onValueChange={(value) => onChange({ ...filters, category: value })}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.color}
          onValueChange={(value) => onChange({ ...filters, color: value })}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Couleur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes couleurs</SelectItem>
            {uniqueColors.map((color) => (
              <SelectItem key={color} value={color}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full border border-border" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="capitalize">{color}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.season}
          onValueChange={(value) => onChange({ ...filters, season: value })}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Saison" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.style}
          onValueChange={(value) => onChange({ ...filters, style: value })}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            {styles.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-xs h-7 text-muted-foreground"
        >
          <X className="w-3 h-3 mr-1" />
          Effacer les filtres
        </Button>
      )}
    </div>
  );
}
