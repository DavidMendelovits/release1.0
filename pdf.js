

var pdfjsLib = require("pdfjs-dist/es5/build/pdf.js");

let pdfPath = '01-83.pdf'
var fs = require('fs')

async function parsePDF(path) {
  var loadingTask = pdfjsLib.getDocument(path);

  loadingTask.promise.then(async (doc) => {
    
    var loadPage = function (pageNum) {
        return doc.getPage(pageNum).then(function (page) {
          var viewport = page.getViewport({ scale: 1.0 });
          return page
            .getTextContent()
            .then(function (content) {
              // Content contains lots of information about the text layout and
              // styles, but we need only strings at the moment
              var strings = content.items.map(function (item) {
                return item.str;
              });
              return strings
            })
        });
      };
      let page = await loadPage(1)
      let toc
      for (let lineNo in page) {
        if (page[lineNo].match(/inside/i) || page[lineNo].match(/contents/i)) {
            console.log(" table of contents found!")
            toc = page.slice((Number(lineNo) + Number(1)))
            break;
        }
      }
      let txtFile = path.replace('.pdf', '.txt')
      fs.writeFileSync(txtFile, toc.join('\n'))
  }).catch(err => {
    console.log('err', err)
  })
}

let articles = fs.readdirSync('articles')
articles = articles.filter(article => article.includes('.pdf'))
console.log(articles)
articles = articles.map(article => {
  return "articles/" + article
})
console.log(articles)

for (articlePath of articles) {

  try {
    console.log('articl', articlePath)
    parsePDF(articlePath)
  } catch (e) {
    console.log(e)
  }
  
}





// var loadingTask = pdfjsLib.getDocument(pdfPath);

// loadingTask.promise.then(async (doc) => {
//     console.log('pages: ', doc.numPages)
//     var loadPage = function (pageNum) {
//         return doc.getPage(pageNum).then(function (page) {
//           var viewport = page.getViewport({ scale: 1.0 });
//           return page
//             .getTextContent()
//             .then(function (content) {
//               // Content contains lots of information about the text layout and
//               // styles, but we need only strings at the moment
//               var strings = content.items.map(function (item) {
//                 return item.str;
//               });
//               return strings
//             })
//         });
//     };
//     let page = await loadPage(1)
//     let toc
//     for (let lineNo in page) {
//         console.log(lineNo)
//         if (page[lineNo].match(/inside/i) || page[lineNo].match(/contents/i)) {
//             console.log("found!")
//             toc = page.slice((Number(lineNo) + Number(1)))
//             break;
//         }
//     }
//     let tableOfContents = []
//     let row = {
//         title: ''
//     }
//     let tokens = []
//     //0 string
//     // 1 number
//     for (let i = 0; toc[i]; i++) {
//         let line = toc[i]

//         tableOfContents.push(toc[i])
//         if (line.match(/[a-zA-Z]+/g) && line.match(/[0-9]/)) {

//             // console.log("both found", line)
//             // let num = line.match(/\d+/g)
//             // let words = line.match(/[a-zA-Z]+/g)
//             // row.title += words.join(' ')
//             // row.pageNumber = num[0]
//             // console.log('output', row)
//         } else if (line.match(/[0-9]/)) {
//             console.log("number found")
//             // if (parseInt(line)) {
//             //     row.pageNumber = parseInt(line)
//             // }
//         } else {
//             // row.title += line;
            
//         }
        
//         // if (row.pageNumber && row.title) {
//         //     tableOfContents.push(row)
//         //     row = {
//         //         title: ''
//         //     }
//         // }
//     }
//     console.log('table of contents:', tableOfContents)
// })

// const fs = require('fs');
// const pdf = require('pdf-parse');

// let dataBuffer = fs.readFileSync(pdfPath);

// let headers = []
// pdf(dataBuffer).then(function(data) {
//     // number of pages
// 	console.log(data.numpages);
// 	// number of rendered pages
// 	console.log(data.numrender);
// 	// PDF info
// 	console.log(data.info);
// 	// PDF metadata
// 	console.log(data.metadata); 
// 	// PDF.js version
// 	// check https://mozilla.github.io/pdf.js/getting_started/
// 	console.log(data.version);
// 	// PDF text
//     // console.log(data.text); 
    
//     let lines = data.text.split('\n')
//     let regex = new RegExp(/^[^a-z]*$/)
//     // let contentsCheck = new RegExp(/\bcontents\b/)
//         let toc
//     for (let i in lines) {
//         let line = lines[i]
//         // let hasContent = contentsCheck.test(line)
        
//         if (line.match(/inside/i) || line.match(/contents/i)) {
//             console.log("found!")
//             toc = lines.slice((Number(i) + Number(1)))
//             break;
//         }
//     }
//     console.log(headers, toc)
//     for (let line of toc) {
//         if (line.match(/^[^a-z]*$/)) {
//             console.log(line)
//         }

//     }
//     fs.writeFileSync('text.txt', data.text)
// })