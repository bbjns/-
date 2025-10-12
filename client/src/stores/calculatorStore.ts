import { create } from 'zustand'

export interface CalculationInput {
  calculationType: 'basic' | 'pyramid' | 'compound'
  totalFunds: number
  leverage: number
  positionType: 'long' | 'short'
  entryPrice: number
  riskPercentage: number
  feeRate: number
  stopLossSettings: {
    type: 'price' | 'ratio'
    stopLossPrice?: number
    profitLossRatio?: number
  }
  pyramidSettings?: {
    profitTriggerPercentage: number
    pyramidPercentage: number
  }
  compoundSettings?: {
    rounds: number
    profitPercentage: number
  }
}

export interface BasicResult {
  stopLossPrice: number
  takeProfitPrice: number
  positionSize: number
  marginRequired: number
  fees: number
  profitLoss: number
  riskPercentage: number
  nominalPositionValue: number
}

export interface PyramidResult {
  triggerPrice: number
  newAveragePrice: number
  additionalPositionValue: number
  additionalMargin: number
  newStopLossPrice: number
  newTakeProfitPrice: number
  newRiskPercentage: number
  totalPositionValue: number
}

export interface CompoundRound {
  round: number
  totalFunds: number
  profit: number
  newPositionSize: number
}

export interface CalculationResult {
  basic: BasicResult
  pyramid?: PyramidResult
  compound?: CompoundRound[]
}

interface CalculatorState {
  input: CalculationInput
  result: CalculationResult | null
  isLoading: boolean
  error: string | null
  history: Array<{
    id: string
    input: CalculationInput
    result: CalculationResult
    createdAt: string
  }>
  setInput: (input: Partial<CalculationInput>) => void
  calculate: () => Promise<void>
  clearResult: () => void
  setError: (error: string | null) => void
  loadHistory: () => Promise<void>
  deleteHistoryItem: (id: string) => Promise<void>
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  input: {
    calculationType: 'basic',
    totalFunds: 10000,
    leverage: 10,
    positionType: 'long',
    entryPrice: 100,
    riskPercentage: 2,
    feeRate: 0.001,
    stopLossSettings: {
      type: 'ratio',
      profitLossRatio: 2
    },
    pyramidSettings: {
      profitTriggerPercentage: 10,
      pyramidPercentage: 50
    },
    compoundSettings: {
      rounds: 5,
      profitPercentage: 10
    }
  },
  result: null,
  isLoading: false,
  error: null,
  history: [],

  setInput: (input) => {
    set((state) => ({
      input: { ...state.input, ...input }
    }))
  },

  calculate: async () => {
    const { input } = get()
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`${API_BASE_URL}/calculator/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')!).state.token : ''}`
        },
        body: JSON.stringify(input)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Calculation failed')
      }

      const data = await response.json()
      set({ 
        result: data.results, 
        isLoading: false 
      })
    } catch (error: any) {
      set({ 
        error: error.message, 
        isLoading: false 
      })
    }
  },

  clearResult: () => {
    set({ result: null, error: null })
  },

  setError: (error) => {
    set({ error })
  },

  loadHistory: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/calculator/history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')!).state.token : ''}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load history')
      }

      const data = await response.json()
      set({ history: data.calculations })
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  },

  deleteHistoryItem: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/calculator/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')!).state.token : ''}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete history item')
      }

      set((state) => ({
        history: state.history.filter(item => item.id !== id)
      }))
    } catch (error) {
      console.error('Failed to delete history item:', error)
    }
  }
}))