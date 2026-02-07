# React Native vs Next.js - Complete User Flow Comparison

**Date:** February 7, 2026  
**Status:** Checking if React Native is a complete clone of Next.js  
**Purpose:** Verify all user flows are implemented in React Native

---

## 📋 Next.js Pages & Features (Complete List)

### Authentication Flow
| Page | Route | Purpose | Status |
|------|-------|---------|--------|
| **Signup** | `/signup` | User registration with email/password | ✅ |
| **Login** | `/login` | User authentication | ✅ |
| **Forgot Password** | `/forgot-password` | Password reset flow | ✅ |
| **Free Trial Start** | `/free-trial` | Free trial activation | ❓ |
| **Free Trial Success** | `/free-trial-success` | Post free-trial confirmation | ❓ |

### Core User Flows
| Page | Route | Purpose | Status |
|------|-------|---------|--------|
| **Home Page** | `/` | Main dashboard with timeline | ❓ |
| **Onboarding** | `/onboarding` | User level selection & setup | ✅ |
| **Topics** | `/topics` | Browse and select learning topics | ✅ |
| **Practice** | `/practice` | Practice module with lessons | ✅ |
| **Call** | `/call` | Test call / voice session | ✅ |
| **Quiz** | `/quiz` | Assessment quiz | ❓ |
| **Listening Quiz** | `/listening-quiz` | Listening comprehension quiz | ❓ |

### Learning & Progress
| Page | Route | Purpose | Status |
|------|-------|---------|--------|
| **Progress** | `/progress` | User progress tracking | ✅ |
| **Report** | `/report` | Session report/feedback | ✅ |
| **Today's Report** | `/todays-report` | Daily session summary | ❓ |
| **Instructions** | `/instructions` | User instructions | ❓ |

### Social & Community
| Page | Route | Purpose | Status |
|------|-------|---------|--------|
| **Community/Chat** | `/chat` | Messaging and chat | ✅ |
| **Leaderboard** | `/leaderboard` | User rankings | ✅ |

### User Settings
| Page | Route | Purpose | Status |
|------|-------|---------|--------|
| **Profile** | `/profile` | User profile page | ✅ |
| **Upgrade** | `/upgrade` | Plan upgrade page | ✅ |
| **Checkout** | `/checkout` | Payment checkout | ❓ |
| **Payment Success** | `/payment-success` | Post-payment confirmation | ❓ |
| **Payment Cancel** | `/payment-cancel` | Payment cancelled flow | ❓ |
| **Payment Failed** | `/payment-failed` | Payment error handling | ❓ |
| **Refund** | `/refund` | Refund request page | ❓ |
| **Test Payment** | `/test-payment` | Payment testing | ❓ |

### Legal & About
| Page | Route | Purpose | Status |
|------|-------|---------|--------|
| **About** | `/about` | About the app | ❓ |
| **About Desktop** | `/about-desktop` | Desktop version info | ❓ |
| **Terms** | `/terms` | Terms of service | ❓ |
| **Privacy** | `/privacy` | Privacy policy | ❓ |
| **Instructions Desktop** | `/instructions-desktop` | Desktop instructions | ❓ |

### Admin Features
| Directory | Purpose | Status |
|-----------|---------|--------|
| `/admin` | Admin dashboard | ❓ |

---

## 📱 React Native Screens (Current Implementation)

### Authentication Flow
| Screen | Location | Purpose | Status |
|--------|----------|---------|--------|
| **LoginScreen** | `screens/auth/LoginScreen.tsx` | User login | ✅ |
| **SignupScreen** | `screens/auth/SignupScreen.tsx` | User registration | ✅ |
| **ForgotPasswordScreen** | `screens/auth/ForgotPasswordScreen.tsx` | Password reset | ✅ |

### Home & Navigation
| Screen | Location | Purpose | Status |
|--------|----------|---------|--------|
| **HomeScreen** | `screens/home/HomeScreen.tsx` | Main dashboard/home page | ✅ |

