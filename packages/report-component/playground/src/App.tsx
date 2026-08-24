import { MyButton } from '../../src'
// main.ts (先 import 上面那个文件，确保 MonacoEnvironment 提前挂载)
import './monaco-workers'
import * as monaco from 'monaco-editor'
import {useEffect} from "react";


export function App() {
  useEffect(() => {

    if (document.getElementById('editor')) {
      const container = document.getElementById('editor')!
      monaco.editor.create(container, {
        value: 'console.log("hello world")',
        language: 'javascript',
        theme: 'vs-dark',
      })
    }
  }, []);
  return (
    <>
      <div id="editor" style={{ height: '500px',width:'750px' }}></div>
      <MyButton type="primary" />
    </>
  )
}
