# Kapda Godam living spec

## Product
11 CR is the clothing brand for wholesale Men's Jeans and Men's Shirts. Kapda Godam is the wholesale store and buying desk in Ulhasnagar 5, Maharashtra. The UI keeps this brand/store distinction explicit and always communicates MOQ-led bulk buying rather than retail checkout.

## Data model
- `products`: string id, editable brand (default `11 CR`), name, SKU, category (`jeans` or `shirts`), sizes, colors, fabric, price per piece, MOQ, stock, image URLs, description, availability status and featured flag
- `orders`: customer/business delivery details, ordered product snapshots including brand, quantities, estimated total and status
- `admins` / `admin_sessions`: seeded owner account and 12-hour httpOnly cookie sessions
- `inquiries`: wholesale/contact enquiry details

## Key flows
1. Home → Jeans or Shirts catalog → search/filter → product detail → add MOQ quantity to cart
2. Cart validates each line against product MOQ → Wholesale Order form → POST order → Confirmation page with order ID/status and contact desk
3. Contact form POSTs a wholesale enquiry
4. Admin Login → Dashboard → add/update/delete full branded product records, search orders, update order statuses

## Auth
Admin uses a same-origin httpOnly cookie (`kg_admin_session`) created by `/api/admin/login`. Public product/catalog/order/inquiry flows need no login.

## Deliberate MVP choices
- Backend follows the prebuilt FastAPI + MongoDB template selected during clarification instead of the original Java/MySQL request.
- Product imagery uses curated Unsplash/Pexels URLs.
- Live business contact: `7028301259` and `Parvezaalam22098@gmail.com`; owners are Mr. Shamsuddin and Mr. Tabrez.
- Map is a clearly labeled visual placeholder, not a live maps integration.