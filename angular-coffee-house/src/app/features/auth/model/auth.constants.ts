import { UserData } from './auth.types';

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
