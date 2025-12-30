import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Star, Check, Loader2, Instagram, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  const handleCopyLink = async (imageUrl: string) => {
    await navigator.clipboard.writeText(imageUrl);
    toast({
      title: t.gallery.linkCopied,
      description: t.gallery.linkCopiedDesc,
    });
  };

  const handleShareInstagram = async (imageUrl: string, style: string) => {
    // Instagram doesn't have a direct web share API, so we download the image
    // and copy the caption to clipboard for the user to paste
    const caption = `${t.gallery.instagramCaption} #SmartStyle #OOTD #Fashion #${style}`;
    
    try {
      await navigator.clipboard.writeText(caption);
      
      // Download the image for the user
      handleDownload(imageUrl, style);
      
      toast({
        title: t.gallery.instagramReady,
        description: t.gallery.instagramReadyDesc,
      });
    } catch (error) {
      console.error('Instagram share error:', error);
    }
  };

  const handleSharePinterest = (imageUrl: string, style: string) => {
    const description = encodeURIComponent(`${t.gallery.pinterestCaption} - ${styleLabels[style as keyof TryOnImages]} #SmartStyle #Fashion`);
    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(imageUrl)}&description=${description}`;
    window.open(pinterestUrl, '_blank', 'width=750,height=600');
  };

  const handleNativeShare = async (imageUrl: string, style: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `SmartStyle - ${styleLabels[style as keyof TryOnImages]}`,
          text: t.gallery.shareText,
          url: imageUrl,
        });
      } else {
        await handleCopyLink(imageUrl);
        setCopiedStyle(style);
        setTimeout(() => setCopiedStyle(null), 2000);
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
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {copiedStyle === style ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Share2 className="w-3 h-3" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => handleShareInstagram(imageUrl, style)}>
                          <Instagram className="w-4 h-4 mr-2" />
                          Instagram
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSharePinterest(imageUrl, style)}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Pinterest
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleNativeShare(imageUrl, style)}>
                          <Share2 className="w-4 h-4 mr-2" />
                          {t.gallery.shareOther}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyLink(imageUrl)}>
                          <Check className="w-4 h-4 mr-2" />
                          {t.gallery.copyLink}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
