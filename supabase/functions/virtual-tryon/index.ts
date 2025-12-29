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

    // Define style-specific prompts - ONLY show provided items, no added accessories
    const stylePrompts: Record<string, string> = {
      flatlay: `Generate a flat lay fashion photo with ONLY these two clothing items:
- A top garment laid flat
- A bottom garment laid flat

Style: Top-down view on clean marble or wood surface. Professional lighting. No accessories, no shoes, no watches, no jewelry - ONLY the two clothing items provided. Instagram aesthetic.`,
      
      mannequin: `Generate a fashion photo showing ONLY these two clothing items on a simple mannequin form:
- The top garment
- The bottom garment

Style: Clean studio background, professional lighting. Do NOT add any accessories, shoes, watches, belts or jewelry. Show ONLY the exact two items provided.`,
      
      editorial: `Generate an editorial fashion photo featuring ONLY these two clothing items:
- One top
- One bottom

Style: Magazine quality, artistic lighting. Do NOT add any accessories like watches, belts, jewelry or shoes. Show ONLY the two clothing items, nothing else.`,
    };

    const selectedStyle = visualizationStyle || "mannequin";
    const basePrompt = stylePrompts[selectedStyle] || stylePrompts.mannequin;

    const prompt = `${basePrompt}

CRITICAL INSTRUCTIONS:
- Use the FIRST image as reference for the TOP clothing item
- Use the SECOND image as reference for the BOTTOM clothing item
- Recreate these exact items in the generated image
- Do NOT add any accessories, shoes, watches, belts, or jewelry
- Show ONLY these two clothing items together

${userDescription ? `User note: ${userDescription}` : ''}`;

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
