import { Resend } from "resend";

async function testContactForm() {
  try {
    console.log("📧 Contact Form Test");
    console.log("============================\n");
    
    // Test the contact form API endpoint
    const testData = {
      name: "Test Kullanıcı",
      email: "test@example.com",
      subject: "Test Mesajı",
      message: "Bu bir test mesajıdır. İletişim formu çalışıyor mu kontrol ediyoruz."
    };
    
    console.log("📝 Test verisi:");
    console.log(`   Ad: ${testData.name}`);
    console.log(`   Email: ${testData.email}`);
    console.log(`   Konu: ${testData.subject}`);
    console.log(`   Mesaj: ${testData.message}\n`);
    
    // Test directly with Resend API
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    
    if (!fromEmail) {
      console.error("❌ RESEND_FROM_EMAIL tanımlı değil!");
      process.exit(1);
    }
    
    console.log("📤 Email gönderiliyor...");
    console.log(`   From: ${fromEmail}`);
    console.log(`   To: ${fromEmail}`);
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: fromEmail,
      subject: `İletişim Formu: ${testData.subject}`,
      replyTo: testData.email,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Yeni İletişim Formu Mesajı</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-top: 20px;">
            <p><strong>Ad Soyad:</strong> ${testData.name}</p>
            <p><strong>E-posta:</strong> ${testData.email}</p>
            <p><strong>Konu:</strong> ${testData.subject}</p>
            <div style="margin-top: 20px;">
              <strong>Mesaj:</strong>
              <p style="white-space: pre-wrap; background-color: white; padding: 15px; border-radius: 5px;">
                ${testData.message}
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
        
        Ad Soyad: ${testData.name}
        E-posta: ${testData.email}
        Konu: ${testData.subject}
        
        Mesaj:
        ${testData.message}
      `,
    });
    
    console.log("\n✅ İletişim formu email'i başarıyla gönderildi!");
    console.log(`📧 Email ID: ${'data' in result && result.data ? result.data.id : 'N/A'}`);
    
    // Now test the API endpoint
    console.log("\n🔌 API endpoint testi yapılıyor...");
    console.log("   URL: http://localhost:3000/api/contact");
    
    const response = await fetch("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("\n✅ API endpoint başarıyla çalışıyor!");
      console.log("   Response:", data.message || "Email gönderildi");
    } else {
      const error = await response.text();
      console.error("\n❌ API endpoint hatası:");
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${error}`);
    }
    
  } catch (error) {
    console.error("\n❌ Test hatası:");
    console.error(error);
    
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        console.error("\n⚠️  Sunucu çalışmıyor olabilir. 'npm run dev' komutunu çalıştırın.");
      }
    }
    
    process.exit(1);
  }
}

testContactForm().then(() => {
  console.log("\n🎉 Test tamamlandı!");
  process.exit(0);
});