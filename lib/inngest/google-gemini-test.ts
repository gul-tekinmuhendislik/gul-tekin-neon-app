import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const testGoogleGemini = inngest.createFunction(
  {
    id: "test-google-gemini",
    name: "Test Google Gemini API",
  },
  { event: "google.gemini.test" },
  async ({ event, step }) => {
    const result = await step.run("call-gemini-api", async () => {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("GOOGLE_GEMINI_API_KEY is not set");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = event.data.prompt || "Merhaba! Gül-Tekin Mühendislik hakkında kısa bir bilgi ver.";

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        prompt,
        response: text,
        model: "gemini-1.5-flash",
        timestamp: new Date().toISOString()
      };
    });

    await step.run("log-result", async () => {
      console.log("Gemini API Test Result:", result);
      return result;
    });

    return {
      success: true,
      data: result
    };
  }
);

export const generateContentWithGemini = inngest.createFunction(
  {
    id: "generate-content-with-gemini",
    name: "Generate Content with Gemini",
  },
  { event: "content.generate.gemini" },
  async ({ event, step }) => {
    const { topic, type, keywords } = event.data;

    const generatedContent = await step.run("generate-with-gemini", async () => {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("GOOGLE_GEMINI_API_KEY is not set");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const prompt = `
        Gül-Tekin Mühendislik için ${type} türünde bir içerik oluştur.

        Konu: ${topic}
        Anahtar Kelimeler: ${keywords?.join(", ") || "mühendislik, inşaat, proje"}

        İçerik Gereksinimleri:
        - SEO optimizeli olmalı
        - Profesyonel ve bilgilendirici olmalı
        - Türkçe dilinde olmalı
        - E-E-A-T (Expertise, Experience, Authoritativeness, Trustworthiness) ilkelerine uygun olmalı

        Lütfen şu formatta yanıt ver:

        **Başlık:**
        [İçerik başlığı]

        **Meta Açıklama:**
        [SEO için meta açıklama]

        **İçerik:**
        [Ana içerik metni]

        **Anahtar Kelimeler:**
        [Virgülle ayrılmış anahtar kelimeler]
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        topic,
        type,
        content: text,
        model: "gemini-1.5-pro",
        generatedAt: new Date().toISOString()
      };
    });

    const savedContent = await step.run("save-to-database", async () => {
      // Veritabanına kaydetme işlemi eklenebilir
      console.log("Generated content:", generatedContent);
      return generatedContent;
    });

    return {
      success: true,
      data: savedContent
    };
  }
);