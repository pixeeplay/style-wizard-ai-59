import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import heroBg from '@/assets/hero-bg.jpg';
import {
  Sparkles,
  Shirt,
  Brain,
  CalendarDays,
  BarChart3,
  Plane,
  WashingMachine,
  ShoppingBag,
  Camera,
  Wand2,
  Star,
  ChevronRight,
  Zap,
  Shield,
  Globe,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Styliste IA Personnalisé',
    description: 'Notre IA analyse votre morphologie, vos préférences et la météo pour créer des looks parfaits adaptés à chaque occasion.',
    gradient: 'from-amber-500/20 to-yellow-300/10',
    badge: 'IA Avancée',
  },
  {
    icon: Camera,
    title: 'Essayage Virtuel',
    description: 'Visualisez vos tenues en 3 styles distincts : flatlay artistique, mannequin élégant et éditorial de mode avant de les porter.',
    gradient: 'from-rose-400/20 to-pink-300/10',
    badge: 'Technologie AR',
  },
  {
    icon: CalendarDays,
    title: 'Planificateur Hebdomadaire',
    description: 'Organisez vos tenues pour toute la semaine. Glissez vos looks sur chaque jour et ne soyez plus jamais pris au dépourvu.',
    gradient: 'from-sky-400/20 to-blue-300/10',
    badge: 'Planning Smart',
  },
  {
    icon: BarChart3,
    title: 'Analytiques Coût / Port',
    description: "Découvrez quels vêtements vous offrent le meilleur rapport qualité-prix. Optimisez votre budget mode avec des données réelles.",
    gradient: 'from-emerald-400/20 to-green-300/10',
    badge: 'Finance Mode',
  },
  {
    icon: ShoppingBag,
    title: 'Suggestions de Marques',
    description: 'Des recommandations personnalisées de marques haut de gamme (Sandro, Maje, Jacquemus) et fast fashion (Zara, H&M) avec prix et liens directs.',
    gradient: 'from-violet-400/20 to-purple-300/10',
    badge: 'Shopping IA',
  },
  {
    icon: Plane,
    title: 'Valise Intelligente',
    description: 'Partez en voyage sans stress. Notre IA crée votre liste de bagages optimale selon la destination, la durée et la météo prévue.',
    gradient: 'from-orange-400/20 to-amber-300/10',
    badge: 'Travel Ready',
  },
  {
    icon: WashingMachine,
    title: 'Suivi du Linge',
    description: 'Gardez une trace de vos vêtements au lavage. Sachez exactement ce qui est disponible pour planifier vos tenues en temps réel.',
    gradient: 'from-cyan-400/20 to-teal-300/10',
    badge: 'Gestion Facile',
  },
  {
    icon: Wand2,
    title: 'Tenue du Jour',
    description: "Recevez chaque matin une suggestion de tenue basée sur la météo locale, vos événements du jour et vos habitudes vestimentaires.",
    gradient: 'from-fuchsia-400/20 to-pink-300/10',
    badge: 'Quotidien',
  },
];

const stats = [
  { value: '10 000+', label: 'Articles catalogués', icon: Shirt },
  { value: '3 styles', label: "par visualisation", icon: Camera },
  { value: '100%', label: 'Personnalisé', icon: Star },
  { value: '24/7', label: 'Styliste disponible', icon: Zap },
];

