export const CATEGORIES = [
  { id: '0', categoryStr: '', nameKey: 'all' as const, icon: '🌍' },
  { id: '1', categoryStr: 'poliklinika', nameKey: 'clinic' as const, icon: '🏥' },
  { id: '2', categoryStr: 'bank', nameKey: 'bank' as const, icon: '🏦' },
  { id: '3', categoryStr: 'sartaroshxona', nameKey: 'barber' as const, icon: '✂️' },
  { id: '4', categoryStr: 'avtomobil_yuvish', nameKey: 'carwash' as const, icon: '🚗' },
];

export const MOCK_BRANCHES = [
  { id: '1', categoryId: '2', nameKey: 'asakaBank' as const, address: 'Chilonzor 1-kvartal, 12-uy', waitTime: '15 min', status: 'Yashil' },
  { id: '2', categoryId: '1', nameKey: 'clinic8' as const, address: 'Yunusobod 4-mavze, 45-uy', waitTime: '45 min', status: 'Qizil' },
  { id: '3', categoryId: '3', nameKey: 'premiumBarber' as const, address: 'Mirobod tumani, 9-uy', waitTime: '5 min', status: 'Yashil' },
  { id: '4', categoryId: '2', nameKey: 'kapitalBank' as const, address: 'Yunusobod, Amir Temur 1-uy', waitTime: '20 min', status: 'Sariq' },
];
