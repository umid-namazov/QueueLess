import { AppLanguage } from '../store/settingsStore';

const translations = {
  uz: {
    // Auth
    welcome: 'Xush kelibsiz 👋',
    loginSubtitle: 'Davom etish uchun hisobingizga kiring.',
    phone: 'Telefon raqam',
    password: 'Parol',
    login: 'Davom etish',
    loggingIn: 'Kirilmoqda...',
    noAccount: 'Hisobingiz yo\'qmi?',
    register: 'Ro\'yxatdan o\'tish',
    invalidPhonePassword: 'Iltimos, telefon raqami va parolni to\'g\'ri kiriting.',
    loginError: 'Tizimga kirishda xatolik yuz berdi.',
    registerTitle: 'Yangi hisob yaratish',
    registerSubtitle: 'Boshlanish uchun ma\'lumotlarni kiriting.',
    fullName: 'To\'liq ism',
    passwordConfirm: 'Parolni tasdiqlash',
    registerButton: 'Ro\'yxatdan o\'tish',
    registerError: 'Ro\'yxatdan o\'tishda xatolik yuz berdi.',
    
    // Home
    greeting: 'Salom, {{name}} 👋',
    greetingSubtitle: 'Bugun qayerga bormoqchisiz?',
    activeQueue: 'Faol Navbat',
    queueArrivedNotif: 'Sizning navbatingiz keldi',
    ticket: 'Ticket',
    goToBooking: 'Talonga o\'tish →',
    serviceTypes: 'Xizmat turlari',
    nearby: 'Yaqin filiallar',
    viewOnMap: 'Xaritada ko\'rish',
    all: 'Barchasi',
    clinic: 'Poliklinika',
    bank: 'Bank',
    barber: 'Sartaroshxona',
    notary: 'Notarius',
    waitTime: 'Kutish vaqti',
    
    // Bookings
    profile: 'Profil',
    myBookings: 'Mening navbatlarim',
    language: "Tilni o'zgartirish",
    notifications: 'Bildirishnomalar',
    darkMode: 'Tungi rejim',
    logout: 'Tizimdan chiqish',
    uzbek: "O'zbekcha",
    russian: 'Ruscha',
    english: 'Inglizcha',
    time: 'Vaqt',
    status: 'Holat',
    active: 'Faol',
    upcoming: 'Kutilmoqda',
    cancel: 'Bekor qilish',
    enlargeQr: 'Kattalashtirish',
    close: 'Yopish',
    completed: 'Tugatildi',
    cancelled: 'Bekor qilindi',
    
    // Branch names
    asakaBank: 'Asaka Bank (Chilonzor)',
    clinic8: '8-oilaviy poliklinika',
    premiumBarber: 'Premium Barbershop',
    kapitalBank: 'Kapitalbank (Markaziy)',
    
    // Branch details
    branchDetails: 'Filial tafsiloti',
    queuePeople: 'Navbatdagi odamlar',
    estimatedWaitTime: 'Taxminiy kutish vaqti',
    services: 'Xizmat turlari',
    cashService: 'Kassa xizmati',
    creditIssuance: 'Kredit rasmiylashtirish',
    plasticCards: 'Plastik kartalar',
    mondayFriday: 'Dush-Jum: 09:00 - 18:00',

    // Branch addresses
    kapitalBankAddress: 'Yunusobod, Amir Temur ko\'chasi 1-uy',
    asakaBankAddress: 'Chilonzor, Shota Rustaveli prospekti 42',
    clinic8Address: 'Sergeli, Abdulla Qodiriy ko\'chasi 15',
    premiumBarberAddress: 'Mirabad, Zahir Ibn Abu Tahir ko\'chasi 8',
  },
  ru: {
    // Auth
    welcome: 'Добро пожаловать 👋',
    loginSubtitle: 'Войдите в свой аккаунт, чтобы продолжить.',
    phone: 'Номер телефона',
    password: 'Пароль',
    login: 'Продолжить',
    loggingIn: 'Вход...',
    noAccount: 'Нет аккаунта?',
    register: 'Зарегистрироваться',
    invalidPhonePassword: 'Пожалуйста, введите корректный номер и пароль.',
    loginError: 'Ошибка при входе.',
    registerTitle: 'Создать новый аккаунт',
    registerSubtitle: 'Введите ваши данные для начала.',
    fullName: 'Полное имя',
    passwordConfirm: 'Подтверждение пароля',
    registerButton: 'Зарегистрироваться',
    registerError: 'Ошибка при регистрации.',
    
    // Home
    greeting: 'Привет, {{name}} 👋',
    greetingSubtitle: 'Куда вы хотите сегодня?',
    activeQueue: 'Активная очередь',
    queueArrivedNotif: 'Ваша очередь наступила',
    ticket: 'Билет',
    goToBooking: 'Перейти к бронированиям →',
    serviceTypes: 'Типы услуг',
    nearby: 'Ближайшие отделения',
    viewOnMap: 'Посмотреть на карте',
    all: 'Все',
    clinic: 'Поликлиника',
    bank: 'Банк',
    barber: 'Парикмахерская',
    notary: 'Нотариус',
    waitTime: 'Время ожидания',
    
    // Bookings
    profile: 'Профиль',
    myBookings: 'Мои очереди',
    language: 'Изменить язык',
    notifications: 'Уведомления',
    darkMode: 'Тёмная тема',
    logout: 'Выйти',
    uzbek: 'Узбекский',
    russian: 'Русский',
    english: 'Английский',
    time: 'Время',
    status: 'Статус',
    active: 'Активна',
    upcoming: 'Ожидает',
    cancel: 'Отменить',
    enlargeQr: 'Увеличить',
    close: 'Закрыть',
    completed: 'Завершена',
    cancelled: 'Отменена',
    
    // Branch details
    branchDetails: 'Детали отделения',
    queuePeople: 'Людей в очереди',
    estimatedWaitTime: 'Примерное время ожидания',
    services: 'Типы услуг',
    cashService: 'Кассовое обслуживание',
    creditIssuance: 'Оформление кредита',
    plasticCards: 'Пластиковые карты',
    mondayFriday: 'Пн-Пт: 09:00 - 18:00',
    
    // Branch names
    asakaBank: 'Асака Банк (Чилонзор)',
    clinic8: '8-ая поликлиника',
    premiumBarber: 'Premium Barbershop',
    kapitalBank: 'Капиталбанк (Центральный)',

    // Branch addresses
    kapitalBankAddress: 'Юнусабадский район, улица Амира Темура, дом 1',
    asakaBankAddress: 'Чилонзар, проспект Шота Руставели, 42',
    clinic8Address: 'Сергели, улица Абдуллы Кодирия, 15',
    premiumBarberAddress: 'Мирабадский район, улица Захира ибн Абу Тахира, 8',
  },
  en: {
    // Auth
    welcome: 'Welcome 👋',
    loginSubtitle: 'Sign in to your account to continue.',
    phone: 'Phone number',
    password: 'Password',
    login: 'Continue',
    loggingIn: 'Signing in...',
    noAccount: 'Don\'t have an account?',
    register: 'Sign up',
    invalidPhonePassword: 'Please enter a valid phone number and password.',
    loginError: 'Error signing in.',
    registerTitle: 'Create new account',
    registerSubtitle: 'Enter your details to get started.',
    fullName: 'Full name',
    passwordConfirm: 'Confirm password',
    registerButton: 'Sign up',
    registerError: 'Error during registration.',
    
    // Home
    greeting: 'Hello, {{name}} 👋',
    greetingSubtitle: 'Where would you like to go today?',
    activeQueue: 'Active Queue',
    queueArrivedNotif: 'Your turn has arrived',
    ticket: 'Ticket',
    goToBooking: 'Go to bookings →',
    serviceTypes: 'Service types',
    nearby: 'Nearby branches',
    viewOnMap: 'View on map',
    all: 'All',
    clinic: 'Clinic',
    bank: 'Bank',
    barber: 'Barber',
    notary: 'Notary',
    waitTime: 'Wait time',
    
    // Bookings
    profile: 'Profile',
    myBookings: 'My bookings',
    language: 'Change language',
    notifications: 'Notifications',
    darkMode: 'Dark mode',
    logout: 'Log out',
    uzbek: 'Uzbek',
    russian: 'Russian',
    english: 'English',
    time: 'Time',
    status: 'Status',
    active: 'Active',
    upcoming: 'Upcoming',
    cancel: 'Cancel',
    enlargeQr: 'Tap to enlarge',
    close: 'Close',
    completed: 'Completed',
    cancelled: 'Cancelled',
    
    // Branch names
    asakaBank: 'Asaka Bank (Chilonzor)',
    clinic8: '8th Family Clinic',
    premiumBarber: 'Premium Barbershop',
    kapitalBank: 'Kapitalbank (Central)',
    
    // Branch details
    branchDetails: 'Branch details',
    queuePeople: 'People in queue',
    estimatedWaitTime: 'Estimated wait time',
    services: 'Services',
    cashService: 'Cash service',
    creditIssuance: 'Credit issuance',
    plasticCards: 'Plastic cards',
    mondayFriday: 'Mon-Fri: 09:00 - 18:00',

    // Branch addresses
    kapitalBankAddress: 'Yunusobod, Amir Temur Street 1',
    asakaBankAddress: 'Chilonzor, Shota Rustaveli Avenue 42',
    clinic8Address: 'Sergeli, Abdulla Qodiriy Street 15',
    premiumBarberAddress: 'Mirabad, Zahir Ibn Abu Tahir Street 8',
  },
} as const;

export function useTranslation(language: AppLanguage) {
  const t = translations[language];
  
  return {
    ...t,
    interpolate: (key: keyof typeof t, variables: Record<string, string>) => {
      let text: string = t[key] as string;
      Object.entries(variables).forEach(([key, value]) => {
        text = text.replace(`{{${key}}}`, value);
      });
      return text;
    },
  };
}
