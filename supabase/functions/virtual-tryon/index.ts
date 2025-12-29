import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userAvatarUrl, topImageUrl, bottomImageUrl, userDescription, visualizationStyle } = await req.json();
    
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

    console.log("Generating virtual try-on image with style:", visualizationStyle || "mannequin");

    // Define style-specific prompts
    const stylePrompts: Record<string, string> = {
      flatlay: `Create a beautiful flat lay fashion photography of an outfit.
        
Layout style:
- Top-down view of clothes laid flat on a clean, elegant surface
- Soft marble, wooden, or fabric background in neutral tones
- Clothes arranged artistically with natural-looking folds
- Include subtle styling props like a watch, sunglasses, or jewelry nearby
- Professional product photography lighting with soft shadows
- Instagram-worthy aesthetic, aspirational and luxurious`,
      
      mannequin: `Create a fashion lookbook photo showing a stylish outfit on an elegant mannequin.
        
Style details:
- Modern, sleek mannequin silhouette (torso form or full body)
- Clean, minimalist studio background (soft gradient or solid neutral)
- Professional fashion photography lighting
- Clothes should drape naturally and look premium
- High-end boutique or showroom aesthetic`,
      
      editorial: `Create a high-fashion editorial photograph featuring this outfit.
        
Style details:
- Dynamic fashion model pose (can show partial figure or artistic crop)
- Magazine-quality editorial aesthetic
- Dramatic or artistic lighting (studio or urban setting)
- Contemporary fashion photography style
- Vogue or Elle magazine inspired composition
- Focus on the outfit while maintaining artistic flair`,
    };

    const selectedStyle = visualizationStyle || "mannequin";
    const basePrompt = stylePrompts[selectedStyle] || stylePrompts.mannequin;

    const prompt = `${basePrompt}

The outfit consists of:
- TOP: The clothing item shown in the first reference image
- BOTTOM: The clothing item shown in the second reference image

${userDescription ? `Additional context: ${userDescription}` : ''}

IMPORTANT: Show both clothing items together as a complete outfit combination. Ultra high resolution, professional quality.`;

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
