import { IEvents } from '../base/events';
import { IOrderForm } from '../../types';
import { FormModel } from '../Model/FormModel';

export interface IFormOrder {
	payment: string;
	address: string;
	valid: boolean;
	render(): HTMLFormElement;
	clear(): void;
}

export class FormOrder implements IFormOrder {
	protected _form: HTMLFormElement;
	protected _buttons: HTMLButtonElement[];
	protected _submitButton: HTMLButtonElement;
	protected _errorElement: HTMLElement;

	constructor(
		template: HTMLTemplateElement,
		protected events: IEvents,
		protected formModel: FormModel
	) {
		this._form = template.content
			.querySelector('.form')
			.cloneNode(true) as HTMLFormElement;
		this._buttons = Array.from(this._form.querySelectorAll('.button_alt'));
		this._submitButton = this._form.querySelector('.order__button');
		this._errorElement = this._form.querySelector('.form__errors');

		this._buttons.forEach((button) => {
			button.addEventListener('click', () => {
				const payment = button.name; // Получаем значение

				this.payment = payment; // Сохраняем в форме
				events.emit('order:payment:changed', {
					payment: payment, // Явно передаём значение
					forceValidate: true,
				});
			});
		});

		this._form.addEventListener('submit', (e) => {
			e.preventDefault();
			if (this.formModel.validateOrder()) {
				events.emit('order:submit');
			}
		});

		this._form.addEventListener('input', (e) => {
			const target = e.target as HTMLInputElement;
			const field = target.name as keyof IOrderForm;
			events.emit('order:input', {
				field,
				value: target.value,
				validate: true,
			});
		});
	}

	set payment(value: string) {
		this._buttons.forEach((button) => {
			button.classList.toggle('button_alt-active', button.name === value);
		});
	}

	set address(value: string) {
		(this._form.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	set valid(value: boolean) {
		this._submitButton.disabled = !value;
	}

	set error(value: string) {
		this._errorElement.textContent = value;
	}

	render(): HTMLFormElement {
		return this._form;
	}

	clear(): void {
		this._form.reset();
		this.payment = '';
		this.error = '';
	}
}
