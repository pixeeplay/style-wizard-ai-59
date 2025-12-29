import { useOutfits, Outfit } from '@/hooks/useOutfits';
import { useWardrobe } from '@/hooks/useWardrobe';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Trash2, LayoutGrid, User, Camera, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const styleLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  flatlay: { label: 'Flat Lay', icon: <LayoutGrid className="w-3 h-3" /> },
  mannequin: { label: 'Mannequin', icon: <User className="w-3 h-3" /> },
  editorial: { label: 'Éditorial', icon: <Camera className="w-3 h-3" /> },
};

export default function OutfitGallery() {
  const { favoriteOutfits, loading, toggleFavorite, deleteOutfit } = useOutfits();
  const { items: wardrobeItems } = useWardrobe();

  const getItemImage = (itemId: string) => {
    const item = wardrobeItems.find(i => i.id === itemId);
    return item?.image_url;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          Looks favoris
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map(i => (
            <Card key={i} className="aspect-square animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (favoriteOutfits.length === 0) {
    return (
      <Card className="p-6 text-center border-dashed">
        <Heart className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          Aucun look sauvegardé
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Générez un look et sauvegardez-le pour le retrouver ici
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Heart className="w-4 h-4 text-primary fill-primary" />
        Looks favoris ({favoriteOutfits.length})
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {favoriteOutfits.map((outfit) => (
          <OutfitCard
            key={outfit.id}
            outfit={outfit}
            getItemImage={getItemImage}
            formatDate={formatDate}
            onToggleFavorite={() => toggleFavorite(outfit.id)}
            onDelete={() => deleteOutfit(outfit.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface OutfitCardProps {
  outfit: Outfit;
  getItemImage: (id: string) => string | undefined;
  formatDate: (date: string) => string;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

function OutfitCard({ outfit, getItemImage, formatDate, onToggleFavorite, onDelete }: OutfitCardProps) {
  const styleInfo = styleLabels[outfit.visualization_style || 'mannequin'];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden cursor-pointer hover:ring-2 ring-primary/50 transition-all">
          <div className="aspect-square bg-muted relative">
            {outfit.try_on_image_url ? (
              <img
                src={outfit.try_on_image_url}
                alt={outfit.name || 'Look'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full grid grid-cols-2 gap-0.5 p-0.5">
                {outfit.items.slice(0, 2).map((itemId, idx) => {
                  const img = getItemImage(itemId);
                  return img ? (
                    <img
                      key={idx}
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div key={idx} className="bg-muted-foreground/10" />
                  );
                })}
              </div>
            )}
            <div className="absolute top-1 right-1">
              <Badge variant="secondary" className="text-xs gap-1 bg-background/80 backdrop-blur">
                {styleInfo.icon}
                <span className="hidden sm:inline">{styleInfo.label}</span>
              </Badge>
            </div>
            <div className="absolute bottom-1 left-1">
              <Badge variant="secondary" className="text-xs gap-1 bg-background/80 backdrop-blur">
                <Calendar className="w-3 h-3" />
                {formatDate(outfit.created_at)}
              </Badge>
            </div>
          </div>
          <div className="p-2">
            <p className="text-sm font-medium truncate">{outfit.name}</p>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{outfit.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {outfit.try_on_image_url && (
            <div className="aspect-square bg-muted rounded-xl overflow-hidden">
              <img
                src={outfit.try_on_image_url}
                alt={outfit.name || 'Look'}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {styleInfo.icon}
            <span>Style: {styleInfo.label}</span>
            <span className="ml-auto">
              Créé le {formatDate(outfit.created_at)}
            </span>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onToggleFavorite}
            >
              <Heart className={`w-4 h-4 mr-2 ${outfit.is_favorite ? 'fill-primary text-primary' : ''}`} />
              {outfit.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
