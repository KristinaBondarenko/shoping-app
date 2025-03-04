import { createProduct, getProducts } from './api.js'
import { SELECTORS } from './selectors.js'

init()

function init() {
  // Подгрузка данных при загрузке страницы.
  window.addEventListener('DOMContentLoaded', () => {
    getProducts()
    submitForm()
  })
}

// Обработчик формы.
function submitForm() {
  SELECTORS?.form?.addEventListener('submit', (event) => {
    event?.preventDefault()

    // Новый товар.
    const productData = {}

    Array?.from(SELECTORS?.form?.elements)?.forEach((element) => {
      if (element?.name) {
        productData[element.name] = element.value
      }
    })

    // Функция создания нового товара.
    createProduct(productData)

    // Показ актуальных данных.
    getProducts()
  })
}

// Мы слушаем клики по всей странице.
document.addEventListener('click', (event) => {
  // Проверяем, был ли клик по кнопке с классом "btn-primary" (это твои кнопки "Add to cart").
  if (event.target.classList.contains('btn-primary')) {
    // event.target.closest('.main-card') — находим ближайший родительский элемент карточки.
    const card = event.target.closest('.main-card')
    // Достаём из карточки, всё это сохраняем в объект product.
    const product = {
      name: card.querySelector('.card-name').textContent,
      category: card.querySelector('.card-category').textContent,
      price: parseFloat(card.querySelector('.card-price').textContent.replace('$', '').trim()), // Преобразуем цену в число
      imgSrc: card.querySelector('.card-image img').src,
    }
    // Вызываем функцию addToCart(), чтобы сохранить товар в корзину.
    addToCart(product)
  }
})

// Получаем корзину из localStorage. Если её нет — создаём пустой массив cart.
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem('cart')) || []

  // Проверяем, есть ли уже такой товар в корзине.
  const existingProduct = cart.find((item) => item.name === product.name)
  // Если есть — показываем alert и выходим из функции (return).
  if (existingProduct) {
    alert('Этот товар уже в корзине!')
    return
  }
  // Добавляем товар в массив cart.
  cart.push(product)
  localStorage.setItem('cart', JSON.stringify(cart))
  // Сохраняем cart в localStorage (JSON.stringify(cart)).
  updateCartCount()
}

function updateCartCount() {
  //  Получаем количество товаров в корзине.
  const cart = JSON.parse(localStorage.getItem('cart')) || []
  // Обновляем счётчик в иконке корзины (.basket-count__info).
  document.querySelector('.basket-count__info').textContent = cart.length
}
// При загрузке страницы сразу обновляем счётчик товаров в корзине.
updateCartCount()

const basketButton = document.getElementById('open-basket')
const modalBasket = document.getElementById('modal-basket')
// Отображаем товары в корзине при открытии модалки.
basketButton.addEventListener('click', () => {
  modalBasket.showModal()
  renderCart()
})

// Эта функция отвечает за отображение товаров в корзине и вычисление общей суммы корзины, основываясь на данных, сохранённых в localStorage.
function renderCart() {
  // Мы загружаем корзину из localStorage с помощью JSON.parse. Если корзина пустая (или ещё не была создана), то используется пустой массив [].
  const cart = JSON.parse(localStorage.getItem('cart')) || []
  // Ищем элемент для отображения списка товаров в корзине (.basket-container__list) и элемент для отображения общей суммы корзины (.modal-body__total).
  const basketContainer = document.querySelector('.basket-container__list')
  const totalPriceElement = document.querySelector('.modal-body__total')

  // Очищаем контейнер.
  basketContainer.innerHTML = ''
  // Создаём переменную total для вычисления общей суммы всех товаров в корзине.
  let total = 0

  // Добавляем товары в корзину.
  cart.forEach((item) => {
    // Для каждого товара создаём новый div, который будет представлять товар в корзине.
    const cartItem = document.createElement('div')
    cartItem.classList.add('basket-item')
    cartItem.innerHTML = `
      <img src="${item.imgSrc}" alt="${item.name}" class="basket-item__img">
      <span class="basket-item__name">${item.name}</span>
      <span class="basket-item__price">$${item.price}</span>
      <span class="basket-item__quantity">Quantity: ${item.quantity}</span>
      <button class="remove-item" data-name="${item.name}">Remove</button>
    `
    // Каждый созданный элемент добавляется в контейнер корзины.
    basketContainer.appendChild(cartItem)
    // Затем мы обновляем общую сумму корзины.
    total += item.price * item.quantity
  })
  // После того как все товары добавлены в корзину, обновляем элемент с общей суммой, показывая её с двумя знаками после запятой с помощью toFixed(2).
  totalPriceElement.textContent = `Total: $${total.toFixed(2)}`

  // Обработчик удаления товара.
  // document.querySelectorAll('.remove-item') — ищем все кнопки удаления (элементы с классом .remove-item).
  document.querySelectorAll('.remove-item').forEach((button) => {
    // .forEach(button => {...}) — перебираем каждую кнопку и вешаем на неё обработчик click.
    button.addEventListener('click', (event) => {
      // event.target.getAttribute('data-name') — получаем имя (name) товара из data-name, который был у кнопки удаления.
      const productName = event.target.getAttribute('data-name')
      // removeFromCart(productName) — вызываем функцию removeFromCart(), передавая имя товара, чтобы его удалить.
      removeFromCart(productName)
    })
  })
}

function removeFromCart(productName) {
  // Загружаем корзину из localStorage (JSON.parse(localStorage.getItem('cart')) || []).
  let cart = JSON.parse(localStorage.getItem('cart')) || []
  // Используем .filter(), чтобы оставить только товары, не совпадающие с удаляемым (item.name !== productName).
  cart = cart.filter((item) => item.name !== productName) // Удаляем товар по имени.
  localStorage.setItem('cart', JSON.stringify(cart))
  // Перерисовываем корзину.
  renderCart()
  // Обновляем количество товаров в корзине.
  updateCartCount()
}
// Ищем кнопку закрытия close-button и авешиваем обработчик click.
const closeButton = document.getElementById('close-button')
// Закрыть модалку.
closeButton.addEventListener('click', () => {
  // При клике вызываем modalBasket.close();, чтобы закрыть модалку.
  modalBasket.close()
})
