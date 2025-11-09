export const ERR_MSG_LOGIN = 'Login must contain only letters, at least 3 characters';
export const ERR_MSG_PASS = 'Password must contain at least 6 characters and one special';

export const cities = ['Almaty', 'Astana', 'Karaganda'];

export const streetsByCity: Record<string, string[]> = {
  Almaty: [
    'Abay',
    'Zhibek Zholy',
    'Pushkin',
    'Gogol',
    'Sailanov',
    'Mametova',
    'Dostyk',
    'Rozybakiyev',
    'Satpayev',
    'Kazybek',
  ],
  Astana: [
    'Nurly Zhol',
    'Mangilik El',
    'Abai',
    'Turkestan',
    'Bogenbay',
    'Kabanbay',
    'Zhenis',
    'Saryarka',
    'Satpayev',
    'Yesil',
  ],
  Karaganda: [
    'Lobody',
    'Bukhar Zhyray',
    'Respublica',
    'Abay',
    'Satpayev',
    'Kirov',
    'Gogol',
    'Zataevich',
    'Amanzholov',
    'Seifullin',
  ],
};
