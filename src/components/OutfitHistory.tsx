import { useTranslation } from '@/hooks/useTranslation';
import { useOutfits, Outfit } from '@/hooks/useOutfits';
import { useWardrobe, WardrobeItem } from '@/hooks/useWardrobe';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Calendar, Play, Trash2, LayoutGrid, User, Camera, Heart } from 'lucide-react';

interface OutfitHistoryProps {
  onReplayOutfit: (top: WardrobeItem, bottom: WardrobeItem) => void;
}

export default function OutfitHistory({ onReplayOutfit }: OutfitHistoryProps) {
  const { t } = useTranslation();
  const { outfits, loading, deleteOutfit, toggleFavorite } = useOutfits();
  const { items: wardrobeItems } = useWardrobe();

  const styleLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    flatlay: { label: t.stylist.flatLay, icon: <LayoutGrid className="w-3 h-3" /> },
    mannequin: { label: t.stylist.mannequin, icon: <User className="w-3 h-3" /> },
    editorial: { label: t.stylist.editorial, icon: <Camera className="w-3 h-3" /> },
  };

  const getItem = (itemId: string) => wardrobeItems.find(i => i.id === itemId);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReplay = (outfit: Outfit) => {
    const top = getItem(outfit.items[0]);
    const bottom = getItem(outfit.items[1]);
    if (top && bottom) {
      onReplayOutfit(top, bottom);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          {t.outfitHistory.title}
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-20 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (outfits.length === 0) {
    return (
      <Card className="p-6 text-center border-dashed">
        <History className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">{t.outfitHistory.noLooks}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <History className="w-4 h-4 text-primary" />
        {t.outfitHistory.title} ({t.outfitHistory.looks(outfits.length)})
      </h3>

      <ScrollArea className="h-[300px]">
        <div className="space-y-2 pr-3">
          {outfits.map((outfit) => {
            const styleInfo = styleLabels[outfit.visualization_style || 'mannequin'];
            const canReplay = outfit.items.every(id => getItem(id));

            return (
              <Card key={outfit.id} className="p-3 flex gap-3">
                {outfit.try_on_image_url ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={outfit.try_on_image_url}
                      alt={outfit.name || 'Look'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 grid grid-cols-2 gap-0.5">
                    {outfit.items.slice(0, 2).map((itemId, idx) => {
                      const item = getItem(itemId);
                      return item?.image_url ? (
                        <img
                          key={idx}
                          src={item.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div key={idx} className="bg-muted-foreground/10" />
                      );
                    })}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{outfit.name}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(outfit.created_at)}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs gap-1">
                      {styleInfo.icon}
                      {styleInfo.label}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className={`h-8 w-8 ${outfit.is_favorite ? 'text-primary' : ''}`}
                    onClick={() => toggleFavorite(outfit.id)}
                    title={outfit.is_favorite ? t.outfitHistory.removeFromFavorites : t.outfitHistory.addToFavorites}
                  >
                    <Heart className={`w-4 h-4 ${outfit.is_favorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    disabled={!canReplay}
                    onClick={() => handleReplay(outfit)}
                    title={canReplay ? t.outfitHistory.replayLook : t.outfitHistory.itemsUnavailable}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteOutfit(outfit.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
