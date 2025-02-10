import { MMKV } from "react-native-mmkv"
import { StateStorage } from "zustand/middleware"

export const localStorage = new MMKV()

export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    return localStorage.set(name, value)
  },
  getItem: (name) => {
    const value = localStorage.getString(name)
    return value ?? null
  },
  removeItem: (name) => {
    return localStorage.delete(name)
  },
}
