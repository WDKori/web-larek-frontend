import { IEvents } from '../base/events';

export interface IBasket {
	setItems(items: HTMLElement[]): void; // Изменяем тип параметра
	setTotal(sum: number): void;
	render(): HTMLElement;
}

export class Basket implements IBasket {
	basket: HTMLElement;
	title: HTMLElement;
	basketList: HTMLElement;
	button: HTMLButtonElement;
	basketPrice: HTMLElement;

	constructor(template: HTMLTemplateElement, protected events: IEvents) {
		this.basket = template.content
			.querySelector('.basket')
			.cloneNode(true) as HTMLElement;
		this.title = this.basket.querySelector('.modal__title');
		this.basketList = this.basket.querySelector('.basket__list');
		this.button = this.basket.querySelector('.basket__button');
		this.basketPrice = this.basket.querySelector('.basket__price');

		this.button.addEventListener('click', () => {
			this.events.emit('order:open');
		});
	}

	setItems(items: HTMLElement[]): void {
		// Обновляем реализацию
		if (items.length) {
			this.basketList.replaceChildren(...items);
			this.button.disabled = false;
		} else {
			this.button.disabled = true;
			this.basketList.innerHTML = '<p>Корзина пуста</p>';
		}
	}

	setTotal(sum: number): void {
		this.basketPrice.textContent = `${sum} синапсов`;
	}

	render(): HTMLElement {
		this.title.textContent = 'Корзина';
		return this.basket;
	}
}
