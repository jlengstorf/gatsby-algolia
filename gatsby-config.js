require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

const striptags = require("striptags")

const blogQuery = `
  {
    allMarkdownRemark {
      nodes {
        frontmatter {
          title
          date
          description
        }
        fields {
          slug
        }
        html
      }
    }
  }
`

const queries = [
  {
    query: blogQuery,
    transformer: ({ data }) => {
      // 1. Break each post into an array of searchable text chunks.
      // 2. return a flattened array of all indices
      return data.allMarkdownRemark.nodes.reduce((indices, post) => {
        // 1. description (if it exists)
        // 2. Each paragraph

        const pChunks = striptags(post.html, [], "XXX_SPLIT_HERE_XXX").split(
          "XXX_SPLIT_HERE_XXX"
        )

        const chunks = pChunks.map(chnk => ({
          slug: post.fields.slug,
          date: post.frontmatter.date,
          title: post.frontmatter.title,
          excerpt: chnk,
        }))

        if (post.frontmatter.description) {
          chunks.push({
            slug: post.fields.slug,
            date: post.frontmatter.date,
            title: post.frontmatter.title,
            excerpt: post.frontmatter.excerpt,
          })
        }

        const filtered = chunks.filter(chnk => !!chnk.excerpt)

        return [...indices, ...filtered]
      }, [])
    },
  },
]

module.exports = {
  siteMetadata: {
    title: `Gatsby Starter Blog`,
    author: `Kyle Mathews`,
    description: `A starter blog demonstrating what Gatsby can do.`,
    siteUrl: `https://gatsby-starter-blog-demo.netlify.com/`,
    social: {
      twitter: `kylemathews`,
    },
  },
  plugins: [
    {
      resolve: "gatsby-plugin-algolia",
      options: {
        appId: process.env.ALGOLIA_APP_ID,
        apiKey: process.env.ALGOLIA_API_KEY,
        indexName: process.env.ALGOLIA_INDEX_NAME,
        queries,
        chunkSize: 1000,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        //trackingId: `ADD YOUR TRACKING ID HERE`,
      },
    },
    `gatsby-plugin-feed`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Gatsby Starter Blog`,
        short_name: `GatsbyJS`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `content/assets/gatsby-icon.png`,
      },
    },
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
  ],
}
