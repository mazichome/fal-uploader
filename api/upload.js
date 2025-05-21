import { fal } from '@fal-ai/client';
import formidable from 'formidable';
import fs from 'fs';

fal.config({
  credentials: process.env.FAL_API_KEY
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Form error:", err);
      return res.status(500).json({ error: 'Failed to parse form data' });
    }

    try {
      const file = files.file;

      let buffer;

      if (file?.filepath) {
        // ✅ Cách phổ biến nhất (Postman, local)
        buffer = fs.readFileSync(file.filepath);
      } else if (file?._writeStream?.path) {
        // ✅ Trường hợp đặc biệt trên Vercel + n8n
        buffer = fs.readFileSync(file._writeStream.path);
      } else {
        return res.status(400).json({ error: "Cannot locate file buffer or path" });
      }

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
