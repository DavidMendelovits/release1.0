const puppeteer = require('puppeteer');
async function getArticlesToIndex() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://sbw.org/release1.0/');

    let articles = await page.evaluate(() => {
        let results = []
        let items = document.querySelectorAll('a')
        console.log(items)
        items.forEach((item) => {
            results.push({
                url: item.getAttribute('href'),
                publishDate: item.innerText
            })
        })
        return results;
    })

    await browser.close();
    return articles
}


(async () => {
    let articles = await getArticlesToIndex()
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null, 
  });

  const page = await browser.newPage();

  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: '/Users/davidmendelovits/code/pdfReader/articles'
    })
  await client.send('Fetch.enable', {
    patterns: [
      {
        urlPattern: '*',
        requestStage: 'Response',
      },
    ],
  });

  await client.on('Fetch.requestPaused', async (reqEvent) => {
    const { requestId } = reqEvent;

    let responseHeaders = reqEvent.responseHeaders || [];
    let contentType = '';

    for (let elements of responseHeaders) {
      if (elements.name.toLowerCase() === 'content-type') {
        contentType = elements.value;
      }
    }

    if (contentType.endsWith('pdf') || contentType.endsWith('xml')) {

      responseHeaders.push({
        name: 'content-disposition',
        value: 'attachment',
      });

      const responseObj = await client.send('Fetch.getResponseBody', {
        requestId,
      });

      await client.send('Fetch.fulfillRequest', {
        requestId,
        responseCode: 200,
        responseHeaders,
        body: responseObj.body,
      });
    } else {
      await client.send('Fetch.continueRequest', { requestId });
    }
  });

  await page.goto('https://sbw.org/release1.0/');
 
  articles = articles.filter((article) => article.url.includes('downloads.oreilly'))
  for (article of articles) {
      console.log(article)
      try {
        await page.goto(article.url)
        await page.waitFor(10000)
      } catch (err) {
          console.log(err)
      }
  }
//   await page.goto('http://downloads.oreilly.com/radar/r1/04-92.pdf')

  await client.send('Fetch.disable');

  await browser.close();
})();