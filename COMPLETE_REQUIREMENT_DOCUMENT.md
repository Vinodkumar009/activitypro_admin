# Requirement Document: Automated Waiting List Notification & Self-Service Booking

## Overview
Enable automatic notification and self-service confirmation for waiting list members when a spot becomes available in a weekly session, eliminating manual admin/coach intervention.

## Current State
- Members can add themselves to a class-specific waiting list via Member App
- Admin/Coach manually confirms members from waiting list (first-come-first-served)
- No automatic notifications when spots become available

## Proposed Solution

### Core Flow

#### When a Spot Becomes Available

**System Detection**
- Spot opens in a weekly session (cancellation/dropout)
- System identifies all members on waiting list for that specific class (ordered by join time)

**Automatic Notification**
- System sends push notification + email to all members on the waiting list simultaneously
- Message: "A spot is now available in [Class Name] on [Date/Time]. Book now - first to confirm gets the place!"


**Member App - Booking Action**
- Member clicks notification → directed to session booking page
- Two scenarios:
  - **Paid Classes:** "Confirm & Pay" button → proceeds to payment (existing flow)
  - **Free Classes:** "Confirm Booking" button → instant confirmation

**First to Confirm Wins**
- First member to complete payment (paid class) or tap confirm (free class) secures the spot
- System immediately marks spot as filled



### Communication Templates

**Push/Email - Spot Available:**
"🎾 Spot Available! A place has opened in [Class Name] - [Day, Time]. First to book gets it. Tap to confirm now."


### Benefits
✅ Eliminates manual admin work on-court  
✅ Fair, automated first-come-first-served system  
✅ Real-time opportunity for members  
✅ Reduces no-shows (members actively choosing to book)

---


# Technical Implementation

## 1. Overview

The automated waitlist system manages session availability through two primary triggers:
1. **User Unenrollment/Drop** - When a participant leaves a session
2. **Capacity Increase** - When session capacity is expanded by administrators

Both scenarios follow a First-Come-First-Served (FCFS) approach based on waitlist registration timestamp (`created_date_time`).

---

## 2. System Architecture

### 2.1 Core Components
- **Unenrollment Service** - Handles user drops and triggers waitlist processing
- **Capacity Management Service** - Manages session capacity updates
- **Waitlist Processing Engine** - Identifies eligible waitlisted users using FCFS ordering
- **Notification Service** - Sends automated email and push notifications
- **Database Layer** - Manages session, enrollment, and waitlist data

### 2.2 Database Schema Requirements

**Sessions Table:**
```sql
- session_id (PK)
- capacity (current max capacity)
- enrolled_count (current enrollment count)
- session_date_time
- class_name
- status
```

**Waitlist Table:**
```sql
- waitlist_id (PK)
- session_id (FK)
- user_id (FK)
- created_date_time (timestamp for FCFS ordering)
- status (pending/notified/expired/booked)
- notification_sent_at
- position (calculated field)
```

**Enrollment Table:**
```sql
- enrollment_id (PK)
- session_id (FK)
- user_id (FK)
- enrollment_date_time
- status (active/dropped/cancelled)
```

---


## 3. Scenario 1: User Unenrollment/Drop

### 3.1 Trigger Event
User initiates drop or administrator unenrolls a participant from a session.

### 3.2 Process Flow

**Step 1: Unenroll User**
```
API: POST /api/sessions/{sessionId}/unenroll
Request Body: { userId, reason }
```

**Step 2: Update Enrollment Status**
- Mark enrollment record as 'dropped' or 'cancelled'
- Decrement `enrolled_count` in sessions table
- Log the unenrollment action with timestamp

**Step 3: Check Waitlist Availability**
```sql
SELECT * FROM waitlist 
WHERE session_id = ? 
  AND status = 'pending'
ORDER BY created_date_time ASC 
LIMIT 1
```

**Step 4: Notify Waitlisted User**
- Retrieve top waitlisted user (earliest `created_date_time`)
- Update waitlist status to 'notified'
- Record `notification_sent_at` timestamp
- Trigger email + push notification (with booking deep link)
- Notification message: "A spot is now available in [Class Name] on [Date/Time]. Book now - first to confirm gets the place!"

**Step 5: Response**
- Return success response with waitlist notification status
- Log notification delivery for audit trail

