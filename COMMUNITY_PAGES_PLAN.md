# Community Pages Implementation Plan - React Native

## 📋 ANALYSIS: Next.js Community Pages Structure

### Next.js Community Routes:

1. **`/community`** - Main Community Hub
   - **File**: `app/community/page.tsx`
   - **Features**:
     - Two tabs: "Inbox" and "Groups"
     - Inbox tab: Shows DMs and joined groups
     - Groups tab: Shows all discoverable groups with filters
     - Header with back button and title
     - Unread message count badges
     - Join/Leave group functionality
     - Search and filter groups

2. **`/community/inbox/[id]`** - DM Chat Page
   - **File**: `app/community/inbox/[id]/page.tsx`
   - **Component**: `DMChatContainer` → `DMChat`
   - **Features**:
     - Full-screen DM conversation
     - Real-time messaging
     - Typing indicators
     - Online/offline status
     - Message composer with emoji picker
     - Auto-scroll to bottom
     - Mark messages as read
     - Message enrichment (profiles, timestamps)

3. **`/community/groups/[id]`** - Group Chat Page
   - **File**: `app/community/groups/[id]/page.tsx`
   - **Component**: `GroupChatContainer` → `GroupChat`
   - **Features**:
     - Full-screen group conversation
     - Group member list (sidebar/drawer)
     - Real-time messaging
     - Typing indicators (multiple users)
     - Message composer with emoji picker
     - Pinned messages banner
     - Group settings (mute notifications)
     - User profile popup
     - Mark messages as read
     - Message enrichment (profiles, timestamps)

4. **`/chat`** - Legacy Chat Page (Sidebar + Chat View)
   - **File**: `app/chat/page.tsx`
   - **Features**:
     - Sidebar with DM list
     - Main chat area
     - Simpler interface for DMs only
     - Used as alternative DM interface

---

## 📱 React Native Current State

### Existing Screens:
1. ✅ **CommunityScreen** (`screens/social/CommunityScreen.tsx`)
   - Basic structure exists
   - Has tabs (Inbox/Groups)
   - Has components (InboxView, GroupsView)
   - ⚠️ Navigation to chat screens needs fixing

2. ⚠️ **ChatScreen** (`screens/social/ChatScreen.tsx`)
   - Only handles DMs
   - Has contact list view
   - Has chat view
   - ❌ Missing: Group chat support
   - ❌ Missing: Separate screens for DM and Group

### Missing Screens:
1. ❌ **DMChatScreen** - Dedicated DM chat screen
2. ❌ **GroupChatScreen** - Dedicated group chat screen

### Navigation Structure:
```
Current:
SocialStack
  ├── CommunityScreen
  ├── ChatScreen (DM only)
  └── LeaderboardScreen

Target:
SocialStack
  ├── CommunityScreen
  ├── DMChatScreen (NEW)
  ├── GroupChatScreen (NEW)
  └── LeaderboardScreen
```

---

## 🎯 IMPLEMENTATION PLAN

### PHASE 1: Navigation Setup

#### 1.1 Update Navigation Types
**File**: `navigation/types.ts`

**Changes**:
```typescript
// Social Stack
export type SocialStackParamList = {
  CommunityScreen: undefined;
  DMChatScreen: { dmId: number };  // NEW
  GroupChatScreen: { groupId: number };  // NEW
  LeaderboardScreen: undefined;
  ChatScreen?: { contactId?: string };  // Keep for backward compatibility or remove
};
```

#### 1.2 Update SocialNavigator
**File**: `navigation/SocialNavigator.tsx`

**Changes**:
- Add `DMChatScreen` route
- Add `GroupChatScreen` route
- Keep or remove `ChatScreen` (decide based on usage)

---

### PHASE 2: Create DMChatScreen

#### 2.1 Create Screen File
**File**: `screens/social/DMChatScreen.tsx`

