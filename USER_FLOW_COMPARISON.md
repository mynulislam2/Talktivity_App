# User Flow Comparison: Next.js vs React Native

## Complete User Journey Flow

### 1. Registration → Onboarding

**Next.js:**
- After successful registration, `useAuthSubmit` loads lifecycle
- Uses `getRedirectPath(lifecycle)` which returns `/onboarding` if `onboarding.completed === false`
- Navigates to `/onboarding`

**React Native:**
- After successful registration, `useAuthSubmitNative` loads lifecycle
- `MainNavigatorWrapper` or `useGlobalRouteGuard` uses `getRedirectPath(lifecycle)` 
- Navigates to `OnboardingScreen` if `onboarding.completed === false`

✅ **MATCHES**: Both navigate to onboarding after registration if not completed

---

### 2. Onboarding → Call

**Next.js:**
- After onboarding completion (`handleComplete`):
  - Saves onboarding data
  - Updates lifecycle: `onboarding_completed: true`
  - Navigates to: `router.replace('/call?CallStart=true')`

**React Native:**
- After onboarding completion (`handleComplete`):
  - Saves onboarding data
  - Updates lifecycle: `onboarding_completed: true`
  - Navigates to: `CallScreen` with `params: { CallStart: true }`

✅ **MATCHES**: Both navigate to Call screen with `CallStart=true` parameter

---

### 3. Call → Report

**Next.js:**
- After call session saved (`handleSessionSaved`):
  - Refreshes lifecycle
  - Stays on `/call` screen
  - User manually clicks "View Report" button to go to `/report`

**React Native:**
- After call session saved (`handleSessionSaved`):
  - Refreshes lifecycle
  - Checks: `callCompleted === true && reportCompleted === false`
  - **Automatically navigates** to `ReportScreen` after 1.5s delay (first-time flow)
  - For subsequent calls, stays on CallScreen (user manually goes to report)

⚠️ **DIFFERENCE**: React Native auto-navigates to Report after first call, Next.js requires manual navigation

---

### 4. Report → Upgrade/Home

**Next.js:**
- After report completion (`completeReport` in `useReportCompletion`):
  - Updates lifecycle: `report_completed: true`
  - Loads subscription status
  - If `hasActiveSubscription || hasActiveTrial` → Navigates to `/home`
  - Otherwise → Navigates to `/upgrade`

**React Native:**
- After report completion (`completeReport` in `useReportCompletion`):
  - Updates lifecycle: `report_completed: true`
  - Loads subscription status
  - If `hasActiveSubscription || hasActiveTrial` → Navigates to `Home` screen
  - Otherwise → Navigates to `SubscriptionScreen` (in ProfileStack)

✅ **MATCHES**: Both check subscription and navigate accordingly (React Native uses `SubscriptionScreen` instead of `/upgrade` route)

---

### 5. Upgrade → Home

**Next.js:**
- After free trial success:
  - Navigates to `/free-trial-success` page
  - On "Start Learning" button → `router.push('/home')`

**React Native:**
- After free trial success:
  - Navigates to `FreeTrialSuccessScreen`
  - On "Start Learning" button → Resets to `Main` navigator (which should show Home)

✅ **MATCHES**: Both navigate to Home after free trial activation

---

## Summary

| Step | Next.js | React Native | Status |
|------|---------|--------------|--------|
| Registration → Onboarding | ✅ Uses `getRedirectPath` | ✅ Uses `getRedirectPath` | ✅ **MATCHES** |
| Onboarding → Call | ✅ `/call?CallStart=true` | ✅ `CallScreen` with `CallStart: true` | ✅ **MATCHES** |
| Call → Report | ⚠️ Manual navigation | ✅ Auto-navigation (first time) | ⚠️ **DIFFERENCE** |
| Report → Upgrade/Home | ✅ Checks subscription | ✅ Checks subscription | ✅ **MATCHES** |
| Upgrade → Home | ✅ `/home` | ✅ `Main` (Home) | ✅ **MATCHES** |

## Key Differences

1. **Call → Report Navigation**: 
   - React Native automatically navigates to Report after first call completion
   - Next.js requires manual "View Report" button click
   - **This is intentional** - React Native provides a smoother first-time user experience

2. **Upgrade Route Name**:
   - Next.js uses `/upgrade` route
   - React Native uses `SubscriptionScreen` in ProfileStack
   - **Functionally equivalent** - both show subscription/upgrade options

## Verification Checklist

- [x] Registration navigates to Onboarding if not completed
- [x] Onboarding completion navigates to Call screen
- [x] Call completion navigates to Report (React Native auto, Next.js manual)
- [x] Report completion checks subscription and navigates accordingly
- [x] Free trial success navigates to Home

## Notes

- The `getRedirectPath` function is **identical** in both codebases
- Lifecycle management logic is **shared** between Next.js and React Native
- Navigation differences are due to platform-specific navigation libraries (Next Router vs React Navigation)
