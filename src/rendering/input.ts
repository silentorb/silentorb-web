import { getDirName, loadFiles } from './utility'
import * as fs from 'fs'
import { Article, ArticleMap, PartialMap, RawArticleMap, RenderingContext } from './types'
import git from 'isomorphic-git'
import * as path from 'path'
import { loadMarkDown, newMarkdownHandlebars, renderMarkDown } from './markdown'
import { registerPartials } from './templating'

const articlesDirectory = 'src/content'

const baseGitUrl = 'https://github.com/silentorb/silentorb-web/blob/master/'

function loadArticles(directory: string, defaults?: any): RawArticleMap {
  return loadFiles(directory, loadMarkDown(defaults))
}

const padDateNumber = (value: number) =>
  value.toString().padStart(2, '0')

const formateDateString = (date: Date) =>
  `${padDateNumber(date.getMonth() + 1)}/${padDateNumber(date.getDate())}/${date.getFullYear()}`

async function loadGitMetaData(key: string, article: Article): Promise<Article> {
  const commits = await git.log({ fs, dir: process.cwd(), depth: 1, filepath: article.file, })
  const timestamp = commits[0]?.commit?.committer?.timestamp
  const date = new Date(timestamp * 1000)
  article.data.modifiedString = `Last modified: ${formateDateString(date)}`
  article.data.gitUrl = `${baseGitUrl}/${article.file}`
  return article
}

async function checkLinks(articles: ArticleMap) {
  const promisify = require('util').promisify
  const markdownLinkCheck = promisify(require('markdown-link-check'))
  for (let [key, article] of articles) {
    const directoryPath = path.resolve((getDirName(article.file)))
    const result = await markdownLinkCheck(article.original, { baseUrl: `file://${directoryPath}` })
    if (result.status == 'dead') {
      console.error('result', result, key)
    }
  }
}

export async function loadAndPrepareArticles(partials: PartialMap) {
  const rawArticles: RawArticleMap = loadArticles(articlesDirectory)

  const context: RenderingContext = {
    articles: rawArticles
  }

  const markdownHandlebars = newMarkdownHandlebars()
  registerPartials(markdownHandlebars, partials)

  const articles = new Map(Array.from(rawArticles, ([key, value]) =>
    [key, renderMarkDown(markdownHandlebars, context, key, value)])
  )

  if (process.env.CHECK_LINKS) {
    await checkLinks(articles)
  }

  for (const [key, article] of articles) {
    try {
      await loadGitMetaData(key, article)
    } catch {
    }
  }

  return articles
}
