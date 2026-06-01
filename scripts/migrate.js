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

// Function to recursively find all .ts files
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

// 1. Move entities
for (const [enFolder, esFolder] of Object.entries(mappings)) {
    const enEntitiesDir = path.join(srcDir, enFolder, 'entities');
    const esEntitiesDir = path.join(srcDir, esFolder, 'entities');

    if (fs.existsSync(enEntitiesDir)) {
        if (!fs.existsSync(esEntitiesDir)) {
            fs.mkdirSync(esEntitiesDir, { recursive: true });
        }

        const entities = fs.readdirSync(enEntitiesDir);
        for (const entityFile of entities) {
            const oldPath = path.join(enEntitiesDir, entityFile);
            const newPath = path.join(esEntitiesDir, entityFile);
            fs.copyFileSync(oldPath, newPath);
            console.log(`Moved ${oldPath} -> ${newPath}`);
        }
    }
}

// 2. Update imports in all files
let updatedFilesCount = 0;
for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    for (const [enFolder, esFolder] of Object.entries(mappings)) {
        // Find imports like: from '../../products/entities/product.entity'
        // We use a regex to match the folder name in the path
        const regex1 = new RegExp(`(['"])(.*?)/${enFolder}/entities/(.*?)['"]`, 'g');
        content = content.replace(regex1, `$1$2/${esFolder}/entities/$3$1`);
        
        const regex2 = new RegExp(`(['"])(.*?)/${enFolder}/(.*?)(['"])`, 'g');
        content = content.replace(regex2, `$1$2/${esFolder}/$3$1`);
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        updatedFilesCount++;
        console.log(`Updated imports in ${file}`);
    }
}

console.log(`\nUpdated imports in ${updatedFilesCount} files.`);
