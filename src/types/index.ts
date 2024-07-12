export interface ICard {
	id: string;
	title: string;
	description: string;
	image: string;
	category: string;
	price?: number;
}

export interface IOrderForm {
    email?: string;
    phone?: string;
    address?: string;
    paymentType?: string;
}

export interface IOrder extends IOrderForm {
    items: string[];
    total: number;
}

export type FormErrors = Partial<Record<keyof IOrderForm, string>>;

export interface IAppState {
    catalog: ICard[];
    basket: string[];
    preview: string | null;
    order: IOrder | null;
    loading: boolean;
}

export interface IOrderResult {
    id: string;
    total: number;
}