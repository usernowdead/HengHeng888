# วิธีตรวจสอบก่อน Push ไป Vercel

## 1. Build Local ก่อน Push (สำคัญมาก!)

```bash
# ในโฟลเดอร์ deploy
npm run build
```

**ถ้า build ผ่าน = Vercel ก็ผ่านแน่นอน!**

---

## 2. ตรวจสอบ Environment Variables

### ต้องมี (Required):
- `JWT_SECRET` - ต้องยาว 32+ ตัวอักษร
- `DATABASE_URL` - สำหรับ Supabase

### ไม่บังคับ (Optional):
- `API_KEY_ADS4U` - จะใช้ placeholder ถ้าไม่มี
- `API_KEY_MIDDLE` - จะใช้ placeholder ถ้าไม่มี
- อื่นๆ

---

## 3. ตรวจสอบ Type Errors

```bash
# ตรวจสอบ TypeScript errors
npx tsc --noEmit
```

---

## 4. ตรวจสอบ Import/Export

### ปัญหาที่เจอบ่อย:
- ❌ ใช้ function แต่ไม่ได้ import
- ❌ Export ไม่ถูกต้อง
- ❌ Circular dependencies

### วิธีตรวจสอบ:
```bash
# ตรวจสอบว่า import ครบหรือยัง
grep -r "withCSRFSecurity" src/app/api --include="*.ts" | grep -v "import"
```

---

## 5. ตรวจสอบ Client Components

### หน้าไหนที่ต้องเป็น Dynamic:
- ใช้ `useSearchParams()` → ต้องมี `export const dynamic = 'force-dynamic'`
- ใช้ `useAuth()` → ต้องมี `export const dynamic = 'force-dynamic'`
- ใช้ cookies → ต้องมี `export const dynamic = 'force-dynamic'`

---

## 6. Checklist ก่อน Push

- [ ] `npm run build` ผ่านแล้ว
- [ ] ไม่มี TypeScript errors
- [ ] Environment variables ครบ (หรือมี placeholder)
- [ ] Import/Export ถูกต้อง
- [ ] Client components มี `dynamic = 'force-dynamic'` ถ้าจำเป็น
- [ ] ไม่มี console.error ที่จะทำให้ build fail

---

## 7. ถ้ายัง Build ไม่ผ่าน

### ตรวจสอบ:
1. Build logs ใน Vercel - ดู error message
2. ตรวจสอบว่า code ถูก push ไป GitHub แล้ว
3. Clear build cache ใน Vercel
4. ตรวจสอบว่า environment variables ตั้งค่าแล้ว

---

## สรุป

**กฎทอง: ถ้า `npm run build` ผ่านใน local = Vercel ก็ผ่านแน่นอน!**

ลอง build local ก่อน push ทุกครั้ง จะช่วยประหยัดเวลาได้เยอะเลย!