### Learning Screens
| Screen | Location | Purpose | Status |
|--------|----------|---------|--------|
| **LearningScreen** | `screens/learning/LearningScreen.tsx` | Main learning module selection | ✅ |
| **TopicsScreen** | `screens/learning/TopicsScreen.tsx` | Topic selection/browse | ✅ |
| **PracticeScreen** | `screens/learning/PracticeScreen.tsx` | Practice lessons | ✅ |
| **RoleplayScreen** | `screens/learning/RoleplayScreen.tsx` | Roleplay lessons (not in Next.js?) | ✅ |
| **CallScreen** | `screens/learning/CallScreen.tsx` | Voice call/test session | ✅ |
| **ProgressScreen** | `screens/learning/ProgressScreen.tsx` | Progress tracking | ✅ |

### Social/Community
| Screen | Location | Purpose | Status |
|--------|----------|---------|--------|
| **SocialScreen** | `screens/social/SocialScreen.tsx` | Social hub | ✅ |
| **ChatScreen** | `screens/social/ChatScreen.tsx` | Messaging/chat | ✅ |
| **CommunityScreen** | `screens/social/CommunityScreen.tsx` | Community features | ✅ |
| **LeaderboardScreen** | `screens/social/LeaderboardScreen.tsx` | Rankings/leaderboard | ✅ |

### Profile & Settings
| Screen | Location | Purpose | Status |
|--------|----------|---------|--------|
| **ProfileScreen** | `screens/profile/ProfileScreen.tsx` | User profile | ✅ |
| **EditProfileScreen** | `screens/profile/EditProfileScreen.tsx` | Edit profile | ✅ |
| **SettingsScreen** | `screens/profile/SettingsScreen.tsx` | App settings | ✅ |
| **SubscriptionScreen** | `screens/profile/SubscriptionScreen.tsx` | Subscription/upgrade | ✅ |

---

## ⚠️ User Flows - Detailed Comparison

### FLOW 1: Authentication & Onboarding

#### Next.js Flow
```
/login → /signup → /onboarding → /
```
✅ Signup Page
✅ Login Page  
✅ Onboarding Page (Level selection)
❓ Remember login state across sessions

#### React Native Flow
```
LoginScreen → SignupScreen → HomeScreen (no explicit onboarding?)
```
✅ LoginScreen
✅ SignupScreen
⚠️ ForgotPasswordScreen (exists but not clear where it fits)
❓ Onboarding screen showing level selection?
❓ Does HomeScreen show onboarding for new users?

**Status:** 🟡 POSSIBLY INCOMPLETE - Need to verify onboarding flow in RN

---

### FLOW 2: Home & Timeline

#### Next.js Flow
```
/ (home page with timeline)
```
Features:
- Timeline of past lessons
- Quick action buttons
- Daily challenge or featured topic
- Navigation to other sections

#### React Native Flow
```
HomeScreen
```
❓ Does it have timeline of past lessons?
❓ Quick action buttons?
❓ Daily challenge display?

**Status:** 🟡 NEED TO VERIFY - Check HomeScreen implementation

---

### FLOW 3: Learning - Select Topic & Practice

#### Next.js Flow
```
/topics (browse all) → /Practice (learn) → /report (feedback) → /
```
Features:
- All topics listed
- Select topic
- See lesson
- Get feedback report

#### React Native Flow
```
TopicsScreen → PracticeScreen → ProgressScreen
```
❓ How does report feedback work?
❓ Is there a report screen after practice?

**Status:** 🟡 NEED TO VERIFY - Check report/feedback flow

---

### FLOW 4: Call/Test Session

#### Next.js Flow
```
/call (voice session with AI)
→ /report (session feedback)
→ /
```
Features:
- Voice interface
- Talk to AI agent
- Get feedback on performance
- Return home

#### React Native Flow
```
CallScreen → ??? → HomeScreen
```
❓ Does CallScreen do voice session?
❓ Where is report shown after call?

**Status:** 🔴 UNCLEAR - Need to verify call flow

---

### FLOW 5: Practice Mode (with Quiz)

#### Next.js Flow
```
/topics → /Practice → /quiz (optional)
```
Features:
- Lesson content
- Optional quiz assessment
- Progress tracking

