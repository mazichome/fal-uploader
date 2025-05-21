import { fal } from '@fal-ai/client';
import formidable from 'formidable';
import fs from 'fs/promises';

fal.config({
  credentials: process.env.FAL_API_KEY
});

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Form parse failed' });
    }

    try {
      const file = files.file;

      const buffer = await fs.readFile(file._writeStream.path); // 🔥 đọc từ stream path
      const result = await fal.storage.upload(buffer, {
        filename: file.originalFilename,
      });

      return res.status(200).json({ url: result.url });
    } catch (uploadErr) {
      console.error('Upload error:', uploadErr);
      return res.status(500).json({ error: uploadErr.message });
    }
  });
}