### 3.3 Implementation Considerations

**Transaction Management:**
- Wrap unenrollment and waitlist processing in a database transaction
- Ensure atomicity to prevent race conditions
- Use row-level locking on session record

**Error Handling:**
- If notification fails, mark waitlist record for retry
- Implement exponential backoff for notification retries (1min, 5min, 15min)
- Log all failures for monitoring and manual intervention

**Edge Cases:**
- No waitlisted users: Complete unenrollment without notification
- Multiple simultaneous drops: Process sequentially with proper locking
- User already enrolled: Skip and move to next waitlisted user

---


## 4. Scenario 2: Session Capacity Update

### 4.1 Trigger Event
Administrator updates session capacity or group size through admin interface.

### 4.2 Process Flow

**Step 1: Receive Capacity Update Request**
```
API: PUT /api/sessions/{sessionId}/capacity
Request Body: { newCapacity, updatedBy }
```

**Step 2: Validate Capacity Change**
- Retrieve current session capacity
- Calculate capacity delta: `capacityIncrease = newCapacity - currentCapacity`

**Step 3: Decision Logic**

#### Case A: Capacity Decreased or Unchanged
```
IF newCapacity <= currentCapacity THEN
  - Update sessions table with new capacity
  - Return response (no waitlist processing)
  - Log capacity change
END IF
```

#### Case B: Capacity Increased
```
IF newCapacity > currentCapacity THEN
  - Calculate spots available: spotsAvailable = capacityIncrease
  - Proceed to waitlist processing
END IF
```

**Step 4: Process Waitlist (Capacity Increase Only)**

**Query Eligible Waitlisted Users:**
```sql
SELECT * FROM waitlist 
WHERE session_id = ? 
  AND status = 'pending'
ORDER BY created_date_time ASC 
LIMIT ?  -- capacityIncrease value
```

**Step 5: Batch Notification**
- Retrieve top N waitlisted users (N = capacity increase)
- Update all selected waitlist records to 'notified' status
- Record `notification_sent_at` for each user
- Send email + push notifications to all selected users concurrently
- Each notification includes deep link to booking page

**Step 6: Update Session Record**
- Update sessions table with new capacity
- Log capacity change with timestamp and admin details

**Step 7: Response**
- Return success response with notification count
- Include list of notified users for audit trail

### 4.3 Example Scenario

**Initial State:**
- Current Capacity: 20
- Enrolled Count: 20 (full)
- Waitlist Count: 5 users

**Capacity Update:**
- New Capacity: 22
- Capacity Increase: 2 spots

**Processing:**
1. Identify top 2 waitlisted users by `created_date_time`:
   - User A (registered 2024-01-15 10:30:00)
   - User B (registered 2024-01-15 11:45:00)
2. Send notifications to both User A and User B simultaneously
3. Update session capacity to 22
4. Both users receive: "A spot is now available in [Class Name] on [Date/Time]. Book now - first to confirm gets the place!"

### 4.4 Implementation Considerations

**Concurrency Control:**
- Implement optimistic locking on session capacity updates
- Use row-level locking to prevent simultaneous capacity changes
- Handle version conflicts gracefully with retry logic

**Batch Processing:**
- Process multiple notifications asynchronously using message queue
- Track notification delivery status for each user
- Implement timeout mechanism (15-30 minutes configurable)

**Audit Trail:**
- Log all capacity changes with admin user details
- Record notification history for compliance
- Maintain timestamp trail for debugging and reporting

---


## 5. Notification System

### 5.1 Notification Channels
- **Email** - Detailed notification with booking link
- **Push Notification** - Real-time alert with deep link to booking page

### 5.2 Notification Content

**Email Subject:** "Spot Available: [Class Name] - Book Now!"

**Email Body:**
```
Hi [User Name],

Great news! A spot has become available for:

Class: [Class Name]
Date & Time: [Session DateTime]
Location: [Session Location]

You're on the waiting list and this spot is available now. First to confirm gets the place!

[Book Now Button/Link]

This opportunity is available for the next [X minutes]. If not booked, it will be offered to others on the waitlist.

Questions? Contact us at [Support Email]

Best regards,
[Organization Name]
```

**Push Notification:**
"🎾 Spot Available! A place has opened in [Class Name] - [Day, Time]. First to book gets it. Tap to confirm now."

