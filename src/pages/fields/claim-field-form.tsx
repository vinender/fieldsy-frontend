import React, { useState, useEffect } from 'react';
import { ChevronLeft, Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import mockData from '@/data/mock-data.json';
import { s3Uploader, UploadProgress } from '@/utils/s3Upload';

interface UploadedFile {
  name: string;
  size: string;
  url?: string;
  uploaded: boolean;
  progress?: number;
  error?: string;
}

const ClaimFieldPage = () => {
  const router = useRouter();
  const { field_id } = router.query;
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    phoneNumber: string;
    isLegalOwner: boolean | null;
  }>({
    fullName: '',
    email: '',
    phoneNumber: '',
    isLegalOwner: null
  });
  
  const [phoneCode, setPhoneCode] = useState('+44');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const uploadFile = async (file: File) => {
    const tempFile: UploadedFile = {
      name: file.name,
      size: formatFileSize(file.size),
      uploaded: false,
      progress: 0
    };

    // Add file to list with initial state
    setUploadedFiles(prev => [...prev, tempFile]);
    const fileIndex = uploadedFiles.length;

    try {
      setIsUploading(true);
      
      const fileUrl = await s3Uploader.uploadFile({
        file,
        onProgress: (progress: UploadProgress) => {
          setUploadedFiles(prev => 
            prev.map((f, i) => 
              i === fileIndex 
                ? { ...f, progress: progress.percentage }
                : f
            )
          );
        }
      });

      // Update file with success status
      setUploadedFiles(prev => 
        prev.map((f, i) => 
          i === fileIndex 
            ? { ...f, url: fileUrl, uploaded: true, progress: 100 }
            : f
        )
      );
    } catch (error) {
      // Update file with error status
      setUploadedFiles(prev => 
        prev.map((f, i) => 
          i === fileIndex 
            ? { ...f, error: error instanceof Error ? error.message : 'Upload failed', uploaded: false }
            : f
        )
      );
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        await uploadFile(file);
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      for (const file of files) {
        await uploadFile(file);
      }
    }
  };

  const removeFile = async (index: number) => {
    const file = uploadedFiles[index];
    
    // If file was uploaded to S3, delete it
    if (file.url) {
      try {
        await s3Uploader.deleteFile(file.url);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Get field data based on field_id
  const field = field_id ? mockData.fields.find(f => f.id === field_id) : null;

  const handleSubmit = async () => {
    // Validate form
    if (!formData.fullName || !formData.email || !formData.phoneNumber) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.isLegalOwner === null) {
      alert('Please indicate if you are the legal owner');
      return;
    }

    if (uploadedFiles.length === 0) {
      alert('Please upload at least one ownership document');
      return;
    }

    // Check if all files are uploaded
    const pendingUploads = uploadedFiles.filter(f => !f.uploaded && !f.error);
    if (pendingUploads.length > 0) {
      alert('Please wait for all files to finish uploading');
      return;
    }

    const uploadedUrls = uploadedFiles
      .filter(f => f.uploaded && f.url)
      .map(f => f.url);

    const submitData = {
      ...formData,
      phoneCode,
      fieldId: field_id,
      fieldName: field?.name,
      documents: uploadedUrls,
      submittedAt: new Date().toISOString()
    };

    console.log('Form submitted:', submitData);
    
    // Here you would submit to backend API
    // const response = await fetch('/api/claims/submit', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(submitData)
    // });

    alert('Claim request submitted successfully!');
    router.push(`/fields/${field_id}`);
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 lg:px-20">
          <div className="flex items-center justify-between h-[100px]">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#3A6B22] rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🌿</span>
              </div>
              <h1 className="text-2xl font-bold text-[#3A6B22]">Fieldsy</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-10">
              <a href="#" className="text-[15px] font-bold text-[#3A6B22]">Home</a>
              <a href="#" className="text-[15px] font-semibold text-dark-green opacity-70">About Us</a>
              <a href="#" className="text-[15px] font-semibold text-dark-green opacity-70">Search Fields</a>
              <a href="#" className="text-[15px] font-semibold text-dark-green opacity-70">How it works</a>
              <a href="#" className="text-[15px] font-semibold text-dark-green opacity-70">FAQ's</a>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <button className="w-[52px] h-[52px] bg-[#F0F0F0] rounded-full flex items-center justify-center">
                <span className="text-xl">💬</span>
              </button>
              <div className="relative">
                <button className="w-[52px] h-[52px] bg-[#F0F0F0] rounded-full flex items-center justify-center">
                  <span className="text-xl">🔔</span>
                </button>
                <span className="absolute top-0 right-0 w-[19px] h-[19px] bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-medium">
                  2
                </span>
              </div>
              <div className="w-[52px] h-[52px] rounded-full overflow-hidden">
                <img src="https://i.pravatar.cc/52" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </header> 

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-20 py-8 lg:py-10">
        {/* Back Button and Title */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push(`/fields/${field_id}`)}
            className="flex items-center justify-center w-12 h-12 bg-white rounded-full hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <ChevronLeft className="w-6 h-6 text-dark-green" />
          </button>
          <div>
            <h2 className="text-2xl lg:text-[29px] font-semibold text-dark-green">
              Claim This Field
            </h2>
            {field && (
              <p className="text-sm text-gray-600 mt-1">
                {field.name} • {field.location}
              </p>
            )}
          </div>
        </div>

        {/* Form Container */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Personal Information */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-dark-green mb-2">Personal Information</h3>
            <p className="text-[#6B737D] text-sm mb-6">
              We'll use this information to contact you and verify your request.
            </p>

            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-dark-green mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 bg-white rounded-[76px] border border-gray-200 focus:border-[#3A6B22] focus:outline-none focus:ring-1 focus:ring-[#3A6B22] transition-colors"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-dark-green mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 bg-white rounded-[76px] border border-gray-200 focus:border-[#3A6B22] focus:outline-none focus:ring-1 focus:ring-[#3A6B22] transition-colors"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-dark-green mb-2">
                  Phone Number
                </label>
                <div className="flex ">
                  <select
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    className="px-3 py-3 rounded-[76px] border rounded-r-none border-r-0 border-gray-200 bg-white focus:border-[#3A6B22] focus:outline-none focus:ring-1 focus:ring-[#3A6B22] transition-colors"
                  >
                    <option value="+44">+44</option>
                    <option value="+1">+1</option>
                    <option value="+91">+91</option>
                  </select>
                  <div className="h-10my-auto w-px bg-gray-300"></div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="flex-1 px-4 py-3 bg-white border-l-0 rounded-l-none rounded-[76px] border border-gray-200 focus:border-[#3A6B22] focus:outline-none focus:ring-1 focus:ring-[#3A6B22] transition-colors"
                  />
                </div>
              </div>

              {/* Legal Owner Question */}
              <div>
                <label className="block text-sm font-medium text-dark-green mb-3">
                  Are you the legal owner of this field?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isLegalOwner: true }))}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      formData.isLegalOwner === true
                        ? 'bg-[#8FB366] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isLegalOwner: false }))}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      formData.isLegalOwner === false
                        ? 'bg-gray-400 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Ownership Proof */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-dark-green mb-2">Ownership Proof</h3>
            <p className="text-[#6B737D] text-sm mb-6">
              We require ownership evidence to ensure the field is genuine & secure.
            </p>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive ? 'border-[#3A6B22] bg-green-50' : 'border-gray-300 bg-[#F8F9FA]'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#E8F5E1] rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-[#3A6B22]" />
                </div>
                <p className="text-lg font-semibold text-dark-green mb-2">Upload ID Here</p>
                <p className="text-sm text-[#6B737D]">
                  Drag and drop here or <span className="text-[#3A6B22] font-semibold">click to upload</span>
                </p>
                <p className="text-xs text-[#9CA3AF] mt-2">
                  Supported format : png, jpg, pdf
                </p>
              </label>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    file.error ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded flex items-center justify-center ${
                        file.error ? 'bg-red-100' : file.uploaded ? 'bg-green-100' : 'bg-[#F8F1D7]'
                      }`}>
                        {file.error ? (
                          <X className="w-5 h-5 text-red-500" />
                        ) : file.uploaded ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : file.progress && file.progress > 0 ? (
                          <Loader2 className="w-5 h-5 text-[#3A6B22] animate-spin" />
                        ) : (
                          <span className="text-lg">📄</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-dark-green">{file.name}</p>
                        <div className="flex items-center gap-2">
                          {file.size && <p className="text-xs text-[#6B737D]">{file.size}</p>}
                          {file.error && (
                            <p className="text-xs text-red-600">{file.error}</p>
                          )}
                          {file.uploaded && !file.error && (
                            <p className="text-xs text-green-600">Uploaded successfully</p>
                          )}
                        </div>
                      </div>
                    </div>
                    {file.uploaded || file.error ? (
                      <button
                        onClick={() => removeFile(index)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                        disabled={isUploading && !file.uploaded && !file.error}
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    ) : (
                      <div className="w-24">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#3A6B22] transition-all duration-300"
                            style={{ width: `${file.progress || 0}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-1">{file.progress || 0}%</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button 
            onClick={() => router.push(`/fields/${field_id}`)}
            className="px-8 py-3 border border-gray-300 rounded-full font-semibold text-dark-green hover:bg-gray-50 transition-colors min-w-[150px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-[#3A6B22] text-white rounded-full font-semibold hover:bg-[#2D5A1B] transition-colors min-w-[150px]"
          >
            Submit Claim
          </button>
        </div>
      </main>

  
    </div>
  );
};

export default ClaimFieldPage;