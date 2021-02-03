import Document, {
  Head,
  // DocumentContext,
  Html,
  Main,
  NextScript,
} from 'next/document'

class MyDocument extends Document {
  // Only uncomment if you need to customize this behaviour
  // static async getInitialProps(ctx: DocumentContext) {
  //   const initialProps = await Document.getInitialProps(ctx)

  //   return initialProps
  // }

  render() {
    return (
      <Html>
        <Head>
          <link
            rel="preload"
            href="/fonts/JetBrainsMono-VariableFont_wght.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/JetBrainsMono-Italic-VariableFont_wght.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link rel="shortcut icon" href="/favicon.png" type="image/png" />
          <link href="/fonts/JetBrainsMono.css" rel="stylesheet" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
