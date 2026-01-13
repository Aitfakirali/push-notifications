import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>My PWA App</title>
        <meta
          name="description"
          content="A Progressive Web App built with Next.js 16"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4 text-white">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center text-gray-800">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-3xl font-bold mb-2">My PWA App</h1>
          <p className="text-gray-600 mb-6">
            A Progressive Web App built with Next.js 16
          </p>

          <div className="space-y-4">
            <p className="text-lg font-semibold">
              Install this app to your home screen!
            </p>
            <p className="text-sm text-gray-700">
              Look for the &quot;Add to Home Screen&quot; or &quot;Install
              App&quot; option in your browser&apos;s menu.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-left">
            <h2 className="font-semibold text-gray-800 mb-2">Features:</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">✨</span>
                <span>Works offline</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📱</span>
                <span>Installable on any device</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">⚡</span>
                <span>Fast and reliable</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
