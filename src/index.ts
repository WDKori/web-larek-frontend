import './scss/styles.scss';

import { CDN_URL, API_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { ApiModel } from './components/Model/ApiModel';
import { DataModel } from './components/Model/DataModel';
import { Card } from './components/View/Card';
import { CardPreview } from './components/View/CardPreview';
import { IOrderForm, IProductItem } from './types';
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

const order = new Order(orderTemplate, events, formModel);
const contacts = new Contacts(contactsTemplate, events, formModel);

/*** Отображение карточек товара ***/
events.on('productCards:receive', () => {
	dataModel.products.forEach((item) => {
		const card = new Card(cardCatalogTemplate, events, {
			onClick: () => events.emit('card:select', item),
		});
		ensureElement<HTMLElement>('.gallery').append(card.render(item));
	});
});

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

const page = new Page(events);

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
	formModel.items = basketModel.basketProducts.map((item) => item.id);
	modal.content = order.render();
	modal.open();
});

events.on(
	'order:payment:changed',
	(data: { payment: string; forceValidate?: boolean }) => {
		formModel.payment = data.payment;
		if (data.forceValidate) {
			order.valid = formModel.validateOrder();
		}
	}
);

events.on(
	'order:input',
	(data: { field: keyof IOrderForm; value: string; validate?: boolean }) => {
		if (data.field === 'address') {
			formModel.address = data.value;
			if (data.validate) {
				order.valid = formModel.updateOrderValidation();
			}
		}
	}
);

events.on('order:submit', () => {
	events.emit('contacts:open');
});

/*** Контактные данные ***/

events.on('order:complete', () => {
	events.emit('success:open');
});
events.on('contacts:open', () => {
	formModel.total = basketModel.getSumAllProducts();
	modal.content = contacts.render();
	modal.open();
});

events.on(
	'contacts:input',
	(data: { field: keyof IOrderForm; value: string }) => {
		if (data.field === 'email') {
			formModel.email = data.value;
		}
		if (data.field === 'phone') {
			formModel.phone = data.value;
		}
		contacts.valid = formModel.validateContacts();
	}
);

/*** Успешное оформление ***/
events.on('success:open', () => {
	apiModel
		.postOrderLot(formModel.getOrderLot())
		.then(() => {
			const success = new Success(successTemplate, events, formModel);
			success.total = basketModel.getSumAllProducts();
			modal.content = success.render();
			basketModel.clearBasketProducts();
			basket.setTotal(0);
			basket.setItems([]);
			events.emit('basket:changed');
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
apiModel
	.getListProductCard()
	.then((data) => {
		dataModel.products = data;
		events.emit('productCards:receive');
	})
	.catch((err) => console.error('Error loading products:', err));
