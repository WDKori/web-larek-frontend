import { IEvents } from '../base/events';
import { IOrderForm, FormErrors } from '../../types';

export class FormOrder {
	protected _form: HTMLFormElement;
	protected _submitButton: HTMLButtonElement;
	protected _errorElement: HTMLElement;
	protected _paymentButtons: HTMLButtonElement[];
	protected _selectedPayment: string = '';

	constructor(template: HTMLTemplateElement, protected events: IEvents) {
		// Инициализация формы
		this._form = template.content
			.querySelector('.form')
			.cloneNode(true) as HTMLFormElement;
		this._submitButton = this._form.querySelector('.order__button');
		this._errorElement = this._form.querySelector('.form__errors');
		this._paymentButtons = Array.from(
			this._form.querySelectorAll('.button_alt')
		);

		// Обработчики для кнопок оплаты
		this._paymentButtons.forEach((button) => {
			button.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.selectedPayment = button.name;
			});
		});

		// Обработчик отправки формы
		this._form.addEventListener('submit', (e) => {
			e.preventDefault();
			this.events.emit('order:submit');
		});

		// Обработчик ввода данных
		this._form.addEventListener('input', (e) => {
			const target = e.target as HTMLInputElement;
			this.events.emit('order:input', {
				field: target.name as keyof IOrderForm,
				value: target.value,
			});
		});

		// Подписка на ошибки
		this.events.on('formErrors:change', (errors: FormErrors) => {
			this.error = Object.values(errors).join('; ');
		});
	}

	private set selectedPayment(value: string) {
		this._selectedPayment = value;
		this._updatePaymentStyles();
		this.events.emit('order:payment:changed', { payment: value });
	}

	private _updatePaymentStyles() {
		this._paymentButtons.forEach((button) => {
			button.classList.toggle(
				'button_alt-active',
				button.name === this._selectedPayment
			);
		});
	}

	set valid(value: boolean) {
		this._submitButton.disabled = !value;
	}

	set error(value: string) {
		this._errorElement.textContent = value;
	}

	clear() {
		this._form.reset();
		this._selectedPayment = '';
		this._updatePaymentStyles();
		this.error = '';
	}

	render(): HTMLFormElement {
		// Восстанавливаем состояние при рендере
		if (this._selectedPayment) {
			this._updatePaymentStyles();
		}
		return this._form;
	}
}
