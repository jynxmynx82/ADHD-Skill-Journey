# Testing Guide: Learning Hub Features

## 🎯 **Overview**
This guide covers testing the Learning Hub functionality, which includes:
- **Quick Advice** - AI-powered advice with speech-to-text
- **Learning Hub** - Three tabs: Notes, Strategies, Advice
- **Usage Tracking** - Free tier limits (3 sessions/month)
- **Feedback System** - Rate advice helpfulness

## 🧪 **Test Scenarios**

### **Test 1: Account Creation Flow**
1. **Main Signup Path**
   - Open app and click "Create Account"
   - Fill in basic info (email, password, first/last name)
   - Should proceed to questionnaire
   - Console: `LOG 🔥 AuthContext: Starting signUp process...`

2. **Questionnaire Experience**
   - Answer questions or click "Skip" button
   - If completed: Should create provisional profile
   - If skipped: Should still create account successfully
   - Console: `LOG ✅ AuthContext: Firebase Auth user created successfully`

3. **Alternative Signup Path**
   - Go to login screen → "Sign Up" link
   - Should go to same questionnaire flow
   - Verify both paths lead to same experience

### **Test 2: Quick Advice FAB**
1. **FAB Visibility**
   - Navigate to any tab (Schedule, Journal, etc.)
   - Look for floating action button (orange chat icon)
   - Should be visible on all screens

2. **Speech-to-Text Recording**
   - Tap FAB to open Quick Advice modal
   - Tap microphone button to start recording
   - Speak a question (e.g., "My son has trouble with transitions")
   - Tap again to stop recording
   - Verify transcription appears in text area
   - Console: `LOG Transcription completed: [your question]`

3. **Text Input Alternative**
   - Type question directly in text area
   - Should work as alternative to speech

4. **Advice Generation**
   - Tap "Get Advice" button
   - Should show AI-generated advice
   - Verify advice is relevant to question
   - Console: `LOG ✅ Advice session saved and usage incremented`

5. **Usage Limits**
   - Try multiple advice requests
   - After 3 sessions, should show usage limit message
   - Console: `LOG Usage limit reached`

### **Test 3: Learning Hub (Journal Tab)**
1. **Navigation**
   - Go to Journal tab in bottom navigation
   - Should show "Learning Hub" title
   - Three tabs: Notes, Strategies, Advice

2. **Notes Tab**
   - Create text or audio entries
   - Should display in Notes tab
   - Test both text and audio recording

3. **Strategies Tab**
   - Should show strategies saved from Quick Advice
   - Each strategy should show:
     - Challenge/question
     - Strategy/advice
     - Category
     - Worked status

4. **Advice Tab**
   - Should show all advice sessions
   - Each session should show:
     - Original question
     - Advice given
     - Category
     - Feedback (if provided)

### **Test 4: Strategy Saving**
1. **From Quick Advice**
   - Generate advice via FAB
   - In advice modal, tap "Save as Strategy"
   - Should save to Strategies tab
   - Verify strategy appears in Learning Hub

2. **Strategy Management**
   - View saved strategies
   - Mark strategies as worked/not worked
   - Add comments to strategies

### **Test 5: Feedback System**
1. **Rate Advice**
   - Generate advice via FAB
   - In advice modal, tap thumbs up/down
   - Should save feedback to advice session
   - Console: `LOG Feedback: Helpful` or `LOG Feedback: Not Helpful`

2. **Feedback Analytics**
   - Check advice sessions in Learning Hub
   - Verify feedback is saved
   - Test feedback percentages

## 📊 **Console Logs to Monitor**

### **Successful Flow:**
```
LOG 🔥 Auth Emulator connected
LOG 🔥 Firestore Emulator connected
LOG 🔥 Functions Emulator connected
LOG Starting recording..
LOG Stopping recording..
LOG Transcription completed: [your question]
LOG ✅ Advice session saved and usage incremented
LOG Feedback: Helpful
LOG ✅ Feedback saved to advice session
```

### **Error Indicators:**
```
ERROR Error checking usage limit: [FirebaseError: ...]
ERROR Error saving advice session: [FirebaseError: ...]
ERROR Error logging audit event: [FirebaseError: ...]
```

## 🐛 **Common Issues & Solutions**

### **Issue 1: Usage Limit Errors**
- **Cause**: Firestore rules not updated
- **Solution**: Restart Firebase emulators

### **Issue 2: Audit Logging Errors**
- **Cause**: Missing auditLogs collection rules
- **Solution**: Update firestore.rules and restart emulators

### **Issue 3: Children Fetching Errors**
- **Cause**: Firestore rules for children collection
- **Solution**: Update rules or skip for now (non-critical)

### **Issue 4: Transcription Fails**
- **Cause**: Firebase Functions not running
- **Solution**: Ensure emulators are running: `firebase emulators:start --only firestore,auth,functions`

## 📋 **Testing Data to Verify**

### **After Account Creation:**
- User document in Firestore
- Provisional profile (if questionnaire completed)

### **After Quick Advice:**
- Advice session in Firestore
- Usage tracking updated
- Audit log entry (if working)

### **After Strategy Save:**
- Strategy document in Firestore
- Link to original advice session

### **After Feedback:**
- Advice session updated with feedback
- Analytics data available

## ✅ **Success Criteria**

### **Core Functionality:**
- ✅ Account creation works
- ✅ Speech-to-text transcription works
- ✅ Advice generation works
- ✅ Strategy saving works
- ✅ Feedback system works
- ✅ Learning Hub displays data

### **UI/UX:**
- ✅ FAB visible on all screens
- ✅ Quick Advice modal opens/closes
- ✅ Learning Hub tabs work
- ✅ Data displays correctly

### **Error Handling:**
- ✅ Graceful degradation when services fail
- ✅ User-friendly error messages
- ✅ No app crashes

---

*Last Updated: [Current Date]*
*Status: Ready for Testing* 