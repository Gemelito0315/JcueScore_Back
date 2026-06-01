const fs = require('fs');
const path = require('path');

const mappings = {
    'customers': 'clientes',
    'products': 'productos',
    'reservations': 'reservas',
    'equipment': 'equipamiento',
    'payments': 'pagos',
    'invoices': 'facturas',
    'game-types': 'tipos-juego',
    'venues': 'sedes'
};

const srcDir = path.join(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else if (file.endsWith('.ts')) {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });
    return arrayOfFiles;
}

const allFiles = getAllFiles(srcDir);

let updatedFilesCount = 0;
for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    for (const [enFolder, esFolder] of Object.entries(mappings)) {
        // Fix imports like '../../venues/entities/venue.entity'
        content = content.replace(new RegExp(`(['"])(.*?)/${enFolder}/entities/(.*?)['"]`, 'g'), `$1$2/${esFolder}/entities/$3$1`);
        content = content.replace(new RegExp(`(['"])(.*?)/${enFolder}/(.*?)(['"])`, 'g'), `$1$2/${esFolder}/$3$1`);
        // In case the first regex missed because of no prefix:
        content = content.replace(new RegExp(`(['"])\\.\\./\\.\\./${enFolder}/entities/(.*?)['"]`, 'g'), `$1../../${esFolder}/entities/$2$1`);
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        updatedFilesCount++;
        console.log(`Updated imports in ${file}`);
    }
}

console.log(`\nUpdated imports in ${updatedFilesCount} files.`);
