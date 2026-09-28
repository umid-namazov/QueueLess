# QueueLess AI/ML — Dastlabki Ma'lumotlar Tahlili (EDA)

Ushbu tahlil `QueueLess` navbat tizimi ma'lumotlarining xususiyatlarini, eng tig'iz soatlarni va xizmatlar kesimidagi kutish vaqtlarini aniqlash uchun o'tkazildi.

## 1. Umumiy Ko'rsatkichlar
- **Jami tahlil qilingan navbatlar soni:** 10,818 ta
- **O'rtacha kutish vaqti:** 57.2 daqiqa
- **Mediana kutish vaqti:** 45.0 daqiqa
- **Minimal / Maksimal kutish vaqti:** 0.0 / 180.0 daqiqa
- **O'rtacha navbat uzunligi:** 5.9 kishi

## 2. Xizmat Turlari Bo'yicha Statistika

| Xizmat Nomi | Navbatlar Soni | O'rtacha Navbat (kishi) | O'rtacha Kutish (daq) | Maksimal Kutish (daq) |
|---|---|---|---|---|
| Avtoyuvish | 2505 | 4.7 | 41.4 daq | 162.4 daq |
| Bank filiali | 2106 | 7.9 | 42.3 daq | 140.7 daq |
| Davlat xizmatlari | 2502 | 8.5 | 67.4 daq | 179.9 daq |
| Poliklinika | 2007 | 3.7 | 57.2 daq | 180.0 daq |
| Sartaroshxona | 1698 | 4.1 | 84.1 daq | 180.0 daq |

## 3. Soatlar Bo'yicha Yuklama va Kutish Vaqti

| Soat | O'rtacha Navbat (kishi) | O'rtacha Kutish Vaqti (daq) | Tirbandlik Darajasi |
|---|---|---|---|
| 09:00 | 3.6 | 42.7 daqiqa | 🔴 Yuqori (Pik) |
| 10:00 | 6.5 | 65.8 daqiqa | 🔴 Yuqori (Pik) |
| 11:00 | 8.5 | 77.8 daqiqa | 🔴 Yuqori (Pik) |
| 12:00 | 9.1 | 82.8 daqiqa | 🔴 Yuqori (Pik) |
| 13:00 | 5.3 | 50.1 daqiqa | 🔴 Yuqori (Pik) |
| 14:00 | 6.6 | 58.7 daqiqa | 🔴 Yuqori (Pik) |
| 15:00 | 5.2 | 51.8 daqiqa | 🔴 Yuqori (Pik) |
| 16:00 | 6.9 | 59.8 daqiqa | 🔴 Yuqori (Pik) |
| 17:00 | 6.5 | 60.7 daqiqa | 🔴 Yuqori (Pik) |
| 18:00 | 4.7 | 50.9 daqiqa | 🔴 Yuqori (Pik) |
| 19:00 | 4.1 | 44.3 daqiqa | 🔴 Yuqori (Pik) |
| 20:00 | 4.3 | 46.9 daqiqa | 🔴 Yuqori (Pik) |

## 4. Hafta Kunlari Bo'yicha Taqqoslash

| Kun | O'rtacha Navbat (kishi) | O'rtacha Kutish Vaqti (daq) |
|---|---|---|
| Dushanba | 6.1 | 56.9 daqiqa |
| Seshanba | 6.1 | 56.6 daqiqa |
| Chorshanba | 6.1 | 58.2 daqiqa |
| Payshanba | 6.1 | 57.4 daqiqa |
| Juma | 6.3 | 58.2 daqiqa |
| Shanba | 5.0 | 52.3 daqiqa |
| Yakshanba | 5.4 | 62.2 daqiqa |

## 5. Model Uchun Xulosa va Asosiy Belgilar (Feature Importance)
Tahlil natijasida modelga quyidagi belgilar kiritilishi hal qilindi:
1. **`hour`, `hour_sin`, `hour_cos`**: Soat bo'yicha kuchli tebranish mavjud (12:00-14:00 va 17:00-19:00 piki).
2. **`is_weekend` / `day_of_week`**: Dam olish kunlaridagi xatti-harakat ish kunlaridan tubdan farq qiladi (avtoyuvish va sartaroshxona dam olish kunlari tig'iz).
3. **`service_name`**: Har bir xizmatning bazaviy davomiyligi va o'tkazish qobiliyati farqli.
4. **`queue_length`**: Hozirgi navbatdagi odamlar soni kutish vaqtiga bevosita mutanosib.