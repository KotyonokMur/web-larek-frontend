import { Api, ApiListResponse } from './base/api';
import {IOrder, ICard, IOrderResult} from "../types";

export interface ILarekAPI {
    getCardList: () => Promise<ICard[]>;
    getCardItem: (id: string) => Promise<ICard>;
}

export class AppApi extends Api implements ILarekAPI{
    readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    getCardList(): Promise<ICard[]> {
        return this.get('/product').then((data: ApiListResponse<ICard>) =>
            data.items.map((item) => ({
                ...item,
                image: this.cdn + item.image
            }))
        );
    }

    getCardItem(id: string): Promise<ICard> {
        return this.get(`/product/${id}`).then(
            (item: ICard) => ({
                ...item,
                image: this.cdn + item.image,
            })
        );
    }

    orderProducts(order: IOrder): Promise<{ id: string; total: number }> {
        return this.post('/order', {            
            payment: order.paymentType,
            email: order.email,
            phone: order.phone,
            address: order.address,
            total: order.total,
            items: order.items,
        }).then(
            (response: IOrderResult) => ({
                id: response.id,
                total: response.total,
            })
        );
    }
}