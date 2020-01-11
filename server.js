const expresss = require('express');
const puppeteer = require('puppeteer');
const absolutify = require('absolutify');

const app = expresss();

app.get('/', async (req, res) => {
    const {url} = req.query;
    if (!url) {
        res.send('No URL found');
    } else {
        try {
            const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
            const page = await browser.newPage();
            await page.goto(`https://${url}`, {waitUntil: 'load', timeout: 0})
            let document = await page.evaluate(() => document.documentElement.outerHTML, {waitUntil: 'load', timeout: 0});
            document = absolutify(document, `/?url=${url.split('/')[0]}`)
            res.send(document);
            browser.close();
        }
        catch (err) {
            console.log('Something went wrong, Error: ', err);
            res.send('Unable to load page');
            browser.close();
        }
      
    }
});
app.listen(process.env.PORT);