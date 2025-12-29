import { useState } from 'react';
import { useWardrobe, WardrobeItem } from '@/hooks/useWardrobe';
import { useProfile } from '@/hooks/useProfile';
import { useOutfits } from '@/hooks/useOutfits';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, RefreshCw, Heart, Shirt, AlertCircle, Wand2, Loader2, Download, LayoutGrid, User, Camera, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import OutfitGallery from './OutfitGallery';

type VisualizationStyle = 'flatlay' | 'mannequin' | 'editorial';
// Color harmony rules
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
  const { profile } = useProfile();
  const { saveOutfit } = useOutfits();
  const { toast } = useToast();
  const [outfit, setOutfit] = useState<{ top: WardrobeItem | null; bottom: WardrobeItem | null }>({
    top: null,
    bottom: null,
  });
  const [generating, setGenerating] = useState(false);
  const [generatingTryOn, setGeneratingTryOn] = useState(false);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [tryOnDialogOpen, setTryOnDialogOpen] = useState(false);
  const [visualizationStyle, setVisualizationStyle] = useState<VisualizationStyle>('mannequin');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    setTryOnImage(null);
    setSaved(false);

    setTimeout(() => {
      let attempts = 0;
      let selectedTop: WardrobeItem | null = null;
      let selectedBottom: WardrobeItem | null = null;

      while (attempts < 20) {
        selectedTop = tops[Math.floor(Math.random() * tops.length)];
        selectedBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
        if (areColorsCompatible(selectedTop.color, selectedBottom.color)) break;
        attempts++;
      }

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

  const generateVirtualTryOn = async () => {
    if (!outfit.top || !outfit.bottom) {
      toast({
        variant: 'destructive',
        title: 'Générez d\'abord un look',
        description: 'Cliquez sur "Générer mon look" avant de visualiser',
      });
      return;
    }

    setGeneratingTryOn(true);
    setTryOnDialogOpen(true);

    try {
      const { data, error } = await supabase.functions.invoke('virtual-tryon', {
        body: {
          userAvatarUrl: profile?.avatar_url || null,
          topImageUrl: outfit.top.image_url,
          bottomImageUrl: outfit.bottom.image_url,
          userDescription: profile?.morphology ? `Body type: ${profile.morphology}` : null,
          visualizationStyle,
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setTryOnImage(data.imageUrl);
        toast({
          title: 'Image générée !',
          description: 'Voici votre look visualisé',
        });
      } else {
        throw new Error(data?.error || 'No image generated');
      }
    } catch (error) {
      console.error('Virtual try-on error:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de génération',
        description: error instanceof Error ? error.message : 'Impossible de générer l\'image',
      });
      setTryOnDialogOpen(false);
    } finally {
      setGeneratingTryOn(false);
    }
  };

  const handleSaveOutfit = async () => {
    if (!outfit.top || !outfit.bottom) return;
    
    setSaving(true);
    const items = [outfit.top.id, outfit.bottom.id];
    const result = await saveOutfit(items, tryOnImage, visualizationStyle);
    setSaving(false);
    
    if (result) {
      setSaved(true);
      toast({
        title: 'Look sauvegardé !',
        description: 'Retrouvez-le dans vos favoris',
      });
    }
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

          {/* Virtual Try-On Button */}
          <Button
            onClick={generateVirtualTryOn}
            className="w-full gold-gradient text-primary-foreground"
            disabled={generatingTryOn}
          >
            {generatingTryOn ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Visualiser le look (AI)
              </>
            )}
          </Button>

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
            <Button 
              className="flex-1" 
              variant={saved ? "secondary" : "default"}
              onClick={handleSaveOutfit}
              disabled={saving || saved}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Heart className="w-4 h-4 mr-2" />
              )}
              {saved ? 'Sauvegardé' : 'Sauvegarder'}
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

      {/* Saved Outfits Gallery */}
      <OutfitGallery />

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

      {/* Virtual Try-On Dialog */}
      <Dialog open={tryOnDialogOpen} onOpenChange={setTryOnDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              Virtual Try-On
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Style selector */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Style de visualisation</p>
              <ToggleGroup 
                type="single" 
                value={visualizationStyle} 
                onValueChange={(value) => value && setVisualizationStyle(value as VisualizationStyle)}
                className="w-full justify-start"
              >
                <ToggleGroupItem value="flatlay" className="flex-1 gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Flat Lay</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="mannequin" className="flex-1 gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Mannequin</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="editorial" className="flex-1 gap-2">
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">Éditorial</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {generatingTryOn ? (
              <div className="aspect-square bg-muted rounded-xl flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full gold-gradient animate-pulse" />
                  <Sparkles className="w-8 h-8 text-primary-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="mt-4 text-muted-foreground">L'IA génère votre look...</p>
                <p className="text-sm text-muted-foreground">Style: {visualizationStyle === 'flatlay' ? 'Flat Lay' : visualizationStyle === 'mannequin' ? 'Mannequin' : 'Éditorial'}</p>
              </div>
            ) : tryOnImage ? (
              <div className="space-y-3">
                <div className="aspect-square bg-muted rounded-xl overflow-hidden">
                  <img 
                    src={tryOnImage} 
                    alt="Virtual Try-On" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = tryOnImage;
                      link.download = 'smartstyle-look.png';
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                  <Button
                    className="flex-1 gold-gradient text-primary-foreground"
                    onClick={generateVirtualTryOn}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Régénérer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
                <p className="text-muted-foreground">Erreur de génération</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
