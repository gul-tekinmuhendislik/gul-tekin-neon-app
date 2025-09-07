import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    console.log("🔧 Email Configuration Test");
    console.log("============================");
    
    // Check environment variables
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    
    if (!apiKey) {
      console.error("❌ RESEND_API_KEY is not set");
      process.exit(1);
    }
    console.log("✅ RESEND_API_KEY is configured");
    
    if (!fromEmail) {
      console.error("❌ RESEND_FROM_EMAIL is not set");
      process.exit(1);
    }
    console.log(`✅ RESEND_FROM_EMAIL: ${fromEmail}`);
    
    // Send test email
    console.log("\n📧 Sending test email...");
    
    const data = await resend.emails.send({
      from: fromEmail,
      to: fromEmail, // Sending to self for testing
      subject: "Test Email - Gül-Tekin Mühendislik Sistem Testi",
      replyTo: fromEmail,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🎉 Email Sistemi Çalışıyor!</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-top: 20px;">
            <p><strong>Test Zamanı:</strong> ${new Date().toLocaleString('tr-TR')}</p>
            <p><strong>Gönderen:</strong> ${fromEmail}</p>
            <p><strong>API Durumu:</strong> Aktif</p>
            <div style="margin-top: 20px;">
              <p>Bu test emaili, Resend API entegrasyonunun başarıyla çalıştığını doğrulamaktadır.</p>
            </div>
          </div>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            Bu otomatik test mesajıdır. Gül-Tekin Mühendislik sistem kontrolü.
          </p>
        </div>
      `,
      text: `
        Email Sistemi Çalışıyor!
        
        Test Zamanı: ${new Date().toLocaleString('tr-TR')}
        Gönderen: ${fromEmail}
        API Durumu: Aktif
        
        Bu test emaili, Resend API entegrasyonunun başarıyla çalıştığını doğrulamaktadır.
      `,
    });
    
    console.log("\n✅ Email başarıyla gönderildi!");
    console.log("📊 Email Details:");
    console.log(`   - Email ID: ${'data' in data && data.data ? data.data.id : 'N/A'}`);
    console.log(`   - To: ${fromEmail}`);
    console.log(`   - Subject: Test Email - Gül-Tekin Mühendislik Sistem Testi`);
    console.log("\n💡 Email sistemi aktif ve çalışıyor!");
    
  } catch (error) {
    console.error("\n❌ Email gönderme hatası:");
    console.error(error);
    
    if (error instanceof Error) {
      if (error.message.includes("API")) {
        console.error("\n⚠️  API anahtarı geçersiz olabilir. RESEND_API_KEY değerini kontrol edin.");
      } else if (error.message.includes("domain")) {
        console.error("\n⚠️  Domain doğrulaması gerekebilir. Resend dashboard'da domain ayarlarını kontrol edin.");
      }
    }
    
    process.exit(1);
  }
}

testEmail().then(() => {
  console.log("\n✅ Test tamamlandı");
  process.exit(0);
});