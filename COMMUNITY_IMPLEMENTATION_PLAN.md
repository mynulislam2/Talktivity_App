# Community Tab Implementation Plan - React Native

## Overview
This plan outlines the steps to make the React Native Community tab and all its features match exactly with the Next.js implementation.

---

## PHASE 1: ANALYSIS - Current State vs Next.js

### Next.js Community Structure:
1. **Main Community Page** (`/community`)
   - Two tabs: "Inbox" and "Groups"
   - Inbox tab: Shows DMs and joined groups
   - Groups tab: Shows all discoverable groups with filters
   - Header with back button and title
   - Unread message count badges

2. **DM Chat Page** (`/community/inbox/[id]`)
   - Full-screen DM conversation
   - Real-time messaging
   - Typing indicators
   - Message composer with emoji picker
   - Auto-scroll to bottom

3. **Group Chat Page** (`/community/groups/[id]`)
   - Full-screen group conversation
   - Group member list
   - Real-time messaging
   - Typing indicators
   - Message composer with emoji picker
   - Pinned messages
   - Auto-scroll to bottom

4. **Legacy Chat Page** (`/chat`)
   - Sidebar with DM list
   - Main chat area
   - Used for simpler DM interface

### React Native Current State:
1. **CommunityScreen** - ✅ Basic structure exists
2. **ChatScreen** - ⚠️ Only handles DMs, missing group chat support
3. **Missing**: Separate DM and Group chat screens
4. **Missing**: Proper navigation to chat screens from community

---

## PHASE 2: NAVIGATION STRUCTURE

### Required Navigation Updates:

#### Current Navigation:
```
SocialStack
  ├── CommunityScreen
  ├── ChatScreen (DM only)
  └── LeaderboardScreen
```

#### Target Navigation (Match Next.js):
```
SocialStack
  ├── CommunityScreen
  ├── DMChatScreen (new)
  ├── GroupChatScreen (new)
  └── LeaderboardScreen
```

### Navigation Types to Update:
- Add `DMChatScreen: { dmId: number }` to `SocialStackParamList`
- Add `GroupChatScreen: { groupId: number }` to `SocialStackParamList`
- Update `ChatScreen` params to support both DM and Group (or deprecate)

---

## PHASE 3: SCREEN IMPLEMENTATION

### 3.1 Create DMChatScreen
**File**: `screens/social/DMChatScreen.tsx`

**Features to Match**:
- Full-screen DM conversation view
- Header with back button, user name, online status
- Message list with auto-scroll
- Real-time message updates
- Typing indicators
- Message composer with emoji picker
- Mark messages as read on view
- Loading states
- Error states

**Components to Use**:
- `DMChatContainer` (from Next.js pattern)
- `MessageComposer` (needs RN adaptation)
- `MessageBubble` (needs RN adaptation)
- `MessageTimestamp` (needs RN adaptation)

### 3.2 Create GroupChatScreen
**File**: `screens/social/GroupChatScreen.tsx`

**Features to Match**:
- Full-screen group conversation view
- Header with back button, group name, member count
- Group member list (drawer/sidebar)
- Message list with auto-scroll
- Real-time message updates
- Typing indicators
- Message composer with emoji picker
- Pinned messages banner
- Mark messages as read on view
- Loading states
- Error states

**Components to Use**:
- `GroupChatContainer` (from Next.js pattern)
- `MessageComposer` (shared with DM)
- `MessageBubble` (shared with DM)
- `MessageTimestamp` (shared with DM)
- `PinnedMessageBanner` (needs RN adaptation)

### 3.3 Update CommunityScreen
**File**: `screens/social/CommunityScreen.tsx`

**Updates Needed**:
- ✅ Basic structure exists
- ⚠️ Navigation to chat screens needs fixing
- Update `handleGroupClick` to navigate to `GroupChatScreen`
- Update DM click handlers to navigate to `DMChatScreen`
- Ensure proper params are passed

---