### 5.3 Notification Delivery

**Service Integration:**
- Email: Transactional email service (SendGrid, AWS SES, Mailgun)
- Push: Firebase Cloud Messaging (FCM) or Apple Push Notification Service (APNS)
- Implement retry logic with exponential backoff
- Track delivery status and bounces



## 7. API Specifications

### 7.1 Unenroll API
```
POST /api/sessions/{sessionId}/unenroll

Request:
{
  "userId": "string",
  "reason": "string",
  "unenrolledBy": "string"
}

Response (Success):
{
  "success": true,
  "message": "User unenrolled successfully",
  "sessionId": "string",
  "waitlistNotified": true,
  "notifiedUser": {
    "userId": "string",
    "email": "string",
    "name": "string",
    "notificationSentAt": "2026-01-19T10:30:00Z"
  }
}

Response (No Waitlist):
{
  "success": true,
  "message": "User unenrolled successfully",
  "sessionId": "string",
  "waitlistNotified": false
}
```

### 7.2 Update Capacity API
```
PUT /api/sessions/{sessionId}/capacity

Request:
{
  "newCapacity": 22,
  "updatedBy": "admin_user_id",
  "reason": "Additional court available"
}

Response (Capacity Increased):
{
  "success": true,
  "message": "Capacity updated and waitlist notified",
  "capacityChange": {
    "oldCapacity": 20,
    "newCapacity": 22,
    "increase": 2
  },
  "waitlistProcessed": true,
  "notifiedUsers": [
    {
      "userId": "user_123",
      "email": "user1@example.com",
      "name": "John Doe",
      "waitlistPosition": 1,
      "notificationSentAt": "2026-01-19T10:30:00Z"
    },
    {
      "userId": "user_456",
      "email": "user2@example.com",
      "name": "Jane Smith",
      "waitlistPosition": 2,
      "notificationSentAt": "2026-01-19T10:30:01Z"
    }
  ],
  "notificationCount": 2
}

Response (Capacity Decreased):
{
  "success": true,
  "message": "Capacity updated",
  "capacityChange": {
    "oldCapacity": 22,
    "newCapacity": 20,
    "decrease": 2
  },
  "waitlistProcessed": false
}
```

### 7.3 Booking Confirmation API
```
POST /api/sessions/{sessionId}/confirm-booking

Request:
{
  "userId": "string",
  "token": "string",
  "paymentId": "string" (optional, for paid classes)
}

Response (Success):
{
  "success": true,
  "message": "Booking confirmed",
  "booking": {
    "enrollmentId": "string",
    "sessionId": "string",
    "userId": "string",
    "className": "string",
    "sessionDateTime": "2026-01-25T18:00:00Z",
    "confirmedAt": "2026-01-19T10:35:00Z"
  }
}

Response (Spot Already Filled):
{
  "success": false,
  "error": "SPOT_FILLED",
  "message": "Sorry, this spot has just been filled by another member.",
  "remainOnWaitlist": true,
  "currentPosition": 3
}
```

---


## 8. Error Handling & Edge Cases

### 8.1 Common Error Scenarios

**Email/Push Notification Failure**
- Action: Mark notification for retry
- Retry: 3 attempts with exponential backoff (1min, 5min, 15min)
- Fallback: Log error and alert admin for manual intervention
- Alternative: Send SMS notification if configured

**User Already Enrolled**
- Action: Skip notification, move to next waitlisted user
- Log: Record skip reason for audit
- Update: Recalculate waitlist positions

**Session Cancelled**
- Action: Prevent waitlist processing
- Notify: Send cancellation emails to all waitlisted users
- Update: Mark all waitlist entries as 'cancelled'

**Concurrent Capacity Updates**
- Action: Use database locking to serialize updates
- Response: Return conflict error if version mismatch
- Retry: Client should retry with latest session data

**Payment Timeout**
- Action: Release reserved spot after 5 minutes
- Notify: Next waitlisted user automatically
- Update: Mark original user's attempt as 'expired'

**Booking Window Expired**
- Action: Automated job checks for expired notifications
- Process: Move to next waitlisted user
- Notify: Send "spot filled" message to expired users

### 8.2 Race Condition Prevention

#### Critical Race Condition Scenarios

**Race Condition 1: Multiple Users Enrolling When Only 1 Spot Available**

