export const runtime = "edge"; // supaya bisa dipanggil langsung dari N8N

export async function GET() {
  try {
    const users = [
      {
        row_number: 2,
        username: "ivanank891",
        name: "Ivan Anugerah",
        chat_id: 5238807850,
      },
      {
        row_number: 3,
        username: "Najwaszm",
        name: "Najwa Syauqi ZM",
        chat_id: 1033131220,
      },
    ];

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
