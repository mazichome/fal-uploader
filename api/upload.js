import { fal } from '@fal-ai/client';
import formidable from 'formidable';

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
      console.error("Form parse error:", err);
      return res.status(500).json({ error: 'Failed to parse form data' });
    }

    try {
      const file = files.file;

      // ✅ Sử dụng .toBuffer() (cách an toàn, không cần path)
      const buffer = await file.toBuffer();

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
