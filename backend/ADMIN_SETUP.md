# Super Admin Setup Guide

## Quick Start

### 1. Set Environment Variables (Optional)

Create or update your `.env` file:

```env
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=your-secure-password
```

If not set, defaults will be used:
- Email: `admin@example.com`
- Password: `admin123456`

### 2. Run Setup Script

```bash
cd backend
npx ts-node src/setup-admin.ts
```

This will create:
- ✅ A default tenant
- ✅ A super admin user
- ✅ Link the user to the tenant

### 3. Login

Use the credentials from the setup output to login at `/login`.

---

## Super Admin API Endpoints

All endpoints require `Authorization: Bearer <token>` header and `super_admin` role.

### Tenant Management

```http
GET    /api/admin/tenants              # List all tenants
POST   /api/admin/tenants              # Create new tenant
DELETE /api/admin/tenants/:tenantId    # Delete tenant
```

**Create Tenant Example:**
```json
POST /api/admin/tenants
{
  "name": "Acme Corp",
  "domain": "acme",
  "settings": {}
}
```

### User Management

```http
GET    /api/admin/users                        # List all users
POST   /api/admin/users/:userId/assign-tenant  # Assign user to tenant
PATCH  /api/admin/users/:userId/role           # Update user role
```

**Assign Tenant Example:**
```json
POST /api/admin/users/123-456-789/assign-tenant
{
  "tenant_id": "abc-def-ghi"
}
```

**Update Role Example:**
```json
PATCH /api/admin/users/123-456-789/role
{
  "role": "admin"
}
```

**Valid Roles:**
- `user` - Regular user
- `admin` - Tenant admin
- `super_admin` - Platform super admin

---

## Troubleshooting

### "No tenant associated with this user"

This happens when a user exists but isn't linked to a tenant.

**Solution:**
1. Login as super admin
2. Call `POST /api/admin/users/:userId/assign-tenant` with the user's ID and a tenant ID

### Creating Additional Tenants

```bash
# Login as super admin first, then:
curl -X POST http://localhost:3001/api/admin/tenants \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Company", "domain": "newco"}'
```

### Promoting a User to Admin

```bash
curl -X PATCH http://localhost:3001/api/admin/users/USER_ID/role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

---

## Database Schema Requirements

Make sure your `users` table has these columns:
- `id` (uuid, primary key)
- `email` (text)
- `full_name` (text)
- `role` (text) - should allow: 'user', 'admin', 'super_admin'
- `tenant_id` (uuid, foreign key to tenants)

If the `role` column doesn't exist, add it:

```sql
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
```
