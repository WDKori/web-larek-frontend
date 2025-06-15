import { IProductItem } from '../../types';
import { IEvents } from '../base/events';

export interface IDataModel {
	products: IProductItem[];
	selectedProduct: IProductItem | null;
	previewProduct(item: IProductItem): void;
}

export class DataModel implements IDataModel {
	protected _products: IProductItem[] = [];
	protected _selectedProduct: IProductItem | null = null;

	constructor(protected events: IEvents) {}

	set products(items: IProductItem[]) {
		this._products = items;
		this.events.emit('products:changed');
	}

	get products(): IProductItem[] {
		return this._products;
	}

	get selectedProduct(): IProductItem | null {
		return this._selectedProduct;
	}

	previewProduct(item: IProductItem): void {
		this._selectedProduct = item;
		this.events.emit('product:preview', item);
	}
}
