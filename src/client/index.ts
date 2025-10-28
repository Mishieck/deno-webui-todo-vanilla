import { AddResult } from "../shared/database.ts";
import { Todo, TodoData } from "../shared/todo.ts";
import "./global.d.ts";

let editor: HTMLFormElement;
let editorTextfield: HTMLInputElement;
let editorSubmitButton: HTMLButtonElement;
let body: HTMLBodyElement;
let list: HTMLUListElement;
let emptyListAlert: HTMLQuoteElement;

let itemCount = 0;
let timer = 0;
const MINIMUM_DELAY = 3000;

/** Converts an HTML string to an `HTMLElement`. */
const htmlToElement = (html: string): HTMLElement => {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.firstElementChild as HTMLElement;
};

/**
 * Creates a todo item element that is added to the DOM. Event listeners are
 * added to the element when it is created.
 */
const createTodoElement = (todo: Todo): HTMLElement => {
  const { id, content, isDone } = todo;

  const html = /* html */ `
    <li id="${id}" class="list__item">
      <div class="todo ${isDone ? "todo--done" : ""}">
        <label class="todo__checkbox">
          <input type='checkbox'
            class="todo__checkbox__input"
            ${isDone ? 'checked=""' : ""}
          />
          <span class="todo__checkbox__content">${content}</span>
        </label>
        <button class="todo__button">Remove</button>
      </div>
    </li>
  `;

  const listItem = htmlToElement(html);
  const todoEl = listItem.querySelector(".todo") as HTMLElement;

  const checkbox = todoEl.querySelector(
    ".todo__checkbox__input",
  ) as HTMLElement;

  const button = todoEl.querySelector(".todo__button") as HTMLElement;

  checkbox.addEventListener(
    "change",
    (_event) => {
      updateTodo(id);
    },
  );

  button.addEventListener(
    "click",
    async (event) => {
      event.preventDefault();
      const _result = await deleteTodo(id);
      // TODO: Handle result
    },
  );

  return listItem;
};

/** Adds a todo item that the user has submitted to the list. */
const addTodo = async (event: SubmitEvent) => {
  event.preventDefault();
  const content = editorTextfield.value;
  const webuiResult = await webui.call("addTodo", content);
  const result = JSON.parse(webuiResult) as AddResult;
  if (!("id" in result)) return;
  const todoElement = createTodoElement(new Todo(result));

  if (list.firstElementChild) list.firstElementChild.before(todoElement);
  else list.appendChild(todoElement);

  if (!itemCount) emptyListAlert.replaceWith(list);
  itemCount++;

  // TODO: Maybe update value in a way that triggers the 'input' event.
  editorTextfield.value = "";
  editorSubmitButton.disabled = true;
};

/** Gets the todo list from the server. */
const getTodoList = async () => JSON.parse(await webui.call("getTodoList"));

/**
 * Adds the todo list to the DOM. When the list is empty, an alert message is
 * displayed.
 */
const addTodoList = (items: Array<TodoData>) => {
  const content = items.reduce(
    (fragment, todo) => (
      fragment.append(createTodoElement(new Todo(todo))), fragment
    ),
    document.createDocumentFragment(),
  );

  list.innerHTML = "";
  itemCount = items.length;
  list.append(content);
  body.append(itemCount ? list : emptyListAlert);
};

/**
 * Toggles the status of a todo item. If the item is done it is set to undone
 * and vice versa.
 */
const updateTodo = async (id: string) => {
  const result = JSON.parse(await webui.call("updateTodo", id));
  const todoItem = document.getElementById(id) as HTMLLIElement;

  // NOTE: The checkbox updates optimistically before `updateTodo` is called.
  const checkbox = todoItem.querySelector(
    ".todo__checkbox__input",
  ) as HTMLInputElement;

  if ("cause" in result) {
    checkbox.checked = !checkbox.checked; // Undo the change.
    // TODO: Inform user of the error.
  }
};

/**
 * Deletes a todo item from the list. If this results in an empty todo list, an
 * alert message informing the user that the todo list is empty is displayed.
 */
const deleteTodo = async (id: string) => {
  const str = await webui.call("deleteTodo", id);
  const result = JSON.parse(str);

  if ("cause" in result) {
    // TODO: Inform user.
  }

  itemCount--;
  const todoElement = document.getElementById(id);
  if (todoElement) todoElement.outerHTML = ""; // TODO: Use better method
  if (!itemCount) list.replaceWith(emptyListAlert);
};

/**
 * Add a skeleton loader that shows the loading state of the todo list as the
 * list of todo items is fetched from the server.
 */
const addLoader = () => {
  const template = document.getElementById("skeleton") as HTMLTemplateElement;
  const fragment = document.createDocumentFragment();
  const skeleton = template.content.firstElementChild as HTMLLIElement;

  for (let i = 0; i < 4; i++) {
    fragment.append(htmlToElement(skeleton.outerHTML));
  }

  list.append(fragment);
  body.append(list);
};

/** Starts a timer that controls the loading state duration of the todo list. */
const startTimer = () => {
  timer = performance.now();
  return Promise.resolve();
};

/** Stops the timer started by `startTimer`. */
const stopTimer = () =>
  new Promise(
    (resolve) => {
      timer = performance.now() - timer;
      setTimeout(resolve, Math.max(MINIMUM_DELAY - timer, 0));
    },
  );

/**
 * Updates the form button disabled state depending on the contents of the
 * form text input. If there is no content in the text input, the button is
 * disabled. This prevents the user from submitting an empty todo item.
 */
const handleTextInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  editorSubmitButton.disabled = value ? false : true;
};

/** Enable form input controls when the form is ready to receive input. */
const enableForm = () => {
  editorTextfield.disabled = false;
  editorTextfield.addEventListener("input", handleTextInput);
  editor.addEventListener("submit", addTodo);
};

/** The entry point of the script. */
const main = () => {
  startTimer();

  body = document.getElementById("body") as HTMLBodyElement;

  list = (document.getElementById("list-template") as HTMLTemplateElement)
    ?.content
    .firstElementChild as HTMLUListElement;

  editor = document.getElementById("editor") as HTMLFormElement;

  editorTextfield = document.getElementById(
    "editor-textfield",
  ) as HTMLInputElement;

  editorSubmitButton = document.getElementById(
    "editor-submit-button",
  ) as HTMLButtonElement;

  emptyListAlert =
    (document.getElementById("empty-list-alert") as HTMLTemplateElement)
      ?.content
      .firstElementChild as HTMLQuoteElement;

  Promise
    .resolve(addLoader())
    .then(getTodoList)
    .then((items) => stopTimer().then(() => items))
    .then(addTodoList)
    .then(enableForm);
};

// Run the main function when the DOM content has loaded and WebUI is ready.
document.addEventListener("DOMContentLoaded", function () {
  // Check if `webui` object is available
  if (webui) {
    webui.setEventCallback((e) => {
      if (e == webui.event.CONNECTED) main();
    });
  }
});
