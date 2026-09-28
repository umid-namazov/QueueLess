"""
QueueLess AI/ML - 03 Tahlil (Exploratory Data Analysis - EDA).
Qaysi soatlarda navbat ko'p, qaysi kunlarda kamligini tahlil qiladi va hisobot yaratadi.
"""

import os
import pandas as pd


def perform_eda(input_path: str = "data/cleaned_queue_data.csv", report_path: str = "reports/eda_report.md"):
    print(f"[*] EDA Tahlili boshlandi: {input_path}")
    df = pd.read_csv(input_path)

    os.makedirs(os.path.dirname(report_path), exist_ok=True)

    # 1. Umumiy statistika
    total_records = len(df)
    avg_wait = df["actual_wait_minutes"].mean()
    median_wait = df["actual_wait_minutes"].median()
    max_wait = df["actual_wait_minutes"].max()
    min_wait = df["actual_wait_minutes"].min()
    avg_queue = df["queue_length"].mean()

    # 2. Xizmatlar kesimidagi tahlil
    service_stats = df.groupby("service_name").agg(
        Obyom=("actual_wait_minutes", "count"),
        Ortacha_Navbat=("queue_length", "mean"),
        Ortacha_Kutish_Daq=("actual_wait_minutes", "mean"),
        Maks_Kutish_Daq=("actual_wait_minutes", "max"),
    ).round(1).reset_index()

    # 3. Soatlar kesimidagi tahlil (Tirbandlik grafigi)
    hourly_stats = df.groupby("hour").agg(
        Ortacha_Kutish=("actual_wait_minutes", "mean"),
        Ortacha_Navbat=("queue_length", "mean"),
    ).round(1).reset_index()

    # 4. Hafta kunlari kesimidagi tahlil
    day_order = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"]
    day_stats = df.groupby(["day_of_week", "day_name"]).agg(
        Ortacha_Kutish=("actual_wait_minutes", "mean"),
        Ortacha_Navbat=("queue_length", "mean"),
    ).round(1).reset_index().sort_values("day_of_week")

    # 5. Hisobot generatsiyasi
    report_lines = [
        "# QueueLess AI/ML — Dastlabki Ma'lumotlar Tahlili (EDA)",
        "",
        "Ushbu tahlil `QueueLess` navbat tizimi ma'lumotlarining xususiyatlarini, eng tig'iz soatlarni va xizmatlar kesimidagi kutish vaqtlarini aniqlash uchun o'tkazildi.",
        "",
        "## 1. Umumiy Ko'rsatkichlar",
        f"- **Jami tahlil qilingan navbatlar soni:** {total_records:,} ta",
        f"- **O'rtacha kutish vaqti:** {avg_wait:.1f} daqiqa",
        f"- **Mediana kutish vaqti:** {median_wait:.1f} daqiqa",
        f"- **Minimal / Maksimal kutish vaqti:** {min_wait:.1f} / {max_wait:.1f} daqiqa",
        f"- **O'rtacha navbat uzunligi:** {avg_queue:.1f} kishi",
        "",
        "## 2. Xizmat Turlari Bo'yicha Statistika",
        "",
        "| Xizmat Nomi | Navbatlar Soni | O'rtacha Navbat (kishi) | O'rtacha Kutish (daq) | Maksimal Kutish (daq) |",
        "|---|---|---|---|---|",
    ]

    for _, row in service_stats.iterrows():
        report_lines.append(
            f"| {row['service_name']} | {int(row['Obyom'])} | {row['Ortacha_Navbat']} | {row['Ortacha_Kutish_Daq']} daq | {row['Maks_Kutish_Daq']} daq |"
        )

    report_lines.extend([
        "",
        "## 3. Soatlar Bo'yicha Yuklama va Kutish Vaqti",
        "",
        "| Soat | O'rtacha Navbat (kishi) | O'rtacha Kutish Vaqti (daq) | Tirbandlik Darajasi |",
        "|---|---|---|---|",
    ])

    for _, row in hourly_stats.iterrows():
        h = int(row['hour'])
        level = "🔴 Yuqori (Pik)" if row['Ortacha_Kutish'] >= 25 else ("🟡 O'rtacha" if row['Ortacha_Kutish'] >= 15 else "🟢 Past (Qulay)")
        report_lines.append(
            f"| {h:02d}:00 | {row['Ortacha_Navbat']} | {row['Ortacha_Kutish']} daqiqa | {level} |"
        )

    report_lines.extend([
        "",
        "## 4. Hafta Kunlari Bo'yicha Taqqoslash",
        "",
        "| Kun | O'rtacha Navbat (kishi) | O'rtacha Kutish Vaqti (daq) |",
        "|---|---|---|",
    ])

    for _, row in day_stats.iterrows():
        report_lines.append(
            f"| {row['day_name']} | {row['Ortacha_Navbat']} | {row['Ortacha_Kutish']} daqiqa |"
        )

    report_lines.extend([
        "",
        "## 5. Model Uchun Xulosa va Asosiy Belgilar (Feature Importance)",
        "Tahlil natijasida modelga quyidagi belgilar kiritilishi hal qilindi:",
        "1. **`hour`, `hour_sin`, `hour_cos`**: Soat bo'yicha kuchli tebranish mavjud (12:00-14:00 va 17:00-19:00 piki).",
        "2. **`is_weekend` / `day_of_week`**: Dam olish kunlaridagi xatti-harakat ish kunlaridan tubdan farq qiladi (avtoyuvish va sartaroshxona dam olish kunlari tig'iz).",
        "3. **`service_name`**: Har bir xizmatning bazaviy davomiyligi va o'tkazish qobiliyati farqli.",
        "4. **`queue_length`**: Hozirgi navbatdagi odamlar soni kutish vaqtiga bevosita mutanosib.",
    ])

    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))

    print(f"[OK] EDA hisoboti muvaffaqiyatli saqlandi: {report_path}")


if __name__ == "__main__":
    perform_eda()
