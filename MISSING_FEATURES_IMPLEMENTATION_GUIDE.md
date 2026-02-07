# 🛠️ Missing Features Implementation Guide

**What's Needed to Reach 100% Parity with Next.js**

**Date:** February 7, 2026  
**Priority:** Critical (3) | High (3) | Medium (2)

---

## 🔴 CRITICAL - Must Have Before Production

### 1. SESSION REPORT SCREEN

**Why Critical:** Users need feedback on their session performance. Without this, they can't track improvement.

**Next.js Implementation:** `/report` page with 5-card carousel showing:
1. Overall English score (with radar chart)
2. Fluency analysis (WPM, speech rate, clarity)
3. Grammar breakdown (errors, correction...)
4. Vocabulary (words used, unique words, new words)
5. Discourse (coherence, organization, flow)

**React Native: To-Do**

**File to Create:** `screens/learning/ReportScreen.tsx`

**Structure:**
```tsx
export interface ReportMetrics {
  overallScore: number;
  fluency: { wpm: number; clarity: number; },
  grammar: { score: number; errors: string[] },
  vocabulary: { total: number; unique: number },
  discourse: { score: number; feedback: string }
}

interface ReportScreenProps {
  navigation: any;
  route: {
    params: {
      sessionId: string;
      reportData: ReportMetrics;
      sessionType: 'practice' | 'call' | 'roleplay';
    }
  }
}
```

**Components Needed:**
- `components/report/OverallScoreCard.tsx` - English score + radar
- `components/report/FluencyCard.tsx` - WPM, clarity, rate
- `components/report/GrammarCard.tsx` - Grammar analysis
- `components/report/VocabularyCard.tsx` - Word stats
- `components/report/DiscourseCard.tsx` - Flow, coherence

**Integration Points:**
1. After `endSession()` in PracticeScreen → navigate to ReportScreen
2. After `endCall()` in CallScreen → navigate to ReportScreen
3. Fetch report data from `/api/generate-report` endpoint
4. Show 5-card carousel with swipe navigation
5. "Finish" button returns to HomeScreen

**Effort Estimate:** 20-25 hours

**Start Here:**
```tsx
// In PracticeScreen.tsx - after endSession():
const handleEndSession = async () => {
  const result = await endSession(transcript);
  // Success → navigate to report
  navigation.navigate('Report', {
    sessionId: result.sessionId,
    reportData: result.report,
    sessionType: 'practice'
  });
}

// In LearningNavigator.tsx - add Stack screen:
<Stack.Screen 
  name="Report"
  component={ReportScreen}
  options={{ headerShown: false }}
/>
```

---

### 2. ONBOARDING SCREEN (Simplified)

**Why Critical:** Users need to set their learning level and goals. Current flow skips this.

**Next.js Implementation:** Full 15-step onboarding at `/onboarding`

**React Native: MVP Version (5 steps minimum)**

**File to Create:** `screens/auth/OnboardingScreen.tsx`

**5-Step Flow:**
1. Welcome screen
2. Level selection (Beginner/Intermediate/Advanced)
3. Goal selection (Fluency/Grammar/Vocabulary/Conversation/Mixed)
4. Practice preference (Daily time: 5/10/15 min)
5. Complete - Go to home

**Integration:**
1. After signup successful → show OnboardingScreen
2. Save selections to Redux `onboardingSlice`
3. Persist to backend via `POST /api/user/preferences`
4. Show HomeScreen after completion

**Effort Estimate:** 15-18 hours

**File Structure:**
```tsx
// Add to AuthNavigator.tsx:
<Stack.Screen 
  name="Onboarding"
  component={OnboardingScreen}
  options={{ headerShown: false }}
/>

// In SignupScreen.tsx - after successful signup:
dispatch(setIsAuthenticated(true));
navigation.reset({
  index: 0,
  routes: [{ name: 'Onboarding' }]
});
```

---

### 3. PAYMENT & CHECKOUT FLOW

**Why Critical:** Can't monetize without payment processing.

