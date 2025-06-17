import { IEvents } from '../base/events';
import { IProductItem } from '../../types';
import { Card } from './Card';

export interface IPage {
	renderProducts(
		products: IProductItem[],
		cardTemplate: HTMLTemplateElement,
		events: IEvents
	): void;
	updateBasketCounter(count: number): void;
}

export class Page implements IPage {
	protected _gallery: HTMLElement;
	protected _basketButton: HTMLButtonElement;
	protected _basketCounter: HTMLElement;
	protected events: IEvents;

	constructor(events: IEvents) {
		this.events = events;
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

	renderProducts(
		products: IProductItem[],
		cardTemplate: HTMLTemplateElement,
		events: IEvents
	): void {
		this._gallery.innerHTML = '';
		products.forEach((item) => {
			const card = new Card(cardTemplate, events, {
				onClick: () => events.emit('card:select', item),
			});
			this._gallery.append(card.render(item));
		});
	}

	updateBasketCounter(count: number): void {
		this._basketCounter.textContent = String(count);
	}
}
