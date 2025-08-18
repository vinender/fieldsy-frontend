import { Input } from '@/components/ui/input'

export default function TestAddFieldInput() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-dark-green mb-8">Add Field Form Input Test</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Input with same classes as Add Field form</h2>
            <p className="text-sm text-gray-600 mb-3">These inputs use the exact same classes as in the add-field form</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Name (same as add-field form)
                </label>
                <Input
                  type="text"
                  placeholder="Enter field name"
                  className="py-3 border-gray-border focus:border-green font-sans"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Dogs
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 10"
                  className="py-3 border-gray-border focus:border-green font-sans"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <Input
                  type="text"
                  placeholder="123 Main Street"
                  className="py-3 border-gray-border focus:border-green font-sans"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <Input
                  type="text"
                  placeholder="London"
                  className="py-3 border-gray-border focus:border-green font-sans"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <Input
                  type="text"
                  placeholder="SW1A 1AA"
                  className="py-3 border-gray-border focus:border-green font-sans"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Color Comparison</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-24 h-10 border rounded flex items-center justify-center" style={{ backgroundColor: 'rgb(229, 231, 235)' }}>
                  <span className="text-xs text-gray-700">Gray-200</span>
                </div>
                <p className="text-sm">This is the target placeholder color: rgb(229, 231, 235)</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 h-10 border rounded flex items-center justify-center" style={{ backgroundColor: 'rgb(31, 41, 55)' }}>
                  <span className="text-xs text-white">Gray-800</span>
                </div>
                <p className="text-sm">This is the input text color: rgb(31, 41, 55)</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Debug Info</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-mono text-gray-700">
                Expected placeholder styles:
              </p>
              <ul className="text-xs font-mono text-gray-600 mt-2 space-y-1">
                <li>• color: rgb(229, 231, 235)</li>
                <li>• opacity: 1</li>
                <li>• Should NOT change on focus</li>
                <li>• Applied via CSS module + inline styles + global CSS</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}