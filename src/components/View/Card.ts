import { IActions, IProductItem } from '../../types';
import { IEvents } from '../base/events';

export interface ICard {
	setCategory(value: string): void;
	setTitle(value: string): void;
	setImage(src: string, alt: string): void;
	setPrice(value: number | null): void;
	render(data: IProductItem, basketItems?: IProductItem[]): HTMLElement;
}

export class Card implements ICard {
	protected _cardElement: HTMLElement;
	protected _cardCategory: HTMLElement;
	protected _cardTitle: HTMLElement;
	protected _cardImage: HTMLImageElement;
	protected _cardPrice: HTMLElement;

	constructor(
		template: HTMLTemplateElement,
		protected events: IEvents,
		actions?: IActions
	) {
		this._cardElement = template.content
			.querySelector('.card')
			.cloneNode(true) as HTMLElement;
		this._cardCategory = this._cardElement.querySelector('.card__category');
		this._cardTitle = this._cardElement.querySelector('.card__title');
		this._cardImage = this._cardElement.querySelector('.card__image');
		this._cardPrice = this._cardElement.querySelector('.card__price');

		if (actions?.onClick) {
			this._cardElement.addEventListener('click', actions.onClick);
		}
	}

	setCategory(value: string): void {
		this._cardCategory.textContent = value;
		// Здесь может быть дополнительная логика для стилей категории
	}

	setTitle(value: string): void {
		this._cardTitle.textContent = value;
	}

	setImage(src: string, alt: string): void {
		this._cardImage.src = src;
		this._cardImage.alt = alt;
	}

	setPrice(value: number | null): void {
		this._cardPrice.textContent =
			value === null ? 'Бесценно' : `${value} синапсов`;
	}

	render(data: IProductItem): HTMLElement {
		this.setCategory(data.category);
		this.setTitle(data.title);
		this.setImage(data.image, data.title);
		this.setPrice(data.price);
		return this._cardElement;
	}
}
