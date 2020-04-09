import { ReactNode } from 'react';
import Head from 'next/head';

interface PageProps {
  children: ReactNode;
}

export default function Page({ children }: PageProps) {
  return (
    <>
      <Head>
        <title>US COVID-19 Map</title>
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap"
          rel="stylesheet"
        ></link>
      </Head>
      {children}
      <style jsx global>{`
        html,
        body {
          width: 100%;
          height: 100%;
        }

        body {
          margin: 0;
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        strong {
          font-size: 2rem;
        }

        #__next {
          height: 100%;
        }
      `}</style>
    </>
  );
}
