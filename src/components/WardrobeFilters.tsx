import { useTranslation } from '@/hooks/useTranslation';
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

export default function WardrobeFiltersComponent({ filters, onChange, uniqueColors }: WardrobeFiltersProps) {
  const { t } = useTranslation();

  const categories = [
    { value: 'all', label: t.categories.all },
    { value: 'top', label: t.categories.top },
    { value: 'bottom', label: t.categories.bottom },
    { value: 'dress', label: t.categories.dress },
    { value: 'outerwear', label: t.categories.outerwear },
    { value: 'shoes', label: t.categories.shoes },
    { value: 'accessory', label: t.categories.accessory },
    { value: 'underwear', label: t.categories.underwear },
    { value: 'swimwear', label: t.categories.swimwear },
    { value: 'sportswear', label: t.categories.sportswear },
  ];

  const seasons = [
    { value: 'all', label: t.seasons.all },
    { value: 'spring', label: t.seasons.spring },
    { value: 'summer', label: t.seasons.summer },
    { value: 'fall', label: t.seasons.fall },
    { value: 'winter', label: t.seasons.winter },
  ];

  const styles = [
    { value: 'all', label: t.styles.all },
    { value: 'casual', label: t.styles.casual },
    { value: 'formal', label: t.styles.formal },
    { value: 'sport', label: t.styles.sport },
    { value: 'business', label: t.styles.business },
    { value: 'evening', label: t.styles.evening },
    { value: 'vacation', label: t.styles.vacation },
  ];

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
            <SelectValue placeholder={t.filters.category} />
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
            <SelectValue placeholder={t.filters.color} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.wardrobe.allColors}</SelectItem>
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
            <SelectValue placeholder={t.filters.season} />
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
            <SelectValue placeholder={t.filters.style} />
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
          {t.filters.clearFilters}
        </Button>
      )}
    </div>
  );
}
