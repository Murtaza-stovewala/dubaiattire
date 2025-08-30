import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const person = form.get("image_file");

    if (!person || !(person instanceof Blob)) {
      return NextResponse.json({ error: "image_file is required" }, { status: 400 });
    }

    const removeBgKey = process.env.REMOVE_BG_API_KEY;
    if (!removeBgKey) {
      return NextResponse.json({ error: "Missing REMOVE_BG_API_KEY" }, { status: 500 });
    }

    const rbForm = new FormData();
    rbForm.append("image_file", person, "person.jpg");
    rbForm.append("size", "auto");

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": removeBgKey,
      },
      body: rbForm,
    });

    if (!res.ok) {
      const errTxt = await res.text();
      return NextResponse.json({ error: "remove.bg failed", details: errTxt }, { status: 502 });
    }

    const arrayBuffer = await res.arrayBuffer();
    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