**Features to Implement**:
- ✅ Get `dmId` from route params
- ✅ Load DM info from Redux
- ✅ Load messages from Redux
- ✅ Real-time message updates
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Message composer with emoji picker
- ✅ Auto-scroll to bottom
- ✅ Mark messages as read
- ✅ Header with back button, user name, online status
- ✅ Loading states
- ✅ Error states

**Components to Use**:
- `MessageComposer` (needs to be created)
- `MessageBubble` (needs to be created)
- `MessageTimestamp` (needs to be created)
- `ChatLoading` (needs to be created)

**Hooks to Use**:
- `useDMSocket` (from Next.js pattern)
- `useDMComposer` (from Next.js pattern)
- `useChatIdentity` (from Next.js pattern)

---

### PHASE 3: Create GroupChatScreen

#### 3.1 Create Screen File
**File**: `screens/social/GroupChatScreen.tsx`

**Features to Implement**:
- ✅ Get `groupId` from route params
- ✅ Load group info from Redux
- ✅ Load messages from Redux
- ✅ Load group members from Redux
- ✅ Real-time message updates
- ✅ Typing indicators (multiple users)
- ✅ Message composer with emoji picker
- ✅ Pinned messages banner
- ✅ Group settings (mute notifications)
- ✅ User profile popup (optional)
- ✅ Mark messages as read
- ✅ Header with back button, group name, member count
- ✅ Loading states
- ✅ Error states

**Components to Use**:
- `MessageComposer` (shared with DM)
- `MessageBubble` (shared with DM)
- `MessageTimestamp` (shared with DM)
- `PinnedMessageBanner` (needs to be created)
- `ChatLoading` (shared with DM)
- `UserProfilePopup` (optional, needs to be created)

**Hooks to Use**:
- `useGroupSocket` (from Next.js pattern)
- `useGroupComposer` (from Next.js pattern)
- `useChatIdentity` (from Next.js pattern)

---

### PHASE 4: Create Chat Components

#### 4.1 MessageComposer Component
**File**: `components/chat/MessageComposer.tsx`

**Props**:
```typescript
interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  showEmoji: boolean;
  onToggleEmoji: () => void;
  onEmojiSelect: (emoji: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}
```

**Features**:
- Text input with placeholder
- Emoji picker button
- Send button
- Keyboard handling
- Auto-focus management
- Styling matches Next.js (gradient background)

#### 4.2 MessageBubble Component
**File**: `components/chat/MessageBubble.tsx`

**Props**:
```typescript
interface MessageBubbleProps {
  message: DMMessage | GroupMessage;
  isOwn: boolean;
  senderName?: string;  // For group messages
  senderAvatar?: string;  // For group messages
  timestamp: string;
  onLongPress?: (message: any) => void;  // For message actions
}
```

**Features**:
- Own message vs received message styling
- Sender name display (for groups)
- Avatar display (for groups)
- Timestamp display
- Message content rendering
- Different background colors for own/others
- Long press for message actions (optional)

#### 4.3 MessageTimestamp Component
**File**: `components/chat/MessageTimestamp.tsx`

**Features**:
- Format timestamp (relative or absolute)
- Show date separators between messages
- Time formatting (12/24 hour)

#### 4.4 PinnedMessageBanner Component
**File**: `components/chat/PinnedMessageBanner.tsx`

**Props**:
```typescript
interface PinnedMessageBannerProps {
  message: GroupMessage;
  onDismiss?: () => void;
  onScrollToMessage?: () => void;
}
```

**Features**:
- Display pinned message at top of chat
- Click to scroll to pinned message
- Dismiss button

#### 4.5 ChatLoading Component
**File**: `components/chat/ChatLoading.tsx`

**Features**:
- Loading spinner
- Loading message text
- Centered layout

#### 4.6 Create Index File
**File**: `components/chat/index.ts`

**Exports**:
```typescript
export { MessageComposer } from './MessageComposer';
export { MessageBubble } from './MessageBubble';
export { MessageTimestamp } from './MessageTimestamp';
export { PinnedMessageBanner } from './PinnedMessageBanner';
export { ChatLoading } from './ChatLoading';
```

