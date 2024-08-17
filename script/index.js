const puppeteer = require('puppeteer');
const path = require('path');
const AdmZip = require("adm-zip");

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

async function index() {
    let fileName = ''
    const downloadPath = path.resolve('./download');
    const browser = await puppeteer.launch();
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
            console.log(fileName)
        }
    });

    await setDownloadBehaviour(page, downloadPath)
    await page.click('.btn.btn--primary')
    await waitUntilDownload(page)
    await browser.close()
}
// index();

function unzip() {
    const zip = new AdmZip("./download/BalanceposEfek20240731.zip");
    zip.extractAllTo("download")
}

unzip()