import { fal } from '@fal-ai/client';
import formidable from 'formidable';

fal.config({
  credentials: process.env.FAL_API_KEY
});

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  const form = formidable({ multiples: false });
  let handled = false;

  form.onPart = (part) => {
    if (!part.filename || handled) {
      form._handlePart(part);
      return;
    }

    const chunks = [];
    part.on('data', (chunk) => chunks.push(chunk));

    part.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const result = await fal.storage.upload(buffer, {
          filename: part.filename || 'upload.jpg'
        });

        if (!handled) {
          handled = true;
          res.status(200).json({ url: result.url });
        }
      } catch (err) {
        console.error('❌ Upload error:', err);
        if (!handled) {
          handled = true;
          res.status(500).json({ error: err.message });
        }
      }
    });

    part.on('error', (err) => {
      console.error('❌ Stream error:', err);
      if (!handled) {
        handled = true;
        res.status(500).json({ error: 'Stream error' });
      }
    });
  };

  form.parse(req, () => {
    setTimeout(() => {
      if (!handled) {
        handled = true;
        res.status(400).json({ error: 'No file received' });
      }
    }, 3000);
  });
}