**Next.js Implementation:** 
- `/checkout` page with payment form
- `/payment-success` page
- `/payment-cancel` page  
- `/payment-failed` page

**React Native: To-Do**

**Files to Create:**
- `screens/payment/CheckoutScreen.tsx`
- `screens/payment/PaymentSuccessScreen.tsx`
- `screens/payment/PaymentFailureScreen.tsx`

**Flow:**
```
SubscriptionScreen (view plans)
  ↓
  User selects plan → CheckoutScreen
  ↓
  Enter card details (Stripe)
  ↓
  Payment processed
  ↓
  Success → PaymentSuccessScreen → Home
  OR
  Failure → PaymentFailureScreen → Try Again
```

**Integration with Stripe / Payment Processor:**

```tsx
// CheckoutScreen.tsx structure:
import { CardField, useConfirmPayment } from '@stripe/react-native';

const CheckoutScreen = ({ route }) => {
  const { plan } = route.params;
  
  const handlePayment = async () => {
    // 1. Create payment intent on backend
    const { clientSecret } = await api.post('/api/payments/create-intent', {
      planId: plan.id,
      amount: plan.price
    });
    
    // 2. Confirm payment with Stripe
    const { paymentIntent } = await confirmPayment(clientSecret);
    
    // 3. On success, navigate to success screen
    if (paymentIntent?.status === 'Succeeded') {
      navigation.replace('PaymentSuccess');
    }
  };
  
  return (
    <View>
      <CardField onCardChange={setCardDetails} />
      <Button onPress={handlePayment} title="Pay" />
    </View>
  );
}
```

**Effort Estimate:** 15-20 hours

---

## 🟡 HIGH PRIORITY - Should Have Soon

### 4. QUIZ / ASSESSMENT

**Why High Priority:** Users need to assess their knowledge and get graded.

**Next.js Implementation:**
- `/quiz` page (interactive questions)
- `/listening-quiz` page (listening comprehension)
- Results page with scoring

**React Native: To-Do**

**File to Create:** `screens/learning/QuizScreen.tsx`

**Features:**
- Multiple choice questions
- Listening comprehension tests
- Score calculation
- Results display
- Feedback on incorrect answers

**Integration:**
```tsx
// In TopicsScreen or LearningScreen:
// Add "Take Quiz" button → QuizScreen
navigation.navigate('Quiz', { topicId: topic.id });

// In LearningNavigator.tsx:
<Stack.Screen name="Quiz" component={QuizScreen} />
```

**Effort Estimate:** 15-18 hours

---

### 5. FREE TRIAL ACTIVATION

**Why High Priority:** Needed for user acquisition (let users try free).

**Next.js Implementation:**
- `/free-trial` page (select and activate)
- `/free-trial-success` page (confirmation)

**React Native: To-Do**

**File to Create:**
- `screens/subscription/FreeTrialScreen.tsx`
- `screens/subscription/FreeTrialSuccessScreen.tsx`

**Flow:**
```
User sees "Start Free Trial" button
  ↓
  Tap → FreeTrialScreen
  ↓
  Confirm terms (7 days free)
  ↓
  Backend activates trial
  ↓
  FreeTrialSuccessScreen
  ↓
  Go to home with trial active
```

**Integration:**

```tsx
// In SubscriptionScreen.tsx - add button:
<Button 
  title="Start Free Trial"
  onPress={() => navigation.navigate('FreeTrial')}
/>

// FreeTrialScreen.tsx activation:
const handleStartTrial = async () => {
  const result = await api.post('/api/subscription/start-free-trial');
  if (result.success) {
    dispatch(setSubscription({
      planType: 'Basic',
      isTrial: true,
      trialEndsAt: result.expiresAt
    }));
    navigation.replace('FreeTrialSuccess');
  }
}
```

**Effort Estimate:** 8-10 hours

---

### 6. TIMELINE IN HOME SCREEN

**Why High Priority:** Users need to see their learning history.

**Current State:** HomeScreen has "Recent Activity" section showing "No activity yet"

