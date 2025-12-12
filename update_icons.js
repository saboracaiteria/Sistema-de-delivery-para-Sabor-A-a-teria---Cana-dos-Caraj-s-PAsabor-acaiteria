import fs from 'fs';
import path from 'path';
import https from 'https';
import { promisify } from 'util';

const logoUrl = 'https://raw.githubusercontent.com/saboracaiteria/SABOR-/main/175.jpg';

const filesToUpdate = [
    'public/pwa-192x192.png',
    'public/pwa-512x512.png',
    'public/favicon.ico',
    'public/apple-touch-icon.png',
    'android/app/src/main/res/drawable/splash.png',
    'android/app/src/main/res/mipmap-hdpi/ic_launcher.png',
    'android/app/src/main/res/mipmap-mdpi/ic_launcher.png',
    'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png',
    'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png',
    'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png',
    'android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png',
    'android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png',
    'android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png',
    'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png',
    'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png'
];

async function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

async function run() {
    console.log(`Baixando logo de: ${logoUrl}`);

    // Baixar para um arquivo temporário primeiro
    const tempFile = 'temp_logo.jpg';
    try {
        await downloadImage(logoUrl, tempFile);
        console.log('Download concluído.');

        for (const relPath of filesToUpdate) {
            const destPath = path.resolve(process.cwd(), relPath);
            const dir = path.dirname(destPath);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.copyFileSync(tempFile, destPath);
            console.log(`✅ Ícone atualizado: ${relPath}`);
        }

        fs.unlinkSync(tempFile);
        console.log('🎉 Todos os ícones foram atualizados com a foto do perfil!');

    } catch (error) {
        console.error('❌ Erro ao atualizar ícones:', error);
    }
}

run();
