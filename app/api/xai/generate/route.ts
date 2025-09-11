import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      topic, 
      keywords = [], 
      contentType = "blog",
      action = "generate" // generate, enhance, image
    } = body;

    if (!topic && action === "generate") {
      return NextResponse.json(
        { error: "Topic is required for content generation" },
        { status: 400 }
      );
    }

    let event;
    let eventData;

    switch (action) {
      case "generate":
        event = "content/generate.xai";
        eventData = {
          topic,
          keywords: Array.isArray(keywords) ? keywords : [keywords],
          contentType
        };
        break;

      case "enhance":
        const { contentId, enhancementType = "improve" } = body;
        if (!contentId) {
          return NextResponse.json(
            { error: "Content ID is required for enhancement" },
            { status: 400 }
          );
        }
        event = "content/enhance.xai";
        eventData = {
          contentId,
          enhancementType
        };
        break;

      case "image":
        const { contentId: imgContentId, title } = body;
        event = "image/generate.xai";
        eventData = {
          contentId: imgContentId,
          title: title || topic,
          topic: topic
        };
        break;

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}` },
          { status: 400 }
        );
    }

    // Trigger Inngest function
    const result = await inngest.send({
      name: event,
      data: eventData
    });

    return NextResponse.json({
      success: true,
      message: `XAI ${action} process initiated`,
      eventId: result.ids[0],
      data: eventData
    });

  } catch (error) {
    console.error("Error in XAI API route:", error);
    return NextResponse.json(
      { 
        error: "Failed to process XAI request",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "XAI Content Generation API",
    endpoints: {
      generate: {
        method: "POST",
        body: {
          action: "generate",
          topic: "string (required)",
          keywords: "array (optional)",
          contentType: "blog | article (optional, default: blog)"
        }
      },
      enhance: {
        method: "POST",
        body: {
          action: "enhance",
          contentId: "number (required)",
          enhancementType: "improve | summarize | social (optional, default: improve)"
        }
      },
      image: {
        method: "POST",
        body: {
          action: "image",
          topic: "string (required)",
          title: "string (optional)",
          contentId: "number (optional)"
        }
      }
    },
    examples: {
      generate: {
        action: "generate",
        topic: "Neon Tabelaların Avantajları",
        keywords: ["neon tabela", "led tabela", "ışıklı tabela"],
        contentType: "blog"
      },
      enhance: {
        action: "enhance",
        contentId: 1,
        enhancementType: "improve"
      },
      image: {
        action: "image",
        topic: "Neon Tabelaların Avantajları",
        title: "Modern Neon Tabela Tasarımları"
      }
    }
  });
}