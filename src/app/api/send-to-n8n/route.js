export const runtime = "edge";

export async function POST(req) {
  try {
    const data = await req.formData();

    // Ambil semua field
    const pengirim = data.get("pengirim");
    const lab = data.get("lab");
    const sampleId = data.get("sampleId");
    const sampleType = data.get("sampleType");
    const analysisRequest = data.get("analysisRequest");
    const file = data.get("file"); // Blob

    if (!file) {
      return new Response(JSON.stringify({ error: "File tidak ditemukan" }), { status: 400 });
    }

    // FormData untuk dikirim ke n8n
    const n8nForm = new FormData();
    n8nForm.append("pengirim", pengirim);
    n8nForm.append("lab", lab);
    n8nForm.append("sampleId", sampleId);
    n8nForm.append("sampleType", sampleType);
    n8nForm.append("analysisRequest", analysisRequest);
    n8nForm.append("file", file, file.name);

    // Kirim ke n8n
    const res = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      body: n8nForm,
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Gagal kirim ke n8n" }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
