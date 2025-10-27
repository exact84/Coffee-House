import { CartItem, OrderData, OrderItem } from './cards/types';
import { CurrentUser } from './user';

export function newElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text: string,
  parent: HTMLElement | undefined = undefined,
  classList: string[] = [],
  attributes: Record<string, string | boolean> = {}
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (classList.length > 0) {
    element.classList.add(...classList);
  }

  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'type' && tag === 'input') {
      element.setAttribute('type', String(value));
    } else if (key === 'readonly' && value === 'true' && tag === 'input') {
      element.setAttribute('readonly', '');
    } else {
      element.setAttribute(key, String(value));
    }
  }
  if (parent !== undefined) {
    parent.append(element);
  }
  return element;
}

export async function loadLayout() {
  const header = await fetch('./components/header.html').then((response) => response.text());
  const footer = await fetch('./components/footer.html').then((response) => response.text());

  document.getElementById('header')!.innerHTML = header;
  document.getElementById('contact')!.innerHTML = footer;

  updateCartCount();
}

export function showError(target: HTMLInputElement, message: string) {
  let errorDiv = target.parentElement?.querySelector<HTMLDivElement>('.error-msg');
  if (!errorDiv) {
    errorDiv = newElement('div', message, target.parentElement!, ['error-msg']);
  } else {
    errorDiv.textContent = message;
  }
  target.classList.remove('valid');
  target.classList.add('invalid');
}

export function hideError(target: HTMLInputElement) {
  const errorDiv = target.parentElement?.querySelector<HTMLDivElement>('.error-msg');
  if (errorDiv) errorDiv.remove();
  target.classList.remove('invalid');
}

export function checkFormValidity(inputContainer: HTMLElement): boolean {
  const inputs = inputContainer.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
    '.input-field'
  );

  const allValid = Array.from(inputs).every((el) => {
    if (el.classList.contains('invalid') || !el.value.trim()) return false;
    return true;
  });
  return allValid;
}

export function updateCartCount() {
  const cartCountEl = document.getElementById('cart-count');
  if (cartCountEl && CurrentUser.instance) {
    cartCountEl.textContent =
      CurrentUser.instance.countCart === 0 ? '' : CurrentUser.instance.countCart.toString();
  }
}

export function transformToOrderData(rawItems: CartItem[]): OrderData {
  const items: OrderItem[] = rawItems.map((item) => ({
    productId: item.productId,
    size: item.size,
    additives: item.additives,
    quantity: item.quantity,
  }));

  const totalPrice = rawItems.reduce((sum, item) => {
    const itemTotal = parseFloat(item.totalPrice);
    return sum + (isNaN(itemTotal) ? 0 : itemTotal);
  }, 0);

  return { items, totalPrice };
}
