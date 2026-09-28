"""
QueueLess Jupyter Notebook Generator.
Jamoa a'zolari va taqdimot uchun to'liq interaktiv Jupyter Notebook faylini yaratadi.
"""

import json
import os

notebook_content = {
    "cells": [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# 🧠 QueueLess — Sun'iy Intellekt va Mashinali O'rganish (AI/ML)\n",
                "## Navbat Kutish Vaqtini Bashorat Qilish va Aqlli Tavsiya Tizimi\n",
                "\n",
                "Ushbu notebook **QueueLess** ilovasining AI moduli bo'yicha barcha 8 ta qadamni bosqichma-bosqich ko'rsatadi:\n",
                "1. **Ma'lumot yig'ish (Dataset Collection)**\n",
                "2. **Ma'lumotlarni tozalash (Data Cleaning & Preprocessing)**\n",
                "3. **Tahlil (Exploratory Data Analysis - EDA)**\n",
                "4. **AI model yaratish (Scikit-Learn Random Forest & Gradient Boosting)**\n",
                "5. **Modelni sinash (MAE, RMSE, R²)**\n",
                "6. **Modelni saqlash (Joblib Serialization)**\n",
                "7. **Backend bilan ulash (FastAPI Integration)**\n",
                "8. **Hujjatlashtirish va integratsiya**"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# 1. Kutubxonalarni yuklash\n",
                "import pandas as pd\n",
                "import numpy as np\n",
                "import joblib\n",
                "from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score\n",
                "\n",
                "print('Barcha kutubxonalar tayyor!')"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "### 01 & 02: Ma'lumotlarni o'qish va tozalash natijasi"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "df = pd.read_csv('../data/cleaned_queue_data.csv')\n",
                "print(f'Toza ma\\'lumotlar hajmi: {len(df)} qator')\n",
                "df.head()"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "### 03: EDA (Statistik Tahlil)\n",
                "Xizmatlar bo'yicha o'rtacha navbat va kutish vaqtlari:"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "df.groupby('service_name').agg({\n",
                "    'queue_length': 'mean',\n",
                "    'actual_wait_minutes': ['mean', 'max']\n",
                "}).round(1)"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "### 04, 05 & 06: Saqlangan AI Modelini Yuklash va Sinash"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "bundle = joblib.load('../app/ai_models/queue_wait_model.joblib')\n",
                "print('Model kalitlari:', list(bundle.keys()))\n",
                "\n",
                "# Sinov bashorati (Masalan: Sartaroshxona, soat 15:00 da)\n",
                "test_input = pd.DataFrame([{\n",
                "    'service_name': 'Sartaroshxona',\n",
                "    'hour': 15,\n",
                "    'minute': 0,\n",
                "    'day_of_week': 2,\n",
                "    'is_weekend': 0,\n",
                "    'is_peak_hour': 0,\n",
                "    'service_avg_minutes': 20,\n",
                "    'operators_count': 1,\n",
                "    'queue_length': 2,\n",
                "    'hour_sin': np.sin(2 * np.pi * 15 / 24.0),\n",
                "    'hour_cos': np.cos(2 * np.pi * 15 / 24.0),\n",
                "}])\n",
                "\n",
                "predicted_wait = bundle['wait_pipeline'].predict(test_input)[0]\n",
                "print(f'Bashorat qilingan kutish vaqti: {predicted_wait:.1f} daqiqa')"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "### 07: Aqlli Tavsiya (Smart Recommendation Logikasi)\n",
                "\"15:00 ni tanladingiz. Taxminiy kutish: 8 daqiqa. 16:30 da borsangiz 2 daqiqa kutasiz.\""
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "from app.services.ai_service import AIService\n",
                "from app.models.branch import Branch\n",
                "\n",
                "service = AIService()\n",
                "demo_branch = Branch(id=1, name='Ustara Barbershop', category='sartaroshxona', avg_service_minutes=20)\n",
                "recommendation = service.smart_recommend(demo_branch, preferred_time='15:00')\n",
                "print('AI Tavsiya Xabari:')\n",
                "print(recommendation.ai_recommendation_message)"
            ]
        }
    ],
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3"
        },
        "language_info": {
            "name": "python",
            "version": "3.11"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 4
}

os.makedirs("notebooks", exist_ok=True)
notebook_path = os.path.join("notebooks", "QueueLess_AI_Model_Walkthrough.ipynb")
with open(notebook_path, "w", encoding="utf-8") as f:
    json.dump(notebook_content, f, indent=2, ensure_ascii=False)

print(f"[OK] Jupyter Notebook yaratildi: {notebook_path}")