const testimonials = [
  {
    name: 'Sophie M.',
    role: 'Créatrice de contenu',
    text: "SmartStyle AI a complètement révolutionné ma façon de m'habiller. Je ne perds plus de temps le matin !",
    avatar: 'SM',
  },
  {
    name: 'Lucas T.',
    role: 'Consultant',
    text: "La fonctionnalité de coût par port m'a fait réaliser que mes vêtements les moins chers étaient en réalité les plus coûteux.",
    avatar: 'LT',
  },
  {
    name: 'Emma R.',
    role: 'Styliste professionnelle',
    text: "En tant que professionnelle de la mode, je suis impressionnée par la précision des suggestions. L'IA comprend vraiment la mode.",
    avatar: 'ER',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gold-gradient flex items-center justify-center shadow-gold">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">SmartStyle AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
              Connexion
            </Button>
            <Button size="sm" className="gold-gradient text-primary-foreground shadow-gold" onClick={() => navigate('/auth')}>
              Commencer gratuitement
            </Button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-background/60" />
        {/* Decorative orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 py-24">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-medium">
            ✨ Votre styliste personnel alimenté par l'IA
          </Badge>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
            Habillez-vous
            <span className="block bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 bg-clip-text text-transparent">
              avec intelligence
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            SmartStyle AI transforme votre garde-robe en un outil intelligent. 
            Planifiez, visualisez et optimisez chaque tenue grâce à l'intelligence artificielle.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="gold-gradient text-primary-foreground shadow-gold text-base px-8 h-12 font-semibold"
              onClick={() => navigate('/auth')}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Créer mon compte gratuit
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 h-12 font-medium border-border/60"
              onClick={() => navigate('/auth')}
            >
              Se connecter
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-12 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-primary" /> Données sécurisées</span>
            <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-primary" /> Disponible en FR / EN</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-primary" /> IA en temps réel</span>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-card border-y border-border/40 py-16">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className="w-7 h-7 text-primary mx-auto mb-3" />
              <div className="text-3xl font-black text-foreground mb-1">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Fonctionnalités</Badge>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Tout ce dont votre style
              <span className="text-primary"> a besoin</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Une suite complète d'outils IA pour gérer, planifier et sublimer votre garde-robe au quotidien.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className={`group relative rounded-2xl border border-border/40 bg-gradient-to-br ${f.gradient} bg-card p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-default`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <Badge className="text-[10px] bg-background/60 border-border/40 text-muted-foreground font-normal">
                    {f.badge}
                  </Badge>
                </div>
                <h3 className="font-bold text-base mb-2 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 bg-card border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Comment ça marche</Badge>
            <h2 className="text-4xl font-black tracking-tight">
              Simple. Intelligent. <span className="text-primary">Élégant.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Photographiez vos vêtements', desc: "Ajoutez votre garde-robe en prenant une photo. L'IA analyse automatiquement la couleur, la catégorie et le style." },
              { step: '02', title: 'Laissez l\'IA travailler', desc: "Notre algorithme apprend vos préférences et crée des combinaisons parfaites adaptées à la météo et à l'occasion." },
              { step: '03', title: 'Portez avec confiance', desc: "Visualisez le rendu final avec l'essayage virtuel 3 styles avant de choisir votre tenue définitive." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl gold-gradient shadow-gold flex items-center justify-center mx-auto mb-5">
                  <span className="text-primary-foreground font-black text-lg">{s.step}</span>
                </div>
                <h3 className="font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Témoignages</Badge>
            <h2 className="text-4xl font-black tracking-tight">
              Ils ont transformé <span className="text-primary">leur style</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card border border-border/40 rounded-2xl p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-3xl rounded-full" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">
            Prêt à révolutionner
            <span className="block text-primary">votre garde-robe ?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Rejoignez des milliers d'utilisateurs qui habillent leur quotidien avec intelligence.
          </p>
          <Button
            size="lg"
            className="gold-gradient text-primary-foreground shadow-gold text-base px-10 h-14 font-semibold rounded-xl"
            onClick={() => navigate('/auth')}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Commencer maintenant — C'est gratuit
          </Button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/40 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gold-gradient flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">SmartStyle AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 SmartStyle AI — Votre styliste personnel intelligent
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="cursor-pointer hover:text-primary transition-colors">Confidentialité</span>
            <span className="cursor-pointer hover:text-primary transition-colors">Conditions</span>
            <span className="cursor-pointer hover:text-primary transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