## PHASE 4: COMPONENT IMPLEMENTATION

### 4.1 Chat Components (New/Update)

#### 4.1.1 MessageComposer Component
**File**: `components/chat/MessageComposer.tsx` (NEW)

**Features**:
- Text input with placeholder
- Emoji picker button (use `react-native-emoji-picker` or similar)
- Send button
- Disabled state handling
- Keyboard handling
- Auto-focus management

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
}
```

#### 4.1.2 MessageBubble Component
**File**: `components/chat/MessageBubble.tsx` (NEW)

**Features**:
- Own message vs received message styling
- Sender name display (for groups)
- Timestamp display
- Message content rendering
- Different background colors for own/others

**Props**:
```typescript
interface MessageBubbleProps {
  message: DMMessage | GroupMessage;
  isOwn: boolean;
  senderName?: string;
  timestamp: string;
}
```

#### 4.1.3 MessageTimestamp Component
**File**: `components/chat/MessageTimestamp.tsx` (NEW)

**Features**:
- Format timestamp (relative or absolute)
- Show date separators
- Time formatting

#### 4.1.4 PinnedMessageBanner Component
**File**: `components/chat/PinnedMessageBanner.tsx` (NEW)

**Features**:
- Display pinned message at top of chat
- Click to scroll to pinned message
- Dismiss button

#### 4.1.5 ChatLoading Component
**File**: `components/chat/ChatLoading.tsx` (NEW)

**Features**:
- Loading spinner
- Loading message text

### 4.2 Update Existing Components

#### 4.2.1 Update ChatBubble
**File**: `components/social/ChatBubble.tsx`

**Updates**:
- Ensure it matches Next.js styling exactly
- Support for group messages (show sender name)
- Better timestamp formatting

#### 4.2.2 Update MessageInput
**File**: `components/social/MessageInput.tsx`

**Updates**:
- Add emoji picker support
- Match Next.js MessageComposer styling
- Better keyboard handling

### 4.3 Community Components (Review/Update)

#### 4.3.1 DMConversationCard
**File**: `components/community/DMConversationCard.tsx`

**Check**:
- ✅ Unread indicator
- ✅ Online status
- ✅ Last message preview
- ✅ Timestamp
- ✅ Avatar display

#### 4.3.2 GroupCard
**File**: `components/community/GroupCard.tsx`

**Check**:
- ✅ Group name
- ✅ Member count
- ✅ Category/tags
- ✅ Join/Leave button
- ✅ Last message preview
- ✅ Unread indicator

#### 4.3.3 GroupFilters
**File**: `components/community/GroupFilters.tsx`

**Check**:
- ✅ Category filter dropdown
- ✅ Search input
- ✅ Filter state management

---

## PHASE 5: HOOKS & LOGIC

### 5.1 Chat Hooks

#### 5.1.1 useDMChat Hook
**File**: `hooks/chat/useDMChat.ts` (NEW)

**Features**:
- Load DM messages
- Send DM messages
- Real-time message updates
- Typing indicators
- Mark as read
- Auto-scroll management

#### 5.1.2 useGroupChat Hook
**File**: `hooks/chat/useGroupChat.ts` (NEW)

**Features**:
- Load group messages
- Send group messages
- Real-time message updates
- Typing indicators
- Load group members
- Load pinned messages
- Mark as read
- Auto-scroll management

#### 5.1.3 useMessageComposer Hook
**File**: `hooks/chat/useMessageComposer.ts` (NEW)

**Features**:
- Message input state
- Emoji picker state
- Send message handler
- Keyboard handling
- Input validation

### 5.2 Update Existing Hooks

#### 5.2.1 useCommunityData
**File**: `hooks/community/useCommunityData.ts`

**Check**:
- ✅ Loads DMs, Groups, Joined Groups
- ✅ Loading states
- ✅ Error handling
- ✅ Refresh functionality

#### 5.2.2 useDMs
**File**: `hooks/community/useDMs.ts`

**Check**:
- ✅ DM list processing
- ✅ Online status mapping
- ✅ Unread detection
- ✅ Other user extraction

#### 5.2.3 useGroups
**File**: `hooks/community/useGroups.ts`

**Check**:
- ✅ Group list processing
- ✅ Joined groups detection
- ✅ Filtering logic

---

## PHASE 6: REAL-TIME FUNCTIONALITY

### 6.1 Socket Integration

**Current State**:
- Redux slices have real-time message handling
- `chatSlice` manages real-time messages
- `communitySlice` manages server-fetched messages

**Required Updates**:
- Ensure socket connection is established
- Verify message events are being received
- Verify typing events are working
- Test online/offline status updates

### 6.2 Real-Time Features Checklist:
- [ ] New messages appear instantly
- [ ] Typing indicators work
- [ ] Online status updates
- [ ] Unread count updates
- [ ] Message read receipts (if implemented)

---

## PHASE 7: UI/UX MATCHING

### 7.1 Styling Requirements

#### Colors:
- Background: `#050110` (dark)
- Message bubbles: Own (blue gradient), Others (gray)
- Input area: Gradient background
- Text: White primary, Gray secondary

