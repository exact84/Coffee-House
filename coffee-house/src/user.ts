import { getProfile } from './request';
import { AuthResponse, UserData } from './responseTypes';

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
    if (savedUserToken) {
      try {
        const profileResponse: AuthResponse = await getProfile();
        CurrentUser.instance = new CurrentUser(profileResponse.data);
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
}
