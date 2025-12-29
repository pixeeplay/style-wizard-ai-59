import { useState } from 'react';
import { format } from 'date-fns';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plane, MapPin, Calendar as CalendarIcon, Briefcase, Check, RefreshCw, Cloud, Loader2, Sun, CloudRain, Snowflake, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PackingItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  packed: boolean;
}

interface WeatherData {
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  conditions: string[];
  recommendation: 'cold' | 'hot' | 'rain' | 'normal';
  dailyForecasts: Array<{
    date: string;
    temp: number;
    condition: string;
    icon: string;
  }>;
}

export default function TravelView() {
  const { availableItems } = useWardrobe();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState<Date>();
  const [days, setDays] = useState('3');
  const [tripType, setTripType] = useState<'vacation' | 'business' | 'sport' | 'casual'>('vacation');
  const [packingList, setPackingList] = useState<PackingItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const tripTypes = [
    { value: 'vacation' as const, label: t.tripTypes.vacation },
    { value: 'business' as const, label: t.tripTypes.business },
    { value: 'sport' as const, label: t.tripTypes.sport },
    { value: 'casual' as const, label: t.tripTypes.casual },
  ];

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('rain') || lower.includes('drizzle')) return <CloudRain className="w-5 h-5 text-blue-400" />;
    if (lower.includes('snow')) return <Snowflake className="w-5 h-5 text-blue-200" />;
    if (lower.includes('cloud')) return <Cloud className="w-5 h-5 text-muted-foreground" />;
    if (lower.includes('wind')) return <Wind className="w-5 h-5 text-muted-foreground" />;
    return <Sun className="w-5 h-5 text-yellow-400" />;
  };

  const getWeatherRecommendation = (rec: string) => {
    switch (rec) {
      case 'cold': return t.travel.weather.packWarm;
      case 'hot': return t.travel.weather.packLight;
      case 'rain': return t.travel.weather.packRain;
      default: return t.travel.weather.packNormal;
    }
  };

  const fetchWeather = async () => {
    if (!destination.trim()) return;
    
    setLoadingWeather(true);
    setWeatherError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: {
          destination,
          departureDate: departureDate?.toISOString() || new Date().toISOString(),
          days: parseInt(days) || 3,
        },
      });

      if (error) throw error;

      if (data?.weather) {
        setWeather(data.weather);
      } else {
        throw new Error(data?.error || 'No weather data');
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      setWeatherError(t.travel.weather.error);
    } finally {
      setLoadingWeather(false);
    }
  };

  const generatePackingList = async () => {
    if (!destination.trim()) {
      toast({
        variant: 'destructive',
        title: t.travel.destinationRequired,
        description: t.travel.enterDestination,
      });
      return;
    }

    const numDays = parseInt(days) || 3;

    if (availableItems.length === 0) {
      toast({
        variant: 'destructive',
        title: t.travel.emptyWardrobe,
        description: t.travel.addItemsFirst,
      });
      return;
    }

    setGenerating(true);

    // Fetch weather first
    await fetchWeather();

    setTimeout(() => {
      const tops = availableItems.filter(i => i.category === 'top');
      const bottoms = availableItems.filter(i => i.category === 'bottom');
      const dresses = availableItems.filter(i => i.category === 'dress');
      const outerwear = availableItems.filter(i => i.category === 'outerwear');
      const shoes = availableItems.filter(i => i.category === 'shoes');
      const underwear = availableItems.filter(i => i.category === 'underwear');
      const accessories = availableItems.filter(i => i.category === 'accessory');
      const swimwear = availableItems.filter(i => i.category === 'swimwear');
      const sportswear = availableItems.filter(i => i.category === 'sportswear');

      const list: PackingItem[] = [];

      // Calculate quantities based on days
      const numTops = Math.min(numDays, tops.length);
      const numBottoms = Math.min(Math.ceil(numDays / 2), bottoms.length);
      const numUnderwear = Math.min(numDays + 1, underwear.length);

      // Weather-based selection
      const isCold = weather?.recommendation === 'cold';
      const isHot = weather?.recommendation === 'hot';

      // Add tops (prefer warm clothes if cold, light if hot)
      let selectedTops = [...tops];
      if (isCold) {
        selectedTops = selectedTops.filter(t => t.season === 'winter' || t.season === 'fall' || t.season === 'all');
      } else if (isHot) {
        selectedTops = selectedTops.filter(t => t.season === 'summer' || t.season === 'spring' || t.season === 'all');
      }
      if (selectedTops.length === 0) selectedTops = tops;

      const shuffledTops = [...selectedTops].sort(() => Math.random() - 0.5);
      shuffledTops.slice(0, numTops).forEach(item => {
        list.push({
          id: item.id,
          name: item.name || t.categoryLabels[item.category as keyof typeof t.categoryLabels],
          category: item.category,
          imageUrl: item.image_url,
          packed: false,
        });
      });

      // Add bottoms
      const shuffledBottoms = [...bottoms].sort(() => Math.random() - 0.5);
      shuffledBottoms.slice(0, numBottoms).forEach(item => {
        list.push({
          id: item.id,
          name: item.name || t.categoryLabels[item.category as keyof typeof t.categoryLabels],
          category: item.category,
          imageUrl: item.image_url,
          packed: false,
        });
      });

      // Add dresses for vacation
      if (tripType === 'vacation' && dresses.length > 0 && !isCold) {
        const dress = dresses[Math.floor(Math.random() * dresses.length)];
        list.push({
          id: dress.id,
          name: dress.name || t.categoryLabels.dress,
          category: dress.category,
          imageUrl: dress.image_url,
          packed: false,
        });
      }

      // Add outerwear (always if cold, one if normal)
      if (outerwear.length > 0 && (isCold || weather?.recommendation !== 'hot')) {
        const numOuterwear = isCold ? Math.min(2, outerwear.length) : 1;
        const shuffledOuterwear = [...outerwear].sort(() => Math.random() - 0.5);
        shuffledOuterwear.slice(0, numOuterwear).forEach(item => {
          list.push({
            id: item.id,
            name: item.name || t.categoryLabels.outerwear,
            category: item.category,
            imageUrl: item.image_url,
            packed: false,
          });
        });
      }

      // Add shoes (1-2 pairs)
      const shuffledShoes = [...shoes].sort(() => Math.random() - 0.5);
      shuffledShoes.slice(0, Math.min(2, shoes.length)).forEach(item => {
        list.push({
          id: item.id,
          name: item.name || t.categoryLabels.shoes,
          category: item.category,
          imageUrl: item.image_url,
          packed: false,
        });
      });

      // Add underwear
      const shuffledUnderwear = [...underwear].sort(() => Math.random() - 0.5);
      shuffledUnderwear.slice(0, numUnderwear).forEach(item => {
        list.push({
          id: item.id,
          name: item.name || t.categoryLabels.underwear,
          category: item.category,
          imageUrl: item.image_url,
          packed: false,
        });
      });

      // Add swimwear for vacation in hot weather
      if ((tripType === 'vacation' || isHot) && swimwear.length > 0) {
        const swimItem = swimwear[Math.floor(Math.random() * swimwear.length)];
        list.push({
          id: swimItem.id,
          name: swimItem.name || t.categoryLabels.swimwear,
          category: swimItem.category,
          imageUrl: swimItem.image_url,
          packed: false,
        });
      }

      // Add sportswear for sport trips
      if (tripType === 'sport' && sportswear.length > 0) {
        const shuffledSport = [...sportswear].sort(() => Math.random() - 0.5);
        shuffledSport.slice(0, Math.min(2, sportswear.length)).forEach(item => {
          list.push({
            id: item.id,
            name: item.name || t.categoryLabels.sportswear,
            category: item.category,
            imageUrl: item.image_url,
            packed: false,
          });
        });
      }

      // Add an accessory
      if (accessories.length > 0) {
        const accessory = accessories[Math.floor(Math.random() * accessories.length)];
        list.push({
          id: accessory.id,
          name: accessory.name || t.categoryLabels.accessory,
          category: accessory.category,
          imageUrl: accessory.image_url,
          packed: false,
        });
      }

      setPackingList(list);
      setGenerating(false);

      toast({
        title: t.travel.listGenerated,
        description: t.travel.itemsForDays(list.length, numDays, destination),
      });
    }, 800);
  };

  const togglePacked = (id: string) => {
    setPackingList(prev => 
      prev.map(item => 
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    );
  };

  const packedCount = packingList.filter(i => i.packed).length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">{t.travel.title}</h2>
        <p className="text-sm text-muted-foreground">{t.travel.subtitle}</p>
      </div>

      {/* Trip Form */}
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {t.travel.destination}
          </Label>
          <Input
            placeholder={t.travel.destinationPlaceholder}
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {t.travel.departureDate}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !departureDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {departureDate ? format(departureDate, "PP") : t.travel.selectDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={departureDate}
                  onSelect={setDepartureDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>{t.travel.duration}</Label>
            <Input
              type="number"
              min="1"
              max="30"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            {t.travel.tripType}
          </Label>
          <Select value={tripType} onValueChange={(v) => setTripType(v as typeof tripType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {tripTypes.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={generatePackingList} 
          className="w-full gold-gradient text-primary-foreground"
          disabled={generating}
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t.travel.preparing}
            </>
          ) : (
            <>
              <Plane className="w-4 h-4 mr-2" />
              {t.travel.generateList}
            </>
          )}
        </Button>
      </Card>

      {/* Weather Card */}
      {(loadingWeather || weather || weatherError) && (
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Cloud className="w-4 h-4 text-primary" />
            {t.travel.weather.title}
          </h3>

          {loadingWeather ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.travel.weather.loading}
            </div>
          ) : weatherError ? (
            <p className="text-sm text-destructive">{weatherError}</p>
          ) : weather && (
            <div className="space-y-3">
              {/* Temperature summary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getWeatherIcon(weather.conditions[0] || 'Clear')}
                  <div>
                    <p className="font-medium">{weather.avgTemp}°C</p>
                    <p className="text-xs text-muted-foreground">
                      {weather.minTemp}° - {weather.maxTemp}°
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{t.travel.weather.conditions}</p>
                  <p className="text-sm capitalize">{weather.conditions.join(', ')}</p>
                </div>
              </div>

              {/* Daily forecasts */}
              {weather.dailyForecasts.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-2">
                  {weather.dailyForecasts.map((day, idx) => (
                    <div key={idx} className="flex-shrink-0 text-center p-2 bg-muted/50 rounded-lg min-w-[60px]">
                      <p className="text-xs text-muted-foreground">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      {getWeatherIcon(day.condition)}
                      <p className="text-sm font-medium">{day.temp}°</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendation */}
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-primary">{t.travel.weather.recommendation}</p>
                <p className="text-sm text-muted-foreground">{getWeatherRecommendation(weather.recommendation)}</p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Packing List */}
      {packingList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t.travel.yourSuitcase}</h3>
            <span className="text-sm text-muted-foreground">
              {packedCount}/{packingList.length} {t.travel.ready}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full gold-gradient transition-all duration-300"
              style={{ width: `${(packedCount / packingList.length) * 100}%` }}
            />
          </div>

          <div className="space-y-2">
            {packingList.map(item => (
              <Card
                key={item.id}
                className={`p-3 flex items-center gap-3 cursor-pointer transition-all ${
                  item.packed ? 'bg-muted/50' : ''
                }`}
                onClick={() => togglePacked(item.id)}
              >
                <Checkbox checked={item.packed} />
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className={`w-full h-full object-cover ${item.packed ? 'opacity-50' : ''}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${item.packed ? 'line-through text-muted-foreground' : ''}`}>
                    {item.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t.categoryLabels[item.category as keyof typeof t.categoryLabels]}
                  </p>
                </div>
                {item.packed && <Check className="w-5 h-5 text-success" />}
              </Card>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={generatePackingList}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t.travel.regenerateList}
          </Button>
        </div>
      )}
    </div>
  );
}
