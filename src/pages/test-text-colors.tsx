import { Input } from '@/components/ui/input'

export default function TestTextColors() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-dark-green mb-8">Text Color Override Test</h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Input Component with Different Text Colors</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default (should be dark gray)
                </label>
                <Input
                  type="text"
                  placeholder="Light gray placeholder"
                  defaultValue="Dark gray text"
                  className="py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Red Text (text-red-500)
                </label>
                <Input
                  type="text"
                  placeholder="Light gray placeholder"
                  defaultValue="This should be red"
                  className="py-3 text-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blue Text (text-blue-600)
                </label>
                <Input
                  type="text"
                  placeholder="Light gray placeholder"
                  defaultValue="This should be blue"
                  className="py-3 text-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Green Text (text-green)
                </label>
                <Input
                  type="text"
                  placeholder="Light gray placeholder"
                  defaultValue="This should be green"
                  className="py-3 text-green"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Native HTML Inputs with Different Text Colors</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Native (should be dark gray)
                </label>
                <input
                  type="text"
                  placeholder="Light gray placeholder"
                  defaultValue="Dark gray text"
                  className="w-full px-4 py-3 rounded-[70px] border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Red Native (text-red-500)
                </label>
                <input
                  type="text"
                  placeholder="Light gray placeholder"
                  defaultValue="This should be red"
                  className="w-full px-4 py-3 rounded-[70px] border border-gray-300 text-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blue Native (text-blue-600)
                </label>
                <input
                  type="text"
                  placeholder="Light gray placeholder"
                  defaultValue="This should be blue"
                  className="w-full px-4 py-3 rounded-[70px] border border-gray-300 text-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Green Native (text-green)
                </label>
                <input
                  type="text"
                  placeholder="Light gray placeholder"
                  defaultValue="This should be green"
                  className="w-full px-4 py-3 rounded-[70px] border border-gray-300 text-green"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">Expected Behavior</h2>
            <div className="bg-gray-50 p-6 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <p className="text-sm">✅ Text color classes should override default gray-800</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <p className="text-sm">✅ Placeholder remains light gray (rgb(229, 231, 235))</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <p className="text-sm">✅ Both Input component and native inputs should behave the same</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">Changes Made</h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <ul className="text-sm space-y-2">
                <li>• Removed <code className="bg-white px-1 py-0.5 rounded">!important</code> from text color in globals.css</li>
                <li>• Removed inline style forcing gray-800 color in Input component</li>
                <li>• Kept <code className="bg-white px-1 py-0.5 rounded">!important</code> only for placeholder colors</li>
                <li>• Text color now defaults to gray-800 but can be overridden</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}