import { IEvents } from '../base/events';
import { FormModel } from '../Model/FormModel';

export interface ISuccess {
	total: number;
	render(): HTMLElement;
}

export class Success implements ISuccess {
	protected _container: HTMLElement;
	protected _description: HTMLElement;
	protected _closeButton: HTMLButtonElement;

	constructor(
		template: HTMLTemplateElement,
		protected events: IEvents,
		protected formModel: FormModel
	) {
		this._container = template.content
			.querySelector('.order-success')
			.cloneNode(true) as HTMLElement;
		this._description = this._container.querySelector(
			'.order-success__description'
		);
		this._closeButton = this._container.querySelector('.order-success__close');

		this._closeButton.addEventListener('click', () => {
			events.emit('success:close');
		});
	}

	set total(value: number) {
		this._description.textContent = `Списано ${value} синапсов`;
	}

	render(): HTMLElement {
		return this._container;
	}
}