#### React Native Flow
```
TopicsScreen → PracticeScreen → ???
```
❓ Is there a quiz component?
❓ How does quiz flow work?

**Status:** 🟡 NEED TO VERIFY - Quiz implementation

---

### FLOW 6: Progress & Reporting

#### Next.js Flow
```
/progress (detailed progress page)
/report (session report)
/todays-report (daily summary)
```
Features:
- Overall progress metrics
- Per-session feedback
- Daily activity summary

#### React Native Flow
```
ProgressScreen
```
❓ Does it show daily summary?
❓ Session-level reports?
❓ Timeline view?

**Status:** 🟡 NEED TO VERIFY - Report/progress details

---

### FLOW 7: Social & Community

#### Next.js Flow
```
/chat (messaging)
/leaderboard (rankings)
```
Features:
- Message other users
- See rankings
- Compete with friends

#### React Native Flow
```
ChatScreen
LeaderboardScreen
CommunityScreen
SocialScreen
```
✅ All screens exist
⚠️ RN has more screens (CommunityScreen, SocialScreen) - unclear purpose

**Status:** ✅ Social flows appear complete

---

### FLOW 8: Upgrade/Subscription

#### Next.js Flow
```
/upgrade (see plans)
→ /checkout (payment)
→ /payment-success (confirmation)
```
Features:
- Show subscription plans
- Checkout flow
- Payment processing
- Success confirmation

#### React Native Flow
```
SubscriptionScreen
```
❓ Connected to payment system?
❓ Success/cancel flows?

**Status:** 🟡 NEED TO VERIFY - Payment flow

---

### FLOW 9: Profile Settings

#### Next.js Flow
```
/profile (view profile)
/upgrade (subscription management)
Settings in header
```
Features:
- View/edit profile info
- Manage subscription
- Settings/preferences
- Logout

#### React Native Flow
```
ProfileScreen
EditProfileScreen
SettingsScreen
SubscriptionScreen
```
✅ All screens exist
❓ Settings full implementation?
❓ How is logout handled?

**Status:** 🟡 NEED TO VERIFY - Logout flow, settings completeness

---

## 🔍 Specific Features to Check

### 1. Onboarding Flow
- [ ] Does RN have user level selection on first login?
- [ ] Is there an onboarding tour/tutorial?
- [ ] Does it show feature explanations?

### 2. Free Trial
- [ ] Does signup offer free trial option?
- [ ] Free trial duration and limits?
- [ ] How is it activated in RN?

### 3. Test Call (Voice Session)
- [ ] Is CallScreen a live voice session with AI?
- [ ] Does it record transcript?
- [ ] How is feedback shown?
- [ ] Where is report displayed?

### 4. Quiz Assessment
- [ ] Does practice have quiz component?
- [ ] Where is quiz in RN?
- [ ] How are results shown?

### 5. Listening Quiz
- [ ] Next.js has `/listening-quiz`
- [ ] Does RN have equivalent?

### 6. Admin Features
- [ ] Next.js has `/admin` routes
- [ ] Does RN have admin functionality?

### 7. Payment Flow
- [ ] Do payment pages exist in RN?
- [ ] Are success/cancel flows handled?
- [ ] Is refund flow available?

### 8. Timeline View
- [ ] Home page shows timeline in Next.js
- [ ] Does RN HomeScreen show timeline?
- [ ] Can users see past lessons?

---

## 📊 Current Status Summary

### Implemented ✅
- [x] Login/Signup/ForgotPassword
- [x] Home screen
- [x] Topics browsing
- [x] Practice mode
- [x] Call screen (exists, functionality unclear)
- [x] Progress tracking
- [x] Chat/messaging
- [x] Leaderboard
- [x] Profile editing
- [x] Settings
- [x] Subscription management

### Questionable ⚠️ (Need Verification)
- [ ] Onboarding flow for new users
- [ ] Report screen after sessions
- [ ] Today's report/daily summary
- [ ] Quiz/listening quiz
- [ ] Full payment flow
- [ ] Logout functionality
- [ ] Timeline on home page
- [ ] Voice session in CallScreen

