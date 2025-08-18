import { useState } from 'react'
import { ImageUploader } from '@/components/ui/image-uploader'

export default function TestUploadProgress() {
  const [images, setImages] = useState<string[]>([])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-dark-green mb-2">
            Test Upload Progress Bar
          </h1>
          <p className="text-gray-600 mb-8">
            Select an image to see the progress bar animate from 0% to 100% during S3 upload
          </p>
          
          <ImageUploader
            value={images}
            onChange={(uploadedImages) => {
              console.log('Images updated:', uploadedImages)
              setImages(uploadedImages as string[])
            }}
            multiple={true}
            maxFiles={3}
            folder="test-progress"
            label="Test Images"
            description="Upload images to test the progress bar animation"
            gridCols={3}
            showPreview={true}
            onUploadStart={(file) => {
              console.log('📁 Upload started for:', file.name)
            }}
            onUploadProgress={(progress, file) => {
              console.log(`📊 Progress: ${progress}% for ${file.name}`)
            }}
            onUploadComplete={(url, file) => {
              console.log('✅ Upload complete:', file.name, 'URL:', url)
            }}
            onUploadError={(error, file) => {
              console.error('❌ Upload failed:', file.name, 'Error:', error)
            }}
          />
          
          {images.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Uploaded Images:</h3>
              <ul className="space-y-1">
                {images.map((url, index) => (
                  <li key={index} className="text-sm text-green-700">
                    {index + 1}. {url}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li>Select an image file from your computer</li>
              <li>Progress bar starts at 0%</li>
              <li>Progress gradually increases as the file uploads to S3</li>
              <li>Progress reaches 100% when upload is complete</li>
              <li>Success checkmark appears after upload</li>
            </ol>
            <p className="mt-3 text-xs text-blue-600">
              Open browser console to see detailed progress logs
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}