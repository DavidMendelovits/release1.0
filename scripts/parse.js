var pdfjsLib = require("pdfjs-dist/es5/build/pdf.js");
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
              toc = page.slice((Number(lineNo) + Number(1)), (Number(page.length) - Number(5)))
              break;
          }
        }
        let txtFile = path.replace('.pdf', '.json')
        for (let lineNo in toc) {
          if (page[lineNo].match(/inside/i) || page[lineNo].match(/contents/i)) {
            console.log(" table of contents found AGAIN!!")
            toc = page.slice((Number(lineNo) + Number(1)), (Number(page.length) - Number(5)))
            break;
          } 
        }

        
  
        let tokens = []
        let headers = []
        let header_position = 0
        let i = 0;
        let strings = []
        let numbers = []
        while (toc[i]) {
            //check first to see if sentence is complete header
            let hasNumber = !toc[i].includes('101') && toc[i].match(/\d/)
            let hasAlpha = toc[i].match(/[a-z]/i)
            console.log(toc[i], "numbers: " + hasNumber, "words: " + hasAlpha)
            if (hasNumber && hasAlpha) {
                let expressions = toc[i].split(' ')
                console.log('split', expressions)
                let pageNo = expressions.pop()
                let header_content = expressions
                let header = {}
                let inBuffer = null
                if (strings.length && strings.join(' ').match(/^[^a-z]*$/)) {
                    console.log('strings in buffer: ', strings)
                    inBuffer = strings.join(' ')
                    strings= []
                }
                header.content = (inBuffer) ? inBuffer : '' + header_content.join(' ')
                header.pageNo = pageNo
                headers.push(header)
                header_position += 1;
                console.log(header.content, pageNo)
            } else if (!hasNumber && toc[i].match(/^[^a-z]*$/)) {
                //is all caps
                console.log('all caps')
                strings.push(toc[i])
            }
            i += 1 ;
        }
        console.log('headers', headers)

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
        }))
        // console.log(toc)
    }).catch(err => {
      console.log('err', err)
    })
  }
  


parsePDF('scripts/06-06.pdf')