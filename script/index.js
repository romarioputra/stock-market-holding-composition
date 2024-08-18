const puppeteer = require('puppeteer');
const path = require('path');
const AdmZip = require("adm-zip");
const fs = require('fs/promises');
const downloadDirectory = 'download'

// https://chromedevtools.github.io/devtools-protocol/tot/Browser/
async function waitUntilDownload(page) {
    return new Promise((resolve, reject) => {
        page._client().on('Page.downloadProgress', e => { // or 'Browser.downloadProgress'
            if (e.state === 'completed') {
                resolve();
            } else if (e.state === 'canceled') {
                reject();
            }
        });
    });
}

async function setDownloadBehaviour(page, downloadPath) {
    await page._client().send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath
    });
}

function unzip(fileName) {
    const zip = new AdmZip(`./${downloadDirectory}/${fileName}`);
    zip.extractAllTo(`${downloadDirectory}`)
}

async function parseToJSON(fileName) {
    const array = (await fs.readFile(`./${downloadDirectory}/${fileName}`, 'utf8')).split("\n")
    return array
}

async function index() {
    let fileName = ''
    const downloadPath = path.resolve(`./${downloadDirectory}`);
    const browser = await puppeteer.launch({
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(
        'https://www.ksei.co.id/archive_download/holding_composition',
        { waitUntil: 'networkidle2' }
    );
    // https://stackoverflow.com/questions/57408918/can-we-somehow-rename-the-file-that-is-being-downloaded-using-puppeteer
    page.on('response', response => {
        const url = response.request().url();
        const contentType = response.headers()['content-type'];
        if (contentType == 'application/zip') {
            fileName = url.split("/").pop()
        }
    });

    await setDownloadBehaviour(page, downloadPath)
    await page.click('.btn.btn--primary')
    await waitUntilDownload(page)
    unzip(fileName)
    const data = await parseToJSON(fileName.replace(".zip", ".txt"))
    await browser.close()
}

// index();

const test = async () => {
    const data = await parseToJSON('Balancepos20240731.zip'.replace(".zip", ".txt"))
    console.log(data[1])
}
test()