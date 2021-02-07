import * as React from "react"
import Articles from './articles'
import { graphql, useStaticQuery } from "gatsby"
import Header from './Rel10Header.png'
// markup
const IndexPage = () => {
  const files = useStaticQuery(graphql`
        query {
            allFile(filter: {extension: {eq: "json"}}) {
                edges {
                    node {
                        name
                        internal {
                            content
                        }
                    }
                }
            }
        }
    `)
  const items = []
  for (let edge of files.allFile.edges) {
      let item = {}

      item.name = edge.node.name
      let json = JSON.parse(edge.node.internal.content)
      item.content = json.contents
      item.url = json.url
      item.writtenDate = json.publishDate
      if (json.publishDate.includes("/")) {
          json.publishDate = json.publishDate.split('/')[1]
      }
      item.publishDate = new Date(json.publishDate)
      
      items.push(item)
  }
  return (
    <div className={"main-container"}>
        <img src={Header} alt={"header"} />
        <Articles items={items} />
    </div>
  )
}

export default IndexPage