---

### PHASE 5: Create Chat Hooks

#### 5.1 useDMSocket Hook
**File**: `hooks/chat/useDMSocket.ts`

**Features**:
- Connect to socket for DM
- Subscribe to DM message events
- Subscribe to typing events
- Subscribe to presence events
- Handle real-time message updates
- Handle typing indicators
- Handle online/offline status

#### 5.2 useGroupSocket Hook
**File**: `hooks/chat/useGroupSocket.ts`

**Features**:
- Connect to socket for group
- Subscribe to group message events
- Subscribe to typing events (multiple users)
- Subscribe to presence events
- Handle real-time message updates
- Handle typing indicators (multiple users)
- Handle online/offline status

#### 5.3 useDMComposer Hook
**File**: `hooks/chat/useDMComposer.ts`

**Features**:
- Message input state
- Emoji picker state
- Send message handler
- Optimistic message updates
- Input validation
- Keyboard handling

#### 5.4 useGroupComposer Hook
**File**: `hooks/chat/useGroupComposer.ts`

**Features**:
- Message input state
- Emoji picker state
- Send message handler
- Optimistic message updates
- Input validation
- Keyboard handling

#### 5.5 useChatIdentity Hook
**File**: `hooks/chat/useChatIdentity.ts`

**Features**:
- Get current user ID
- Get current user name
- Get current user avatar
- Get current user profile picture

#### 5.6 Create Index File
**File**: `hooks/chat/index.ts`

**Exports**:
```typescript
export { useDMSocket } from './useDMSocket';
export { useGroupSocket } from './useGroupSocket';
export { useDMComposer } from './useDMComposer';
export { useGroupComposer } from './useGroupComposer';
export { useChatIdentity } from './useChatIdentity';
```

---

### PHASE 6: Update CommunityScreen

#### 6.1 Update Navigation Handlers
**File**: `screens/social/CommunityScreen.tsx`

**Changes**:
```typescript
// DM click handler
const handleDMClick = (dmId: number) => {
  navigation.navigate('SocialStack', {
    screen: 'DMChatScreen',
    params: { dmId },
  });
};

// Group click handler
const handleGroupClick = (groupId: number) => {
  navigation.navigate('SocialStack', {
    screen: 'GroupChatScreen',
    params: { groupId },
  });
};
```

**Update InboxView props**:
- Add `onDMClick` handler
- Pass to `DMConversationCard`

**Update GroupsView props**:
- Ensure `onGroupClick` navigates correctly

---

### PHASE 7: Update Existing Components

#### 7.1 Update DMConversationCard
**File**: `components/community/DMConversationCard.tsx`

**Check**:
- ✅ Has `onPress` handler
- ✅ Passes `dmId` correctly
- ✅ Unread indicator works
- ✅ Online status works
- ✅ Last message preview works
- ✅ Timestamp works

#### 7.2 Update GroupCard
**File**: `components/community/GroupCard.tsx`

**Check**:
- ✅ Has `onPress` handler for joined groups
- ✅ Has `onJoin` handler for unjoined groups
- ✅ Passes `groupId` correctly
- ✅ Unread indicator works
- ✅ Last message preview works

#### 7.3 Review All Community Components
**Files**: `components/community/*`

**Check**:
- ✅ All components match Next.js styling
- ✅ All handlers are properly connected
- ✅ Navigation is working correctly

---

### PHASE 8: Real-Time Functionality

#### 8.1 Socket Service Verification
**File**: `service/SocketService.ts` (if exists)

**Check**:
- ✅ Socket connection is established
- ✅ DM message events are subscribed
- ✅ Group message events are subscribed
- ✅ Typing events are subscribed
- ✅ Presence events are subscribed
- ✅ Events are dispatched to Redux correctly

#### 8.2 Redux Integration
**Files**: 
- `store/slices/communitySlice.ts`
- `store/slices/chatSlice.ts`

