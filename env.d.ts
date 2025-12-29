/// <reference types="vite/client" />
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_DISABLE_PAYSLIP: string // add other VITE_ variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
