export function newElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text: string,
  parent: HTMLElement | undefined = undefined,
  classList: string[] = [],
  attributes: Record<string, string> = {}
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (classList.length > 0) {
    element.classList.add(...classList);
  }

  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'type' && tag === 'input') {
      element.setAttribute('type', value);
    } else if (key === 'readonly' && value === 'true' && tag === 'input') {
      element.setAttribute('readonly', '');
    } else {
      element.setAttribute(key, value);
    }
  }
  if (parent !== undefined) {
    parent.append(element);
  }
  return element;
}
