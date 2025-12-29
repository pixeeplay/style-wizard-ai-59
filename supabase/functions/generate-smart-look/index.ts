import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WardrobeItem {
  id: string;
  category: string;
  color: string;
  style: string | null;
  season: string | null;
  name: string | null;
}

interface WeatherInfo {
  avgTemp: number;
  conditions: string[];
  recommendation: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, weather, wardrobeItems } = await req.json() as {
      prompt: string;
      weather: WeatherInfo | null;
      wardrobeItems: WardrobeItem[];
    };

    if (!wardrobeItems || wardrobeItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No wardrobe items provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Separate items by category
    const tops = wardrobeItems.filter(i => ['top', 'dress', 'outerwear'].includes(i.category));
    const bottoms = wardrobeItems.filter(i => ['bottom', 'dress'].includes(i.category));

    if (tops.length === 0 || bottoms.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Need at least one top and one bottom' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context for AI
    const weatherContext = weather
      ? `Current weather: ${weather.avgTemp}°C, conditions: ${weather.conditions.join(', ')}. Recommendation: ${weather.recommendation}.`
      : 'Weather information not available.';

    const topsDesc = tops.map(t => `- ID:${t.id} | ${t.name || t.category} | color:${t.color} | style:${t.style || 'any'} | season:${t.season || 'all'}`).join('\n');
    const bottomsDesc = bottoms.map(b => `- ID:${b.id} | ${b.name || b.category} | color:${b.color} | style:${b.style || 'any'} | season:${b.season || 'all'}`).join('\n');

    const systemPrompt = `You are a fashion stylist AI. Your task is to select the best outfit (one top and one bottom) from the user's wardrobe based on their mood/request and the current weather.

Rules:
1. Pick colors that go well together
2. Consider the weather when selecting items
3. Match the style to the user's mood/request
4. Return ONLY a JSON object with topId and bottomId

Available tops:
${topsDesc}

Available bottoms:
${bottomsDesc}

${weatherContext}`;

    const userMessage = prompt || 'Pick a nice outfit for today';

    console.log('Calling Lovable AI for smart look generation...');
    console.log('User prompt:', userMessage);
    console.log('Weather:', weatherContext);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'select_outfit',
              description: 'Select the best top and bottom for the outfit',
              parameters: {
                type: 'object',
                properties: {
                  topId: { type: 'string', description: 'The ID of the selected top' },
                  bottomId: { type: 'string', description: 'The ID of the selected bottom' },
                  reasoning: { type: 'string', description: 'Brief explanation of why this outfit was chosen' },
                },
                required: ['topId', 'bottomId'],
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'select_outfit' } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data));

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'select_outfit') {
      console.error('No valid tool call in response');
      // Fallback: pick random
      const randomTop = tops[Math.floor(Math.random() * tops.length)];
      const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
      return new Response(
        JSON.stringify({ topId: randomTop.id, bottomId: randomBottom.id, reasoning: 'Random selection (AI fallback)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log('Selected outfit:', result);

    // Validate IDs exist
    const validTop = tops.find(t => t.id === result.topId);
    const validBottom = bottoms.find(b => b.id === result.bottomId);

    if (!validTop || !validBottom) {
      console.error('Invalid IDs returned by AI, falling back to random');
      const randomTop = tops[Math.floor(Math.random() * tops.length)];
      const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
      return new Response(
        JSON.stringify({ topId: randomTop.id, bottomId: randomBottom.id, reasoning: 'Fallback selection' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ topId: result.topId, bottomId: result.bottomId, reasoning: result.reasoning || '' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-smart-look:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