#### Spacing:
- Use `spacing` constants consistently
- Match padding/margins from Next.js

#### Typography:
- Match font sizes
- Match font weights
- Match line heights

### 7.2 Layout Requirements

#### CommunityScreen:
- Header at top
- Tabs below header
- Scrollable content area
- Bottom tab navigation (handled by MainNavigator)

#### Chat Screens:
- Header at top (with back button)
- Messages area (scrollable)
- Input area at bottom (sticky)
- Keyboard avoiding view

### 7.3 Animations:
- Smooth scrolling
- Message send animation (optional)
- Typing indicator animation
- Loading spinner

---

## PHASE 8: NAVIGATION FLOW

### 8.1 Navigation Paths

#### From CommunityScreen → DMChatScreen:
```
CommunityScreen (Inbox tab)
  → Click DM card
  → Navigate to DMChatScreen with dmId
```

#### From CommunityScreen → GroupChatScreen:
```
CommunityScreen (Groups tab)
  → Click Group card (if joined)
  → Navigate to GroupChatScreen with groupId

OR

CommunityScreen (Groups tab)
  → Click "Join" on Group card
  → Join group
  → Navigate to GroupChatScreen with groupId
```

#### From CommunityScreen → GroupChatScreen (via Inbox):
```
CommunityScreen (Inbox tab)
  → Click joined group
  → Navigate to GroupChatScreen with groupId
```

### 8.2 Navigation Implementation

**Update CommunityScreen handlers**:
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

---

## PHASE 9: TESTING CHECKLIST

### 9.1 CommunityScreen Tests:
- [ ] Tabs switch correctly (Inbox/Groups)
- [ ] DM list loads and displays
- [ ] Group list loads and displays
- [ ] Filters work (category, search)
- [ ] Join/Leave group works
- [ ] Unread counts display correctly
- [ ] Online status displays correctly
- [ ] Navigation to chat screens works

### 9.2 DMChatScreen Tests:
- [ ] Messages load correctly
- [ ] Can send messages
- [ ] Real-time updates work
- [ ] Typing indicators work
- [ ] Auto-scroll works
- [ ] Mark as read works
- [ ] Back button works
- [ ] Keyboard handling works
- [ ] Emoji picker works

### 9.3 GroupChatScreen Tests:
- [ ] Messages load correctly
- [ ] Can send messages
- [ ] Real-time updates work
- [ ] Typing indicators work
- [ ] Group members display
- [ ] Pinned messages display
- [ ] Auto-scroll works
- [ ] Mark as read works
- [ ] Back button works
- [ ] Keyboard handling works
- [ ] Emoji picker works

### 9.4 Integration Tests:
- [ ] Navigation flow works end-to-end
- [ ] Real-time updates work across screens
- [ ] Unread counts update correctly
- [ ] Online status updates correctly
- [ ] Error states display correctly
- [ ] Loading states display correctly

