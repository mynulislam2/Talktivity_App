# ✅ Quick Start Checklist for Missing Features

**Your Action Plan to Reach 100%**

---

## PHASE 1 (CRITICAL) - Do This First

### ✓ Task 1: Create ReportScreen
**File:** `screens/learning/ReportScreen.tsx`  
**Status:** Not started  
**Effort:** 20-25 hours

**Checklist:**
- [ ] Create new file `screens/learning/ReportScreen.tsx`
- [ ] Create `components/report/OverallScoreCard.tsx`
- [ ] Create `components/report/FluencyCard.tsx`
- [ ] Create `components/report/GrammarCard.tsx`
- [ ] Create `components/report/VocabularyCard.tsx`
- [ ] Create `components/report/DiscourseCard.tsx`
- [ ] Add to LearningNavigator as Stack screen
- [ ] Update PracticeScreen.tsx: navigate to Report on endSession
- [ ] Update CallScreen.tsx: navigate to Report on endCall
- [ ] Test navigation flow practice → report → home

**Reference Code:**
```tsx
// In LearningNavigator.tsx (around line ~30):
<Stack.Screen
  name="Report"
  component={ReportScreen}
  options={{
    headerShown: false,
    animationEnabled: true,
  }}
/>

// In PracticeScreen.tsx (in handleEndSession):
const handleEndSession = async () => {
  try {
    const result = await endPracticeSession();
    // Navigate to report with data
    navigation.navigate('Report', {
      sessionId: result.sessionId,
      sessionType: 'practice',
      reportData: result.reportMetrics,
    });
  } catch (error) {
    console.error(error);
  }
};
```

---

### ✓ Task 2: Create Simple Onboarding (5 Steps)
**File:** `screens/auth/OnboardingScreen.tsx`  
**Status:** Not started  
**Effort:** 15-18 hours

**Checklist:**
- [ ] Create `screens/auth/OnboardingScreen.tsx`
- [ ] Create Step 1: Welcome (next button)
- [ ] Create Step 2: Level Selection (Beginner/Intermediate/Advanced)
- [ ] Create Step 3: Goal Selection (Fluency/Grammar/Vocabulary/Mixed)
- [ ] Create Step 4: Daily Time Preference (5/10/15 min)
- [ ] Create Step 5: Confirmation ("You're all set!")
- [ ] Add to AuthNavigator as Stack screen
- [ ] Update SignupScreen: navigate to Onboarding after successful signup
- [ ] Save selections to Redux `onboardingSlice`
- [ ] Test full flow: Signup → Onboarding → Home

**Reference Code:**
```tsx
// In AuthNavigator.tsx (add new screen):
<Stack.Screen
  name="Onboarding"
  component={OnboardingScreen}
  options={{
    headerShown: false,
    animationEnabled: true,
  }}
/>

// In SignupScreen.tsx (after successful signup):
const handleSignupSuccess = async (response) => {
  // Save token
  await AsyncStorage.setItem('authToken', response.token);
  
  // Update Redux
  dispatch(setIsAuthenticated(true));
  dispatch(setUser(response.user));
  
  // Navigate to onboarding
  navigation.reset({
    index: 0,
    routes: [{ name: 'Onboarding' }],
  });
};
```

---

### ✓ Task 3: Add Payment/Checkout Flow
**Files:** `screens/payment/CheckoutScreen.tsx` + success/failure screens  
**Status:** Not started  
**Effort:** 15-20 hours

**Checklist:**
- [ ] Install Stripe React Native: `npm install @stripe/react-native`
- [ ] Create `screens/payment/CheckoutScreen.tsx`
- [ ] Create `screens/payment/PaymentSuccessScreen.tsx`
- [ ] Create `screens/payment/PaymentFailureScreen.tsx`
- [ ] Add payment processing (Stripe/PayPal)
- [ ] Add card input field (CardField from Stripe)
- [ ] Add to SubscriptionNavigator as Stack screens
- [ ] Update SubscriptionScreen: navigate to Checkout when user selects plan
- [ ] Handle payment intent creation on backend
- [ ] Test payment flow: Subscribe → Checkout → Success/Failure

**Reference Code:**
```tsx
// In SubscriptionNavigator.tsx:
<Stack.Screen
  name="Checkout"
  component={CheckoutScreen}
  options={{
    title: 'Complete Payment',
    headerShown: true,
  }}
/>
<Stack.Screen
  name="PaymentSuccess"
  component={PaymentSuccessScreen}
  options={{
    headerShown: false,
    animationEnabled: true,
  }}
/>
<Stack.Screen
  name="PaymentFailure"
  component={PaymentFailureScreen}
  options={{
    headerShown: true,
    title: 'Payment Failed',
  }}
/>

// In SubscriptionScreen.tsx (on plan selection):
const handleSelectPlan = (plan) => {
  navigation.navigate('Checkout', {
    planId: plan.id,
    planName: plan.name,
    amount: plan.price,
  });
};
```

