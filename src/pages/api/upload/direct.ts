import { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Disable Next.js body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const folder = Array.isArray(fields.folder) ? fields.folder[0] : fields.folder || 'uploads';

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read file content
    const fileContent = fs.readFileSync(file.filepath);
    
    // Generate unique filename
    const fileExtension = file.originalFilename?.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${fileName}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: fileContent,
      ContentType: file.mimetype || 'application/octet-stream',
    });

    await s3Client.send(command);

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    // Return the file URL
    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.status(200).json({
      success: true,
      fileUrl,
      key,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
}