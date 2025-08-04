export default function TestPage() {
  return (
    <div className="min-h-screen bg-fieldsy-too-light-bg p-8">
      <div className="w-full mx-auto">
        <h1 className="text-hero text-fieldsy-dark font-bold mb-8">
          Tailwind CSS Test Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Color Test */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-card-title text-fieldsy-dark font-semibold mb-4">
              Color Palette Test
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-fieldsy-green rounded"></div>
                <span className="text-body text-fieldsy-dark">fieldsy-green (#3A6B22)</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-fieldsy-pastel-green rounded"></div>
                <span className="text-body text-fieldsy-dark">fieldsy-pastel-green (#8FB366)</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-fieldsy-dark rounded"></div>
                <span className="text-body text-fieldsy-dark">fieldsy-dark (#192215)</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-fieldsy-light-yellow rounded"></div>
                <span className="text-body text-fieldsy-dark">fieldsy-light-yellow (#F8F1D7)</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-fieldsy-too-light-bg rounded"></div>
                <span className="text-body text-fieldsy-dark">fieldsy-too-light-bg (#FFFCF3)</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-fieldsy-dark-yellow rounded"></div>
                <span className="text-body text-fieldsy-dark">fieldsy-dark-yellow (#FFBD00)</span>
              </div>
            </div>
          </div>

          {/* Typography Test */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-card-title text-fieldsy-dark font-semibold mb-4">
              Typography Test
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-hero text-fieldsy-green mb-2">Hero Text</h3>
                <p className="text-small text-fieldsy-dark/60">3.5rem, 700 weight</p>
              </div>
              <div>
                <h3 className="text-section-title text-fieldsy-green mb-2">Section Title</h3>
                <p className="text-small text-fieldsy-dark/60">2.5rem, 700 weight</p>
              </div>
              <div>
                <h3 className="text-card-title text-fieldsy-green mb-2">Card Title</h3>
                <p className="text-small text-fieldsy-dark/60">1.5rem, 600 weight</p>
              </div>
              <div>
                <p className="text-body-large text-fieldsy-dark mb-2">Body Large Text</p>
                <p className="text-small text-fieldsy-dark/60">1.125rem, 400 weight</p>
              </div>
              <div>
                <p className="text-body text-fieldsy-dark mb-2">Body Text</p>
                <p className="text-small text-fieldsy-dark/60">1rem, 400 weight</p>
              </div>
              <div>
                <p className="text-small text-fieldsy-dark mb-2">Small Text</p>
                <p className="text-small text-fieldsy-dark/60">0.875rem, 400 weight</p>
              </div>
            </div>
          </div>

          {/* Spacing Test */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-card-title text-fieldsy-dark font-semibold mb-4">
              Spacing Test
            </h2>
            <div className="space-y-4">
              <div className="bg-fieldsy-pastel-green p-section rounded">
                <p className="text-body text-fieldsy-dark">Section Padding (5rem)</p>
              </div>
              <div className="bg-fieldsy-pastel-green p-section-sm rounded">
                <p className="text-body text-fieldsy-dark">Section Small Padding (3rem)</p>
              </div>
              <div className="bg-fieldsy-pastel-green p-card rounded">
                <p className="text-body text-fieldsy-dark">Card Padding (2rem)</p>
              </div>
              <div className="bg-fieldsy-pastel-green p-card-sm rounded">
                <p className="text-body text-fieldsy-dark">Card Small Padding (1.5rem)</p>
              </div>
            </div>
          </div>

          {/* Component Test */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-card-title text-fieldsy-dark font-semibold mb-4">
              Component Test
            </h2>
            <div className="space-y-4">
              <button className="bg-fieldsy-green hover:bg-fieldsy-green/90 text-white px-4 py-2 rounded-md">
                Primary Button
              </button>
              <button className="bg-fieldsy-pastel-green hover:bg-fieldsy-pastel-green/90 text-white px-4 py-2 rounded-md">
                Secondary Button
              </button>
              <div className="bg-fieldsy-light-yellow p-4 rounded-lg">
                <p className="text-fieldsy-dark">Light yellow background</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 