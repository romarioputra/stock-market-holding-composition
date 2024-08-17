const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function downloadFile() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://example.com')
    await page.screenshot({path: 'a.png'})
    await browser.close()
}

downloadFile();
