import { getFileNameWithoutExtension, getFilesRecursive, loadFiles } from './utility'
import * as fs from 'fs'
import { Article, ArticleMap, SiteResources, TemplateMap } from './types'
import * as path from 'path'

const fse = require('fs-extra')

export type FileWriter = (relativePath: string, content: string) => void

const newWriteFile = (rootDirectory: string): FileWriter => (relativePath, content) => {
  const filePath = `${rootDirectory}/${relativePath}`

  fse.ensureDirSync(path.dirname(filePath))
  fs.writeFileSync(filePath, content, 'utf8')
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

export function writeHtmlFiles(outputDirectory: string, resources: SiteResources, articles: ArticleMap) {
  const { pages, templates } = resources
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
}
