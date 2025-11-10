import html from "./app-body/template.html" with { type: "text" };
import css from "./app-body/styles.css" with { type: "text" };
import "./empty-list-alert.ts";
import "./skeleton-item.ts";
import "./todo-list.ts";
import { interpolate, render } from "./template.ts";
import { clientTodoList } from "./todo-list/object.ts";

const content = interpolate(html, css);
export type AppBodyState = "loading" | "empty" | "content";
const STATES: Array<AppBodyState> = ["loading", "empty", "content"];

let timer = 0;
const MINIMUM_DELAY = 3000;

export class AppBody extends HTMLElement {
  #internals: ElementInternals;

  /**
   * Starts a timer that controls the loading state duration of the todo list.
   */
  static startTimer() {
    timer = performance.now();
    return Promise.resolve();
  }

  /** Stops the timer started by `startTimer`. */
  static stopTimer() {
    return new Promise(
      (resolve) => {
        timer = performance.now() - timer;
        setTimeout(resolve, Math.max(MINIMUM_DELAY - timer, 0));
      },
    );
  }

  static waitUntilWebuiIsConnected() {
    return new Promise<void>((resolve) => {
      document.addEventListener("DOMContentLoaded", () => {
        // Check if `webui` object is available
        if (webui) {
          webui.setEventCallback((e) => {
            if (e == webui.event.CONNECTED) resolve();
          });
        }
      });
    });
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#internals = this.attachInternals();
  }

  get state(): AppBodyState {
    for (const state of STATES) {
      // @ts-ignore: the method exists
      if (this.#internals.states.has(state)) return state;
    }

    return "loading";
  }

  set state(state: AppBodyState) {
    // @ts-ignore: the method exists
    this.#internals.states.clear();
    // @ts-ignore: the method exists
    this.#internals.states.add(state);
  }

  connectedCallback() {
    this.state = "loading";
    render(this, content);

    clientTodoList.addObserver("empty", (event) => {
      this.state = event.detail ? "empty" : "content";
    });

    this.initialize();
  }

  initialize() {
    AppBody.startTimer()
      .then(AppBody.waitUntilWebuiIsConnected)
      .then(() => AppBody.stopTimer())
      .then(() => clientTodoList.initialize()); // TODO: Handle error
  }
}

customElements.define("app-body", AppBody);
