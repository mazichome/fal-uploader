import { fal } from '@fal-ai/client';
import formidable from 'formidable';
import fs from 'fs/promises';

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
      console.error("Form error:", err);
      return res.status(500).json({ error: 'Failed to parse form data' });
    }

    try {
      const file = files.file;

      // Đọc dữ liệu từ stream path (n8n gửi binary không có .filepath chuẩn)
      const buffer = await fs.readFile(file._writeStream.path);

      const result = await fal.storage.upload(buffer, {
        filename: file.originalFilename,
      });

      return res.status(200).json({ url: result.url });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ error: error.message });
    }
  });
}
