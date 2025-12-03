const fetch = require('node-fetch'); // Wajib untuk Node.js
const { URLSearchParams } = require('url'); // Wajib untuk mengelola URL

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Ambil API Key dari Environment Variables Netlify
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        // Jika API Key hilang, kembalikan error agar Frontend tahu untuk pakai Fallback
        return { statusCode: 500, body: JSON.stringify({ reply: "API_KEY_MISSING" }) };
    }

    try {
        const body = JSON.parse(event.body);
        const userMessage = body.message;

        const systemPrompt = `
            Kamu adalah Aimin, asisten AI "TIM AI Konten". Gaya bahasa santai, "Satset", sopan, dan menggunakan emoji.
            Tugas: Jelaskan produk (Divisi Analis, Planner, Komunikasi, Editing).
            Jika tanya harga/beli: Arahkan klik tombol Hubungi Admin.
            Jawablah dengan singkat dan padat.
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nUser: " + userMessage }] }]
            })
        });

        const data = await response.json();
        let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Aduh, Aimin bingung mau jawab apa. Coba ulangi ya kak!";

        return {
            statusCode: 200,
            body: JSON.stringify({ reply })
        };

    } catch (error) {
        console.error("Gemini API Error:", error);
        return { statusCode: 500, body: JSON.stringify({ reply: "BACKEND_ERROR" }) };
    }
};
