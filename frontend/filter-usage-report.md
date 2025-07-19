# Filter Method Usage Report - Frontend

This report lists all occurrences of the `.filter()` method in the frontend TypeScript and JavaScript files.

## Summary
- **Total files using .filter()**: 24 files
- **Total occurrences**: 65 instances

## Detailed List by File

### 1. **app/mentor/availability/page.tsx**
- **Line 106**: `setTimeSlots(timeSlots.filter((_, i) => i !== index))`
  - Context: Removing a time slot by index
- **Line 126**: `setBlockedDates(blockedDates.filter((_, i) => i !== index))`
  - Context: Removing a blocked date by index

### 2. **app/mentor/sessions/page.tsx**
- **Line 125**: `const filteredSessions = sessions.filter(session => {`
  - Context: Filtering sessions based on date criteria
- **Line 137**: `const upcomingSessions = sessions.filter(`
  - Context: Getting upcoming scheduled sessions
- **Line 141**: `const completedSessions = sessions.filter(`
  - Context: Getting completed sessions

### 3. **app/mentor/page.tsx**
- **Line 28**: `sessions.filter((s) => new Date(s.scheduledAt) > new Date() && s.status === 'scheduled')`
  - Context: Filtering upcoming scheduled sessions
- **Line 31**: `requests.filter((r) => r.status === 'pending')`
  - Context: Filtering pending requests

### 4. **app/mentor/materials/page.tsx**
- **Line 95**: `formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)`
  - Context: Filtering out empty tags after splitting
- **Line 192**: `const filteredMaterials = materials.filter(material => {`
  - Context: Filtering materials based on search criteria
- **Line 202**: `Array.from(new Set(materials.map(m => m.category).filter(Boolean)))`
  - Context: Getting unique categories that are not empty

### 5. **app/mentor/settings/page.tsx**
- **Line 178**: `expertise: settings.profile.expertise.filter(s => s !== skill)`
  - Context: Removing a skill from expertise list
- **Line 201**: `languages: settings.profile.languages.filter(l => l !== language)`
  - Context: Removing a language from languages list
- **Line 213**: `workingDays: workingDays.filter(d => d !== day)`
  - Context: Removing a day from working days

### 6. **app/requests/page.tsx**
- **Line 103**: `const pendingRequests = requests.filter(r => r.status === 'pending')`
  - Context: Getting pending requests
- **Line 104**: `const acceptedRequests = requests.filter(r => r.status === 'accepted')`
  - Context: Getting accepted requests
- **Line 105**: `const rejectedRequests = requests.filter(r => r.status === 'rejected' || r.status === 'cancelled')`
  - Context: Getting rejected or cancelled requests

### 7. **app/goals/page.tsx**
- **Line 191**: `const activeGoals = goals.filter(g => g.status === 'IN_PROGRESS')`
  - Context: Getting goals in progress
- **Line 192**: `const completedGoals = goals.filter(g => g.status === 'COMPLETED')`
  - Context: Getting completed goals
- **Line 193**: `const upcomingDeadlines = goals.filter(g => {`
  - Context: Getting goals with upcoming deadlines

### 8. **app/mentee/page.tsx**
- **Line 342**: `sessions.filter(s => s.status === 'SCHEDULED').length === 0`
  - Context: Checking if there are no scheduled sessions
- **Line 352**: `.filter(s => s.status === 'SCHEDULED')`
  - Context: Filtering sessions to show only scheduled ones

### 9. **app/mentee/requests/page.tsx**
- **Line 184**: `const filteredRequests = requests.filter(request => {`
  - Context: Filtering requests based on search and status
- **Line 235**: `mentors.filter(m => m.isAvailable).map(mentor => (`
  - Context: Showing only available mentors

### 10. **app/mentee/sessions/page.tsx**
- **Line 162**: `const filteredSessions = sessions.filter(session => {`
  - Context: Filtering sessions based on search criteria

### 11. **app/mentors/page.tsx**
- **Line 136**: `.filter((user: any) => user.role === 'mentor' || user.role === 'admin')`
  - Context: Filtering users to get only mentors and admins
- **Line 143**: `languages: ['es', Math.random() > 0.5 ? 'en' : null].filter(Boolean)`
  - Context: Filtering out null values from languages array
- **Line 225**: `.filter(mentor =>`
  - Context: Complex mentor filtering based on multiple criteria
- **Line 341**: `expertise: filters.expertise.filter(e => e !== exp)`
  - Context: Removing expertise from filter
- **Line 418**: `days: filters.availability.days.filter(d => d !== day.value)`
  - Context: Removing day from availability filter
- **Line 458**: `timeSlots: filters.availability.timeSlots.filter(s => s !== slot.value)`
  - Context: Removing time slot from filter
- **Line 493**: `languages: filters.languages.filter(l => l !== lang.value)`
  - Context: Removing language from filter
- **Line 527**: `yearsOfExperience: filters.yearsOfExperience.filter(r => r !== range.value)`
  - Context: Removing experience range from filter
- **Line 575**: `expertise: filters.expertise.filter(e => e !== exp)`
  - Context: Removing expertise tag from active filters
