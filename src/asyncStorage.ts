import { type IStorage } from "@web3auth/auth";

import { IAsyncStorage, ISecureStore } from "./interface";

export class AsyncStorage {
  public storage: IAsyncStorage | IStorage | ISecureStore;

  private _storeKey: string;

  constructor(storeKey: string, storage: IAsyncStorage | IStorage | ISecureStore) {
    this.storage = storage;
    this._storeKey = storeKey;
  }

  async toJSON(): Promise<string> {
    if ("getItemAsync" in this.storage) {
      return (this.storage as ISecureStore).getItemAsync(this._storeKey, {});
    }
    const result = await this.storage.getItem(this._storeKey);
    return result;
  }

  async resetStore(): Promise<Record<string, unknown>> {
    const currStore = await this.getStore();
    await this.setStore({});
    return currStore;
  }

  async getStore(): Promise<Record<string, unknown>> {
    if ("getItemAsync" in this.storage) {
      return JSON.parse((await (this.storage as ISecureStore).getItemAsync(this._storeKey, {})) || "{}");
    }
    return JSON.parse((await this.storage.getItem(this._storeKey)) || "{}");
  }

  async setStore(store: Record<string, unknown>): Promise<void> {
    if ("setItemAsync" in this.storage) {
      return (this.storage as ISecureStore).setItemAsync(this._storeKey, JSON.stringify(store), {});
    }
    return this.storage.setItem(this._storeKey, JSON.stringify(store));
  }

  async get<T>(key: string): Promise<T> {
    const store = await this.getStore();
    return store[key] as T;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const store = await this.getStore();
    store[key] = value;
    return this.setStore(store);
  }

  async remove(key: string): Promise<void> {
    const store = await this.getStore();
    delete store[key];
    return this.setStore(store);
  }
}
