import { Input } from '@/components/ui/input'

export default function TestDirectInput() {
  return (
    <div className="min-h-screen bg-white mt-60 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-dark-green mb-8">Direct Input Component Test</h1>
        
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Input Component (our custom)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Name (exactly as in FieldOwnerDashboardNew)
                </label>
                <Input
                  type="text"
                  placeholder="Enter field name"
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
                  Max Dogs
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 10"
                  className="py-3 border-gray-border focus:border-green font-sans"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Native HTML input (for comparison)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Native Field Name
                </label>
                <input
                  type="text"
                  placeholder="Enter field name"
                  className="w-full px-4 py-3 rounded-[70px] bg-white border border-gray-border focus:border-green font-sans"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Native City
                </label>
                <input
                  type="text"
                  placeholder="London"
                  className="w-full px-4 py-3 rounded-[70px] text-red-400 bg-white border border-gray-border focus:border-green font-sans"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Native Max Dogs
                </label>
                <input
                  type="number"
                  placeholder="e.g., 10"
                  className="w-full px-4 py-3 rounded-[70px] bg-white border border-gray-border focus:border-green font-sans"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Expected Results</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-32 h-12 border-2 rounded-lg flex items-center justify-center" 
                     style={{ backgroundColor: 'rgb(229, 231, 235)' }}>
                  <span className="text-xs font-medium text-gray-700">Gray-200</span>
                </div>
                <div>
                  <p className="font-medium">Placeholder Color</p>
                  <p className="text-sm text-gray-600">rgb(229, 231, 235) - Light gray</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-32 h-12 border-2 rounded-lg flex items-center justify-center" 
                     style={{ backgroundColor: 'rgb(31, 41, 55)' }}>
                  <span className="text-xs font-medium text-white">Gray-800</span>
                </div>
                <div>
                  <p className="font-medium">Text Color</p>
                  <p className="text-sm text-gray-600">rgb(31, 41, 55) - Dark gray</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white rounded border">
              <p className="text-sm font-semibold text-gray-700 mb-2">Applied Styles:</p>
              <ul className="text-xs font-mono text-gray-600 space-y-1">
                <li>✓ Dynamic style injection via useEffect</li>
                <li>✓ CSS Module styles (input.module.css)</li>
                <li>✓ Global CSS rules (globals.css)</li>
                <li>✓ data-slot="input" selector for specificity</li>
                <li>✓ !important flags to override any conflicts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}