import { useEffect, useState } from 'react';
import { useWardrobe, WardrobeItem } from '@/hooks/useWardrobe';
import { useProfile } from '@/hooks/useProfile';
import { useOutfits } from '@/hooks/useOutfits';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, RefreshCw, Heart, Shirt, AlertCircle, Wand2, Loader2, Download, LayoutGrid, User, Camera, Check, Watch, Cloud, MapPin, Brain } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import OutfitGallery from './OutfitGallery';
import OutfitHistory from './OutfitHistory';

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
  const { saveOutfit, createOutfit } = useOutfits();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [outfit, setOutfit] = useState<{ top: WardrobeItem | null; bottom: WardrobeItem | null }>({
    top: null,
    bottom: null,
  });
  const [generating, setGenerating] = useState(false);
  const [generatingTryOn, setGeneratingTryOn] = useState(false);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [tryOnDialogOpen, setTryOnDialogOpen] = useState(false);

  // Persisted UI preferences
  const [visualizationStyle, setVisualizationStyle] = useState<VisualizationStyle>(() => {
    const v = localStorage.getItem('smartstyle.visualizationStyle') as VisualizationStyle | null;
    return v || 'mannequin';
  });
  const [includeAccessories, setIncludeAccessories] = useState<boolean>(() => {
    const v = localStorage.getItem('smartstyle.includeAccessories');
    return v ? v === 'true' : true;
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Smart look state
  const [smartMode, setSmartMode] = useState(false);
  const [moodPrompt, setMoodPrompt] = useState('');
  const [city, setCity] = useState(() => localStorage.getItem('smartstyle.city') || '');
  const [weather, setWeather] = useState<{ avgTemp: number; conditions: string[]; recommendation: string } | null>(null);
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [generatingSmart, setGeneratingSmart] = useState(false);

  useEffect(() => {
    localStorage.setItem('smartstyle.visualizationStyle', visualizationStyle);
  }, [visualizationStyle]);

  useEffect(() => {
    localStorage.setItem('smartstyle.includeAccessories', String(includeAccessories));
  }, [includeAccessories]);

  useEffect(() => {
    if (city) localStorage.setItem('smartstyle.city', city);
  }, [city]);

  // Fetch weather when city changes
  useEffect(() => {
    if (!city || city.length < 2) {
      setWeather(null);
      return;
    }
    const timeout = setTimeout(async () => {
      setFetchingWeather(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-weather', {
          body: { destination: city, departureDate: new Date().toISOString(), days: 1 },
        });
        if (error) throw error;
        if (data?.weather) {
          setWeather(data.weather);
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
        setWeather(null);
      } finally {
        setFetchingWeather(false);
      }
    }, 600);
    return () => clearTimeout(timeout);
  }, [city]);

  const handleReplayOutfit = (top: WardrobeItem, bottom: WardrobeItem) => {
    setOutfit({ top, bottom });
    setTryOnImage(null);
    setSaved(false);
    toast({
      title: t.stylist.lookReloaded,
      description: t.stylist.canNowVisualize,
    });
  };

  const tops = availableItems.filter(item =>
    ['top', 'dress', 'outerwear'].includes(item.category)
  );
  const bottoms = availableItems.filter(item => 
    ['bottom', 'dress'].includes(item.category)
  );

  // Generate smart look via AI
  const generateSmartLook = async () => {
    if (tops.length === 0 || bottoms.length === 0) {
      toast({ variant: 'destructive', title: t.stylist.notEnoughItems, description: t.stylist.addTopsAndBottoms });
      return;
    }

    setGeneratingSmart(true);
    setTryOnImage(null);
    setSaved(false);

    try {
      const wardrobeItems = availableItems.map(i => ({
        id: i.id,
        category: i.category,
        color: i.color,
        style: i.style,
        season: i.season,
        name: i.name,
      }));

      const { data, error } = await supabase.functions.invoke('generate-smart-look', {
        body: { prompt: moodPrompt, weather, wardrobeItems },
      });

      if (error) throw error;

      const selectedTop = availableItems.find(i => i.id === data.topId);
      const selectedBottom = availableItems.find(i => i.id === data.bottomId);

      if (selectedTop && selectedBottom) {
        setOutfit({ top: selectedTop, bottom: selectedBottom });

        await createOutfit({
          items: [selectedTop.id, selectedBottom.id],
          visualizationStyle,
          isFavorite: false,
          name: `Smart Look ${new Date().toLocaleDateString()}`,
        });

        toast({
          title: t.stylist.smartLookGenerated,
          description: data.reasoning || t.stylist.basedOnMood,
        });
      } else {
        throw new Error('Invalid item IDs returned');
      }
    } catch (err) {
      console.error('Smart look error:', err);
      toast({ variant: 'destructive', title: t.stylist.generationError, description: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setGeneratingSmart(false);
    }
  };

  const generateOutfit = () => {
    if (tops.length === 0 || bottoms.length === 0) {
      toast({
        variant: 'destructive',
        title: t.stylist.notEnoughItems,
        description: t.stylist.addTopsAndBottoms,
      });
      return;
    }

    setGenerating(true);
    setTryOnImage(null);
    setSaved(false);

    setTimeout(async () => {
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

      // Persist the generated look to backend history (not favorite by default)
      await createOutfit({
        items: [selectedTop.id, selectedBottom.id],
        visualizationStyle,
        isFavorite: false,
        name: `Look ${new Date().toLocaleDateString('en-US')}`,
      });

      toast({
        title: t.stylist.lookGenerated,
        description: t.stylist.harmoniousOutfit,
      });
    }, 1000);
  };

  const generateVirtualTryOn = async () => {
    if (!outfit.top || !outfit.bottom) {
      toast({
        variant: 'destructive',
        title: t.stylist.generateLookFirst,
        description: t.stylist.clickGenerateBefore,
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
          includeAccessories,
          weather: weather || null,
          city: city || null,
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setTryOnImage(data.imageUrl);
        toast({
          title: t.stylist.imageGenerated,
          description: t.stylist.lookVisualized,
        });
      } else {
        throw new Error(data?.error || 'No image generated');
      }
    } catch (error) {
      console.error('Virtual try-on error:', error);
      toast({
        variant: 'destructive',
        title: t.stylist.generationError,
        description: error instanceof Error ? error.message : t.stylist.unableToGenerate,
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
        title: t.stylist.lookSaved,
        description: t.stylist.findInFavorites,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">{t.stylist.title}</h2>
        <p className="text-sm text-muted-foreground">{t.stylist.subtitle}</p>
      </div>

      {/* Mode toggle: Random vs Smart */}
      <div className="flex gap-2">
        <Button
          variant={!smartMode ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setSmartMode(false)}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {t.stylist.generateLook}
        </Button>
        <Button
          variant={smartMode ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setSmartMode(true)}
        >
          <Brain className="w-4 h-4 mr-2" />
          {t.stylist.smartLook}
        </Button>
      </div>

      {/* Smart look form */}
      {smartMode && (
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>{t.stylist.enterCity}</Label>
            <div className="flex gap-2">
              <MapPin className="w-4 h-4 mt-3 text-muted-foreground" />
              <Input
                placeholder={t.stylist.cityPlaceholder}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            {fetchingWeather && <p className="text-xs text-muted-foreground">{t.stylist.fetchingWeather}</p>}
            {weather && (
              <div className="flex items-center gap-2 text-sm">
                <Cloud className="w-4 h-4 text-primary" />
                <span>{weather.avgTemp}°C - {weather.conditions.join(', ')}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>{t.stylist.yourMood}</Label>
            <Textarea
              placeholder={t.stylist.moodPlaceholder}
              value={moodPrompt}
              onChange={(e) => setMoodPrompt(e.target.value)}
              rows={2}
            />
          </div>
          <Button
            onClick={generateSmartLook}
            disabled={generatingSmart || tops.length === 0 || bottoms.length === 0}
            className="w-full gold-gradient text-primary-foreground"
          >
            {generatingSmart ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
            {generatingSmart ? t.stylist.generating : t.stylist.generateSmartLook}
          </Button>
        </Card>
      )}

      {/* Generated Outfit */}
      {(outfit.top || outfit.bottom) ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {outfit.top && (
              <Card className="overflow-hidden">
                <div className="aspect-square bg-muted">
                  <img 
                    src={outfit.top.image_url} 
                    alt={outfit.top.name || t.categoryLabels.top}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium truncate">
                    {outfit.top.name || t.categoryLabels[outfit.top.category as keyof typeof t.categoryLabels]}
                  </p>
                  <Badge variant="secondary" className="text-xs mt-1">{t.categoryLabels.top}</Badge>
                </div>
              </Card>
            )}
            {outfit.bottom && (
              <Card className="overflow-hidden">
                <div className="aspect-square bg-muted">
                  <img 
                    src={outfit.bottom.image_url} 
                    alt={outfit.bottom.name || t.categoryLabels.bottom}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium truncate">
                    {outfit.bottom.name || t.categoryLabels[outfit.bottom.category as keyof typeof t.categoryLabels]}
                  </p>
                  <Badge variant="secondary" className="text-xs mt-1">{t.categoryLabels.bottom}</Badge>
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
                {t.stylist.generatingImage}
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                {t.stylist.visualize}
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
              {t.stylist.anotherLook}
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
              {saved ? t.common.saved : t.stylist.saveLook}
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center border-dashed">
          {availableItems.length === 0 ? (
            <>
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">{t.stylist.wardrobeEmpty}</p>
              <p className="text-sm text-muted-foreground">
                {t.stylist.addItemsFirst}
              </p>
            </>
          ) : (
            <>
              <Shirt className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                {t.stylist.readyToDiscover}
              </p>
              <Button 
                onClick={generateOutfit} 
                className="gold-gradient text-primary-foreground"
                disabled={generating}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generating ? t.stylist.generating : t.stylist.generateLook}
              </Button>
            </>
          )}
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{tops.length}</p>
          <p className="text-sm text-muted-foreground">{t.stylist.topsAvailable}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{bottoms.length}</p>
          <p className="text-sm text-muted-foreground">{t.stylist.bottomsAvailable}</p>
        </Card>
      </div>

      {/* Outfit History */}
      <OutfitHistory onReplayOutfit={handleReplayOutfit} />

      {/* Saved Outfits Gallery */}
      <OutfitGallery />

      {!outfit.top && !outfit.bottom && availableItems.length > 0 && (
        <Button 
          onClick={generateOutfit} 
          className="w-full gold-gradient text-primary-foreground"
          disabled={generating}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {generating ? t.stylist.generating : t.stylist.generateMyLook}
        </Button>
      )}

      {/* Virtual Try-On Dialog */}
      <Dialog open={tryOnDialogOpen} onOpenChange={setTryOnDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              {t.stylist.virtualTryOn}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Style selector */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t.stylist.visualizationStyle}</p>
              <ToggleGroup 
                type="single" 
                value={visualizationStyle} 
                onValueChange={(value) => value && setVisualizationStyle(value as VisualizationStyle)}
                className="w-full justify-start"
              >
                <ToggleGroupItem value="flatlay" className="flex-1 gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.stylist.flatLay}</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="mannequin" className="flex-1 gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.stylist.mannequin}</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="editorial" className="flex-1 gap-2">
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.stylist.editorial}</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Accessories toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30">
              <div className="flex items-center gap-2">
                <Watch className="w-4 h-4 text-primary" />
                <Label htmlFor="include-accessories" className="text-sm font-medium cursor-pointer">
                  {t.stylist.includeAccessories}
                </Label>
              </div>
              <Switch
                id="include-accessories"
                checked={includeAccessories}
                onCheckedChange={setIncludeAccessories}
              />
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              {includeAccessories 
                ? t.stylist.accessoriesOn 
                : t.stylist.accessoriesOff}
            </p>

            {generatingTryOn ? (
              <div className="aspect-square bg-muted rounded-xl flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full gold-gradient animate-pulse" />
                  <Sparkles className="w-8 h-8 text-primary-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="mt-4 text-muted-foreground">{t.stylist.aiGenerating}</p>
                <p className="text-sm text-muted-foreground">{t.stylist.style}: {visualizationStyle === 'flatlay' ? t.stylist.flatLay : visualizationStyle === 'mannequin' ? t.stylist.mannequin : t.stylist.editorial}</p>
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
                    {t.common.download}
                  </Button>
                  <Button
                    className="flex-1 gold-gradient text-primary-foreground"
                    onClick={generateVirtualTryOn}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t.common.regenerate}
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
