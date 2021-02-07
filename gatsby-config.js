module.exports = {
    plugins: [
        `gatsby-transformer-json`,
        {
            resolve: `gatsby-source-filesystem`,
            options: {
              name: `articles`,
              path: `${__dirname}/src/articles/`,
            },
        }
    ],
    pathPrefix: '/release1.0/public/'
}