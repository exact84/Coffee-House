import { UserData } from './responseTypes';

export class CurrentUser {
  public static instance: CurrentUser | undefined;
  public userData: UserData | undefined;

  constructor(userData: UserData) {
    if (CurrentUser.instance) return CurrentUser.instance;
    this.userData = userData;
    CurrentUser.instance = this;
    sessionStorage.setItem('CoffeeHouseUser', JSON.stringify(userData));
  }
  public static restoreInstance(): void {
    const userData = JSON.parse(sessionStorage.getItem('CoffeeHouseUser') ?? '{}');
    if (userData) CurrentUser.instance = new CurrentUser(userData);
  }

  public static clearInstance(): void {
    sessionStorage.removeItem('CoffeeHouseUser');
    CurrentUser.instance = undefined;
  }
}
