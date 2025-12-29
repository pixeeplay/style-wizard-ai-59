import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useWardrobe } from '@/hooks/useWardrobe';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Upload, Sparkles, Loader2 } from 'lucide-react';

interface AddClothingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { value: 'top', label: 'Haut' },
  { value: 'bottom', label: 'Bas' },
  { value: 'dress', label: 'Robe' },
  { value: 'outerwear', label: 'Veste / Manteau' },
  { value: 'shoes', label: 'Chaussures' },
  { value: 'accessory', label: 'Accessoire' },
  { value: 'underwear', label: 'Sous-vêtement' },
  { value: 'swimwear', label: 'Maillot de bain' },
  { value: 'sportswear', label: 'Sport' },
] as const;

const seasons = [
  { value: 'all', label: 'Toutes saisons' },
  { value: 'spring', label: 'Printemps' },
  { value: 'summer', label: 'Été' },
  { value: 'fall', label: 'Automne' },
  { value: 'winter', label: 'Hiver' },
] as const;

const styles = [
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formel' },
  { value: 'sport', label: 'Sport' },
  { value: 'business', label: 'Business' },
  { value: 'evening', label: 'Soirée' },
  { value: 'vacation', label: 'Vacances' },
] as const;

export default function AddClothingDialog({ open, onOpenChange }: AddClothingDialogProps) {
  const { user } = useAuth();
  const { addItem } = useWardrobe();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'analyze' | 'confirm'>('upload');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'top' as typeof categories[number]['value'],
    color: '#000000',
    season: 'all' as typeof seasons[number]['value'],
    style: 'casual' as typeof styles[number]['value'],
    brand: '',
  });

  const resetForm = () => {
    setStep('upload');
    setImageUrl(null);
    setFormData({
      name: '',
      category: 'top',
      color: '#000000',
      season: 'all',
      style: 'casual',
      brand: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('wardrobe-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('wardrobe-images')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
      setStep('analyze');
      
      // Auto-analyze with AI
      await analyzeImage(publicUrl);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de télécharger l\'image',
      });
    } finally {
      setUploading(false);
    }
  };

  const analyzeImage = async (url: string) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-clothing', {
        body: { imageUrl: url },
      });

      if (error) throw error;

      if (data?.analysis) {
        const analysis = data.analysis;
        setFormData(prev => ({
          ...prev,
          name: analysis.name || prev.name,
          category: analysis.category || prev.category,
          color: analysis.color || prev.color,
          season: analysis.season || prev.season,
          style: analysis.style || prev.style,
          brand: analysis.brand || prev.brand,
        }));
        toast({
          title: 'Analyse terminée !',
          description: 'L\'IA a identifié votre vêtement',
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        variant: 'destructive',
        title: 'Analyse échouée',
        description: 'Veuillez remplir les détails manuellement',
      });
    } finally {
      setAnalyzing(false);
      setStep('confirm');
    }
  };

  const handleSave = async () => {
    if (!imageUrl) return;

    setSaving(true);
    try {
      await addItem({
        image_url: imageUrl,
        name: formData.name || null,
        category: formData.category,
        color: formData.color,
        secondary_color: null,
        season: formData.season,
        style: formData.style,
        brand: formData.brand || null,
        status: 'available',
        notes: null,
      });

      toast({
        title: 'Vêtement ajouté !',
        description: 'Il apparaît maintenant dans votre dressing',
      });
      handleClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'ajouter le vêtement',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' && 'Ajouter un vêtement'}
            {step === 'analyze' && 'Analyse en cours...'}
            {step === 'confirm' && 'Confirmer les détails'}
          </DialogTitle>
        </DialogHeader>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              {uploading ? (
                <Loader2 className="w-12 h-12 mx-auto mb-3 text-primary animate-spin" />
              ) : (
                <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              )}
              <p className="font-medium">
                {uploading ? 'Téléchargement...' : 'Prendre ou choisir une photo'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                L'IA analysera automatiquement votre vêtement
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </div>
        )}

        {/* Analyze Step */}
        {step === 'analyze' && (
          <div className="py-8 text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              {imageUrl && (
                <img src={imageUrl} alt="Vêtement" className="w-full h-full object-cover rounded-xl" />
              )}
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-xl">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            <p className="text-muted-foreground">L'IA analyse votre vêtement...</p>
          </div>
        )}

        {/* Confirm Step */}
        {step === 'confirm' && (
          <div className="space-y-4">
            {imageUrl && (
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-muted">
                <img src={imageUrl} alt="Vêtement" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Nom (optionnel)</Label>
                <Input
                  placeholder="Ex: Pull bleu marine"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Catégorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v as typeof formData.category })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Couleur</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Saison</Label>
                  <Select
                    value={formData.season}
                    onValueChange={(v) => setFormData({ ...formData, season: v as typeof formData.season })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {seasons.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Style</Label>
                  <Select
                    value={formData.style}
                    onValueChange={(v) => setFormData({ ...formData, style: v as typeof formData.style })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {styles.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Marque (optionnel)</Label>
                <Input
                  placeholder="Ex: Zara, H&M..."
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Annuler
              </Button>
              <Button 
                className="flex-1 gold-gradient text-primary-foreground" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ajouter'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
