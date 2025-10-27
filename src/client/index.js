/// <reference lib="dom" />
// @ts-check

/**
 * @template {unknown} T
 * @param {T | null | undefined} item
 * @returns {T}
 */
function nonNull(item) {
  if (item === null || item === undefined) throw 'item is null or undefined'
  return item;
}

/**
 * @typedef {boolean | number | string | Uint8Array} WebUiDataType
 * @typedef {Array<WebUiDataType>} WebUiParams
 * @typedef {Object} WebUI
 * @property {(name: string, ...params: WebUiParams) => Promise<any>} call
 * @global {WebUI} webui
 *
 * @typedef {Object} Todo
 * @property {string} id
 * @property  {string} content
 * @property {boolean} done
 * @property {number} timeAdded
 */


/**
 * @template {new (...params: Array<any>) => any} T
 * @param {T} Class
 * @param {unknown} object
 * @returns {InstanceType<T>}
 */
const asClass = (Class, object) => {
  if (object instanceof Class) return object;
  throw new Error(`Element '${typeof object}' is not an instance of '${Class.name}'.`);
};

/**
 * @param {Element} element
 * @returns {HTMLElement}
 */
const asHtmlElement = (element) => asClass(HTMLElement, element);

/**
 * @param {Element} element
 * @param {string} selector
 * @returns {HTMLElement | null}
 */
const selectHtmlElement = (element, selector) => {
  const selected = element.querySelector(selector); 
  return selected ? asHtmlElement(selected) : null;
};

/** @type {Object<string, HTMLElement>}*/
const elements = {};

const editor = asClass(HTMLFormElement, document.getElementById('editor'));

const editorTextfield = asClass(
  HTMLInputElement, document.getElementById('editor-textfield')
);

const editorSubmitButton = asClass(
  HTMLButtonElement,
  document.getElementById('editor-submit-button')
);

const body = nonNull(document.getElementById('body'));

const list = nonNull(document.getElementById('list-template'))
  // @ts-ignore: Its a template element. The property `content` exists.
  ?.content
  .firstElementChild;

/**
 * @param {string} id
 * @returns {HTMLElement | null}
 */
function getElement(id) {
  if (!(id in elements)) {
    const maybeElement = document.getElementById(id);
    if (!maybeElement) return null;
    elements[id] = maybeElement;
  }

  return elements[id];
}

let itemCount = 0;

/**
 * @param {string} html
 * @returns {HTMLElement}
 */
const htmlToElement = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html;
  return asHtmlElement(nonNull(template.content.firstElementChild)); 
};

/**
 * @param {Todo} data
 * @returns {HTMLElement}
 */
const createTodoElement = (data) => {
  const { id, content, done, timeAdded } = data;

  const html = /* html */ `
    <li id="${id}" class="list__item">
      <div class="todo ${done ? 'todo--done' : ''}">
        <label class="todo__checkbox">
          <input type='checkbox'
            class="todo__checkbox__input"
            ${done ? 'checked=""' : ''}
          />
          <span class="todo__checkbox__content">${content}</span>
        </label>
        <button class="todo__button">Remove</button>
      </div>
    </li>
  `;

  const listItem = nonNull(htmlToElement(html));
  const todo = nonNull(selectHtmlElement(listItem, '.todo'));
  const checkbox = nonNull(selectHtmlElement(todo,'.todo__checkbox__input'));
  const button = nonNull(selectHtmlElement(todo, '.todo__button'));

  checkbox.addEventListener(
    'change',
    /** @param {Event} event */
    (event) => {
      // @ts-ignore: The `EventTarget` is a checkbox
      updateTodo(id, nonNull(event.target).checked)
    },
  );

  button.addEventListener(
    'click',
     /** @param {Event} event @returns {Promise<void>} */
     async event => {
      event.preventDefault();
      const _result = await deleteTodo(id);
      // TODO: Handle result
    },
  );

  return listItem;
};

/**
 * @param {SubmitEvent} event
 */
