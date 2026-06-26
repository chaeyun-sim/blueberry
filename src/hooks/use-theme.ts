import { useContext } from 'react'
import { ThemeContext } from '@/provider/ThemeContext'

export const useTheme = () => {
  return useContext(ThemeContext)
}
