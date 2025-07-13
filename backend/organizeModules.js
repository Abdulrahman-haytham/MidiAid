const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, 'src', 'modules');

const standardFiles = {
  controller: '.controller.js',
  route: '.route.js',
  validator: '.validator.js',
  model: '.model.js',
  service: '.service.js',
};

const normalizeName = (baseName, type) => {
  if (type === 'model') {
    return `${baseName.charAt(0).toUpperCase() + baseName.slice(1)}${standardFiles[type]}`;
  }
  return `${baseName.toLowerCase()}${standardFiles[type]}`;
};

fs.readdirSync(modulesDir).forEach((moduleFolder) => {
  const modulePath = path.join(modulesDir, moduleFolder);
  if (!fs.statSync(modulePath).isDirectory()) return;

  const files = fs.readdirSync(modulePath);
  const exportsCode = [];

  const baseName = moduleFolder; // مثل cart أو product

  Object.entries(standardFiles).forEach(([type, suffix]) => {
    let existingFile = files.find(f => f.toLowerCase().includes(type) && f.endsWith('.js'));
    
    // معالجة الموديل بشكل خاص
    if (type === 'model') {
      existingFile = files.find(f => f.toLowerCase() === `${baseName.toLowerCase()}.js` || f.toLowerCase().includes('model'));
    }

    const targetFileName = normalizeName(baseName, type);
    const targetPath = path.join(modulePath, targetFileName);

    if (existingFile) {
      const oldPath = path.join(modulePath, existingFile);
      if (existingFile !== targetFileName && fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, targetPath);
        console.log(`✅ Renamed: ${existingFile} → ${targetFileName}`);
      } else {
        console.log(`✔ Already correct: ${targetFileName}`);
      }
    } else {
      // إذا الملف غير موجود مثل service.js نضيف ملف فارغ
      if (type === 'service') {
        fs.writeFileSync(targetPath, `// ${type} logic for ${baseName} module\n\nmodule.exports = {};`);
        console.log(`➕ Created empty: ${targetFileName}`);
      }
    }

    // تجهيز التصدير للـ index.js
    if (fs.existsSync(targetPath)) {
      const varName = type === 'model'
        ? `${baseName.charAt(0).toUpperCase() + baseName.slice(1)}`
        : `${type}`;
      exportsCode.push(`const ${varName} = require('./${targetFileName}');`);
    }
  });

  // إنشاء ملف index.js داخل المجلد
  const indexPath = path.join(modulePath, 'index.js');
  const exportVars = exportsCode.map(line => {
    const name = line.match(/const (\w+)/)[1];
    return `  ${name},`;
  });

  const indexContent = `${exportsCode.join('\n')}

module.exports = {
${exportVars.join('\n')}
};
`;

  fs.writeFileSync(indexPath, indexContent);
  console.log(`📦 index.js created for module: ${moduleFolder}\n`);
});
