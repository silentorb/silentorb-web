import { loadAndPrepareArticles } from './input'
import { writeHtmlFiles } from './output'
import { loadSiteResources } from './templating'

const fse = require('fs-extra')

const outputDirectory = 'dist'

export async function buildSite() {
  require('dotenv').config()
  console.log('Building site')
  const resources = loadSiteResources()

  const articles = await loadAndPrepareArticles(resources.partials)

  fse.emptyDirSync(outputDirectory)
  fse.copySync('public', outputDirectory)

  await writeHtmlFiles(outputDirectory, resources, articles)
  console.log('Finished building site')
}
