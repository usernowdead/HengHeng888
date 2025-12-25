# 🚀 วิธี Push ไป GitHub - usernowdead

## ✅ Git Config ตั้งค่าแล้ว!

- **Username:** usernowdead
- **Email:** chanathip302010@gmail.com
- **Repository:** ต้องสร้างใน GitHub ก่อน

---

## 📋 ขั้นตอนการ Push

### 1. สร้าง Repository ใน GitHub

1. ไปที่ [https://github.com/usernowdead](https://github.com/usernowdead)
2. กด **New Repository** (หรือไปที่ https://github.com/new)
3. ตั้งชื่อ: `oho568` (หรือชื่อที่ต้องการ)
4. เลือก **Private** (ถ้าต้องการ)
5. **อย่า** กด "Initialize with README"
6. กด **Create repository**

### 2. Push Code

```bash
cd deploy

# Add remote (เปลี่ยน REPO-NAME เป็นชื่อ repo ที่สร้าง)
git remote add origin https://github.com/usernowdead/REPO-NAME.git

# Push
git branch -M main
git push -u origin main
```

### 3. Authentication

เมื่อ push จะถาม username และ password:
- **Username:** `usernowdead`
- **Password:** ใช้ **Personal Access Token** (ไม่ใช่ password จริง)

#### สร้าง Personal Access Token:

1. ไปที่ GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. กด **Generate new token (classic)**
3. ตั้งชื่อ: `oho568-deploy`
4. เลือก scopes: `repo` (full control)
5. กด **Generate token**
6. **คัดลอก token ไว้!** (จะไม่แสดงอีกครั้ง)
7. ใช้ token นี้แทน password เมื่อ push

---

## 🎯 Quick Commands (Copy-Paste)

```bash
cd deploy

# เปลี่ยน REPO-NAME เป็นชื่อ repo ที่สร้างใน GitHub
git remote add origin https://github.com/usernowdead/REPO-NAME.git

git branch -M main
git push -u origin main
```

---

## ⚠️ หมายเหตุ

- Git config ตั้งค่าเฉพาะโปรเจคนี้ (ไม่กระทบ account เก่า)
- ใช้ Personal Access Token แทน password
- ถ้า remote มีอยู่แล้ว: `git remote remove origin` ก่อน

---

**พร้อม Push แล้ว! 🚀**

