import { fal } from '@fal-ai/client';
import formidable from 'formidable';
import fs from 'fs';

fal.config({
  credentials: process.env.42809663-b45c-4d11-9636-13c5553fdf1e:1444e52c4e6e6708f605227392af74ee
});

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });
    const file = files.file;
    const stream = fs.createReadStream(file.filepath);
    const result = await fal.storage.upload(stream, {
      filename: file.originalFilename
    });
    res.status(200).json({ url: result.url });
  });
}
