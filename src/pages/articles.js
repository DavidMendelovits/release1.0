import React, {
    useEffect,
    useState
} from 'react'
import { graphql, useStaticQuery } from "gatsby"
import * as JsSearch from 'js-search';

const Articles = ({ items }) => {
    let search
    let [searchTerm, setSearchTerm] = useState('')
    search = new JsSearch.Search('name')
    search.searchIndex = new JsSearch.UnorderedSearchIndex();
    search.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();

    search.addIndex('name')
    search.addIndex('content')
    search.addDocuments(items)
    let [results, setResults] = useState(items);
    let updateSearch = (str) => {
        if (str == '') {
            setResults(items)
            return 
        }
        let searchResults = search.search(str)
        setResults(searchResults)
    }
    
    return (
        <div className={"articles-index"}>
            <input
                // onChange={e => updateSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key == 'Enter') {
                        setSearchTerm(e.target.value)
                        updateSearch(e.target.value)
                    }
                }}
            >
            </input>
            <button onClick={() => updateSearch(searchTerm)}>
                click/enter
            </button>
            <div className="articles-container">
            {
                results.map((item, idx) => {
                    return (
                        <div key={idx} className="article-container">
                            <a href={item.url}>
                                <h2>
                                    {item.name}{"\n"}
                                </h2>
                            </a> 
                           
                            <span>
                                {
                                    item.content.split("\n").map((line, i) => {
                                        return (
                                            <div key={"content-" + idx + i}>
                                                {line}
                                            </div>
                                        )
                                    })
                                }

                            </span>
                        </div>
                    )
                })
            }
            </div>
            
        </div>
    )
}

export default Articles