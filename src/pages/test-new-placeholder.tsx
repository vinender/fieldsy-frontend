import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function TestNewPlaceholder() {
  const [focused, setFocused] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-dark-green mb-8">New Placeholder Color Test</h1>
        
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Input Component</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Normal State {focused === 'input1' && <span className="text-green">(Focused)</span>}
                </label>
                <Input
                  type="text"
                  placeholder="Placeholder text rgb(185, 186, 188)"
                  onFocus={() => setFocused('input1')}
                  onBlur={() => setFocused(null)}
                  className="py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Input {focused === 'email' && <span className="text-green">(Focused)</span>}
                </label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  className="py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  With Value
                </label>
                <Input
                  type="text"
                  placeholder="This placeholder is hidden"
                  defaultValue="Input with actual text"
                  className="py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Text Color (text-blue-600)
                </label>
                <Input
                  type="text"
                  placeholder="Placeholder remains gray"
                  defaultValue="Blue text"
                  className="py-3 text-blue-600"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Native HTML Input</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Normal State {focused === 'native1' && <span className="text-green">(Focused)</span>}
                </label>
                <input
                  type="text"
                  placeholder="Placeholder text rgb(185, 186, 188)"
                  onFocus={() => setFocused('native1')}
                  onBlur={() => setFocused(null)}
                  className="w-full px-4 py-3 rounded-[70px] border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Native {focused === 'nativeEmail' && <span className="text-green">(Focused)</span>}
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  onFocus={() => setFocused('nativeEmail')}
                  onBlur={() => setFocused(null)}
                  className="w-full px-4 py-3 rounded-[70px] border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  With Value
                </label>
                <input
                  type="text"
                  placeholder="This placeholder is hidden"
                  defaultValue="Input with actual text"
                  className="w-full px-4 py-3 rounded-[70px] border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Text Color (text-blue-600)
                </label>
                <input
                  type="text"
                  placeholder="Placeholder remains gray"
                  defaultValue="Blue text"
                  className="w-full px-4 py-3 rounded-[70px] border border-gray-300 text-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Color Reference</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="h-20 rounded-lg border-2 border-gray-300 flex items-center justify-center" 
                     style={{ backgroundColor: 'rgb(185, 186, 188)' }}>
                  <span className="text-white font-medium text-sm">New Placeholder</span>
                </div>
                <p className="mt-2 text-sm font-medium">rgb(185, 186, 188)</p>
                <p className="text-xs text-gray-600">Custom gray for placeholders</p>
              </div>

              <div>
                <div className="h-20 rounded-lg border-2 border-gray-300 flex items-center justify-center" 
                     style={{ backgroundColor: 'rgb(31, 41, 55)' }}>
                  <span className="text-white font-medium text-sm">Text Color</span>
                </div>
                <p className="mt-2 text-sm font-medium">rgb(31, 41, 55)</p>
                <p className="text-xs text-gray-600">Default input text (gray-800)</p>
              </div>

              <div>
                <div className="h-20 rounded-lg border-2 border-gray-300 flex items-center justify-center bg-white">
                  <span className="font-medium text-sm" style={{ color: 'rgb(185, 186, 188)' }}>
                    Sample Placeholder
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium">On White Background</p>
                <p className="text-xs text-gray-600">How it looks in inputs</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded border">
              <h3 className="font-semibold text-sm mb-3">Implementation Details:</h3>
              <ul className="text-xs space-y-1 text-gray-600">
                <li>✅ Placeholder color: rgb(185, 186, 188)</li>
                <li>✅ Same color on focus (doesn't change)</li>
                <li>✅ Applied via CSS Module, Global CSS, and dynamic styles</li>
                <li>✅ Works for all input types and textareas</li>
                <li>✅ Text color can still be customized with classes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}