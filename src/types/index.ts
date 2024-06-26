// Интерфейс карточки
export interface ICard {
	id: string;
	description: string;
	image: string; //any?
	title: string;
	category: string;
	price: number;
	inBasket: boolean;
}

// Интерфейс заказа
export interface IOrder {
	address: string;
	mail: string;
	phoneNumber: number;
	paymentMethod: string;
	totalCost: number;
}

// Интерфейс для корзины покупок
export interface IBasket {
	cardsInBasket: Pick<ICard, 'id' | 'title' | 'price'>[]; // Карточки, для отображения в корзине
	totalCost: number; // сумма товаров в корзине
	addCardToBasket(cardId: string, payload: Function | null): void; // добавление карточки в корзину покупок
	removeCardFromBasket(cardId: string, payload: Function | null): void; // удаление карточки из корзины покупок
	clearBasket(cardsInBasket: ICard[], payload: Function | null): void; // очистка корзины
	checkBasketValidation(totalCost: number): boolean; // проверка на стоимость заказа > 0
	checkBasketStatus(cardsInBasket: ICard[]): number; // Фактическое количество товаров в корзине
}

// Интерфейс для модели данных карточек
export interface ICardsData {
    cards: ICard[];
    preview: string | null; // метка на карточку
    getCard(cardId: string): ICard | undefined; // получение объекта карточки
    renderCard(cardId: string): void; // добавление карточки на страницу
}

// Интерфейс для работы с заказом
export interface IOrderData {
    validatePaymentMethod(data: TPaymentMethod): boolean; // проверка валидации метода оплаты
    validateUserInfo(data: TUserInfo): boolean; // проверка валидации информации о пользователе
}

// Данные заказа, используемые в форме при выбора метода оплаты
export type TPaymentMethod = Pick<IOrder, 'paymentMethod' | 'address'>;

// Данные пользователя, используемые в форме оформления заказа
export type TUserInfo = Pick<IOrder, 'mail' | 'phoneNumber'>;

// Получение состояния корзины (количество позиций)
export type TBasket = Pick<IBasket, 'cardsInBasket'>;
