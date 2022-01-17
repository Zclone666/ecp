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

      patinet_card_passport_label: "Заполнить паспортные данные",
      patinet_card_name_patient: "Введите имя пациента",
      protocol: "Протокол",
      patinet_card_passport_edit: "Редактировать паспортные данные",
      patinet_card_collapse_passport: "Свернуть паспортные данные",
      new_patient: "Новый пациент",
      sex: "Пол",
      male: "Мужчина",
      female: "Женщина",
      growth: "Рост",
      weight: "Вес",
      body_mass_index: "ИМТ",
      body_surface_area: "ППТ",

      kg_m2: "кг/м²",
      m2: "м²",
      underlying_disease: "Основное заболевание",
      accompanying_illnesses: "Сопутствующие заболевания",
      gene_mutation: "Мутация гена",
      allele: "Аллель",
      add: "Добавить",
      genetic_passport: "Генетический паспорт",
      update_patient_genetic_passport: "Обновить генетический паспорт пациента",
      download_genetic_passport: "Загрузить генетический паспорт",
      allergy: "Аллергия",
      laboratory_data: "Лабораторные данные",
      pregnancy: "Беременность",
      trimester: "Триместр",

      week: "Неделя",
      car_driving: "Вождение авто",
      alcohol: "Алкоголь",
      lactation: "Кормление грудью",
      fill_out_protocol: "Заполните протокол и нажмите кнопку 'печать' в конце",
      close: "Закрыть",
      main_menu_settings: "Настройки",
      main_menu_profile: "Профиль",
      main_menu_clinics: "Клиники",

      not_allowed_rf: "Не разрешено на территории РФ",
      federal_list: "ЖНВЛП федеральный список",
      set_output_options: "Установите параметры вывода",
      save: "Сохранить",
      back: "Назад",
      next: "Далее",
      result: "Результат",
      apply: "Применить",
      instruction: "Инструкция",

      login: "Вход в систему",
      in_system: "в системе",
      confirm: "Подтвердить",
      registration: "Регистрация",
      restore: "Восстановить",
      forgot_your_password: "Забыли пароль",
      remember_me: "Запомнить меня",
      personal_key: "Персональный ключ",
      password: "Пароль",

      jump: "Перейти",
      go_to_login: "Перейдите на страницу авторизации.",
      you_already_registered: "Вы уже зарегистрированы в системе!",
      attention: "Внимание!",
      already_registered: "Уже зарегистрированы?",
      password_six_characters: "Пароль должен содержать не менее шести символов",
      password_confirmation: "Подтверждение пароля",
      clinic_selected: "Выбрана клиника",
      department: "Отделение",
      enter_name_clinic: "Введите наименование вашей клиники",
      last_name: "Фамилия",
      middle_name: "Отчество",
      first_name: "Имя",

      fill_passport_details: "Заполните необходимые паспортные данные чтобы сохранить нового пациента",
      new: "Новый",
      delete: "Удалить",
      patient: "Пациент",
      analogues: "Аналоги",
      no_analogues: "Нет аналогов",
      more: "Подробнее",

      // 'day', 'день',
      //  'day','дня',
      //  'days','дней',

      //  'year','год',
      //  'of the year','года',
      //  'years', 'лет',

      //  'month', 'месяц',
      //  'month',  'месяца',
      //  'months', 'месяцев',

      //  'a week','неделя',
      //  'weeks', 'недели',
      //  'weeks', 'недель',
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

i18n.res = resources.ru.translation;

export default i18n;
