import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import BulkEmailValidator from './BulkEmailValidator'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BulkEmailValidator />
    </>
  )
}

export default App
