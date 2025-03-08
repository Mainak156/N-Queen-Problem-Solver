"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ChevronLeft, ChevronRight, Play, Pause, SkipBack, SkipForward, RefreshCw, Crown } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Types
type BoardState = (boolean | null)[][]
type Solution = boolean[][]
type VisualizationStep = {
  board: BoardState
  row: number
  col: number
  action: "place" | "remove" | "check" | "invalid"
}

export default function NQueensVisualizer() {
  // Board configuration
  const [boardSize, setBoardSize] = useState(8)
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0)

  // Visualization state
  const [visualizationSteps, setVisualizationSteps] = useState<VisualizationStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [isVisualizing, setIsVisualizing] = useState(false)
  const [visualizationSpeed, setVisualizationSpeed] = useState(500) // ms between steps

  // Metrics
  const [recursiveCalls, setRecursiveCalls] = useState(0)
  const [backtrackingSteps, setBacktrackingSteps] = useState(0)

  // Animation timer
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Current board state for visualization
  const [currentBoard, setCurrentBoard] = useState<BoardState>([])

  // Initialize board
  useEffect(() => {
    resetBoard()
  }, [boardSize])

  // Handle visualization steps
  useEffect(() => {
    if (isVisualizing && currentStepIndex < visualizationSteps.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1)
      }, visualizationSpeed)
    } else if (currentStepIndex >= visualizationSteps.length - 1) {
      setIsVisualizing(false)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isVisualizing, currentStepIndex, visualizationSteps, visualizationSpeed])

  // Update board based on current step
  useEffect(() => {
    if (currentStepIndex >= 0 && currentStepIndex < visualizationSteps.length) {
      setCurrentBoard(visualizationSteps[currentStepIndex].board)
    }
  }, [currentStepIndex, visualizationSteps])

  // Reset the board to initial state
  const resetBoard = () => {
    const newBoard: BoardState = Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(null))
    setCurrentBoard(newBoard)
    setCurrentStepIndex(-1)
    setIsVisualizing(false)
    setVisualizationSteps([])
    setSolutions([])
    setRecursiveCalls(0)
    setBacktrackingSteps(0)
    setCurrentSolutionIndex(0)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }

  // Check if a queen can be placed at a specific position
  const isSafe = (board: BoardState, row: number, col: number): boolean => {
    // Check row
    for (let i = 0; i < col; i++) {
      if (board[row][i] === true) {
        return false
      }
    }

    // Check upper diagonal
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === true) {
        return false
      }
    }

    // Check lower diagonal
    for (let i = row, j = col; i < boardSize && j >= 0; i++, j--) {
      if (board[i][j] === true) {
        return false
      }
    }

    return true
  }

  // Solve N-Queens using backtracking
  const solveNQueens = () => {
    resetBoard()
    const steps: VisualizationStep[] = []
    const foundSolutions: Solution[] = []
    let calls = 0
    let backtracks = 0

    const solveUtil = (board: BoardState, col: number) => {
      calls++

      // Base case: If all queens are placed
      if (col >= boardSize) {
        // Deep copy the solution
        const solution = board.map((row) => [...row]) as Solution
        foundSolutions.push(solution)
        return true
      }

      // Try placing queen in each row of the current column
      for (let row = 0; row < boardSize; row++) {
        // Check if queen can be placed
        const checkBoard = board.map((r) => [...r])
        steps.push({
          board: checkBoard,
          row,
          col,
          action: "check",
        })

        if (isSafe(board, row, col)) {
          // Place the queen
          const newBoard = board.map((r) => [...r])
          newBoard[row][col] = true
          steps.push({
            board: newBoard,
            row,
            col,
            action: "place",
          })

          // Recursively place rest of the queens
          if (solveUtil(newBoard, col + 1)) {
            // For visualization, we want to continue and find all solutions
            // So we don't return true here
          }

          // Backtrack: remove the queen
          const backtrackBoard = board.map((r) => [...r])
          backtrackBoard[row][col] = false
          steps.push({
            board: backtrackBoard,
            row,
            col,
            action: "remove",
          })
          backtracks++
        } else {
          // Mark as invalid for visualization
          const invalidBoard = board.map((r) => [...r])
          invalidBoard[row][col] = false
          steps.push({
            board: invalidBoard,
            row,
            col,
            action: "invalid",
          })
        }
      }

      return false
    }

    // Start with an empty board
    const initialBoard: BoardState = Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(null))
    solveUtil(initialBoard, 0)

    setVisualizationSteps(steps)
    setSolutions(foundSolutions)
    setRecursiveCalls(calls)
    setBacktrackingSteps(backtracks)

    if (steps.length > 0) {
      setCurrentStepIndex(0)
    }
  }

  // Control functions
  const startVisualization = () => {
    if (visualizationSteps.length === 0) {
      solveNQueens()
    }
    setIsVisualizing(true)
  }

  const pauseVisualization = () => {
    setIsVisualizing(false)
  }

  const stepForward = () => {
    if (currentStepIndex < visualizationSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const stepBackward = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  const jumpToStart = () => {
    setCurrentStepIndex(0)
  }

  const jumpToEnd = () => {
    setCurrentStepIndex(visualizationSteps.length - 1)
  }

  const nextSolution = () => {
    if (solutions.length > 0 && currentSolutionIndex < solutions.length - 1) {
      setCurrentSolutionIndex((prev) => prev + 1)
      setCurrentBoard(solutions[currentSolutionIndex + 1])
      setIsVisualizing(false)
    }
  }

  const prevSolution = () => {
    if (solutions.length > 0 && currentSolutionIndex > 0) {
      setCurrentSolutionIndex((prev) => prev - 1)
      setCurrentBoard(solutions[currentSolutionIndex - 1])
      setIsVisualizing(false)
    }
  }

  // Get cell color based on position and state
  const getCellColor = (row: number, col: number, value: boolean | null) => {
    const isEven = (row + col) % 2 === 0

    if (value === true) {
      return "bg-green-500 dark:bg-green-600"
    } else if (value === false) {
      return isEven ? "bg-red-200 dark:bg-red-900" : "bg-red-300 dark:bg-red-800"
    }

    return isEven ? "bg-gray-200 dark:bg-gray-700" : "bg-gray-300 dark:bg-gray-600"
  }

  // Get current step info
  const getCurrentStepInfo = () => {
    if (currentStepIndex < 0 || !visualizationSteps[currentStepIndex]) {
      return "Ready to start"
    }

    const step = visualizationSteps[currentStepIndex]
    const { row, col, action } = step

    switch (action) {
      case "check":
        return `Checking if queen can be placed at row ${row + 1}, column ${col + 1}`
      case "place":
        return `Placing queen at row ${row + 1}, column ${col + 1}`
      case "remove":
        return `Removing queen from row ${row + 1}, column ${col + 1} (backtracking)`
      case "invalid":
        return `Invalid position at row ${row + 1}, column ${col + 1}`
      default:
        return ""
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Chessboard</CardTitle>
            <CardDescription>
              {solutions.length > 0
                ? `Solution ${currentSolutionIndex + 1} of ${solutions.length}`
                : "Visualize the algorithm placing queens"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div
                className="grid border border-gray-400 dark:border-gray-600 shadow-lg"
                style={{
                  gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
                  width: "min(100%, 600px)",
                  height: "min(100%, 600px)",
                }}
              >
                {currentBoard.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={cn(
                        "relative flex items-center justify-center transition-colors duration-300",
                        getCellColor(rowIndex, colIndex, cell),
                      )}
                      style={{ aspectRatio: "1/1" }}
                    >
                      {cell === true && (
                        <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
                          <Crown className="w-2/3 h-2/3 text-yellow-500 drop-shadow-md" />
                        </div>
                      )}
                    </div>
                  )),
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="w-full flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={jumpToStart}
                disabled={currentStepIndex <= 0 || isVisualizing}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={stepBackward}
                disabled={currentStepIndex <= 0 || isVisualizing}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {isVisualizing ? (
                <Button onClick={pauseVisualization}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button onClick={startVisualization}>
                  <Play className="h-4 w-4 mr-2" />
                  {visualizationSteps.length === 0 ? "Start" : "Continue"}
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={stepForward}
                disabled={currentStepIndex >= visualizationSteps.length - 1 || isVisualizing}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={jumpToEnd}
                disabled={currentStepIndex >= visualizationSteps.length - 1 || isVisualizing}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={resetBoard} disabled={isVisualizing}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {solutions.length > 0 && (
              <div className="w-full flex justify-center gap-2">
                <Button variant="secondary" onClick={prevSolution} disabled={currentSolutionIndex <= 0}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Solution
                </Button>
                <Button
                  variant="secondary"
                  onClick={nextSolution}
                  disabled={currentSolutionIndex >= solutions.length - 1}
                >
                  Next Solution
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Board Size (N): {boardSize}</label>
              <div className="flex items-center gap-4">
                <span className="text-sm">4</span>
                <Slider
                  value={[boardSize]}
                  min={4}
                  max={12}
                  step={1}
                  onValueChange={(value) => {
                    setBoardSize(value[0])
                  }}
                  disabled={isVisualizing}
                />
                <span className="text-sm">12</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Visualization Speed</label>
              <div className="flex items-center gap-4">
                <span className="text-sm">Fast</span>
                <Slider
                  value={[visualizationSpeed]}
                  min={50}
                  max={1000}
                  step={50}
                  onValueChange={(value) => {
                    setVisualizationSpeed(value[0])
                  }}
                  disabled={isVisualizing}
                />
                <span className="text-sm">Slow</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Algorithm Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Solutions Found:</span>
              <span className="font-medium">{solutions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Recursive Calls:</span>
              <span className="font-medium">{recursiveCalls}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Backtracking Steps:</span>
              <span className="font-medium">{backtrackingSteps}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Current Step:</span>
              <span className="font-medium">
                {currentStepIndex + 1} / {visualizationSteps.length}
              </span>
            </div>
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">{getCurrentStepInfo()}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

