import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Menggunakan globalThis.crypto untuk kompatibilitas Edge Functions
const crypto = globalThis.crypto; 

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const firebaseConfig = {
        apiKey: process.env.FB_API_KEY,
        authDomain: process.env.FB_AUTH_DOMAIN,
        projectId: process.env.FB_PROJECT_ID,
        appId: process.env.FB_APP_ID
    };

    if (!firebaseConfig.apiKey) {
        return { statusCode: 500, body: JSON.stringify({ message: "Server Config Error" }) };
    }
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    try {
        const body = JSON.parse(event.body);
        const { code } = body;

        const docRef = doc(db, "licenses", code);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { statusCode: 404, body: JSON.stringify({ success: false, message: "Kode Akses Salah!" }) };
        }

        const data = docSnap.data();
        const maxDevices = data.max_devices || 3; 
        let currentTokens = data.valid_tokens || [];
        const newSessionToken = crypto.randomUUID(); 

        currentTokens.push(newSessionToken);

        if (currentTokens.length > maxDevices) {
            currentTokens = currentTokens.slice(-maxDevices);
        }
        
        await updateDoc(docRef, { 
            valid_tokens: currentTokens,
            last_login: new Date().toISOString()
        });

        return { 
            statusCode: 200, 
            body: JSON.stringify({ success: true, token: newSessionToken }) 
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ success: false, message: error.message }) };
    }
};