**Scenario:**
- Session capacity: 20, Currently enrolled: 19 (1 spot available)
- User A, User B, and User C all try to enroll simultaneously
- Without proper locking, all 3 could potentially get enrolled (capacity exceeded)

**Solution:**
```sql
-- Use pessimistic locking with SELECT FOR UPDATE
BEGIN TRANSACTION;

-- Lock the session row to prevent concurrent modifications
SELECT enrolled_count, capacity 
FROM sessions 
WHERE session_id = ? 
FOR UPDATE;

-- Check if spot is available
IF enrolled_count < capacity THEN
  -- Insert enrollment
  INSERT INTO enrollment (session_id, user_id, status) 
  VALUES (?, ?, 'active');
  
  -- Increment enrolled count atomically
  UPDATE sessions 
  SET enrolled_count = enrolled_count + 1 
  WHERE session_id = ?;
  
  COMMIT;
  RETURN success;
ELSE
  ROLLBACK;
  RETURN error: "Session is full";
END IF;
```

**Alternative Solution - Optimistic Locking:**
```sql
-- Add version column to sessions table
UPDATE sessions 
SET enrolled_count = enrolled_count + 1,
    version = version + 1
WHERE session_id = ? 
  AND enrolled_count < capacity
  AND version = ?;  -- Check version hasn't changed

-- If affected rows = 0, someone else modified it
-- Retry with fresh data
```

**Race Condition 2: Multiple Users Unenrolling Simultaneously**

**Scenario:**
- Session has 3 enrolled users, 5 waitlisted users
- User A and User B both unenroll at the same time
- Without proper handling, same waitlisted user could be notified twice

**Solution:**
```sql
BEGIN TRANSACTION;

-- Lock session row
SELECT enrolled_count FROM sessions 
WHERE session_id = ? 
FOR UPDATE;

-- Unenroll user
UPDATE enrollment 
SET status = 'dropped' 
WHERE enrollment_id = ?;

-- Decrement count
UPDATE sessions 
SET enrolled_count = enrolled_count - 1 
WHERE session_id = ?;

-- Get next waitlisted user with row lock
SELECT * FROM waitlist 
WHERE session_id = ? 
  AND status = 'pending'
ORDER BY created_date_time ASC 
LIMIT 1
FOR UPDATE SKIP LOCKED;  -- Skip if another transaction is processing

-- Update waitlist status
UPDATE waitlist 
SET status = 'notified', 
    notification_sent_at = NOW()
WHERE waitlist_id = ?;

COMMIT;

-- Send notification outside transaction
```

**Key Point:** Use `FOR UPDATE SKIP LOCKED` to prevent multiple transactions from selecting the same waitlisted user.

**Race Condition 3: Approve Waitlist Users - Multiple Admins/Processes**

**Scenario:**
- Capacity increased by 2 spots
- Two separate processes/admins try to approve waitlist users simultaneously
- Could result in notifying more users than available spots

**Solution:**
```sql
BEGIN TRANSACTION;

-- Lock session row
SELECT capacity, enrolled_count FROM sessions 
WHERE session_id = ? 
FOR UPDATE;

-- Calculate available spots
available_spots = capacity - enrolled_count;

IF available_spots > 0 THEN
  -- Get and lock waitlisted users atomically
  SELECT * FROM waitlist 
  WHERE session_id = ? 
    AND status = 'pending'
  ORDER BY created_date_time ASC 
  LIMIT available_spots
  FOR UPDATE SKIP LOCKED;
  
  -- Update all selected users to 'notified'
  UPDATE waitlist 
  SET status = 'notified',
      notification_sent_at = NOW()
  WHERE waitlist_id IN (selected_ids);
  
  COMMIT;
  
  -- Send notifications outside transaction
ELSE
  ROLLBACK;
  RETURN "No spots available";
END IF;
```

**Race Condition 4: Enroll + Capacity Update Simultaneously**

**Scenario:**
- Admin increases capacity from 20 to 22 (triggers waitlist notification)
- At same time, regular user tries to enroll
- Could result in incorrect enrolled_count or missed waitlist notifications

