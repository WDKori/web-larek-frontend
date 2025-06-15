import { IProductItem } from '../../types';
import { IEvents } from '../base/events';

export interface IBasketModel {
	basketProducts: IProductItem[];
	getCounter(): number;
	getSumAllProducts(): number;
	setSelectedСard(data: IProductItem): void;
	deleteCardToBasket(item: IProductItem): void;
	clearBasketProducts(): void;
}

export class BasketModel implements IBasketModel {
	protected _basketProducts: IProductItem[];
	protected events: IEvents;
	constructor(events: IEvents) {
		this._basketProducts = [];
		this.events = events;
	}

	set basketProducts(data: IProductItem[]) {
		this._basketProducts = data;
	}

	get basketProducts(): IProductItem[] {
		return this._basketProducts;
	}

	getCounter(): number {
		return this.basketProducts.length;
	}

	getSumAllProducts(): number {
		return this.basketProducts.reduce(
			(sum, item) => sum + (item.price || 0),
			0
		);
	}

	setSelectedСard(data: IProductItem): void {
		if (!this._basketProducts.some((item) => item.id === data.id)) {
			this._basketProducts.push(data);
			this.events.emit('basket:changed');
		}
	}

	deleteCardToBasket(item: IProductItem): void {
		const index = this._basketProducts.indexOf(item);
		if (index >= 0) {
			this._basketProducts.splice(index, 1);
			this.events.emit('basket:changed');
		}
	}

	clearBasketProducts(): void {
		this.basketProducts = [];
	}
}
