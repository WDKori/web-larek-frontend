# 🛒 Web-ларёк

**Web-ларёк** — интернет-магазин с товарами для веб-разработчиков. В нём можно посмотреть каталог, добавить товары в корзину и оформить заказ.

## 🔧 Стек технологий

- **HTML** — семантическая вёрстка
- **SCSS** — стили с переменными и миксинами
- **TypeScript** — строгая типизация логики
- **Webpack** — сборщик модулей

## 📁 Структура проекта

```

src/
├── common.blocks/ # БЭМ-блоки (если используются)
├── components/ # Все классы и компоненты
│ ├── base/ # Базовые классы (Api, EventEmitter, Modal и т.п.)
│ ├── model/ # Модели (данные, логика, взаимодействие с API)
│ └── view/ # Визуальные компоненты (Card, Basket, Modal и т.д.)
├── images/ # Изображения
├── pages/ # HTML-шаблоны или точки входа
│ └── index.html # Главная страница
├── public/ # Статика, favicon и пр.
├── scss/ # Стили проекта
│ ├── mixins/ # Примеси SCSS
│ └── styles.scss # Главный файл стилей
├── types/ # Единый источник типов
│ └── index.ts # Все интерфейсы, типы, enum'ы
├── utils/ # Вспомогательные функции
│ ├── constants.ts # Константы проекта
│ └── utils.ts # Универсальные утилиты
├── vendor/ # Шрифты и сторонние библиотеки
│ ├── garamond/
│ ├── glyphter/
│ └── ys-text/
├── index.ts # Точка входа (инициализация приложения)
├── index.scss # Подключение SCSS (если не через styles.scss)
└── webpack.config.js # Конфигурация Webpack

```

---

## Модели данных

### Api

Работает с API: отправляет запросы и обрабатывает ответы.

**Конструктор:**

```ts
constructor(baseUrl: string, options?: RequestInit);
```

- `baseUrl: string` - базовый URL API
- `options` - астройки запросов (заголовки и пр.)

Методы:

- `handleResponse(response: Response): Promise<object>` - обработка ответа, парсинг JSON
- `get(uri: string): Promise<any>` - GET-запрос
- `post(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<any>` — запрос с телом

### EventEmitter

Реализует паттерн "Observer" — управление событиями.

**Конструктор:**

```ts
constructor();
```

Создаёт новый экземпляр брокера событий EventEmitter.
Конструктор не принимает параметров.

**Методы:**

- `on(event: string, listener: Function)` — подписка
- `off(event: string, listener: Function)` — отписка
- `emit(event: string, ...args: any[])` — вызов обработчиков
- `onAll(listener: Function)` - подписка на все события
- `offAll(listener: Function)` - сброс всех подсчиков
- `trigger(event: string, ...args: any[])` - — возвращает функцию для вызова события

---

## Описание моделей

### Api

Работает с API: отправляет запросы и обрабатывает ответы.

```typescript
interface IApiModel {
	// Конфигурация
	cdn: string; // Базовый URL для изображений
	items: IProductItem[]; // Кэшированные товары

	// Основные методы
	getListProductCard(): Promise<IProductItem[]>; // Загрузка товаров
	postOrderLot(order: IOrderLot): Promise<IOrderResult>; // Отправка заказа
}
```

**Конструктор:**

```ts
constructor(cdn: string, baseUrl: string, options?: RequestInit);
```

- `baseUrl: string` - базовый URL API
- `options` - астройки запросов (заголовки и пр.)

Методы:

- `getListProductCard()`

```typescript
/**
 * Загружает список товаров с сервера
 * @returns Promise с массивом товаров, где:
 * - image: автоматически дополняется CDN-путем
 * - price: может быть null (бесплатные товары)
 * @throws APIError при неудачном запросе
 */
```

- `postOrderLot()`

```typescript
/**
 * Отправляет данные заказа
 * @param order - Объект заказа типа IOrderLot:
 * {
 *   payment: 'online' | 'offline',
 *   email: 'user@example.com',
 *   phone: '+79991234567',
 *   address: 'ул. Примерная, 1',
 *   items: ['prod_1', 'prod_2'],
 *   total: 2000
 * }
 * @returns Promise с результатом:
 * { id: 'order_123', total: 2000 }
 * @throws ValidationError при неверных данных
 */
```

### BasketModel — хранит товары корзины, подсчитывает количество и сумму

```typescript
interface IBasketModel {
	// Состояние
	basketProducts: IProductItem[]; // Текущие товары в корзине

	// Методы управления
	getCounter(): number; // Возвращает количество товаров
	getSumAllProducts(): number; // Сумма всех товаров
	setSelectedСard(item: IProductItem): void; // Добавление товара
	deleteCardToBasket(item: IProductItem): void; // Удаление товара
	clearBasketProducts(): void; // Очистка корзины
}
```

### DataModel — хранит текущую выбранную карточку товара

```typescript
interface IDataModel {
	products: IProductItem[]; // Все доступные товары
	selectedProduct: IProductItem | null; // Выбранный товар

	previewProduct(item: IProductItem): void; // Установка товара для предпросмотра
}
```

### FormModel — хранит и валидирует данные пользователя (адрес, контактные данные, заказ)

**Методы:**

```typescript
export interface IFormModel {
	payment: string;
	email: string;
	phone: string;
	address: string;
	validateOrder(): boolean; // валидирует адрес пользователя и способ оплаты
	validateContacts(): boolean; // валидирует телефон и почту пользователя
	getOrderLot(): object; // возвращает обьект данных пользователя с товарами, которые он выбрал
}
```

