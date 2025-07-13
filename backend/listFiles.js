const fs = require('fs').promises;
const path = require('path');

async function listFiles(dir, ignore = ['node_modules']) {
  let results = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // استثناء المجلدات المحددة
      if (ignore.includes(entry.name)) continue;

      if (entry.isDirectory()) {
        // استدعاء الدالة بشكل متكرر للمجلدات
        const subFiles = await listFiles(fullPath, ignore);
        results = results.concat(subFiles);
      } else {
        // إضافة الملفات فقط
        results.push(path.relative(process.cwd(), fullPath));
      }
    }
  } catch (err) {
    console.error(`خطأ في قراءة ${dir}:`, err);
  }

  return results;
}

// تشغيل الدالة وحفظ النتائج
(async () => {
  const files = await listFiles(process.cwd());
  console.log(files.join('\n'));

  // اختياري: حفظ في ملف
  await fs.writeFile('project_files.txt', files.join('\n'), 'utf8');
  console.log('تم حفظ أسماء الملفات في project_files.txt');
})();