---

## PHASE 2 (HIGH PRIORITY) - Do This In Week 3

### ✓ Task 4: Add Quiz Functionality
**File:** `screens/learning/QuizScreen.tsx`  
**Status:** Not started  
**Effort:** 15-18 hours

**File Structure:**
```tsx
// screens/learning/QuizScreen.tsx
// screens/learning/components/QuestionCard.tsx
// screens/learning/components/QuizResults.tsx
```

**Reference Code:**
```tsx
// In LearningNavigator.tsx:
<Stack.Screen
  name="Quiz"
  component={QuizScreen}
  options={{
    title: 'Quiz',
    headerShown: true,
  }}
/>

// In TopicsScreen (add button):
const handleStartQuiz = (topic) => {
  navigation.navigate('Quiz', {
    topicId: topic.id,
    topicName: topic.name,
  });
};
```

---

### ✓ Task 5: Add Free Trial
**Files:** `screens/subscription/FreeTrialScreen.tsx` + success screen  
**Status:** Not started  
**Effort:** 8-10 hours

**Checklist:**
- [ ] Create `screens/subscription/FreeTrialScreen.tsx`
- [ ] Create `screens/subscription/FreeTrialSuccessScreen.tsx`
- [ ] Add to SubscriptionNavigator as Stack screens
- [ ] Update SubscriptionScreen: add "Start Free Trial" button
- [ ] Call backend endpoint: `POST /api/subscription/start-free-trial`
- [ ] Update Redux subscription state on success
- [ ] Test: Free Trial → Success screen → Home with trial active

**Reference Code:**
```tsx
// In SubscriptionScreen.tsx:
<Button
  title="Start Free Trial"
  onPress={() => navigation.navigate('FreeTrial')}
/>

// In FreeTrialScreen.tsx:
const handleActivateTrial = async () => {
  try {
    setLoading(true);
    const response = await api.post('/api/subscription/start-free-trial');
    
    if (response.success) {
      dispatch(startFreeTrial({
        trialEndsAt: response.expiresAt,
        planType: 'Basic',
      }));
      navigation.replace('FreeTrialSuccess');
    }
  } catch (error) {
    showError('Failed to start trial');
  } finally {
    setLoading(false);
  }
};
```

---

### ✓ Task 6: Populate Home Timeline
**File:** `screens/home/HomeScreen.tsx` (edit existing)  
**Status:** Partially done (has placeholder)  
**Effort:** 5-8 hours

**Checklist:**
- [ ] Update HomeScreen.tsx
- [ ] Create timelineItem component if needed
- [ ] Fetch recent sessions: `GET /api/user/sessions?limit=10`
- [ ] Display in timeline format (date, type, duration, score)
- [ ] Add loading state
- [ ] Test: See recent activity populate after sessions

**Reference Code:**
```tsx
// In HomeScreen.tsx:
const [recentSessions, setRecentSessions] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadRecentSessions();
}, []);

const loadRecentSessions = async () => {
  try {
    setLoading(true);
    const response = await api.get('/api/user/sessions?limit=10');
    setRecentSessions(response.data);
  } catch (error) {
    console.error('Failed to load sessions:', error);
  } finally {
    setLoading(false);
  }
};

// In render (replace "No activity yet"):
{recentSessions.length > 0 ? (
  <View style={styles.timeline}>
    {recentSessions.map(session => (
      <TimelineItem
        key={session.id}
        date={formatDate(session.createdAt)}
        type={session.sessionType}
        duration={session.duration}
        score={session.score}
      />
    ))}
  </View>
) : (
  <Text style={styles.emptyText}>No activity yet. Start a session!</Text>
)}
```

---

## PHASE 3 (NICE TO HAVE) - Do This Later

### ✓ Task 7: Legal Pages
**Files:** `screens/legal/TermsScreen.tsx`, `PrivacyScreen.tsx`, `AboutScreen.tsx`  
**Status:** Not started  
**Effort:** 3-5 hours

**Quick Setup:**
```tsx
// In ProfileNavigator.tsx:
<Stack.Screen name="Terms" component={TermsScreen} />
<Stack.Screen name="Privacy" component={PrivacyScreen} />
<Stack.Screen name="About" component={AboutScreen} />

// In SettingsScreen.tsx (add buttons):
<TouchableOpacity onPress={() => navigation.navigate('Terms')}>
  <Text>Terms of Service</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
  <Text>Privacy Policy</Text>
</TouchableOpacity>
```

---

### ✓ Task 8: Daily Report
**File:** `screens/learning/DailyReportScreen.tsx`  
**Status:** Not started  
**Effort:** 5-8 hours

**Quick Setup:**
```tsx
// Fetch daily data:
const response = await api.get('/api/user/reports/daily');
// Show: sessions count, total time, topics, achievements
```

---

## 🎯 PROGRESS TRACKING

