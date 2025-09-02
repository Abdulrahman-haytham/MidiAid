# نبدأ من نسخة Node.js رسمية
FROM node:18

# نحدد مجلد العمل داخل الحاوية
WORKDIR /app

# ننسخ ملفات المشروع إلى الحاوية
COPY . .

# نثبت التبعيات
RUN npm install

# نحدد البورت المفتوح
EXPOSE 3000

# نحدد الأمر الأساسي لتشغيل السيرفر
CMD ["node", "startServer.js"]
