import { useMemo, useState } from 'react';
import { useWardrobe, WardrobeItem } from '@/hooks/useWardrobe';
import { useTranslation } from '@/hooks/useTranslation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import {
  Layers,
  Sparkles,
  Shuffle,
  Check,
  Shirt,
  Grid3X3,
} from 'lucide-react';

// Neutral/versatile colors that work with everything
const VERSATILE_COLORS = ['black', 'white', 'navy', 'gray', 'grey', 'beige', 'cream', 'khaki', 'tan', 'brown', 'denim', 'charcoal'];

function isVersatileColor(color: string): boolean {
  const lower = color.toLowerCase();
  return VERSATILE_COLORS.some(c => lower.includes(c));
}

function getVersatilityScore(item: WardrobeItem): number {
  let score = 0;
  
  // Neutral colors are more versatile
  if (isVersatileColor(item.color)) score += 30;
  
  // Multi-season items are more versatile
  if (item.season === 'all') score += 25;
  
  // Casual items are generally more versatile
  if (item.style === 'casual') score += 15;
  if (item.style === 'business') score += 10;
  
  // Core categories are essential
  if (['top', 'bottom', 'outerwear'].includes(item.category)) score += 10;
  
  // Frequently worn items are proven versatile
  score += Math.min((item.wear_count || 0) * 2, 20);
  
  return score;
}

interface CapsuleOutfit {
  top: WardrobeItem;
  bottom: WardrobeItem;
  outerwear?: WardrobeItem;
}

