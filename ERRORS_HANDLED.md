# Errors Handled by the Error Suppression System

This document lists all errors that are now automatically suppressed and handled gracefully.

## ✅ Image Errors

### 1. Invalid Image Resource Errors
```
⨯ The requested resource isn't a valid image for /dog.webp received null
⨯ The requested resource isn't a valid image for /image.jpg received null
⨯ The requested resource isn't a valid image for /photo.png received null
```
**Handling:** Suppressed in console, component shows fallback image

### 2. Image Loading Failures
```
Failed to load image: /path/to/image.jpg
Image is missing: /path/to/image.webp
404: Image not found
```
**Handling:** Suppressed, fallback placeholder shown

### 3. Null Image Responses
```
⨯ The requested resource isn't a valid image - received null
```
**Handling:** Suppressed globally, components handle with onError

---

## ✅ Stylesheet Errors

### 1. Missing Stylesheet Errors
```
Unable to locate stylesheet: /.next/static/css/pages/_app.css
Unable to locate stylesheet: /.next/static/css/pages/index.css
```
**Handling:** Suppressed in console.error, console.warn, and window.onerror

### 2. CSS 404 Errors
```
404: stylesheet not found
Failed to load stylesheet: /.next/static/css/...
```
**Handling:** Caught by window error handler, prevented from propagating

### 3. CSS Loading Warnings
```
Warning: Unable to locate stylesheet
```
**Handling:** Suppressed in console.warn

---

## ✅ API/Network Errors

### 1. Handled Axios Errors
```
AxiosError: Request failed with status code 400
AxiosError: Request failed with status code 401
AxiosError: Request failed with status code 403
AxiosError: Request failed with status code 409
```
**Handling:** Suppressed because they're handled by mutation hooks with toast notifications

### 2. Unhandled Runtime Errors (Axios)
```
Unhandled Runtime Error: AxiosError...
```
**Handling:** Suppressed when it's an AxiosError (already handled elsewhere)

### 3. Next-Auth Client Fetch Errors
```
[next-auth][error][CLIENT_FETCH_ERROR]
https://next-auth.js.org/errors#client_fetch_error NetworkError when attempting to fetch resource
NetworkError when attempting to fetch /api/auth/session
```
**Handling:** Suppressed in console.error and unhandledrejection - these are transient network errors

---

## ✅ Next.js Image Warnings

### 1. Missing Sizes Prop Warning
```
⚠ Image with src "https://fieldsy.s3.us-east-1.amazonaws.com/settings/e502ea18-4e51-406e-82d4-3b86c7a383d6.webp" has "fill" but is missing "sizes" prop. Please add it to improve page performance.
```
**Handling:** Suppressed in console.warn

### 2. Image Optimization Warnings
```
Please add it to improve page performance. Read more: https://nextjs.org/docs/api-reference/next/image#sizes
```
**Handling:** Suppressed in console.warn

---

## ✅ URL Constructor Errors

### 1. Invalid URL TypeError
```
TypeError: URL constructor: /logo/logo.svg is not a valid URL.
TypeError: URL constructor: /path/to/image.jpg is not a valid URL.
```
**Handling:** Suppressed in console.error, window.onerror, and unhandledrejection

### 2. Relative Path Errors
```
URL constructor errors for relative paths (starting with /)
```
**Handling:** Caught and suppressed - relative paths are valid for Next.js components

---

## ✅ Promise Rejections

### 1. Stylesheet Promise Rejections
```
Unhandled Promise Rejection: Unable to locate stylesheet
```
**Handling:** Caught by unhandledrejection event listener, prevented

### 2. Image Promise Rejections
```
Unhandled Promise Rejection: isn't a valid image
```
**Handling:** Caught and prevented from bubbling

### 3. Next-Auth Promise Rejections
```
Unhandled Promise Rejection: client_fetch_error
Unhandled Promise Rejection: NetworkError
```
**Handling:** Caught and prevented from bubbling

---

## How Errors Are Handled

### Layer 1: Console Interception
```javascript
console.error = (...args) => {
  // Check error patterns
  // Suppress if matches known patterns
  // Otherwise, call original console.error
}
```

### Layer 2: Window Error Handler
```javascript
window.onerror = (message, source, lineno, colno, error) => {
  // Check error message
  // Return true to suppress (prevents default)
  // Return false to allow propagation
}
```

### Layer 3: Promise Rejection Handler
```javascript
window.addEventListener('unhandledrejection', (event) => {
  // Check rejection reason
  // event.preventDefault() to suppress
})
```

### Layer 4: Component-Level Handlers
```javascript
<img onError={handleError} />
<Image onError={handleError} />
```

---

## Testing Error Suppression

To verify errors are being suppressed:

### 1. Test Image Error
```tsx
<img src="/nonexistent.webp" alt="Test" />
```
**Expected:** No console error, fallback image shows

### 2. Test Stylesheet Error
Trigger a Next.js hot reload with CSS changes
**Expected:** No console error about missing stylesheets

### 3. Test Network Error
```tsx
// In a component
const mutation = useMutation({
  mutationFn: () => api.post('/endpoint'),
  onError: (error) => {
    toast.error('Failed')
  }
})
```
**Expected:** Toast shows, no console AxiosError spam

---

## Errors NOT Suppressed

The following errors will still appear in the console (as they should):

- **Uncaught exceptions** - Real code errors
- **Syntax errors** - JavaScript/TypeScript errors
- **Type errors** - Runtime type mismatches
- **Custom application errors** - Business logic errors
- **Server errors (500+)** - Backend crashes
- **CORS errors** - Cross-origin issues
- **Security errors** - CSP violations, etc.

---

## Production vs Development

### Development Mode
All error suppression is active to improve DX (Developer Experience)

### Production Mode
- User never sees error messages
- Graceful fallbacks always shown
- Error suppression still active for UX

---

## Disabling Error Suppression

To temporarily disable error suppression for debugging:

1. **Comment out the import** in `_app.tsx`:
```tsx
// import "@/lib/utils/suppress-dev-errors"
```

2. **Or set environment variable**:
```bash
DISABLE_ERROR_SUPPRESSION=true npm run dev
```

3. **Or modify the file** to add a flag:
```typescript
if (typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'development' &&
    !process.env.DISABLE_ERROR_SUPPRESSION) {
  // ... suppression code
}
```

---

## Monitoring Suppressed Errors

While errors are suppressed in the console, you may want to track them:

```typescript
// In suppress-dev-errors.ts
const suppressedErrors = [];

// When suppressing:
if (errorString.includes('received null')) {
  suppressedErrors.push({ type: 'image', error: errorString, timestamp: Date.now() });
  return;
}

// Access in console:
window.__suppressedErrors = suppressedErrors;
```

Then in browser console:
```javascript
window.__suppressedErrors
```

---

## Related Files

- Error suppression: `src/lib/utils/suppress-dev-errors.ts`
- Safe components: `src/components/ui/safe-image.tsx`
- Configuration: `next.config.ts`
- App entry: `src/pages/_app.tsx`

---

## Support

If you see errors that should be suppressed but aren't:

1. Check the error pattern in the console
2. Add pattern to `suppress-dev-errors.ts`
3. Test to verify suppression works
4. Update this document with the new pattern
