# 🚀 วิธี Push แบบง่าย (Windows)

## ❌ ปัญหา: `git credential-manager-core erase` ไม่ทำงาน

ไม่เป็นไร! ใช้วิธีนี้แทน:

---

## ✅ วิธีที่ 1: Clear Credentials ผ่าน Windows Credential Manager

### ขั้นตอน:

1. **เปิด Windows Credential Manager:**
   - กด `Win + R`
   - พิมพ์: `control /name Microsoft.CredentialManager`
   - กด Enter

2. **ลบ Git Credentials:**
   - ไปที่ **Windows Credentials**
   - หา entries ที่มี `git:` หรือ `github.com`
   - กด **Remove** หรือ **Edit** แล้วลบ

3. **Push อีกครั้ง:**
   ```powershell
   cd deploy
   git push -u origin main
   ```

---

## ✅ วิธีที่ 2: ใช้ Script (ง่ายที่สุด)

```powershell
cd deploy
.\CLEAR-CREDENTIALS.ps1
```

แล้ว push:
```powershell
git push -u origin main
```

---

## ✅ วิธีที่ 3: Push โดยตรง (ถ้าไม่มี credentials เก่า)

```powershell
cd deploy
git push -u origin main
```

เมื่อถาม:
- **Username:** `usernowdead`
- **Password:** **ใส่ Personal Access Token** (ไม่ใช่ password จริง)

---

## 🎯 Quick Commands

```powershell
# 1. ไปที่โฟลเดอร์ deploy
cd deploy

# 2. Push (จะถาม username และ token)
git push -u origin main
```

**เมื่อถาม:**
- Username: `usernowdead`
- Password: **ใส่ Personal Access Token ที่เพิ่งสร้าง**

---

## ⚠️ หมายเหตุ

- ถ้ายังใช้ account เก่า ให้ลอง:
  1. เปิด Windows Credential Manager
  2. ลบ credentials เก่าทั้งหมด
  3. Push อีกครั้ง

- Personal Access Token ต้องมี scope `repo`

---

**ลอง push ดูเลย! ถ้ายังไม่ได้ ให้ลองวิธีที่ 1 (Windows Credential Manager)**

