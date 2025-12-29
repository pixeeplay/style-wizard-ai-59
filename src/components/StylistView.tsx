import { useState } from 'react';
import { useWardrobe, WardrobeItem } from '@/hooks/useWardrobe';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, RefreshCw, Heart, Shirt, AlertCircle } from 'lucide-react';

// Color harmony rules - colors that work well together
const colorHarmony: Record<string, string[]> = {
  'navy': ['white', 'cream', 'beige', 'gray', 'light blue', 'khaki'],
  'black': ['white', 'gray', 'red', 'cream', 'pink', 'gold'],
  'white': ['navy', 'black', 'blue', 'gray', 'beige', 'any'],
  'blue': ['white', 'cream', 'gray', 'beige', 'navy', 'khaki'],
  'gray': ['white', 'black', 'pink', 'blue', 'navy', 'burgundy'],
  'beige': ['white', 'brown', 'navy', 'burgundy', 'olive', 'cream'],
  'brown': ['white', 'cream', 'beige', 'navy', 'olive', 'tan'],
  'red': ['white', 'black', 'navy', 'gray', 'cream'],
  'green': ['white', 'cream', 'beige', 'brown', 'navy', 'khaki'],
  'pink': ['white', 'gray', 'navy', 'black', 'cream'],
};

function getColorName(hexOrName: string): string {
  // Simple color name extraction
  const lower = hexOrName.toLowerCase();
  if (lower.includes('navy') || lower.includes('bleu marine')) return 'navy';
  if (lower.includes('noir') || lower.includes('black') || lower === '#000000') return 'black';
  if (lower.includes('blanc') || lower.includes('white') || lower === '#ffffff') return 'white';
  if (lower.includes('gris') || lower.includes('gray') || lower.includes('grey')) return 'gray';
  if (lower.includes('beige') || lower.includes('cream') || lower.includes('crème')) return 'beige';
  if (lower.includes('marron') || lower.includes('brown')) return 'brown';
  if (lower.includes('rouge') || lower.includes('red')) return 'red';
  if (lower.includes('vert') || lower.includes('green')) return 'green';
  if (lower.includes('rose') || lower.includes('pink')) return 'pink';
  if (lower.includes('bleu') || lower.includes('blue')) return 'blue';
  return 'neutral';
}

function areColorsCompatible(color1: string, color2: string): boolean {
  const name1 = getColorName(color1);
  const name2 = getColorName(color2);
  
  if (name1 === 'neutral' || name2 === 'neutral') return true;
  if (name1 === name2) return true;
  
  const compatible = colorHarmony[name1] || [];
  return compatible.includes(name2) || compatible.includes('any');
}

export default function StylistView() {
  const { availableItems } = useWardrobe();
  const { toast } = useToast();
  const [outfit, setOutfit] = useState<{ top: WardrobeItem | null; bottom: WardrobeItem | null }>({
    top: null,
    bottom: null,
  });
  const [generating, setGenerating] = useState(false);

  const tops = availableItems.filter(item => 
    ['top', 'dress', 'outerwear'].includes(item.category)
  );
  const bottoms = availableItems.filter(item => 
    ['bottom', 'dress'].includes(item.category)
  );

  const generateOutfit = () => {
    if (tops.length === 0 || bottoms.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Pas assez de vêtements',
        description: 'Ajoutez au moins un haut et un bas à votre dressing',
      });
      return;
    }

    setGenerating(true);

    // Simulate AI thinking
    setTimeout(() => {
      let attempts = 0;
      let selectedTop: WardrobeItem | null = null;
      let selectedBottom: WardrobeItem | null = null;

      // Try to find a color-compatible outfit
      while (attempts < 20) {
        selectedTop = tops[Math.floor(Math.random() * tops.length)];
        selectedBottom = bottoms[Math.floor(Math.random() * bottoms.length)];

        if (areColorsCompatible(selectedTop.color, selectedBottom.color)) {
          break;
        }
        attempts++;
      }

      // If still no match, just pick randomly
      if (!selectedTop) selectedTop = tops[Math.floor(Math.random() * tops.length)];
      if (!selectedBottom) selectedBottom = bottoms[Math.floor(Math.random() * bottoms.length)];

      setOutfit({ top: selectedTop, bottom: selectedBottom });
      setGenerating(false);

      toast({
        title: 'Look généré !',
        description: 'Voici une tenue harmonieuse pour vous',
      });
    }, 1000);
  };

  const categoryLabels: Record<string, string> = {
    top: 'Haut', bottom: 'Bas', dress: 'Robe', outerwear: 'Veste'
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">Styliste AI</h2>
        <p className="text-sm text-muted-foreground">Générez des looks harmonieux</p>
      </div>

      {/* Generated Outfit */}
      {(outfit.top || outfit.bottom) ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {outfit.top && (
              <Card className="overflow-hidden">
                <div className="aspect-square bg-muted">
                  <img 
                    src={outfit.top.image_url} 
                    alt={outfit.top.name || 'Haut'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium truncate">
                    {outfit.top.name || categoryLabels[outfit.top.category]}
                  </p>
                  <Badge variant="secondary" className="text-xs mt-1">Haut</Badge>
                </div>
              </Card>
            )}
            {outfit.bottom && (
              <Card className="overflow-hidden">
                <div className="aspect-square bg-muted">
                  <img 
                    src={outfit.bottom.image_url} 
                    alt={outfit.bottom.name || 'Bas'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium truncate">
                    {outfit.bottom.name || categoryLabels[outfit.bottom.category]}
                  </p>
                  <Badge variant="secondary" className="text-xs mt-1">Bas</Badge>
                </div>
              </Card>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={generateOutfit}
              disabled={generating}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
              Autre look
            </Button>
            <Button className="flex-1 gold-gradient text-primary-foreground">
              <Heart className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center border-dashed">
          {availableItems.length === 0 ? (
            <>
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">Votre dressing est vide</p>
              <p className="text-sm text-muted-foreground">
                Ajoutez des vêtements pour générer des looks
              </p>
            </>
          ) : (
            <>
              <Shirt className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Prêt à découvrir votre look du jour ?
              </p>
              <Button 
                onClick={generateOutfit} 
                className="gold-gradient text-primary-foreground"
                disabled={generating}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generating ? 'Génération...' : 'Générer mon look'}
              </Button>
            </>
          )}
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{tops.length}</p>
          <p className="text-sm text-muted-foreground">Hauts disponibles</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{bottoms.length}</p>
          <p className="text-sm text-muted-foreground">Bas disponibles</p>
        </Card>
      </div>

      {!outfit.top && !outfit.bottom && availableItems.length > 0 && (
        <Button 
          onClick={generateOutfit} 
          className="w-full gold-gradient text-primary-foreground"
          disabled={generating}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {generating ? 'Génération...' : 'Générer mon look du jour'}
        </Button>
      )}
    </div>
  );
}