**Check**:
- ✅ Real-time messages are stored correctly
- ✅ Typing indicators are stored correctly
- ✅ Online status is stored correctly
- ✅ Selectors work correctly

---

### PHASE 9: UI/UX Matching

#### 9.1 Colors
- Background: `#050110` (dark)
- Message bubbles: Own (blue gradient), Others (gray)
- Input area: Gradient background
- Text: White primary, Gray secondary

#### 9.2 Spacing
- Use `spacing` constants consistently
- Match padding/margins from Next.js

#### 9.3 Typography
- Match font sizes
- Match font weights
- Match line heights

#### 9.4 Layout
- Header at top (with back button)
- Messages area (scrollable, use FlatList)
- Input area at bottom (sticky)
- Keyboard avoiding view

#### 9.5 Animations
- Smooth scrolling
- Typing indicator animation
- Loading spinner

---

### PHASE 10: Testing Checklist

#### 10.1 CommunityScreen Tests
- [ ] Tabs switch correctly (Inbox/Groups)
- [ ] DM list loads and displays
- [ ] Group list loads and displays
- [ ] Filters work (category, search)
- [ ] Join/Leave group works
- [ ] Unread counts display correctly
- [ ] Online status displays correctly
- [ ] Navigation to DMChatScreen works
- [ ] Navigation to GroupChatScreen works

#### 10.2 DMChatScreen Tests
- [ ] Screen loads with correct dmId
- [ ] DM info loads correctly
- [ ] Messages load correctly
- [ ] Can send messages
- [ ] Real-time updates work
- [ ] Typing indicators work
- [ ] Online status updates
- [ ] Auto-scroll works
- [ ] Mark as read works
- [ ] Back button works
- [ ] Keyboard handling works
- [ ] Emoji picker works
- [ ] Loading states display
- [ ] Error states display

#### 10.3 GroupChatScreen Tests
- [ ] Screen loads with correct groupId
- [ ] Group info loads correctly
- [ ] Messages load correctly
- [ ] Group members load correctly
- [ ] Can send messages
- [ ] Real-time updates work
- [ ] Typing indicators work (multiple users)
- [ ] Pinned messages display
- [ ] Auto-scroll works
- [ ] Mark as read works
- [ ] Back button works
- [ ] Keyboard handling works
- [ ] Emoji picker works
- [ ] Loading states display
- [ ] Error states display

#### 10.4 Integration Tests
- [ ] Navigation flow works end-to-end
- [ ] Real-time updates work across screens
- [ ] Unread counts update correctly
- [ ] Online status updates correctly
- [ ] Error states display correctly
- [ ] Loading states display correctly

---

## 📁 FILES TO CREATE

### Screens:
1. `screens/social/DMChatScreen.tsx`
2. `screens/social/GroupChatScreen.tsx`

### Components:
3. `components/chat/MessageComposer.tsx`
4. `components/chat/MessageBubble.tsx`
5. `components/chat/MessageTimestamp.tsx`
6. `components/chat/PinnedMessageBanner.tsx`
7. `components/chat/ChatLoading.tsx`
8. `components/chat/index.ts`

### Hooks:
9. `hooks/chat/useDMSocket.ts`
10. `hooks/chat/useGroupSocket.ts`
11. `hooks/chat/useDMComposer.ts`
12. `hooks/chat/useGroupComposer.ts`
13. `hooks/chat/useChatIdentity.ts`
14. `hooks/chat/index.ts`

---

## 📝 FILES TO MODIFY

### Navigation:
1. `navigation/types.ts` - Add new screen types
2. `navigation/SocialNavigator.tsx` - Add new screens

### Screens:
3. `screens/social/CommunityScreen.tsx` - Update navigation handlers

### Components (Review/Update):
4. `components/community/DMConversationCard.tsx` - Add onPress handler
5. `components/community/GroupCard.tsx` - Verify onPress handler
6. `components/community/InboxView.tsx` - Add onDMClick prop
7. `components/community/GroupsView.tsx` - Verify onGroupClick prop

