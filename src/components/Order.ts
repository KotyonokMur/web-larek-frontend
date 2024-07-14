import {Form} from "./common/Form";
import {IOrderForm} from "../types";
import {EventEmitter, IEvents} from "./base/events";
import {ensureElement} from "../utils/utils";

export class Contacts extends Form<IOrderForm> {
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }

    set phone(value: string) {
        const phoneInput = (this.container as HTMLFormElement).elements.namedItem('phone') as HTMLInputElement;
        if (phoneInput) {
            phoneInput.value = value;
        }
    }

    set email(value: string) {
        const emailInput = (this.container as HTMLFormElement).elements.namedItem('email') as HTMLInputElement;
        if (emailInput) {
            emailInput.value = value;
        }
    }
}

export class Order extends Form<IOrderForm> {
    private _buttonCard: HTMLButtonElement;
    private _buttonCash: HTMLButtonElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._buttonCard = ensureElement<HTMLButtonElement>('button[name=card]', this.container);
        this._buttonCash = ensureElement<HTMLButtonElement>('button[name=cash]', this.container);

        this._buttonCard.addEventListener('click', () => {
            this.toggleCard();
            this.toggleCash(false);
            this.onInputChange('paymentType', 'card');
        });

        this._buttonCash.addEventListener('click', () => {
            this.toggleCash();
            this.toggleCard(false);
            this.onInputChange('paymentType', 'cash');
        });
    }

    set address(value: string) {
        const addressInput = (this.container as HTMLFormElement).elements.namedItem('address') as HTMLInputElement;
        if (addressInput) {
            addressInput.value = value;
        }
    }

    set paymentType(value: string) {
        this.toggleCard(value === 'card');
        this.toggleCash(value === 'cash');
    }

    private toggleCard(state: boolean = true) {
        this.toggleClass(this._buttonCard, 'button_alt-active', state);
    }

    private toggleCash(state: boolean = true) {
        this.toggleClass(this._buttonCash, 'button_alt-active', state);
    }
}