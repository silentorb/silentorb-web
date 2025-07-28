import { getFileNameWithoutExtension, getFilesRecursive, loadFiles } from './utility'
import * as fs from 'fs'
import { ContentLoader, HandlebarsTemplate, SiteResources, TemplateMap } from './types'
import Handlebars = require('handlebars')

function loadTemplate(handlebars: any): ContentLoader<HandlebarsTemplate> {
  return ({ key, file }) => [key, handlebars.compile(fs.readFileSync(file, 'utf8'))]
}

function loadTemplates(load: ContentLoader<HandlebarsTemplate>): (directory: string) => TemplateMap {
  return directory => loadFiles<HandlebarsTemplate>(directory, load)
}

export function loadPartials() {
  const files = getFilesRecursive('src/partials')
  return new Map(
    files.map((file) => {
      const name = getFileNameWithoutExtension(file)
      if (!name)
        throw new Error(`Could not find partial ${name}`)

      const template = fs.readFileSync(file, 'utf8')
      return [name, template]
    })
  )
}

export function registerPartials(handlebars: any, partials: Map<string, any>) {
  partials.forEach((value, key) => {
    handlebars.registerPartial(key, value, { noEscape: true })
  })
}

export function loadSiteResources(): SiteResources {
  const partials = loadPartials()
  const handlebars = Handlebars.create()
  registerPartials(handlebars, partials)
  const loadSingle = loadTemplate(handlebars)
  const loadMany = loadTemplates(loadSingle)
  const templates = loadMany('src/templates')
  const pages = loadMany('src/pages')
  return {
    templates,
    pages,
    partials,
  }
}
