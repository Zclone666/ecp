# Берем node.js v8 в качестве родительского образа
FROM node:8
# Устанавливаем рабочую директорию
WORKDIR /app
# Копируем файлы yarn.lock и package.json в рабочую директорию
COPY package.json yarn.lock /app/
# Устанавливаем зависимости
RUN yarn install