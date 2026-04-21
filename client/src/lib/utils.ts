import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//create a function store a value in local storage and return the value use local storage key as jan_ + key
export function setLocalStorage(key: string, value: string) {
  localStorage.setItem("jan_" + key, value)
}

export function getLocalStorage(key: string) {
  return localStorage.getItem("jan_" + key)
}

export function removeLocalStorage(key: string) {
  localStorage.removeItem("jan_" + key)
}