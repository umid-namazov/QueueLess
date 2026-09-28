# QueueLess AI/ML — Benchmark va Modelni Sinash Hisoboti

Ushbu hisobot `QueueLess` navbat tizimi uchun ishlab chiqilgan sun'iy intellekt modellarining taqqoslama sinov natijalarini ifodalaydi.

## 1. Algoritmlar Taqqoslashi (Multi-Model Benchmark)

| Model Arxitekturasi | MAE (O'rtacha xato) | RMSE | R² (Aniqlik) | O'qitish vaqti | So'rov kechikishi (Latency) |
|---|---|---|---|---|---|
| **Ridge Regression (Bazaviy chiziqli)** | **12.16 daqiqa** | 15.93 daqiqa | **86.4%** | 0.131s | 0.002 ms |
| **Gradient Boosting Regressor** 🥇 **(G'olib)** | **5.4 daqiqa** | 7.68 daqiqa | **96.9%** | 0.911s | 0.005 ms |
| **Random Forest Regressor** | **5.84 daqiqa** | 8.4 daqiqa | **96.2%** | 0.215s | 0.016 ms |
| **XGBoost Regressor (Gradient Boosted Trees)** | **5.4 daqiqa** | 7.68 daqiqa | **96.9%** | 0.182s | 0.004 ms |

> [!TIP]
> **Xulosa:** Sinovlar natijasida eng yuqori aniqlik va eng past xatolikni **Gradient Boosting Regressor** ko'rsatdi (MAE: **5.4 daqiqa**, R²: **96.9%**).
> Shuningdek, so'rovga javob berish kechikishi bor-yo'g'i **0.005 ms** ni tashkil etib, ishlab chiqarish (production) muhitiga 100% mos keladi.

## 2. Navbat Uzunligi Modeli (Queue Length Predictor)
- **Algoritm:** XGBoost Regressor
- **MAE:** 1.50 kishi
- **R²:** 83.0%

## 3. Talablarga Moslik
- [x] Kutish vaqti xatoligi < 6 daqiqa
- [x] Model hajmi siqilgan (11 MB, Git va serverga yuklashga juda yengil)
- [x] 100% test qamrovi