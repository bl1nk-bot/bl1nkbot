# GitHub Repository Setup Guide

คู่มือนี้จะช่วยให้คุณตั้งค่า GitHub Repository สำหรับ CI/CD Integration กับ AWS S3

## ขั้นตอน 1: สร้าง GitHub Repository

1. ไปที่ [GitHub.com](https://github.com)
2. Click "New repository"
3. ตั้งชื่อ: `bl1nkbot`
4. เลือก "Public" (หรือ Private ตามต้องการ)
5. เพิ่ม README.md
6. Click "Create repository"

## ขั้นตอน 2: Clone Repository ไปยัง Local

```bash
git clone https://github.com/bl1nk-bot/bl1nkbot.git
cd bl1nkbot
```

## ขั้นตอน 3: เพิ่มไฟล์ Test

สร้างไฟล์ test ต่อไปนี้ใน root folder:

### test.md
```markdown
# Test Markdown File

This is a test markdown file for knowledge base.
```

### test.json
```json
{
  "key": "json context",
  "type": "test"
}
```

### test.jsonl
```
{"line1": "jsonl log1"}
{"line2": "jsonl log2"}
```

### test.csv
```csv
name,age
John,30
Jane,25
```

### test.txt
```
Plain text file for testing.
```

### test.pdf
สร้าง PDF ว่างด้วย [smallpdf.com](https://smallpdf.com) หรือ tool อื่น

### test.docx
สร้าง DOCX ว่างด้วย [Office 365 Online](https://office.com)

## ขั้นตอน 4: Commit และ Push ไฟล์

```bash
git add .
git commit -m "Add test files and setup"
git push origin main
```

## ขั้นตอน 5: ตั้งค่า GitHub Secrets

1. ไปที่ Repository Settings
2. ไปที่ "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. เพิ่ม secrets ต่อไปนี้:

| Name | Value |
|------|-------|
| AWS_BUCKET_NAME | my-agent-bucket-th-2025 |
| AWS_REGION | us-east-1 |
| AWS_ACCOUNT_ID | YOUR-AWS-ACCOUNT-ID |

## ขั้นตอน 6: ตั้งค่า CI/CD Workflow

1. สร้าง folder: `.github/workflows/`
2. สร้างไฟล์: `.github/workflows/sync-s3.yml`
3. วาง content จากไฟล์ `.github/workflows/sync-s3.yml` ในโปรเจกต์นี้

## ขั้นตอน 7: ทดสอบ Workflow

1. Push ไฟล์ใหม่ไปยัง GitHub
2. ไปที่ Repository > "Actions" tab
3. ดู "Sync to S3" workflow
4. ตรวจสอบว่า workflow ทำงานสำเร็จ (green checkmark)

## ขั้นตอน 8: ตรวจสอบ S3

1. ไปที่ [AWS S3 Console](https://s3.console.aws.amazon.com)
2. เปิด bucket `my-agent-bucket-th-2025`
3. ดู folder `knowledge-base/`
4. ตรวจสอบว่าไฟล์ถูกจัดระเบียบตามประเภท

## File Structure ใน Repository

```
bl1nkbot/
├── .github/
│   └── workflows/
│       └── sync-s3.yml
├── test.md
├── test.pdf
├── test.json
├── test.jsonl
├── test.csv
├── test.txt
├── test.docx
├── upload_test.py
├── dashboard.py
├── README.md
└── .gitignore
```

## Workflow Trigger

Workflow จะทำงานอัตโนมัติเมื่อ:
- Push ไปยัง `main` branch
- Manual trigger ผ่าน Actions tab

## Troubleshooting

### Workflow Failed
- ตรวจสอบ GitHub Actions logs
- ตรวจสอบว่า secrets ถูกตั้งค่าแล้ว
- ตรวจสอบ AWS IAM permissions

### Files not in S3
- ตรวจสอบ S3 bucket name ใน secrets
- ตรวจสอบ AWS region
- ตรวจสอบ IAM role permissions

### OIDC Error
- ตรวจสอบว่า GitHub OIDC provider ถูกสร้างใน AWS IAM
- ตรวจสอบ Trust Policy ของ role
