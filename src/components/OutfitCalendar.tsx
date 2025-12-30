import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useOutfits, Outfit } from '@/hooks/useOutfits';
import { useWardrobe } from '@/hooks/useWardrobe';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CalendarDays, Images } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isToday,
} from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import OutfitSlideshow from './OutfitSlideshow';

export default function OutfitCalendar() {
  const { t, locale } = useTranslation();
  const { outfits, scheduleOutfit } = useOutfits();
  const { items } = useWardrobe();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const dateLocale = locale === 'fr' ? fr : enUS;

  // Group outfits by scheduled_date
  const outfitsByDate = useMemo(() => {
    const map: Record<string, Outfit[]> = {};
    outfits.forEach((outfit) => {
      if (outfit.scheduled_date) {
        const dateKey = outfit.scheduled_date;
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(outfit);
      }
    });
    return map;
  }, [outfits]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Padding for week start (Sunday = 0)
  const startPadding = getDay(monthStart);
  const paddingDays = Array(startPadding).fill(null);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDayClick = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    if (outfitsByDate[dateKey]?.length) {
      setSelectedDate(date);
      setSlideshowOpen(true);
    }
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    setDragOverDate(format(date, 'yyyy-MM-dd'));
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = async (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    setDragOverDate(null);
    const outfitId = e.dataTransfer.getData('outfitId');
    if (outfitId) {
      await scheduleOutfit(outfitId, format(date, 'yyyy-MM-dd'));
    }
  };

  const getItemImage = (itemId: string) => {
    return items.find((i) => i.id === itemId)?.image_url;
  };

  const outfitsForSelectedDate = selectedDate
    ? outfitsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          {t.calendar.title}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-xs text-muted-foreground font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}
        {daysInMonth.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayOutfits = outfitsByDate[dateKey] || [];
          const hasOutfits = dayOutfits.length > 0;
          const isDragOver = dragOverDate === dateKey;
          const isCurrentDay = isToday(day);

          return (
            <div
              key={dateKey}
              className={`aspect-square rounded-md border transition-all cursor-pointer overflow-hidden ${
                !isSameMonth(day, currentMonth) ? 'opacity-30' : ''
              } ${isDragOver ? 'ring-2 ring-primary bg-primary/10' : ''} ${
                isCurrentDay ? 'border-primary' : 'border-border'
              } ${hasOutfits ? 'bg-muted/50' : 'hover:bg-muted/30'}`}
              onClick={() => handleDayClick(day)}
              onDragOver={(e) => handleDragOver(e, day)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, day)}
            >
              <div className="p-1 h-full flex flex-col">
                <span
                  className={`text-xs ${isCurrentDay ? 'font-bold text-primary' : ''}`}
                >
                  {format(day, 'd')}
                </span>
                {hasOutfits && (
                  <div className="flex-1 flex items-center justify-center">
                    {dayOutfits[0].try_on_image_url ? (
                      <img
                        src={dayOutfits[0].try_on_image_url}
                        alt=""
                        className="w-full h-full object-cover rounded-sm"
                      />
                    ) : dayOutfits[0].items[0] ? (
                      <img
                        src={getItemImage(dayOutfits[0].items[0]) || ''}
                        alt=""
                        className="w-6 h-6 rounded-sm object-cover"
                      />
                    ) : (
                      <Badge variant="secondary" className="text-[10px] px-1">
                        {dayOutfits.length}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        {t.calendar.dragToSchedule}
      </p>

      {/* Slideshow dialog */}
      <OutfitSlideshow
        open={slideshowOpen}
        onOpenChange={setSlideshowOpen}
        outfits={outfitsForSelectedDate}
        date={selectedDate}
      />
    </Card>
  );
}