export default function CapsuleWardrobe() {
  const { t } = useTranslation();
  const { availableItems } = useWardrobe();
  
  const [capsuleSize, setCapsuleSize] = useState<number>(15);
  const [showCombinations, setShowCombinations] = useState(false);

  // Score and rank all items by versatility
  const rankedItems = useMemo(() => {
    return [...availableItems]
      .map(item => ({ item, score: getVersatilityScore(item) }))
      .sort((a, b) => b.score - a.score);
  }, [availableItems]);

  // Build capsule wardrobe with balanced category distribution
  const capsuleItems = useMemo(() => {
    const capsule: WardrobeItem[] = [];
    const categoryTargets: Record<string, number> = {
      top: Math.ceil(capsuleSize * 0.35),      // ~35% tops
      bottom: Math.ceil(capsuleSize * 0.25),   // ~25% bottoms
      outerwear: Math.ceil(capsuleSize * 0.15),// ~15% outerwear
      dress: Math.ceil(capsuleSize * 0.1),     // ~10% dresses
      shoes: Math.ceil(capsuleSize * 0.1),     // ~10% shoes
      accessory: Math.ceil(capsuleSize * 0.05),// ~5% accessories
    };
    const categoryCounts: Record<string, number> = {};

    for (const { item } of rankedItems) {
      const cat = item.category;
      const target = categoryTargets[cat] || 1;
      const current = categoryCounts[cat] || 0;

      if (current < target && capsule.length < capsuleSize) {
        capsule.push(item);
        categoryCounts[cat] = current + 1;
      }

      if (capsule.length >= capsuleSize) break;
    }

    // Fill remaining slots with highest-scored items not yet included
    if (capsule.length < capsuleSize) {
      for (const { item } of rankedItems) {
        if (!capsule.find(c => c.id === item.id) && capsule.length < capsuleSize) {
          capsule.push(item);
        }
        if (capsule.length >= capsuleSize) break;
      }
    }

    return capsule;
  }, [rankedItems, capsuleSize]);

  // Group capsule items by category
  const capsuleByCategory = useMemo(() => {
    const map: Record<string, WardrobeItem[]> = {};
    capsuleItems.forEach(item => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return map;
  }, [capsuleItems]);

  // Generate possible outfit combinations from capsule
  const outfitCombinations = useMemo(() => {
    const tops = capsuleItems.filter(i => ['top', 'dress', 'outerwear'].includes(i.category));
    const bottoms = capsuleItems.filter(i => ['bottom', 'dress'].includes(i.category));
    const outerwear = capsuleItems.filter(i => i.category === 'outerwear');

    const combinations: CapsuleOutfit[] = [];

    for (const top of tops) {
      for (const bottom of bottoms) {
        // Skip if same item (dress used as both)
        if (top.id === bottom.id) continue;
        
        // Add basic combo
        combinations.push({ top, bottom });

        // Add combos with outerwear
        for (const outer of outerwear) {
          if (outer.id !== top.id) {
            combinations.push({ top, bottom, outerwear: outer });
          }
        }
      }
    }

    return combinations.slice(0, 30); // Limit to 30 for display
  }, [capsuleItems]);

  if (availableItems.length < 5) {
    return null;
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          {t.capsule.title}
        </h3>
        <Badge variant="secondary">
          {capsuleItems.length} {t.capsule.items}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        {t.capsule.description}
      </p>

      {/* Capsule size slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span>{t.capsule.size}</span>
          <span className="font-medium">{capsuleSize} {t.capsule.items}</span>
        </div>
        <Slider
          value={[capsuleSize]}
          onValueChange={([v]) => setCapsuleSize(v)}
          min={10}
          max={40}
          step={5}
          className="w-full"
        />
      </div>

      {/* Capsule items by category */}
      <ScrollArea className="h-[220px]">
        <div className="space-y-3 pr-3">
          {Object.entries(capsuleByCategory).map(([category, items]) => (
            <div key={category} className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                {t.categoryLabels[category as keyof typeof t.categoryLabels] || category}
                <Badge variant="outline" className="text-[10px] px-1 py-0">
                  {items.length}
                </Badge>
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="relative w-12 h-12 rounded-md overflow-hidden bg-muted border-2 border-primary/20"
                  >
                    <img
                      src={item.image_url}
                      alt={item.name || ''}
                      className="w-full h-full object-cover"
                    />
                    {isVersatileColor(item.color) && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground rounded-bl p-0.5">
                        <Sparkles className="w-2 h-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Toggle combinations view */}
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={() => setShowCombinations(!showCombinations)}
      >
        <Grid3X3 className="w-4 h-4" />
        {showCombinations ? t.capsule.hideCombinations : t.capsule.showCombinations}
        <Badge variant="secondary" className="ml-auto">
          {outfitCombinations.length}
        </Badge>
      </Button>

      {/* Outfit combinations */}
      {showCombinations && (
        <ScrollArea className="h-[200px]">
          <div className="grid grid-cols-2 gap-2 pr-3">
            {outfitCombinations.slice(0, 12).map((combo, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 bg-muted/50 rounded-lg p-2"
              >
                <div className="w-8 h-8 rounded overflow-hidden bg-muted">
                  <img
                    src={combo.top.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-muted-foreground text-xs">+</span>
                <div className="w-8 h-8 rounded overflow-hidden bg-muted">
                  <img
                    src={combo.bottom.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                {combo.outerwear && (
                  <>
                    <span className="text-muted-foreground text-xs">+</span>
                    <div className="w-8 h-8 rounded overflow-hidden bg-muted">
                      <img
                        src={combo.outerwear.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          {outfitCombinations.length > 12 && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              +{outfitCombinations.length - 12} {t.capsule.moreCombinations}
            </p>
          )}
        </ScrollArea>
      )}

      {/* Stats summary */}
      <div className="flex items-center justify-between text-xs border-t pt-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Shirt className="w-3 h-3 text-muted-foreground" />
            {capsuleItems.length} {t.capsule.items}
          </span>
          <span className="flex items-center gap-1">
            <Shuffle className="w-3 h-3 text-muted-foreground" />
            {outfitCombinations.length} {t.capsule.outfits}
          </span>
        </div>
        <span className="text-muted-foreground">
          {Math.round((capsuleItems.length / availableItems.length) * 100)}% {t.capsule.ofWardrobe}
        </span>
      </div>
    </Card>
  );
}