---

## Описание представлений (View)

### Page - главная страница

```typescript
interface IPage {
	// Элементы управления
	updateBasketCounter(count: number): void; // Обновление счетчика

	// Рендеринг
	renderProducts(
		products: IProductItem[],
		cardTemplate: HTMLTemplateElement,
		events: IEvents
	): void; // Отображение товаров, Для каждого товара создает карточку используя шаблон, Добавляет обработчик клика по карточке, Добавляет карточки в DOM
}
```

### Basket— отображение корзины и количества товаров

**Методы:**

```typescript
interface IBasket {
	// Управление состоянием
	setItems(items: HTMLElement[]): void; // Установка элементов корзины
	setTotal(sum: number): void; // Установка общей суммы

	// Рендеринг
	render(): HTMLElement; // Генерация DOM-структуры
}
```

### BasketItem — отображение товара в корзине

```typescript
interface IBasketItem {
	// Свойства
	index: number; // Позиция в корзине (1-based)
	title: string; // Название товара
	price: number | null; // Цена ("Бесценно" при null)

	// Методы
	render(): HTMLElement; // Генерация DOM-элемента
}
```

### Card (Базовая карточка товара)

```typescript
/**
 * Базовый компонент карточки товара для каталога
 * Отвечает за:
 * - Отображение основной информации о товаре
 * - Стилизацию по категории
 * - Обработку кликов
 */
interface ICard {
	/**
	 * Устанавливает категорию товара с автоматическим применением стилей
	 * @param value - Название категории: 'софт-скил', 'хард-скил', etc.
	 * Добавляет CSS-класс формата `card__category_${category}`
	 */
	setCategory(value: string): void;

	/**
	 * Устанавливает изображение товара
	 * @param src - URL изображения (уже содержит CDN-префикс)
	 * @param alt - Альтернативный текст на основе title
	 */
	setImage(src: string, alt: string): void;

	/**
	 * Форматирует цену с учетом null-значения
	 * @param value - Число (цена) или null ("Бесценно")
	 * Автоматически добавляет " синапсов" к числовым значениям
	 */
	setPrice(value: number | null): void;
}
```

### CardPreview (Расширенная карточка)

```typescript
/**
 * Карточка для детального просмотра товара (наследует Card)
 * Добавляет:
 * - Полное описание товара
 * - Интерактивную кнопку "В корзину"
 * - Контроль состояния кнопки
 */
interface ICardPreview extends ICard {
	/**
	 * Устанавливает развернутое описание товара
	 * @param value - Текст описания (может содержать HTML)
	 */
	setDescription(value: string): void;

	/**
	 * Управляет состоянием кнопки добавления
	 * @param isInBasket - Уже в корзине?
	 * @param hasPrice - Доступен для покупки?
	 * Автоматически меняет текст и блокирует кнопку при необходимости
	 */
	setButtonState(isInBasket: boolean, hasPrice: boolean): void;
}
```

**Ключевые отличия от Card:**

```typescript
// Переопределенный метод render
render(data: IProductItem, basketItems: IProductItem[] = []): HTMLElement {
  super.render(data); // Используем базовый рендер
  this.setDescription(data.description);

  // Проверяем наличие в корзине
  const inBasket = basketItems.some(item => item.id === data.id);
  this.setButtonState(inBasket, data.price !== null);

  return this._element;
}
```

### Формы — модальные окна для выбора оплаты, адреса доставки, ввода контактов пользователя

**FormOrder**

**Конструктор:**

```ts
constructor(template: HTMLTemplateElement, protected events: IEvents);
```

- `template ` — HTML-шаблон формы заказа, из которого создаётся экземпляр формы.
- `events ` — экземпляр событийного эмиттера для взаимодействия с моделью и другими частями приложения.а

**Методы:**

- `render(): HTMLFormElement` — Возвращает HTML-элемент формы, готовый к вставке в DOM. Автоматически восстанавливает визуальное состояние (например, выбранный способ оплаты).
- `clear()` — Сброс формы до исходного состояния

**Сеттеры**

- `valid: boolean` — Управляет доступностью кнопки отправки.
- `error: string` - Отображает текст ошибки под формой

**FormContacts**

**Конструктор:**

```ts
constructor(template: HTMLTemplateElement, protected events: IEvents);
```

- `template ` — HTML-шаблон формы заказа, из которого создаётся экземпляр формы.
- `events ` — экземпляр событийного эмиттера для взаимодействия с моделью и другими частями приложения.а

**Методы:**

- `render(): HTMLFormElement` — Возвращает HTML-элемент формы, готовый к вставке в DOM. Автоматически восстанавливает визуальное состояние (например, выбранный способ оплаты).
- `clear()` — Сброс формы до исходного состояния

**Сеттеры**

- `valid: boolean` — Управляет доступностью кнопки отправки.
- `error: string` - Отображает текст ошибки под формой

### Системные компоненты

**Modal**

```typescript
interface IModal {
	// Управление
	open(content?: HTMLElement): void; // Открытие с контентом
	close(): void;

	// Состояние
	locked: boolean; // Блокировка прокрутки
	content: HTMLElement | null; // Текущий контент
}
```

**Success**

```typescript
interface ISuccess {
	total: number; // Сумма заказа
	render(): HTMLElement;
}
```

---

## 📦 Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск проекта
npm run start

# Сборка проекта
npm run build
```
