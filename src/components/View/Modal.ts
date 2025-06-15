import { IEvents } from '../base/events';

export interface IModal {
	content: HTMLElement | null;
	locked: boolean;
	open(content?: HTMLElement): void;
	close(): void;
	render(): HTMLElement;
}

export class Modal implements IModal {
	protected _content: HTMLElement;
	protected _pageWrapper: HTMLElement;
	protected _closeButton: HTMLButtonElement;

	constructor(protected container: HTMLElement, protected events: IEvents) {
		this._content = container.querySelector('.modal__content');
		this._pageWrapper = document.querySelector('.page__wrapper');
		this._closeButton = container.querySelector('.modal__close');

		this._closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('click', this.close.bind(this));
		this.container
			.querySelector('.modal__container')
			.addEventListener('click', (e) => e.stopPropagation());
	}

	set content(value: HTMLElement | null) {
		this._content.replaceChildren(value || '');
	}

	get content(): HTMLElement | null {
		return this._content;
	}

	set locked(value: boolean) {
		this._pageWrapper.classList.toggle('page__wrapper_locked', value);
	}

	open(content?: HTMLElement): void {
		if (content) this.content = content;

		this.container.classList.add('modal_active');
		this.events.emit('modal:open');
	}

	close(): void {
		this.container.classList.remove('modal_active');
		this.content = null;
		this.events.emit('modal:close');
	}

	render(): HTMLElement {
		return this.container;
	}
}
