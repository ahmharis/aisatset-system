import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

exports.handler = async (event, context) => {
    const url = event.queryStringParameters;
    const secret = url.kunci_rahasia; 
    
    if (secret !== "SATSET_AI") return { statusCode: 403, body: "Akses Ditolak" };
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };

    const firebaseConfig = {
        apiKey: process.env.FB_API_KEY,
        authDomain: process.env.FB_AUTH_DOMAIN,
        projectId: process.env.FB_PROJECT_ID,
        appId: process.env.FB_APP_ID
    };
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    try {
        const body = JSON.parse(event.body);
        const email = body.email;
        const maxDevices = body.max_devices || 3;

        if (!email) return { statusCode: 400, body: "Email wajib ada" };

        let cleanName = email.split('@')[0].replace(/[^a-zA-Z]/g, '').toUpperCase();
        if (cleanName.length < 3) cleanName = "MEMBER";
        cleanName = cleanName.substring(0, 10);
        
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const newCode = `SATSET-${cleanName}-${randomNum}`;

        await setDoc(doc(db, "licenses", newCode), {
            owner_email: email,
            max_devices: parseInt(maxDevices),
            created_at: new Date().toISOString(),
            status: "active",
            valid_tokens: []
        });

        await setDoc(doc(db, "claims", email), { license_code: newCode });

        return { statusCode: 200, body: JSON.stringify({ success: true, code: newCode }) };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ success: false, message: error.message }) };
    }
};
