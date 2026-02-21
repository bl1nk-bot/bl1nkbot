# Streamlit Dashboard Setup Guide

คู่มือนี้จะช่วยให้คุณตั้งค่าและ deploy Streamlit Dashboard สำหรับจัดการไฟล์ใน S3

## ขั้นตอน 1: ติดตั้ง Streamlit (Local Testing)

```bash
pip install streamlit boto3 python-dotenv pandas
```

## ขั้นตอน 2: ทดสอบ Dashboard Locally

1. ตรวจสอบว่า `.env` มี AWS credentials:
```
AWS_BUCKET_NAME=my-agent-bucket-th-2025
AWS_REGION=us-east-1
```

2. รัน dashboard:
```bash
streamlit run dashboard.py
```

3. เปิด browser ที่ `http://localhost:8501`

## ขั้นตอน 3: Deploy ไปยัง Streamlit Cloud

### 3.1 Push ไฟล์ไปยัง GitHub

```bash
git add dashboard.py
git commit -m "Add Streamlit dashboard"
git push origin main
```

### 3.2 สร้าง Streamlit Account

1. ไปที่ [share.streamlit.io](https://share.streamlit.io)
2. Click "Sign up with GitHub"
3. Authorize Streamlit

### 3.3 Deploy Dashboard

1. Click "New app"
2. Repository: `bl1nk-bot/bl1nkbot`
3. Branch: `main`
4. Main file path: `dashboard.py`
5. Click "Deploy"

### 3.4 ตั้งค่า Secrets ใน Streamlit Cloud

1. ไปที่ Deployed app
2. Click "..." > "Settings"
3. ไปที่ "Secrets"
4. วาง secrets:

```toml
AWS_BUCKET_NAME = "my-agent-bucket-th-2025"
AWS_REGION = "us-east-1"
AWS_ACCESS_KEY_ID = "YOUR-AWS-ACCESS-KEY"
AWS_SECRET_ACCESS_KEY = "YOUR-AWS-SECRET-KEY"
```

## ขั้นตอน 4: ใช้งาน Dashboard

### File Browser
- ดูไฟล์ทั้งหมดใน S3
- Filter ตามประเภท (Markdown, PDF, JSON, etc.)
- ดูขนาดและวันที่แก้ไข

### Upload Files
- อัปโหลดไฟล์ใหม่
- ไฟล์จะถูกจัดระเบียบตามประเภทอัตโนมัติ
- รองรับไฟล์: MD, PDF, JSON, JSONL, CSV, TXT, DOCX, LOG

### Statistics
- ดูสถิติไฟล์ทั้งหมด
- ดูการกระจายตามประเภท
- ดูขนาดรวม

## Dashboard Features

| Feature | Description |
|---------|-------------|
| 📁 File Browser | ดูไฟล์ทั้งหมดใน S3 |
| 🔄 Refresh | รีเฟรชรายการไฟล์ |
| 🔍 Filter | กรองตามประเภท |
| 📤 Upload | อัปโหลดไฟล์ใหม่ |
| 📊 Statistics | ดูสถิติและกราฟ |

## Troubleshooting

### Dashboard not loading
- ตรวจสอบ Streamlit logs
- ตรวจสอบ AWS credentials ใน secrets
- ตรวจสอบ internet connection

### Files not showing
- ตรวจสอบ S3 bucket name
- ตรวจสอบ AWS region
- ตรวจสอบ IAM permissions

### Upload failed
- ตรวจสอบ AWS credentials
- ตรวจสอบ bucket permissions
- ตรวจสอบ file size

## Advanced Configuration

### Custom Styling

แก้ไข `dashboard.py` เพื่อเปลี่ยน:
- Colors
- Layout
- File type mappings

### Additional Features

เพิ่มฟีเจอร์เช่น:
- File search
- Bulk download
- File preview
- Metadata editing

## Security Notes

- ไม่ควร commit AWS credentials ไปยัง GitHub
- ใช้ Streamlit Secrets สำหรับ credentials
- ใช้ IAM roles แทน access keys ถ้าเป็นไปได้