- **Line 605**: `languages: filters.languages.filter(l => l !== lang)`
  - Context: Removing language tag from active filters

### 12. **app/sessions/page.tsx**
- **Line 135**: `const upcomingSessions = sessions.filter(s => isSessionUpcoming(s))`
  - Context: Getting upcoming sessions
- **Line 136**: `const pastSessions = sessions.filter(s => !isSessionUpcoming(s))`
  - Context: Getting past sessions
- **Line 269**: `pastSessions.filter(s => s.status === 'completed').length`
  - Context: Counting completed sessions

### 13. **app/messages/page.tsx**
- **Line 218**: `const filteredConversations = conversations.filter(conv =>`
  - Context: Filtering conversations by search query

### 14. **app/resources/page.tsx**
- **Line 190**: `prev.filter(t => t !== tag)`
  - Context: Removing a tag from selected tags

### 15. **app/admin/page.tsx**
- **Line 41**: `admins: users.filter((u: any) => u.role === 'admin').length`
  - Context: Counting admin users
- **Line 42**: `mentors: users.filter((u: any) => u.role === 'mentor').length`
  - Context: Counting mentor users
- **Line 43**: `mentees: users.filter((u: any) => u.role === 'mentee').length`
  - Context: Counting mentee users
- **Line 63**: `active: sessions.filter((s: any) => s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS').length`
  - Context: Counting active sessions
- **Line 64**: `today: sessions.filter((s: any) => new Date(s.scheduledAt) >= today).length`
  - Context: Counting today's sessions
- **Line 65**: `week: sessions.filter((s: any) => new Date(s.scheduledAt) >= weekAgo).length`
  - Context: Counting this week's sessions
- **Line 66**: `month: sessions.filter((s: any) => new Date(s.scheduledAt) >= monthAgo).length`
  - Context: Counting this month's sessions

### 16. **app/admin/calendar/page.tsx**
- **Line 80**: `return sessions.filter(session => {`
  - Context: Getting sessions for a specific day
- **Line 255**: `sessions.filter(s => s.status === 'SCHEDULED').length`
  - Context: Counting scheduled sessions
- **Line 270**: `sessions.filter(s => s.status === 'COMPLETED').length`
  - Context: Counting completed sessions
- **Line 285**: `sessions.filter(s => s.status === 'CANCELLED').length`
  - Context: Counting cancelled sessions

### 17. **app/admin/notifications/page.tsx**
- **Line 150**: `setNotifications(notifications.filter(n => n.id !== notificationId))`
  - Context: Removing a notification by ID

### 18. **app/admin/sessions/page.tsx**
- **Line 151**: `const filteredSessions = sessions.filter(session => {`
  - Context: Filtering sessions based on search and status

### 19. **app/admin/sessions/new/page.tsx**
- **Line 70**: `setMentors(users.filter((u: User) => u.role === 'mentor' || u.role === 'admin'))`
  - Context: Getting mentor and admin users
- **Line 71**: `setMentees(users.filter((u: User) => u.role === 'mentee'))`
  - Context: Getting mentee users

### 20. **app/admin/users/page.tsx**
- **Line 95**: `const filteredUsers = users.filter(user =>`
  - Context: Filtering users based on search term

### 21. **components/hooks/use-toast.ts**
- **Line 127**: `toasts: state.toasts.filter((t) => t.id !== action.toastId)`
  - Context: Removing a toast notification

### 22. **components/resources/create-resource-dialog.tsx**
- **Line 86**: `tags: formData.tags.filter(t => t !== tag)`
  - Context: Removing a tag from the form

### 23. **hooks/use-toast.ts**
- **Line 102**: `toasts: state.toasts.filter((t) => t.id !== action.toastId)`
  - Context: Removing a toast by ID

### 24. **store/slices/mentorshipSlice.ts**
- **Line 66**: `state.sessions = state.sessions.filter(s => s.id !== action.payload)`
  - Context: Removing a session from state

### 25. **store/slices/notificationSlice.ts**
- **Line 34**: `state.unreadCount = action.payload.filter(n => !n.read).length`
  - Context: Counting unread notifications
- **Line 58**: `state.notifications = state.notifications.filter(n => n.id !== action.payload)`
  - Context: Removing a notification from state

## Common Filter Patterns

1. **Status Filtering**: Most common use case, filtering by status fields (pending, completed, scheduled, etc.)
2. **Date Filtering**: Filtering based on date comparisons (upcoming, past, within range)
3. **Role Filtering**: Filtering users by their role (mentor, mentee, admin)
4. **Removal Operations**: Using filter to remove items from arrays by ID or index
5. **Search Filtering**: Filtering based on text search in names or descriptions
6. **Boolean Filtering**: Using `.filter(Boolean)` to remove falsy values
7. **Availability Filtering**: Filtering based on availability status
8. **Tag/Category Filtering**: Filtering by tags or categories

## Recommendations

1. Consider creating utility functions for common filter patterns
2. Some filter operations could be optimized using memoization (useMemo)
3. Complex filters in components like mentors/page.tsx could benefit from being extracted into separate functions
4. Consider using TypeScript discriminated unions for status fields to ensure type safety