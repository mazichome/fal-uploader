import { fal } from '@fal-ai/client';
import formidable from 'formidable';
import fs from 'fs';

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
      console.error('Parse error:', err);
      return res.status(500).json({ error: 'Failed to parse form' });
    }

    try {
      const file = files.file;
      const stream = fs.createReadStream(file.filepath);

      const result = await fal.storage.upload(stream, {
        filename: file.originalFilename,
      });

      return res.status(200).json({ url: result.url });
    } catch (uploadErr) {
      console.error('Upload error:', uploadErr);
      return res.status(500).json({ error: uploadErr.message });
    }
  });
}
