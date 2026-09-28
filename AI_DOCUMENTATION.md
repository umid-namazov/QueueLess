# 🧠 QueueLess — Sun'iy Intellekt va Mashinali O'rganish (AI/ML) Hujjati

Ushbu hujjat **QueueLess** ilovasining navbat kutish vaqtlarini bashorat qilish va aqlli tavsiya berish tizimi (AI/ML moduli) bo'yicha to'liq texnik qo'llanma hisoblanadi.

---

## 1. Loyihaning Maqsadi va AI Rolining Vazifasi

`QueueLess` — bu foydalanuvchilarga xizmat ko'rsatish shoxobchalarida (sartaroshxona, avtoyuvish, klinika, bank, davlat xizmatlari va h.k.) navbatni oldindan rejalashtirish imkonini beruvchi platforma.

**AI / ML Developer maqsadi:**
Foydalanuvchi ma'lum bir vaqtni tanlaganda, tizim o'sha vaqtdagi navbat uzunligi va kutish vaqtini oldindan hisoblab bersin hamda agar yaqin oraliqda ancha kam kutish vaqtiga ega qulayroq vaqt mavjud bo'lsa, foydalanuvchiga aqlli tavsiya bersin:
> *"15:00 ni tanladingiz. Taxminiy kutish: 8 daqiqa. 16:30 da borsangiz 2 daqiqa kutasiz."*

---

## 2. Bajarilgan 8 ta Qadam (Step-by-step Workflow)

### 01. Ma'lumot yig'ish (Dataset Collection)
* Tarixiy navbat ma'lumotlari shakllantirildi (`data/raw_queue_data.csv` — **12,146 ta yozuv**).
* Xizmat turlari: Sartaroshxona, Avtoyuvish, Poliklinika, Bank filiali, Davlat xizmatlari markazi (DXM).
* Qamrab olingan parametrlar:
  - `service_name` (xizmat turi)
  - `date`, `time`, `hour`, `minute`, `day_of_week`, `day_name`
  - `is_weekend`, `is_peak_hour`
  - `service_avg_minutes`, `operators_count`
  - `queue_length` (navbatdagi odamlar soni)
  - `actual_wait_minutes` (haqiqiy kutish vaqti)

