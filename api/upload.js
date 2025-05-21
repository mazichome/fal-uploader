import { fal } from '@fal-ai/client';
import formidable from 'formidable';

fal.config({
  credentials: process.env.FAL_API_KEY
});

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  const form = formidable({ multiples: false, keepExtensions: true });

  form.onPart = function (part) {
    if (!part.filename || !part.mime) {
      form._handlePart(part);
      return;
    }

    const chunks = [];
    part.on('data', (chunk) => chunks.push(chunk));
    part.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);

        const result = await fal.storage.upload(buffer, {
          filename: part.filename || "upload.jpg"
        });

        return res.status(200).json({ url: result.url });
      } catch (e) {
        console.error('Upload error:', e);
        return res.status(500).json({ error: e.message });
      }
    });
  };

  form.parse(req, () => {});
}
