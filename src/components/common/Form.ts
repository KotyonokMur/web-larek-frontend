import { Component } from "../base/Component";
import { IEvents } from "../base/events";
import { ensureElement } from "../../utils/utils";

interface IFormState {
    valid: boolean;
    errors: string[];
}

export class Form<T> extends Component<IFormState> {
    protected _submit: HTMLButtonElement;
    protected _errors: HTMLElement;

    constructor(container: HTMLFormElement, protected events: IEvents) {
        super(container);

        this._submit = ensureElement<HTMLButtonElement>('button[type=submit]', this.container);
        this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

        this.container.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            const field = target.name as keyof T;
            const value = target.value;
            this.onInputChange(field, value);
        });

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.events.emit(`${(this.container as HTMLFormElement).name}:submit`);
        });

        // Обработка кнопок выбора типа оплаты
        this.container.querySelectorAll('button[name=card], button[name=cash]').forEach(button => {
            button.addEventListener('click', () => {
                const paymentType = button.getAttribute('name');

                this.container.querySelectorAll('button[name=card], button[name=cash]').forEach(btn => {
                    btn.classList.remove('button_alt-active');
                    btn.classList.add('button_alt');
                });

                if (button) {
                    button.classList.add('button_alt-active');
                    button.classList.remove('button_alt');
                }

                this.onInputChange('paymentType' as keyof T, paymentType);
            });
        });
    }

    protected onInputChange(field: keyof T, value: string) {
        this.events.emit(`${(this.container as HTMLFormElement).name}.${String(field)}:change`, {
            field,
            value
        });
    }

    set valid(value: boolean) {
        this._submit.disabled = !value;
    }

    set errors(value: string) {
        this.setText(this._errors, value);
    }

    render(state: Partial<T> & IFormState) {
        const { valid, errors, ...inputs } = state;
        super.render({ valid, errors });
        Object.assign(this, inputs);
        return this.container;
    }
}
