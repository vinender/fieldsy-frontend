import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

export default function TestInputStyling() {
  const [inputValue, setInputValue] = useState('')
  const [selectValue, setSelectValue] = useState('+44')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-light-cream p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-dark-green mb-8">Input Styling Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Input Fields</h2>
          
          {/* Regular Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Regular Input {focusedField === 'input1' && <span className="text-green">(Focused)</span>}
            </label>
            <Input
              type="text"
              placeholder="This is light gray placeholder text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setFocusedField('input1')}
              onBlur={() => setFocusedField(null)}
              className="w-full"
            />
            <p className="text-xs text-gray-600 mt-1">
              Input text should be dark gray (rgb(31, 41, 55))
            </p>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Input {focusedField === 'email' && <span className="text-green">(Focused)</span>}
            </label>
            <Input
              type="email"
              placeholder="email@example.com (light gray)"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className="w-full"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Input {focusedField === 'password' && <span className="text-green">(Focused)</span>}
            </label>
            <Input
              type="password"
              placeholder="••••••••• (light gray)"
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              className="w-full"
            />
          </div>

          {/* Select Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Field {focusedField === 'select' && <span className="text-green">(Focused)</span>}
            </label>
            <Select
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              onFocus={() => setFocusedField('select')}
              onBlur={() => setFocusedField(null)}
              className="w-full px-4 py-2.5 rounded-[70px]"
            >
              <option value="+44">+44 UK</option>
              <option value="+1">+1 USA</option>
              <option value="+91">+91 India</option>
            </Select>
            <p className="text-xs text-gray-600 mt-1">
              Select text should also be dark gray
            </p>
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Textarea {focusedField === 'textarea' && <span className="text-green">(Focused)</span>}
            </label>
            <textarea
              placeholder="This is a textarea with light gray placeholder..."
              rows={4}
              onFocus={() => setFocusedField('textarea')}
              onBlur={() => setFocusedField(null)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/20"
              style={{
                color: 'rgb(31, 41, 55)',
                WebkitTextFillColor: 'rgb(31, 41, 55)'
              }}
            />
          </div>

          {/* Autofill Test */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Autofill Test</h3>
            <p className="text-sm text-gray-600 mb-4">
              Try using browser autofill here - text should remain dark gray
            </p>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email for autofill test"
                name="email"
                autoComplete="email"
                className="w-full"
              />
              <Input
                type="password"
                placeholder="Password for autofill test"
                name="password"
                autoComplete="current-password"
                className="w-full"
              />
            </div>
          </div>

          {/* Color Reference */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Color Reference</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-16 h-8 rounded" style={{ backgroundColor: 'rgb(31, 41, 55)' }}></div>
                <span className="text-sm">Input Text: rgb(31, 41, 55) - Dark Gray</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-8 rounded" style={{ backgroundColor: 'rgb(229, 231, 235)' }}></div>
                <span className="text-sm">Placeholder: rgb(229, 231, 235) - Gray-200 (Lighter)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-8 rounded bg-green"></div>
                <span className="text-sm">Focus Border: Green (#3A6B22)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}