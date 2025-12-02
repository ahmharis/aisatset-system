import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export default async (request, context) => {
  const url = new URL(request.url);
  const secret = url.searchParams.get("kunci_rahasia");
  
  if (secret !== "SATSET_CUAN") return new Response("Akses Ditolak", { status: 403 });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const firebaseConfig = {
    apiKey: Netlify.env.get("FB_API_KEY"),
    authDomain: Netlify.env.get("FB_AUTH_DOMAIN"),
    projectId: Netlify.env.get("FB_PROJECT_ID"),
    appId: Netlify.env.get("FB_APP_ID")
  };
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    const body = await request.json();
    const email = body.email;
    
    // Default 3 Device (Bisa diubah dari Zapier jika produk Enterprise)
    const maxDevices = body.max_devices || 3; 

    if (!email) return new Response("Email wajib ada", { status: 400 });

    // --- LOGIKA GENERATOR NAMA OTOMATIS ---
    
    // 1. Ambil nama dari email (sebelum @), buang angka/simbol, huruf besar semua
    let cleanName = email.split('@')[0].replace(/[^a-zA-Z]/g, '').toUpperCase();
    
    // 2. Jika nama terlalu pendek (<3 huruf), tambah variasi
    if (cleanName.length < 3) cleanName = "MEMBER";
    
    // 3. Batasi maksimal 10 huruf agar kode tidak kepanjangan
    cleanName = cleanName.substring(0, 10);

    // 4. Tambah 4 digit angka acak (1000-9999) agar unik
    const randomDigits = Math.floor(1000 + Math.random() * 9000);

    // 5. Format Akhir: SATSET-NAMA-ANGKA (Contoh: SATSET-BUDI-8821)
    const newCode = `SATSET-${cleanName}-${randomDigits}`;

    // --- SIMPAN KE DATABASE ---

    await setDoc(doc(db, "licenses", newCode), {
      owner_email: email,
      max_devices: parseInt(maxDevices),
      created_at: new Date().toISOString(),
      status: "active",
      valid_tokens: []
    });

    await setDoc(doc(db, "claims", email), { license_code: newCode });

    return new Response(JSON.stringify({ success: true, code: newCode }), {
      headers: { "Content-Type": "application/json" }, status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
};