---

## PHASE 10: IMPLEMENTATION ORDER

### Step 1: Navigation Setup
1. Update `navigation/types.ts` with new screen types
2. Add `DMChatScreen` and `GroupChatScreen` to `SocialNavigator`
3. Update navigation handlers in `CommunityScreen`

### Step 2: Create Chat Components
1. Create `MessageComposer` component
2. Create `MessageBubble` component
3. Create `MessageTimestamp` component
4. Create `PinnedMessageBanner` component
5. Create `ChatLoading` component

### Step 3: Create Chat Hooks
1. Create `useDMChat` hook
2. Create `useGroupChat` hook
3. Create `useMessageComposer` hook

### Step 4: Create Chat Screens
1. Create `DMChatScreen`
2. Create `GroupChatScreen`
3. Test navigation flow

### Step 5: Update Existing Components
1. Review and update `ChatBubble`
2. Review and update `MessageInput`
3. Review all community components

### Step 6: Real-Time Integration
1. Verify socket connections
2. Test real-time message updates
3. Test typing indicators
4. Test online status

### Step 7: UI/UX Polish
1. Match colors and spacing
2. Match typography
3. Add animations
4. Test on different screen sizes

### Step 8: Testing
1. Test all navigation flows
2. Test all features
3. Test error states
4. Test loading states
5. Test real-time functionality

---

## PHASE 11: FILES TO CREATE/MODIFY

### New Files:
1. `screens/social/DMChatScreen.tsx`
2. `screens/social/GroupChatScreen.tsx`
3. `components/chat/MessageComposer.tsx`
4. `components/chat/MessageBubble.tsx`
5. `components/chat/MessageTimestamp.tsx`
6. `components/chat/PinnedMessageBanner.tsx`
7. `components/chat/ChatLoading.tsx`
8. `components/chat/index.ts`
9. `hooks/chat/useDMChat.ts`
10. `hooks/chat/useGroupChat.ts`
11. `hooks/chat/useMessageComposer.ts`
12. `hooks/chat/index.ts`

### Files to Modify:
1. `navigation/types.ts` - Add new screen types
2. `navigation/SocialNavigator.tsx` - Add new screens
3. `screens/social/CommunityScreen.tsx` - Update navigation handlers
4. `components/social/ChatBubble.tsx` - Review and update
5. `components/social/MessageInput.tsx` - Review and update
6. `components/community/*` - Review all components

---

## PHASE 12: DEPENDENCIES

### New Dependencies Needed:
- `react-native-emoji-picker` or similar for emoji picker
- OR use a simpler emoji library

### Existing Dependencies (Verify):
- `@react-navigation/native` - ✅
- `@react-navigation/native-stack` - ✅
- `@react-navigation/bottom-tabs` - ✅
- `react-native-safe-area-context` - ✅
- `@reduxjs/toolkit` - ✅
- Socket client (verify implementation)

---

## NOTES

1. **Emoji Picker**: For React Native, we may need to use a different approach than web. Consider:
   - `react-native-emoji-picker`
   - `emoji-mart-native` (if available)
   - Or a simpler custom solution

2. **Real-Time**: Ensure socket connection is properly established and maintained across screen navigation.

3. **Performance**: Use `FlatList` for message lists instead of `ScrollView` for better performance with many messages.

4. **Keyboard**: Use `KeyboardAvoidingView` to handle keyboard properly on both iOS and Android.

5. **Auto-Scroll**: Implement smooth scrolling to bottom when new messages arrive or when opening chat.

---

## SUCCESS CRITERIA

✅ All screens match Next.js UI exactly
✅ All navigation flows work correctly
✅ Real-time messaging works
✅ Typing indicators work
✅ Online status updates work
✅ Unread counts are accurate
✅ All features from Next.js are implemented
✅ Error states are handled
✅ Loading states are handled
✅ Performance is acceptable

---

## END OF PLAN
