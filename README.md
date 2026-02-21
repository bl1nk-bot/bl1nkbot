# User Data Management Backend

สร้าง backend server สำหรับจัดการข้อมูลผู้ใช้ พร้อมระบบลอกกิ้ง S3, GitHub CI/CD และ Streamlit Dashboard

## 🚀 Features

- **User Management**: ระบบการจัดการผู้ใช้ด้วย email, password, API keys
- **API Key Management**: สร้าง regenerate และ validate API keys
- **Tier System**: รองรับ free, pro, enterprise tiers
- **Logging System**: บันทึก requests/responses ไปยัง S3 อัตโนมัติ
- **GitHub CI/CD**: Sync ไฟล์ไปยัง S3 อัตโนมัติเมื่อ push
- **Streamlit Dashboard**: Dashboard สำหรับจัดการไฟล์ใน S3
- **Database**: MySQL/TiDB backend ด้วย Drizzle ORM

## 📋 Prerequisites

- Node.js 18+ และ pnpm
- AWS Account
- GitHub Account
- Python 3.8+ (สำหรับ Streamlit)

## 🔧 Installation

### 1. Clone Repository

```bash
git clone https://github.com/bl1nk-bot/bl1nkbot.git
cd bl1nkbot
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Environment Variables

สร้างไฟล์ `.env` ตามตัวอย่างใน `.env.example`:

```bash
cp .env.example .env
```

แก้ไขค่าต่อไปนี้:
- `DATABASE_URL`: MySQL connection string
- `AWS_BUCKET_NAME`: S3 bucket name
- `AWS_REGION`: AWS region
- `CLICKHOUSE_URL`: ClickHouse endpoint (Cloud or self-hosted)
- `CLICKHOUSE_USER`: ClickHouse user
- `CLICKHOUSE_PASSWORD`: ClickHouse password
- `CLICKHOUSE_DATABASE`: ClickHouse database
- `CLICKHOUSE_LOGGING`: Enable/disable ClickHouse logging (true/false)
- `JWT_SECRET`: Secret key สำหรับ JWT

### 4. Setup Database

```bash
pnpm db:push
```

## 🏃 Running the Server

### Development Mode

```bash
pnpm dev
```

Server จะเริ่มที่ `http://localhost:3000`

### Production Build

```bash
pnpm build
pnpm start
```

## 📚 API Documentation

ดูรายละเอียด API ทั้งหมดใน [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick API Examples

#### Register User
```bash
curl -X POST http://localhost:3000/api/trpc/userAccounts.register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/trpc/userAccounts.login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

#### Validate API Key
```bash
curl -X GET "http://localhost:3000/api/trpc/userAccounts.validateApiKey?input=%7B%22apiKey%22:%22sk_YOUR_KEY%22%7D"
```

## 🔐 AWS Setup

ทำตามขั้นตอนใน [AWS_SETUP_GUIDE.md](./AWS_SETUP_GUIDE.md) เพื่อ:
1. สร้าง S3 Bucket
2. ตั้งค่า IAM Role
3. ตั้งค่า GitHub OIDC

## 🔄 GitHub CI/CD Setup

ทำตามขั้นตอนใน [GITHUB_SETUP_GUIDE.md](./GITHUB_SETUP_GUIDE.md) เพื่อ:
1. สร้าง GitHub Repository
2. ตั้งค่า GitHub Secrets
3. ตั้งค่า CI/CD Workflow

## 📊 Streamlit Dashboard

ทำตามขั้นตอนใน [STREAMLIT_SETUP_GUIDE.md](./STREAMLIT_SETUP_GUIDE.md) เพื่อ:
1. ทดสอบ Dashboard locally
2. Deploy ไปยัง Streamlit Cloud

### Local Testing

```bash
pip install streamlit boto3 python-dotenv pandas
streamlit run dashboard.py
```

เปิด browser ที่ `http://localhost:8501`

## 📁 Project Structure

```
user_data_backend/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── lib/           # Utilities
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── routers/           # tRPC routers
│   │   ├── userAccounts.ts
│   │   └── __tests__/
│   ├── middleware/        # Express middleware
│   │   └── logging.ts
│   ├── db.ts             # Database helpers
│   ├── logging.ts        # Logging service
│   └── _core/            # Core infrastructure
├── drizzle/              # Database schema
│   └── schema.ts
├── .github/
│   └── workflows/
│       └── sync-s3.yml   # CI/CD workflow
├── dashboard.py          # Streamlit dashboard
├── upload_test.py        # File upload test
└── README.md
```

## 🗄️ Database Schema

### user_accounts Table

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| userId | INT | Reference to users |
| email | VARCHAR(320) | User email |
| passwordHash | TEXT | Hashed password |
| apiKey | VARCHAR(255) | Production API key |
| testApiKey | VARCHAR(255) | Test API key |
| provider | VARCHAR(64) | Auth provider |
| version | INT | API version |
| tier | ENUM | User tier |
| createdAt | TIMESTAMP | Creation time |
| updatedAt | TIMESTAMP | Update time |

## 📝 Logging

ทุก API request จะถูกบันทึกไปยัง S3 ด้วยข้อมูล:
- Request ID
- Timestamp
- Method และ endpoint
- User ID
- Response status code
- Duration

Log files จัดเก็บใน S3 ที่ `logs/` folder

## 🧪 Testing

รัน test suite:

```bash
pnpm test
```

ดูรายละเอียด test:

```bash
pnpm test:ui
```

## 🚀 Deployment

### Option 1: Manus Platform
1. Click "Publish" button ใน Management UI
2. ระบบจะ deploy อัตโนมัติ

### Option 2: Docker
```bash
docker build -t user-data-backend .
docker run -p 3000:3000 user-data-backend
```

## 📖 Documentation

- [API Documentation](./API_DOCUMENTATION.md) - API endpoints และ examples
- [AWS Setup Guide](./AWS_SETUP_GUIDE.md) - AWS IAM และ S3 setup
- [GitHub Setup Guide](./GITHUB_SETUP_GUIDE.md) - GitHub repository setup
- [Streamlit Setup Guide](./STREAMLIT_SETUP_GUIDE.md) - Dashboard setup

## 🔒 Security

- Passwords จะถูก hash ด้วย bcrypt
- API keys จะถูก generate ด้วย UUID
- ทุก request จะถูก log สำหรับ audit trail
- ใช้ JWT tokens สำหรับ session management

## 🐛 Troubleshooting

### Database Connection Error
```bash
# ตรวจสอบ DATABASE_URL ใน .env
# ตรวจสอบว่า database server กำลังทำงาน
```

### S3 Upload Failed
```bash
# ตรวจสอบ AWS credentials
# ตรวจสอบ IAM permissions
# ตรวจสอบ S3 bucket name
```

### GitHub Actions Failed
```bash
# ตรวจสอบ GitHub Actions logs
# ตรวจสอบ GitHub secrets ถูกตั้งค่าแล้ว
# ตรวจสอบ AWS OIDC provider
```

## 📞 Support

สำหรับปัญหาหรือคำถาม:
1. ตรวจสอบ documentation
2. ดู GitHub Issues
3. ติดต่อ support team

## 📄 License

MIT License - ดูรายละเอียดใน LICENSE file

## 🙏 Contributing

Contributions ยินดีต้อนรับ! โปรดสร้าง Pull Request

---

**Last Updated**: November 2025
**Version**: 1.0.0
