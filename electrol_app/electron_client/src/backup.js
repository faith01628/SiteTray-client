// const fs = require('fs-extra');
const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');
const archiver = require('archiver');
const unzipper = require('unzipper');
const { log } = require('console');
// const fetch = require('node-fetch');

// Lấy đường dẫn tới thư mục AppData của người dùng hiện tại
const appDataDir = process.env.APPDATA;
if (typeof appDataDir !== 'string') {
    throw new Error('APPDATA environment variable is not set or not a string');
}
const partitionsDir = path.join(appDataDir, 'electron-app', 'Partitions');

// Hàm gọi API để lấy danh sách UUID theo accountId
async function getUuidList(accountId, token) {
    try {
        const response = await fetch('https://izm.transtechvietnam.com/getUuidByAccountid', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accountid: accountId })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Convert data to array of UUID strings
        return data.data.map(item => String(item.uuid));
    } catch (error) {
        console.error('Error fetching UUID list:', error);
        throw error;
    }
}

// Hàm tải file và giải nén
async function downloadAndExtractFile(url, outputPath) {
    const directoryPath = path.dirname(outputPath);
    const folderName = path.basename(outputPath, '.zip');
    const folderPath = path.join(directoryPath, folderName);

    if (await fs.promises.stat(folderPath).catch(() => false)) {
        console.log(`Thư mục ${folderName} đã tồn tại tại ${folderPath}`);
        return;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    // Kiểm tra kích thước nội dung
    const contentLength = response.headers.get('content-length');
    console.log(`Content-Length: ${contentLength}`);

    const fileStream = fs.createWriteStream(outputPath);
    await new Promise((resolve, reject) => {
        response.body.pipe(fileStream);
        response.body.on('error', (err) => reject(err));
        fileStream.on('finish', () => resolve());
    });

    // Kiểm tra kích thước file sau khi tải về
    const stats = await fs.promises.stat(outputPath);
    console.log(`Downloaded file size: ${stats.size} bytes`);

    await fs.promises.mkdir(folderPath, { recursive: true });
    await fs.createReadStream(outputPath)
        .pipe(unzipper.Extract({ path: folderPath }))
        .promise();

    // Xóa file zip sau khi giải nén thành công
    await fs.promises.unlink(outputPath);
    console.log(`File zip ${outputPath} đã được xóa sau khi giải nén thành công.`);
}

// Hàm nén thư mục thành file zip
async function zipFolder(uuid) {
    if (typeof uuid !== 'string') {
        throw new Error('UUID must be a string');
    }

    const folderPath = path.join(partitionsDir, uuid);
    const zipFilePath = path.join(partitionsDir, `${uuid}.zip`);

    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            resolve(zipFilePath);
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);
        archive.directory(folderPath, false);
        archive.finalize();
    });
}

// Hàm upload file zip lên server
// 

async function uploadBackup(uuid, token) {
    const filePath = path.join(partitionsDir, `${uuid}.zip`);

    if (!fs.existsSync(filePath)) {
        console.error(`File not found at path: ${filePath}`);
        return;
    }

    const fileStream = fs.createReadStream(filePath);

    const formData = new FormData();
    const fileName = path.basename(filePath);

    formData.append('linkbackup', fileStream);
    formData.append('uuid', uuid);

    try {
        const response = await fetch('https://izm.transtechvietnam.com/backup', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Network response was not ok: ${errorText}`);
        }

        const data = await response.json();
        console.log('Upload successful:', data);
    } catch (error) {
        console.error(`Error uploading backup for UUID ${uuid}:`, error);
    }
}


// Hàm chính để xử lý nén và upload
// async function backupData(accountId, token) {
//     try {
//         const uuidList = await getUuidList(accountId, token);

//         for (const uuid of uuidList) {

//             if (typeof uuid !== 'string') {
//                 console.error('Invalid UUID type:', typeof uuid);
//                 throw new Error('UUID must be a string');
//             }

//             // Download and extract the file first
//             const url = `https://izm.transtechvietnam.com/access/backup/${uuid}.zip`;
//             const outputPath = path.join(partitionsDir, `${uuid}.zip`);

//             try {
//                 await downloadAndExtractFile(url, outputPath);  // Ensure this completes first
//                 console.log(`File downloaded and extracted successfully to ${outputPath}`);
//             } catch (error) {
//                 console.error(`Error downloading or extracting file: ${error}`);
//                 continue; // Skip the rest of the process if download fails
//             }

//             // After successful download and extraction, proceed to compress and upload
//             try {
//                 const zipPath = await zipFolder(uuid);  // Compress the extracted folder
//                 await uploadBackup(uuid, token);        // Upload the compressed file to the server
//                 console.log(`Backup for UUID ${uuid} completed successfully.`);
//                 fs.removeSync(zipPath);
//             } catch (error) {
//                 console.error(`Error during backup process for UUID ${uuid}:`, error);
//             }
//         }
//     } catch (error) {
//         console.error('Error during overall backup process:', error);
//     }
// }

async function backupData(accountId, token) {
    try {
        const uuidList = await getUuidList(accountId, token);

        for (const uuid of uuidList) {

            if (typeof uuid !== 'string') {
                console.error('Invalid UUID type:', typeof uuid);
                throw new Error('UUID must be a string');
            }

            // Download and extract the file first
            const url = `https://izm.transtechvietnam.com/access/backup/${uuid}.zip`;
            const outputPath = path.join(partitionsDir, `${uuid}.zip`);

            try {
                await downloadAndExtractFile(url, outputPath);  // Ensure this completes first
                console.log(`File downloaded and extracted successfully to ${outputPath}`);
            } catch (error) {
                console.error(`Error downloading or extracting file: ${error}`);
                continue; // Skip the rest of the process if download fails
            }

            // After successful download and extraction, proceed to compress and upload
            try {
                const zipPath = await zipFolder(uuid);  // Compress the extracted folder
                await uploadBackup(uuid, token);        // Upload the compressed file to the server
                console.log(`Backup for UUID ${uuid} completed successfully.`);
                fs.removeSync(zipPath);
            } catch (error) {
                console.error(`Error during backup process for UUID ${uuid}:`, error);
            }
        }
    } catch (error) {
        console.error('Error during overall backup process:', error);
    }
}
// Ví dụ sử dụng: Bạn cần truyền vào accountId và token tương ứng
const token = localStorage.getItem('token');
const accountId = localStorage.getItem('account');
backupData(accountId, token);

module.exports = { backupData, zipFolder, uploadBackup, getUuidList };