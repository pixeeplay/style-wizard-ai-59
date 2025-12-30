import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useOutfits, Outfit } from '@/hooks/useOutfits';
import { useWardrobe, WardrobeItem } from '@/hooks/useWardrobe';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  MapPin,
  Loader2,
  Shirt,
  Plus,
} from 'lucide-react';
import {
  format,
  addDays,
  addWeeks,
  subWeeks,
  startOfWeek,
  isSameDay,
  isToday,
} from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface DayForecast {
  date: string;
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  condition: string;
}

interface WeatherData {
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  conditions: string[];
  recommendation: string;
  dailyForecasts: DayForecast[];
}

export default function WeeklyPlanner() {
  const { t, locale } = useTranslation();
  const { outfits, scheduleOutfit } = useOutfits();
  const { items, availableItems } = useWardrobe();

  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [city, setCity] = useState(() => localStorage.getItem('smartstyle.city') || '');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const dateLocale = locale === 'fr' ? fr : enUS;

  // Get days of the week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  // Group outfits by scheduled_date
  const outfitsByDate = useMemo(() => {
    const map: Record<string, Outfit[]> = {};
    outfits.forEach((outfit) => {
      if (outfit.scheduled_date) {
        const dateKey = outfit.scheduled_date;
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(outfit);
      }
    });
    return map;
  }, [outfits]);

  // Fetch 7-day weather forecast
  useEffect(() => {
    if (!city || city.length < 2) {
      setWeather(null);
      return;
    }
    const timeout = setTimeout(async () => {
      setFetchingWeather(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-weather', {
          body: {
            destination: city,
            departureDate: format(currentWeekStart, 'yyyy-MM-dd'),
            days: 7,
          },
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
  }, [city, currentWeekStart]);

  useEffect(() => {
    if (city) localStorage.setItem('smartstyle.city', city);
  }, [city]);

  const handlePrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    setDragOverDate(format(date, 'yyyy-MM-dd'));
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = async (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    setDragOverDate(null);
    const outfitId = e.dataTransfer.getData('outfitId');
    if (outfitId) {
      await scheduleOutfit(outfitId, format(date, 'yyyy-MM-dd'));
    }
  };

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('rain') || lower.includes('pluie')) return CloudRain;
    if (lower.includes('snow') || lower.includes('neige')) return Snowflake;
    if (lower.includes('wind') || lower.includes('vent')) return Wind;
    if (lower.includes('cloud') || lower.includes('nuag')) return Cloud;
    return Sun;
  };

  const getDayForecast = (date: Date): DayForecast | undefined => {
    if (!weather?.dailyForecasts) return undefined;
    const dateKey = format(date, 'yyyy-MM-dd');
    return weather.dailyForecasts.find((f) => f.date === dateKey);
  };

  const getItemImage = (itemId: string) => {
    return items.find((i) => i.id === itemId)?.image_url;
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          {t.planner.title}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {format(currentWeekStart, 'MMM d', { locale: dateLocale })} -{' '}
            {format(addDays(currentWeekStart, 6), 'MMM d, yyyy', { locale: dateLocale })}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* City input for weather */}
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t.planner.enterCity}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="max-w-[200px]"
        />
        {fetchingWeather && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Week grid */}
      <ScrollArea className="w-full">
        <div className="flex gap-3 min-w-[700px] pb-3">
          {weekDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayOutfits = outfitsByDate[dateKey] || [];
            const forecast = getDayForecast(day);
            const isDragOver = dragOverDate === dateKey;
            const isCurrentDay = isToday(day);
            const WeatherIcon = forecast ? getWeatherIcon(forecast.condition) : null;

            return (
              <div
                key={dateKey}
                className={`flex-1 min-w-[90px] rounded-lg border p-2 transition-all ${
                  isDragOver ? 'ring-2 ring-primary bg-primary/10' : ''
                } ${isCurrentDay ? 'border-primary bg-primary/5' : 'border-border'}`}
                onDragOver={(e) => handleDragOver(e, day)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day)}
              >
                {/* Day header */}
                <div className="text-center mb-2">
                  <p className={`text-xs font-medium ${isCurrentDay ? 'text-primary' : 'text-muted-foreground'}`}>
                    {format(day, 'EEE', { locale: dateLocale })}
                  </p>
                  <p className={`text-lg font-bold ${isCurrentDay ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </p>
                </div>

                {/* Weather forecast */}
                {forecast && (
                  <div className="flex items-center justify-center gap-1 mb-2 text-xs text-muted-foreground">
                    {WeatherIcon && <WeatherIcon className="w-3 h-3" />}
                    <span>{Math.round(forecast.avgTemp)}°</span>
                  </div>
                )}

                {/* Outfit preview */}
                <div className="aspect-square bg-muted/50 rounded-md flex items-center justify-center overflow-hidden">
                  {dayOutfits.length > 0 ? (
                    dayOutfits[0].try_on_image_url ? (
                      <img
                        src={dayOutfits[0].try_on_image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : dayOutfits[0].items[0] ? (
                      <div className="flex -space-x-1">
                        {dayOutfits[0].items.slice(0, 2).map((itemId) => (
                          <img
                            key={itemId}
                            src={getItemImage(itemId) || ''}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border-2 border-background"
                          />
                        ))}
                      </div>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        {dayOutfits.length}
                      </Badge>
                    )
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center gap-1">
                      <Plus className="w-4 h-4" />
                      <span className="text-[10px]">{t.planner.dropHere}</span>
                    </div>
                  )}
                </div>

                {/* Outfit count */}
                {dayOutfits.length > 1 && (
                  <Badge variant="secondary" className="w-full justify-center mt-1 text-[10px]">
                    +{dayOutfits.length - 1} {t.planner.more}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Available items reminder */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shirt className="w-3 h-3" />
        <span>
          {availableItems.length} {t.planner.itemsAvailable} • {items.length - availableItems.length} {t.planner.inLaundry}
        </span>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {t.planner.dragInstruction}
      </p>
    </Card>
  );
}
