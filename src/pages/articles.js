import React, {
    useEffect,
    useState
} from 'react'
import { graphql, useStaticQuery } from "gatsby"
import * as JsSearch from 'js-search';
import FlatList from 'flatlist-react';

const Articles = ({ items }) => {
    // if (!items) return null
    let search
    let [searchTerm, setSearchTerm] = useState('')
    search = new JsSearch.Search('name')
    search.searchIndex = new JsSearch.UnorderedSearchIndex();
    search.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();

    search.addIndex('name')
    search.addIndex('content')
    if (items) {
        search.addDocuments(items)
    }
    let [results, setResults] = useState(items);
    let updateSearch = (str) => {
        if (str == '') {
            setResults(items)
            return 
        }
        let searchResults = search.search(str)
        setResults(searchResults)
    }
    
    const renderArticleListing = (article, idx) => {
        return (
            <div key={idx}>
                <b>
                    <a href={article.url}>
                        {article.name}
                    </a>
                </b>
            </div>
        )
    }

    return (
        <div className={"articles-index"}>
            <form>
                <label>
                    Search: 
                    <input
                        // onChange={e => updateSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key == 'Enter') {
                                e.preventDefault()
                                setSearchTerm(e.target.value)
                                updateSearch(e.target.value)
                            }
                        }}
                    />
                </label>
            </form>
            {/* 
            </input>
            <button onClick={() => updateSearch(searchTerm)}>
                click/enter
            </button> */}
            <div className="articles-container">
                <FlatList 
                    list={results}
                    renderItem={renderArticleListing}
                    renderWhenEmpty={() => <div>List is empty!</div>}
                />
            {/* {
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
            } */}
            </div>
            
        </div>
    )
}

export default Articles