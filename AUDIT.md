# Backend Audit — intertex-backend

---

## CRITICAL

### 1. `src/modules/admin/admin.controller.ts:31-35` — Chicken-and-egg admin creation
`POST /admin/create` is guarded by `AdminAuthGuard`, requiring an admin token to create the first admin. The `createSuperAdmin()` call is commented out in `main.ts`. **No way to create the first admin without database manipulation.**

### 2. `src/modules/type/type.controller.ts:52-69` — GET endpoints perform writes
`GET /types/update-total-products` and `GET /types/update-total-sold` trigger database mutations. GET requests must be idempotent and safe. Browsers, crawlers, and prefetch can trigger these accidentally. Also, the second endpoint catches all errors and returns 200 with error in body — error swallowing.

### 3. `src/modules/order/order.controller.ts:51-55` — Order ownership enforcement is dead code
`ordersService.update(id, updateOrderDto)` is called **without** passing `currentUser`. The ownership check `if (currentUser && ...)` on line 97 of `order.service.ts` **never runs** because `currentUser` is always `undefined`. Any authenticated user can update any order.

### 4. `src/modules/user/user.service.ts:36` — Hardcoded personal email
```ts
const exceptionEmail = 'pshubomi@gmail.com'
```
Hardcoded personal email in production code. Used in `deleteAllUsers()` and `generateFakeUsers()` — debug utilities that should not exist in production.

### 5. `package.json:27` — Wildcard dependency
```json
"@nestjs/mapped-types": "*"
```
Will resolve to ANY version including major breaking changes. Must be pinned.

---

## HIGH

### 6. `src/modules/auth/guard/any-auth.guard.ts:20` — Missing cookie fallback
Unlike `AuthGuard` and `AdminAuthGuard`, this guard only checks the `Authorization` header. Any client using cookie-based auth will be rejected.

### 7. `src/schemas/order.ts` — Missing payment reference field
No `paymentReference` or `reference` field on Order schema. Paystack integration creates transactions but cannot link them to orders.

### 8. `src/modules/order/order.controller.ts:45-49` — Missing ownership check on GET order
`GET /orders/:id` — any authenticated user can see any order by ID via direct ID enumeration.

### 9. `src/modules/order/order.service.ts:19-29` — No stock validation
Order creation never checks `inStock` (size-quantity). Overselling is possible.

### 10. `src/modules/order/order.service.ts:19-50` — No atomicity
Between `order.save()` and `cartService.removeItem()`, a crash leaves items in cart. Should use Mongoose transactions.

### 11. `src/modules/product/product.service.ts:186-190` — Images append instead of replace
`otherImages` from the update body always **appends** to existing images rather than replacing them. If client sends `otherImages: ["new.jpg"]`, expecting to replace, it gets appended to existing list. Only way to remove is via `deleteImages` array — unintuitive contract.

### 12. `src/modules/admin/admin.service.ts:275-293` — Audience filtering broken
Email campaign audience parameter (`'all-subscribers'`, `'all-users'`, `'customers'`) is completely ignored. ALL cases call `this.userService.findAll()` — everyone gets every email. No pagination — loads all users into memory.

### 13. `src/modules/blog/blog.service.ts:49-53` — Undefined imageCover overwrites existing cover
When `imageCover` is not provided in update, the spread `{ ...updatePostDto, imageCover }` sets `imageCover: undefined`, which Mongoose interprets as "set to null", deleting the existing cover image.

### 14. `src/modules/type/type.service.ts:113-120` — totalSold accumulation bug
`totalSold` is declared once outside the type loop. Each type's total includes ALL previous types' counts. Type B shows Type A + Type B sales.

### 15. `src/modules/platform-login/platform-login.service.ts:19-21` — Legacy Google token verification
Uses `https://oauth2.googleapis.com/tokeninfo?id_token=${token}` — legacy, rate-limited, debug endpoint. **No `aud` (audience) verification** — a Google ID token issued for ANY app can authenticate here.

### 16. `src/common/middleware/csrf.middleware.ts:39` — Subdomain check vulnerable
```ts
parsed.hostname.endsWith('.intertexng.shop')
```
`evil.com/.intertexng.shop` or `fake.intertexng.shop.attacker.com` would match. Should use `===` or stricter domain parsing.

### 17. `src/modules/paystack/paystack.controller.ts` — Missing webhook endpoint
No Paystack webhook URL for async transaction notifications (success/failure). The payment flow relies entirely on frontend redirect callback, which is unreliable.

### 18. Feedback schema — No create endpoint
`Feedback` schema exists with `GET /admin/feedback` to read all feedback, but **no POST endpoint** exists to create feedback. Users cannot submit feedback.

### 19. `src/modules/user/user.service.ts:45-77` — generateFakeUsers writes plaintext passwords
Writes `fake-users.json` with plaintext passwords to `__dirname + '/../../fake-users.json'` using synchronous `writeFileSync`. In production, this exposes credentials.