### Not Found ❌ (Missing)
- [ ] Free trial flow
- [ ] Admin dashboard
- [ ] Legal pages (terms, privacy, about)
- [ ] Payment success/cancel/failed pages
- [ ] Refund page
- [ ] Desktop instructions
- [ ] Test payment page

---

## 🎯 What Needs Verification

**Critical Questions:**

1. **Complete Onboarding:** When a new user signs up, do they go through level selection and tutorial in React Native like they do in Next.js?

2. **Voice Sessions:** Does CallScreen actually connect to LiveKit and do a voice session with AI? Or is it just a placeholder?

3. **Reports:** After a practice or call session, where is the feedback shown? Is there a report screen?

4. **Timeline:** Is there a home screen that shows past lessons and activities like Next.js does?

5. **Payments:** Is the payment flow fully implemented with success/cancel handling?

6. **Logout:** How does logout work in React Native? Where is the logout button?

7. **Quiz:** Is there quiz functionality integrated into practice?

8. **Settings:** What's in SettingsScreen? Theme, notifications, account settings?

---

## 📋 AUDIT FINDINGS - What's Actually Implemented

### ✅ VERIFIED AS IMPLEMENTED

#### HomeScreen ✅
- Welcome message with user name
- Statistics card showing:
  - Time spent today (0/5 min)
  - Streak counter
  - User level
- Quick action buttons:
  - Practice
  - Call
  - Roleplay
  - Settings
- Plan info card showing current plan
- Recent Activity section (placeholder)
- **MISSING:** Timeline of past lessons

#### LearningScreen Flow ✅
- **TopicsScreen:** Browse and select topics
- **PracticeScreen:** Practice sessions with voice interaction (uses usePracticeSession hook)
- **CallScreen:** Direct voice calls with AI (uses useCallSession hook)
- **RoleplayScreen:** Roleplay scenarios
- **ProgressScreen:** Progress tracking with metrics and achievements
- **MISSING:** Report screen after sessions, Quiz functionality

#### Social Features ✅
- **ChatScreen:** Messaging (implemented)
- **CommunityScreen:** Community features (implemented)
- **LeaderboardScreen:** Rankings (implemented)
- **SocialScreen:** Social hub (implemented)

#### Profile & Settings ✅
- **ProfileScreen:** View user profile (implemented)
- **EditProfileScreen:** Edit profile (implemented)
- **SettingsScreen:** Full settings with:
  - Notification toggle
  - Dark mode toggle
  - Private profile toggle
  - Email notifications toggle
  - Language selection
  - **✅ LOGOUT BUTTON** - Calls dispatch(logoutUser()) with confirmation dialog
- **SubscriptionScreen:** Subscription management (implemented)

#### Authentication ✅
- **LoginScreen:** Email/password login
- **SignupScreen:** Email/password registration
- **ForgotPasswordScreen:** Password reset
- **Auto-login:** useAutoLogin hook restores session on app startup

---

### ⚠️ QUESTIONABLE / NEEDS VERIFICATION

#### 1. Onboarding Flow ⚠️
**Next.js:** Full 15-step onboarding with:
- User level selection (Beginner/Intermediate/Advanced)
- Goal setting
- Learning preferences
- Detailed profile setup

**React Native:** 
- ❌ **NO EXPLICIT ONBOARDING SCREEN**
- Has onboardingSlice and useOnboardingForm hooks
- Auth flow goes: Login → Signup → MainNavigator
- Question: **Is onboarding done after signup? Or skipped entirely?**

**Status:** 🔴 MISSING OR UNCLEAR

---

#### 2. Session Reports ⚠️
**Next.js:** `/report` page with:
- English score card
- Fluency analysis
- Grammar feedback
- Vocabulary review
- Discourse analysis
- Multi-step report navigation

**React Native:**
- ❌ **NO REPORT SCREEN FOUND**
- CallScreen/PracticeScreen have endSession callbacks
- Question: **Where is feedback shown after sessions? Just in ProgressScreen?**

**Status:** 🔴 MISSING

---

