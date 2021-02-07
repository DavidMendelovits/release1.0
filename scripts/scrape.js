const puppeteer = require('puppeteer');
const fs = require('fs');

// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto('https://sbw.org/release1.0/');

//   let articles = await page.evaluate(() => {
//       let results = []
//       let items = document.querySelectorAll('a')
//       console.log(items)
//       items.forEach((item) => {
//           results.push({
//               url: item.getAttribute('href'),
//               publishDate: item.innerText
//           })
//       })
//       return results;
//   })
//   console.log(articles)

//   await browser.close();
//   fs.mkdirSync('articles', {recursive: true})
// })();

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();
    const client = await page.target().createCDPSession()

    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: './'
    })
    await client.send('Fetch.enable', {
        patterns: [
            {
                urlPattern: '*',
                requestStage: 'Response'
            }
        ]
    })
    await client.on('Fetch.requestPaused', async (reqEvent) => {
        // Retrieve EventID
        const { requestId } = reqEvent;
        console.log('req', reqEvent)
    
        let responseHeaders = reqEvent.responseHeaders || [];
        let contentType = '';
    
        // Find and store 'content-type' header
        for (let elements of responseHeaders) {
          if (elements.name.toLowerCase() === 'content-type') {
            contentType = elements.value;
          }
        }
    
        if (contentType.endsWith('pdf') || contentType.endsWith('xml')) {
          // Uncomment the line below to log response headers for debugging
          // console.log(reqEvent.responseHeaders);
    
          // Adding 'content-disposition: attachment' header will tell the browser to download the file instead of opening it in using built-in viewer
          const foundHeaderIndex = responseHeaders.findIndex(
            (h) => h.name === "content-disposition"
          );
          const attachmentHeader = {
            name: "content-disposition",
            value: "attachment",
          };
          if (foundHeaderIndex) {
            responseHeaders[foundHeaderIndex] = attachmentHeader;
          } else {
            responseHeaders.push(attachmentHeader);
          }
    
          /*
            Fetch.getResponseBody
            https://chromedevtools.github.io/devtools-protocol/tot/Fetch/#method-getResponseBody
            Causes the body of the response to be received from the server and returned as a single string. May only be issued for a request that is paused in the Response stage and is mutually exclusive with takeResponseBodyForInterceptionAsStream. Calling other methods that affect the request or disabling fetch domain before body is received results in an undefined behavior.
          */
          const responseObj = await client.send('Fetch.getResponseBody', {
            requestId,
          });
    
          /*
            Fetch.fulfillRequest
            https://chromedevtools.github.io/devtools-protocol/tot/Fetch/#method-fulfillRequest
            Provides response to the request.
          */
          await client.send('Fetch.fulfillRequest', {
            requestId,
            responseCode: 200,
            responseHeaders,
            body: responseObj.body,
          });
        } else {
          // If the content-type is not what we're looking for, continue the request without modifying the response
          await client.send('Fetch.continueRequest', { requestId });
        }
      });
    
      await page.goto('http://downloads.oreilly.com/radar/r1/04-92.pdf');
    
      await page.waitFor(100000);
    
      /*
        Fetch.disable
        https://chromedevtools.github.io/devtools-protocol/tot/Fetch/#method-disable
        Disables the fetch domain.
      */
      await client.send('Fetch.disable');
    
      await browser.close();
})();