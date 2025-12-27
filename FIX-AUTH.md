# 🔐 แก้ปัญหา Authentication - GitHub

## ❌ ปัญหา
```
remote: Permission to usernowdead/HengHeng888.git denied to userrv6g8vin.
fatal: unable to access 'https://github.com/usernowdead/HengHeng888.git/': The requested URL returned error: 403
```

Git ใช้ account เก่า (`userrv6g8vin`) แทนที่จะเป็น `usernowdead`

---

## ✅ วิธีแก้ไข

### วิธีที่ 1: ใช้ Personal Access Token (แนะนำ)

1. **สร้าง Personal Access Token:**
   - ไปที่ GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
   - กด **Generate new token (classic)**
   - ตั้งชื่อ: `HengHeng888-deploy`
   - เลือก scopes: `repo` (full control)
   - กด **Generate token**
   - **คัดลอก token ไว้!** (จะไม่แสดงอีกครั้ง)

2. **Clear Git Credentials:**
   ```powershell
   # Clear cached credentials
   git credential-manager-core erase
   # หรือ
   git config --global --unset credential.helper
   ```

3. **Push อีกครั้ง:**
   ```powershell
   cd deploy
   git push -u origin main
   ```
   - เมื่อถาม username: ใส่ `usernowdead`
   - เมื่อถาม password: **ใส่ Personal Access Token** (ไม่ใช่ password จริง)

### วิธีที่ 2: ใช้ SSH แทน HTTPS

1. **สร้าง SSH Key:**
   ```powershell
   ssh-keygen -t ed25519 -C "chanathip302010@gmail.com"
   ```

2. **Copy Public Key:**
   ```powershell
   cat ~/.ssh/id_ed25519.pub
   ```

3. **เพิ่ม SSH Key ใน GitHub:**
   - ไปที่ GitHub → **Settings** → **SSH and GPG keys**
   - กด **New SSH key**
   - Paste public key
   - Save

4. **เปลี่ยน Remote URL:**
   ```powershell
   cd deploy
   git remote set-url origin git@github.com:usernowdead/HengHeng888.git
   git push -u origin main
   ```

### วิธีที่ 3: ใช้ Git Credential Manager

```powershell
# ตั้งค่า credential helper
git config --global credential.helper manager-core

# Push (จะถาม username และ password/token)
cd deploy
git push -u origin main
```

---

## 🎯 Quick Fix (Copy-Paste)

```powershell
cd deploy

# Clear old credentials
git credential-manager-core erase

# Push (จะถาม username และ token)
git push -u origin main
```

**เมื่อถาม:**
- Username: `usernowdead`
- Password: **ใส่ Personal Access Token** (ไม่ใช่ password จริง)

---

## 📝 หมายเหตุ

- Personal Access Token ต้องมี scope `repo`
- Token จะไม่แสดงอีกครั้งหลังสร้าง ต้องสร้างใหม่ถ้าลืม
- ถ้ายังไม่ได้ ให้ลอง logout GitHub Desktop หรือ clear browser cache

---

**ลองวิธีที่ 1 ก่อน (Personal Access Token) - ง่ายที่สุด!**

