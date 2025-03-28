import React, { useState } from 'react';
import './App.css';
import AgeSelector from './features/selection/AgeSelector';
import GradeSelector from './features/selection/GradeSelector';
import SubjectSelector from './features/selection/SubjectSelector';
import LevelSelector from './features/selection/LevelSelector';
import Chat from './features/chat/Chat';
import ChatIconComponent from './features/chat/ChatIcon';

function App() {
  const [searchInput, setSearchInput] = useState('');
  const [messages, setMessages] = useState([{ sender: 'Agent', text: 'Welcome! Please select your age.' }]);
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [stepInput, setStepInput] = useState('');
  const [showChat, setShowChat] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setMessages((prevMessages) => [...prevMessages, { sender: 'Student', text: searchInput }]);
      setSearchInput('');
    }
  };

  const handleSelect = (key, value) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
    setMessages((prevMessages) => [...prevMessages, { sender: 'Student', text: `${key}: ${value}` }]);
    setStep((prevStep) => prevStep + 1);
    setStepInput(''); // Clear the step input after each selection

    // Add agent's prompt for the next step
    switch (step + 1) {
      case 1:
        setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Please select your grade.' }]);
        break;
      case 2:
        setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Please select the subject you are interested in.' }]);
        break;
      case 3:
        setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Please select your level.' }]);
        break;
      case 4:
        setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Thank you! Your selections have been recorded.' }]);
        break;
      default:
        break;
    }
  };

  const handleKeyPress = (e, key) => {
    if (e.key === 'Enter') {
      handleSelect(key, e.target.value);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="input-container">
            <label>Age: </label>
            <input
              type="number"
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'age')}
              placeholder="Enter your age..."
            />
          </div>
        );
      case 1:
        return (
          <div className="input-container">
            <label>Grade: </label>
            <input
              type="text"
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'grade')}
              placeholder="Enter your grade..."
            />
          </div>
        );
      case 2:
        return <SubjectSelector onSelect={handleSelect} />;
      case 3:
        return <LevelSelector onSelect={handleSelect} />;
      case 4:
        return null; // No additional message here
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <div className="chat-container">
        <Chat messages={messages} />
        {renderStep()}
      </div>
      {showChat && (
        <form onSubmit={handleSubmit} className="chat-form">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Type your query here..."
          />
          <button type="submit">Send</button>
        </form>
      )}
      <ChatIconComponent onClick={() => setShowChat(!showChat)} />
    </div>
  );
}

export default App;