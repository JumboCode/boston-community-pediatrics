export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-gradient-to-br from-blue-400 to-purple-600 text-white">
      {/* Top spacer */}
      <div></div>

      {/* Main content */}
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold animate-bounce">
          Welcome to BCP!
        </h1>
        <p className="text-xl text-white/90">
          Your go-to platform for managing volunteers, events, and more.
        </p>
        <button className="bg-white text-blue-600 font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition-all">
          Get Started
        </button>
      </div>

      {/* Bottom spacer */}
      <div></div>
    </div>
  );
}
