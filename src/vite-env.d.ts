/// <reference types="vite/client" />

/** File System Access API (minimal for docs/tickets read-only) */
interface FileSystemDirectoryHandle {
  kind: 'directory'
  getDirectoryHandle(name: string): Promise<FileSystemDirectoryHandle>
  getFileHandle(name: string): Promise<FileSystemFileHandle>
  entries(): AsyncIterableIterator<[string, FileSystemDirectoryHandle | FileSystemFileHandle]>
}
interface FileSystemFileHandle {
  kind: 'file'
  getFile(): Promise<File>
}
interface Window {
  showDirectoryPicker?(options?: { id?: string; mode?: 'read' | 'readwrite'; startIn?: string }): Promise<FileSystemDirectoryHandle>
}