const addTodo = async event => {
  event.preventDefault();
  const content = editorTextfield.value;
  // @ts-ignore: WebUI object exists
  const result = JSON.parse(await webui.call('addTodo', content));
  const todoElement = createTodoElement(result);

  if (list.firstElementChild) list.firstElementChild.before(todoElement);
  else list.appendChild(todoElement);

  if (!itemCount) emptyListAlert.replaceWith(list); 
  itemCount++;

  // TODO: Maybe update value in a way that triggers the 'input' event.
  editorTextfield.value = '';
  editorSubmitButton.disabled = true;
};

  // @ts-ignore: WebUI object exists
const getTodoList = async () => JSON.parse(await webui.call('getTodoList'));

const emptyListAlert = asClass(
  HTMLQuoteElement,
  asClass(HTMLTemplateElement, document.getElementById('empty-list-alert'))
    ?.content
    .firstElementChild
    
);

/**
 * @param {Array<Todo>} items
 */
const addTodoList = (items) => {
  const content = items.reduce(
    (fragment, todo) => (
      fragment.append(createTodoElement(todo)),
      fragment
    ),
    document.createDocumentFragment(),
  );

  list.innerHTML = '';
  itemCount = items.length;
  list.append(content)
  body.append(itemCount ? list : emptyListAlert);
};

/**
 * @param {string} id
 * @param {boolean} done
 */
const updateTodo = async (id, done) => {
  // @ts-ignore: webui is present on globalThis
  const result = JSON.parse(await webui.call('updateTodo', id, done));
  const todoItem = asClass(HTMLLIElement, document.getElementById(id));

  // NOTE: The checkbox updates optimistically before `updateTodo` is called.
  const checkbox = asClass(HTMLInputElement, todoItem.querySelector('.todo__checkbox__input'));

  if ('cause' in result) {
    checkbox.checked = !checkbox.checked; // Undo the change.
    // TODO: Inform user of the error.
  }
};

/**
 * @param {string} id
 */
const deleteTodo = async id => {
  // @ts-ignore: webui is present on globalThis
  const str = await webui.call('deleteTodo', id);
  const result = JSON.parse(str);

  if ('cause' in result) {
    // TODO: Inform user.
  }

  itemCount--;
  const todoElement = getElement(id);
  if (todoElement) todoElement.outerHTML = ''; // TODO: Use better method
  if (!itemCount) list.replaceWith(emptyListAlert);
};

const addLoader = () => {
  const template = asClass(HTMLTemplateElement, document.getElementById('skeleton'));
  const fragment = document.createDocumentFragment();
  const skeleton = asClass(HTMLLIElement, template.content.firstElementChild);
  for (let i = 0; i < 4; i++) fragment.append(htmlToElement(skeleton.outerHTML));
  list.append(fragment);  
  body.append(list);
};

let timer = 0;
const MINIMUM_DELAY = 3000;

const startTimer = () => {
  timer = performance.now();
  return Promise.resolve();
};
  
const stopTimer = () => new Promise(
  resolve => {
    timer = performance.now() - timer;
    setTimeout(resolve, Math.max(MINIMUM_DELAY - timer, 0));
  }
);

/**
 * @param {Event} event
 */
const handleTextInput = (event) => {
  const value = asClass(HTMLInputElement, event.target).value;
  editorSubmitButton.disabled = value ? false : true;
};

const enableForm = () => {
  editorTextfield.disabled = false;
  editorTextfield.addEventListener('input', handleTextInput);
  editor.addEventListener('submit', addTodo);
};

const main = () => {
  startTimer();

  Promise
    .resolve(addLoader())
    .then(getTodoList)
    .then(items => stopTimer().then(() => items))
    .then(addTodoList)
    .then(enableForm);
};

document.addEventListener('DOMContentLoaded', function() {
  // Check if `webui` object is available
  // @ts-ignore: webui exists
  if (webui) {
    // @ts-ignore: webui exists
    webui.setEventCallback((e) => {
    // @ts-ignore: webui exists
      if (e == webui.event.CONNECTED) main();
    });
  }
});