#### 3. Quiz / Assessment ⚠️
**Next.js:** 
- `/quiz` page exists
- `/listening-quiz` page exists
- Assessment of comprehension

**React Native:**
- ❌ **NO QUIZ FUNCTIONALITY FOUND**
- No quiz screens or components
- Question: **How do users take assessments?**

**Status:** 🔴 MISSING

---

#### 4. Home Page Timeline ⚠️
**Next.js:** Home page shows timeline of past lessons and activities

**React Native:** 
- HomeScreen shows stats and quick actions
- Recent Activity section is empty placeholder
- Question: **Is timeline meant to be in Recent Activity section?**

**Status:** 🟡 PARTIALLY IMPLEMENTED

---

#### 5. Free Trial Flow ⚠️
**Next.js:**
- `/free-trial` page (activate free trial)
- `/free-trial-success` page (confirmation)
- Tracked in subscription system

**React Native:**
- ❌ **NO FREE TRIAL SCREENS**
- Question: **How do users start free trial?**

**Status:** 🔴 MISSING

---

#### 6. Payment/Checkout Flow ⚠️
**Next.js:**
- `/checkout` page
- `/payment-success` page
- `/payment-cancel` page
- `/payment-failed` page

**React Native:**
- ✅ **SubscriptionScreen** exists (shows plans)
- ❌ **NO CHECKOUT/PAYMENT SCREENS**
- Question: **How is payment actually processed?**

**Status:** 🔴 INCOMPLETE

---

#### 7. Legal Pages ⚠️
**Next.js:**
- `/terms` (Terms of Service)
- `/privacy` (Privacy Policy)
- `/about` (About page)

**React Native:**
- ❌ **NO LEGAL PAGES**
- Question: **Are these requirements met?**

**Status:** 🔴 MISSING

---

### 🔍 DETAILED SCREEN AUDIT

#### Total Screens in React Native: **19 screens**

**Auth Section (3 screens):**
- ✅ LoginScreen
- ✅ SignupScreen  
- ✅ ForgotPasswordScreen

**Home Section (1 screen):**
- ✅ HomeScreen

**Learning Section (6 screens):**
- ✅ LearningScreen (selector/hub)
- ✅ TopicsScreen
- ✅ PracticeScreen
- ✅ CallScreen
- ✅ RoleplayScreen
- ✅ ProgressScreen

**Social Section (4 screens):**
- ✅ SocialScreen (hub)
- ✅ ChatScreen
- ✅ CommunityScreen
- ✅ LeaderboardScreen

**Profile Section (4 screens):**
- ✅ ProfileScreen
- ✅ EditProfileScreen
- ✅ SettingsScreen
- ✅ SubscriptionScreen

**Missing Screens (From Next.js):**
- ❌ OnboardingScreen (detailed 15-step flow)
- ❌ ReportScreen (feedback after sessions)
- ❌ QuizScreen / ListeningQuizScreen
- ❌ CheckoutScreen (payment)
- ❌ PaymentSuccessScreen
- ❌ PaymentCancelScreen
- ❌ FreeTrialScreen
- ❌ FreeTrialSuccessScreen
- ❌ TermsScreen
- ❌ PrivacyScreen
- ❌ AboutScreen

---

## 🎯 CRITICAL MISSING FLOWS

### Flow 1: Complete New User Journey ❌
```
Next.js:
Login → Signup → Onboarding (15 steps) → Home → Learn

React Native:
Login → Signup → Home (directly, no onboarding) → Learn
```
**Status:** 🔴 MISSING ONBOARDING

### Flow 2: Complete Learning Session → Feedback ❌
```
Next.js:
Practice/Call → Session Ends → Report (5-card detailed feedback) → Home

React Native:
Practice/Call → Session Ends → ??? (No report screen identified)
```
**Status:** 🔴 MISSING REPORT SCREEN

### Flow 3: Assessment / Quiz ❌
```
Next.js:
Topics → Quiz/Listening Quiz → Results

React Native:
Topics → Practice (no assessment option shown)
```
**Status:** 🔴 MISSING QUIZ

