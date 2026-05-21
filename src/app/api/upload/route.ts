import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    // 1. Authenticate the request (Only ADMIN and SELLER can upload images)
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SELLER")) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    // 2. Parse the form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
    }

    // 3. Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Clean and construct a unique filename
    const originalName = file.name || "upload.jpg";
    const extension = path.extname(originalName) || ".jpg";
    const baseName = path.basename(originalName, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-") // replace non-alphanumeric characters
      .replace(/-+/g, "-");       // collapse consecutive hyphens
    
    const uniqueFilename = `${Date.now()}-${baseName}${extension}`;
    
    // 5. Ensure directory exists and write the file
    const publicDirectory = path.join(process.cwd(), "public", "images");
    await mkdir(publicDirectory, { recursive: true });

    const filePath = path.join(publicDirectory, uniqueFilename);
    await writeFile(filePath, buffer);

    // 6. Return the public accessible URL path
    const imageUrl = `/images/${uniqueFilename}`;

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: "Dosya yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
