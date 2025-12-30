import { useEffect, useState } from 'react';
import { useWardrobe, WardrobeItem } from '@/hooks/useWardrobe';
import { useProfile } from '@/hooks/useProfile';
import { useOutfits, TryOnImages } from '@/hooks/useOutfits';
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
import { Sparkles, RefreshCw, Heart, Shirt, AlertCircle, Wand2, Loader2, Download, LayoutGrid, User, Camera, Check, Watch, Cloud, MapPin, Brain, Filter, Images } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import OutfitGallery from './OutfitGallery';
import OutfitHistory from './OutfitHistory';
import OutfitCalendar from './OutfitCalendar';
import TryOnGallery from './TryOnGallery';
import WardrobeAnalytics from './WardrobeAnalytics';
import OutfitRecommendations from './OutfitRecommendations';
import WeeklyPlanner from './WeeklyPlanner';
import LaundryTracker from './LaundryTracker';
import CapsuleWardrobe from './CapsuleWardrobe';
import CostPerWearAnalytics from './CostPerWearAnalytics';

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
  const { saveOutfit, createOutfit, updateOutfitImages } = useOutfits();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [outfit, setOutfit] = useState<{ top: WardrobeItem | null; bottom: WardrobeItem | null }>({
    top: null,
    bottom: null,
  });
  const [currentOutfitId, setCurrentOutfitId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatingTryOn, setGeneratingTryOn] = useState(false);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [tryOnDialogOpen, setTryOnDialogOpen] = useState(false);

  // Multi-style generation state
  const [allStyleImages, setAllStyleImages] = useState<TryOnImages>({
    flatlay: null,
    mannequin: null,
    editorial: null,
  });
  const [generatingStyles, setGeneratingStyles] = useState({
    flatlay: false,
    mannequin: false,
    editorial: false,
  });
  const [primaryStyle, setPrimaryStyle] = useState<keyof TryOnImages>('mannequin');
  const [generateAllMode, setGenerateAllMode] = useState(false);

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
  
  // Season/occasion filters for smart generation
  const [seasonFilter, setSeasonFilter] = useState<string>('all');
  const [occasionFilter, setOccasionFilter] = useState<string>('all');

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
  
  // Filtered items for smart generation based on season/occasion
  const filteredTops = tops.filter(item => {
    const matchSeason = seasonFilter === 'all' || item.season === seasonFilter || item.season === 'all';
    const matchOccasion = occasionFilter === 'all' || item.style === occasionFilter;
    return matchSeason && matchOccasion;
  });
  
  const filteredBottoms = bottoms.filter(item => {
    const matchSeason = seasonFilter === 'all' || item.season === seasonFilter || item.season === 'all';
    const matchOccasion = occasionFilter === 'all' || item.style === occasionFilter;
    return matchSeason && matchOccasion;
  });

  // Generate smart look via AI
  const generateSmartLook = async () => {
    // Use filtered items when filters are active
    const itemsToUse = (seasonFilter !== 'all' || occasionFilter !== 'all') 
      ? availableItems.filter(item => {
          const matchSeason = seasonFilter === 'all' || item.season === seasonFilter || item.season === 'all';
          const matchOccasion = occasionFilter === 'all' || item.style === occasionFilter;
          return matchSeason && matchOccasion;
        })
      : availableItems;
    
    const filteredTopsForGen = itemsToUse.filter(item => ['top', 'dress', 'outerwear'].includes(item.category));
    const filteredBottomsForGen = itemsToUse.filter(item => ['bottom', 'dress'].includes(item.category));
    
    if (filteredTopsForGen.length === 0 || filteredBottomsForGen.length === 0) {
      toast({ variant: 'destructive', title: t.stylist.notEnoughItems, description: t.stylist.addTopsAndBottoms });
      return;
    }

    setGeneratingSmart(true);
    setTryOnImage(null);
    setSaved(false);

    try {
      const wardrobeItems = itemsToUse.map(i => ({
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

  // Generate a single style
  const generateSingleStyle = async (style: VisualizationStyle): Promise<string | null> => {
    if (!outfit.top || !outfit.bottom) return null;

    try {
      const { data, error } = await supabase.functions.invoke('virtual-tryon', {
        body: {
          userAvatarUrl: profile?.avatar_url || null,
          topImageUrl: outfit.top.image_url,
          bottomImageUrl: outfit.bottom.image_url,
          userDescription: profile?.morphology ? `Body type: ${profile.morphology}` : null,
          visualizationStyle: style,
          includeAccessories,
          weather: weather || null,
          city: city || null,
        },
      });

      if (error) throw error;
      return data?.imageUrl || null;
    } catch (error) {
      console.error(`Error generating ${style}:`, error);
      return null;
    }
  };

  // Generate all 3 styles in parallel
  const generateAllStyles = async () => {
    if (!outfit.top || !outfit.bottom) {
      toast({
        variant: 'destructive',
        title: t.stylist.generateLookFirst,
        description: t.stylist.clickGenerateBefore,
      });
      return;
    }

    setTryOnDialogOpen(true);
    setGenerateAllMode(true);
    setGeneratingStyles({ flatlay: true, mannequin: true, editorial: true });
    setAllStyleImages({ flatlay: null, mannequin: null, editorial: null });

    const styles: VisualizationStyle[] = ['flatlay', 'mannequin', 'editorial'];
    
    // Generate all styles in parallel
    const results = await Promise.all(
      styles.map(async (style) => {
        const result = await generateSingleStyle(style);
        setGeneratingStyles((prev) => ({ ...prev, [style]: false }));
        setAllStyleImages((prev) => ({ ...prev, [style]: result }));
        return { style, result };
      })
    );

    // Set the first successful result as primary
    const firstSuccess = results.find((r) => r.result);
    if (firstSuccess) {
      setPrimaryStyle(firstSuccess.style as keyof TryOnImages);
      setTryOnImage(firstSuccess.result);
    }

    toast({
      title: t.stylist.imageGenerated,
      description: t.stylist.lookVisualized,
    });
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
    setGenerateAllMode(false);

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
          
          {/* Season/Occasion filters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Filter className="w-3 h-3" />
                {t.stylist.filterBySeason}
              </Label>
              <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t.stylist.allSeasons} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.stylist.allSeasons}</SelectItem>
                  <SelectItem value="spring">{t.seasons.spring}</SelectItem>
                  <SelectItem value="summer">{t.seasons.summer}</SelectItem>
                  <SelectItem value="fall">{t.seasons.fall}</SelectItem>
                  <SelectItem value="winter">{t.seasons.winter}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Filter className="w-3 h-3" />
                {t.stylist.filterByOccasion}
              </Label>
              <Select value={occasionFilter} onValueChange={setOccasionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t.stylist.allOccasions} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.stylist.allOccasions}</SelectItem>
                  <SelectItem value="casual">{t.styles.casual}</SelectItem>
                  <SelectItem value="formal">{t.styles.formal}</SelectItem>
                  <SelectItem value="business">{t.styles.business}</SelectItem>
                  <SelectItem value="sport">{t.styles.sport}</SelectItem>
                  <SelectItem value="evening">{t.styles.evening}</SelectItem>
                  <SelectItem value="vacation">{t.styles.vacation}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Show filtered count */}
          {(seasonFilter !== 'all' || occasionFilter !== 'all') && (
            <p className="text-xs text-muted-foreground">
              {filteredTops.length} {t.stylist.topsAvailable}, {filteredBottoms.length} {t.stylist.bottomsAvailable}
            </p>
          )}
          
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
            disabled={generatingSmart || (seasonFilter !== 'all' || occasionFilter !== 'all' ? (filteredTops.length === 0 || filteredBottoms.length === 0) : (tops.length === 0 || bottoms.length === 0))}
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

        <div className="flex gap-2">
          <Button
            onClick={generateVirtualTryOn}
            className="flex-1 gold-gradient text-primary-foreground"
            disabled={!outfit.top || !outfit.bottom || generatingTryOn}
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
          <Button
            onClick={generateAllStyles}
            variant="outline"
            className="gap-2"
            disabled={!outfit.top || !outfit.bottom || generatingStyles.flatlay || generatingStyles.mannequin || generatingStyles.editorial}
          >
            <Images className="w-4 h-4" />
            <span className="hidden sm:inline">3 styles</span>
          </Button>
        </div>

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

      {/* Laundry Tracker */}
      <LaundryTracker />

      {/* Capsule Wardrobe */}
      <CapsuleWardrobe />

      {/* Outfit Recommendations */}
      <OutfitRecommendations onSelectOutfit={handleReplayOutfit} />

      {/* Weekly Planner */}
      <WeeklyPlanner />

      {/* Outfit Calendar */}
      <OutfitCalendar />

      {/* Outfit History */}
      <OutfitHistory onReplayOutfit={handleReplayOutfit} />

      {/* Wardrobe Analytics */}
      <WardrobeAnalytics />

      {/* Cost Per Wear Analytics */}
      <CostPerWearAnalytics />

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

            {generateAllMode ? (
              <TryOnGallery
                images={allStyleImages}
                generating={generatingStyles}
                onSelectPrimary={(style) => {
                  setPrimaryStyle(style);
                  if (allStyleImages[style]) {
                    setTryOnImage(allStyleImages[style]);
                  }
                }}
                primaryStyle={primaryStyle}
              />
            ) : generatingTryOn ? (
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
