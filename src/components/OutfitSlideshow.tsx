import { useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from '@/hooks/useTranslation';
import { useWardrobe } from '@/hooks/useWardrobe';
import { Outfit } from '@/hooks/useOutfits';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CalendarDays, Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useEmblaCarousel from 'embla-carousel-react';

interface OutfitSlideshowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outfits: Outfit[];
  date: Date | null;
}

export default function OutfitSlideshow({ open, onOpenChange, outfits, date }: OutfitSlideshowProps) {
  const { t, locale } = useTranslation();
  const { items } = useWardrobe();
  const { toast } = useToast();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const dateLocale = locale === 'fr' ? fr : enUS;

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (emblaApi && open) {
      emblaApi.reInit();
    }
  }, [emblaApi, open, outfits]);

  const getItemImage = (itemId: string) => items.find((i) => i.id === itemId)?.image_url;

  const handleDownload = (outfit: Outfit) => {
    const imageUrl = outfit.try_on_image_url;
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `outfit-${outfit.id}.png`;
    link.click();
  };

  const handleShare = async (outfit: Outfit) => {
    const imageUrl = outfit.try_on_image_url;
    if (!imageUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: outfit.name || 'SmartStyle Outfit',
          url: imageUrl,
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        toast({
          title: t.gallery.linkCopied,
          description: t.gallery.linkCopiedDesc,
        });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (!outfits.length) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            {date && format(date, 'EEEE, d MMMM yyyy', { locale: dateLocale })}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          {/* Carousel */}
          <div className="overflow-hidden rounded-xl" ref={emblaRef}>
            <div className="flex">
              {outfits.map((outfit) => (
                <div key={outfit.id} className="flex-[0_0_100%] min-w-0">
                  <div className="aspect-square bg-muted rounded-xl overflow-hidden">
                    {outfit.try_on_image_url ? (
                      <img
                        src={outfit.try_on_image_url}
                        alt={outfit.name || 'Outfit'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full grid grid-cols-2 gap-1 p-2">
                        {outfit.items.map((itemId, idx) => {
                          const imgUrl = getItemImage(itemId);
                          return imgUrl ? (
                            <img
                              key={idx}
                              src={imgUrl}
                              alt=""
                              className="w-full h-full object-cover rounded"
                            />
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{outfit.name || 'Look'}</p>
                      {outfit.visualization_style && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {outfit.visualization_style}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {outfit.try_on_image_url && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDownload(outfit)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleShare(outfit)}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          {outfits.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/3 -translate-y-1/2 bg-background/80"
                onClick={scrollPrev}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/3 -translate-y-1/2 bg-background/80"
                onClick={scrollNext}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {t.calendar.outfitsForDate(outfits.length)}
        </p>
      </DialogContent>
    </Dialog>
  );
}
