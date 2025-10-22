import { checkFormValidity, hideError, loadLayout, newElement, showError } from './utils';
import { CurrentUser } from './user';
import { register } from './request';
import { ApiResponseItem, UserData } from './responseTypes';
import { ERR_MSG_LOGIN, ERR_MSG_PASS } from './consts';

const cities = ['Almaty', 'Astana', 'Karaganda'];

const streetsByCity: Record<string, string[]> = {
  almaty: [
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
  astana: [
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
  karaganda: [
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

loadLayout();
registerUser();

export function registerUser(): void {
  const main: HTMLElement | null = document.querySelector('.register');
  if (!main) return;
  const registerContainer = newElement('div', '', main, ['register-container']);

  newElement('h2', 'Registration', registerContainer, ['typography-heading-2']);
  const inputContainer = newElement('form', '', registerContainer, [
    'input-container',
    'typography-body-medium',
  ]);

  const labelName = newElement('label', 'Login', inputContainer, ['label-input'], {
    for: 'username',
  });
  const inputName = newElement('input', '', labelName, ['input-field'], {
    id: 'username',
    type: 'text',
  });

  const labelPass = newElement('label', 'Password', inputContainer, ['label-input'], {
    for: 'password',
  });
  const inputPass = newElement('input', '', labelPass, ['input-field'], {
    id: 'password',
    type: 'password',
  });

  const labelPassConfirm = newElement(
    'label',
    'Confirm Password',
    inputContainer,
    ['label-input'],
    {
      for: 'conf-password',
    }
  );
  const inputPassConfirm = newElement('input', '', labelPassConfirm, ['input-field'], {
    id: 'conf-password',
    type: 'password',
  });

  const labelCity = newElement('label', 'City', inputContainer, ['label-input', 'label-small'], {
    for: 'city',
  });
  const inputCity = newElement('select', '', labelCity, ['input-field', 'dropdown'], {
    id: 'city',
    name: 'city',
    type: 'text',
  });
  newElement('option', 'Choose a city', inputCity, [], {
    value: '',
    disabled: true,
    selected: true,
  });
  cities.forEach((city) => {
    newElement('option', city, inputCity, [], { value: city.toLowerCase() });
  });

  const labelStreet = newElement(
    'label',
    'Street',
    inputContainer,
    ['label-input', 'label-small'],
    {
      for: 'street',
    }
  );
  const inputStreet = newElement('select', '', labelStreet, ['input-field'], {
    id: 'street',
    name: 'street',
    type: 'text',
  });
  newElement('option', 'Choose a street', inputStreet, [], {
    value: '',
    disabled: true,
    selected: true,
  });
  inputCity.addEventListener('change', () => {
    const city = inputCity.value;
    const streets = streetsByCity[city] || [];

    inputStreet.querySelectorAll('option:not([disabled])').forEach((opt) => opt.remove());

    streets.forEach((street) => {
      newElement('option', street, inputStreet, [], { value: street });
    });

    inputStreet.value = '';
  });

  const labelHouseNumber = newElement(
    'label',
    'House number',
    inputContainer,
    ['label-input', 'label-small'],
    {
      for: 'houseNumber',
    }
  );
  const inputHouseNumber = newElement('input', '', labelHouseNumber, ['input-field'], {
    id: 'houseNumber',
    type: 'text',
  });

  const labelPaymentMethod = newElement('label', 'Pay by', inputContainer, ['label-radio'], {
    for: 'paymentMethod',
  });

  const paymentContainer = newElement('div', '', labelPaymentMethod, ['payment-container']);

  const cashContainer = newElement('div', '', paymentContainer, ['cash-container']);
  newElement('input', '', cashContainer, ['input-radio'], {
    type: 'radio',
    name: 'payment',
    value: 'cash',
    id: 'cash',
    checked: true,
  });
  newElement('label', 'Cash', cashContainer, ['radio-option'], { for: 'cash' });

  const cardContainer = newElement('div', '', paymentContainer, ['card-container']);
  newElement('input', '', cardContainer, ['input-radio'], {
    type: 'radio',
    name: 'payment',
    value: 'card',
    id: 'card',
  });
  newElement('label', 'Card', cardContainer, ['radio-option'], { for: 'card' });

  const buttonContainer = newElement('div', '', registerContainer, ['button-container']);
  const btnRegister = newElement('button', 'Registration', buttonContainer, [
    'register-btn',
    'typography-action-link-button',
  ]);
  btnRegister.disabled = true;
  const divError = newElement('div', '', buttonContainer, ['error-msg']);

  inputContainer.addEventListener('focusin', (event) => {
    const target = event.target as HTMLInputElement;
    hideError(target);
  });

  inputContainer.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    target.classList.remove('invalid');
    if (!target.classList.contains('input-field')) return;
    btnRegister.disabled = !checkFormValidity(inputContainer);
  });

  inputContainer.addEventListener('focusout', (event) => {
    const target = event.target as HTMLInputElement;
    if (!target.classList.contains('input-field')) return;
    const value = target.value.trim();
    const id = target.id;
    let isValid = true;
    let message = '';

    switch (id) {
      case 'username':
        // isValid = /^[A-Za-z][A-Za-z0-9]{2,}$/.test(value);
        isValid = /^[A-Za-z][A-Za-z0-9]{2,}$/.test(value); // не забыть убрать цифры
        message = ERR_MSG_LOGIN;
        break;

      case 'password':
        isValid = /^(?=.*[^A-Za-z0-9]).{6,}$/.test(value);
        message = ERR_MSG_PASS;
        break;

      case 'conf-password':
        isValid =
          value === (document.getElementById('password') as HTMLInputElement)?.value &&
          value.length > 0;
        message = 'Passwords do not match';
        break;

      case 'city':
        isValid = value.length > 1;
        message = 'Choose a city';
        break;

      case 'street':
        isValid = value.length > 1;
        message = 'Choose a street';
        break;

      case 'houseNumber':
        isValid = Number(value) > 1;
        message = 'House number must be greater than 1';
        break;
    }

    // Подсветка, сообщение ошибки и значок
    if (!isValid) {
      target.classList.add('invalid');
      showError(target, message);
    } else {
      target.classList.remove('invalid');
      hideError(target);
    }
    btnRegister.disabled = !checkFormValidity(inputContainer);
  });

  async function handleRegisterUser(): Promise<void> {
    let result: ApiResponseItem<UserData> | undefined = undefined;
    const request = {
      login: inputName.value.trim(),
      password: inputPass.value.trim(),
      confirmPassword: inputPassConfirm.value.trim(),
      city: inputCity.value.trim(),
      street: inputStreet.value.trim(),
      houseNumber: Number(inputHouseNumber.value.trim()),
      paymentMethod:
        document.querySelector<HTMLInputElement>('input[name="payment"]:checked')?.value ?? '',
    };

    // console.log(request);
    divError.textContent = '';
    if (!divError.textContent) {
      divError.classList.remove('visible');
      try {
        result = await register(request);
      } catch (error) {
        divError.textContent = error instanceof Error ? error.message : 'Auth error';
      }
    }
    if (result) {
      if (result.message === 'User registered successfully') {
        new CurrentUser(result.data);
        // console.log(result.data);
        window.location.href = '/cart.html';
      } else {
        divError.classList.add('visible');
        divError.textContent = result.error ?? 'Register error';
      }
    }
  }

  btnRegister.addEventListener('click', (): void => {
    void handleRegisterUser();
  });

  inputContainer.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      void handleRegisterUser();
    }
  });
}
