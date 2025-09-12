import { NextResponse } from "next/server";
import { generateAndSaveContent } from "@/lib/content-generator";
import { inngest } from "@/lib/inngest/client";

export async function POST() {
  try {
    // Güneş Enerjisi konusu için içerik üret
    const topic = "Güneş Enerjisi Sistemleri fotovoltaik panel";
    
    console.log("Generating content for topic:", topic);
    
    // İçerik üret ve kaydet
    const result = await generateAndSaveContent(topic);
    
    // İçerik oluşturulduktan sonra processNewContent event'ini tetikle
    if (result.contentId) {
      await inngest.send({
        name: "content/created",
        data: {
          contentId: result.contentId,
          topic: topic,
          createdAt: result.createdAt
        }
      });
      
      console.log("Content created event sent for ID:", result.contentId);
    }
    
    return NextResponse.json({
      success: true,
      message: "Güneş Enerjisi içeriği başarıyla oluşturuldu",
      contentId: result.contentId,
      topic: result.topic,
      createdAt: result.createdAt
    });
  } catch (error) {
    console.error("Error generating solar content:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to generate solar energy content",
    endpoint: "/api/generate-solar-content",
    method: "POST",
    topic: "Güneş Enerjisi Sistemleri fotovoltaik panel"
  });
}