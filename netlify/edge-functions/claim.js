import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export default async (request, context) => {
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
    const { email } = body;
    const docRef = doc(db, "claims", email);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return new Response(JSON.stringify({ success: false, message: "Email tidak ditemukan / belum lunas." }), { 
        headers: { "Content-Type": "application/json" }, status: 404 
      });
    }

    return new Response(JSON.stringify({ success: true, code: docSnap.data().license_code }), {
      headers: { "Content-Type": "application/json" }, status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
};
