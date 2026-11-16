# Bondhu Foundation – MERN Donor Management

A full-stack MERN starter for managing 1,000+ blood donor records.

## Stack
- MongoDB + Mongoose
- Express + Node.js (ES modules)
- React + Vite
- JWT admin authentication
- Server-side search, filters and pagination
- QR code preview and print-friendly front/back ID cards

## Requirements
- Node.js 18+
- MongoDB local or MongoDB Atlas

## 1. Install dependencies
Open the project root in VS Code terminal:

```bash
npm install
npm run install:all
```

## 2. Configure backend
Copy `server/.env.example` to `server/.env` and edit the values:

```env
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/bondhu_foundation
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
ADMIN_NAME=Bondhu Admin
ADMIN_EMAIL=admin@bondhu.local
ADMIN_PASSWORD=ChangeThisPassword123!
```

Never commit `.env` or share your MongoDB password.

## 3. Create the first admin
```bash
npm run seed:admin --prefix server
```

The script reads ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD from `server/.env`.

## 4. Start both apps
From the project root:

```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend health: http://localhost:5000/api/health

You can also run separately:
```bash
npm run dev --prefix server
npm run dev --prefix client
```

## 5. Production build
```bash
npm run build
```

Deploy the API and frontend separately. Set `VITE_API_URL` in the frontend hosting environment to your deployed API URL, and set `CLIENT_URL` in the backend environment to your deployed frontend URL.

## Managing 1,000+ donors
- MongoDB indexes are created for donorId (unique), name, phone, bloodGroup and status.
- Donor listing is paginated on the server; the app does not download every donor at once.
- Search and filters are executed by the API.
- Default page size is 20; maximum is 100.
- Use MongoDB Atlas or a properly secured production MongoDB deployment.

## Important production checklist
- Change the default admin password immediately.
- Use HTTPS in production and a strong random JWT_SECRET.
- Restrict CORS to your real frontend domain.
- Add backup/restore policy and audit logs.
- For donor photos, use a private/approved image storage provider; this starter accepts a photo URL.
- QR code currently encodes donor identity fields. For public verification, replace it with a signed, opaque verification token and a public verification endpoint; do not expose phone numbers in public QR payloads.
- Confirm organization details, eligibility guidance and card terms with Bondhu Foundation before issuing cards.
- This is a starter project, not a certified medical or identity verification system.


## Student ID Card Design & Printing module

The `/studio` route is a customer-facing card studio. Customers can register/sign in, customize a School/College/University ID card, save the design, and submit a print order with quantity and delivery details. Admins can review orders in the existing dashboard and update order status.

### Customer workflow
1. Open `http://localhost:5173/studio`.
2. Register a customer account (password must be at least 8 characters).
3. Fill in institution and student details in Card Settings.
4. Save the design and submit the print order.
5. Track order status in My print orders.

### Production environment
- Frontend: set `VITE_API_URL` to the backend API base, including `/api`, for example `https://your-api.onrender.com/api`.
- Backend: set `CLIENT_URL` to the exact deployed frontend origin.
- The customer card studio currently accepts photo/logo URLs; image file upload/storage (Cloudinary or S3) should be configured before production use.
- Pricing and payment are not integrated; the order request is submitted for the admin team to confirm price and delivery with the customer.
