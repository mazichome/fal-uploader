import { fal } from '@fal-ai/client';
import formidable from 'formidable';
import fs from 'fs';

fal.config({
  credentials: process.env.FAL_API_KEY
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Parse error:", err);
      return res.status(500).json({ error: 'Failed to parse form' });
    }

    try {
      const file = files.file;

      if (!file || !file._writeStream || !file._writeStream.path) {
        return res.status(400).json({ error: "Missing file path from stream" });
      }

      // Đọc từ path thực tế mà formidable tạo ra (tương thích n8n)
      const buffer = fs.readFileSync(file._writeStream.path);

      const result = await fal.storage.upload(buffer, {
        filename: file.originalFilename || "upload.jpg",
      });

      return res.status(200).json({ url: result.url });
    } catch (error) {
      console.error("❌ Upload error:", error);
      return res.status(500).json({ error: error.message });
    }
  });
}
