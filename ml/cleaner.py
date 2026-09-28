"""
QueueLess AI/ML - 02 Ma'lumotni tozalash (Data Cleaner & Preprocessor).
Xato qiymatlarni olib tashlaydi, bo'sh joylarni to'ldiradi va ma'lumotlarni modelga tayyorlaydi.
"""

import os
import pandas as pd
import numpy as np


def clean_queue_data(input_path: str = "data/raw_queue_data.csv", output_path: str = "data/cleaned_queue_data.csv") -> pd.DataFrame:
    print(f"[*] Tozalash boshlandi: {input_path}")
    df = pd.read_csv(input_path)
    initial_count = len(df)
    print(f"[-] Boshlang'ich qatorlar soni: {initial_count}")

    # 1. Manfiy navbat uzunligi yoki xato qiymatlarni tozalash
    invalid_queue = (df["queue_length"] < 0) | (df["queue_length"] > 100)
    invalid_queue_count = invalid_queue.sum()
    if invalid_queue_count > 0:
        print(f"[-] Noto'g'ri navbat soni aniqlandi va o'chirildi: {invalid_queue_count} ta")
        df = df[~invalid_queue].copy()

    # 2. Bo'sh (NaN) qiymatlarni aniqlash va intellektual to'ldirish (imputation)
    nan_wait_count = df["actual_wait_minutes"].isna().sum()
    if nan_wait_count > 0:
        print(f"[-] Bo'sh kutish vaqtlari aniqlandi: {nan_wait_count} ta. Formula orqali to'ldirilmoqda...")
        # Kutish vaqti = (queue_length / operators_count) * service_avg_minutes
        imputed_values = (df["queue_length"] / df["operators_count"]) * df["service_avg_minutes"]
        df["actual_wait_minutes"] = df["actual_wait_minutes"].fillna(imputed_values.round(1))

    # 3. Noodatiy anomal qiymatlar (Outliers) tozalash (masalan 999 daqiqa yoki IQR dan tashqaridagi anomaliyalar)
    # Maksimal realistik kutish vaqti: 180 daqiqa (3 soat)
    outliers = (df["actual_wait_minutes"] < 0) | (df["actual_wait_minutes"] > 180)
    outliers_count = outliers.sum()
    if outliers_count > 0:
        print(f"[-] Anomal (outlier) kutish vaqti o'chirildi: {outliers_count} ta")
        df = df[~outliers].copy()

    # 4. Qo'shimcha xususiyatlar (Feature Engineering):
    # Soatning davriy (cyclical) xususiyatlari (24 soatlik sikl)
    df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24.0)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24.0)

    # 5. Indekslarni qayta tiklash va saqlash
    df = df.reset_index(drop=True)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    
    print(f"[OK] Ma'lumotlar to'liq tozalandi!")
    print(f"     Yakuniy toza qatorlar: {len(df)} ta (Tozalangan: {initial_count - len(df)} ta)")
    print(f"     Natija saqlandi: {output_path}")
    return df


if __name__ == "__main__":
    clean_queue_data()
