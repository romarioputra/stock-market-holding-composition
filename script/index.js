const puppeteer = require('puppeteer');
const path = require('path');

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
    const downloadPath = path.resolve('./download');
    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage();
    await page.goto(
        'https://www.ksei.co.id/archive_download/holding_composition',
        { waitUntil: 'networkidle2' }
    );
    await setDownloadBehaviour(page, downloadPath)
    await page.click('.btn.btn--primary')
    await waitUntilDownload(page)
    await browser.close()
}
index();