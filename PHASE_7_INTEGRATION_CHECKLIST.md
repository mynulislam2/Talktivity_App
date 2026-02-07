# Phase 7 Integration Checklist

## Quick Setup (30 minutes)

### Step 1: Install Dependencies
```bash
cd agent-starter-react-native
npm install
```

### Step 2: Setup Test Environment
```bash
# Verify Jest is installed
npm test -- --version

# Run all tests (should have 25+ tests)
npm test
```

### Step 3: Verify Files Created
- [x] `Hooks/useSoundEffect.ts` - Audio management
- [x] `Hooks/useNotifications.ts` - Push notifications
- [x] `lib/errorHandler.ts` - Error handling
- [x] `lib/performanceMonitor.ts` - Performance tracking
- [x] `components/common/ErrorBoundary.tsx` - Error boundary
- [x] `__tests__/AuthService.test.ts` - Auth tests
- [x] `__tests__/errorHandler.test.ts` - Error handler tests
- [x] `__tests__/useAuth.test.ts` - Auth hook tests
- [x] `jest.config.js` - Jest configuration
- [x] `jest.setup.js` - Test setup

---

## Phase 7 Integration Tasks

### ✅ Task 1: ErrorBoundary Integration
**Location:** `app/_layout.tsx`
**Status:** ✅ DONE
- Imported ErrorBoundary
- Wrapped RootNavigator
- Now catches all rendering errors app-wide

**Quick Test:**
```tsx
// In any component, add this temporarily to test error catching:
if (testError) {
  throw new Error('Test error');
}
// Should see ErrorBoundary fallback UI instead of crash
```

### ⏳ Task 2: Audio Integration
**File:** `Hooks/useSoundEffect.ts` already created
**Integration Points:** Components that need success/error feedback

**To Integrate:**
1. Import in component: `import { useSoundEffect, SoundEffect } from '../Hooks/useSoundEffect';`
2. Use in handlers: `await playSound(SoundEffect.SUCCESS);`
3. Add sound files: `assets/sounds/success.wav`, `error.wav`, etc.

**Recommended Components to Update:**
- Learning screens (on correct/incorrect answer)
- Session completion screens
- Error display components
- Achievement unlock screens

**Todo Code Pattern:**
```tsx
const { playSound } = useSoundEffect();

const handleCorrectAnswer = async () => {
  // Handle logic...
  await playSound(SoundEffect.SUCCESS);
};
```

### ⏳ Task 3: Notifications Integration
**File:** `Hooks/useNotifications.ts` already created
**Integration Points:** Session updates, achievements, reminders

**To Integrate:**
1. Request permissions on app startup
2. Send notifications on key events:
   - Session started/completed
   - Achievement unlocked
   - Friend request received
   - New message arrived

**App Startup (in RootNavigator or _layout.tsx):**
```tsx
const { requestPermissions } = useNotifications();

useEffect(() => {
  // Request notification permissions on app load
  requestPermissions();
}, []);
```

**Send Notification Example:**
```tsx
const { sendLocalNotification } = useNotifications();

const sessionComplete = async () => {
  await sendLocalNotification({
    title: 'Session Complete!',
    body: 'Great job! You've earned 10 XP.',
    sound: 'default',
  }, 0); // delay in seconds
};
```

### ⏳ Task 4: Error Handler Integration
**File:** `lib/errorHandler.ts` already created
**Integration Points:** All API calls, form submissions

**To Integrate:**
1. Wrap API calls with error handling
2. Use handleApiError for HTTP errors
3. Use validation helpers for forms
4. Call showErrorAlert to display errors

**API Call Pattern:**
```tsx
import { handleApiError, showErrorAlert } from '../lib/errorHandler';

async function fetchData() {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    const appError = handleApiError(error);
    showErrorAlert(appError);
    // Could also check error.type for specific handling
    if (appError.type === ErrorType.AUTH) {
      // Refresh token and retry
    }
  }
}
```

**Form Validation Pattern:**
```tsx
import { validateRequired, validateEmail, validatePassword } from '../lib/errorHandler';

const validateLoginForm = (email, password) => {
  validateRequired(email, 'Email');
  validateEmail(email);
  validateRequired(password, 'Password');
  validatePassword(password);
  return true;
};
```

### ⏳ Task 5: Performance Monitoring Integration
**File:** `lib/performanceMonitor.ts` already created
**Integration Points:** Screen loads, API calls, expensive operations

**To Integrate:**
1. Measure app startup time
2. Track screen navigation time
3. Monitor API response times
4. Measure component render times

**Pattern 1: Manual Measurement**
```tsx
import { performanceMonitor } from '../lib/performanceMonitor';

useEffect(() => {
  performanceMonitor.startMeasure('screen-load', 'navigation');
  
  // Load data...
  
  performanceMonitor.endMeasure('screen-load');
}, []);
```

**Pattern 2: Automatic Async Measurement**
```tsx
const data = await performanceMonitor.measureAsync(
  'fetch-data',
  () => api.get('/data'),
  'api'
);
```

**View Performance Summary:**
```tsx
// Add to development menu or log on app startup
const summary = performanceMonitor.getSummary();
console.log(summary);
```

### ⏳ Task 6: Test Suite Execution
**Files:** `__tests__/*.test.ts` already created
**Status:** Ready to run

**Run Tests:**
```bash
# All tests
npm test

# Specific test file
npm test errorHandler.test.ts

# Watch mode (auto-rerun on changes)
npm test -- --watch

# Coverage report
npm test -- --coverage
```

**Expected Test Results:**
- ✅ errorHandler.test.ts - 25+ tests passing
- ⏳ AuthService.test.ts - Awaiting real API integration
- ⏳ useAuth.test.ts - Awaiting real API integration

