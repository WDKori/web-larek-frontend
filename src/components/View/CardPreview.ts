import { Card, ICard } from './Card';
import { IActions, IProductItem } from '../../types';
import { IEvents } from '../base/events';

export interface ICardPreview extends ICard {
	setDescription(value: string): void;
	setButtonState(isInBasket: boolean, hasPrice: boolean): void;
}

export class CardPreview extends Card implements ICardPreview {
	protected _description: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(
		template: HTMLTemplateElement,
		protected events: IEvents,
		actions?: IActions
	) {
		super(template, events, actions);
		this._description = this._cardElement.querySelector('.card__text');
		this._button = this._cardElement.querySelector('.card__button');

		this._button.addEventListener('click', () => {
			this.events.emit('card:addBasket');
		});
	}

	setDescription(value: string): void {
		this._description.textContent = value;
	}

	setButtonState(isInBasket: boolean, hasPrice: boolean): void {
		if (!hasPrice) {
			this._button.textContent = 'Не продается';
			this._button.disabled = true;
		} else if (isInBasket) {
			this._button.textContent = 'Уже в корзине';
			this._button.disabled = true;
		} else {
			this._button.textContent = 'Купить';
			this._button.disabled = false;
		}
	}

	render(data: IProductItem, basketItems: IProductItem[] = []): HTMLElement {
		super.render(data);
		this.setDescription(data.description);
		const inBasket = basketItems.some((item) => item.id === data.id);
		this.setButtonState(inBasket, data.price !== null);
		return this._cardElement;
	}
}
