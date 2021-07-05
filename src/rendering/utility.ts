import * as fs from 'fs'
import * as path from "path"

export function flatten<T>(input: T[][]): T[] {
  return [].concat.apply([], input as any)
}

export function getFilesRecursive(fileOrDirectory: string): string[] {
  if (!fs.lstatSync(fileOrDirectory).isDirectory())
    return [fileOrDirectory]

  const hierarchy = fs.readdirSync(fileOrDirectory).map(f =>
    getFilesRecursive(fileOrDirectory + '/' + f)
  )

  return flatten(hierarchy)
}

export function getFileNameWithoutExtension(file: string): string | undefined {
  const match = path.basename(file).match(/^(.*)\.[^.]+$/)
  return match ? match[1] : undefined
}