---

## 🔧 DEPENDENCIES

### New Dependencies Needed:
- `react-native-emoji-picker` or similar for emoji picker
- OR use a simpler emoji library like `emoji-mart-native`

### Existing Dependencies (Verify):
- `@react-navigation/native` - ✅
- `@react-navigation/native-stack` - ✅
- `@react-navigation/bottom-tabs` - ✅
- `react-native-safe-area-context` - ✅
- `@reduxjs/toolkit` - ✅
- Socket client (verify implementation)

---

## 📋 IMPLEMENTATION ORDER

### Step 1: Navigation Setup (30 min)
1. Update `navigation/types.ts`
2. Update `SocialNavigator.tsx`
3. Test navigation structure

### Step 2: Create Chat Components (2-3 hours)
1. Create `MessageComposer`
2. Create `MessageBubble`
3. Create `MessageTimestamp`
4. Create `PinnedMessageBanner`
5. Create `ChatLoading`
6. Create index file

### Step 3: Create Chat Hooks (2-3 hours)
1. Create `useChatIdentity`
2. Create `useDMSocket`
3. Create `useGroupSocket`
4. Create `useDMComposer`
5. Create `useGroupComposer`
6. Create index file

### Step 4: Create DMChatScreen (2-3 hours)
1. Create screen file
2. Integrate hooks
3. Integrate components
4. Add navigation
5. Test functionality

### Step 5: Create GroupChatScreen (2-3 hours)
1. Create screen file
2. Integrate hooks
3. Integrate components
4. Add navigation
5. Test functionality

### Step 6: Update CommunityScreen (1 hour)
1. Update navigation handlers
2. Update component props
3. Test navigation flow

### Step 7: Real-Time Integration (1-2 hours)
1. Verify socket connections
2. Test real-time updates
3. Test typing indicators
4. Test online status

### Step 8: UI/UX Polish (1-2 hours)
1. Match colors and spacing
2. Match typography
3. Add animations
4. Test on different screen sizes

### Step 9: Testing (2-3 hours)
1. Test all navigation flows
2. Test all features
3. Test error states
4. Test loading states
5. Test real-time functionality

---

## ✅ SUCCESS CRITERIA

- ✅ All 4 Next.js community pages are implemented
- ✅ Navigation matches Next.js flow exactly
- ✅ All features from Next.js are implemented
- ✅ Real-time messaging works
- ✅ Typing indicators work
- ✅ Online status updates work
- ✅ Unread counts are accurate
- ✅ UI matches Next.js exactly
- ✅ Error states are handled
- ✅ Loading states are handled
- ✅ Performance is acceptable

---

## 🎯 PRIORITY ORDER

1. **HIGH**: Navigation setup + DMChatScreen (core functionality)
2. **HIGH**: GroupChatScreen (core functionality)
3. **MEDIUM**: Chat components (MessageComposer, MessageBubble, etc.)
4. **MEDIUM**: Chat hooks (useDMSocket, useGroupSocket, etc.)
5. **LOW**: UI/UX polish and animations
6. **LOW**: Optional features (user profile popup, etc.)

---

## 📝 NOTES

1. **Emoji Picker**: For React Native, consider using `react-native-emoji-picker` or a simpler solution. The web version uses `emoji-mart` which may not have a direct RN equivalent.

2. **Real-Time**: Ensure socket connection is properly established and maintained across screen navigation.

3. **Performance**: Use `FlatList` for message lists instead of `ScrollView` for better performance with many messages.

4. **Keyboard**: Use `KeyboardAvoidingView` to handle keyboard properly on both iOS and Android.

5. **Auto-Scroll**: Implement smooth scrolling to bottom when new messages arrive or when opening chat.

6. **Message Enrichment**: The Next.js version enriches messages with profile data. Ensure this is handled in React Native as well.

---

## END OF PLAN
