# 🔧 วิธี Setup Git และ Push ไป GitHub

## 📋 ขั้นตอนที่ 1: ตรวจสอบ Git Config ปัจจุบัน

```bash
# ดู username และ email ที่ตั้งไว้
git config --global user.name
git config --global user.email
```

## 🔄 ขั้นตอนที่ 2: เปลี่ยน Git Config (ถ้าต้องการ)

### วิธีที่ 1: เปลี่ยนเฉพาะโปรเจคนี้ (แนะนำ)

```bash
cd deploy

# ตั้งค่า username และ email สำหรับโปรเจคนี้เท่านั้น
git config user.name "Your-New-Username"
git config user.email "your-new-email@example.com"
```

### วิธีที่ 2: เปลี่ยน Global Config (เปลี่ยนทั้งเครื่อง)

```bash
# เปลี่ยน username
git config --global user.name "Your-New-Username"

# เปลี่ยน email
git config --global user.email "your-new-email@example.com"
```

## 🚀 ขั้นตอนที่ 3: Push ไป GitHub

### วิธีที่ 1: สร้าง Repository ใหม่ใน GitHub

1. ไปที่ [https://github.com](https://github.com)
2. กด **New Repository**
3. ตั้งชื่อ: `payplearn` (หรือชื่อที่ต้องการ)
4. เลือก **Private** (ถ้าต้องการ)
5. **อย่า** กด "Initialize with README"
6. กด **Create repository**

### วิธีที่ 2: Push Code

```bash
cd deploy

# Initialize git (ถ้ายังไม่มี)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Add remote (แทนที่ YOUR-USERNAME และ REPO-NAME)
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git

# หรือถ้าใช้ SSH
git remote add origin git@github.com:YOUR-USERNAME/REPO-NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🔐 ขั้นตอนที่ 4: Authentication

### ถ้าใช้ HTTPS และต้องการใช้ Personal Access Token:

1. ไปที่ GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. กด **Generate new token (classic)**
3. ตั้งชื่อ: `payplearn-deploy`
4. เลือก scopes: `repo` (full control)
5. กด **Generate token**
6. **คัดลอก token ไว้!** (จะไม่แสดงอีกครั้ง)
7. เมื่อ push จะถาม username และ password:
   - Username: GitHub username ของคุณ
   - Password: **ใช้ Personal Access Token แทน password**

### ถ้าใช้ SSH:

```bash
# สร้าง SSH key (ถ้ายังไม่มี)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# เพิ่ม SSH key ใน GitHub:
# 1. ไปที่ GitHub → Settings → SSH and GPG keys
# 2. กด New SSH key
# 3. Paste public key
# 4. Save
```

## 🎯 Quick Commands (Copy-Paste)

```bash
# 1. ไปที่โฟลเดอร์ deploy
cd deploy

# 2. Initialize git
git init

# 3. ตั้งค่า user (เปลี่ยนเป็นของคุณ)
git config user.name "Your-Name"
git config user.email "your-email@example.com"

# 4. Add และ commit
git add .
git commit -m "Initial commit - Ready for deployment"

# 5. Add remote (เปลี่ยน YOUR-USERNAME และ REPO-NAME)
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git

# 6. Push
git branch -M main
git push -u origin main
```

## ⚠️ Troubleshooting

### ปัญหา: "remote origin already exists"

```bash
# ลบ remote เก่า
git remote remove origin

# เพิ่ม remote ใหม่
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git
```

### ปัญหา: Authentication failed

- ตรวจสอบว่าใช้ Personal Access Token แทน password
- หรือใช้ SSH แทน HTTPS

### ปัญหา: "Permission denied"

- ตรวจสอบว่า GitHub account ที่ login ถูกต้อง
- ตรวจสอบว่า repository เป็นของ account นั้น

---

**พร้อม Push แล้ว! 🚀**

