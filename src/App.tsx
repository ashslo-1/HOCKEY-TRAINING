import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import './index.css'

function App() {
  return (
    <div className="w-full min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
    </div>
  )
}

export default App
