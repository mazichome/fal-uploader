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

  let responded = false;

  form.onPart = (part) => {
    if (!part.filename) {
      form._handlePart(part);
      return;
    }

    const chunks = [];

    part.on('data', (chunk) => chunks.push(chunk));

    part.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const result = await fal.storage.upload(buffer, {
          filename: part.filename || 'upload.jpg',
        });

        if (!responded) {
          responded = true;
          return res.status(200).json({ url: result.url });
        }
      } catch (error) {
        console.error('Upload error:', error);
        if (!responded) {
          responded = true;
          return res.status(500).json({ error: error.message });
        }
      }
    });

    part.on('error', (err) => {
      console.error('Stream error:', err);
      if (!responded) {
        responded = true;
        res.status(500).json({ error: 'Stream failed' });
      }
    });
  };

  form.parse(req, () => {
    // Nothing needed here
  });
}
