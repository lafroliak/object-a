/// <reference types="next" />
/// <reference types="next/types/global" />

declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '@crystallize/content-transformer' {
  export default any
}

declare module '@crystallize/content-transformer/toHTML' {
  export default any
}

declare module '@crystallize/content-transformer/react' {
  export default any
}
