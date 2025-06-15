import { IEvents } from '../base/events';
import { IProductItem } from '../../types';

export interface IBasketItem {
	index: number;
	title: string;
	price: number | null;
	render(): HTMLElement;
}

export class BasketItem implements IBasketItem {
	protected _container: HTMLElement;
	protected _indexElement: HTMLElement;
	protected _titleElement: HTMLElement;
	protected _priceElement: HTMLElement;
	protected _deleteButton: HTMLButtonElement;

	constructor(
		template: HTMLTemplateElement,
		protected events: IEvents,
		protected item: IProductItem, // Принимаем продукт напрямую
		protected onRemove?: () => void // Добавляем опциональный callback
	) {
		this._container = template.content
			.querySelector('.basket__item')
			.cloneNode(true) as HTMLElement;
		this._indexElement = this._container.querySelector('.basket__item-index');
		this._titleElement = this._container.querySelector('.card__title');
		this._priceElement = this._container.querySelector('.card__price');
		this._deleteButton = this._container.querySelector('.basket__item-delete');

		this._deleteButton.addEventListener('click', () => {
			if (this.onRemove) this.onRemove();
		});
	}

	set index(value: number) {
		this._indexElement.textContent = String(value);
	}

	set title(value: string) {
		this._titleElement.textContent = value;
	}

	set price(value: number | null) {
		this._priceElement.textContent =
			value === null ? 'Бесценно' : `${value} синапсов`;
	}

	render(): HTMLElement {
		this.title = this.item.title;
		this.price = this.item.price;
		return this._container;
	}
}