**To-Do:**
1. Fetch user's past sessions from `/api/sessions`
2. Display in timeline format
3. Show session type, duration, score

**Integration:**

```tsx
// In HomeScreen.tsx - replace empty state:
const loadRecentActivity = async () => {
  const sessions = await api.get('/api/user/sessions?limit=5');
  setRecentSessions(sessions.data);
}

useEffect(() => {
  loadRecentActivity();
}, []);

// Display as timeline:
<View style={styles.timeline}>
  {recentSessions.map(session => (
    <TimelineItem
      date={session.date}
      type={session.type}
      duration={session.duration}
      score={session.score}
    />
  ))}
</View>
```

**Effort Estimate:** 5-8 hours

---

## 🟢 MEDIUM PRIORITY - Nice to Have

### 7. LEGAL PAGES

**Why Medium:** Compliance requirement (Terms, Privacy).

**Next.js Implementation:** Multiple pages at `/terms`, `/privacy`, `/about`

**React Native:** Simple text screens

**Files to Create:**
- `screens/legal/TermsScreen.tsx`
- `screens/legal/PrivacyScreen.tsx`
- `screens/legal/AboutScreen.tsx`

**Integration:** Add to ProfileNavigator or separate menu

**Effort Estimate:** 3-5 hours

---

### 8. DAILY REPORT

**Why Medium:** Users like daily summaries.

**Next.js Implementation:** `/todays-report` page

**React Native: To-Do**

**File to Create:** `screens/learning/DailyReportScreen.tsx`

**Shows:**
- Sessions today
- Total time
- Topics covered
- Achievements unlocked
- Daily goal progress

**Integration:** Add link from HomeScreen

**Effort Estimate:** 5-8 hours

---

## 📋 IMPLEMENTATION ROADMAP

### Phase 1: Critical (Weeks 1-2) - 50-65 hours
1. **Report Screen** (20-25 hrs) → Users see feedback
2. **Onboarding** (15-18 hrs) → Users set up profile
3. **Payment Flow** (15-20 hrs) → Company gets revenue

**Result:** App goes from 61% → 90% feature complete

### Phase 2: High Priority (Week 3) - 28-36 hours
4. **Quiz/Assessment** (15-18 hrs)
5. **Free Trial** (8-10 hrs)
6. **Timeline** (5-8 hrs)

**Result:** App goes from 90% → 96% feature complete

### Phase 3: Medium Priority (Week 4) - 8-13 hours
7. **Legal Pages** (3-5 hrs)
8. **Daily Report** (5-8 hrs)

**Result:** App reaches 100% parity with Next.js

---

## 🎯 MVP LAUNCH READINESS

### Minimum (Must Have) for Launch
- ✅ Authentication (already done)
- ✅ Learning flows (already done)
- ✅ Profile/Settings (already done)
- ✅ Social (already done)
- 🔴 **ADD:** Report Screen (for feedback)
- 🔴 **ADD:** Simple Onboarding (5 steps)
- 🔴 **ADD:** Checkout Screen (for payments)

**Total Effort:** ~50 hours
**Timeline:** 1-2 weeks
**Result:** 85% complete, launchable product

### Full Feature (Nice to Have)
- All MVP items
- Quiz/Assessment
- Free Trial
- Timeline
- Legal Pages
- Daily Report

**Total Effort:** ~125 hours
**Timeline:** 3-4 weeks
**Result:** 100% parity with Next.js

---

## 🚀 RECOMMENDATION

**For Launch (in 2 weeks):**
1. Build Report Screen
2. Build Checkout Flow  
3. Build 5-Step Onboarding
4. Test integrated flows

This makes the app **85% complete and production-ready**.

**For v1.1 (next sprint):**
- Add Quiz
- Improve timeline
- Free trial

**For v1.2+:**
- Legal pages
- Daily report
- Admin features

---

**Total Work to 100%:** ~125 hours (~4 weeks at 40 hrs/week)
**Critical Gap:** Account feedback, payments, and onboarding
**Recommendation:** Do the 3 critical items first (50 hours = 1.5 weeks)

