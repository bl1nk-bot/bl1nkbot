# AWS IAM และ S3 Setup Guide

คู่มือนี้จะช่วยให้คุณตั้งค่า AWS IAM Role และ S3 Bucket สำหรับการเก็บลอกกิ้งและไฟล์ต่างๆ

## ขั้นตอน 1: สร้าง S3 Bucket

1. เปิด [AWS Console](https://console.aws.amazon.com)
2. ค้นหา "S3" > "Create bucket"
3. ตั้งชื่อ bucket: `my-agent-bucket-th-2025` (หรือชื่ออื่นตามต้องการ)
4. เลือก Region: `us-east-1`
5. ปิด "Block all public access" (เพื่อให้ GitHub Actions สามารถเข้าถึงได้)
6. Click "Create bucket"

## ขั้นตอน 2: สร้าง IAM Role

1. ไปที่ IAM Console > "Roles" > "Create role"
2. Trusted entity: เลือก "AWS service" > Use case "Lambda"
3. ชื่อ role: `S3BedrockSyncRole`
4. เพิ่ม Permissions:
   - `AmazonS3FullAccess`
   - `AmazonBedrockFullAccess` (ถ้าใช้ Bedrock)
   - `AWSLambda_FullAccess`
   - `AmazonEventBridgeFullAccess`

## ขั้นตอน 3: ตั้งค่า GitHub OIDC (สำหรับ CI/CD)

1. ไปที่ IAM Console > "Identity providers" > "Add provider"
2. Provider type: "OpenID Connect"
3. Provider URL: `https://token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`
5. Click "Add provider"

## ขั้นตอน 4: อัปเดต Trust Policy ของ Role

1. ไปที่ Role "S3BedrockSyncRole"
2. Tab "Trust relationships" > "Edit trust policy"
3. วาง JSON นี้:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    },
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR-ACCOUNT-ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:bl1nk-bot/bl1nkbot:*"
        }
      }
    }
  ]
}
```

แทน `YOUR-ACCOUNT-ID` และ `YOUR-GITHUB-USERNAME` ด้วยค่าจริง

## ขั้นตอน 5: ตั้งค่า GitHub Secrets

1. ไปที่ GitHub Repository
2. Settings > Secrets and variables > Actions
3. เพิ่ม secrets:
   - `AWS_BUCKET_NAME`: `my-agent-bucket-th-2025`
   - `AWS_REGION`: `us-east-1`
   - `AWS_ACCOUNT_ID`: Account ID ของคุณ

## ขั้นตอน 6: ทดสอบ CI/CD

1. Push ไฟล์ใหม่ไปยัง GitHub
2. ไปที่ Actions tab
3. ดูว่า workflow "Sync to S3" ทำงานสำเร็จหรือไม่
4. ตรวจสอบ S3 Console เพื่อดูไฟล์ที่อัปโหลด

## โครงสร้าง S3 Folder

ไฟล์จะถูกจัดระเบียบตามประเภท:

```
knowledge-base/
├── docs/
│   ├── md-files/
│   ├── pdf-files/
│   ├── txt-files/
│   └── docx-files/
├── data/
│   ├── json-files/
│   ├── jsonl-files/
│   └── csv-files/
└── logs/
    └── log-files/
```

## Troubleshooting

### OIDC Error
- ตรวจสอบว่า GitHub OIDC provider ถูกสร้างแล้ว
- ตรวจสอบ Trust Policy ของ role

### Permission Denied
- ตรวจสอบว่า role มี S3FullAccess permission
- ตรวจสอบ bucket policy

### Files not syncing
- ตรวจสอบ GitHub Actions logs
- ตรวจสอบว่า secrets ถูกตั้งค่าแล้ว
