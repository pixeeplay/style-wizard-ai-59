import { useMemo } from 'react';
import { useWardrobe, WardrobeItem } from '@/hooks/useWardrobe';
import { useTranslation } from '@/hooks/useTranslation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  Shirt, 
  Sun, 
  Snowflake, 
  Leaf, 
  Flower2,
  Palette,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';

interface ColorGroup {
  color: string;
  count: number;
  percentage: number;
}

interface SeasonData {
  season: string;
  count: number;
  percentage: number;
  icon: React.ReactNode;
}

export default function WardrobeAnalytics() {
  const { t } = useTranslation();
  const { items } = useWardrobe();

  // Most worn items (top 5)
  const mostWornItems = useMemo(() => {
    return [...items]
      .filter(item => (item.wear_count || 0) > 0)
      .sort((a, b) => (b.wear_count || 0) - (a.wear_count || 0))
      .slice(0, 5);
  }, [items]);

  // Least worn items (items with 0 or low wear count, excluding new items)
  const leastWornItems = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return [...items]
      .filter(item => {
        const createdAt = new Date(item.created_at);
        return createdAt < thirtyDaysAgo; // Only items older than 30 days
      })
      .sort((a, b) => (a.wear_count || 0) - (b.wear_count || 0))
      .slice(0, 5);
  }, [items]);

  // Seasonal distribution
  const seasonalData = useMemo((): SeasonData[] => {
    const seasons = ['spring', 'summer', 'fall', 'winter', 'all'];
    const seasonIcons: Record<string, React.ReactNode> = {
      spring: <Flower2 className="w-4 h-4 text-pink-500" />,
      summer: <Sun className="w-4 h-4 text-yellow-500" />,
      fall: <Leaf className="w-4 h-4 text-orange-500" />,
      winter: <Snowflake className="w-4 h-4 text-blue-400" />,
      all: <Shirt className="w-4 h-4 text-muted-foreground" />,
    };

    return seasons.map(season => {
      const count = items.filter(item => item.season === season).length;
      return {
        season,
        count,
        percentage: items.length > 0 ? (count / items.length) * 100 : 0,
        icon: seasonIcons[season],
      };
    }).filter(s => s.count > 0);
  }, [items]);

  // Color palette analysis
  const colorPalette = useMemo((): ColorGroup[] => {
    const colorCounts: Record<string, number> = {};
    
    items.forEach(item => {
      const color = item.color.toLowerCase();
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    });

    return Object.entries(colorCounts)
      .map(([color, count]) => ({
        color,
        count,
        percentage: items.length > 0 ? (count / items.length) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [items]);

  // Category distribution
  const categoryData = useMemo(() => {
    const categories = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory'];
    return categories.map(cat => ({
      category: cat,
      count: items.filter(item => item.category === cat).length,
    })).filter(c => c.count > 0);
  }, [items]);

  const totalWears = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.wear_count || 0), 0);
  }, [items]);

  if (items.length === 0) {
    return (
      <Card className="p-6 text-center border-dashed">
        <BarChart3 className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">{t.analytics.noData}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        {t.analytics.title}
      </h3>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">{items.length}</p>
          <p className="text-xs text-muted-foreground">{t.analytics.totalItems}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">{totalWears}</p>
          <p className="text-xs text-muted-foreground">{t.analytics.totalWears}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">{colorPalette.length}</p>
          <p className="text-xs text-muted-foreground">{t.analytics.uniqueColors}</p>
        </Card>
      </div>

      {/* Most Worn Items */}
      {mostWornItems.length > 0 && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <h4 className="font-medium text-sm">{t.analytics.mostWorn}</h4>
          </div>
          <ScrollArea className="h-[120px]">
            <div className="space-y-2">
              {mostWornItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">#{idx + 1}</span>
                  <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm truncate flex-1">{item.name || t.categoryLabels[item.category]}</span>
                  <Badge variant="secondary" className="text-xs">×{item.wear_count}</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Least Worn Items */}
      {leastWornItems.length > 0 && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-orange-500" />
            <h4 className="font-medium text-sm">{t.analytics.leastWorn}</h4>
          </div>
          <ScrollArea className="h-[120px]">
            <div className="space-y-2">
              {leastWornItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm truncate flex-1">{item.name || t.categoryLabels[item.category]}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.wear_count === 0 ? t.analytics.neverWorn : `×${item.wear_count}`}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Seasonal Distribution */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-sm">{t.analytics.seasonalDistribution}</h4>
        </div>
        <div className="space-y-2">
          {seasonalData.map((data) => (
            <div key={data.season} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {data.icon}
                  <span>{t.seasons[data.season as keyof typeof t.seasons]}</span>
                </div>
                <span className="text-muted-foreground">{data.count}</span>
              </div>
              <Progress value={data.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Color Palette */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-sm">{t.analytics.colorPalette}</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {colorPalette.map((colorGroup) => (
            <div 
              key={colorGroup.color} 
              className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-border bg-muted/30"
            >
              <div 
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: colorGroup.color }}
              />
              <span className="text-xs">{colorGroup.count}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Category Distribution */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Shirt className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-sm">{t.analytics.categoryDistribution}</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {categoryData.map((cat) => (
            <Badge key={cat.category} variant="secondary" className="gap-1">
              {t.categoryLabels[cat.category as keyof typeof t.categoryLabels]}
              <span className="text-muted-foreground">({cat.count})</span>
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
