import { useEffect } from 'react'
import Navbar from './components/Navbar'
import SiteFooter from './components/SiteFooter'
import { useRoute } from './router'
import HomePage from './pages/Home'
import TrainingPage from './pages/Training'
import SchedulePage from './pages/Schedule'
import StatsPage from './pages/Stats'
import AboutPage from './pages/About'
import ContactPage from './pages/Contact'
import NotFoundPage from './pages/NotFound'
import './index.css'

const pages: Record<string, { title: string; Component: () => React.JSX.Element }> = {
  '/': { title: 'Nolan Sloan · Goalie Coach', Component: HomePage },
  '/training': { title: 'Training · Nolan Sloan', Component: TrainingPage },
  '/schedule': { title: 'Schedule · Nolan Sloan', Component: SchedulePage },
  '/stats': { title: 'Stats · Nolan Sloan', Component: StatsPage },
  '/about': { title: 'About · Nolan Sloan', Component: AboutPage },
  '/contact': { title: 'Contact · Nolan Sloan', Component: ContactPage },
}

function App() {
  const path = useRoute()
  const page = pages[path] ?? { title: 'Not found · Nolan Sloan', Component: NotFoundPage }

  useEffect(() => {
    document.title = page.title
    window.scrollTo(0, 0)
  }, [path, page.title])

  const { Component } = page
  return (
    <div className="w-full min-h-screen">
      <Navbar />
      <Component key={path} />
      <SiteFooter />
    </div>
  )
}

export default App
