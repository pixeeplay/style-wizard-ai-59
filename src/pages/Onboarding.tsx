import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Upload, User, Ruler, Scale, ArrowRight, Check } from 'lucide-react';

const morphologies = [
  { value: 'rectangle', label: 'Rectangle', description: 'Épaules et hanches alignées' },
  { value: 'hourglass', label: 'Sablier', description: 'Taille marquée, épaules = hanches' },
  { value: 'inverted_triangle', label: 'V inversé', description: 'Épaules larges, hanches étroites' },
  { value: 'triangle', label: 'Triangle', description: 'Hanches plus larges que les épaules' },
  { value: 'oval', label: 'Ovale', description: 'Rondeurs au niveau du buste/ventre' },
  { value: 'athletic', label: 'Athlétique', description: 'Silhouette musclée et tonique' },
] as const;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    height_cm: '',
    weight_kg: '',
    morphology: '' as typeof morphologies[number]['value'] | '',
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      toast({
        title: 'Photo téléchargée !',
        description: 'Votre photo de profil a été mise à jour',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de télécharger la photo',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await updateProfile({
        avatar_url: avatarUrl,
        height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseInt(formData.weight_kg) : null,
        morphology: formData.morphology || null,
        onboarding_completed: true,
      });
      
      toast({
        title: 'Profil complété !',
        description: 'Bienvenue dans votre dressing digital',
      });
      navigate('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de sauvegarder le profil',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await updateProfile({
        onboarding_completed: true,
      });
      navigate('/');
    } catch (error) {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-md mx-auto pt-8 animate-fade-in">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-16 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Avatar */}
        {step === 1 && (
          <Card className="border-border/50">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl gold-gradient shadow-gold mx-auto mb-4">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Votre photo</CardTitle>
              <CardDescription>
                Ajoutez une photo pour personnaliser vos looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32 border-4 border-border">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-muted text-4xl">
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                
                <Label
                  htmlFor="avatar-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Téléchargement...' : 'Choisir une photo'}
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </div>

              <Button
                className="w-full gold-gradient text-primary-foreground"
                onClick={() => setStep(2)}
              >
                Continuer
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Measurements */}
        {step === 2 && (
          <Card className="border-border/50">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl gold-gradient shadow-gold mx-auto mb-4">
                <Ruler className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Vos mensurations</CardTitle>
              <CardDescription>
                Pour des recommandations personnalisées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Taille (cm)</Label>
                  <div className="relative">
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      value={formData.height_cm}
                      onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                    />
                    <Ruler className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Poids (kg)</Label>
                  <div className="relative">
                    <Input
                      id="weight"
                      type="number"
                      placeholder="65"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    />
                    <Scale className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Retour
                </Button>
                <Button
                  className="flex-1 gold-gradient text-primary-foreground"
                  onClick={() => setStep(3)}
                >
                  Continuer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Morphology */}
        {step === 3 && (
          <Card className="border-border/50">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl gold-gradient shadow-gold mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Votre morphologie</CardTitle>
              <CardDescription>
                Pour des looks qui vous mettent en valeur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={formData.morphology}
                onValueChange={(value) => setFormData({ ...formData, morphology: value as typeof morphologies[number]['value'] })}
                className="space-y-3"
              >
                {morphologies.map((morph) => (
                  <Label
                    key={morph.value}
                    htmlFor={morph.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.morphology === morph.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={morph.value} id={morph.value} />
                    <div className="flex-1">
                      <p className="font-medium">{morph.label}</p>
                      <p className="text-sm text-muted-foreground">{morph.description}</p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(2)}
                >
                  Retour
                </Button>
                <Button
                  className="flex-1 gold-gradient text-primary-foreground"
                  onClick={handleComplete}
                  disabled={loading}
                >
                  {loading ? 'Sauvegarde...' : 'Terminer'}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skip button */}
        <Button
          variant="ghost"
          className="w-full mt-4 text-muted-foreground"
          onClick={handleSkip}
          disabled={loading}
        >
          Passer cette étape
        </Button>
      </div>
    </div>
  );
}