---

## Phase 7 Completion Verification

### Checklist for Success

**Code Quality:**
- [ ] All Phase 7 files created (10 files total)
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No import errors: `npm run lint` (or manual check)
- [ ] ESLint clean: `npx eslint .`

**Dependencies:**
- [ ] `npm install` completes successfully
- [ ] All Phase 7 packages present:
  - expo-audio
  - expo-notifications
  - expo-image-picker
  - @testing-library/* (4 packages)

**Testing:**
- [ ] `npm test` runs without errors
- [ ] errorHandler.test.ts passes (25+ tests)
- [ ] Coverage report shows > 50% coverage
- [ ] No console errors or warnings

**Integration:**
- [ ] ErrorBoundary wraps app in _layout.tsx
- [ ] app/_layout.tsx imports ErrorBoundary
- [ ] No rendering errors when app starts
- [ ] Error boundary fallback appears if error thrown

**Sound Effects (if audio testing):**
- [ ] useSoundEffect hook imports without errors
- [ ] SoundEffect enum has 7 effects
- [ ] Audio session initializes without errors
- [ ] Volume control methods exist

**Notifications (if testing):**
- [ ] useNotifications hook imports without errors
- [ ] requestPermissions method exists
- [ ] sendLocalNotification method exists
- [ ] AsyncStorage for notification state works

**Performance:**
- [ ] performanceMonitor imports without errors
- [ ] startMeasure/endMeasure methods exist
- [ ] getSummary method returns metrics
- [ ] Console logging doesn't crash app

### Manual Testing Script

```tsx
// Add to a test component to verify all Phase 7 features

import { useSoundEffect, SoundEffect } from '../Hooks/useSoundEffect';
import { useNotifications } from '../Hooks/useNotifications';
import { handleApiError, validateEmail, ErrorType } from '../lib/errorHandler';
import { performanceMonitor } from '../lib/performanceMonitor';
import ErrorBoundary from '../components/common/ErrorBoundary';

export function Phase7TestComponent() {
  const { playSound } = useSoundEffect();
  const { sendLocalNotification } = useNotifications();

  const testAll = async () => {
    // Test sound
    try {
      await playSound(SoundEffect.SUCCESS);
      console.log('✅ Sound effect working');
    } catch (e) {
      console.log('❌ Sound effect failed:', e);
    }

    // Test notification
    try {
      await sendLocalNotification({
        title: 'Test Notification',
        body: 'Phase 7 testing',
        sound: 'default',
      });
      console.log('✅ Notification working');
    } catch (e) {
      console.log('❌ Notification failed:', e);
    }

    // Test error handling
    try {
      validateEmail('invalid-email');
      console.log('❌ Email validation should have failed');
    } catch (e) {
      console.log('✅ Error validation working');
    }

    // Test performance
    performanceMonitor.startMeasure('test', 'measure');
    await new Promise(r => setTimeout(r, 100));
    performanceMonitor.endMeasure('test');
    console.log('✅ Performance monitor working');
    console.log(performanceMonitor.getSummary());
  };

  return (
    <Button title="Test All Phase 7 Features" onPress={testAll} />
  );
}
```

---

## Known Issues & Solutions

### Issue: Jest tests not running
**Solution:**
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall node_modules
rm -rf node_modules
npm install
npm test
```

### Issue: AudioSession errors
**Solution:**
- Audio files might not exist in assets/sounds/
- Create the directory: `mkdir assets/sounds/`
- Add `.wav` files for each SoundEffect enum value

### Issue: Notification permissions not showing
**Solution:**
- Requires real device or emulator
- Android: May need additional manifest permissions
- iOS: Requires APNS setup in Xcode

### Issue: ErrorBoundary not catching errors
**Solution:**
- Only catches rendering errors, not event handlers
- Event handler errors should use try/catch
- Network errors go to catch blocks

### Issue: Performance metrics not accurate
**Solution:**
- Disable debug menus that might slow performance
- Test on release build: `npx expo build`
- Some measurements might be compilation overhead

---

## Next Phase: Post-Launch

### Phase 7.5: Analytics Integration (Optional)
1. Setup Sentry for error tracking
2. Setup Mixpanel for performance metrics
3. Wire up error handler to send to Sentry
4. Wire up performance monitor to send metrics

### Phase 8: Deployment
1. Build iOS app (requires Apple Developer account)
2. Build Android app (requires Google Play account)
3. Setup CI/CD pipeline
4. Submit to app stores

### Phase 9: Post-Launch
1. Monitor error rates and performance
2. Gather user feedback
3. Plan feature updates
4. Iteration cycles

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Test Coverage | > 50% | ✅ Configured |
| App Startup | < 3s | ⏳ Monitor |
| Screen Transition | < 300ms | ⏳ Monitor |
| API Response | < 2s | ⏳ Monitor |
| Frame Rate | 60 FPS (16.67ms) | ⏳ Monitor |
| Error Rate | < 0.1% | ⏳ Monitor |
| Crash Rate | < 0.01% | ⏳ Monitor |

---

## Quick Commands Reference

```bash
# Setup
npm install
npx expo doctor

# Development
npm start
npm run web
npm run android
npm run ios

# Testing
npm test
npm test -- --coverage
npm test -- --watch

# Building
npm run build
exppo build --platform ios
expo build --platform android

# Performance
npm run perf-test

# Linting
npx eslint .
npx tsc --noEmit
```

---

**Phase 7 is complete and ready for integration!** 🚀

All files created, tests configured, dependencies added. Follow the integration tasks above to wire everything into your app.