### 20. `src/modules/platform-login/platform-login.controller.ts:12` — Disables global validation pipe
```ts
new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false })
```
Bypasses the global `whitelist: true, forbidNonWhitelisted: true` validation, allowing arbitrary fields in Google login requests.

---

## MEDIUM

### 21. `src/modules/auth/auth.controller.ts:86-100` — sameSite: 'none' with secure: false in dev
Browsers reject `SameSite=None` cookies that aren't also `Secure`. In development (`NODE_ENV !== 'production'`), `secure` is false. Should use `secure: process.env.NODE_ENV === 'production' ? true : undefined` or set sameSite dynamically.

### 22. `src/modules/auth/auth.service.ts:94-99` — Refresh token falls back to JWT secret
If `JWT_REFRESH_SECRET` is not configured, falls back to `jwt.secret`. Anyone with the access token secret can forge refresh tokens. Same pattern at lines 111-113.

### 23. `src/modules/auth/auth.service.ts:127` — OTP saved before email sent
If `EmailService.sendPasswordResetOtp()` throws, the OTP is already saved but the user never receives it. Save should happen after successful email send, or failed send should roll back the OTP.

### 24. `src/modules/auth/auth.module.ts:21` + `admin.module.ts:25` — Duplicate EmailService instances
`EmailService` is provided in both modules, creating two separate instances with their own nodemailer transporters. Should be exported from a shared module.

### 25. `src/schemas/user.schema.ts:25-26` — Email has index but not unique
```ts
email: { type: String, index: true }
```
Should be `{ type: String, unique: true, index: true }`. Duplicate emails are only prevented by application-level code.

### 26. `src/schemas/subcategory.schema.ts:14` — Slug not unique
Unlike `Category.slug` and `Product.slug` which are unique, subcategory slugs can collide.

### 27. `src/schemas/type.schema.ts:14` — Slug not unique
Same issue — type slugs can collide.

### 28. `src/schemas/type.schema.ts:25-30` — No index on subcategory reference
`subcategory` field is frequently queried but lacks `index: true`.

### 29. `src/schemas/blog.schema.ts:18` — Slug not unique
Blog slugs can collide, leading to wrong post retrieval.

### 30. `src/configs/aws-s3.config.ts:5-6` — Hardcoded fallback values
Region defaults to `'eu-north-1'`, bucket to `'intertex-storage'` instead of using ConfigService. Reads `process.env` directly.

### 31. `src/configs/aws-s3.config.ts:28` — ACL public-read
All uploaded files are publicly readable. Expected for product images but worth auditing.

### 32. `src/configs/env.config.ts:27` — Paystack key fallback
```ts
process.env.PAYSTACK_SECRET_KEY || process.env.TEST_PAYSTACK_SECRET_KEY
```
If live key is empty, silently uses test key in production. Environments should be explicit.

### 33. `src/main.ts` — MongooseExceptionFilter never registered
Filter at `src/common/decorators/mongoose-exception.decorator.ts` handles CastError for invalid ObjectIds but is never applied. CastErrors return 500 instead of 400.

### 34. `src/modules/product/product.controller.ts:87-111` — No validation on search params
`keyword`, `sort`, `minPrice`, `maxPrice`, `page`, `limit` — all passed as raw strings. No DTO validation. `minPrice=abc` causes unexpected behavior.

### 35. `src/modules/product/product.service.ts:28-37` — Duplicate S3 client
A separate `new AWS.S3()` is created here, duplicating the one from `aws-s3.config.ts`. Two S3 client instances with different configuration paths.

### 36. `src/modules/cart/cart.controller.ts:40-48` — Size in URL path breaks routing
`DELETE /cart/:productId/:size` — sizes like "10/12" or "L/XL" break URL path parsing. Should be query parameter or body.

### 37. `src/modules/billing-information/billing-information.controller.ts:35-51` — PUT and PATCH identical
Both routes call the same `update()` method. PUT should be full replacement, PATCH partial. Currently both do the same thing.

### 38. `src/modules/platform-login/platform-login.controller.ts:17-30` — Duplicated cookie logic
Cookie-setting code duplicates `AuthController.setAuthCookies()`. Changes to cookie config must be made in two places.

### 39. `src/modules/user/user.module.ts:12-18` — Duplicate JwtModule
`UserModule` registers its own `JwtModule`, but `AuthModule` (which is `@Global()`) already registers and exports one. Two JwtModule instances in the DI container.

### 40. `src/common/decorators/mongoose-exception.decorator.ts` — Dead code
Misnamed file (says "decorator" but exports a filter). Filter is never registered anywhere.

### 41. `src/common/utils/email.service.ts:64-66` — Email failures propagate as 500
Failed email sends throw, returning 500 to the client even when the operation (e.g., OTP save) succeeded. Should catch and log, but return appropriate response.

