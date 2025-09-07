import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    // Domain doğrulanana kadar onboarding@resend.dev kullanıyoruz
    const fromEmail = "onboarding@resend.dev";
    const toEmail = "info@gul-tekinmuhendislik.com";
    const apiKey = process.env.RESEND_API_KEY;
    
    console.log("🔧 Testing email configuration...");
    console.log("Environment variables:", {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      apiKeyPrefix: apiKey?.substring(0, 10) + "...",
      fromEmail: fromEmail,
    });
    
    if (!fromEmail || !apiKey) {
      return NextResponse.json({
        error: "Missing configuration",
        RESEND_FROM_EMAIL: !!fromEmail,
        RESEND_API_KEY: !!apiKey,
      }, { status: 500 });
    }
    
    // Test email
    const testData = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: "Test Email - Gul Tekin Website",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Test Email</h2>
          <p>This is a test email from your contact form system.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
          <p>If you receive this email, your configuration is working correctly!</p>
        </div>
      `,
      text: `Test Email\n\nThis is a test email from your contact form system.\nTimestamp: ${new Date().toISOString()}`,
    });
    
    console.log("✅ Test email sent successfully:", testData);
    
    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      data: testData,
      config: {
        from: fromEmail,
        to: toEmail,
      }
    });
    
  } catch (error) {
    console.error("❌ Test email error:", error);
    
    return NextResponse.json({
      error: "Failed to send test email",
      details: error instanceof Error ? error.message : "Unknown error",
      errorType: error?.constructor?.name,
      fullError: JSON.stringify(error, null, 2)
    }, { status: 500 });
  }
}