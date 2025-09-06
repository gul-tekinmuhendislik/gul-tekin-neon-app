import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";

export const dynamic = "force-dynamic";

export async function GET() {
  await inngest.send({
    name: "test/hello.world",
    data: {
      email: "testUser@example.com",
    },
  });

  return NextResponse.json({ 
    message: "Hello World event triggered!",
    check: "Visit http://localhost:8288 to see the event" 
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { eventType, data } = body;

  let result;
  
  switch(eventType) {
    case "hello":
      result = await inngest.send({
        name: "test/hello.world",
        data: data || { email: "default@example.com" }
      });
      break;
      
    case "signup":
      result = await inngest.send({
        name: "user/signup",
        data: data || { email: "newuser@example.com", name: "New User" }
      });
      break;
      
    default:
      return NextResponse.json(
        { error: "Invalid event type. Use 'hello' or 'signup'" },
        { status: 400 }
      );
  }

  return NextResponse.json({ 
    message: `Event '${eventType}' triggered successfully!`,
    eventId: result.ids?.[0],
    check: "Visit http://localhost:8288 to see the event"
  });
}