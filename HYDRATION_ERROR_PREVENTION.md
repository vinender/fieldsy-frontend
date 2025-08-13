# Hydration Error Prevention Guide

## What is a Hydration Error?

A hydration error occurs when the HTML rendered on the server doesn't match what React tries to render on the client. This breaks React's ability to "hydrate" (attach event listeners to) the server-rendered HTML.

## Common Causes & Solutions

### 1. ❌ Using `typeof window !== 'undefined'` in render logic

**Bad:**
```tsx
const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
return <div>{user ? 'Logged in' : 'Not logged in'}</div>;
```

**Good:**
```tsx
const [user, setUser] = useState(null);
useEffect(() => {
  setUser(localStorage.getItem('user'));
}, []);
return <div>{user ? 'Logged in' : 'Not logged in'}</div>;
```

### 2. ❌ Using `Date.now()` or `Math.random()` directly

**Bad:**
```tsx
return <div>Generated ID: {Math.random()}</div>;
```

**Good:**
```tsx
const [randomId] = useState(() => Math.random());
return <div>Generated ID: {randomId}</div>;
```

### 3. ❌ Conditional rendering based on client-only data

**Bad:**
```tsx
const navigation = [
  ...baseItems,
  ...(localStorage.getItem('role') === 'admin' ? adminItems : [])
];
```

**Good:**
```tsx
const [navigation, setNavigation] = useState(baseItems);
useEffect(() => {
  if (localStorage.getItem('role') === 'admin') {
    setNavigation([...baseItems, ...adminItems]);
  }
}, []);
```

## The Fix Applied to Header.tsx

### What was wrong:
1. Accessing `localStorage` directly during render
2. Navigation array changing between server and client
3. Conditional rendering based on authentication state that differs

### What was fixed:

1. **Used useState for client-only data:**
```tsx
const [localUser, setLocalUser] = useState(null);
useEffect(() => {
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    setLocalUser(JSON.parse(storedUser));
  }
}, []);
```

2. **Used useMemo for consistent navigation:**
```tsx
const navigation = useMemo(() => {
  // Consistent initial state for both server and client
  if (!currentUser) {
    return defaultNavigation;
  }
  // Role-specific navigation after hydration
  return roleBasedNavigation;
}, [currentUser]);
```

3. **Delayed role-specific rendering:**
```tsx
// Only show after client-side hydration
{localUser && currentUser?.role === "FIELD_OWNER" && (
  <Link href="/field-owner">Add Field</Link>
)}
```

## Best Practices to Prevent Hydration Errors

### ✅ DO:
1. **Use useEffect for client-only code**
   - localStorage, sessionStorage, window, document access
   - Browser API calls
   - Third-party library initialization

2. **Use useState for dynamic initial values**
   - Store client-only data in state
   - Initialize after component mounts

3. **Use useMemo for derived values**
   - Compute navigation arrays
   - Filter/sort data based on client state

4. **Keep initial render consistent**
   - Same HTML structure on server and client
   - Add dynamic content after hydration

### ❌ DON'T:
1. **Access browser APIs during render**
   - No localStorage/sessionStorage in render
   - No window/document checks in render logic

2. **Use random values in render**
   - No Math.random() or Date.now() in JSX
   - No unique IDs generated during render

3. **Have different HTML structure**
   - Don't conditionally render based on `typeof window`
   - Don't change element order between server/client

## Testing for Hydration Errors

1. **Check browser console** for hydration warnings
2. **View page source** to see server HTML
3. **Compare with React DevTools** client render
4. **Test with JavaScript disabled** to see server output

## Quick Checklist

Before committing code, check:
- [ ] No `typeof window` checks in render logic
- [ ] No localStorage/sessionStorage access outside useEffect
- [ ] No Math.random() or Date.now() in render
- [ ] Consistent initial state for server and client
- [ ] Client-only features wrapped in useEffect
- [ ] Dynamic navigation/menus use useState/useMemo

## Remember

> "The first render on the client must match the server render exactly. After that first render, you can show different content."

This is the golden rule for avoiding hydration errors in Next.js applications.