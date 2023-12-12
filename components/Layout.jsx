import Link from "next/link";
import Head from "next/head";

export default function Layout({children}) {
    return (
        <div className="flex flex-col items-center bg-darkBackground-900 min-h-screen">
            <Head>
                <title>Think Like a Super-GM</title>
                <meta property="og:type" content="website" />
                <meta property="og:title" content="HandCash Pay Example" />
                <meta property="og:description" content="Getting started with HandCash Pay + NextJS" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@" />
                <meta name="twitter:image" content="" />
                <meta name="twitter:title" content="Think Like a Super-GM" />
                <meta name="twitter:description" content="Getting started with HandCash Pay + NextJS" />
            </Head>
            <nav
                className="container flex grow-0 w-full justify-center items-center">
                <div className="p-4 flex flex-grow justify-between items-center ">
                    <Link href="/" passHref>
                        <h1 className="text-xl font-bold text-white/90 hover:text-white hover:cursor-pointer">Think Like a Super-GM</h1>
                    </Link>
                    <div className="flex gap-x-4">
                    <Link
                            className="hidden md:block flex items-center w-fit rounded-full py-1 pl-4 pr-5 gap-x-4 border border-transparent text-lg font-light hover:text-white text-white/70"
                            target="_blank"
                            rel="noreferrer"
                            href="https://www.qualitychess.co.uk/products/2/413/think_like_a_super-gm_by_michael_adams_and_philip_hurtado/">Buy the full Book
                        </Link>
                    </div>
                </div>
            </nav>
            <div className="grow flex border-t border-white/10 w-full">
                {children}
            </div>
            <footer
                className="w-full flex grow-0 p-6 border-t border-white/10 hidden md:block items-center justify-center">
                <p className="text-xs tracking-wider text-center">© Think like a SuperGM {new Date().getFullYear()}</p>
            </footer>
        </div>
    )
}
