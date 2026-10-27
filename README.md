# Винтаж-лавка на Bootstrap

Контрольная работа №2 — «CSS-фреймворки: разработка интерфейса на Bootstrap».

Интернет-магазин винтажных вещей: главная, каталог, страница товара, оформление заказа и контакты.

**Студент:** Звягин Тимур Олегович, ЭФБО 04-25
**Сайт:** https://timurzvyagin.github.io/kr2-bootstrap-shop/

## Технологии

- Bootstrap 5.3.8, подключён **локально** из `vendor/bootstrap/` (без CDN)
- `css/custom.css` — фирменные цвета и шрифты, подключается после Bootstrap
- JavaScript — фильтры каталога, избранное, расчёт заказа

## Компоненты Bootstrap

`navbar`, `card`, `btn`, `badge`, `alert`, `modal`, `form-control`, `form-select`, `input-group`, `form-check`, `accordion`, `carousel`, `tabs`, `toast`, `offcanvas`, `pagination`, `breadcrumb`, `table`.

## Доработки

- Локальное подключение Bootstrap
- Страница контактов
- Фильтры, поиск, сортировка и страницы в каталоге
- Расчёт заказа: доставка и промокод `VINTAGE10`
- Избранное и тёмная тема

## Структура

```text
index.html  catalog.html  product.html  order.html  contacts.html
css/custom.css
js/         products.js  main.js  catalog.js  product.js  order.js
images/
vendor/bootstrap/
```

## Запуск

Откройте `index.html` в браузере.
