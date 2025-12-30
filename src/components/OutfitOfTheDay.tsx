import { useEffect, useState } from 'react';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useOutfits } from '@/hooks/useOutfits';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Sun, Cloud, MapPin, Sparkles, Loader2, X, Calendar, ThumbsUp } from 'lucide-react';

const STORAGE_KEY = 'smartstyle.ootdLastShown';
const CITY_KEY = 'smartstyle.city';

type Occasion = 'casual' | 'formal' | 'business' | 'sport' | 'evening' | 'vacation';

export default function OutfitOfTheDay() {
  const { availableItems } = useWardrobe();
  const { createOutfit } = useOutfits();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [city, setCity] = useState(() => localStorage.getItem(CITY_KEY) || '');
  const [occasion, setOccasion] = useState<Occasion>('casual');
  const [weather, setWeather] = useState<{ avgTemp: number; conditions: string[] } | null>(null);
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [outfit, setOutfit] = useState<{ topId: string; bottomId: string; reasoning: string } | null>(null);
  const [step, setStep] = useState<'setup' | 'result'>('setup');

  // Check if we should show the notification (once per day)
  useEffect(() => {
    const lastShown = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toDateString();
    
    // Only show if we haven't shown today and user has enough items
    const tops = availableItems.filter(item => ['top', 'dress', 'outerwear'].includes(item.category));
    const bottoms = availableItems.filter(item => ['bottom', 'dress'].includes(item.category));
    
    if (lastShown !== today && tops.length > 0 && bottoms.length > 0) {
      // Small delay to let the app load
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [availableItems]);

  // Fetch weather when city changes
  useEffect(() => {
    if (!city || city.length < 2 || !open) return;
    
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
      } finally {
        setFetchingWeather(false);
      }
    }, 600);
    return () => clearTimeout(timeout);
  }, [city, open]);

  const handleGenerate = async () => {
    const tops = availableItems.filter(item => ['top', 'dress', 'outerwear'].includes(item.category));
    const bottoms = availableItems.filter(item => ['bottom', 'dress'].includes(item.category));

    if (tops.length === 0 || bottoms.length === 0) {
      toast({ variant: 'destructive', title: t.stylist.notEnoughItems });
      return;
    }

    setGenerating(true);

    try {
      // Filter by occasion
      const filteredItems = availableItems.filter(item => {
        return item.style === occasion || !item.style;
      });

      const wardrobeItems = (filteredItems.length > 1 ? filteredItems : availableItems).map(i => ({
        id: i.id,
        category: i.category,
        color: i.color,
        style: i.style,
        season: i.season,
        name: i.name,
      }));

      const prompt = t.ootd.promptTemplate
        .replace('{occasion}', t.styles[occasion])
        .replace('{weather}', weather ? `${weather.avgTemp}°C, ${weather.conditions.join(', ')}` : t.ootd.noWeather);

      const { data, error } = await supabase.functions.invoke('generate-smart-look', {
        body: { prompt, weather, wardrobeItems },
      });

      if (error) throw error;

      setOutfit({
        topId: data.topId,
        bottomId: data.bottomId,
        reasoning: data.reasoning,
      });
      setStep('result');

      // Save to outfit history
      await createOutfit({
        items: [data.topId, data.bottomId],
        visualizationStyle: 'mannequin',
        isFavorite: false,
        name: `${t.ootd.title} - ${new Date().toLocaleDateString()}`,
      });

      // Mark as shown today
      localStorage.setItem(STORAGE_KEY, new Date().toDateString());
      if (city) localStorage.setItem(CITY_KEY, city);

    } catch (err) {
      console.error('OOTD generation error:', err);
      toast({ variant: 'destructive', title: t.stylist.generationError });
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Mark as dismissed for today
    localStorage.setItem(STORAGE_KEY, new Date().toDateString());
  };

  const topItem = outfit ? availableItems.find(i => i.id === outfit.topId) : null;
  const bottomItem = outfit ? availableItems.find(i => i.id === outfit.bottomId) : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-primary" />
            {t.ootd.title}
          </DialogTitle>
          <DialogDescription>
            {step === 'setup' ? t.ootd.description : t.ootd.yourLookReady}
          </DialogDescription>
        </DialogHeader>

        {step === 'setup' ? (
          <div className="space-y-4">
            {/* City input */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {t.ootd.yourCity}
              </Label>
              <Input
                placeholder={t.stylist.cityPlaceholder}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              {fetchingWeather && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {t.stylist.fetchingWeather}
                </p>
              )}
              {weather && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Cloud className="w-4 h-4" />
                  <span>{weather.avgTemp}°C - {weather.conditions.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Occasion selector */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {t.ootd.todayOccasion}
              </Label>
              <Select value={occasion} onValueChange={(v) => setOccasion(v as Occasion)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">{t.styles.casual}</SelectItem>
                  <SelectItem value="formal">{t.styles.formal}</SelectItem>
                  <SelectItem value="business">{t.styles.business}</SelectItem>
                  <SelectItem value="sport">{t.styles.sport}</SelectItem>
                  <SelectItem value="evening">{t.styles.evening}</SelectItem>
                  <SelectItem value="vacation">{t.styles.vacation}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                <X className="w-4 h-4 mr-2" />
                {t.ootd.notNow}
              </Button>
              <Button className="flex-1" onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {t.ootd.generateLook}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Result display */}
            <div className="grid grid-cols-2 gap-3">
              {topItem && (
                <Card className="overflow-hidden">
                  <div className="aspect-square bg-muted">
                    <img src={topItem.image_url} alt={topItem.name || 'Top'} className="w-full h-full object-cover" />
                  </div>
                  <p className="p-2 text-xs font-medium truncate">{topItem.name || t.categoryLabels.top}</p>
                </Card>
              )}
              {bottomItem && (
                <Card className="overflow-hidden">
                  <div className="aspect-square bg-muted">
                    <img src={bottomItem.image_url} alt={bottomItem.name || 'Bottom'} className="w-full h-full object-cover" />
                  </div>
                  <p className="p-2 text-xs font-medium truncate">{bottomItem.name || t.categoryLabels.bottom}</p>
                </Card>
              )}
            </div>

            {outfit?.reasoning && (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {outfit.reasoning}
              </p>
            )}

            <Button className="w-full" onClick={handleClose}>
              <ThumbsUp className="w-4 h-4 mr-2" />
              {t.ootd.looksGreat}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
