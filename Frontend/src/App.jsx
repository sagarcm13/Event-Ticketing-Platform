/* eslint-disable no-unused-vars */
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import CreateEvent from "./pages/CreateEvents"
import BuyTickets from "./pages/BuyTickets"
import CancelTickets from "./pages/CancelTickets"

function App() {

  return (
    <>
      <Router>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
              <Routes>
                <Route index element={<Home />} />
                <Route path='/' element={<Home />} />
                <Route path='/Home' element={<Home />} />
                <Route path='/buyTickets' element={<BuyTickets />} />
                <Route path='/cancelTickets' element={<CancelTickets />} />
                <Route path='/create-event' element={<CreateEvent />} />
              </Routes>
            </main>
          </div>
        </Router>
    </>
  )
}

export default App
