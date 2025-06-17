import { IEvents } from '../base/events';
import { FormErrors, IOrderForm } from '../../types/index';

export interface IFormModel {
	payment: string;
	email: string;
	phone: string;
	address: string;
	errors: FormErrors;
	validateOrder(): boolean;
	validateContacts(): boolean;
	getOrderLot(): IOrderForm;
}

export class FormModel implements IFormModel {
	payment: string;
	email: string;
	phone: string;
	address: string;
	errors: FormErrors = {};

	constructor(protected events: IEvents) {}

	validateOrder(): boolean {
		const errors: FormErrors = {};
		if (!this.payment) errors.payment = 'Выберите способ оплаты';
		else if (!this.address) {
			errors.address = 'Укажите адрес';
		}

		this.errors = errors;
		this.events.emit('formErrors:change', errors);
		return Object.keys(errors).length === 0;
	}

	// Валидация данных строк "Email" и "Телефон"
	validateContacts(): boolean {
		const errors: FormErrors = {};
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const phoneRegex = /^\+?\d{10,15}$/;

		if (!this.email) {
			errors.email = 'Укажите email';
		} else if (!emailRegex.test(this.email)) {
			errors.email = 'Некорректный email';
		} else if (!this.phone) {
			errors.phone = 'Укажите телефон';
		} else if (!phoneRegex.test(this.phone)) {
			errors.phone = 'Некорректный телефон';
		}

		this.errors = errors;
		this.events.emit('formErrors:change', errors);
		return Object.keys(errors).length === 0;
	}

	updateOrderValidation() {
		const isValid = this.validateOrder();
		this.events.emit('order:validation', { valid: isValid });
		return isValid;
	}

	getOrderLot() {
		return {
			payment: this.payment,
			email: this.email,
			phone: this.phone,
			address: this.address,
		};
	}
}
