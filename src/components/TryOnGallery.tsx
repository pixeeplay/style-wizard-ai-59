import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Star, Copy, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface TryOnImages {
  flatlay: string | null;
  mannequin: string | null;
  editorial: string | null;
}

interface TryOnGalleryProps {
  images: TryOnImages;
  generating: { flatlay: boolean; mannequin: boolean; editorial: boolean };
  onSelectPrimary: (style: keyof TryOnImages) => void;
  primaryStyle: keyof TryOnImages;
}

export default function TryOnGallery({ images, generating, onSelectPrimary, primaryStyle }: TryOnGalleryProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);

  const styleLabels: Record<keyof TryOnImages, string> = {
    flatlay: t.stylist.flatLay,
    mannequin: t.stylist.mannequin,
    editorial: t.stylist.editorial,
  };

  const handleDownload = (imageUrl: string, style: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `smartstyle-${style}-${Date.now()}.png`;
    link.click();
  };

  const handleShare = async (imageUrl: string, style: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `SmartStyle - ${styleLabels[style as keyof TryOnImages]}`,
          text: t.gallery.shareText,
          url: imageUrl,
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        setCopiedStyle(style);
        setTimeout(() => setCopiedStyle(null), 2000);
        toast({
          title: t.gallery.linkCopied,
          description: t.gallery.linkCopiedDesc,
        });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const styles: (keyof TryOnImages)[] = ['flatlay', 'mannequin', 'editorial'];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">{t.gallery.allStyles}</h3>
      <div className="grid grid-cols-3 gap-3">
        {styles.map((style) => {
          const imageUrl = images[style];
          const isGenerating = generating[style];
          const isPrimary = primaryStyle === style;

          return (
            <Card
              key={style}
              className={`relative overflow-hidden cursor-pointer transition-all ${
                isPrimary ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              onClick={() => imageUrl && onSelectPrimary(style)}
            >
              <div className="aspect-square bg-muted">
                {isGenerating ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={styleLabels[style]}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    —
                  </div>
                )}
              </div>

              <div className="p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={isPrimary ? 'default' : 'secondary'} className="text-xs">
                    {styleLabels[style]}
                  </Badge>
                  {isPrimary && <Star className="w-3 h-3 text-primary fill-primary" />}
                </div>

                {imageUrl && !isGenerating && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(imageUrl, style);
                      }}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(imageUrl, style);
                      }}
                    >
                      {copiedStyle === style ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Share2 className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