**Solution:**
```sql
-- Use application-level distributed lock (Redis)
LOCK_KEY = "session_lock:{session_id}"

-- Acquire lock with timeout
IF ACQUIRE_LOCK(LOCK_KEY, timeout=5000ms) THEN
  BEGIN TRANSACTION;
  
  -- Perform capacity update or enrollment
  -- Process waitlist if needed
  
  COMMIT;
  RELEASE_LOCK(LOCK_KEY);
ELSE
  RETURN error: "Session is being updated, please retry";
END IF;
```

**Race Condition 5: Waitlist User Books While Another Spot Opens**

**Scenario:**
- User A on waitlist gets notified (1 spot available)
- While User A is booking, User B unenrolls (another spot opens)
- System tries to notify next waitlisted user (User C)
- But User A hasn't completed booking yet

**Solution:**
```sql
-- When notifying waitlist users, mark them as 'notified' immediately
-- Don't count 'notified' users as 'pending' for next notification

SELECT * FROM waitlist 
WHERE session_id = ? 
  AND status = 'pending'  -- Excludes 'notified' users
ORDER BY created_date_time ASC 
LIMIT 1;

-- Set expiry timeout (30 minutes)
-- Background job checks for expired 'notified' status
-- If expired without booking, reset to 'pending' and notify next user
```

**Race Condition 6: Payment Processing Race**

