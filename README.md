# QueueLess — Backend API

"QueueLess" ilovasi uchun navbatlarni oldindan band qilish tizimining **backend** qismi.
FastAPI + SQLAlchemy asosida qurilgan, JWT autentifikatsiya, Swagger dokumentatsiya,
push-notification tuzilmasi va avtomatik testlar bilan.

## 1. Arxitektura

```
queueless-backend/
├── app/
│   ├── main.py                 # Ilova kirish nuqtasi (FastAPI app, CORS, lifespan)
│   ├── core/
│   │   ├── config.py           # .env dan o'qiladigan sozlamalar (pydantic-settings)
│   │   └── security.py         # Parol hash (bcrypt) va JWT token
│   ├── db/
│   │   ├── session.py          # SQLAlchemy engine/session
│   │   ├── base_class.py       # Barcha modellar uchun Base
│   │   └── init_db.py          # Jadval yaratish + demo ma'lumotlar bilan to'ldirish
│   ├── models/                 # SQLAlchemy ORM modellari (User, Branch, Booking, DeviceToken)
│   ├── schemas/                # Pydantic sxemalar (request/response validatsiya)
│   ├── services/                # Biznes-logika qatlami
│   │   ├── queue_service.py     # Navbat: band qilish, bekor qilish, pozitsiya hisoblash
│   │   └── notification_service.py  # Push notification (FCM'ga ulanishga tayyor)
│   └── api/v1/endpoints/       # HTTP endpointlar (routerlar)
├── tests/                      # pytest testlari (auth, branches, queue)
├── requirements.txt
├── Dockerfile / docker-compose.yml
├── .env.example
└── .vscode/                    # VS Code run/debug sozlamalari
```

**Nega shunday tuzilgan?** Har bir qatlam (model → schema → service → endpoint) o'z vazifasiga
ega: endpointlar "yupqa" (faqat so'rovni qabul qilib, service'ga uzatadi), biznes-logika
`services/` ichida — shu tufayli logikani frontend/HTTP qatlamidan mustaqil test qilish mumkin
va kelajakda o'zgartirish oson (masalan, PostgreSQL'ga o'tish faqat `.env` orqali, kod
o'zgarmaydi).

## 2. Talab qilinadigan narsalar

- Python 3.11+ (tavsiya: 3.12)
- (ixtiyoriy) Docker Desktop — agar konteynerda ishga tushirmoqchi bo'lsangiz

## 3. O'rnatish va lokal ishga tushirish (VS Code'da)

```bash
# 1) Loyihani oching va virtual muhit yarating
cd queueless-backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2) Kutubxonalarni o'rnating
pip install -r requirements.txt

# 3) .env faylini yarating
cp .env.example .env
# SECRET_KEY qiymatini o'zgartiring (production uchun majburiy)

# 4) Serverni ishga tushiring
uvicorn app.main:app --reload
```

Server ishga tushgach:
- Swagger (interaktiv dokumentatsiya): **http://127.0.0.1:8000/docs**
- ReDoc: **http://127.0.0.1:8000/redoc**
- Health check: **http://127.0.0.1:8000/**

Birinchi ishga tushganda baza avtomatik yaratiladi (`queueless.db` — SQLite) va 4 ta demo
filial (poliklinika, sartaroshxona, avtoyuvish, bank) bilan to'ldiriladi.

