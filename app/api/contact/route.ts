import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Tüm alanlar gereklidir" },
        { status: 400 }
      );
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL;
    
    if (!fromEmail) {
      console.error("RESEND_FROM_EMAIL is not set in environment variables");
      return NextResponse.json(
        { error: "E-posta yapılandırması eksik" },
        { status: 500 }
      );
    }

    const data = await resend.emails.send({
      from: fromEmail,
      to: fromEmail, // Kendinize gönderiyorsunuz
      subject: `İletişim Formu: ${subject}`,
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Yeni İletişim Formu Mesajı</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-top: 20px;">
            <p><strong>Ad Soyad:</strong> ${name}</p>
            <p><strong>E-posta:</strong> ${email}</p>
            <p><strong>Konu:</strong> ${subject}</p>
            <div style="margin-top: 20px;">
              <strong>Mesaj:</strong>
              <p style="white-space: pre-wrap; background-color: white; padding: 15px; border-radius: 5px;">
                ${message}
              </p>
            </div>
          </div>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            Bu mesaj web sitesi iletişim formundan gönderilmiştir.
          </p>
        </div>
      `,
      text: `
        Yeni İletişim Formu Mesajı
        
        Ad Soyad: ${name}
        E-posta: ${email}
        Konu: ${subject}
        
        Mesaj:
        ${message}
      `,
    });

    return NextResponse.json(
      { message: "E-posta başarıyla gönderildi", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "E-posta gönderilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}