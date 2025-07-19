# FIDES Mentorship System - Database Optimization

## Pagination Implementation

### 1. **Sessions Pagination**
- Endpoint: `GET /api/sessions?page=1&limit=10`
- Optimized with parallel queries for count and data
- Includes feedback data in response
- Default: 10 items per page

### 2. **Mentors Pagination**
- Endpoint: `GET /api/users/mentors?page=1&limit=10&expertise=javascript`
- Supports filtering by expertise
- Calculates average rating from feedback
- Includes total sessions count
- Default: 10 items per page

### 3. **Pagination Response Format**
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Database Indexes

### 1. **User Table Indexes**
- `email` - For authentication queries
- `role` - For filtering mentors/mentees
- `isActive` - For active user queries
- `createdAt` - For sorting

### 2. **MentorshipSession Table Indexes**
- `mentorId` - For mentor's sessions
- `menteeId` - For mentee's sessions
- `scheduledAt` - For date-based queries
- `status` - For filtering by status
- `createdAt` - For sorting

### 3. **MentorshipRequest Table Indexes**
- `menteeId` - For mentee's requests
- `mentorId` - For mentor's requests
- `status` - For filtering by status
- `createdAt` - For sorting

### 4. **Other Optimized Tables**
- Notification: Indexed on `senderId`, `sessionId`
- UserNotification: Composite index on `[userId, notificationId]`
- Availability: Indexed on `userId`
- SessionFeedback: Indexed on `sessionId`

## Query Optimization Techniques

### 1. **Parallel Queries**
Using `Promise.all()` for simultaneous count and data queries:
```typescript
const [data, total] = await Promise.all([
  this.prisma.model.findMany({ ... }),
  this.prisma.model.count({ where }),
]);
```

### 2. **Selective Field Loading**
Only loading necessary fields:
```typescript
select: {
  id: true,
  firstName: true,
  lastName: true,
  // Only fields needed for the response
}
```

### 3. **Efficient Aggregations**
Using Prisma's `_count` for aggregations:
```typescript
_count: {
  select: {
    mentorSessions: {
      where: { status: 'COMPLETED' }
    }
  }
}
```

### 4. **Cursor-based Pagination (Future Enhancement)**
For very large datasets, consider implementing cursor-based pagination:
```typescript
findMany({
  take: 10,
  skip: 1,
  cursor: { id: lastId },
  orderBy: { id: 'asc' }
})
```

## Performance Monitoring

### 1. **Query Logging**
Enable Prisma query logging in development:
```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### 2. **Database Metrics to Monitor**
- Query execution time
- Number of queries per request
- Slow query identification
- Index usage statistics

### 3. **Optimization Checklist**
- [ ] All foreign keys have indexes
- [ ] Frequently filtered columns are indexed
- [ ] Composite indexes for multi-column queries
- [ ] Regular ANALYZE operations
- [ ] Query plan reviews for complex queries

## Migration Commands

To apply the new indexes:
```bash
npx prisma migrate dev --name add_performance_indexes
```

## Best Practices

1. **Index Maintenance**
   - Review index usage monthly
   - Remove unused indexes
   - Add indexes for new query patterns

2. **Query Patterns**
   - Use pagination for all list endpoints
   - Implement query result caching
   - Batch similar queries when possible

3. **Data Growth Considerations**
   - Plan for table partitioning at scale
   - Consider read replicas for heavy read operations
   - Implement data archiving strategy

4. **Connection Pooling**
   - Configure appropriate connection pool size
   - Monitor connection usage
   - Implement connection retry logic