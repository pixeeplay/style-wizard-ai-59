import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWardrobe } from '@/hooks/useWardrobe';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { 
  Plus, 
  Shirt, 
  Sparkles, 
  Plane, 
  User, 
  WashingMachine,
  LogOut
} from 'lucide-react';
import AddClothingDialog from '@/components/AddClothingDialog';
import StylistView from '@/components/StylistView';
import TravelView from '@/components/TravelView';

type Tab = 'wardrobe' | 'stylist' | 'travel' | 'profile';

export default function Index() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { items, toggleLaundry, loading } = useWardrobe();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('wardrobe');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const handleToggleLaundry = async (id: string) => {
    try {
      await toggleLaundry(id);
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de changer le statut' });
    }
  };

  const categoryLabels: Record<string, string> = {
    top: 'Haut', bottom: 'Bas', dress: 'Robe', outerwear: 'Veste',
    shoes: 'Chaussures', accessory: 'Accessoire', underwear: 'Sous-vêtement',
    swimwear: 'Maillot', sportswear: 'Sport'
  };

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
                <h2 className="text-xl font-bold">Mon Dressing</h2>
                <p className="text-sm text-muted-foreground">{items.length} vêtements</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Shirt className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Votre dressing est vide</p>
                <Button onClick={() => setAddDialogOpen(true)} className="gold-gradient text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" /> Ajouter un vêtement
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {items.map(item => (
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
                        alt={item.name || 'Vêtement'}
                        className="w-full h-full object-cover"
                      />
                      {item.status === 'laundry' && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <WashingMachine className="w-8 h-8 text-laundry" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">{item.name || categoryLabels[item.category]}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div 
                          className="w-3 h-3 rounded-full border border-border" 
                          style={{ backgroundColor: item.color }}
                        />
                        <Badge variant="secondary" className="text-xs">
                          {categoryLabels[item.category]}
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
            <Button variant="outline" className="w-full" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" /> Déconnexion
            </Button>
          </div>
        )}
      </main>

      {/* Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border/50 z-50">
        <div className="max-w-lg mx-auto flex">
          {[
            { id: 'wardrobe' as Tab, icon: Shirt, label: 'Dressing' },
            { id: 'stylist' as Tab, icon: Sparkles, label: 'Styliste' },
            { id: 'travel' as Tab, icon: Plane, label: 'Voyage' },
            { id: 'profile' as Tab, icon: User, label: 'Profil' },
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
