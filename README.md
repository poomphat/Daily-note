# 📓 Daily Program Note — บันทึกกิจกรรมประจำวัน

แอปสมุดบันทึกประจำวันแบบเรียบง่าย ให้คุณ **จดสิ่งที่ทำในแต่ละวันได้เร็วและง่าย**
ออกแบบ UI ให้ดูโมเดิร์น สะอาดตา ใช้งานสะดวกทั้งบนคอมพิวเตอร์และมือถือ

> นี่คือ **ร่างต้นแบบ (draft/prototype)** — เก็บข้อมูลไว้ใน `localStorage` ของเบราว์เซอร์ ยังไม่มี backend

## ✨ ฟีเจอร์

- 🗓️ **มุมมองรายวัน** — เปิดมาเจอ "วันนี้" ทันที
- ⚡ **เพิ่มกิจกรรมเร็ว** — เลือกหมวด (งานหลัก · ประชุม · เรียน/อ่าน · อื่นๆ) พิมพ์แล้วกด Enter
- ✅ **ติ๊กเสร็จ / แก้ไข / ลบ / ลากจัดลำดับ** รายการได้ในคลิกเดียว
- 😊 **บันทึกอารมณ์ประจำวัน** และ **โน้ตอิสระ** สำหรับสรุปท้ายวัน
- 🔁 **ยกงานที่ยังไม่เสร็จมาวันนี้** หรือ **คัดลอกจากเมื่อวาน** ในปุ่มเดียว
- ✔️ **Habit tracker** — ติดตามนิสัยที่อยากทำทุกวัน พร้อม streak รายนิสัย
- 📊 **แท็บสรุป (Insights)** — heatmap ความสม่ำเสมอ, สัดส่วนหมวดหมู่, อารมณ์, และสถิติรวม
- 🔔 **แจ้งเตือนให้มาจด** ตามเวลาที่ตั้งไว้ (ถ้ายังไม่ได้บันทึกวันนั้น)
- 📥 **นำเข้า / สำรองข้อมูล** ผ่านไฟล์ JSON (import & export)
- 📱 **ติดตั้งเป็นแอป (PWA)** ลงหน้าจอมือถือ และใช้งาน **offline** ได้
- ◀️▶️ **สลับวันไป-มา** ด้วยปุ่มก่อนหน้า/ถัดไป หรือเลือกจากปฏิทิน
- 📜 **ประวัติย้อนหลัง** ของวันที่มีบันทึก พร้อมพรีวิว · ปักหมุดวันสำคัญ
- 🔍 **ค้นหาทุกวัน** (⌘K) และ **คีย์ลัด** (กด `?` เพื่อดู)
- 💾 **บันทึกอัตโนมัติ** ขณะพิมพ์ (auto-save)
- 🌙 **โหมดมืด/สว่าง** และ 🇹🇭 แสดงวันที่แบบไทย (พ.ศ.)

## 📥 นำเข้า / สำรองข้อมูล

- กดปุ่ม **นำเข้า / ส่งออก** (ไอคอนดาวน์โหลดบน header)
- **สำรอง:** เลือก "ทั้งหมด (.json)" เพื่อดาวน์โหลดไฟล์เก็บไว้
- **กู้คืน:** เลือก "เลือกไฟล์ .json" แล้วเลือกโหมด
  - _รวมกับข้อมูลเดิม_ — วันที่ซ้ำจะถูกแทนที่ด้วยข้อมูลจากไฟล์
  - _แทนที่ทั้งหมด_ — ลบข้อมูลเดิมทั้งหมดแล้วใช้ข้อมูลจากไฟล์

## 🔔 การแจ้งเตือน

- กดไอคอนกระดิ่งบน header เพื่อเปิดใช้งานและตั้งเวลา
- เบราว์เซอร์จะขอสิทธิ์แจ้งเตือนครั้งแรก
- แจ้งเตือนทำงานเมื่อเปิดหน้าเว็บไว้ หรือเมื่อติดตั้งเป็นแอป (PWA)

## 🚀 วิธีรัน

ต้องมี Node.js 18+ (แนะนำ 20+)

```bash
npm install
npm run dev
```

จากนั้นเปิดเบราว์เซอร์ไปที่ URL ที่แสดงในเทอร์มินัล (ปกติคือ http://localhost:5173)

### คำสั่งอื่น ๆ

```bash
npm run build     # build สำหรับ production
npm run preview   # ดูตัวอย่าง production build
```

## 🧱 เทคโนโลยีที่ใช้

- **React 19** + **TypeScript**
- **Vite** (dev server + build)
- **Tailwind CSS v4** สำหรับสไตล์
- **vite-plugin-pwa** สำหรับ PWA / offline
- **localStorage** สำหรับเก็บข้อมูล

## 📁 โครงสร้างโปรเจกต์

```
src/
├── components/     # UI: Header, Tabs, QuickAdd, EntryList, MoodPicker, HabitTracker,
│                   #     InsightsView, WeekView, TimelineView, ExportMenu, ReminderModal ฯลฯ
├── hooks/          # useNotes, useSettings, useHabits, useReminder
├── lib/            # types, categories, date, storage, export, insights, habits, streak
├── App.tsx         # ประกอบ layout ทั้งหมด
└── main.tsx
```

## 🌐 Deploy บน GitHub Pages (ฟรี)

แอปนี้เป็น static site (React + Vite) จึงรันบน **GitHub Pages** ได้โดยไม่ต้องมี server
ข้อมูลยังคงเก็บใน `localStorage` ของเบราว์เซอร์ผู้ใช้เท่านั้น

### สิ่งที่ต้องมี

- บัญชี GitHub (ฟรี)
- Git ติดตั้งบนเครื่อง
- สร้าง repository บน GitHub (แนะนำชื่อ `daily-note`)

### ขั้นตอน deploy ครั้งแรก

```bash
# 1. ติดตั้ง dependencies (ถ้ายังไม่ได้ทำ)
npm install

# 2. commit โค้ดครั้งแรก
git add .
git commit -m "Initial commit: Daily Program Note app"

# 3. เชื่อม remote (เปลี่ยน USERNAME เป็นชื่อ GitHub ของคุณ)
git remote add origin https://github.com/USERNAME/daily-note.git

# 4. push ขึ้น GitHub
git push -u origin main
```

จากนั้นไปที่ repository บน GitHub:

1. **Settings** → **Pages**
2. ที่ **Build and deployment** → **Source** เลือก **GitHub Actions**
3. รอ workflow `Deploy to GitHub Pages` รันเสร็จ (ดูที่แท็บ **Actions**)

แอปจะอยู่ที่ `https://USERNAME.github.io/daily-note/`

> ถ้าตั้งชื่อ repo ไม่ใช่ `daily-note` ไม่ต้องแก้ config — workflow จะใช้ชื่อ repo อัตโนมัติ

### หลัง deploy แล้ว

- ทุกครั้งที่ push ไป branch `main` จะ build และ deploy ใหม่อัตโนมัติ
- ข้อมูลบันทึกยังอยู่ในเบราว์เซอร์ของแต่ละคน ไม่ sync ข้ามอุปกรณ์
- ทดสอบ production build บนเครื่อง: `npm run build && npm run preview`

## 💡 หมายเหตุ

ข้อมูลทั้งหมดถูกเก็บไว้ในเครื่องของคุณ (เบราว์เซอร์) เท่านั้น การล้างข้อมูลเบราว์เซอร์จะลบบันทึกทิ้ง
เนื่องจากเป็นร่างต้นแบบ จึงยังไม่มีระบบซิงก์ข้ามอุปกรณ์หรือสำรองข้อมูล