### 42. `src/modules/paystack/paystack.service.ts:20-31` — Silent mock response
When Paystack is not configured, returns a 200 OK with `{ status: false, authorization_url: null }`. Client thinks initialization succeeded but gets null URL. Should throw, not silently mock.

### 43. `tsconfig.json:15-17` — Relaxed strictness
`strictNullChecks: false`, `noImplicitAny: false`, `strictBindCallApply: false` — disable useful TypeScript safety nets.

### 44. `package.json` — Missing type packages
`@types/bcryptjs` and `@types/nodemailer` not in devDependencies. Compiles because `noImplicitAny: false`, but IDE support degraded.

### 45. `src/modules/auth/dto/register.dto.ts` — Entire file unused
The `RegisterDto` class exists but is never imported or used. The `register` endpoint uses `CreateUserDto` instead.

### 46. `src/modules/health/health.service.ts` — Unused service class
`HealthService` exists but is never provided in any module or used anywhere.

### 47. `src/app.module.ts:68-70` — CSRF middleware runs on every route
While it skips GET/HEAD internally, it still processes every request. Should only apply to mutation routes.

### 48. `src/modules/order/order.ts:51` — Limited order status enum
Only `pending`, `successful`, `cancelled`. Missing `processing`, `shipped`, `delivered`, `refunded`.

### 49. `src/modules/order/order.service.ts` — No stock decrement on order
Inventory levels are never reduced when an order is placed.

### 50. `src/modules/paystack/paystack.service.ts:16-19` — Hardcoded callback URL
Falls back to `'https://intertex.vercel.app/payment-success'` if `PAYSTACK_CALLBACK_URL` not configured.

---

## LOW

### 51. `src/modules/auth/guard/auth.guard.ts:35-42` + `admin.guard.ts:37-43` — Dead catch code
Conditions `error instanceof UnauthorizedException || error instanceof ForbiddenException` can never be true — `jwtService.verifyAsync()` throws `JsonWebTokenError`/`TokenExpiredError`, not NestJS HTTP exceptions.

### 52. `src/modules/auth/auth.controller.ts:132-138` — Redundant endpoint
`POST /reset-password/:token` duplicates `POST /reset-password` with identical logic. Token in URL vs body — same result.

### 53. `src/modules/auth/auth.service.ts:60-78` — Misleading return type
`validateUser()` typed as `SignInPayload | null` but throws `NotFoundException` instead of returning `null` for missing users.

### 54. `src/modules/auth/dto/login.dto.ts` — Missing lowercase transform
Unlike `CreateUserDto` which has `@Transform(({value}) => value.toLowerCase())` on email, `LoginDto` doesn't. Service handles it manually, so it works, but inconsistent.

### 55. `src/schemas/user.schema.ts:47` — isActive defaults to false
New users start as inactive. No activation/verification flow exists.

### 56. `src/common/filters/global-exception.filter.ts:18-22` — May leak error details
Returns raw HttpException response which could include sensitive data if custom exceptions contain extra metadata.

### 57. `src/modules/cart/cart.service.ts:72-76` — Overly defensive code
`(i.product._id?.toString?.() || i.product.toString?.())` — multiple optional chaining chains that mask potential bugs.

### 58. `src/modules/product/product.controller.ts:186-197` — Misleading parameter names
Route param `:catSlug` destructured as `categoryId` — it's a slug, not an ID.

### 59. `src/modules/blog/blog.controller.ts:6` — Unnecessary import alias
`import { Post as HttpPost }` — no naming conflict in this file.

### 60. `src/modules/subcategory/subcategory.controller.ts:37` — Uses PUT instead of PATCH
Inconsistent with rest of codebase (Category, Type, Product all use PATCH).

### 61. `package.json:37` — Redundant dotenv dependency
`@nestjs/config` already includes dotenv internally.

### 62. Feedback schema — GET endpoint exists but no POST to create

---

## CROSS-CUTTING

### Security
- **No password complexity validation** beyond minimum length
- **No account lockout** after failed login attempts
- **JWT secret fallback chain** — refresh/reset secrets fall back to main JWT secret
- **No input sanitization** on stored user-provided strings
- **No HTTPS enforcement** in dev — `sameSite: 'none'` with `secure: false`

### Architecture
- **No database transactions** — all multi-step operations lack atomicity
- **No event-driven/queue system** for async ops (email, inventory, payments)
- **`console.log`/`console.error`** used in several services instead of NestJS `Logger`
- **Circular dependency** between TypeModule and ProductModule (handled with `forwardRef`)

### Missing Features
- **No email verification flow** — users created but no activation mechanism
- **No stock decrement** on order creation
- **No Paystack webhook** for async payment notifications
- **No feedback creation endpoint** despite schema + admin read endpoint
