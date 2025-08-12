# S3 Upload Configuration Guide

## Prerequisites

1. AWS Account with S3 access
2. An S3 bucket created for storing files
3. IAM user with appropriate permissions

## Setup Instructions

### 1. Create S3 Bucket

1. Go to AWS S3 Console
2. Create a new bucket with a unique name (e.g., `fieldsy-uploads`)
3. Choose your preferred region (e.g., `us-east-1`)
4. Configure bucket settings:
   - Block all public access (recommended for security)
   - Enable versioning (optional but recommended)
   - Enable server-side encryption (recommended)

### 2. Configure CORS for S3 Bucket

Add the following CORS configuration to your S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://your-production-domain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 3. Create IAM User and Policy

Create an IAM user with programmatic access and attach the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name/*",
        "arn:aws:s3:::your-bucket-name"
      ]
    }
  ]
}
```

### 4. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your AWS credentials:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET=your-bucket-name
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 5. Optional: CloudFront Setup

For better performance, you can set up CloudFront:

1. Create a CloudFront distribution
2. Set your S3 bucket as the origin
3. Configure caching behaviors
4. Update your environment variables with the CloudFront domain

## File Upload Flow

1. **Client Side**: User selects files to upload
2. **API Request**: Client requests presigned URL from `/api/upload/presigned-url`
3. **Presigned URL**: Backend generates a presigned POST URL with limited permissions
4. **Direct Upload**: Client uploads directly to S3 using the presigned URL
5. **Progress Tracking**: Upload progress is tracked and displayed to user
6. **Success**: File URL is returned and saved with the form submission

## Security Best Practices

1. **File Validation**: Files are validated on both client and server
   - Max file size: 10MB
   - Allowed types: JPG, PNG, PDF, DOC/DOCX

2. **Unique Filenames**: Files are renamed with UUIDs to prevent conflicts

3. **Limited Permissions**: Presigned URLs expire after 10 minutes

4. **Private Bucket**: S3 bucket should not allow public access

5. **HTTPS Only**: Always use HTTPS in production

## Troubleshooting

### CORS Errors
- Ensure your domain is added to the S3 bucket CORS configuration
- Check that the correct HTTP methods are allowed

### Access Denied
- Verify IAM user has the correct permissions
- Check that the bucket name in environment variables matches your actual bucket

### Upload Failures
- Check file size limits
- Verify file type is allowed
- Ensure presigned URL hasn't expired

## Testing

1. Start the development server:
```bash
npm run dev
```

2. Navigate to a field details page
3. Click "Claim This Field"
4. Try uploading various file types and sizes
5. Check S3 bucket to verify files are uploaded

## Production Considerations

1. Use environment-specific S3 buckets (dev, staging, prod)
2. Set up lifecycle policies to delete old/unused files
3. Monitor S3 costs and set up billing alerts
4. Consider using AWS CloudWatch for logging
5. Implement virus scanning for uploaded files (AWS Lambda + ClamAV)