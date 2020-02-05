const express = require("express");
const puppeteer = require("puppeteer");
const absolutify = require("absolutify");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    res.send("No URL found");
  } else {
    try {
      const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      });
      const page = await browser.newPage();
      await page.goto(`https://${url}`, { waitUntil: "load", timeout: 0 });
      let document = await page.evaluate(
        () => document.documentElement.outerHTML,
        { waitUntil: "load", timeout: 0 }
      );
      document = absolutify(document, `/?url=${url.split("/")[0]}`);
      res.send(document);
      browser.close();
    } catch (err) {
      console.log("Something went wrong, Error: ", err);
      res.send("Unable to load page");
      browser.close();
    }
  }
});

app.post("/getPDF", async (req, res) => {
  const pdf = printPDF(req.body.html);
  const p = await pdf;
  const name  = req.body.name || 'ExternalDataRequest'
  res.setHeader('Content-disposition', `attachment; filename=${name}.pdf`);
  res.contentType("application/pdf");
  res.send(p);
});

async function printPDF(html) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
 
  const page = await browser.newPage();
  await page.setContent(html, {timeout: 0});
  const pdf = await page.pdf({
    format: "A4",
    preferCSSPageSize: true,
    printBackground: true
  });
  await browser.close();
  return pdf;
}

const server = app.listen(process.env.PORT);
server.timeout = 100000;
