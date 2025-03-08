import NQueensVisualizer from "@/components/n-queens-visualizer"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
          N-Queens Problem Visualizer
        </h1>
        <p className="text-center mb-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Visualize the backtracking algorithm solving the N-Queens problem, where N queens must be placed on an N×N
          chessboard so that no two queens threaten each other.
        </p>
        <NQueensVisualizer />
      </div>
    </main>
  )
}