**Scenario:**
- User A and User B both notified for same spot (shouldn't happen, but edge case)
- Both start payment simultaneously
- Both payments could succeed

**Solution:**
```sql
-- Reserve spot during payment initiation
BEGIN TRANSACTION;

SELECT enrolled_count, capacity FROM sessions 
WHERE session_id = ? 
FOR UPDATE;

IF enrolled_count < capacity THEN
  -- Create temporary reservation
  INSERT INTO enrollment_reservations 
  (session_id, user_id, expires_at, status)
  VALUES (?, ?, NOW() + INTERVAL '5 minutes', 'reserved');
  
  -- Increment enrolled_count temporarily
  UPDATE sessions 
  SET enrolled_count = enrolled_count + 1 
  WHERE session_id = ?;
  
  COMMIT;
  
  -- Process payment
  payment_result = PROCESS_PAYMENT();
  
  IF payment_result.success THEN
    -- Convert reservation to actual enrollment
    UPDATE enrollment_reservations 
    SET status = 'confirmed';
    
    INSERT INTO enrollment (session_id, user_id, status)
    VALUES (?, ?, 'active');
  ELSE
    -- Release reservation
    DELETE FROM enrollment_reservations 
    WHERE reservation_id = ?;
    
    UPDATE sessions 
    SET enrolled_count = enrolled_count - 1 
    WHERE session_id = ?;
    
    -- Notify next waitlisted user
  END IF;
ELSE
  ROLLBACK;
  RETURN error: "Spot no longer available";
END IF;
```

#### Implementation Best Practices

**1. Database Transaction Isolation Level**
```sql
-- Use SERIALIZABLE or REPEATABLE READ isolation level
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

**2. Distributed Locking (Redis)**
```python
import redis
from contextlib import contextmanager

@contextmanager
def session_lock(session_id, timeout=5000):
    lock_key = f"session_lock:{session_id}"
    lock = redis_client.lock(lock_key, timeout=timeout)
    
    try:
        acquired = lock.acquire(blocking=True, blocking_timeout=5)
        if not acquired:
            raise Exception("Could not acquire lock")
        yield
    finally:
        lock.release()

# Usage
with session_lock(session_id):
    # Perform enrollment/unenrollment
    # Process waitlist
    pass
```

**3. Idempotency Keys**
```javascript
// Client sends idempotency key with booking request
POST /api/sessions/{sessionId}/enroll
Headers: {
  "Idempotency-Key": "unique-request-id-12345"
}

// Server checks if request already processed
if (await isRequestProcessed(idempotencyKey)) {
  return cachedResponse;
}

// Process request and cache response
const result = await processEnrollment();
await cacheResponse(idempotencyKey, result, ttl=24hours);
return result;
```

**4. Queue-Based Processing**
```javascript
// Instead of processing waitlist immediately, queue it
await enrollmentQueue.add({
  type: 'PROCESS_WAITLIST',
  sessionId: sessionId,
  spotsAvailable: 1,
  timestamp: Date.now()
});

// Worker processes queue sequentially
// Prevents concurrent waitlist processing
```

**5. Optimistic Locking with Retry**
```javascript
async function enrollWithRetry(sessionId, userId, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const session = await getSession(sessionId);
      
      if (session.enrolled_count >= session.capacity) {
        throw new Error('Session is full');
      }
      
      // Attempt update with version check
      const updated = await updateSession({
        sessionId,
        enrolledCount: session.enrolled_count + 1,
        version: session.version + 1,
        whereVersion: session.version
      });
      
      if (updated) {
        await createEnrollment(sessionId, userId);
        return { success: true };
      }
      
      // Version mismatch, retry
      await sleep(100 * Math.pow(2, attempt)); // Exponential backoff
      
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
    }
  }
  
  throw new Error('Failed to enroll after retries');
}
```

#### Monitoring Race Conditions

**Metrics to Track:**
- Enrollment conflicts per hour (optimistic lock failures)
- Lock acquisition timeouts
- Duplicate waitlist notifications (should be 0)
- Capacity exceeded errors (should be 0)
- Payment reservation expirations

**Alerts:**
- Alert if capacity exceeded detected
- Alert if same user notified multiple times for same session
- Alert if lock acquisition failures > 10 per minute
- Alert if enrollment conflicts > 50 per hour

---


## 9. Admin Dashboard Features

### 9.1 Waitlist Management View

**Dashboard Components:**
- Real-time waitlist status per session
- Automated notification history
- Booking conversion metrics
- Failed notification alerts

**Key Metrics Displayed:**
- Total waitlisted users per session
- Notifications sent today/this week
- Booking conversion rate from waitlist
- Average time from notification to booking
- Failed notifications requiring attention

### 9.2 Manual Intervention Options

**Admin Actions:**
- View waitlist queue with FCFS order
- Manually trigger notification to specific user
- Override FCFS order (with audit log)
- Cancel waitlist entry
- Adjust notification timeout settings

**Audit Trail:**
- All automated actions logged with timestamp
- Manual interventions tracked with admin user ID
- Notification delivery status history
- Booking confirmation timeline

---

## 10. Performance Optimization

### 10.1 Database Optimization
- Index on `waitlist.created_date_time` for FCFS queries
- Composite index on `(session_id, status, created_date_time)`
- Index on `waitlist.session_id` for session-specific queries
- Optimize query execution plans
- Implement connection pooling

### 10.2 Caching Strategy
- Cache session capacity and enrolled count (Redis)
- Cache waitlist counts per session
- Invalidate cache on enrollment/capacity updates
- Cache user notification preferences

### 10.3 Asynchronous Processing
- Queue-based notification system (RabbitMQ, AWS SQS)
- Background job for expired waitlist cleanup (runs every 5 minutes)
- Async email/push sending with status tracking
- Batch processing for multiple notifications

### 10.4 Scalability Considerations
- Horizontal scaling for notification service
- Database read replicas for reporting queries
- Message queue for high-volume notifications
- CDN for deep link landing pages

---


## 11. Testing Strategy

### 11.1 Unit Tests
- Waitlist FCFS ordering logic
- Capacity calculation accuracy
- Email/push notification template rendering
- Error handling paths
- Race condition scenarios

### 11.2 Integration Tests
- End-to-end unenrollment flow with notification
- Capacity update with batch waitlist processing
- Email and push notification service integration
- Database transaction rollback scenarios
- Payment gateway integration (paid classes)

### 11.3 Test Scenarios

**Test Case 1: Single User Drop**
- Given: Session at full capacity (20/20) with 3 waitlisted users
- When: One user drops from session
- Then: First waitlisted user (earliest created_date_time) receives notification
- Verify: Email and push notification sent successfully

**Test Case 2: Capacity Increase by 3**
- Given: Session at capacity (20/20) with 5 waitlisted users
- When: Admin increases capacity to 23
- Then: Top 3 waitlisted users receive notifications simultaneously
- Verify: All 3 users notified in correct FCFS order

**Test Case 3: Concurrent Booking Attempts**
- Given: 1 spot available, 3 users notified
- When: All 3 users attempt to book simultaneously
- Then: First to complete booking gets spot, others receive "spot filled" message
- Verify: Only 1 booking confirmed, others remain on waitlist

**Test Case 4: Payment Timeout**
- Given: User receives notification for paid class
- When: User starts payment but doesn't complete within 5 minutes
- Then: Spot released, next waitlisted user notified
- Verify: Original user receives timeout message

**Test Case 5: Notification Failure Retry**
- Given: Email service temporarily unavailable
- When: Notification triggered
- Then: System retries 3 times with exponential backoff
- Verify: Notification eventually sent or admin alerted

**Test Case 6: No Waitlisted Users**
- Given: Session with no waitlist entries
- When: User drops from session
- Then: Unenrollment completes without notification
- Verify: No errors, spot remains available

### 11.4 Load Tests
- 100 concurrent unenrollment requests
- 50 simultaneous capacity updates
- 1000 waitlist notifications sent in 1 minute
- Database query performance under load
- API response times with high traffic

---


## 12. Security Considerations

### 12.1 Access Control
- Restrict capacity updates to admin/coach roles only
- Validate user permissions for unenrollment actions
- Implement audit logging for all administrative actions
- Rate limiting on booking confirmation API

### 12.2 Data Privacy
- Encrypt email addresses and phone numbers in database
- Mask PII in application logs
- Comply with GDPR/data protection regulations
- Secure deep link tokens with expiration

### 12.3 Token Security
- Generate unique, time-limited tokens for booking links
- Validate token authenticity before allowing booking
- Prevent token reuse after booking or expiration
- Use HTTPS for all API communications

### 12.4 Rate Limiting
- Prevent abuse of unenrollment API (max 5 per user per hour)
- Limit capacity update frequency (max 10 per session per day)
- Throttle notification sending to prevent spam
- Implement CAPTCHA for suspicious booking patterns

---

## 13. Monitoring & Logging

### 13.1 Key Metrics
- Waitlist notification success rate (target: >99%)
- Average notification delivery time (target: <30 seconds)
- Booking conversion rate from waitlist (track weekly)
- Failed notification count (alert if >5 per hour)
- Capacity change frequency per session
- Average time from notification to booking

### 13.2 Logging Requirements
- All unenrollment actions with timestamp and reason
- Capacity changes with admin details and justification
- Waitlist notification attempts and delivery status
- Email/push notification delivery confirmations
- Booking confirmation events
- Error logs with stack traces and context

### 13.3 Alerts & Notifications
- Failed notification threshold exceeded (>5 failures in 1 hour)
- Email/push service downtime detected
- Database transaction failures
- Unusual waitlist processing delays (>2 minutes)
- Payment gateway errors for paid classes
- Concurrent booking conflicts (>10 per hour)

### 13.4 Dashboard Analytics
- Daily/weekly waitlist activity reports
- Notification delivery success trends
- Booking conversion funnel analysis
- Peak usage times for capacity planning
- User engagement metrics (notification open rates)

---


## 14. Deployment Plan

### 14.1 Rollout Strategy

**Phase 1: Development & Testing (Week 1-2)**
- Implement core functionality
- Unit and integration testing
- Internal QA testing

**Phase 2: Staging Deployment (Week 3)**
- Deploy to staging environment
- Load testing and performance optimization
- Security audit and penetration testing

**Phase 3: Pilot Launch (Week 4)**
- Enable for 2-3 selected sessions
- Monitor metrics closely
- Gather user feedback
- Fix any critical issues

**Phase 4: Gradual Rollout (Week 5-6)**
- Enable for 25% of sessions
- Monitor performance and user adoption
- Adjust notification timing based on data
- Enable for 50% of sessions
- Continue monitoring and optimization

**Phase 5: Full Production (Week 7)**
- Enable for all sessions
- Full monitoring and alerting active
- Admin training completed
- User documentation published

### 14.2 Rollback Strategy
- Feature flag for instant disable of automated notifications
- Database migration rollback scripts prepared
- Manual notification fallback process documented
- Admin override capabilities for emergency situations

### 14.3 Configuration Settings

**Configurable Parameters:**
- Notification timeout window (default: 30 minutes)
- Retry attempts for failed notifications (default: 3)
- Retry intervals (default: 1min, 5min, 15min)
- Payment processing timeout (default: 5 minutes)
- Expired waitlist cleanup frequency (default: every 5 minutes)
- Maximum notifications per batch (default: 10)

**Environment Variables:**
```
WAITLIST_NOTIFICATION_TIMEOUT=30
NOTIFICATION_RETRY_ATTEMPTS=3
PAYMENT_TIMEOUT_MINUTES=5
EMAIL_SERVICE_API_KEY=xxx
PUSH_NOTIFICATION_API_KEY=xxx
DEEP_LINK_BASE_URL=app://booking
```

---


## 15. Success Criteria

### 15.1 Functional Requirements
✓ Waitlist notifications sent within 2 minutes of spot availability  
✓ 100% FCFS ordering accuracy based on `created_date_time`  
✓ 99%+ email and push notification delivery success rate  
✓ Zero data loss during concurrent operations  
✓ Correct handling of both paid and free class booking flows  
✓ Accurate "spot filled" notifications to other waitlisted users  

### 15.2 Non-Functional Requirements
✓ API response time < 500ms for booking confirmation  
✓ Support 1000+ concurrent users during peak times  
✓ 99.9% system uptime  
✓ Complete audit trail for all automated actions  
✓ Mobile app deep linking works on iOS and Android  
✓ Payment processing completes within 5 minutes  

### 15.3 Business Metrics
✓ 80%+ reduction in manual admin intervention  
✓ 60%+ booking conversion rate from waitlist notifications  
✓ Average notification-to-booking time < 15 minutes  
✓ 90%+ user satisfaction with automated system  
✓ Reduced no-show rate by 30%  

---

## 16. Future Enhancements

### 16.1 Potential Features
- **SMS Notifications** - Add SMS as additional notification channel
- **Priority Waitlist Tiers** - VIP/premium member priority
- **Automated Booking** - Auto-book for users who opt-in
- **Waitlist Position Tracking** - Real-time position updates in app
- **Predictive Analytics** - Forecast waitlist conversion rates
- **Multi-session Waitlist** - Join waitlist for multiple time slots
- **Waitlist Preferences** - User-defined notification preferences
- **Social Sharing** - Share waitlist availability with friends

### 16.2 Scalability Improvements
- Microservices architecture for notification service
- Event-driven architecture with message streaming
- Real-time waitlist updates via WebSocket
- Multi-region deployment for global availability
- AI-powered notification timing optimization

---

## 17. Glossary

- **FCFS**: First-Come-First-Served ordering based on waitlist registration time (`created_date_time`)
- **Capacity Increase**: Difference between new and old session capacity
- **Waitlist Status**: 
  - `pending` - Awaiting notification
  - `notified` - Email/push sent, awaiting booking
  - `expired` - Booking window passed without confirmation
  - `booked` - Successfully confirmed booking
  - `cancelled` - Session cancelled or user removed
- **Enrollment Status**: 
  - `active` - Currently enrolled in session
  - `dropped` - User-initiated unenrollment
  - `cancelled` - Admin-initiated unenrollment
- **Deep Link**: Mobile app URL that opens specific screen (booking page)
- **Booking Window**: Time period user has to confirm booking after notification

---

**Document Version:** 1.0  
**Last Updated:** January 19, 2026  
**Author:** Product & Technical Team  
**Review Status:** Ready for Implementation  
**Approved By:** [Pending]

---

## Appendix A: Sequence Diagrams

### A.1 Unenrollment Flow
```
User → API: POST /unenroll
API → Database: Update enrollment status
API → Database: Query waitlist (FCFS)
API → Notification Service: Send email + push
Notification Service → Waitlisted User: Notification with deep link
API → User: Success response
```

### A.2 Capacity Increase Flow
```
Admin → API: PUT /capacity (increase by 2)
API → Database: Update session capacity
API → Database: Query top 2 waitlist users (FCFS)
API → Notification Service: Batch send notifications
Notification Service → User A: Notification
Notification Service → User B: Notification
API → Admin: Success with notification count
```

### A.3 Booking Confirmation Flow
```
User → App: Click notification deep link
App → API: GET /session/{id}
API → App: Session details
User → App: Tap "Confirm & Pay" or "Confirm Booking"
App → API: POST /confirm-booking
API → Database: Check availability (atomic)
API → Payment Gateway: Process payment (if paid class)
Payment Gateway → API: Payment success
API → Database: Create enrollment
API → Notification Service: Send confirmation
API → Notification Service: Send "spot filled" to others
API → App: Booking confirmed
```

---

**End of Technical Implementation Section**
