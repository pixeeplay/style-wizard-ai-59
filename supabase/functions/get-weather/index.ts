import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherData {
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  conditions: string[];
  recommendation: string;
  dailyForecasts: Array<{
    date: string;
    temp: number;
    condition: string;
    icon: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, departureDate, days } = await req.json();

    if (!destination) {
      return new Response(
        JSON.stringify({ error: 'Destination is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    if (!apiKey) {
      console.error('OPENWEATHER_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Weather service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching weather for ${destination}, departure: ${departureDate}, days: ${days}`);

    // First, get coordinates for the destination using geocoding API
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${apiKey}`;
    const geoResponse = await fetch(geoUrl);
    
    if (!geoResponse.ok) {
      console.error('Geocoding API error:', geoResponse.status, await geoResponse.text());
      return new Response(
        JSON.stringify({ error: 'Geocoding service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geoData = await geoResponse.json();
    console.log('Geocoding response:', JSON.stringify(geoData));

    if (!geoData || !Array.isArray(geoData) || geoData.length === 0) {
      console.error('No geocoding results for:', destination);
      return new Response(
        JSON.stringify({ error: `City not found: "${destination}". Try a different spelling or add the country name.` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firstResult = geoData[0];
    if (!firstResult || typeof firstResult.lat !== 'number' || typeof firstResult.lon !== 'number') {
      console.error('Invalid geocoding result:', firstResult);
      return new Response(
        JSON.stringify({ error: 'Invalid location data received' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { lat, lon, name, country } = firstResult;
    console.log(`Found location: ${name}, ${country} at ${lat}, ${lon}`);

    // Get 5-day forecast (free API limit)
    const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=en`;
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    if (!forecastResponse.ok) {
      console.error('Forecast API error:', forecastData);
      return new Response(
        JSON.stringify({ error: 'Unable to fetch weather data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process forecast data
    const forecasts = forecastData.list || [];
    const dailyData: Map<string, { temps: number[], conditions: string[], icons: string[] }> = new Map();

    forecasts.forEach((item: any) => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyData.has(date)) {
        dailyData.set(date, { temps: [], conditions: [], icons: [] });
      }
      const day = dailyData.get(date)!;
      day.temps.push(item.main.temp);
      day.conditions.push(item.weather[0].main);
      day.icons.push(item.weather[0].icon);
    });

    // Build daily forecasts array
    const dailyForecasts: WeatherData['dailyForecasts'] = [];
    const allTemps: number[] = [];
    const allConditions: string[] = [];

    Array.from(dailyData.entries()).slice(0, Math.min(days, 5)).forEach(([date, data]) => {
      const avgTemp = Math.round(data.temps.reduce((a, b) => a + b, 0) / data.temps.length);
      const mainCondition = data.conditions.sort((a, b) =>
        data.conditions.filter(c => c === a).length - data.conditions.filter(c => c === b).length
      ).pop() || 'Clear';
      const mainIcon = data.icons[0];

      dailyForecasts.push({
        date,
        temp: avgTemp,
        condition: mainCondition,
        icon: mainIcon,
      });

      allTemps.push(...data.temps);
      allConditions.push(mainCondition);
    });

    // Calculate overall stats
    const avgTemp = Math.round(allTemps.reduce((a, b) => a + b, 0) / allTemps.length);
    const minTemp = Math.round(Math.min(...allTemps));
    const maxTemp = Math.round(Math.max(...allTemps));

    // Get unique conditions
    const uniqueConditions = [...new Set(allConditions)];

    // Generate recommendation
    let recommendation: string;
    const hasRain = uniqueConditions.some(c => ['Rain', 'Drizzle', 'Thunderstorm'].includes(c));
    const hasSnow = uniqueConditions.includes('Snow');

    if (avgTemp < 10) {
      recommendation = 'cold';
    } else if (avgTemp > 25) {
      recommendation = 'hot';
    } else if (hasRain) {
      recommendation = 'rain';
    } else if (hasSnow) {
      recommendation = 'cold';
    } else {
      recommendation = 'normal';
    }

    const weatherData: WeatherData = {
      avgTemp,
      minTemp,
      maxTemp,
      conditions: uniqueConditions,
      recommendation,
      dailyForecasts,
    };

    console.log('Weather data processed:', JSON.stringify(weatherData));

    return new Response(
      JSON.stringify({ 
        weather: weatherData,
        location: { name, country }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching weather:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
