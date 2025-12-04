# Solution Approach & Trade-offs

## Backend

### 1. Async I/O (`items.js`)
Replaced blocking `readFileSync` with async `fs.promises`. Routes now use `async/await` with basic validation.

**Trade-off:** Slightly more verbose, but far better scalability and cleaner error handling.

### 2. Stats Caching (`stats.js`)
Added simple file-based caching and used `fs.watchFile` to automatically invalidate stats when the data file changes.

**Trade-off:** Uses polling, but it's reliable and lightweight for this project.

### 3. Unit Tests
Added Jest + Supertest tests covering success and error cases. The data file is restored after tests.

---

## Frontend

### 1. Memory Leak Fix
Implemented `AbortController` and an `isMounted` guard to prevent state updates after unmount.

**Trade-off:** Slightly more code, but eliminates the memory leak.

### 2. Pagination & Search
Added server-side pagination and a 300ms debounced search. Backend now returns metadata like total pages and item count.

**Trade-off:** Small debounce delay, but significantly fewer unnecessary API calls.

### 3. Virtualized List
Integrated `react-window`’s `FixedSizeList` to efficiently render large lists without performance issues.

**Trade-off:** Requires fixed item heights, but provides strong performance improvements.

### 4. UI Fixes
General styling and layout improvements were made to clean up the UI without adding heavy libraries.

**Trade-off:** Basic UI improvements only — full component systems would require additional setup.

---

## Overall
The approach focuses on solving the key issues without over-engineering — async I/O for performance, light caching, scalable pagination and search, and targeted frontend performance fixes.

---

## Future Enhancements
- Integrate React Query  
- Add optimistic updates  
- Improve loading skeletons  
- Add end-to-end testing  
- Introduce better UI/component libraries such as Tailwind, shadcn/ui, or Radix for a more modern and consistent design system

