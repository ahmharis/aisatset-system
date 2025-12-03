// Fungsi Chat ini sekarang hanya berfungsi sebagai 'signal'
// yang memberitahu Frontend (Browser) untuk menggunakan Logika Manual.

exports.handler = async (event, context) => {
    // Karena kita tidak menggunakan Gemini, kita langsung kirim signal balasan sukses
    // Dengan balasan yang akan diabaikan oleh frontend, sehingga frontend
    // akan menggunakan logika manual (fallback) yang ada di index.html.
    return {
        statusCode: 200,
        body: JSON.stringify({ success: true, status: "MANUAL_MODE" })
    };
};
