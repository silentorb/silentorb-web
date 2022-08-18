import {
  absoluteRelativePath, getDirName,
  getFileNameWithoutExtension,
  getFilesRecursive,
  getPathWithoutExtension,
  relativePath
} from './utility'
import * as fs from 'fs'
import { HandlebarsTemplate } from './types'
import * as path from 'path'
import git from 'isomorphic-git'

const Handlebars = require('handlebars')
const matter = require('gray-matter')
const marked = require('marked')
const fse = require('fs-extra')
const articlesDirectory = 'src/content'

const baseGitUrl = 'https://github.com/silentorb/silentorb-web/blob/master/src/content'

export interface ContentLoaderParams {
  key: string
  file: string
  parentPath?: string
}

export type ContentLoader<T> = (params: ContentLoaderParams) => [string, T]

interface Article {
  content: string
  data: any
  file: string
}

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

const getTitleFromMarkdown = (data: any) => (token: any) => {
  if (token.type === 'heading' && token.depth === 1) {
    data.title = token.text
  }
}

const indexPattern = /\/index$/

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

const loadTemplate: ContentLoader<HandlebarsTemplate> = ({ key, file }) =>
  [key, Handlebars.compile(fs.readFileSync(file, 'utf8'))]

function loadFiles<T = string>(directory: string, processor: ContentLoader<T>): Map<string, T> {
  const files = getFilesRecursive(directory)
  return new Map(
    files.map(file => {
      const relative = relativePath(directory, file)
      const key = getPathWithoutExtension(relative)
        if (!key)
        throw new Error(`Could not find file ${file}`)

      return processor({ key, file, parentPath: path.dirname(key) })
    })
  )
}

export type TemplateMap = Map<string, HandlebarsTemplate>

function loadTemplates(directory: string): TemplateMap {
  return loadFiles<HandlebarsTemplate>(directory, loadTemplate)
}

function loadArticles(directory: string, defaults?: any): Map<string, Article> {
  return loadFiles(directory, loadMarkDown(defaults))
}

function loadPartials() {
  const files = getFilesRecursive('src/partials')
  for (const file of files) {
    const name = getFileNameWithoutExtension(file)
    if (!name)
      throw new Error(`Could not find partial ${name}`)

    const template = fs.readFileSync(file, 'utf8')
    Handlebars.registerPartial(name, template, { noEscape: true })
  }
}

const outputDirectory = 'dist'
export type FileWriter = (relativePath: string, content: string) => void

const newWriteFile = (rootDirectory: string): FileWriter => (relativePath, content) => {
  const filePath = `${rootDirectory}/${relativePath}`

  fse.ensureDirSync(path.dirname(filePath))
  fs.writeFileSync(filePath, content, 'utf8')
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

export function getRequiredConfigString(name: string): string {
  const value = process.env[name]
  if (!value)
    throw Error(`Missing required environment variable ${name}`)

  return value
}

function convertArticle(templates: TemplateMap, writeFile: FileWriter, key: string, article: Article) {
  const templateName = article.data.template || 'article'
  const pageTemplate = templates.get(templateName)
  if (!pageTemplate)
    throw Error(`Could not find page template ${templateName} for page ${key}`)

  const html = pageTemplate({
    content: article.content,
    ...article.data,
  })
  writeFile(`${key}/index.html`, html)
}

export async function buildSite() {
  require('dotenv').config()
  console.log('Building site')
  loadPartials()
  const templates = loadTemplates('src/templates')
  const pages = loadTemplates('src/pages')
  // MARLOTH_STORY_DIR should point to the marloth-story-docs/docs directory
  const marlothDirectory = process.env.MARLOTH_STORY_DIR || './node_modules/marloth-story-docs/docs'
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

  fse.removeSync(outputDirectory)
  fse.ensureDirSync(outputDirectory)
  fse.copySync('public', outputDirectory)

  const writeFile = newWriteFile(outputDirectory)

  for (const [title, page] of pages) {
    const html = page({
      title,
      icon: '/images/s.ico',
      iconType: 'image/vnd.microsoft.icon',
    })
    writeFile(`${title}.html`, html)
  }

  for (const [key, article] of articles) {
    convertArticle(templates, writeFile, key, article)
  }
  console.log('Finished building site')
}
