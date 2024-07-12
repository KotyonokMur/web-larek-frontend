import './scss/styles.scss';
// Base
import {API_URL, CDN_URL} from "./utils/constants";
import {EventEmitter} from "./components/base/events";
import {cloneTemplate, ensureElement} from "./utils/utils";
// Custom
import {Page} from "./components/Page";
import {Basket} from "./components/common/Basket"
import {AppApi} from "./components/AppApi";
import {AppState, CatalogChangeEvent, CardItem} from "./components/AppData";
import {Modal} from "./components/common/Modal";
import {CatalogItem, ProductItem, BasketItem} from "./components/Card";
import {Order, Contacts} from "./components/Order"
import {IOrderForm} from './types';
import {Success} from './components/common/Success'

// Base objects
const events = new EventEmitter();
const api = new AppApi(CDN_URL, API_URL);

// Template's
const cardTemplate: HTMLTemplateElement = document.querySelector('#card-catalog');
const cardPreviewTemplate: HTMLTemplateElement = document.querySelector('#card-preview');
const cardBasketTemplate: HTMLTemplateElement = document.querySelector('#card-basket');
const basketTemplate: HTMLTemplateElement = document.querySelector('#basket');
const orderTemplate: HTMLTemplateElement = document.querySelector('#order');
const contactsTemplate: HTMLTemplateElement = document.querySelector('#contacts');
const successPageTemplate: HTMLTemplateElement = document.querySelector('#success');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const orderForm = new Order(cloneTemplate(orderTemplate), events);
const contactsForm = new Contacts(cloneTemplate(contactsTemplate), events);

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
    page.locked = false;
});

// Отображение карточек на странице
// Загрузился/изменился каталог
events.on<CatalogChangeEvent>('items:changed', () => {
    page.catalog = appData.catalog.map(item => {
        const card = new CatalogItem(cloneTemplate(cardTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
            title: item.title,
            image: item.image,
            category: item.category,
            price: item.price
        });
    });
});

// Открытие карточки
// Задаём id для preview элемента
events.on('card:select', (item: CardItem) =>{
    appData.setPreview(item);
})

// Отображаем preview нужного элемента
events.on('preview:open', (item: CardItem) => {
    const showItem = (item: CardItem) => {
        const product = new ProductItem(cloneTemplate(cardPreviewTemplate),{ 
            onClick: () => appData.addItemToBasket(item)});
        modal.render({
            content: product.render({
                title: item.title,
                image: item.image,
                description: item.description,
                category: item.category,
                price:item.price,
                inBasket: item.inBasket,
            }),
        });
    };    
    if (item) {
        api.getCardItem(item.id)
            .then(() => {
                showItem(item);
            })
            .catch((err) => {
                console.error(err);
            })
    } else {
        modal.close();
    }
});

// Открытие корзины после подгрузки элементов
events.on('basket:open', () => {
    const basketItems = appData.getBasketItems();
    const basketCards = basketItems.map((item, index) => {
        const card = new BasketItem(cloneTemplate(cardBasketTemplate), {
            onClick: () => appData.removeItemFromBasket(item)
        });
        return card.render({
            title: item.title,
            price: item.price,
            position: index + 1,
        });
    });

    modal.render({
        content: basket.render({
            items: basketCards, 
            total: appData.order.total
        })
    });
});

// Изменение состояния страницы (количество товаров в корзине)
events.on('page:changed', () => {
    page.counter = appData.getBasketCount();
})

// Открыть форму заказа
events.on('order:open', () => {
    //console.log(appData);
    appData.clearOrderStatus();
    modal.render({
        content: orderForm.render({
            address: '',
            paymentType: '',
            valid: false,
            errors: [],
        })
    });
});

// Отправлена форма заказа
events.on('order:submit', () => {
    // Логика обработки заказа
    //console.log('Order submitted with data:', appData);
    modal.render({
        content: contactsForm.render({
            phone: '',
            email: '',
            valid: false,
            errors: []
        })
    });
});

// Открыть форму контактов
events.on('contacts:open', () => {
    modal.render({
        content: contactsForm.render({
            phone: '',
            email: '',
            valid: false,
            errors: []
        })
    });
});

// Отправлена форма заказа
events.on('contacts:submit', () => {
    api.orderProducts(appData.order)
        .then((result) => {
            console.log(appData);
            const success = new Success(cloneTemplate(successPageTemplate), {
                onClick: () => {
                    console.log(appData)
                    modal.close();
                    appData.clearBasket();
                    appData.clearOrderStatus();
                }
            });
            modal.render({
                content: success.render({
                    total: result.total
                })
            });
            console.log(result);
        })
        .catch(err => {
            console.error(err);
        });
});

// Изменилось состояние валидации формы заказа
events.on('formErrorsOrder:change', (errors: Partial<IOrderForm>) => {
    const { address, paymentType } = errors;
    orderForm.valid = !address && !paymentType;
    orderForm.errors = Object.values({ address, paymentType }).filter(i => !!i).join('; ');
});

// Изменилось состояние валидации формы контактов
events.on('formErrorsContacts:change', (errors: Partial<IOrderForm>) => {
    const { email, phone } = errors;
    contactsForm.valid = !email && !phone;
    contactsForm.errors = Object.values({ phone, email }).filter(i => !!i).join('; ');
});

// Изменилось одно из полей формы контактов
events.on(/^contacts\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setContactField(data.field, data.value);
});

// Изменилось одно из полей формы заказа
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
});

// Получаем лоты с сервера
api.getCardList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
});