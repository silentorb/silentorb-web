import { absoluteRelativePath, loadFiles } from './utility'
import * as fs from 'fs'
import { Article, ContentLoader } from './types'
import git from 'isomorphic-git'

const Handlebars = require('handlebars')
const matter = require('gray-matter')
const marked = require('marked')
const articlesDirectory = 'src/content'

const indexPattern = /\/index$/

const getTitleFromMarkdown = (data: any) => (token: any) => {
  if (token.type === 'heading' && token.depth === 1) {
    data.title = token.text
  }
}

const baseGitUrl = 'https://github.com/silentorb/silentorb-web/blob/master/src/content'

const mdPattern = /(\/index)?\.md$/

function customMarkedRenderer(parentPath: string = '') {
  const renderer = new marked.Renderer()
  const link = renderer.link.bind(renderer)
  renderer.link = function (href: string, title: string, text: string) {
    const target = mdPattern.test(href)
      ? `/${absoluteRelativePath(parentPath, href.replace(mdPattern, ''))}`
      : href

    return link(target, title, text)
  }

  const heading = renderer.heading.bind(renderer)
  renderer.heading = function (text: string, level: number, raw: string, slugger: any) {
    return level > 1
      ? heading(text, level, raw, slugger)
      : ''
  }

  return renderer
}

const loadMarkDown: (defaults?: any) => ContentLoader<Article> = defaults => params => {
  const { key, file } = params
  const response = matter.read(file)
  const { content } = response
  const data = { ...defaults, ...response.data }
  const expanded = Handlebars.compile(content)({})
  const walkTokens = data.title ? undefined : getTitleFromMarkdown(data)
  const html = marked(expanded, { renderer: customMarkedRenderer(params.parentPath), walkTokens })
  const filteredKey = key.replace(indexPattern, '')
  return [filteredKey, { content: html, data, file }]
}

function loadArticles(directory: string, defaults?: any): Map<string, Article> {
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
  article.data.gitUrl = `${baseGitUrl}/${key}.md`
  return article
}

export async function loadAndPrepareArticles() {
  const articles = new Map([
    ...loadArticles(articlesDirectory),
    // ...loadArticles(marlothDirectory, { template: 'marloth', articleStyle: 'reading' }),
  ])

  for (const [key, article] of articles) {
    try {
      await loadGitMetaData(key, article)
    } catch {
    }
  }

  return articles
}
