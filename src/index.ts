import './scss/styles.scss';

import { CDN_URL, API_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { ApiModel } from './components/Model/ApiModel';
import { DataModel } from './components/Model/DataModel';
import { Card } from './components/View/Card';
import { CardPreview } from './components/View/CardPreview';
import { IOrderForm, IProductItem, IOrderLot } from './types';
import { Modal } from './components/View/Modal';
import { ensureElement } from './utils/utils';
import { BasketModel } from './components/Model/BasketModel';
import { Basket } from './components/View/Basket';
import { BasketItem } from './components/View/BasketItem';
import { FormModel } from './components/Model/FormModel';
import { FormOrder as Order } from './components/View/FormOrder';
import { FormContacts as Contacts } from './components/View/FormContacts';
import { Success } from './components/View/Success';
import { Page } from './components/View/Page';

// Получаем шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const apiModel = new ApiModel(CDN_URL, API_URL);

const events = new EventEmitter();
const page = new Page(events);
const dataModel = new DataModel(events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(basketTemplate, events);
const basketModel = new BasketModel(events);

events.on('basket:changed', () => {
	const count = basketModel.getCounter();

	const counter = document.querySelector('.header__basket-counter');
	if (counter) counter.textContent = String(count);
});
const formModel = new FormModel(events);

const order = new Order(orderTemplate, events);
const contacts = new Contacts(contactsTemplate, events);

/*** Просмотр карточки товара ***/
events.on('card:select', (item: IProductItem) => {
	dataModel.previewProduct(item);
});

events.on('product:preview', (item: IProductItem) => {
	const cardPreview = new CardPreview(cardPreviewTemplate, events);
	modal.content = cardPreview.render(item, basketModel.basketProducts);
	modal.open();
});

/*** Работа с корзиной ***/
events.on('card:addBasket', () => {
	if (dataModel.selectedProduct) {
		basketModel.setSelectedСard(dataModel.selectedProduct);
		basket.setTotal(basketModel.getSumAllProducts());
		modal.close();
	}
});

events.on('basket:open', () => {
	basket.setTotal(basketModel.getSumAllProducts());

	const basketItems = basketModel.basketProducts.map((item, index) => {
		const basketItem = new BasketItem(
			cardBasketTemplate,
			events,
			item, // Передаем продукт напрямую
			() => events.emit('basket:item:remove', item) // Callback для удаления
		);
		basketItem.index = index + 1;
		return basketItem.render();
	});

	basket.setItems(basketItems);

	modal.content = basket.render();

	modal.open();
});

events.on('basket:item:remove', (item: IProductItem) => {
	basketModel.deleteCardToBasket(item);
	basket.setTotal(basketModel.getSumAllProducts());

	const updatedItems = basketModel.basketProducts.map((item, index) => {
		const basketItem = new BasketItem(cardBasketTemplate, events, item, () =>
			events.emit('basket:item:remove', item)
		);
		basketItem.index = index + 1;
		return basketItem.render();
	});

	basket.setItems(updatedItems);
});

/*** Оформление заказа ***/
events.on('order:open', () => {
	const basketItems = basketModel.basketProducts.map((item) => item.id);
	const total = basketModel.getSumAllProducts();
	modal.content = order.render();
	modal.open();
});

events.on('order:payment:changed', (data: { payment: string }) => {
	formModel.payment = data.payment;
	order.valid = formModel.validateOrder();
	events.emit('formErrors:change', formModel.errors);
});

events.on('order:input', (data: { field: keyof IOrderForm; value: string }) => {
	formModel[data.field] = data.value;
	order.valid = formModel.validateOrder();
	events.emit('formErrors:change', formModel.errors);
});

events.on('order:submit', () => {
	if (formModel.validateOrder()) {
		events.emit('contacts:open');
	}
});

/*** Контактные данные ***/

events.on('contacts:open', () => {
	modal.content = contacts.render();
	modal.open();
});

events.on(
	'contacts:input',
	(data: { field: keyof IOrderForm; value: string }) => {
		formModel[data.field] = data.value;
		contacts.valid = formModel.validateContacts();
	}
);

events.on('contacts:submit', () => {
	if (formModel.validateContacts()) {
		events.emit('success:open');
	} else {
		events.emit('formErrors:change', formModel.errors);
	}
});

/*** Успешное оформление ***/

// events.on('order:complete', () => {
//	events.emit('success:open');
// });
events.on('success:open', () => {
	const orderData: IOrderLot = {
		...formModel.getOrderLot(), // Данные формы (payment, email, phone, address)
		items: basketModel.basketProducts.map((item) => item.id), // Товары из корзины
		total: basketModel.getSumAllProducts(), // Сумма из корзины
	};
	apiModel
		.postOrderLot(orderData)
		.then(() => {
			const success = new Success(successTemplate, events);
			success.total = basketModel.getSumAllProducts();
			modal.content = success.render();
			basketModel.clearBasketProducts();
			basket.setTotal(0);
			basket.setItems([]);
			modal.open();
		})
		.catch(console.error);
});

events.on('success:close', () => modal.close());

/*** Блокировка прокрутки ***/
events.on('modal:open', () => {
	modal.locked = true;
});

events.on('modal:close', () => {
	modal.locked = false;
});

/*** Загрузка данных ***/
apiModel.getListProductCard().then((data) => {
	dataModel.products = data;
	page.renderProducts(dataModel.products, cardCatalogTemplate, events); // ← Вызов метода Page
});
