import { ConnectButton } from './components/ConnectButton'
import './App.css'

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-8">Stacks Wallet Frontend</h1>
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center gap-4">
        <p className="text-lg text-gray-700">Connect your wallet to get started</p>
        <ConnectButton />
      </div>
    </div>
  )
}

export default App
