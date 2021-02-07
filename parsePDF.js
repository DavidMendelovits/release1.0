

var pdfjsLib = require("pdfjs-dist/es5/build/pdf.js");
var links = require('./articleLinks.json')
var fs = require('fs')

function getLinkForArticle (pdfName) {
  for (let info of links) {
    // console.log('info', info)
    if (info.url.includes(pdfName.replace('.pdf', ''))) {
      return info
    }
  }
}

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
            toc = page.slice((Number(lineNo) + Number(1)), (Number(page.length) - Number(5)))
            break;
        }
      }
      let txtFile = path.replace('.pdf', '.json')
      let linkForArticle = getLinkForArticle(txtFile.replace('src/articles/', '').replace('.json', ''))
      for (let lineNo in toc) {
        if (page[lineNo].match(/inside/i) || page[lineNo].match(/contents/i)) {
          console.log(" table of contents found AGAIN!!")
          toc = page.slice((Number(lineNo) + Number(1)), (Number(page.length) - Number(5)))
          break;
        } 
      }

      // let tokens = []
      // let headers = []
      // let header_position = 0
      // let i = 0;
      // let strings = []
      // let numbers = []
      // while(toc[i]) {
      //   //N
      //   let hasNumber = toc[i].match(/\d/)
      //   let hasAlpha = toc[i].match(/[a-z]/i)
      //   if (hasNumber && hasAlpha) {
      //     let expressions = toc[i].split(' ')
      //     let number = expressions.filter((e) => e.match(/^[0-9]+$/))
      //     let other = expressions.filter(e => e.match(/^[a-zA-Z]*$/))
      //     let header = {}
      //     header.pageNumber = number
      //     header.content = other.join(' ')
      //     if (strings.length > 1 && header_position > 0) {
      //       headers[header_position].moreContent = strings
      //     }
      //     headers.push(header)
      //     header_position += 1 
      //   } else if ((parseInt(toc[i]) || toc[i] == 0) && i > 0) {
      //     // toc[i-1] += " - " + toc[i]
      //     // toc[i] = ''
      //     if (strings.length) {
      //       let header = {}
      //       header.pageNumber = toc[i]
      //       header.content = strings.pop()
      //       if (strings.length > 1 && header_position > 0) {
      //         headers[header_position].moreContent = strings
      //       }
      //       headers.push(header)
      //       header_position += 1
      //     }
      //   } else if (toc[i].length == 1) {

      //   } else {
      //     //S
      //     strings.push(toc[i])
      //   }
      //   i += 1;
      // }
      // console.log('headers', headers)
      fs.writeFileSync(txtFile, JSON.stringify({
        contents: toc.join('\n'),
        url: linkForArticle.url,
        publishDate: linkForArticle.publishDate
      }))
  }).catch(err => {
    console.log('err', err)
  })
}

let articles = fs.readdirSync('src/articles')
articles = articles.filter(article => article.includes('.pdf'))
console.log(articles)
articles = articles.map(article => {
  return "src/articles/" + article
})
console.log(articles)

for (articlePath of articles) {

  try {
    parsePDF(articlePath)
  } catch (e) {
    console.log(e)
  }
  
}

module.exports = {
  parsePDF
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