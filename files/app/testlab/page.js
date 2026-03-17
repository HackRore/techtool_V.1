'use client'
import { useState } from 'react'
import Sidebar from '../../components/Sidebar'

export default function TestLab() {
  const [currentTest, setCurrentTest] = useState(null)
  const [testResults, setTestResults] = useState({})
  const [runAll, setRunAll] = useState(false)

  const tests = [
    { id: 'keyboard', name: 'Keyboard Test', status: testResults.keyboard ? testResults.keyboard.passed ? 'pass' : 'fail' : 'pending' },
    { id: 'screen', name: 'Screen Test', status: testResults.screen ? testResults.screen.passed ? 'pass' : 'fail' : 'pending' },
    { id: 'webcam', name: 'Webcam Test', status: testResults.webcam ? testResults.webcam.passed ? 'pass' : 'fail' : 'pending' },
    { id: 'mic', name: 'Microphone Test', status: testResults.mic ? testResults.mic.passed ? 'pass' : 'fail' : 'pending' },
    { id: 'speaker', name: 'Speaker Test', status: testResults.speaker ? testResults.speaker.passed ? 'pass' : 'fail' : 'pending' },
    { id: 'mouse', name: 'Mouse Test', status: testResults.mouse ? testResults.mouse.passed ? 'pass' : 'fail' : 'pending' },
    { id: 'touch', name: 'Touchscreen Test', status: testResults.touch ? testResults.touch.passed ? 'pass' : 'fail' : 'pending' },
  ]

  const runAllTests = () => {
    setRunAll(true)
    setCurrentTest('keyboard')
  }

  const completeTest = (id, result) => {
    setTestResults(prev => ({ ...prev, [id]: result }))
    const nextIndex = tests.findIndex(t => t.id === id) + 1
    if (nextIndex < tests.length && runAll) {
      setTimeout(() => setCurrentTest(tests[nextIndex].id), 2000)
    } else {
      setRunAll(false)
      setCurrentTest(null)
    }
  }

  const TestComponent = ({ id, onComplete }) => {
    // Simulated test logic
    useEffect(() => {
      const timer = setTimeout(() => {
        onComplete(id, { passed: Math.random() > 0.2, time: Date.now() })
      }, 3000)
      return () => clearTimeout(timer)
    }, [id])

    return <div>Test {id} running...</div>
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>TestLab</h1>
          <p>Run hardware diagnostics in browser</p>
        </div>
        {!currentTest && (
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <button onClick={runAllTests} className="primary-btn" style={{ fontSize: 18, padding: '16px 32px' }}>
                🚀 Run All Tests Sequence
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {tests.map(test => (
                <div key={test.id} className={`test-card ${test.status}`} style={{ height: 200 }}>
                  <div>{test.name}</div>
                  <div className={`badge ${test.status}`}>{test.status.toUpperCase()}</div>
                  <button onClick={() => setCurrentTest(test.id)} disabled={currentTest}>Run Test</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {currentTest && (
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
            <TestComponent id={currentTest} onComplete={completeTest} />
            <button onClick={() => setCurrentTest(null)}>Stop</button>
          </div>
        )}
      </main>
    </div>
  )
}
