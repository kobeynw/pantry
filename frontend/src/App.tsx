import { Routes, Route } from 'react-router'
import './App.css'
import Pantry from './pages/Pantry'
import NavBar from './components/NavBar'

function App() {
  return (
    <>
      <div className='pb-20'>
        <Routes>
          <Route path="/" element={<Pantry />} />
        </Routes>
      </div>

      <NavBar />
    </>
  )
}

export default App
