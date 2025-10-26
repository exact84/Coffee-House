import { checkFormValidity, hideError, loadLayout, newElement, showError } from './utils';
import { CurrentUser } from './user';
import { authRequest } from './request';
import { ApiResponseItem, AuthData, UserData } from './responseTypes';
import { ERR_MSG_LOGIN, ERR_MSG_PASS } from './consts';

loadLayout();
createLogin();

export function createLogin(): void {
  const main: HTMLElement | null = document.querySelector('.login');
  if (!main) return;
  const loginContainer = newElement('form', '', main, ['login-container'], {
    autocomplete: 'off',
  });
  newElement('h2', 'Sign In', loginContainer, ['typography-heading-2']);
  const inputContainer = newElement('form', '', loginContainer, [
    'input-container-login',
    'typography-body-medium',
  ]);
  inputContainer.style.flexDirection = 'column';
  const labelName = newElement('label', 'Login:', inputContainer, ['label-input'], {
    for: 'username',
  });
  const inputName = newElement('input', '', labelName, ['input-field'], {
    id: 'username',
    placeholder: 'Placeholder',
  });
  const labelPass = newElement('label', 'Password:', inputContainer, ['label-input'], {
    for: 'password',
  });
  const inputPass = newElement('input', '', labelPass, ['input-field'], {
    id: 'password',
    type: 'password',
    placeholder: 'Placeholder',
  });

  const buttonContainer = newElement('div', '', loginContainer, ['button-container']);
  const btnLogin = newElement('button', 'Sign In', buttonContainer, [
    'register-btn',
    'typography-action-link-button',
  ]);
  btnLogin.disabled = true;
  const divError = newElement('div', '', buttonContainer, ['error-msg']);

  // requestAnimationFrame(() => {
  //   const event = new Event('input', { bubbles: true });
  //   inputName.dispatchEvent(event);
  // });

  // requestAnimationFrame(() => {
  //   console.log('Before: ', inputName.value);
  //   // inputName.focus();
  //   inputName.blur();
  //   loginContainer.click();
  //   setTimeout(() => {
  //     inputName.focus();
  //     document.getElementById('username')!.focus();
  //     console.log('in setTimeout 3000ms: ', inputName.value);
  //   }, 3000);
  //   console.log('After: ', inputName.value);
  //   const formValid = checkFormValidity(inputContainer);
  //   btnLogin.disabled = !formValid;
  // });

  inputContainer.addEventListener('focusin', (event) => {
    const target = event.target as HTMLInputElement;
    hideError(target);
  });

  inputContainer.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    target.classList.remove('invalid');
    if (!target.classList.contains('input-field')) return;
    btnLogin.disabled = !checkFormValidity(inputContainer);
  });

  inputContainer.addEventListener('focusout', (event) => {
    console.log('focusout: ', inputName.value);
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
    }

    // Подсветка, сообщение ошибки и значок
    console.log('focusout result, isValid:', isValid);
    if (!isValid) {
      target.classList.add('invalid');
      showError(target, message);
    } else {
      target.classList.remove('invalid');
      hideError(target);
    }
    btnLogin.disabled = !checkFormValidity(inputContainer);
  });

  async function handleLogin(): Promise<void> {
    let result: ApiResponseItem<UserData> | undefined = undefined;
    const request: AuthData = {
      login: inputName.value.trim(),
      password: inputPass.value.trim(),
    };

    divError.textContent = '';
    if (!divError.textContent) {
      divError.classList.remove('visible');
      try {
        result = await authRequest<AuthData>(request, 'login');
      } catch (error) {
        divError.textContent = error instanceof Error ? error.message : 'Auth error';
      }
    }
    if (result) {
      if (result.message === 'Login successful') {
        new CurrentUser(result.data);
        console.log(result);
        window.location.href = '/cart.html';
      } else {
        divError.classList.add('visible');
        console.log(result);
        divError.textContent = result.error ?? 'Login error';
      }
    }
  }

  btnLogin.addEventListener('click', (): void => {
    void handleLogin();
  });

  inputContainer.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      void handleLogin();
    }
  });

  loginContainer.addEventListener('submit', (e) => {
    e.preventDefault();
  });
}
