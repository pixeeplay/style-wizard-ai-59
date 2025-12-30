import { useMemo, useState } from 'react';
import { useWardrobe, WardrobeItem } from '@/hooks/useWardrobe';
import { useTranslation } from '@/hooks/useTranslation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ExternalLink,
  Sparkles,
  Crown,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BrandSuggestion {
  name: string;
  type: 'highEnd' | 'fastFashion';
  logo: string;
  priceRange: string;
  url: string;
}

const brandSuggestions: Record<string, BrandSuggestion[]> = {
  top: [
    { name: 'Sandro', type: 'highEnd', logo: '👔', priceRange: '€150-300', url: 'https://www.sandro-paris.com/fr/homme/vetements/chemises/' },
    { name: 'Maje', type: 'highEnd', logo: '✨', priceRange: '€120-250', url: 'https://www.maje.com/fr/pret-a-porter/tops-chemises/' },
    { name: 'Zara', type: 'fastFashion', logo: '🛍️', priceRange: '€20-60', url: 'https://www.zara.com/fr/fr/femme-chemises-l1217.html' },
    { name: 'H&M', type: 'fastFashion', logo: '👕', priceRange: '€15-40', url: 'https://www2.hm.com/fr_fr/femme/shop-par-produit/tops.html' },
  ],
  bottom: [
    { name: 'The Kooples', type: 'highEnd', logo: '👖', priceRange: '€180-350', url: 'https://www.thekooples.com/fr/homme/vetements/pantalons.html' },
    { name: 'Claudie Pierlot', type: 'highEnd', logo: '💎', priceRange: '€150-280', url: 'https://www.claudiepierlot.com/fr/pret-a-porter/pantalons/' },
    { name: 'Uniqlo', type: 'fastFashion', logo: '🎌', priceRange: '€30-60', url: 'https://www.uniqlo.com/fr/fr/femme/pantalons' },
    { name: 'Mango', type: 'fastFashion', logo: '🥭', priceRange: '€25-70', url: 'https://shop.mango.com/fr/femme/vetements/pantalons' },
  ],
  dress: [
    { name: 'Reformation', type: 'highEnd', logo: '🌿', priceRange: '€200-400', url: 'https://www.thereformation.com/categories/dresses' },
    { name: 'Ba&sh', type: 'highEnd', logo: '🌸', priceRange: '€180-350', url: 'https://ba-sh.com/fr/robes' },
    { name: 'ASOS', type: 'fastFashion', logo: '🎀', priceRange: '€30-80', url: 'https://www.asos.com/fr/femme/robes/cat/?cid=8799' },
    { name: '& Other Stories', type: 'fastFashion', logo: '📖', priceRange: '€50-120', url: 'https://www.stories.com/en/clothing/dresses.html' },
  ],
  outerwear: [
    { name: 'Max Mara', type: 'highEnd', logo: '🧥', priceRange: '€500-2000', url: 'https://www.maxmara.com/fr-fr/manteaux' },
    { name: 'Acne Studios', type: 'highEnd', logo: '🖤', priceRange: '€400-1200', url: 'https://www.acnestudios.com/fr/fr/femme/vetements/manteaux-et-vestes/' },
    { name: 'Arket', type: 'fastFashion', logo: '🌲', priceRange: '€100-250', url: 'https://www.arket.com/en/women/jackets-and-coats.html' },
    { name: 'COS', type: 'fastFashion', logo: '⬜', priceRange: '€120-300', url: 'https://www.cos.com/en/women/coats-and-jackets.html' },
  ],
  shoes: [
    { name: 'Jimmy Choo', type: 'highEnd', logo: '👠', priceRange: '€450-900', url: 'https://www.jimmychoo.com/fr/femme/chaussures/' },
    { name: 'Sézane', type: 'highEnd', logo: '🇫🇷', priceRange: '€150-300', url: 'https://www.sezane.com/fr/collection/chaussures' },
    { name: 'Steve Madden', type: 'fastFashion', logo: '👟', priceRange: '€80-150', url: 'https://www.stevemadden.eu/fr/femme/chaussures' },
    { name: 'Minelli', type: 'fastFashion', logo: '👢', priceRange: '€70-160', url: 'https://www.minelli.fr/femme/chaussures/' },
  ],
  accessory: [
    { name: 'Polène', type: 'highEnd', logo: '👜', priceRange: '€200-500', url: 'https://www.polene-paris.com/collections/sacs' },
    { name: 'A.P.C.', type: 'highEnd', logo: '🎒', priceRange: '€180-450', url: 'https://www.apc.fr/wwuk/women/bags.html' },
    { name: 'Charles & Keith', type: 'fastFashion', logo: '💼', priceRange: '€40-100', url: 'https://www.charleskeith.com/fr/bags' },
    { name: 'Monki', type: 'fastFashion', logo: '🐒', priceRange: '€15-50', url: 'https://www.monki.com/en/accessories/bags.html' },
  ],
};

