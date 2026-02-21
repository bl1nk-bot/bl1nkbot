# Quick Start Guide

เริ่มต้นใช้งาน User Data Management Backend ในเวลา 10 นาที

## Step 1: Setup Local Environment (2 นาที)

```bash
# Clone repository
git clone https://github.com/YOUR-USERNAME/agent-project.git
cd agent-project

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
```

แก้ไข `.env`:
```
DATABASE_URL=mysql://user:password@localhost:3306/user_data_backend
AWS_BUCKET_NAME=my-agent-bucket-th-2025
AWS_REGION=us-east-1
```

## Step 2: Setup Database (2 นาที)

```bash
# Push database schema
pnpm db:push
```

## Step 3: Start Server (1 นาที)

```bash
# Development mode
pnpm dev
```

Server จะเริ่มที่ `http://localhost:3000`

## Step 4: Test API (2 นาที)

### Register User
```bash
curl -X POST http://localhost:3000/api/trpc/userAccounts.register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/trpc/userAccounts.login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Step 5: Setup AWS (3 นาที)

ทำตามขั้นตอนใน [AWS_SETUP_GUIDE.md](./AWS_SETUP_GUIDE.md):
1. สร้าง S3 Bucket
2. สร้าง IAM Role
3. ตั้งค่า GitHub OIDC

## Step 6: Setup GitHub (2 นาที)

ทำตามขั้นตอนใน [GITHUB_SETUP_GUIDE.md](./GITHUB_SETUP_GUIDE.md):
1. สร้าง Repository
2. ตั้งค่า Secrets
3. Push ไฟล์

## Step 7: Deploy Dashboard (2 นาที)

ทำตามขั้นตอนใน [STREAMLIT_SETUP_GUIDE.md](./STREAMLIT_SETUP_GUIDE.md):
1. ทดสอบ locally: `streamlit run dashboard.py`
2. Deploy ไปยัง Streamlit Cloud

## ✅ Verification Checklist

- [ ] Server running at http://localhost:3000
- [ ] Database connected
- [ ] Register endpoint working
- [ ] Login endpoint working
- [ ] S3 bucket created
- [ ] GitHub repository created
- [ ] CI/CD workflow configured
- [ ] Dashboard deployed

## 🔗 Useful Links

| Resource | Link |
|----------|------|
| API Docs | [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) |
| AWS Setup | [AWS_SETUP_GUIDE.md](./AWS_SETUP_GUIDE.md) |
| GitHub Setup | [GITHUB_SETUP_GUIDE.md](./GITHUB_SETUP_GUIDE.md) |
| Dashboard | [STREAMLIT_SETUP_GUIDE.md](./STREAMLIT_SETUP_GUIDE.md) |
| Main README | [README.md](./README.md) |

## 🆘 Common Issues

### Port 3000 already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database connection failed
```bash
# Check DATABASE_URL in .env
# Make sure MySQL is running
mysql -u user -p -e "SELECT 1"
```

### AWS credentials not found
```bash
# Check AWS_BUCKET_NAME and AWS_REGION in .env
# Make sure AWS IAM role is configured
```

## 📚 Next Steps

1. **Customize API**: แก้ไข `server/routers/userAccounts.ts`
2. **Add Frontend**: สร้าง UI ใน `client/src/pages/`
3. **Setup Monitoring**: ดูลอกกิ้งใน S3 Dashboard
4. **Scale Up**: เพิ่ม tier features และ rate limiting

---

**Need Help?** ดูรายละเอียดใน README.md หรือ documentation files
