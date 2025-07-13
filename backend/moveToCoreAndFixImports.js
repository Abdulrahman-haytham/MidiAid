const fs = require('fs');
const path = require('path');

const projectSrc = path.join(__dirname, 'src');
const modulesDir = path.join(projectSrc, 'modules');
const coreDir = path.join(projectSrc, 'core');

// المجلدات التي نريد نقلها من modules إلى core
const foldersToMove = ['config', 'middlewares', 'lib'];

// دالة لنقل مجلد كامل
function moveFolder(folderName) {
  const oldPath = path.join(modulesDir, folderName);
  const newPath = path.join(coreDir, folderName);

  if (!fs.existsSync(oldPath)) {
    console.log(`❌ Folder not found: ${oldPath}`);
    return;
  }
  if (!fs.existsSync(coreDir)) {
    fs.mkdirSync(coreDir);
  }
  if (fs.existsSync(newPath)) {
    console.log(`⚠️ Folder already exists at destination, skipping move: ${newPath}`);
    return;
  }
  fs.renameSync(oldPath, newPath);
  console.log(`✅ Moved ${folderName} to core/`);
}

// دالة لتعديل الاستيرادات في ملف جافاسكريبت
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  let originalContent = content;

  foldersToMove.forEach((folder) => {
    // مثال: from '../modules/config' to '../core/config'
    const regex = new RegExp(`(['"\`])([^'"\`]*modules/${folder}[^'"\`]*)\\1`, 'g');

    content = content.replace(regex, (match, quote, p1) => {
      return match.replace('modules', 'core');
    });
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✏️ Fixed imports in ${filePath}`);
  }
}

// دالة للبحث عن ملفات .js داخل src recursively
function fixImportsRecursively(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      fixImportsRecursively(fullPath);
    } else if (stat.isFile() && fullPath.endsWith('.js')) {
      fixImportsInFile(fullPath);
    }
  });
}

// التنفيذ:
foldersToMove.forEach(moveFolder);
fixImportsRecursively(projectSrc);

console.log('🎉 Finished moving folders and fixing imports!');
