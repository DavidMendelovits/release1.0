import * as React from "react"
import Articles from './articles'
import { graphql, useStaticQuery } from "gatsby"
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
      item.publishDate = json.publishDate
      items.push(item)
  }
  return (
    <Articles items={items} />
  )
}

export default IndexPage
