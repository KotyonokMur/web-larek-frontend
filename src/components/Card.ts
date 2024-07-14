import {Component} from "./base/Component";

export interface IProduct<T> {
    title: string;
    description: string;
    image: string;
    price?: string;
    category: string;
    inBasket: boolean;
    position: number;
}

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

//View
export class Card<T> extends Component<IProduct<T>> {
    protected _title: HTMLElement;
    protected _priceValue: string | null; //Если цены нет - кнопка "в корзину" неактивна
    protected _image?: HTMLImageElement;
    protected _button?: HTMLButtonElement;
    protected _price?: HTMLElement;
    protected _category?: HTMLElement;
    protected _inBasket?: boolean;
    protected _description?: HTMLElement;

    private categoryClasses: { [key: string]: string } = {
		'софт-скил': 'card__category_soft',
		'хард-скил': 'card__category_hard',
		'другое': 'card__category_other',
		'дополнительное': 'card__category_additional',
		'кнопка': 'card__category_button',
	};

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);
        this._title = container.querySelector(`.${blockName}__title`);
        this._image = container.querySelector(`.${blockName}__image`);
        this._button = container.querySelector(`.${blockName}__button`);
        this._price = container.querySelector(`.${blockName}__price`);
        this._category = container.querySelector(`.${blockName}__category`);

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    protected getCategoryClass(category: string): string {
		return this.categoryClasses[category] || 'card__category_other';
	}

    set title(value: string) {
        this.setText(this._title, value);
    }
    
    set price(value: string) {
        this._priceValue = value;
        if (value) {
            this.setText(this._price, `${value} синапсов` );
        } else {
            this.setText(this._price, `Бесценно`);
        }
    }
}

// Для отображения карточки каталога на главной странице
export class CatalogItem extends Card<HTMLElement> {

    constructor(container: HTMLElement, actions?: ICardActions) {
        super('card', container, actions);
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    set category(value: string) {
        this._category.className = `card__category ${this.getCategoryClass(
            value.toLowerCase()
        )}`;
        this.setText(this._category, value);
    }
}

// Для отображение полной информации о продукте и покупке
export class ProductItem extends Card<HTMLElement> {

    constructor(container: HTMLElement, actions?: ICardActions) {
        super('card', container, actions);
        this._description = container.querySelector(`.card__text`);
    }

    set description(value: string | string[]) {
        this.setText(this._description, value);
    }

    set inBasket(value: boolean) {
        this._inBasket = value;
        this.updateButtonState();
    }

    set price(value: string | null) {
        this._priceValue = value;
        if (value !== null) {
            this.setText(this._price, `${value} синапсов`);
        } else {
            this.setText(this._price, `Бесценно`);
        }
        this.updateButtonState();
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    set category(value: string) {
        this._category.className = `card__category ${this.getCategoryClass(
            value.toLowerCase()
        )}`;
        this.setText(this._category, value);
    }

    //Если товар в корзине или нет цены, товар нельзя добавить в корзину.
    protected updateButtonState() {
        if (this._inBasket) {
            this.setDisabled(this._button, true);
            this.setText(this._button, 'В корзине');
        } else if (!this._priceValue) {
            this.setDisabled(this._button, true);
            this.setText(this._button, 'В корзину');
        } else {
            this.setDisabled(this._button, false);
            this.setText(this._button, 'В корзину');
        }
    }
}


//Для отображения в корзине
export class BasketItem extends Card<HTMLElement>{
    protected _position: HTMLElement;

    constructor(container: HTMLElement, actions?: ICardActions){
        super('card', container, actions);
        this._position = container.querySelector(`.basket__item-index`);
   }

   set position(value: number){
        this.setText(this._position, `${value}`);
   }
}