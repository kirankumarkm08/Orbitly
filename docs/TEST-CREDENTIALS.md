# Test Credentials

Test accounts for each niche in the Orbitly platform.

## Quick Login

Use these credentials to test different user roles across niches.

---

## 👑 Super Admin (Platform Level)

| Field | Value |
|-------|-------|
| Email | `admin@orbitly.com` |
| Password | `OrbitlyAdmin2024!` |

**Access:** All tenants, platform settings, user management

---

## 🏗️ Static Niche (Portfolio/Agency)

### Tenant Admin

| Field | Value |
|-------|-------|
| Email | `static-admin@orbitly.test` |
| Password | `StaticPass2024!` |
| Tenant | Static Portfolio Co |
| Domain | `static-portfolio.localhost` |

### Regular User

| Field | Value |
|-------|-------|
| Email | `static-user@orbitly.test` |
| Password | `StaticUser2024!` |
| Tenant | Static Portfolio Co |

---

## 🛒 E-commerce Niche

### Tenant Admin

| Field | Value |
|-------|-------|
| Email | `ecom-admin@orbitly.test` |
| Password | `EcomPass2024!` |
| Tenant | E-com Store |
| Domain | `ecommerce.localhost` |

### Regular User (Customer)

| Field | Value |
|-------|-------|
| Email | `ecom-user@orbitly.test` |
| Password | `EcomUser2024!` |
| Tenant | E-com Store |

---

## 🎫 Event Management Niche

### Tenant Admin

| Field | Value |
|-------|-------|
| Email | `events-admin@orbitly.test` |
| Password | `EventsPass2024!` |
| Tenant | Events Corp |
| Domain | `events.localhost` |

### Regular User

| Field | Value |
|-------|-------|
| Email | `events-user@orbitly.test` |
| Password | `EventsUser2024!` |
| Tenant | Events Corp |

---

## 🚀 Launchpad Niche

### Tenant Admin

| Field | Value |
|-------|-------|
| Email | `launchpad-admin@orbitly.test` |
| Password | `LaunchPad2024!` |
| Tenant | LaunchPad Inc |
| Domain | `launchpad.localhost` |

### Waitlist User

| Field | Value |
|-------|-------|
| Email | `launchpad-user@orbitly.test` |
| Password | `LaunchUser2024!` |
| Tenant | LaunchPad Inc |

---

## Test URLs

| Niche | Frontend URL |
|-------|--------------|
| Static | http://localhost:3000/demo/launchpad |
| E-commerce | http://localhost:3000/store |
| Events | http://localhost:3000/events |
| Launchpad | http://localhost:3000/demo/launchpad |

| Role | API Endpoint |
|------|--------------|
| Login | POST `/api/auth/login` |
| Me | GET `/api/auth/me` |

---

## API Testing Example

```bash
# Login as Super Admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@orbitly.com","password":"OrbitlyAdmin2024!"}'

# Login as E-commerce Admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ecom-admin@orbitly.test","password":"EcomPass2024!"}'

# Use token for authenticated requests
curl http://localhost:5000/api/pages \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Creating Test Data

Run the seed script to populate test data:

```bash
cd backend
npx ts-node src/seed-test-data.ts
```

Or manually via Supabase SQL:

```sql
-- Create tenants for each niche
INSERT INTO tenants (name, domain, niche, settings) VALUES
('Static Portfolio Co', 'static-portfolio', 'static', '{}'),
('E-com Store', 'ecommerce-store', 'ecommerce', '{}'),
('Events Corp', 'events-corp', 'events', '{}'),
('LaunchPad Inc', 'launchpad-inc', 'launchpad', '{}');
```

---

## Password Requirements

- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

---

## Notes

- These are **test credentials** for development only
- Change passwords in production
- Emails use `.test` TLD (reserved for testing)
- Domains use `.localhost` for local testing
