# TotalPay Checkout Integration — Implementation Notes

🔧 Summary of what's implemented:

- Config now reads TotalPay credentials from environment variables:
  - `TOTALPAY_MERCHANT_ID` (merchant_key)
  - `TOTALPAY_SECRET` (merchant password for signature/hash)
  - `TOTALPAY_BASE_URL` (defaults to `https://checkout.totalpay.global/api/v1/session`)
  - `TOTALPAY_STATUS_URL` (defaults to `https://checkout.totalpay.global/api/v1/payment/status`)

- Endpoints added/implemented:
  - POST `/checkout/create-checkout-session` — creates a PendingOrder and initiates TotalPay session, returning `redirect_url` to frontend.
  - GET `/checkout/verify-payment?sessionId=...` — polls TotalPay `payment/status` to check transaction state (existing code adapted).
  - POST `/checkout/callback` — webhook that TotalPay calls with transaction result. The callback **verifies callback hash** and creates a final `Order` if payment `status === 'success'`.

- Signature verification uses TotalPay documented rule:
  - hash = SHA1( MD5( (PAYMENT_PUBLIC_ID + order.number + order.amount + order.currency + order.description + merchant.pass).toUpperCase() ) )
  - Implemented via `CryptoJS` like the official examples in TotalPay docs.


## Testing locally

1. Add your test credentials to `backend/.env` (already added as defaults for convenience).
   - Be sure not to commit sensitive keys to source control.

2. Start backend and frontend servers.

3. In the frontend Checkout flow, choose "Card" and proceed. You will be redirected to TotalPay checkout (sandbox if using test key).

4. Use these test card numbers from TotalPay docs:
   - Success: `4111 1111 1111 1111`, expiries and CVV as instructed in docs.

5. After payment, TotalPay will redirect the customer to `/payment-processing?session_id=...` (session_id is the `PendingOrder` id) and also POST the callback to `/checkout/callback`.

6. The site will poll `/checkout/verify-payment?sessionId=...` until the order is finalised or fails.


## Going Live

- Switch `TOTALPAY_MERCHANT_ID` to your live merchant id and set `TOTALPAY_MODE=live`. `TOTALPAY_SECRET` typically remains the same unless changed by TotalPay support.
- Verify the `TOTALPAY_BASE_URL` if you have a different host for live.


## Notes and security

- Secret (`TOTALPAY_SECRET`) is used only on the backend for hash generation and verification — never expose it in frontend code.
- Always verify the callback hash before marking an order as paid.
- Use HTTPS for callback and success/cancel URLs in production.


----
If you want, I can:
- Wire up storing `payment_id` and gateway details into the `Order` model fields, and add an admin dashboard view for troubleshooting callbacks.
- Add an automated test script to emulate callback payloads (signed with the same hash) for local testing.

Tell me which of the above you'd like next. ✅