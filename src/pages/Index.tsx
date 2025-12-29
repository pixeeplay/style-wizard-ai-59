import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useTranslation } from '@/hooks/useTranslation';
import { useSeasonalTheme } from '@/hooks/useSeasonalTheme';
import { seasonalThemes } from '@/lib/seasonal-themes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { 
  Plus, 
  Shirt, 
  Sparkles, 
  Plane, 
  User, 
  WashingMachine,
  LogOut,
  Filter
} from 'lucide-react';
import AddClothingDialog from '@/components/AddClothingDialog';
import StylistView from '@/components/StylistView';
import TravelView from '@/components/TravelView';
import WardrobeFiltersComponent, { WardrobeFilters } from '@/components/WardrobeFilters';

type Tab = 'wardrobe' | 'stylist' | 'travel' | 'profile';

export default function Index() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { items, toggleLaundry, loading } = useWardrobe();
  const { toast } = useToast();
  const { t, language, setLanguage } = useTranslation();
  const { theme, manualTheme, autoTheme, suggestedTheme, setTheme, setAutoTheme } = useSeasonalTheme();
  const [activeTab, setActiveTab] = useState<Tab>('wardrobe');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<WardrobeFilters>({
    category: 'all',
    color: 'all',
    season: 'all',
    style: 'all',
  });

  const handleToggleLaundry = async (id: string) => {
    try {
      await toggleLaundry(id);
    } catch {
      toast({ variant: 'destructive', title: t.common.error, description: 'Unable to change status' });
    }
  };

  // Get unique colors for filter
  const uniqueColors = useMemo(() => {
    const colors = [...new Set(items.map(item => item.color))];
    return colors.sort();
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filters.category !== 'all' && item.category !== filters.category) return false;
      if (filters.color !== 'all' && item.color !== filters.color) return false;
      if (filters.season !== 'all' && item.season !== filters.season) return false;
      if (filters.style !== 'all' && item.style !== filters.style) return false;
      return true;
    });
  }, [items, filters]);

  const hasActiveFilters = filters.category !== 'all' || filters.color !== 'all' || filters.season !== 'all' || filters.style !== 'all';

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="font-bold text-lg">SmartStyle AI</h1>
          </div>
          <Avatar className="w-9 h-9 border-2 border-border">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {activeTab === 'wardrobe' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{t.wardrobe.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {hasActiveFilters ? t.wardrobe.filteredCount(filteredItems.length, items.length) : t.wardrobe.itemsCount(items.length)}
                </p>
              </div>
              <Button
                variant={showFilters ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                {t.wardrobe.filters}
                {hasActiveFilters && (
                  <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    !
                  </Badge>
                )}
              </Button>
            </div>

            {showFilters && (
              <div className="mb-4">
                <WardrobeFiltersComponent
                  filters={filters}
                  onChange={setFilters}
                  uniqueColors={uniqueColors}
                />
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Shirt className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">{t.wardrobe.emptyWardrobe}</p>
                <Button onClick={() => setAddDialogOpen(true)} className="gold-gradient text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" /> {t.wardrobe.addFirstItem}
                </Button>
              </Card>
            ) : filteredItems.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Filter className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">{t.wardrobe.noMatchingItems}</p>
                <Button variant="outline" onClick={() => setFilters({ category: 'all', color: 'all', season: 'all', style: 'all' })}>
                  {t.wardrobe.clearFilters}
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredItems.map(item => (
                  <Card 
                    key={item.id} 
                    className={`overflow-hidden group cursor-pointer transition-all hover:shadow-lg ${
                      item.status === 'laundry' ? 'opacity-60' : ''
                    }`}
                    onClick={() => handleToggleLaundry(item.id)}
                  >
                    <div className="aspect-square relative bg-muted">
                      <img 
                        src={item.image_url} 
                        alt={item.name || 'Clothing'}
                        className="w-full h-full object-cover"
                      />
                      {item.status === 'laundry' && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <WashingMachine className="w-8 h-8 text-laundry" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">{item.name || t.categoryLabels[item.category as keyof typeof t.categoryLabels]}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div 
                          className="w-3 h-3 rounded-full border border-border" 
                          style={{ backgroundColor: item.color }}
                        />
                        <Badge variant="secondary" className="text-xs">
                          {t.categoryLabels[item.category as keyof typeof t.categoryLabels]}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* FAB */}
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="fixed bottom-24 right-4 w-14 h-14 rounded-full gold-gradient shadow-gold z-50"
              size="icon"
            >
              <Plus className="w-6 h-6 text-primary-foreground" />
            </Button>

            <AddClothingDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
          </>
        )}

        {activeTab === 'stylist' && <StylistView />}
        {activeTab === 'travel' && <TravelView />}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="text-center">
              <Avatar className="w-24 h-24 mx-auto border-4 border-border">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback><User className="w-10 h-10" /></AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold mt-4">{profile?.full_name || user?.email}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>

            {/* Language selector */}
            <Card className="p-4 space-y-3">
              <p className="font-semibold">{language === 'fr' ? 'Langue' : 'Language'}</p>
              <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'fr')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            {/* Theme selector */}
            <Card className="p-4 space-y-4">
              <p className="font-semibold">{language === 'fr' ? 'Thème' : 'Theme'}</p>
              
              {/* Auto theme toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-theme" className="text-sm font-medium cursor-pointer">
                    {language === 'fr' ? 'Thème automatique' : 'Auto theme'}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {language === 'fr' 
                      ? `Suggestion : ${seasonalThemes.find(x => x.key === suggestedTheme)?.labelFr || 'Par défaut'}`
                      : `Suggested: ${seasonalThemes.find(x => x.key === suggestedTheme)?.labelEn || 'Default'}`}
                  </p>
                </div>
                <Switch
                  id="auto-theme"
                  checked={autoTheme}
                  onCheckedChange={setAutoTheme}
                />
              </div>

              {/* Manual selector (disabled when auto is on) */}
              <Select 
                value={autoTheme ? suggestedTheme : manualTheme} 
                onValueChange={(v) => setTheme(v as any)}
                disabled={autoTheme}
              >
                <SelectTrigger className={autoTheme ? 'opacity-50' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {seasonalThemes.map((opt) => (
                    <SelectItem key={opt.key} value={opt.key}>
                      {language === 'fr' ? opt.labelFr : opt.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {language === 'fr'
                  ? seasonalThemes.find((x) => x.key === theme)?.descFr
                  : seasonalThemes.find((x) => x.key === theme)?.descEn}
              </p>
            </Card>

            <Button variant="outline" className="w-full" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" /> {t.common.logout}
            </Button>
          </div>
        )}
      </main>

      {/* Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border/50 z-50">
        <div className="max-w-lg mx-auto flex">
          {[
            { id: 'wardrobe' as Tab, icon: Shirt, label: t.nav.wardrobe },
            { id: 'stylist' as Tab, icon: Sparkles, label: t.nav.stylist },
            { id: 'travel' as Tab, icon: Plane, label: t.nav.travel },
            { id: 'profile' as Tab, icon: User, label: t.nav.profile },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
