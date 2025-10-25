import { UserData } from './responseTypes';

export const BASE_URL = 'https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com';

export const imageMap = {
  'Irish coffee': 'coffee-1.png',
  'Kahlua coffee': 'coffee-2.png',
  'Honey raf': 'coffee-3.png',
  'Ice cappuccino': 'coffee-4.png',
  Espresso: 'coffee-5.png',
  Latte: 'coffee-6.png',
  'Latte macchiato': 'coffee-7.png',
  'Coffee with cognac': 'coffee-8.png',

  Moroccan: 'tea-1.png',
  Ginger: 'tea-2.png',
  Cranberry: 'tea-3.png',
  'Sea buckthorn': 'tea-4.png',
  'English Breakfast': 'tea-5.png',
  'Green Jasmine': 'tea-6.png',
  Mint: 'tea-7.png',
  Chamomile: 'tea-8.png',
  'Jasmine Pearl': 'tea-9.png',
  'Berry Hibiscus': 'tea-10.png',

  'Marble cheesecake': 'dessert-1.png',
  'Red velvet': 'dessert-2.png',
  Cheesecakes: 'dessert-3.png',
  'Creme brulee': 'dessert-4.png',
  Pancakes: 'dessert-5.png',
  'Honey cake': 'dessert-6.png',
  'Chocolate cake': 'dessert-7.png',
  'Black forest': 'dessert-8.png',
  'Apple pie': 'dessert-9.png',
  'Fruit tart': 'dessert-10.png',
  'Lemon mousse': 'dessert-11.png',
  Brownie: 'dessert-12.png',
  Tiramisu: 'dessert-13.png',
  Pavlova: 'dessert-14.png',
};

export const ERR_MSG_LOGIN = 'Login must start with letter and contain at least 3 characters';
export const ERR_MSG_PASS = 'Password must contain at least 6 characters and one special';

export const undefinedUserData: UserData = {
  access_token: '',
  user: {
    id: -1,
    login: 'guest',
    city: '',
    street: '',
    houseNumber: 0,
    paymentMethod: '',
    createdAt: '',
  },
};
