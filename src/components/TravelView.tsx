import { useState } from 'react';
import { useWardrobe } from '@/hooks/useWardrobe';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plane, MapPin, Calendar, Briefcase, Check, RefreshCw } from 'lucide-react';

interface PackingItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  packed: boolean;
}

const tripTypes = [
  { value: 'vacation', label: 'Vacances' },
  { value: 'business', label: 'Affaires' },
  { value: 'sport', label: 'Sport' },
  { value: 'casual', label: 'Week-end' },
] as const;

export default function TravelView() {
  const { availableItems } = useWardrobe();
  const { toast } = useToast();

  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('3');
  const [tripType, setTripType] = useState<typeof tripTypes[number]['value']>('vacation');
  const [packingList, setPackingList] = useState<PackingItem[]>([]);
  const [generating, setGenerating] = useState(false);

  const categoryLabels: Record<string, string> = {
    top: 'Haut', bottom: 'Bas', dress: 'Robe', outerwear: 'Veste',
    shoes: 'Chaussures', accessory: 'Accessoire', underwear: 'Sous-vêtement',
    swimwear: 'Maillot', sportswear: 'Sport'
  };

  const generatePackingList = () => {
    if (!destination.trim()) {
      toast({
        variant: 'destructive',
        title: 'Destination requise',
        description: 'Entrez votre destination de voyage',
      });
      return;
    }

    const numDays = parseInt(days) || 3;

    if (availableItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Dressing vide',
        description: 'Ajoutez des vêtements à votre dressing d\'abord',
      });
      return;
    }

    setGenerating(true);

    setTimeout(() => {
      const tops = availableItems.filter(i => i.category === 'top');
      const bottoms = availableItems.filter(i => i.category === 'bottom');
      const dresses = availableItems.filter(i => i.category === 'dress');
      const outerwear = availableItems.filter(i => i.category === 'outerwear');
      const shoes = availableItems.filter(i => i.category === 'shoes');
      const underwear = availableItems.filter(i => i.category === 'underwear');
      const accessories = availableItems.filter(i => i.category === 'accessory');

      const list: PackingItem[] = [];

      // Calculate quantities based on days
      const numTops = Math.min(numDays, tops.length);
      const numBottoms = Math.min(Math.ceil(numDays / 2), bottoms.length);
      const numUnderwear = Math.min(numDays + 1, underwear.length);

      // Add tops
      const shuffledTops = [...tops].sort(() => Math.random() - 0.5);
      shuffledTops.slice(0, numTops).forEach(item => {
        list.push({
          id: item.id,
          name: item.name || categoryLabels[item.category],
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
          name: item.name || categoryLabels[item.category],
          category: item.category,
          imageUrl: item.image_url,
          packed: false,
        });
      });

      // Add dresses for vacation
      if (tripType === 'vacation' && dresses.length > 0) {
        const dress = dresses[Math.floor(Math.random() * dresses.length)];
        list.push({
          id: dress.id,
          name: dress.name || 'Robe',
          category: dress.category,
          imageUrl: dress.image_url,
          packed: false,
        });
      }

      // Add outerwear
      if (outerwear.length > 0) {
        const jacket = outerwear[Math.floor(Math.random() * outerwear.length)];
        list.push({
          id: jacket.id,
          name: jacket.name || 'Veste',
          category: jacket.category,
          imageUrl: jacket.image_url,
          packed: false,
        });
      }

      // Add shoes (1-2 pairs)
      const shuffledShoes = [...shoes].sort(() => Math.random() - 0.5);
      shuffledShoes.slice(0, Math.min(2, shoes.length)).forEach(item => {
        list.push({
          id: item.id,
          name: item.name || 'Chaussures',
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
          name: item.name || 'Sous-vêtement',
          category: item.category,
          imageUrl: item.image_url,
          packed: false,
        });
      });

      // Add an accessory
      if (accessories.length > 0) {
        const accessory = accessories[Math.floor(Math.random() * accessories.length)];
        list.push({
          id: accessory.id,
          name: accessory.name || 'Accessoire',
          category: accessory.category,
          imageUrl: accessory.image_url,
          packed: false,
        });
      }

      setPackingList(list);
      setGenerating(false);

      toast({
        title: 'Liste générée !',
        description: `${list.length} articles pour ${numDays} jours à ${destination}`,
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
        <h2 className="text-xl font-bold">Mode Voyage</h2>
        <p className="text-sm text-muted-foreground">Préparez votre valise intelligemment</p>
      </div>

      {/* Trip Form */}
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Destination
          </Label>
          <Input
            placeholder="Paris, Tokyo, New York..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Durée (jours)
            </Label>
            <Input
              type="number"
              min="1"
              max="30"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Type de voyage
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
        </div>

        <Button 
          onClick={generatePackingList} 
          className="w-full gold-gradient text-primary-foreground"
          disabled={generating}
        >
          <Plane className={`w-4 h-4 mr-2 ${generating ? 'animate-bounce' : ''}`} />
          {generating ? 'Préparation...' : 'Générer ma liste'}
        </Button>
      </Card>

      {/* Packing List */}
      {packingList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Votre valise</h3>
            <span className="text-sm text-muted-foreground">
              {packedCount}/{packingList.length} prêts
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
                  <p className="text-sm text-muted-foreground">{categoryLabels[item.category]}</p>
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
            Régénérer la liste
          </Button>
        </div>
      )}
    </div>
  );
}
