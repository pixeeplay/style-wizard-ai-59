import { useMemo } from 'react';
import { useWardrobe, WardrobeItem } from '@/hooks/useWardrobe';
import { useTranslation } from '@/hooks/useTranslation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  WashingMachine,
  Shirt,
  Check,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export default function LaundryTracker() {
  const { t } = useTranslation();
  const { items, laundryItems, availableItems, toggleLaundry } = useWardrobe();

  // Group laundry items by category
  const laundryByCategory = useMemo(() => {
    const map: Record<string, WardrobeItem[]> = {};
    laundryItems.forEach((item) => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return map;
  }, [laundryItems]);

  // Check if we're running low on specific categories
  const lowStockCategories = useMemo(() => {
    const categories: { category: string; available: number; inLaundry: number }[] = [];
    const categorySet = new Set(items.map((i) => i.category));

    categorySet.forEach((category) => {
      const available = availableItems.filter((i) => i.category === category).length;
      const inLaundry = laundryItems.filter((i) => i.category === category).length;

      // Warn if more than half are in laundry or less than 2 available
      if ((inLaundry > available && inLaundry > 0) || (available < 2 && inLaundry > 0)) {
        categories.push({ category, available, inLaundry });
      }
    });

    return categories;
  }, [items, availableItems, laundryItems]);

  const handleMarkClean = async (itemId: string) => {
    await toggleLaundry(itemId);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <WashingMachine className="w-4 h-4 text-primary" />
          {t.laundry.title}
        </h3>
        <Badge variant={laundryItems.length > 0 ? 'secondary' : 'outline'}>
          {laundryItems.length} {t.laundry.inLaundry}
        </Badge>
      </div>

      {/* Low stock warnings */}
      {lowStockCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-destructive flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {t.laundry.runningLow}
          </p>
          <div className="flex flex-wrap gap-2">
            {lowStockCategories.map(({ category, available, inLaundry }) => (
              <Badge key={category} variant="destructive" className="text-xs gap-1">
                {t.categoryLabels[category as keyof typeof t.categoryLabels] || category}
                <span className="opacity-75">
                  ({available} {t.laundry.available}, {inLaundry} {t.laundry.dirty})
                </span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Laundry items */}
      {laundryItems.length > 0 ? (
        <ScrollArea className="h-[200px]">
          <div className="space-y-2 pr-3">
            {Object.entries(laundryByCategory).map(([category, categoryItems]) => (
              <div key={category} className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {t.categoryLabels[category as keyof typeof t.categoryLabels] || category} ({categoryItems.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 pr-3"
                    >
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-muted">
                        <img
                          src={item.image_url}
                          alt={item.name || ''}
                          className="w-full h-full object-cover opacity-60"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {item.name || t.categoryLabels[item.category as keyof typeof t.categoryLabels]}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{item.color}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => handleMarkClean(item.id)}
                      >
                        <Check className="w-3 h-3" />
                        {t.laundry.markClean}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="py-6 text-center text-muted-foreground">
          <Shirt className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t.laundry.allClean}</p>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between text-xs border-t pt-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            {availableItems.length} {t.laundry.clean}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            {laundryItems.length} {t.laundry.dirty}
          </span>
        </div>
        {laundryItems.length > 0 && (
          <p className="text-muted-foreground">
            {t.laundry.reminder}
          </p>
        )}
      </div>
    </Card>
  );
}
