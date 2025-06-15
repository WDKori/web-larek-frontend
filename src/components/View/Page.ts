import { IEvents } from '../base/events';
import { IProductItem } from '../../types';

export interface IPage {
	renderProducts(products: IProductItem[]): void;
	updateBasketCounter(count: number): void;
}

export class Page implements IPage {
	protected _gallery: HTMLElement;
	protected _basketButton: HTMLButtonElement;
	protected _basketCounter: HTMLElement;

	constructor(protected events: IEvents) {
		this._gallery = document.querySelector('.gallery');
		this._basketButton = document.querySelector('.header__basket');
		this._basketCounter = document.querySelector('.header__basket-counter');

		if (!this._basketButton) {
			console.error('Basket button not found!');
			return;
		}

		this._basketButton.addEventListener('click', () => {
			events.emit('basket:open');
		});
	}

	renderProducts(products: IProductItem[]): void {
		this._gallery.innerHTML = '';
		// Рендеринг продуктов будет осуществляться через Card компонент
	}

	updateBasketCounter(count: number): void {
		this._basketCounter.textContent = String(count);
	}
}
