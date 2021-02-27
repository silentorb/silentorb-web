import * as fs from 'fs'

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
