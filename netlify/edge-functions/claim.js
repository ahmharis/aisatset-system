import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

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
        const { email } = body;
        
        const docRef = doc(db, "claims", email);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { statusCode: 404, body: JSON.stringify({ success: false, message: "Email tidak ditemukan." }) };
        }

        return { statusCode: 200, body: JSON.stringify({ success: true, code: docSnap.data().license_code }) };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ success: false, message: error.message }) };
    }
};
