# 🧪 Testing Guide - Multi-User Video & Features

## What You Should See

### ✅ All Users See Each Other's Videos
- When User A joins, User B sees User A's video
- When User B joins, User A sees User B's video
- Each user sees ALL other users' video streams in the grid

### ✅ Cake Cutting Shows for Everyone
- Host clicks "Cut Cake" button
- Animation appears for ALL users simultaneously
- System message appears in ALL users' chat

## Step-by-Step Test

### 1️⃣ Prepare Browser Tabs

Open 3 browser tabs (or use incognito mode):
- **Tab 1**: Regular Chrome tab
- **Tab 2**: New regular Chrome tab
- **Tab 3**: Incognito window (Ctrl+Shift+N)

### 2️⃣ Tab 1 - Create Party (Host)

1. Go to: `http://localhost:3000`
2. Click **"Create Birthday Party"**
3. Fill in:
   - Your Name: `Alice`
   - Birthday Person: `Bob`
4. Click **"Create Party"**
5. **IMPORTANT**: Allow camera/microphone access
6. **Copy the room code** (e.g., `ABC123`)
7. **✅ You should see**: Your own video in the grid

**Console Check (F12)**:
```
✅ Connected to signaling server
✅ Successfully connected to room: ABC123
✅ Local participant added to store
```

### 3️⃣ Tab 2 - Join as Guest 1

1. Go to: `http://localhost:3000` (new tab)
2. Click **"Join Birthday Party"**
3. Fill in:
   - Your Name: `Charlie`
   - Room Code: `ABC123` (paste from Tab 1)
4. Click **"Join Party"**
5. **IMPORTANT**: Allow camera/microphone access
6. **✅ You should see**: 
   - Your own video (Charlie)
   - Alice's video from Tab 1

**Switch to Tab 1**:
- **✅ You should see**: Charlie's video appear!

**Console Check (F12) in Tab 2**:
```
🔗 Creating connections to existing participants: [{Alice}]
Creating peer connection to: Alice
📨 Received offer from: Alice
✅ Peer connection established with: Alice
🎥 Received video stream from: Alice
✅ Added remote participant to store: Alice
```

**Console Check in Tab 1**:
```
👋 New user joined: Charlie
📨 Received offer from: Charlie
✅ Received answer from: Charlie
🎥 Received video stream from: Charlie
✅ Added remote participant to store: Charlie
```

### 4️⃣ Tab 3 - Join as Guest 2 (Incognito)

1. Open **Incognito window** (Ctrl+Shift+N)
2. Go to: `http://localhost:3000`
3. Click **"Join Birthday Party"**
4. Fill in:
   - Your Name: `Diana`
   - Room Code: `ABC123`
5. Click **"Join Party"**
6. **IMPORTANT**: Allow camera/microphone access
7. **✅ You should see**:
   - Your own video (Diana)
   - Alice's video
   - Charlie's video

**Switch to Tab 1 & Tab 2**:
- **✅ Both should show**: Diana's video appear!

### 5️⃣ Test Video Grid

**Expected Layout**:
- 3 participants = 2x2 grid (3 videos visible)
- Each video shows the person's name
- Local video (your own) labeled with "(You)"

**Verify**:
- [ ] Tab 1 shows: Alice (You), Charlie, Diana
- [ ] Tab 2 shows: Charlie (You), Alice, Diana  
- [ ] Tab 3 shows: Diana (You), Alice, Charlie

### 6️⃣ Test Chat Messages

**In Tab 2 (Charlie)**:
1. Type: "Hello everyone!"
2. Press Enter

**✅ Expected Result**:
- Message appears in Tab 1 (Alice)
- Message appears in Tab 2 (Charlie)
- Message appears in Tab 3 (Diana)
- Sender shows as "Charlie"
- Timestamp appears

**Try from other tabs too!**

### 7️⃣ Test Cake Cutting (The Important One!)

**In Tab 1 (Alice - Host)**:
1. Click the **"Cut Cake"** button (top right)

**✅ Expected Result in ALL TABS**:
- 🎂 Cake animation appears (full screen)
- 🎉 Confetti animation
- 🎵 Celebration visuals
- 💬 System message in chat: "🎂 Bob is cutting the cake! 🎂"

**Console Check in ALL tabs**:
```
🎂 Cake cutting event received for: Bob
```

**Verify**:
- [ ] Tab 1 (Alice) - Shows cake animation
- [ ] Tab 2 (Charlie) - Shows cake animation
- [ ] Tab 3 (Diana) - Shows cake animation
- [ ] All tabs show system message

### 8️⃣ Test Audio/Video Controls

**In Tab 2 (Charlie)**:
1. Click **microphone icon** (mute)
2. Click **camera icon** (video off)

**✅ Expected Result**:
- Tab 2: Your video goes black or shows "Video Off"
- Tab 1 & 3: Charlie's video disappears or shows placeholder

### 9️⃣ Test User Leaving

**In Tab 3 (Diana)**:
1. Click **"Leave"** button

**✅ Expected Result**:
- Tab 3: Returns to home page
- Tab 1 & 2: Diana's video disappears
- Participant count decreases

**Console Check in Tab 1 & 2**:
```
👋 User left: Diana
```

### 🔟 Test Host Leaving (Room Closes)

**In Tab 1 (Alice - Host)**:
1. Click **"Leave"** button

**✅ Expected Result**:
- Tab 1: Returns to home page
- Tab 2: Shows "Host left the party" message
- Tab 2: Kicked out or connection closes
- Room is deleted from server

## 🐛 Troubleshooting

### ❌ Can't See Other User's Video

**Check Browser Console (F12)**:
- Look for WebRTC errors
- Look for "Received video stream" messages
- Check if peer connections are established

**Common Issues**:
1. **Camera/microphone not allowed**
   - Grant permissions in browser
   - Close other apps using camera

2. **STUN server issues**
   - Check internet connection
   - Try using same network

3. **Browser compatibility**
   - Use Chrome or Edge (best support)
   - Update to latest version

### ❌ Cake Cutting Doesn't Show for All Users

**Check Browser Console**:
- Look for: `🎂 Cake cutting event received for:`
- If missing, Socket.io connection issue

**Check Server Terminal**:
- Should see: `Cake cutting started in [roomCode]`
- If missing, event not reaching server

**Fixes**:
1. Refresh all tabs and rejoin
2. Check Socket.io server is running (port 3001)
3. Verify room codes match

### ❌ Chat Not Syncing

**Check**:
- Socket.io connection status
- All users in same room code
- Server logs show message received

**Fix**:
- Refresh and rejoin room
- Check CORS settings in server

## 📊 Success Criteria

✅ **All tests pass if**:
- [x] 3 users can join the same room
- [x] Each user sees ALL other users' videos
- [x] Video grid shows all participants
- [x] Chat messages appear in all tabs instantly
- [x] Cake cutting animation shows for everyone
- [x] System message appears for everyone
- [x] Audio/video controls work
- [x] Users can leave gracefully
- [x] Room closes when host leaves

## 🎯 Key Points

1. **Video Sharing**: Uses WebRTC peer-to-peer connections
2. **Cake Cutting**: Uses Socket.io broadcast to all users
3. **Chat**: Uses Socket.io room broadcasting
4. **Room Management**: Server tracks all participants

## 🔍 Debug Commands

Check server logs in terminal for:
```
Client connected: [socket-id]
Creating room: [code] by [host]
[user] joined room: [code]
Sending offer from [A] to [B]
Chat message in [code] from [user]: [message]
Cake cutting started in [code]
User left: [user]
```

Happy testing! 🎉
