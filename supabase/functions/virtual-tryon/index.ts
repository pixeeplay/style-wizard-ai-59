import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeatherContext {
  avgTemp: number;
  conditions: string[];
  recommendation: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      userAvatarUrl, 
      topImageUrl, 
      bottomImageUrl, 
      userDescription, 
      visualizationStyle, 
      includeAccessories,
      weather,
      city,
    } = await req.json();
    
    if (!topImageUrl || !bottomImageUrl) {
      return new Response(
        JSON.stringify({ error: "Top and bottom images are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating virtual try-on image with style:", visualizationStyle || "mannequin", "accessories:", includeAccessories);
    console.log("Weather context:", weather, "City:", city);

    // Accessory recommendation text
    const accessoryText = includeAccessories 
      ? `
IMPORTANT: Also ADD stylish accessories that complement this outfit:
- Shoes that match the style
- A watch or bracelet
- A belt if appropriate
- Sunglasses or jewelry if it fits the look
These accessories should enhance the overall outfit.`
      : `
CRITICAL: Do NOT add any accessories, shoes, watches, belts, or jewelry. Show ONLY the two clothing items provided.`;

    // Build weather/environment context for background
    let environmentContext = "";
    if (weather && city) {
      const temp = weather.avgTemp;
      const conditions = weather.conditions || [];
      const isCold = temp < 10;
      const isHot = temp > 25;
      const hasSnow = conditions.some((c: string) => c.toLowerCase().includes('snow'));
      const hasRain = conditions.some((c: string) => ['rain', 'drizzle', 'thunderstorm'].includes(c.toLowerCase()));
      const isSunny = conditions.some((c: string) => ['clear', 'sunny'].includes(c.toLowerCase()));
      const isCloudy = conditions.some((c: string) => c.toLowerCase().includes('cloud'));

      let weatherDesc = "";
      if (hasSnow) weatherDesc = "snowy winter scene with snow falling";
      else if (hasRain) weatherDesc = "rainy day with wet streets";
      else if (isCold) weatherDesc = "cold winter day, person might look chilly";
      else if (isHot && isSunny) weatherDesc = "bright sunny summer day";
      else if (isCloudy) weatherDesc = "overcast cloudy day";
      else weatherDesc = "pleasant day";

      environmentContext = `
BACKGROUND CONTEXT:
- Location: ${city}
- Weather: ${temp}°C, ${conditions.join(', ')}
- Scene: Show the outfit in a realistic ${city} street/urban setting with ${weatherDesc}
- If the outfit is not appropriate for the weather (e.g. swimsuit in snow), make it humorous - show the person looking cold/uncomfortable but fashionable!`;
    }

    // Define style-specific prompts
    const stylePrompts: Record<string, string> = {
      flatlay: `Generate a flat lay fashion photo.
Style: Top-down view on clean marble or wood surface. Professional lighting. Instagram aesthetic.`,
      
      mannequin: `Generate a fashion photo showing these clothing items on a stylish mannequin or model figure.
Style: ${environmentContext ? 'Realistic urban background based on context below.' : 'Clean studio background.'} Professional lighting.`,
      
      editorial: `Generate an editorial fashion photo with a stylish model wearing the outfit.
Style: Magazine quality, artistic lighting. ${environmentContext ? 'Use the environmental context for background.' : 'Studio or elegant setting.'}`,
    };

    const selectedStyle = visualizationStyle || "mannequin";
    const basePrompt = stylePrompts[selectedStyle] || stylePrompts.mannequin;

    const prompt = `${basePrompt}

INSTRUCTIONS:
- Use the FIRST image as reference for the TOP clothing item
- Use the SECOND image as reference for the BOTTOM clothing item
- Recreate these exact items in the generated image
${accessoryText}
${environmentContext}

${userDescription ? `User note: ${userDescription}` : ''}`;

    console.log("Prompt:", prompt);

    const messageContent: any[] = [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: topImageUrl } },
      { type: "image_url", image_url: { url: bottomImageUrl } },
    ];

    // Add user avatar if provided for personalization
    if (userAvatarUrl) {
      messageContent.push({ 
        type: "image_url", 
        image_url: { url: userAvatarUrl } 
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: messageContent,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract the generated image
    const message = data.choices?.[0]?.message;
    const generatedImage = message?.images?.[0]?.image_url?.url;
    const textContent = message?.content;

    if (!generatedImage) {
      console.error("No image in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "No image was generated", details: textContent }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Virtual try-on image generated successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: generatedImage,
        description: textContent 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in virtual-tryon function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
