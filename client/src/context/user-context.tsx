"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

// Types
interface User {
  _id: string
  username: string
  email: string
  profilePicture?: string
}

interface UserState {
  currentUser: User | null
  loading: boolean
  error: any
}

type UserAction =
  | { type: 'SIGN_IN_START' }
  | { type: 'SIGN_IN_SUCCESS'; payload: User }
  | { type: 'SIGN_IN_FAILURE'; payload: any }
  | { type: 'UPDATE_USER_START' }
  | { type: 'UPDATE_USER_SUCCESS'; payload: User }
  | { type: 'UPDATE_USER_FAILURE'; payload: any }
  | { type: 'DELETE_USER_START' }
  | { type: 'DELETE_USER_SUCCESS' }
  | { type: 'DELETE_USER_FAILURE'; payload: any }
  | { type: 'SIGN_OUT' }

interface UserContextType {
  state: UserState
  signInStart: () => void
  signInSuccess: (user: User) => void
  signInFailure: (error: any) => void
  updateUserStart: () => void
  updateUserSuccess: (user: User) => void
  updateUserFailure: (error: any) => void
  deleteUserStart: () => void
  deleteUserSuccess: () => void
  deleteUserFailure: (error: any) => void
  signOut: () => void
}

// Initial state
const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: false,
}

// Reducer function (equivalent to Redux slice)
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SIGN_IN_START':
      return {
        ...state,
        loading: true,
      }
    case 'SIGN_IN_SUCCESS':
      return {
        ...state,
        currentUser: action.payload,
        loading: false,
        error: false,
      }
    case 'SIGN_IN_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    case 'UPDATE_USER_START':
      return {
        ...state,
        loading: true,
      }
    case 'UPDATE_USER_SUCCESS':
      return {
        ...state,
        currentUser: action.payload,
        loading: false,
        error: false,
      }
    case 'UPDATE_USER_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    case 'DELETE_USER_START':
      return {
        ...state,
        loading: true,
      }
    case 'DELETE_USER_SUCCESS':
      return {
        ...state,
        currentUser: null,
        loading: false,
        error: false,
      }
    case 'DELETE_USER_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    case 'SIGN_OUT':
      return {
        ...state,
        currentUser: null,
        loading: false,
        error: false,
      }
    default:
      return state
  }
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined)

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  // Load initial state from localStorage
  const loadInitialState = (): UserState => {
    if (typeof window !== 'undefined') {
      try {
        const persistedState = localStorage.getItem('userState')
        if (persistedState) {
          const parsed = JSON.parse(persistedState)
          return {
            currentUser: parsed.currentUser || null,
            loading: false,
            error: false,
          }
        }
      } catch (error) {
        console.error('Error loading persisted state:', error)
      }
    }
    return initialState
  }

  const [state, dispatch] = useReducer(userReducer, initialState, loadInitialState)

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('userState', JSON.stringify({
          currentUser: state.currentUser,
        }))
      } catch (error) {
        console.error('Error persisting state:', error)
      }
    }
  }, [state.currentUser])

  // Action creators (equivalent to Redux actions)
  const signInStart = () => dispatch({ type: 'SIGN_IN_START' })
  const signInSuccess = (user: User) => dispatch({ type: 'SIGN_IN_SUCCESS', payload: user })
  const signInFailure = (error: any) => dispatch({ type: 'SIGN_IN_FAILURE', payload: error })
  
  const updateUserStart = () => dispatch({ type: 'UPDATE_USER_START' })
  const updateUserSuccess = (user: User) => dispatch({ type: 'UPDATE_USER_SUCCESS', payload: user })
  const updateUserFailure = (error: any) => dispatch({ type: 'UPDATE_USER_FAILURE', payload: error })
  
  const deleteUserStart = () => dispatch({ type: 'DELETE_USER_START' })
  const deleteUserSuccess = () => dispatch({ type: 'DELETE_USER_SUCCESS' })
  const deleteUserFailure = (error: any) => dispatch({ type: 'DELETE_USER_FAILURE', payload: error })
  
  const signOut = () => dispatch({ type: 'SIGN_OUT' })

  const value: UserContextType = {
    state,
    signInStart,
    signInSuccess,
    signInFailure,
    updateUserStart,
    updateUserSuccess,
    updateUserFailure,
    deleteUserStart,
    deleteUserSuccess,
    deleteUserFailure,
    signOut,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

// Custom hook to use the context
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

// Selector hook for compatibility with existing code
export function useSelector<T>(selector: (state: { user: UserState }) => T): T {
  const { state } = useUser()
  return selector({ user: state })
}

// Dispatch hook for compatibility with existing code
export function useDispatch() {
  const {
    signInStart,
    signInSuccess,
    signInFailure,
    updateUserStart,
    updateUserSuccess,
    updateUserFailure,
    deleteUserStart,
    deleteUserSuccess,
    deleteUserFailure,
    signOut,
  } = useUser()

  return {
    signInStart,
    signInSuccess,
    signInFailure,
    updateUserStart,
    updateUserSuccess,
    updateUserFailure,
    deleteUserStart,
    deleteUserSuccess,
    deleteUserFailure,
    signOut,
  }
}
