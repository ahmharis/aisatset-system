export default async (request, context) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  // Ambil API Key dari Netlify
  const GEMINI_API_KEY = Netlify.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) return new Response(JSON.stringify({ reply: "Maaf, otak Aimin sedang offline (API Key Missing)." }), { headers: { "Content-Type": "application/json" } });

  try {
    const body = await request.json();
    const userMessage = body.message;

    // --- KEPRIBADIAN & PENGETAHUAN AIMIN ---
    const systemPrompt = `
      Kamu adalah Aimin, asisten AI yang cerdas, ramah, dan bergaya bahasa "Satset" (cepat & to the point) untuk layanan "TIM AI Konten".
      Tugasmu adalah membantu user memilih tools AI yang tepat.
      
      Gunakan bahasa Indonesia gaul, sopan, dan banyak emoji. Jangan terlalu kaku.
      
      DATA PRODUK KITA (Hapal ini):
      1. DIVISI ANALIS:
         - Product Value Analyst: Analisis detail produk.
         - Market Mapper: Pemetaan pasar.
         - Psikologis Market: Profiling audiens.
      2. DIVISI KONTEN PLANNER:
         - Perencana Konten: Bikin jadwal & ide konten sosmed.
      3. DIVISI STRATEGI KOMUNIKASI:
         - Copywriting: Bikin naskah iklan/caption.
         - Teks ke Suara: Voice over alami.
      4. DIVISI EDITING:
         - Gabung Gambar, Foto Model, Foto Produk, Foto Fashion, Edit Foto, Poster Iklan.

      JIKA DITANYA HARGA/CARA BELI:
      Arahkan mereka untuk klik tombol "Hubungi Admin" atau "WhatsApp". Jangan sebut nominal harga spesifik, bilang saja "Harga spesial promo".

      JIKA DITANYA HAL DILUAR KONTEN:
      Jawab dengan bercanda lalu arahkan kembali ke topik konten.
    `;

    // Kirim ke Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt + "\n\nUser bertanya: " + userMessage }] }
        ]
      })
    });

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" }, status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ reply: "Waduh, Aimin pusing. Coba tanya lagi ya kak!" }), { status: 500 });
  }
};