### VS Code orqali (Run/Debug tugmasi bilan)
1. Loyihani VS Code'da oching, Python extension o'rnatilgan bo'lsin.
2. Interpreter sifatida `venv` ni tanlang (pastki status bar yoki `Cmd/Ctrl+Shift+P` → *Python: Select Interpreter*).
3. Chap paneldagi **Run and Debug** (▷ belgisi) bo'limiga o'ting → **"FastAPI: uvicorn (debug)"** ni tanlab **F5** bosing.
   (Bu konfiguratsiya `.vscode/launch.json` da tayyor turibdi — breakpoint qo'yib debug qilish ham mumkin.)
4. Testlarni ishga tushirish uchun **"Pytest: barcha testlar"** konfiguratsiyasini tanlang, yoki terminalda: `pytest -v`

## 4. Docker orqali ishga tushirish (PostgreSQL bilan)

```bash
docker compose up --build
```

Bu PostgreSQL konteyneri va backend'ni birga ko'taradi. Backend `http://localhost:8000` da
ishlaydi, ma'lumotlar bazasi PostgreSQL'da saqlanadi (kod hech qanday o'zgarishsiz — faqat
`DATABASE_URL` o'zgargani uchun).

## 5. Testlar

```bash
pytest -v
```

13 ta test bor: ro'yxatdan o'tish/login, profil, filiallar ro'yxati, navbat band qilish
(ketma-ket raqamlash), bir kunda ikki marta band qilishning oldini olish, navbatni bekor
qilish, faqat o'z navbatingizni bekor qila olish, QR orqali tasdiqlash va h.k. Har bir test
alohida, izolyatsiyalangan (xotiradagi) baza bilan ishlaydi — testlar bir-biriga ta'sir
qilmaydi.

## 6. Asosiy API endpointlar

| Metod | Yo'l | Tavsif | Auth kerakmi? |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Ro'yxatdan o'tish | Yo'q |
| POST | `/api/v1/auth/login` | Login (JWT token oladi) | Yo'q |
| GET | `/api/v1/users/me` | Profilni ko'rish | Ha |
| PUT | `/api/v1/users/me` | Profilni yangilash | Ha |
| GET | `/api/v1/branches` | Filiallar ro'yxati (navbat holati bilan) | Yo'q |
| GET | `/api/v1/branches/{id}` | Bitta filial haqida | Yo'q |
| POST | `/api/v1/branches` | Yangi filial qo'shish | Ha (admin) |
| POST | `/api/v1/queue/book` | Navbat band qilish | Ha |
| GET | `/api/v1/queue/my` | Mening navbatlarim | Ha |
| DELETE | `/api/v1/queue/{id}` | Navbatni bekor qilish | Ha |
| POST | `/api/v1/queue/confirm/{qr_code}` | QR orqali tasdiqlash | Yo'q* |
| POST | `/api/v1/notifications/register-token` | Push token saqlash | Ha |
| POST | `/api/v1/notifications/send-test` | Sinov push yuborish | Ha |

\* Real loyihada bu endpoint filial xodimi uchun alohida rol/token bilan himoyalanadi.

To'liq so'rov/javob namunalari uchun `/docs` sahifasidagi Swagger UI'dan foydalaning — u yerda
har bir endpointni to'g'ridan-to'g'ri sinab ko'rish mumkin ("Try it out" tugmasi).

## 7. Frontend (Flutter) bilan ulash

- Base URL: `http://<server-ip>:8000/api/v1`
- Login qilingandan so'ng olingan `access_token` ni har bir so'rovda header sifatida yuboring:
  `Authorization: Bearer <token>`
- Login endpointi OAuth2 standart forma (`application/x-www-form-urlencoded`) kutadi:
  `username` maydoniga telefon raqami, `password` maydoniga parol yoziladi.
- Barcha boshqa endpointlar oddiy JSON qabul qiladi/qaytaradi.

## 8. Push Notification haqida

`FCM_SERVER_KEY` .env faylida bo'sh bo'lsa, tizim **development rejimida** ishlaydi — xabarlar
haqiqatda yuborilmaydi, faqat konsolga log qilinadi (shu bilan push oqimini FCM sozlanmasdan
oldin ham test qilish mumkin). Haqiqiy Firebase loyihasi tayyor bo'lgach, faqat `.env` dagi
`FCM_SERVER_KEY` ni to'ldirasiz — kodning boshqa hech bir qismini o'zgartirish shart emas.

## 9. Loyihani GitHub'ga joylash

```bash
git init
git add .
git commit -m "QueueLess backend: auth, xizmatlar, navbat, push notification"
git branch -M main
git remote add origin https://github.com/<username>/<repo-nomi>.git
git push -u origin main
```

(Ushbu papkada `git init` va boshlang'ich commit allaqachon qilib qo'yilgan bo'lishi mumkin —
`git log` bilan tekshiring. Faqat `git remote add origin ...` va `git push` qilsangiz yetarli.)

## 10. Keyingi qadamlar (production uchun tavsiyalar)

- Alembic bilan migratsiyalarni boshqarish (hozir `Base.metadata.create_all` orqali sodda yaratiladi)
- Rate limiting va parolni tiklash (forgot password) oqimi
- Xodimlar uchun alohida rol va login (QR tasdiqlash endpointini himoyalash uchun)
- Sentry/logging integratsiyasi
