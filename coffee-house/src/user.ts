import { CartItem } from './cards/types';
import { getProfile } from './request';
import { ApiResponseItem, User, UserData } from './responseTypes';

export class CurrentUser {
  public static instance: CurrentUser | undefined;
  public userData: UserData | undefined;

  constructor(userData: UserData) {
    if (CurrentUser.instance) {
      CurrentUser.instance.userData = userData;
      return CurrentUser.instance;
    }
    this.userData = userData;
    CurrentUser.instance = this;
    if (userData.access_token) localStorage.setItem('CoffeeHouseUser', userData.access_token);
    console.log('Профиль сохранён: ', userData);
  }

  public static async restoreInstance(): Promise<void> {
    const savedUserToken = localStorage.getItem('CoffeeHouseUser');
    console.log('Токен: ', savedUserToken);
    if (savedUserToken) {
      try {
        const profileResponse: ApiResponseItem<User> = await getProfile();
        CurrentUser.instance = new CurrentUser({
          access_token: savedUserToken,
          user: profileResponse.data,
        });
        console.log('Профиль восстановлен: ', profileResponse);
      } catch (error) {
        console.log('Профиль не восстановлен: ', error);
      }
    }
  }

  public static clearInstance(): void {
    localStorage.removeItem('CoffeeHouseUser');
    CurrentUser.instance = undefined;
  }

  public static addToCart(cartItem: CartItem): void {
    const cartName = 'CoffeeHouseCartItems-' + CurrentUser.instance?.userData?.user?.login;
    const cartItems = localStorage.getItem(cartName);
    if (cartItems) {
      const items: CartItem[] = JSON.parse(cartItems);
      cartItem.id = items[items.length - 1].id + 1;
      items.push(cartItem);
      localStorage.setItem(cartName, JSON.stringify(items));
      return;
    } else {
      localStorage.setItem(cartName, JSON.stringify([cartItem]));
    }
  }
}
