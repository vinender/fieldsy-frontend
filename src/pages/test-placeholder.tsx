import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

export default function TestPlaceholder() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-dark-green mb-8">Placeholder Color Test</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Regular Inputs</h2>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="This placeholder should be gray-200 (rgb(229, 231, 235))"
                className="w-full"
              />
              <Input
                type="email"
                placeholder="Email placeholder - gray-200"
                className="w-full"
              />
              <Input
                type="password"
                placeholder="Password placeholder - gray-200"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Select Field</h2>
            <Select className="w-full px-4 py-2.5 rounded-[70px]">
              <option value="">Select an option (gray-200)</option>
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
            </Select>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Native HTML Input (for comparison)</h2>
            <input
              type="text"
              placeholder="Native input placeholder - should also be gray-200"
              className="w-full px-4 py-2.5 rounded-[70px] border border-gray-300"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Color Reference</h2>
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-20 h-10 border rounded" style={{ backgroundColor: 'rgb(229, 231, 235)' }}></div>
                <div>
                  <p className="font-medium">Gray-200</p>
                  <p className="text-sm text-gray-600">rgb(229, 231, 235)</p>
                  <p className="text-xs text-gray-500">This is the placeholder color</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-10 border rounded" style={{ backgroundColor: 'rgb(31, 41, 55)' }}></div>
                <div>
                  <p className="font-medium">Gray-800</p>
                  <p className="text-sm text-gray-600">rgb(31, 41, 55)</p>
                  <p className="text-xs text-gray-500">This is the input text color</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}