# Deploy LinguaTube

## 1. Deploy Backend First

Backend folder:

```bash
cd "/Users/japan/Desktop/fullstack-backend copy"
```

Recommended platform: Render Web Service.

Render settings:

```txt
Root Directory: backend repo root
Build Command: npm install
Start Command: npm start
```

Add environment variables on Render:

```env
NODE_ENV=production
HOST=0.0.0.0
ALLOW_VERCEL_WILDCARD=true
CORS_ORIGINS=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app

DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE
jwtKey=your_access_token_secret
jwtRefreshKey=your_refresh_token_secret

GOOGLE_CLIENT_ID=813168831010-6khcpkn2emjejlmrujadsdm8vhi33fur.apps.googleusercontent.com

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

YOUTUBE_API_KEY=your_youtube_api_key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password_without_spaces
EMAIL_FROM=your_email@gmail.com
```

After backend deploys, run migrations from Render shell:

```bash
npm run migrate:prod
```

Your backend URL will look like:

```txt
https://your-backend.onrender.com/
```

Test:

```txt
https://your-backend.onrender.com/api/v1/account
```

It should return an auth error, not a 404. That means API is alive.

## 2. Deploy Frontend

Frontend folder:

```bash
cd "/Users/japan/Desktop/yt-app/my-app"
```

Recommended platform: Vercel.

Vercel settings:

```txt
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Add environment variables on Vercel:

```env
VITE_API_URL=https://your-backend.onrender.com/
VITE_GOOGLE_CLIENT_ID=813168831010-6khcpkn2emjejlmrujadsdm8vhi33fur.apps.googleusercontent.com
```

Deploy.

After Vercel gives you a frontend URL, copy it and update Render:

```env
CORS_ORIGINS=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
```

Then redeploy backend.

## 3. Google Login Setup

In Google Cloud Console, add these authorized JavaScript origins:

```txt
http://localhost:5174
https://your-frontend.vercel.app
```

## 4. Common Problems

If frontend gets CORS:

```txt
Add frontend URL to CORS_ORIGINS on backend Render env.
Redeploy backend.
```

If refresh token does not work:

```txt
Make sure backend NODE_ENV=production.
The server already uses secure SameSite=None cookies in production.
```

If reset password email does not send:

```txt
SMTP_PASS must be Gmail App Password, not normal Gmail password.
Remove spaces from the App Password.
```
