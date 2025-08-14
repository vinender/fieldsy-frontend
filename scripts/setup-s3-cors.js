// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

// Configure AWS SDK
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'HEAD', 'POST', 'PUT'],
      AllowedOrigins: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://localhost:3000',
        'https://localhost:3001',
        // Add your production domain here
      ],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3000,
    },
  ],
};

async function setupCORS() {
  try {
    const command = new PutBucketCorsCommand({
      Bucket: process.env.AWS_S3_BUCKET || 'fieldsy',
      CORSConfiguration: corsConfiguration,
    });

    const response = await s3Client.send(command);
    console.log('✅ CORS configuration successfully applied to S3 bucket');
    console.log('Response:', response);
  } catch (error) {
    console.error('❌ Error setting up CORS:', error);
  }
}

setupCORS();