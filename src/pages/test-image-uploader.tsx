import { useState } from 'react'
import { ImageUploader, UploadedImage } from '@/components/ui/image-uploader'

export default function TestImageUploader() {
  const [singleImage, setSingleImage] = useState<string>('')
  const [multipleImages, setMultipleImages] = useState<string[]>([])
  const [fullObjectImages, setFullObjectImages] = useState<UploadedImage[]>([])
  const [disabledImages, setDisabledImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'
  ])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl font-bold text-dark-green mb-4">Image Uploader Component Test</h1>
          <p className="text-gray-600">Testing various configurations of the reusable ImageUploader component</p>
        </div>

        {/* Single Image Upload */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Single Image Upload</h2>
          <ImageUploader
            value={singleImage}
            onChange={(image) => setSingleImage(image as string)}
            multiple={false}
            folder="test-single"
            label="Profile Picture"
            description="Upload a single profile image (JPG, PNG, or GIF)"
            showPreview={true}
          />
          {singleImage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-700">Uploaded URL: {singleImage}</p>
            </div>
          )}
        </div>

        {/* Multiple Images Upload */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Multiple Images Upload</h2>
          <ImageUploader
            value={multipleImages}
            onChange={(images) => setMultipleImages(images as string[])}
            multiple={true}
            maxFiles={5}
            maxSize={5}
            folder="test-multiple"
            label="Gallery Images"
            description="Upload up to 5 images for your gallery"
            gridCols={3}
            showPreview={true}
          />
          {multipleImages.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-700 font-medium mb-2">Uploaded URLs:</p>
              <ul className="text-xs text-green-600 space-y-1">
                {multipleImages.map((url, index) => (
                  <li key={index} className="truncate">• {url}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Full Object Return */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Full Object Return (Advanced)</h2>
          <ImageUploader
            value={fullObjectImages}
            onChange={(images) => setFullObjectImages(images as UploadedImage[])}
            multiple={true}
            maxFiles={3}
            folder="test-objects"
            returnFullObject={true}
            label="Document Uploads"
            description="Returns full image objects with metadata"
            gridCols={2}
            onUploadStart={(file) => console.log('Upload started:', file.name)}
            onUploadProgress={(progress, file) => console.log(`Progress ${progress}%:`, file.name)}
            onUploadComplete={(url, file) => console.log('Upload complete:', file.name, url)}
            onRemove={(image) => console.log('Image removed:', image.name)}
          />
          {fullObjectImages.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-700 font-medium mb-2">Image Objects:</p>
              <pre className="text-xs text-blue-600 overflow-auto">
                {JSON.stringify(fullObjectImages.map(img => ({
                  id: img.id,
                  name: img.name,
                  size: img.size,
                  uploaded: img.uploaded,
                  url: img.url
                })), null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Pre-loaded Images */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pre-loaded Images (Edit Mode)</h2>
          <p className="text-sm text-gray-600 mb-4">
            This demonstrates loading existing images from an API
          </p>
          <ImageUploader
            value={disabledImages}
            onChange={(images) => setDisabledImages(images as string[])}
            multiple={true}
            maxFiles={4}
            folder="test-preloaded"
            label="Field Images"
            description="Edit existing images or add new ones"
            gridCols={4}
          />
        </div>

        {/* Disabled State */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Disabled State</h2>
          <ImageUploader
            value={['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400']}
            onChange={() => {}}
            disabled={true}
            label="Read-only Images"
            description="These images cannot be modified"
            showPreview={true}
          />
        </div>

        {/* Custom Placeholder */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Custom Placeholder</h2>
          <ImageUploader
            value={[]}
            onChange={() => {}}
            multiple={true}
            folder="test-custom"
            placeholder={
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-green mb-2">Add Field Photos</p>
                <p className="text-sm text-gray-500 mb-4">Show off your best features</p>
                <button className="px-4 py-2 bg-green text-white rounded-full text-sm hover:bg-green-hover transition-colors">
                  Choose Files
                </button>
              </div>
            }
          />
        </div>

        {/* Different Grid Layouts */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Grid Layout Options</h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">2 Columns</p>
              <ImageUploader
                value={[
                  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
                  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400'
                ]}
                onChange={() => {}}
                multiple={true}
                gridCols={2}
                disabled={true}
              />
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">3 Columns (Default)</p>
              <ImageUploader
                value={[
                  'https://images.unsplash.com/photo-1581888227599-779811939961?w=400',
                  'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400',
                  'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400'
                ]}
                onChange={() => {}}
                multiple={true}
                gridCols={3}
                disabled={true}
              />
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">4 Columns</p>
              <ImageUploader
                value={[
                  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
                  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
                  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
                  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400'
                ]}
                onChange={() => {}}
                multiple={true}
                gridCols={4}
                disabled={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}