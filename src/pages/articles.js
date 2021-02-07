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

    let [sortByNew, setSortByNew] = useState(true)

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
    
    let SearchString = ({ article, indexOfSearchTerm} ) => {
        let start = indexOfSearchTerm
        let end = indexOfSearchTerm + searchTerm.length
        return (
            <>
                <b>{article.content.substring(start, end)}</b>
                {article.content.substring(end, end + 40)}{"...."}
            </>
        
        )
    }

    const renderArticleListing = (article, idx) => {
        let indexOfSearchTerm = article.content.toLowerCase().indexOf(searchTerm)
        return (
            <div key={idx}>
                <div>
                    <b>
                        <a href={article.url}>
                            {article.writtenDate}
                        </a>
                    </b>
                </div>
                <span>
                    {
                        indexOfSearchTerm != -1 && searchTerm.length
                        ? <SearchString article={article} indexOfSearchTerm={indexOfSearchTerm} />
                        : article.content.slice(0, 50) + "...."
                    }
                </span>
            </div>
        )
    }

    return (
        <div className={"articles-index"}>
            <div className={"search-bar"}>
                <form onSubmit={e => false}>
                    <label>
                        Search: 
                        <input
                            value={searchTerm}
                            onChange={e => {
                                setSearchTerm(e.target.value)
                            }}
                            onKeyDown={(e) => {
                                if (e.key == 'Enter') {
                                    e.preventDefault()
                                    setSearchTerm(e.target.value)
                                    updateSearch(e.target.value)
                                }
                            }}
                        />
                    </label>
                    <button
                        onClick={e => {
                            e.preventDefault()
                            updateSearch(searchTerm)
                        }}
                        onSubmit={e => false}
                    >
                        click/enter
                        </button>
                </form>
                <button
                    onClick={e => {
                        setSortByNew(!sortByNew)
                    }}
                >
                    sort by {sortByNew ? "old" : "new"}
                </button>
            </div>
            <div className="articles-container">
                <FlatList 
                    list={results}
                    renderItem={renderArticleListing}
                    renderWhenEmpty={() => <div>List is empty!</div>}
                    sortBy={[{key: "publishDate", descending: sortByNew}]}
                />
            </div>
        </div>
    )
}

export default Articles