import { CartItem } from './cards/types';
import { undefinedUserData } from './consts';
import { getProfile } from './request';
import { ApiResponseItem, User, UserData } from './responseTypes';

export class CurrentUser {
  public static instance: CurrentUser | undefined;
  public userData: UserData | undefined;
  public countCart = 0;

  constructor(userData: UserData) {
    if (CurrentUser.instance) {
      CurrentUser.instance.userData = userData;
      return CurrentUser.instance;
    }
    this.userData = userData;
    CurrentUser.instance = this;
    if (userData.access_token) localStorage.setItem('CoffeeHouseUser', userData.access_token);
  }

  public static async restoreInstance(): Promise<void> {
    const savedUserToken = localStorage.getItem('CoffeeHouseUser');
    if (savedUserToken) {
      try {
        const profileResponse: ApiResponseItem<User> = await getProfile();
        CurrentUser.instance = new CurrentUser({
          access_token: savedUserToken,
          user: profileResponse.data,
        });

        // Clear guest-cart
        //localStorage.removeItem('CoffeeHouseCartItems-guest');

        console.log('Профиль восстановлен: ', profileResponse);
      } catch (error) {
        console.log('Профиль не восстановлен: ', error);
        CurrentUser.clearInstance();
      }
    } else {
      CurrentUser.clearInstance();
    }
    if (CurrentUser.instance) {
      const cartName = 'CoffeeHouseCartItems-' + CurrentUser.instance?.userData?.user?.login;
      const cartItems = localStorage.getItem(cartName);
      CurrentUser.instance.countCart = cartItems ? JSON.parse(cartItems).length : 0;
    }
  }

  public static clearInstance(): void {
    localStorage.removeItem('CoffeeHouseUser');
    new CurrentUser(undefinedUserData);
  }

  public static addToCart(cartItem: CartItem): void {
    const cartName = 'CoffeeHouseCartItems-' + CurrentUser.instance?.userData?.user?.login;
    const cartItems = localStorage.getItem(cartName);
    if (cartItems) {
      const items: CartItem[] = JSON.parse(cartItems);
      if (items.length === 0) {
        cartItem.id = 1;
      } else {
        cartItem.id = items[items.length - 1].id + 1;
      }
      items.push(cartItem);
      localStorage.setItem(cartName, JSON.stringify(items));
      CurrentUser.instance!.countCart = items.length;
      return;
    } else {
      localStorage.setItem(cartName, JSON.stringify([cartItem]));
    }
  }
}
