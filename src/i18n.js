import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "Welcome to React": "Welcome to ecp2",
      patient_patients: "Patients",
      main_menu_exit: "Exit",
      patient_notSelected: "Patient is not selected",
      main_search_tip: "Add medical drugs using the search bar avobe or",
      main_parser_tip: "type them in",
      main_parser_header: "Type in medical drugs' names",
      main_parser_tip2: "You can type in many pharmaceuticals with dosages, the system will try to parse them",
      main_parser_cancel: "Cancel",
      main_parser_parse: "Parse",
      main_search_notFound: "nothing was found",
      main_drugs_reset: "Clear",
      main_drugs_check: "Check",
      main_drugs_prescribe: "Prescribe",
      main_drugs_write: "Write a prescription",
    },
  },
  ru: {
    translation: {
      // "Welcome to React": "добро пожаловать в экф",
      patient_patients: "Пациенты",
      main_menu_exit: "Выход",
      patient_notSelected: "Пациент не выбран",
      main_search_tip: "Внесите лекарственные препараты с помощью строки поиска наверху или",
      main_parser_tip: "напишите их свободным текстом",
      main_parser_header: "Введите препараты",
      main_parser_tip2: "Можно указать несколько препаратов с дозировками, система попытается их распознать",
      main_parser_cancel: "Отмена",
      main_parser_parse: "Распознать",
      main_search_notFound: "Ничего не найдено",
      main_drugs_reset: "Сбросить",
      main_drugs_check: "Проверить",
      main_drugs_prescribe: "Назначить",
      main_drugs_write: "Выписать",
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
