"use client";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";


const STORAGE_KEY = "chat_username";
const FRUITS = [
  "Apple",
  "Banana",
  "Cherry",
  "Date",
  "Fig",
  "Grape",
  "Kiwi",
  "Mango",
  "Pear",
  "Plum",
  "Strawberry",
  "Watermelon",
  "Pomegranate",
  "Tangerine",
  "Walnut",
  "Orange",
  "Papaya",
  "Pineapple",
  "Raspberry",
  "Tomato",
  "Zucchini",
];

const generateUsername = () => {
  const word = FRUITS[Math.floor(Math.random() * FRUITS.length)];
  return `anonymous-${word}-${nanoid(5)}`;
};
export const useUsername = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const main = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUsername(stored);
        return;
      }

      const newUsername = generateUsername();

      localStorage.setItem(STORAGE_KEY, newUsername);
      setUsername(newUsername);
    };
    main();
  }, []);
  return { username };
};
