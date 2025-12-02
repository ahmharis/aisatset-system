import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export default async (request, context) => {
  const url = new URL(request.url);
  const secret = url.searchParams.get("kunci_rahasia");
  
  // GANTI 'RAHASIA_DAPUR' DENGAN PASSWORD ANDA SENDIRI
  if (secret !== "RAHASIA_DAPUR") return new Response("Akses Ditolak", { status: 403 });
  
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
    
    // UPDATE DI SINI: Default Max Devices jadi 3
    const maxDevices = body.max_devices || 3; 

    if (!email) return new Response("Email wajib ada", { status: 400 });

    // Generate Kode: TIMAI-NAMADEPAN-ACAK
    const emailPrefix = email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 5);
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCode = `TIMAI-${emailPrefix}-${randomStr}`;

    // Simpan Lisensi
    await setDoc(doc(db, "licenses", newCode), {
      owner_email: email,
      max_devices: parseInt(maxDevices),
      created_at: new Date().toISOString(),
      status: "active",
      valid_tokens: []
    });

    // Simpan Klaim
    await setDoc(doc(db, "claims", email), { license_code: newCode });

    return new Response(JSON.stringify({ success: true, code: newCode }), {
      headers: { "Content-Type": "application/json" }, status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
};
