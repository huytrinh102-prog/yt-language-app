# Fullstack Backend API

Node.js / Express / MySQL を使用して開発した  
ユーザー管理システムのバックエンドAPIです。

JWT認証、Role-based Authorization、Google Login、Cloudinary Upload などを実装しています。

## 主な機能

- JWT Authentication
- Refresh Token Authentication
- Role-based Authorization
- User CRUD
- Role CRUD
- Search / Pagination / Sorting
- Cloudinary Avatar Upload
- Google OAuth Login
- RESTful API
- Deploy Ready (Render + Railway)

## 使用技術

- Node.js
- Express.js
- MySQL
- Sequelize ORM
- JWT
- Cloudinary
- Railway
- Render

## 起動方法

```bash
npm install
npm start
Database Migration
npx sequelize-cli db:migrate

Production:

npx sequelize-cli db:migrate --env production
環境変数
PORT=8080

jwtKey=your_secret_key

MYSQLHOST=127.0.0.1
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=your_password
MYSQLDATABASE=jwt

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
Project Structure
src/
├── config/
├── controllers/
├── middleware/
├── migrations/
├── models/
├── routes/
├── services/
└── server.js
API Base URL
/api/v1
Authentication Flow
JWT Access Token
Refresh Token
Protected Routes
Role-based Permissions
Main APIs
Authentication
POST /register
POST /login
POST /google-login
GET /account
Users
GET /user-read
POST /user-create
PUT /user-update/:id
DELETE /user-delete/:id
Roles
GET /role-read
POST /role-create
PUT /role-update/:id
DELETE /role-delete/:id
工夫したポイント
JWT + Refresh Token による認証維持を実装
Role / Group による権限制御を実装
Search / Pagination / Sorting に対応
Cloudinary を利用した画像アップロード機能を実装
Frontend / Backend を分離してデプロイ
Sequelize ORM によりデータベース管理を簡略化
Deployment
Backend
Render
Database
Railway MySQL
Frontend Repository

Frontend is built with React + Redux Toolkit.

https://github.com/huytrinh102-prog/fullstack-frontend
今後改善したい点
Refresh Token Rotation
Docker対応
Unit Test
CI/CD環境構築
