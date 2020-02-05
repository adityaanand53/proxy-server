const express = require("express");
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get("/", async (req, res) => {
  console.log("here.. /");
  res.send("It works");
});

app.post("/getPDF", async (req, res) => {
  const pdf = printPDF(req.body.html);
  const p = await pdf;
  const name = req.body.name || "ExternalDataRequest";
  res.setHeader("Content-disposition", `attachment; filename=${name}.pdf`);
  res.contentType("application/pdf");
  res.send(p);
});

async function printPDF(html) {
  const browser = await puppeteer.launch({ 
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
  ]
  });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf({
    format: "A4",
    preferCSSPageSize: true,
    printBackground: true
  });
  await browser.close();
  return pdf;
}

app.listen(process.env.PORT || 3000);
