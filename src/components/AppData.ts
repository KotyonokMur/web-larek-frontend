import {Model} from "./base/Model";
import {ICard, IOrder, IAppState, FormErrors, IOrderForm} from "../types";

export type CatalogChangeEvent = {
    catalog: CardItem[];
};

export class CardItem extends Model<ICard> {
    id: string;
    image: string;
    title: string;
    price?: string;
    description: string;
    category: string;
    inBasket: boolean = false;
}

export class AppState extends Model<IAppState> {
    catalog: CardItem[];
    order: IOrder = {
        email: '',
        phone: '',
        items: [],
        paymentType: '',
        address: '',
        total: 0,
    };
    formErrors: FormErrors = {};

    // Получение объекта товара из каталога
    getItem(id:string){
        return this.catalog.find(item => item.id === id);
    }

    //Добавление товаров в каталог
    setCatalog(items: ICard[]) {
        this.catalog = items.map(item => new CardItem(item, this.events));
        this.emitChanges('items:changed', { catalog: this.catalog });
    }
    
    // Переключение состояния товара: корзине / не в корзине
    toggleOrderedCard(item: CardItem, isIncluded: boolean) {
        if (isIncluded) {
            // Добавляем уникальный id в массив, если его там еще нет
            if (!this.order.items.includes(item.id)) {
                this.order.items = [...this.order.items, item.id];
                this.order.total += Number(item.price);
                item.inBasket = true;
            }
        } else {
            // Удаляем id из массива
            if (this.order.items.includes(item.id)) {
                this.order.items = this.order.items.filter(card => card !== item.id);
                this.order.total -= Number(item.price);
                item.inBasket = false;
            }
        }
    }

    // Количество товаров в корзине
    getBasketCount(){
        return this.order.items.length;
    }

    // Очистить корзину
    clearBasket() {
        this.order.items.forEach(id => {
            const card = this.getItem(id);
            this.toggleOrderedCard(card, false);
        });
        this.emitChanges('page:changed');
    }

    // Добавить товар в корзину
    addItemToBasket(item: CardItem) {
        this.toggleOrderedCard(item, true);
        this.emitChanges('preview:open', item);
        this.emitChanges('page:changed');
    }

    // Удалить товар из корзины
    removeItemFromBasket(item: CardItem) {
        this.toggleOrderedCard(item, false);
        this.emitChanges('basket:open');
        this.emitChanges('page:changed');
    }

    // Получить все элементы в корзине 
    getBasketItems(): CardItem[] {
        return this.catalog.filter(item => item.inBasket);
    }

    //Установить новый элемент в превью
    setPreview(item: CardItem) { 
        this.emitChanges('preview:open', item);
    }

    // Методы для работы с формами заказа
    setOrderField(field: keyof IOrderForm, value: string) {
        this.order[field] = value;

        if (this.validateOrder()) {
            this.events.emit('order:ready', this.order);
        }
    }

    // Проверка полей модального окна order
    validateOrder() {
        const errors: typeof this.formErrors = {};
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        if (!this.order.paymentType) {
            errors.paymentType = 'Необходимо выбрать способ оплаты';
        }
        this.formErrors = errors;
        this.events.emit('formErrorsOrder:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    // Методы для работы с формами контактов
    setContactField(field: keyof IOrderForm, value: string) {
        this.order[field] = value;

        if (this.validateContacts()) {
            this.events.emit('contacts:ready', this.order);
        }
    }

    // Проверка полей модального окна Contacts
    validateContacts() {
        const errors: typeof this.formErrors = {};
        // Проверка наличия email
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.order.email)) {
                errors.email = 'Некорректный формат email';
            }
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        } else {
            const phoneRegex = /^(?:\+7|8)(?:\d{10}|\d{11})$/;
            if (!phoneRegex.test(this.order.phone)) {
                errors.phone = 'Некорректный формат телефона';
            }
        }
        this.formErrors = errors;
        this.events.emit('formErrorsContacts:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    // Очистка статуса заказа
    clearOrderStatus(){
        this.order.email = '',
        this.order.phone = '',
        this.order.paymentType = '',
        this.order.address = '';
    }
}