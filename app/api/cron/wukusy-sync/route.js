export async function GET() {
  return Response.json(
    {
      error: "Wukusy sync is temporarily disabled.",
    },
    { status: 503 }
  );
}
