import { IEvents } from '../base/events';
import { IOrderForm } from '../../types';
import { FormModel } from '../Model/FormModel';

export interface IFormContacts {
	email: string;
	phone: string;
	valid: boolean;
	render(): HTMLFormElement;
	clear(): void;
}

export class FormContacts implements IFormContacts {
	protected _form: HTMLFormElement;
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
		this._submitButton = this._form.querySelector('.button');
		this._errorElement = this._form.querySelector('.form__errors');

		this._form.addEventListener('submit', (e) => {
			e.preventDefault();

			if (this.formModel.validateContacts()) {
				this.events.emit('order:complete');
			}
		});

		this._form.addEventListener('input', (e) => {
			const target = e.target as HTMLInputElement;
			const field = target.name as keyof IOrderForm;
			events.emit('contacts:input', { field, value: target.value });
		});
	}

	set email(value: string) {
		(this._form.elements.namedItem('email') as HTMLInputElement).value = value;
	}

	set phone(value: string) {
		(this._form.elements.namedItem('phone') as HTMLInputElement).value = value;
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
		this.error = '';
	}
}
