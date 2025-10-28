/*
  WebUI Bridge

  https://webui.me
  https://github.com/webui-dev/webui
  Copyright (c) 2020-2025 Hassan Draga.
  Licensed under MIT License.
  All rights reserved.
  Canada.

  Converted from JavaScript to TypeScript
  By Oculi Julien. Copyright (c) 2023.
*/

export type DataTypes = string | number | boolean | Uint8Array;

export type WebuiBridgeEvent = {
  // TODO: Make `event` static and solve the ESBUILD `_WebuiBridge` issue.
  CONNECTED: 0;
  DISCONNECTED: 1;
};

export type Extensions = {
  callbacks: Record<
    string,
    { args: Array<DataTypes>; output: DataTypes | void }
  >;
};

export abstract class WebuiBridge<Ext extends Extensions = Extensions> {
  abstract event: WebuiBridgeEvent;
  abstract callCore(fn: string, ...args: DataTypes[]): Promise<DataTypes>;

  // -- Public APIs --------------------------
  /**
   * Call a backend function
   *
   * @param fn - binding name
   * @param data - data to be send to the backend function
   * @return - Response of the backend callback string
   * @example - const res = await webui.call("myID", 123, true, "Hi", new Uint8Array([0x42, 0x43, 0x44]))
   */
  abstract call<K extends keyof Ext["callbacks"]>(
    fn: K,
    ...args: Ext["callbacks"][K]["args"]
  ): Promise<Ext["callbacks"][K]["output"]>;

  /**
   * Active or deactivate webui debug logging
   *
   * @param status - log status to set
   */
  abstract setLogging(status: boolean): void;

  /**
   * Encode text into base64 string
   *
   * @param data - text string
   */
  abstract encode(data: string): string;

  /**
   * Decode base64 string into text
   *
   * @param data - base64 string
   */
  abstract decode(data: string): string;

  /**
   * Set a callback to receive events like connect/disconnect
   *
   * @param callback - callback function `myCallback(e)`
   * @example - webui.setEventCallback((e) => {if(e == webui.event.CONNECTED){ ... }});
   */
  abstract setEventCallback(callback: (e: number) => void): void;

  /**
   * Check if UI is connected to the back-end. The connection
   * is done by including `webui.js` virtual file in the HTML.
   *
   * @return - Boolean `true` if connected
   */
  abstract isConnected(): boolean;

  /**
   * Get OS high contrast preference.
   *
   * @return - Boolean `True` if OS is using high contrast theme
   */
  abstract isHighContrast(): Promise<boolean>;

  /**
   * When binding all events on the backend, WebUI blocks all navigation events
   * and sends them to the backend. This API allows you to control that behavior.
   *
   * @param status - Boolean `True` means WebUI will allow navigations
   * @example - webui.allowNavigation(true); // Allow navigation
   * window.location.replace('www.test.com'); // This will now proceed as usual
   */
  abstract allowNavigation(status: boolean): void;
}
