import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "Welcome to React": "Welcome to ecp2",
      Пациенты: "Patients",
      Выход: "Exit",
      "Пациент не выбран": "Patient is not selected",
      "Внесите лекарственные препараты с помощью строки поиска наверху или":
        "Add medical drugs using the search bar avobe or",
      "напишите их свободным текстом": "type them in",
      "Введите препараты": "Type in medical drugs' names",
      "Можно указать несколько препаратов с дозировками, система попытается их распознать":
        "You can type in many pharmaceuticals with dosages, the system will try to parse them",
      Отмена: "Cancel",
      Распознать: "Parse",
      "Ничего не найдено": "nothing was found",
      Сбросить: "Clear",
      Проверить: "Check",
      Назначить: "Prescribe",
      Выписать: "Write a prescription",
    },
  },
  ru: {
    translation: {
      "Welcome to React": "добро пожаловать в экф",
      Пациенты: "Пациенты",
      Выход: "Выход",
      "Пациент не выбран": "Пациент не выбран",
      "Внесите лекарственные препараты с помощью строки поиска наверху или":
        "Внесите лекарственные препараты с помощью строки поиска наверху или",
      "напишите их свободным текстом": "напишите их свободным текстом",
      "Введите препараты": "Введите препараты",
      "Можно указать несколько препаратов с дозировками, система попытается их распознать":
        "Можно указать несколько препаратов с дозировками, система попытается их распознать",
      Отмена: "Отмена",
      Распознать: "Распознать",
      "Ничего не найдено": "Ничего не найдено",
      Сбросить: "Сбросить",
      Проверить: "Проверить",
      Назначить: "Назначить",
      Выписать: "Выписать",
    },
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: localStorage.getItem("lang") || "ru",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
