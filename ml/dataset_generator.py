"""
QueueLess AI/ML - 01 Ma'lumot yig'uvchi (Dataset Generator).
Tarixiy navbat va kutish vaqtlari bo'yicha realistik ma'lumotlar to'plamini (dataset) shakllantiradi.
"""

import os
import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np


SERVICES_CONFIG = {
    "Sartaroshxona": {
        "branches": ["Chilonzor Barbershop", "Amir Temur Barbershop", "Yunusobod Barbershop"],
        "avg_duration": 20,
        "peak_hours_weekday": [12, 13, 17, 18, 19, 20],
        "peak_hours_weekend": [11, 12, 13, 14, 15, 16, 17, 18],
        "base_queue_min": 1,
        "base_queue_max": 4,
        "peak_queue_min": 5,
        "peak_queue_max": 12,
    },
    "Avtoyuvish": {
        "branches": ["Avtoyuvish 24/7 Yunusobod", "Premium CarWash Sergeli", "Crystal Auto Chilonzor"],
        "avg_duration": 25,
        "peak_hours_weekday": [17, 18, 19, 20],
        "peak_hours_weekend": [10, 11, 12, 13, 14, 15, 16, 17, 18],
        "base_queue_min": 1,
        "base_queue_max": 3,
        "peak_queue_min": 5,
        "peak_queue_max": 10,
    },
    "Poliklinika": {
        "branches": ["Shahar 1-son poliklinika", "Markaziy klinika Chilonzor", "Medion Clinic Tashkent"],
        "avg_duration": 15,
        "peak_hours_weekday": [9, 10, 11, 12],
        "peak_hours_weekend": [9, 10, 11],
        "base_queue_min": 1,
        "base_queue_max": 4,
        "peak_queue_min": 6,
        "peak_queue_max": 15,
    },
    "Bank filiali": {
        "branches": ["Ipak Yo'li Bank Chilonzor", "Kapitalbank Markaz", "NBU Mirzo Ulug'bek"],
        "avg_duration": 10,
        "peak_hours_weekday": [11, 12, 13, 14, 16, 17],
        "peak_hours_weekend": [], # Sunday closed, Saturday short
        "base_queue_min": 2,
        "base_queue_max": 5,
        "peak_queue_min": 8,
        "peak_queue_max": 18,
    },
    "Davlat xizmatlari": {
        "branches": ["DXM Mirobod filiali", "DXM Yunusobod markazi", "Yashnobod DXM"],
        "avg_duration": 15,
        "peak_hours_weekday": [10, 11, 12, 14, 15, 16],
        "peak_hours_weekend": [10, 11, 12],
        "base_queue_min": 2,
        "base_queue_max": 6,
        "peak_queue_min": 9,
        "peak_queue_max": 20,
    },
}

DAY_NAMES_UZ = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"]


def generate_dataset(num_records: int = 12000, start_date_str: str = "2026-06-01", dirty_fraction: float = 0.03):
    """
    Keng qamrovli va realistik navbat ma'lumotlar bazasini yaratadi.
    dirty_fraction orqali haqiqiy hayotdagi kabi xato/iflos ma'lumotlar qo'shiladi (Qadam 02 tozalashi uchun).
    """
    random.seed(42)
    np.random.seed(42)

    start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
    records = []

    services_list = list(SERVICES_CONFIG.keys())

    for _ in range(num_records):
        # 1. Xizmat va filial tanlash
        service = random.choice(services_list)
        cfg = SERVICES_CONFIG[service]
        branch = random.choice(cfg["branches"])

        # 2. Sana va vaqt
        days_offset = random.randint(0, 100)
        curr_date = start_date + timedelta(days=days_offset)
        day_of_week = curr_date.weekday() # 0..6
        day_name = DAY_NAMES_UZ[day_of_week]
        is_weekend = 1 if day_of_week >= 5 else 0

        # Banklar yakshanba kuni ishlamaydi
        if service == "Bank filiali" and day_of_week == 6:
            continue

        hour = random.randint(9, 20)
        minute = random.choice([0, 15, 30, 45])
        time_str = f"{hour:02d}:{minute:02d}"

        # 3. Peak hour hisoblash
        peak_hours = cfg["peak_hours_weekend"] if is_weekend else cfg["peak_hours_weekday"]
        is_peak = 1 if hour in peak_hours else 0

        # 4. Navbatdagi odamlar soni
        if is_peak:
            queue_len = random.randint(cfg["peak_queue_min"], cfg["peak_queue_max"])
            # Tasodifiy eng yuqori pik
            if random.random() < 0.15:
                queue_len += random.randint(2, 6)
        else:
            queue_len = random.randint(cfg["base_queue_min"], cfg["base_queue_max"])
            if random.random() < 0.1:
                queue_len = max(0, queue_len - 1)

        # 5. Xizmat davomiyligi va kutish vaqti
        base_duration = cfg["avg_duration"]
        # Har bir mijoz uchun o'rtacha xizmat vaqti biroz tebranishi mumkin
        variation = random.uniform(0.85, 1.25)
        effective_duration = base_duration * variation

        # Kutish vaqti = (oldindagi odamlar) * samarali_vaqt + xodim tezligi / operatsion kechikish
        # Xizmat ko'rsatish oynalari (windows/operators) soni: 1 dan 3 tagacha
        operators_count = 2 if service in ["Bank filiali", "Davlat xizmatlari"] else (3 if service == "Avtoyuvish" else 1)
        wait_time_minutes = (queue_len / operators_count) * effective_duration + random.uniform(-1.5, 3.0)
        wait_time_minutes = round(max(0.0, wait_time_minutes), 1)

        records.append({
            "service_name": service,
            "branch_name": branch,
            "date": curr_date.strftime("%Y-%m-%d"),
            "time": time_str,
            "hour": hour,
            "minute": minute,
            "day_of_week": day_of_week,
            "day_name": day_name,
            "is_weekend": is_weekend,
            "is_peak_hour": is_peak,
            "operators_count": operators_count,
            "service_avg_minutes": base_duration,
            "queue_length": queue_len,
            "actual_wait_minutes": wait_time_minutes,
        })

    df = pd.DataFrame(records)

    # Iflos / xato ma'lumotlar kiritish (Qadam 02 - Data Cleaning ni sinash uchun)
    dirty_indices = np.random.choice(df.index, size=int(len(df) * dirty_fraction), replace=False)
    for idx in dirty_indices[:len(dirty_indices)//3]:
        df.loc[idx, "actual_wait_minutes"] = np.nan # Bo'sh qiymat
    for idx in dirty_indices[len(dirty_indices)//3: 2*len(dirty_indices)//3]:
        df.loc[idx, "queue_length"] = -5 # Xato manfiy navbat
    for idx in dirty_indices[2*len(dirty_indices)//3:]:
        df.loc[idx, "actual_wait_minutes"] = 999 # Noodatiy anomal qiymat (outlier)

    return df


if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)
    raw_df = generate_dataset(num_records=12500)
    output_path = os.path.join("data", "raw_queue_data.csv")
    raw_df.to_csv(output_path, index=False)
    print(f"[OK] Xom ma'lumotlar yaratildi: {output_path} ({len(raw_df)} qator)")
