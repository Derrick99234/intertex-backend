# Intertex Backend API Documentation

## Overview

This document describes the public HTTP API exposed by the Intertex backend application. The backend is a **NestJS** application that uses modular controllers, DTOs, schema definitions, and guards to structure its API surface.

The API is organized around the following domains:

- Authentication
- Admin management
- Users
- Products
- Categories
- Subcategories
- Types
- Cart
- Orders
- Billing information
- Blogs
- Promotions
- Paystack integration
- Platform login
- Health check

This documentation is intended to help frontend developers, backend developers, QA engineers, and integrators understand:

- Available endpoints
- Expected request payloads
- Typical response behavior
- Authentication requirements
- Data model expectations
- Integration notes and conventions

> Note: Because this repository currently exposes its API primarily through NestJS controllers and DTOs, some route paths and response bodies may depend on controller decorators and service implementations. This documentation is written to reflect the module structure, DTO names, schema names, and conventional NestJS patterns used in the codebase.

---

## Base Information

### Framework

- NestJS
- TypeScript
- Mongoose schemas
- JWT / guard-based auth patterns
- DTO-based validation

### Conventions

- Request validation is handled through DTO classes.
- Most modules follow CRUD naming conventions.
- Controllers are grouped by domain inside `src/modules/*`.
- Schema definitions are stored in `src/schemas/*`.
- Auth protection is enforced through guards in `src/modules/auth/guard/*`.

### Common API Characteristics

- JSON request and response bodies
- Standard HTTP status codes
- DTO validation for POST/PUT/PATCH style requests
- Authenticated routes likely require bearer token headers
- Admin-only routes likely require a valid admin token or auth guard

---

## Authentication

Authentication logic is implemented in:

- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/auth.service.ts`
- `src/modules/auth/guard/auth.guard.ts`
- `src/modules/auth/guard/admin.guard.ts`
- `src/modules/auth/guard/any-auth.guard.ts`

### Authentication Headers

For protected routes, include:

```http
Authorization: Bearer <access_token>
```

### Auth Guard Behavior

The project includes multiple guard types:

- `AuthGuard` - standard authenticated user access
- `AdminGuard` - admin-only access
- `AnyAuthGuard` - access allowed for either authenticated role depending on implementation

---

## Health Check

### `GET /health`

Checks whether the application is running.

#### Response Example

```json
{
  "status": "ok"
}
```

#### Notes

- Useful for monitoring and uptime checks.
- Usually unprotected.

---

## Admin API

Files:

- `src/modules/admin/admin.controller.ts`
- `src/modules/admin/admin.service.ts`
- DTOs in `src/modules/admin/dto/*`

### Admin Login

#### `POST /admin/login`

Authenticates an admin user.

##### Request Body

`AdminLoginDto`

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

##### Common Fields

- `email` - admin email address
- `password` - admin password

##### Possible Response

```json
{
  "access_token": "jwt-token",
  "admin": {
    "id": "admin-id",
    "email": "admin@example.com"
  }
}
```

---

### Send Admin Email

#### `POST /admin/send-email`

Sends a password reset or notification email to an admin account.

##### Request Body

`SendAdminEmailDto`

```json
{
  "email": "admin@example.com"
}
```

##### Notes

- Often used during password reset flows.
- May return a success message rather than full user data.

---

### Request Admin Password Reset

#### `POST /admin/request-password-reset`

Starts the admin password reset flow.

##### Request Body

`RequestAdminPasswordResetDto`

```json
{
  "email": "admin@example.com"
}
```

##### Expected Behavior

- Generates and sends a one-time password (OTP) or reset token.
- Stores reset state server-side or in a persistent store.

---

### Verify Admin Password Reset OTP

#### `POST /admin/verify-password-reset-otp`

Verifies the OTP used for admin password reset.

##### Request Body

`VerifyAdminPasswordResetOtpDto`

```json
{
  "email": "admin@example.com",
  "otp": "123456"
}
```

##### Expected Behavior

- Confirms the OTP is valid and not expired.
- May return a short-lived reset token or verification status.

---

### Reset Admin Password

#### `POST /admin/reset-password`

Completes the admin password reset process.

##### Request Body

`ResetAdminPasswordDto`

```json
{
  "email": "admin@example.com",
  "otp": "123456",
  "newPassword": "newStrongPassword123"
}
```

##### Expected Behavior

- Validates OTP
- Updates admin password
- Invalidates old reset token or OTP

---

### Promotions Management

Files:

- `create-promotion.dto.ts`
- `update-promotion.dto.ts`

Likely admin-only routes include CRUD operations for promotions.

#### Common Promotion Fields

- title
- description
- discount
- start date
- end date
- active status

##### Example Create Request

```json
{
  "title": "Black Friday Sale",
  "description": "20% off selected products",
  "discount": 20,
  "active": true
}
```

##### Example Update Request

```json
{
  "title": "Updated Sale Title",
  "active": false
}
```

---

## Product API

Files:

- `src/modules/product/product.controller.ts`
- `src/modules/product/product.service.ts`
- `src/modules/product/dto/create-product.dto.ts`
- `src/modules/product/dto/update-product.dto.ts`
- `src/schemas/product.schema.ts`

### Data Model

The product schema is likely the core structure for product inventory.

#### Product Schema Notes

Typically includes fields such as:

- name
- price
- description
- images
- category
- subcategory
- type
- sizes/quantities
- stock or availability
- featured / active flags

### `GET /products`

Returns all products.

#### Response Example

```json
[
  {
    "_id": "product-id",
    "name": "T-Shirt",
    "price": 15000,
    "category": "Clothing",
    "active": true
  }
]
```

### `GET /products/:id`

Returns a single product by ID.

#### Parameters

- `id` - product identifier

#### Response Example

```json
{
  "_id": "product-id",
  "name": "T-Shirt",
  "price": 15000,
  "category": "Clothing"
}
```

### `POST /products`

Creates a product.

#### Request Body

`CreateProductDto`

Example:

```json
{
  "name": "T-Shirt",
  "price": 15000,
  "category": "Clothing",
  "subcategory": "Men",
  "type": "Casual",
  "description": "Cotton t-shirt",
  "active": true
}
```

#### Validation Expectations

- Required fields should be enforced by DTO validation decorators.
- Price should be numeric.
- Category and related foreign keys or references should be valid IDs or strings depending on schema implementation.

### `PATCH /products/:id`

Updates a product.

#### Request Body

`UpdateProductDto`

Example:

```json
{
  "price": 18000,
  "active": false
}
```

### `DELETE /products/:id`

Deletes a product.

#### Expected Behavior

- May soft-delete or hard-delete depending on service implementation.
- Usually returns a success message or deleted resource details.

---

## Category API

Files:

- `src/modules/category/category.controller.ts`
- `src/modules/category/category.service.ts`
- `src/modules/category/dto/create-category.dto.ts`
- `src/modules/category/dto/update-category.dto.ts`
- `src/schemas/category.schema.ts`

### `GET /categories`

Lists categories.

### `GET /categories/:id`

Fetches category details.

### `POST /categories`

Creates a category.

#### Example Request

```json
{
  "name": "Clothing",
  "description": "Apparel and fashion products"
}
```

### `PATCH /categories/:id`

Updates category details.

### `DELETE /categories/:id`

Deletes a category.

---

## Subcategory API

Files:

- `src/modules/subcategory/subcategory.controller.ts`
- `src/modules/subcategory/subcategory.service.ts`
- `src/modules/subcategory/dto/create-subcategory.dto.ts`
- `src/modules/subcategory/dto/update-subcategory.dto.ts`
- `src/schemas/subcategory.schema.ts`

### `GET /subcategories`

Lists subcategories.

### `GET /subcategories/:id`

Fetches a specific subcategory.

### `POST /subcategories`

Creates a subcategory.

#### Example Request

```json
{
  "name": "Men",
  "categoryId": "category-id"
}
```

### `PATCH /subcategories/:id`

Updates subcategory data.

### `DELETE /subcategories/:id`

Deletes a subcategory.

---

## Type API

Files:

- `src/modules/type/type.controller.ts`
- `src/modules/type/type.service.ts`
- `src/modules/type/dto/create-type.dto.ts`
- `src/modules/type/dto/update-type.dto.ts`
- `src/schemas/type.schema.ts`

### `GET /types`

Lists all types.

### `GET /types/:id`

Returns a specific type record.

### `POST /types`

Creates a type.

#### Example Request

```json
{
  "name": "Casual"
}
```

### `PATCH /types/:id`

Updates a type record.

### `DELETE /types/:id`

Deletes a type record.

---

## Cart API

Files:

- `src/modules/cart/cart.controller.ts`
- `src/modules/cart/cart.service.ts`
- `src/modules/cart/dto/create-cart.dto.ts`
- `src/modules/cart/dto/update-cart.dto.ts`
- `src/schemas/cart.schema.ts`

### `GET /cart`

Returns cart items for the current user.

### `POST /cart`

Adds an item to the cart.

#### Example Request

```json
{
  "productId": "product-id",
  "quantity": 2,
  "size": "M"
}
```

### `PATCH /cart/:id`

Updates a cart item.

#### Example Request

```json
{
  "quantity": 3
}
```

### `DELETE /cart/:id`

Removes an item from the cart.

### Notes

- Cart operations are typically user-specific.
- These routes may require authentication.

---

## Order API

Files:

- `src/modules/order/order.controller.ts`
- `src/modules/order/order.service.ts`
- `src/modules/order/dto/create-order.dto.ts`
- `src/modules/order/dto/update-order.dto.ts`
- `src/schemas/order.ts`

### `GET /orders`

Lists orders.

### `GET /orders/:id`

Returns a single order.

### `POST /orders`

Creates a new order.

#### Example Request

```json
{
  "userId": "user-id",
  "items": [
    {
      "productId": "product-id",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "address": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria"
  }
}
```

### `PATCH /orders/:id`

Updates order status or order details.

#### Example Request

```json
{
  "status": "paid"
}
```

### Notes

- Orders may integrate with Paystack.
- Order status may include states like `pending`, `paid`, `shipped`, `delivered`, `cancelled`.

---

## Billing Information API

Files:

- `src/modules/billing-information/billing-information.controller.ts`
- `src/modules/billing-information/billing-information.service.ts`
- `src/modules/billing-information/dto/create-billing-information.dto.ts`
- `src/modules/billing-information/dto/update-billing-information.dto.ts`
- `src/schemas/billing-information.schema.ts`

### `GET /billing-information`

Lists billing records.

### `GET /billing-information/:id`

Returns a specific billing record.

### `POST /billing-information`

Creates billing information.

#### Example Request

```json
{
  "userId": "user-id",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+2348000000000",
  "address": "123 Main St"
}
```

### `PATCH /billing-information/:id`

Updates billing information.

### `DELETE /billing-information/:id`

Deletes billing information.

---

## Blog API

Files:

- `src/modules/blog/blog.controller.ts`
- `src/modules/blog/blog.service.ts`
- `src/modules/blog/dto/create-blog.dto.ts`
- `src/modules/blog/dto/update-blog.dto.ts`
- `src/schemas/blog.schema.ts`

### `GET /blogs`

Lists blog posts.

### `GET /blogs/:id`

Returns a single blog post.

### `POST /blogs`

Creates a blog post.

#### Example Request

```json
{
  "title": "How to Choose the Right Outfit",
  "content": "Long-form blog content here...",
  "author": "Admin"
}
```

### `PATCH /blogs/:id`

Updates a blog post.

### `DELETE /blogs/:id`

Deletes a blog post.

---

## User API

Files:

- `src/modules/user/user.controller.ts`
- `src/modules/user/user.service.ts`
- `src/modules/user/dto/create-user.dto.ts`
- `src/modules/user/dto/update-user.dto.ts`
- `src/schemas/user.schema.ts`

### `GET /users`

Lists users.

### `GET /users/:id`

Returns a single user.

### `POST /users`

Creates a user.

#### Example Request

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

### `PATCH /users/:id`

Updates user details.

### `DELETE /users/:id`

Deletes a user.

### Notes

- Passwords should be hashed before storage.
- Sensitive user data should not be exposed in response payloads.

---

## Platform Login API

Files:

- `src/modules/platform-login/platform-login.controller.ts`
- `src/modules/platform-login/platform-login.service.ts`
- `src/modules/platform-login/platform-login.module.ts`

This module appears to provide a specialized login flow for platform access.

### Possible Routes

- `POST /platform-login`
- `POST /platform-login/verify`
- `POST /platform-login/logout`

#### Example Request

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Notes

- Exact route paths depend on controller decorators.
- Likely shares identity/auth logic with the main auth module.

---

## Paystack API

Files:

- `src/modules/paystack/paystack.controller.ts`
- `src/modules/paystack/paystack.service.ts`
- `src/modules/paystack/paystack.module.ts`

This module integrates with Paystack for payment processing.

### Expected Features

- Initialize transaction
- Verify payment
- Handle webhook events
- Possibly generate payment references

### Example Possible Routes

- `POST /paystack/initialize`
- `GET /paystack/verify/:reference`
- `POST /paystack/webhook`

#### Example Request

```json
{
  "email": "customer@example.com",
  "amount": 5000
}
```

#### Notes

- Payment flows should always be validated server-side.
- Webhook endpoints should verify signatures.

---

## Schema Reference

Schema files define database structures used by the application.

### `src/schemas/admin.schema.ts`

Admin account data, likely including:

- email
- password hash
- reset OTP / reset token fields
- role metadata

### `src/schemas/user.schema.ts`

User account data, likely including:

- name
- email
- password hash
- address / profile metadata

### `src/schemas/product.schema.ts`

Product data, likely including:

- name
- price
- category references
- subcategory references
- type references
- stock / availability
- image references
- timestamps

### `src/schemas/category.schema.ts`

Category data, likely including:

- name
- description
- slug
- timestamps

### `src/schemas/subcategory.schema.ts`

Subcategory data, likely including:

- name
- category reference
- timestamps

### `src/schemas/type.schema.ts`

Type data, likely including:

- name
- timestamps

### `src/schemas/cart.schema.ts`

Cart data, likely including:

- user reference
- product reference
- quantity
- selected size / variant

### `src/schemas/order.ts`

Order data, likely including:

- user reference
- line items
- shipping details
- payment status
- fulfillment status

### `src/schemas/billing-information.schema.ts`

Billing data, likely including:

- name
- email
- phone
- address
- user reference

### `src/schemas/blog.schema.ts`

Blog post data, likely including:

- title
- content
- author
- published status

### `src/schemas/promotion.schema.ts`

Promotion data, likely including:

- title
- description
- discount values
- active status
- date ranges

### `src/schemas/feedback.schema.ts`

Feedback records, likely including:

- user reference
- message
- rating
- timestamps

### `src/schemas/size-quantity.schema.ts`

Inventory sizing data, likely including:

- size
- quantity
- product reference

---

## Request Validation

DTOs are used for input validation across modules.

### Common Validation Patterns

- `@IsString()`
- `@IsEmail()`
- `@IsOptional()`
- `@IsNumber()`
- `@IsBoolean()`
- `@IsMongoId()`
- `@MinLength()`
- `@MaxLength()`

### Utility

`src/common/utils/dto-validation.util.ts`

This utility likely centralizes validation behavior, error shaping, or DTO-related helpers.

---

## Error Handling

Although error handling implementation may vary by controller/service, the application likely follows NestJS standards:

### Common Error Responses

#### 400 Bad Request

Validation failed.

```json
{
  "statusCode": 400,
  "message": ["name must be a string"],
  "error": "Bad Request"
}
```

#### 401 Unauthorized

Missing or invalid credentials.

#### 403 Forbidden

Authenticated but not authorized.

#### 404 Not Found

Requested resource does not exist.

#### 500 Internal Server Error

Unexpected server failure.

---

## Example Integration Patterns

### Protected Route Example

```http
GET /orders
Authorization: Bearer <token>
```

### Create Resource Example

```http
POST /categories
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{
  "name": "Accessories",
  "description": "Fashion accessories"
}
```

### Update Resource Example

```http
PATCH /products/64f1c2f9d123456789abcd
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{
  "price": 20000
}
```

---

## Suggested API Naming Convention

The project appears to follow simple REST-like naming conventions:

- `GET /resource`
- `GET /resource/:id`
- `POST /resource`
- `PATCH /resource/:id`
- `DELETE /resource/:id`

When implemented consistently, this gives the API predictable behavior across modules.

---

## Security Notes

- Passwords must never be returned in API responses.
- Admin-only routes should always be protected.
- Payment initialization and verification must occur server-side.
- Webhook endpoints should verify source authenticity.
- Any route that mutates sensitive data should validate authentication and authorization.

---

## Frontend Consumption Notes

If consuming this API from a frontend application:

1. Always send `Content-Type: application/json`
2. Include the bearer token for protected routes
3. Handle 401/403 responses by redirecting or refreshing auth state
4. Validate required form fields client-side before submission
5. Expect pagination or filtering to be added where list endpoints are large

---

## Recommended Next Improvements

To make this documentation even more complete, the following could be added after verifying each controller file in detail:

- Exact route decorators and full endpoint paths
- Pagination/filter/sort query parameters
- Exact request DTO field constraints
- Full sample responses for each endpoint
- Webhook payload examples for Paystack
- Auth token refresh flow details
- Rate limiting and throttling behavior
- Swagger/OpenAPI auto-generated spec

---

## Summary

This backend is a modular NestJS API with domain-based controllers and schema-driven data models. It provides a broad ecommerce-style service layer including products, categories, orders, carts, users, blogs, billing, admin workflows, and payment integration.

The documentation above is a detailed starting point for understanding and consuming the application API.
