import { useMemo } from 'react';
import { useWardrobe, WardrobeItem } from '@/hooks/useWardrobe';
import { useTranslation } from '@/hooks/useTranslation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, Sparkles, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

interface OutfitRecommendationsProps {
  onSelectOutfit?: (top: WardrobeItem, bottom: WardrobeItem) => void;
}

export default function OutfitRecommendations({ onSelectOutfit }: OutfitRecommendationsProps) {
  const { t } = useTranslation();
  const { items, availableItems } = useWardrobe();

  // Get items not worn recently (30+ days or never)
  const neglectedItems = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return availableItems.filter(item => {
      if (!item.last_worn_at) return true;
      return new Date(item.last_worn_at) < thirtyDaysAgo;
    });
  }, [availableItems]);

  // Generate outfit suggestions using neglected items
  const outfitSuggestions = useMemo(() => {
    const suggestions: { top: WardrobeItem; bottom: WardrobeItem; reason: string }[] = [];
    
    const neglectedTops = neglectedItems.filter(item => 
      ['top', 'dress', 'outerwear'].includes(item.category)
    );
    const neglectedBottoms = neglectedItems.filter(item => 
      ['bottom', 'dress'].includes(item.category)
    );
    const allTops = availableItems.filter(item => 
      ['top', 'dress', 'outerwear'].includes(item.category)
    );
    const allBottoms = availableItems.filter(item => 
      ['bottom', 'dress'].includes(item.category)
    );

    // Priority 1: Both top and bottom are neglected
    for (const top of neglectedTops.slice(0, 3)) {
      for (const bottom of neglectedBottoms.slice(0, 3)) {
        if (top.id !== bottom.id) {
          suggestions.push({
            top,
            bottom,
            reason: 'bothNeglected',
          });
          if (suggestions.length >= 2) break;
        }
      }
      if (suggestions.length >= 2) break;
    }

    // Priority 2: Neglected top with any bottom
    for (const top of neglectedTops) {
      if (suggestions.length >= 4) break;
      const matchingBottom = allBottoms.find(b => 
        !suggestions.some(s => s.top.id === top.id && s.bottom.id === b.id)
      );
      if (matchingBottom) {
        suggestions.push({
          top,
          bottom: matchingBottom,
          reason: 'topNeglected',
        });
      }
    }

    // Priority 3: Neglected bottom with any top
    for (const bottom of neglectedBottoms) {
      if (suggestions.length >= 5) break;
      const matchingTop = allTops.find(t => 
        !suggestions.some(s => s.top.id === t.id && s.bottom.id === bottom.id)
      );
      if (matchingTop) {
        suggestions.push({
          top: matchingTop,
          bottom,
          reason: 'bottomNeglected',
        });
      }
    }

    return suggestions.slice(0, 5);
  }, [neglectedItems, availableItems]);

  const formatLastWorn = (dateStr: string | null) => {
    if (!dateStr) return t.recommendations.never;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t.recommendations.today;
    if (diffDays === 1) return t.recommendations.yesterday;
    if (diffDays < 7) return t.recommendations.daysAgo(diffDays);
    if (diffDays < 30) return t.recommendations.weeksAgo(Math.floor(diffDays / 7));
    return t.recommendations.monthsAgo(Math.floor(diffDays / 30));
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'bothNeglected':
        return t.recommendations.bothNotWorn;
      case 'topNeglected':
        return t.recommendations.topNotWorn;
      case 'bottomNeglected':
        return t.recommendations.bottomNotWorn;
      default:
        return '';
    }
  };

  if (items.length < 2) {
    return null;
  }

  if (outfitSuggestions.length === 0) {
    return (
      <Card className="p-4 border-dashed">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          <p className="text-sm">{t.recommendations.allWornRecently}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          {t.recommendations.title}
        </h3>
        <Badge variant="outline" className="text-xs gap-1">
          <AlertTriangle className="w-3 h-3" />
          {neglectedItems.length} {t.recommendations.neglected}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        {t.recommendations.subtitle}
      </p>

      <ScrollArea className="h-[200px]">
        <div className="space-y-3 pr-3">
          {outfitSuggestions.map((suggestion, idx) => (
            <Card 
              key={`${suggestion.top.id}-${suggestion.bottom.id}`}
              className="p-3 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onSelectOutfit?.(suggestion.top, suggestion.bottom)}
            >
              <div className="flex items-center gap-3">
                {/* Outfit preview */}
                <div className="flex -space-x-2">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border-2 border-background">
                    <img 
                      src={suggestion.top.image_url} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border-2 border-background">
                    <img 
                      src={suggestion.bottom.image_url} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Clock className="w-3 h-3" />
                      {getReasonLabel(suggestion.reason)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p className="truncate">
                      {suggestion.top.name || t.categoryLabels[suggestion.top.category]}: {formatLastWorn(suggestion.top.last_worn_at)}
                    </p>
                    <p className="truncate">
                      {suggestion.bottom.name || t.categoryLabels[suggestion.bottom.category]}: {formatLastWorn(suggestion.bottom.last_worn_at)}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectOutfit?.(suggestion.top, suggestion.bottom);
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
