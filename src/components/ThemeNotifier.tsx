import { useEffect, useRef } from 'react';
import { useSeasonalTheme, getAutoTheme } from '@/hooks/useSeasonalTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { seasonalThemes, SeasonalThemeKey } from '@/lib/seasonal-themes';

const THEME_NOTIFICATION_KEY = 'smartstyle.lastThemeNotification';

function getThemeNotificationMessage(theme: SeasonalThemeKey, language: 'en' | 'fr'): { title: string; description: string } | null {
  const messages: Record<SeasonalThemeKey, { en: { title: string; description: string }; fr: { title: string; description: string } }> = {
    noel: {
      en: { title: '🎄 Christmas is here!', description: 'Would you like to activate the festive theme?' },
      fr: { title: '🎄 C\'est bientôt Noël !', description: 'Voulez-vous activer le thème festif ?' },
    },
    valentine: {
      en: { title: '💕 Valentine\'s Day!', description: 'Celebrate love with our romantic theme!' },
      fr: { title: '💕 Saint-Valentin !', description: 'Célébrez l\'amour avec notre thème romantique !' },
    },
    summer: {
      en: { title: '☀️ Summer vibes!', description: 'Switch to our sunny summer theme?' },
      fr: { title: '☀️ C\'est l\'été !', description: 'Passez au thème ensoleillé ?' },
    },
    backtoschool: {
      en: { title: '📚 Back to school!', description: 'Try our fresh autumn theme?' },
      fr: { title: '📚 C\'est la rentrée !', description: 'Essayez notre thème de rentrée ?' },
    },
    halloween: {
      en: { title: '🎃 Halloween is coming!', description: 'Get spooky with our Halloween theme!' },
      fr: { title: '🎃 Halloween approche !', description: 'Activez le thème Halloween ?' },
    },
    default: {
      en: { title: '', description: '' },
      fr: { title: '', description: '' },
    },
  };

  const msg = messages[theme];
  if (!msg || theme === 'default') return null;
  return language === 'fr' ? msg.fr : msg.en;
}

export function ThemeNotifier() {
  const { autoTheme, suggestedTheme, setAutoTheme } = useSeasonalTheme();
  const { language } = useTranslation();
  const { toast } = useToast();
  const hasNotified = useRef(false);

  useEffect(() => {
    // Only notify if auto theme is OFF and suggested theme is different from default
    if (autoTheme || suggestedTheme === 'default' || hasNotified.current) return;

    // Check if we already notified for this theme recently (within 7 days)
    const lastNotification = localStorage.getItem(THEME_NOTIFICATION_KEY);
    if (lastNotification) {
      const { theme: lastTheme, timestamp } = JSON.parse(lastNotification);
      const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
      if (lastTheme === suggestedTheme && daysSince < 7) return;
    }

    const message = getThemeNotificationMessage(suggestedTheme, language);
    if (!message) return;

    hasNotified.current = true;

    // Show notification after a short delay
    const timeout = setTimeout(() => {
      toast({
        title: message.title,
        description: message.description,
        action: (
          <button
            onClick={() => setAutoTheme(true)}
            className="px-3 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {language === 'fr' ? 'Activer' : 'Enable'}
          </button>
        ),
        duration: 10000,
      });

      // Save that we notified
      localStorage.setItem(
        THEME_NOTIFICATION_KEY,
        JSON.stringify({ theme: suggestedTheme, timestamp: Date.now() })
      );
    }, 2000);

    return () => clearTimeout(timeout);
  }, [autoTheme, suggestedTheme, language, toast, setAutoTheme]);

  return null;
}