export default function CostPerWearAnalytics() {
  const { t } = useTranslation();
  const { items, updateItem } = useWardrobe();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState('');

  // Calculate cost per wear for each item
  const itemsWithCPW = useMemo(() => {
    return items
      .filter(item => item.purchase_price && item.purchase_price > 0)
      .map(item => ({
        ...item,
        costPerWear: item.purchase_price! / Math.max(item.wear_count || 1, 1),
      }))
      .sort((a, b) => a.costPerWear - b.costPerWear);
  }, [items]);

  // Best value items (lowest cost per wear)
  const bestValueItems = useMemo(() => {
    return itemsWithCPW.filter(item => (item.wear_count || 0) >= 3).slice(0, 5);
  }, [itemsWithCPW]);

  // Items that need more wear (highest cost per wear with price)
  const needsMoreWear = useMemo(() => {
    return [...itemsWithCPW].reverse().slice(0, 5);
  }, [itemsWithCPW]);

  // Items without price
  const itemsWithoutPrice = useMemo(() => {
    return items.filter(item => !item.purchase_price).slice(0, 5);
  }, [items]);

  // Total invested
  const totalInvested = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
  }, [items]);

  // Average cost per wear
  const avgCostPerWear = useMemo(() => {
    if (itemsWithCPW.length === 0) return 0;
    const totalCPW = itemsWithCPW.reduce((sum, item) => sum + item.costPerWear, 0);
    return totalCPW / itemsWithCPW.length;
  }, [itemsWithCPW]);

  // Get suggestions based on wardrobe gaps
  const relevantSuggestions = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    items.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    // Find categories with fewer items
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    const suggestions: BrandSuggestion[] = [];
    sortedCategories.forEach(cat => {
      const catSuggestions = brandSuggestions[cat] || brandSuggestions.top;
      suggestions.push(...catSuggestions);
    });

    return suggestions.slice(0, 8);
  }, [items]);

  const handleSavePrice = async (itemId: string) => {
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) {
      toast.error('Veuillez entrer un prix valide');
      return;
    }

    try {
      await updateItem(itemId, { purchase_price: price } as any);
      toast.success('Prix ajouté');
      setEditingId(null);
      setPriceInput('');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  };

  if (items.length === 0) {
    return (
      <Card className="p-6 text-center border-dashed">
        <DollarSign className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">{t.analytics?.noData || 'No data available'}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-primary" />
        {t.costPerWear?.title || 'Cost Per Wear'}
      </h3>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-primary">{formatPrice(totalInvested)}</p>
          <p className="text-xs text-muted-foreground">{t.costPerWear?.totalInvested || 'Total Invested'}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-primary">{formatPrice(avgCostPerWear)}</p>
          <p className="text-xs text-muted-foreground">{t.costPerWear?.avgCostPerWear || 'Avg Cost/Wear'}</p>
        </Card>
      </div>

      {/* Best Value Items */}
      {bestValueItems.length > 0 && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <h4 className="font-medium text-sm">{t.costPerWear?.bestValue || 'Best Value Items'}</h4>
          </div>
          <ScrollArea className="h-[120px]">
            <div className="space-y-2">
              {bestValueItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">#{idx + 1}</span>
                  <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm truncate flex-1">{item.name || t.categoryLabels[item.category]}</span>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    {formatPrice(item.costPerWear)}{t.costPerWear?.perWear || '/wear'}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Needs More Wear */}
      {needsMoreWear.length > 0 && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-orange-500" />
            <h4 className="font-medium text-sm">{t.costPerWear?.needsWear || 'Needs More Wear'}</h4>
          </div>
          <ScrollArea className="h-[120px]">
            <div className="space-y-2">
              {needsMoreWear.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm truncate flex-1">{item.name || t.categoryLabels[item.category]}</span>
                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                    {formatPrice(item.costPerWear)}{t.costPerWear?.perWear || '/wear'}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Items without price - add price option */}
      {itemsWithoutPrice.length > 0 && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">{t.costPerWear?.noPrice || 'No price'}</h4>
          </div>
          <ScrollArea className="h-[100px]">
            <div className="space-y-2">
              {itemsWithoutPrice.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm truncate flex-1">{item.name || t.categoryLabels[item.category]}</span>
                  {editingId === item.id ? (
                    <div className="flex gap-1">
                      <Input
                        type="number"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        className="w-20 h-7 text-xs"
                        placeholder="€"
                      />
                      <Button size="sm" className="h-7 text-xs" onClick={() => handleSavePrice(item.id)}>
                        OK
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        setEditingId(item.id);
                        setPriceInput('');
                      }}
                    >
                      + {t.costPerWear?.addPrice || 'Add price'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      {/* Brand Suggestions */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-sm">{t.brandSuggestions?.title || 'Recommended Shopping'}</h4>
        </div>
        
        {/* High-End Brands */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Crown className="w-3 h-3 text-amber-500" />
            <span className="text-xs font-medium text-muted-foreground">{t.brandSuggestions?.highEnd || 'High-End'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {relevantSuggestions
              .filter(b => b.type === 'highEnd')
              .slice(0, 4)
              .map((brand, idx) => (
                <a
                  key={idx}
                  href={brand.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
                >
                  <span className="text-lg">{brand.logo}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{brand.name}</p>
                    <p className="text-[10px] text-muted-foreground">{brand.priceRange}</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </a>
              ))}
          </div>
        </div>

        {/* Fast Fashion Brands */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">{t.brandSuggestions?.fastFashion || 'Fast Fashion'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {relevantSuggestions
              .filter(b => b.type === 'fastFashion')
              .slice(0, 4)
              .map((brand, idx) => (
                <a
                  key={idx}
                  href={brand.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
                >
                  <span className="text-lg">{brand.logo}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{brand.name}</p>
                    <p className="text-[10px] text-muted-foreground">{brand.priceRange}</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </a>
              ))}
          </div>
        </div>
      </Card>
    </div>
  );
}