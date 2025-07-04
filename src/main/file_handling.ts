import fs from 'node:fs/promises'
import { Document, FEntry, FFile, FType } from '../shared/types/ipc'
import { join, resolve } from 'node:path'

export function flattenFiles (files: FEntry[]): FFile[] {
  return files.flatMap(f => f.type === FType.FOLDER ? flattenFiles(f.content) : f)
}

export async function getDirContent(dirPath: string): Promise<FEntry[]> {
  const dirContent = await fs.readdir(dirPath)
  return Promise.all(dirContent.map(fName => getFProps(dirPath, fName)))
}

async function getFProps(dirPath: string, fName: string): Promise<FEntry> {
  const fPath = join(dirPath, fName)
  const fProps = await fs.stat(fPath)

  const f: FEntry = {
    id: fProps.ino.toString(),
    name: fName,
    path: fPath,
    type: FType.FILE,
    createdAt: fProps.birthtime,
    updatedAt: fProps.mtime,
  }

  if (fProps.isDirectory()) {
    Object.assign(f, {
      type: FType.FOLDER,
      content: await getDirContent(fPath),
    })
  }

  return f
}

export async function getFileContent(path: string): Promise<string> {
  const fBuff = await fs.readFile(path);
  return fBuff.toString()
}

export async function createDocument(path: string, name: string): Promise<FFile> {
  const fName = `${name}.md`;
  const fPath = join(path, fName);
  
  await fs.writeFile(fPath, `# ${name}\n`)
  
  const fProps = await fs.stat(fPath)

  return {
    id: fProps.ino.toString(),
    name: fName,
    path: fPath,
    type: FType.FILE,
    createdAt: fProps.birthtime,
    updatedAt: fProps.mtime,
  }
}

export async function updateDocument(path: string, name: string, content: string): Promise<FFile> {
  const dir = resolve(path, '..')
  const oldName = path.split(/[\\/]/).pop() || '';
  const newName = name.endsWith('.md') ? name : `${name}.md`;
  const newPath = join(dir, newName);

  if (oldName !== newName) {
    await fs.rename(path, newPath);
  }

  await fs.writeFile(newPath, content);

  const fProps = await fs.stat(newPath);

  return {
    id: fProps.ino.toString(),
    name: newName,
    path: newPath,
    type: FType.FILE,
    createdAt: fProps.birthtime,
    updatedAt: fProps.mtime,
  };
}

export async function deleteDocument(path: string): Promise<void> {
  await fs.unlink(path);
}