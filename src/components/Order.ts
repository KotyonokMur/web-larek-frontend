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
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }

    set address(value: string) {
        const addressInput = (this.container as HTMLFormElement).elements.namedItem('address') as HTMLInputElement;
        if (addressInput) {
            addressInput.value = value;
        }
    }

    set paymentType(value: string) {
        const buttons = this.container.querySelectorAll('button[name=card], button[name=cash]');
        buttons.forEach(button => {
            button.classList.remove('button_alt-active');
            button.classList.add('button_alt');
        });
    }
}