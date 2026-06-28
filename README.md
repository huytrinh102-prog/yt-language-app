# YouTube動画で学ぶ語学学習アプリ

YouTube動画を教材として、字幕・単語帳・ノート・学習進捗を一つの画面で管理できるフルスタックWebアプリケーションです。  
ユーザーごとに学習中の言語フォルダを作成し、動画を分類しながら継続的に学習できる設計にしています。

## 概要

このアプリは、外国語学習者がYouTube動画をより効率的に活用できるようにすることを目的に開発しました。  
動画を視聴しながら、気になる単語を保存したり、動画ごとにノートを残したり、学習進捗を記録できます。

また、管理者向けにはユーザー管理・ロール管理・権限制御機能を実装し、一般ユーザーと管理者で表示される画面を分けています。

## 主な機能

- JWT認証 / Refresh Token
- Googleログイン
- パスワード再設定メール送信
- ユーザー登録 / ログイン / ログアウト
- プロフィール更新
- 管理者用ユーザー管理
- Role / Group Role による権限制御
- 学習言語フォルダの作成
- YouTube動画の登録
- YouTube動画情報の自動取得
- 字幕インポート / 手動字幕登録
- 動画ごとのノート管理
- 動画ごとの単語帳管理
- Flashcard学習
- 学習進捗の保存
- 検索 / ページネーション / ソート
- Cloudinaryによる画像アップロード
- ライト / ダークテーマ

## 使用技術

### Frontend

- React
- TypeScript
- Vite
- Redux Toolkit
- React Router
- Axios
- Bootstrap / React Bootstrap
- Sass

### Backend

- Node.js
- Express.js
- Sequelize ORM
- MySQL
- JWT
- bcrypt
- Nodemailer
- Cloudinary
- YouTube Transcript / YouTube Data API

### Infrastructure

- Vercel
- Render
- Aiven MySQL

## ディレクトリ構成

```txt
yt-language-app
├── frontend
│   ├── src
│   │   ├── auth
│   │   ├── component
│   │   ├── core
│   │   ├── redux
│   │   ├── services
│   │   └── utils
│   └── package.json
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controller
│   │   ├── middleware
│   │   ├── migrations
│   │   ├── models
│   │   ├── routes
│   │   └── service
│   └── package.json
└── render.yaml
```

## ローカル環境での起動

### Backend

```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 環境変数

### Backend

```env
NODE_ENV=development
PORT=8080
HOST=::

MYSQLHOST=127.0.0.1
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=your_password
MYSQLDATABASE=yt_language_app

jwtKey=your_jwt_secret
jwtRefreshKey=your_refresh_secret

GOOGLE_CLIENT_ID=813168831010-6khcpkn2emjejlmrujadsdm8vhi33fur.apps.googleusercontent.com

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

YOUTUBE_API_KEY=your_youtube_api_key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email
SMTP_PASS=your_app_password
EMAIL_FROM=your_email

FRONTEND_URL=http://localhost:5174
CORS_ORIGINS=http://localhost:5174
```

### Frontend

```env
VITE_API_URL=http://localhost:8080/
VITE_GOOGLE_CLIENT_ID=813168831010-6khcpkn2emjejlmrujadsdm8vhi33fur.apps.googleusercontent.com
```

## 工夫した点

- Access Token と Refresh Token を分け、ログイン状態を維持できるようにしました。
- Role / Group Role を使い、管理者画面と一般ユーザー画面を分離しました。
- YouTube動画、字幕、ノート、単語帳、進捗を学習フローとしてつなげました。
- 動画ごと・言語ごとに学習データを整理できるように設計しました。
- Axios Interceptor を使い、認証エラーやトークン更新を共通化しました。
- Cloudinary署名付きアップロードにより、画像アップロード処理を安全に実装しました。
- Vercel / Render / Aiven MySQL を利用し、Frontend / Backend / Database を分離してデプロイしました。

## 今後改善したい点

- テストコードの追加
- Docker対応
- CI/CDの整備
- 字幕クリックによる単語登録UXの改善
- Flashcard学習モードの拡張
- 学習統計ダッシュボードの追加

## 作者

Huy Trinh  
日本でWebエンジニアとして働くことを目指し、React / TypeScript / Node.js を中心にフルスタック開発を学習しています。