### Flow 4: Subscription Management ❌
```
Next.js:
Upgrade → Plan Selection → Checkout → Payment → Success/Failure

React Native:
SubscriptionScreen (shows plans) → ??? (No checkout/payment)
```
**Status:** 🔴 MISSING PAYMENT FLOW

### Flow 5: Free Trial ❌
```
Next.js:
FreeTrialStart → ActivateTrial → FreeTrialSuccess

React Native:
(No free trial screens found)
```
**Status:** 🔴 MISSING FREE TRIAL

---

## 🚨 SUMMARY: COMPLETENESS MATRIX

| Feature | Next.js | React Native | Status | Priority |
|---------|---------|--------------|--------|----------|
| **Authentication** | ✅ | ✅ | Complete | ✅ |
| **Onboarding** | ✅ (15 steps) | ❌ | **MISSING** | 🔴 CRITICAL |
| **Home/Dashboard** | ✅ | ✅ (partial) | Partial | 🟡 |
| **Learning Hub** | ✅ | ✅ | Complete | ✅ |
| **Practice Sessions** | ✅ | ✅ | Complete | ✅ |
| **Voice Calls** | ✅ | ✅ | Complete | ✅ |
| **Session Reports** | ✅ (detailed) | ❌ | **MISSING** | 🔴 CRITICAL |
| **Quiz/Assessment** | ✅ | ❌ | **MISSING** | 🔴 HIGH |
| **Social/Chat** | ✅ | ✅ | Complete | ✅ |
| **Leaderboard** | ✅ | ✅ | Complete | ✅ |
| **Profile Mgmt** | ✅ | ✅ | Complete | ✅ |
| **Settings** | ✅ | ✅ | Complete | ✅ |
| **Subscription Plans** | ✅ | ✅ | Implemented | ✅ |
| **Payment/Checkout** | ✅ | ❌ | **MISSING** | 🔴 CRITICAL |
| **Free Trial** | ✅ | ❌ | **MISSING** | 🟡 HIGH |
| **Timeline View** | ✅ (home) | ❌ | **MISSING** | 🟡 MEDIUM |
| **Legal Pages** | ✅ | ❌ | **MISSING** | 🟡 MEDIUM |
| **Logout** | ✅ | ✅ | Complete | ✅ |

---

## 📊 COMPLETION PERCENTAGE

```
Total Features in Next.js: 18
Implemented in React Native: 12
Missing in React Native: 6
Partial in React Native: 1

Completion Rate: 67% (12/18 complete/partial)
Completion Rate (strict): 61% (11/18 complete)
```

---

## 🎯 WHAT NEEDS TO BE ADDED TO RN FOR PARITY WITH NEXT.JS

### 🔴 CRITICAL (Blocks core user flows)
1. **Onboarding Screen** - 15-step onboarding after signup
2. **Report Screen** - Feedback cards after sessions (fluency, grammar, vocab, discourse)
3. **Payment/Checkout Flow** - Complete payment processing

### 🟡 HIGH PRIORITY (Important flows)
4. **Quiz/Assessment** - Quiz and listening quiz screens
5. **Free Trial** - Free trial activation flow
6. **Timeline View** - Past lessons/activity on home

### 🟢 MEDIUM PRIORITY (Nice to have)
7. **Legal Pages** - Terms, Privacy, About
8. **Payment Status Screens** - Success/Cancel/Failed flows
9. **Today's Report** - Daily summary screen

---

## Next Steps

**To add missing features to React Native:**

1. **Create OnboardingScreen** → Use Redux onboardingSlice + step navigation
2. **Create ReportScreen** → Display feedback with charts, similar to learned/grammar/vocab cards
3. **Implement Payment Flow** → Connect SubscriptionScreen to actual payment processor
4. **Add QuizScreen** → Assessment after topics/practice
5. **Add FreeTrialScreen** → Activation flow for free trial
6. **Add TimelineView** to HomeScreen → Show recent activities

---

**Analysis Date:** February 7, 2026  
**Status:** COMPLETE - React Native is ~67% complete vs Next.js  
**Recommendation:** Add missing critical flows before production release