### Phase 1 Progress
- [ ] Report Screen (25h)
- [ ] Onboarding Screen (18h)
- [ ] Payment Flow (20h)
- **Subtotal: 63 hours → Reaches 85% complete**

### Phase 2 Progress  
- [ ] Quiz Screen (18h)
- [ ] Free Trial (10h)
- [ ] Timeline Population (8h)
- **Subtotal: 36 hours → Reaches 96% complete**

### Phase 3 Progress
- [ ] Legal Pages (5h)
- [ ] Daily Report (8h)
- **Subtotal: 13 hours → Reaches 100% complete**

---

## 📊 COMPLETION METRICS

| Item | Status | Effort | Priority |
|------|--------|--------|----------|
| Report Screen | ❌ Not Started | 25h | 🔴 Critical |
| Onboarding | ❌ Not Started | 18h | 🔴 Critical |
| Payment/Checkout | ❌ Not Started | 20h | 🔴 Critical |
| Quiz Assessment | ❌ Not Started | 18h | 🟡 High |
| Free Trial | ❌ Not Started | 10h | 🟡 High |
| Timeline | 🟡 Partial | 8h | 🟡 High |
| Legal Pages | ❌ Not Started | 5h | 🟢 Medium |
| Daily Report | ❌ Not Started | 8h | 🟢 Medium |
| **TOTAL** | **3 Complete + 1 Partial** | **112h** | **8 Features** |

---

## 🚀 LAUNCH GATES

### Gate 1: MVP (Minimum Viable Product)
**Required Features:**
- ✅ Auth (done)
- ✅ Learning (done)
- ✅ Profile (done)
- ✅ Social (done)
- 🔴 **Report Screen (do this)**
- 🔴 **Simple Onboarding (do this)**
- 🔴 **Payment Flow (do this)**

**Readiness:** Once Phase 1 complete (63h) → **Ready to Launch**

### Gate 2: Feature Complete
**All Above + :**
- 🟡 Quiz
- 🟡 Free Trial
- 🟡 Timeline
- 🟢 Legal Pages
- 🟢 Daily Report

**Readiness:** Once all phases complete (125h) → **100% Parity with Next.js**

---

## 💡 QUICK NAVIGATION

**Where to add each screen?**

```
RootNavigator
  ├── AuthNavigator (login, signup, password-reset)
  │   └── 🆕 OnboardingScreen ← Add here (after signup success)
  │
  ├── MainNavigator (logged-in users)
  │   ├── HomeTab
  │   │   └── HomeNavigator
  │   │       └── HomeScreen
  │   │
  │   ├── LearningTab
  │   │   └── LearningNavigator
  │   │       ├── TopicsScreen
  │   │       ├── PracticeScreen
  │   │       ├── CallScreen
  │   │       ├── RoleplayScreen
  │   │       ├── ProgressScreen
  │   │       ├── 🆕 ReportScreen ← Add here (after practice/call)
  │   │       └── 🆕 QuizScreen ← Add here
  │   │
  │   ├── SocialTab
  │   │   └── SocialNavigator
  │   │
  │   └── ProfileTab
  │       └── ProfileNavigator
  │           ├── ProfileScreen
  │           ├── EditProfileScreen
  │           ├── SettingsScreen
  │           ├── SubscriptionScreen
  │           │   ├── 🆕 CheckoutScreen ← Add here
  │           │   ├── 🆕 PaymentSuccessScreen ← Add here
  │           │   ├── 🆕 PaymentFailureScreen ← Add here
  │           │   └── 🆕 FreeTrialScreen ← Add here
  │           │       └── 🆕 FreeTrialSuccessScreen ← Add here
  │           └── 🆕 LegalPages (Terms, Privacy, About) ← Add here
```

---

## ⏱️ TIMELINE ESTIMATE

**If working 40 hours/week:**

```
Week 1-2:  Phase 1 (Report + Onboarding + Payment) = 63h → 85% complete
Week 3:    Phase 2 (Quiz + Trial + Timeline) = 36h → 96% complete  
Week 4:    Phase 3 (Legal + Daily Report) = 13h → 100% complete

Total: 4 weeks for 100% parity
```

**To get to MVP (Ready to Launch):**
- Focus on Phase 1 only (63 hours)
- Timeline: 1-2 weeks
- Result: 85% complete, production-ready

---

## ✨ NEXT STEPS

1. **Right Now:**
   - Pick one task from Phase 1 (Report, Onboarding, or Payment)
   - Create the file(s)
   - Start implementing
   
2. **This Week:**
   - Complete 2+ Phase 1 items
   - Test navigation between screens
   
3. **Next Week:**
   - Complete remaining Phase 1 item
   - Ready for MVP launch

4. **After Launch:**
   - Phase 2 features (week 3)
   - Phase 3 features (week 4)

---

**Good Luck! 🎉**

Your app is 85% there. These 8 missing features are the difference between a demo and a product.

