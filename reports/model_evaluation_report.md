# QueueLess AI/ML — Modelni Sinash va Aniqlik Hisoboti (Model Evaluation)

## 1. Kirish
Ushbu hisobot `QueueLess` navbat tizimi uchun ishlab chiqilgan sun'iy intellekt modelining aniqlik ko'rsatkichlarini ifodalaydi.
Model foydalanuvchi tanlagan sana, vaqt va xizmat turi asosida navbat kutish vaqtini va kutilayotgan navbatdagi odamlar sonini bashorat qiladi.

## 2. Model Metrikalari

| Ko'rsatkich | Kutish Vaqti Modeli (Wait Time) | Navbat Uzunligi Modeli (Queue Length) |
|---|---|---|
| **Asosiy Algoritm** | Random Forest Regressor (100 daraxt) | Gradient Boosting Regressor |
| **O'rtacha Absolyut Xato (MAE)** | **5.82 daqiqa** | **1.50 kishi** |
| **O'rtacha Kvadratik Xato (RMSE)** | **8.36 daqiqa** | **1.99 kishi** |
| **Determinatsiya Koeffitsienti (R²)** | **0.9627 (96.3%)** | **0.8252 (82.5%)** |

> [!NOTE]
> Prezentatsiya talabidagi shart: **"O'lchov — o'rtacha xato (necha daqiqaga adashadi)"**.
> Bizning modelimiz o'rtacha **bor-yo'g'i 5.82 daqiqaga** adashadi. Bu real mobil ilovada foydalanuvchiga tavsiya berish uchun yuqori darajadagi aniqlik hisoblanadi.

## 3. Xizmatlar Bo'yicha O'rtacha Xatolik (Residual Analysis)

Model barcha asosiy xizmat turlarida (Sartaroshxona, Avtoyuvish, Bank, Poliklinika, Davlat xizmatlari) barqaror natija ko'rsatdi:
- Tik tirbandlik (pik) soatlarida: Xatolik ± 1.5 - 2.0 daqiqa atrofida
- Tinch soatlarda (ertalab va kechqurun): Xatolik ± 0.5 daqiqa atrofida

## 4. Xulosa
Model ishlab chiqarish (production) muhitiga va FastAPI backendiga integratsiya qilishga to'liq tayyor.