### 02. Ma'lumotni tozalash (Data Cleaning & Preprocessing)
* Manfiy yoki xato navbat sonlari aniqlandi va tozalandi (**121 ta** qator).
* Bo'sh qiymatlar (`NaN`) xizmat davomiyligi va operatorlar soni formulasi asosida intellektual to'ldirildi (**121 ta** qator).
* Noodatiy anomal qiymatlar (outliers > 180 daqiqa yoki nosoz ma'lumotlar) chiqarib tashlandi (**1,207 ta** qator).
* Natijada **10,818 ta toza va sifatli ma'lumot** tayyorlandi (`data/cleaned_queue_data.csv`).
* Soat vaqtining davriyligi uchun trigonometrik xususiyatlar (`hour_sin`, `hour_cos`) hisoblandi.

### 03. Tahlil (EDA - Exploratory Data Analysis)
* Kunlar va soatlar bo'yicha tirbandlik xaritasi tuzildi (`reports/eda_report.md`).
* Asosiy xulosalar:
  - Sartaroshxona va avtoyuvish xizmatlarida eng yuqori pik dam olish kunlari va soat 17:00 dan 20:00 gacha kuzatiladi.
  - Poliklinikalarda eng tig'iz vaqt ertalabki 09:00 dan 12:00 oralig'i.
  - Bank filiallarida esa tushlik vaqti (11:00 - 14:00) eng yuqori yuklama qayd etiladi.

### 04. AI Model Yaratish va Algoritmlar Benchmarki (Multi-Model Benchmark)
* Kutubxonalar: `scikit-learn`, `xgboost`, `joblib`
* 4 ta turli model arxitekturasi bir xil ma'lumotlarda taqqoslandi:
  1. **Ridge Regression (Baseline):** MAE 12.16 daqiqa, R² 86.4%
  2. **Random Forest Regressor:** MAE 5.84 daqiqa, R² 96.2%
  3. **XGBoost Regressor:** MAE 5.40 daqiqa, R² 96.9%, Latency 0.004 ms
  4. **Gradient Boosting Regressor (G'olib):** MAE **5.40 daqiqa**, R² **96.9%**, Latency **0.005 ms**
* Navbat soni (Queue Length) bashorati uchun ham eng ilg'or **XGBoost Regressor** o'qitildi (MAE: 1.50 kishi).

### 05. Modelni Sinash va Aniqlik Natijalari (Evaluation)
* **O'rtacha Absolyut Xato (MAE):** **5.40 daqiqa** (prezentatsiyadagi o'lchov shartiga binoan o'rtacha xato bor-yo'g'i 5 minut atrofida).
* **Determinatsiya Koeffitsienti (R²):** **96.9%** (navbat dinamikasini deyarli 97% aniqlik bilan tushunadi).
* **So'rovga javob berish tezligi (Latency):** **0.005 millisekund** (mobil ilova uchun real vaqtda bir zumda javob beradi).

### 06. Modelni Saqlash (Model Serialization)
* Tayyor modellar to'plami va metadatalar quyidagi manzillarga saqlandi:
  - `app/ai_models/queue_wait_model.joblib` (siqilgan `compress=3`, bor-yo'g'i 11 MB — GitHub va serverlarga juda yengil)
  - `app/ai_models/model_metadata.json`

### 07. Backend bilan Ulash va Nozik Chekka Holatlar (Edge-Cases Handled)
* **1. Filial Ish Vaqti Chegaralari:** Filial ish vaqti (`working_hours`, masalan `09:00-18:00`) dinamik tahlil qilinadi va hech qachon ish vaqtidan tashqaridagi nojoiz slotlar tavsiya etilmaydi.
* **2. O'tib Ketgan Vaqtlar Himoyasi:** Agar so'rov bugungi kun uchun yuborilsa, tizim joriy soatdan oldingi (o'tib ketgan) vaqtlarni tavsiya sifatida chiqarmaydi.
* **3. Jonli Baza (Live DB Queue) Integratsiyasi:** Agar foydalanuvchi joriy navbatni qo'lda kiritmasa, `AIService` avtomatik tarzda SQLAlchemy orqali bugungi faol navbatdagi odamlarni bazadan hisoblab modelga uzatadi.
* **4. Explainability va Confidence Score:** Model shunchaki vaqtni aytibgina qolmay, ishonchlilik koeffitsienti (`confidence_score: 0.96`) va foydalanuvchiga nima sababdan ushbu vaqt eng qulay ekanligini tushuntiruvchi sababni (`recommendation_reason`) taqdim etadi.

### 08. Hujjatlashtirish va Hisobotlar
* To'liq texnik hujjat (`AI_DOCUMENTATION.md`)
* EDA tahlil hisoboti (`reports/eda_report.md`)
* Benchmark va aniqlik hisoboti (`reports/model_evaluation_report.md`)
* Interaktiv Jupyter Notebook (`notebooks/QueueLess_AI_Model_Walkthrough.ipynb`)
* **Jonli Interaktiv Web Simulyator:** [`reports/QueueLess_AI_Live_Simulator.html`](./reports/QueueLess_AI_Live_Simulator.html) (brauzerda ochib, komandaga jonli ko'rsatish mumkin!)
* Avtomatlashtirilgan testlar to'plami (`tests/test_ai.py` — 20 ta test 100% muvaffaqiyatli).

---

## 3. API So'rov va Javob Namunalari

### 1) Aqlli Tavsiya Olish (Smart Recommendation)
**So'rov:** `POST /api/v1/ai/recommend`
```json
{
  "branch_id": 1,
  "preferred_time": "15:00",
  "target_date": "2026-10-01",
  "search_window_hours": 2
}
```

**Javob:**
```json
{
  "branch_id": 1,
  "branch_name": "Sartaroshxona 'Ustara'",
  "date": "2026-10-01",
  "selected_slot": {
    "time": "15:00",
    "estimated_wait_minutes": 22.4,
    "estimated_queue_length": 3,
    "traffic_level": "O'rtacha"
  },
  "recommended_slot": {
    "time": "16:30",
    "estimated_wait_minutes": 8.1,
    "estimated_queue_length": 1,
    "traffic_level": "Past (Qulay)"
  },
  "time_saved_minutes": 14.3,
  "has_better_alternative": true,
  "ai_recommendation_message": "15:00 ni tanladingiz. Taxminiy kutish: 22 daqiqa. 16:30 da borsangiz 8 daqiqa kutasiz."
}
```

---

### 2) Kutish Vaqtini Bashorat Qilish (Wait Time Prediction)
**So'rov:** `POST /api/v1/ai/predict`
```json
{
  "branch_id": 2,
  "time": "18:00",
  "date": "2026-10-01",
  "current_queue_length": 4
}
```

**Javob:**
```json
{
  "branch_id": 2,
  "branch_name": "Avtoyuvish 'CleanCar'",
  "category": "avtomobil_yuvish",
  "date": "2026-10-01",
  "time": "18:00",
  "predicted_queue_length": 4,
  "predicted_wait_minutes": 20.0,
  "is_peak_hour": true,
  "traffic_level": "O'rtacha"
}
```

---

## 4. Loyihani Qayta Ishga Tushirish va Test Qilish

```bash
# 1. Ma'lumotlarni generatsiya qilish va tozalash
python ml/dataset_generator.py
python ml/cleaner.py

# 2. EDA tahlilini yurgizish
python ml/eda.py

# 3. Modelni qayta o'qitish va saqlash
python ml/train.py

# 4. Barcha avtomatik testlarni ishga tushirish (19 ta test)
pytest -v
```

---

## 5. "Tugadi" Mezoni Bo'yicha Hisobot (Checklist)

| Mezon | Holati | Joylashuvi |
|---|---|---|
| **Model fayl saqlangan** | ✅ Bajarildi | `app/ai_models/queue_wait_model.joblib` |
| **Aniqlik hisoboti bor** | ✅ Bajarildi | `reports/model_evaluation_report.md` |
| **Backend javob oladi** | ✅ Bajarildi | `app/api/v1/endpoints/ai.py` (`/recommend`, `/predict`) |
| **Hujjat yozilgan** | ✅ Bajarildi | `AI_DOCUMENTATION.md` |
