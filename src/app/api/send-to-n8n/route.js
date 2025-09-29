import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';
import multiparty from 'multiparty';

export const config = {
  api: {
    bodyParser: false, // karena multipart
  },
};

export async function POST(req) {
  return new Promise((resolve) => {
    const form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
      if (err) return resolve(new Response(JSON.stringify({ error: err.message }), { status: 500 }));

      const formData = new FormData();
      for (let key in fields) formData.append(key, fields[key][0]);

      // File
      if (files.file && files.file[0]) {
        const file = files.file[0];
        formData.append('file', fs.createReadStream(file.path), file.originalFilename);
      }

      try {
        const response = await fetch(process.env.N8N_WEBHOOK_URL, { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Failed to send to n8n');
        resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));
      } catch (e) {
        resolve(new Response(JSON.stringify({ error: e.message }), { status: 500 }));
      }
    });
  });
}
