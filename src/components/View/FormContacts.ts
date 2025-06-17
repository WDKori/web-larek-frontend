import { IEvents } from '../base/events';
import { IOrderForm, FormErrors } from '../../types';

export class FormContacts {
	protected _form: HTMLFormElement;
	protected _submitButton: HTMLButtonElement;
	protected _errorElement: HTMLElement;

	constructor(template: HTMLTemplateElement, protected events: IEvents) {
		this._form = template.content
			.querySelector('.form')
			.cloneNode(true) as HTMLFormElement;
		this._submitButton = this._form.querySelector('.button');
		this._errorElement = this._form.querySelector('.form__errors');

		this._form.addEventListener('submit', (e) => {
			e.preventDefault();
			this.events.emit('contacts:submit');
		});

		this._form.addEventListener('input', (e) => {
			const target = e.target as HTMLInputElement;
			this.events.emit('contacts:input', {
				field: target.name as keyof IOrderForm,
				value: target.value,
			});
		});

		this.events.on('formErrors:change', (errors: FormErrors) => {
			this.error = Object.values(errors).join('; ');
		});
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
