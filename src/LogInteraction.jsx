import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addInteractionAsync, chatInteractionAsync } from './store/interactionSlice';
import { Search, Send, Calendar, Clock, ChevronDown, Mic, Sparkles, Plus } from 'lucide-react';
import './LogInteraction.css';

const LogInteraction = () => {
  const dispatch = useDispatch();

  // Form State
  const [formData, setFormData] = useState({
    hcp_name: '',
    interaction_type: 'Meeting',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    attendees: '',
    notes: '',
    samples_distributed: '',
    sentiment: 'Neutral',
    outcomes: '',
    follow_up_actions: ''
  });

  // Chat State
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Log interaction details here (e.g., "Met Dr. Smith, discussed Product X efficacy, positive sentiment, shared brochure") or ask for help.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: chatInput };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const result = await dispatch(chatInteractionAsync({
        messages: [{ role: 'user', content: chatInput }],
      })).unwrap();

      const botMsg = { id: Date.now() + 1, sender: 'bot', text: result.agent_reply };
      setMessages((prev) => [...prev, botMsg]);
      
      // Auto-fill form fields from AI response
      if (result.hcp_name) setFormData(prev => ({...prev, hcp_name: result.hcp_name}));
      if (result.notes) setFormData(prev => ({...prev, notes: result.notes}));
      if (result.sentiment) setFormData(prev => ({...prev, sentiment: result.sentiment}));
      if (result.interaction_type) setFormData(prev => ({...prev, interaction_type: result.interaction_type}));
      if (result.outcomes) setFormData(prev => ({...prev, outcomes: result.outcomes}));
      if (result.follow_up_actions) setFormData(prev => ({...prev, follow_up_actions: result.follow_up_actions}));
    } catch (err) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Connection issue. Please ensure the backend server is running.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = async () => {
    try {
      await dispatch(addInteractionAsync(formData)).unwrap();
      alert('Interaction saved successfully!');
    } catch (err) {
      alert('Failed to save: ' + err);
    }
  };

  return (
    <div className="app-container">
      <div className="split-layout">
        {/* Left Side: Structured Form */}
        <div className="form-panel">
          <div className="form-scroll-area">
            <h1 className="panel-title">Log HCP Interaction</h1>
            
            <div className="section-header">Interaction Details</div>
            
            <div className="form-row">
              <div className="form-group flex-1">
                <label>HCP Name</label>
                <div className="input-with-icon">
                  <input 
                    type="text" 
                    name="hcp_name" 
                    value={formData.hcp_name} 
                    onChange={handleFormChange} 
                    placeholder="Search or select HCP..."
                  />
                </div>
              </div>
              <div className="form-group flex-1">
                <label>Interaction Type</label>
                <div className="select-wrapper">
                  <select name="interaction_type" value={formData.interaction_type} onChange={handleFormChange}>
                    <option value="Meeting">Meeting</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="Email">Email</option>
                    <option value="Conference">Conference</option>
                    <option value="Virtual">Virtual Meeting</option>
                  </select>
                  <ChevronDown size={16} className="select-icon" />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Date</label>
                <div className="input-with-icon">
                  <input type="date" name="date" value={formData.date} onChange={handleFormChange} />
                  <Calendar size={16} className="input-icon" />
                </div>
              </div>
              <div className="form-group flex-1">
                <label>Time</label>
                <div className="input-with-icon">
                  <input type="time" name="time" value={formData.time} onChange={handleFormChange} />
                  <Clock size={16} className="input-icon" />
                </div>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Attendees</label>
              <input 
                type="text" 
                name="attendees" 
                value={formData.attendees} 
                onChange={handleFormChange} 
                placeholder="Enter names or search..."
              />
            </div>

            <div className="form-group full-width">
              <label>Topics Discussed</label>
              <div className="textarea-wrapper">
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleFormChange} 
                  placeholder="Enter key discussion points..."
                  rows="3"
                ></textarea>
                <Mic size={16} className="mic-icon" />
              </div>
              <button className="voice-note-btn">
                <Sparkles size={14} /> Summarize from Voice Note (Requires Consent)
              </button>
            </div>

            <div className="materials-section">
              <div className="section-header">Materials Shared / Samples Distributed</div>
              <div className="material-row">
                <label>Materials Shared</label>
                <button className="action-btn"><Search size={14} /> Search/Add</button>
              </div>
              <div className="empty-placeholder">No materials added.</div>
              
              <div className="material-row" style={{ marginTop: '16px' }}>
                <label>Samples Distributed</label>
                <button className="action-btn"><Plus size={14} /> Add Sample</button>
              </div>
              <div className="empty-placeholder">No samples added.</div>
            </div>

            <div className="sentiment-section">
              <div className="section-header">Observed/Inferred HCP Sentiment</div>
              <div className="sentiment-options">
                {['Positive', 'Neutral', 'Negative'].map(opt => (
                  <label key={opt} className="radio-label">
                    <input 
                      type="radio" 
                      name="sentiment" 
                      value={opt} 
                      checked={formData.sentiment === opt}
                      onChange={handleFormChange}
                    />
                    <span className="radio-text">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group full-width">
              <label>Outcomes</label>
              <textarea 
                name="outcomes" 
                value={formData.outcomes} 
                onChange={handleFormChange} 
                placeholder="Key outcomes or agreements..."
                rows="2"
              ></textarea>
            </div>

            <div className="form-group full-width">
              <label>Follow-up Actions</label>
              <textarea 
                name="follow_up_actions" 
                value={formData.follow_up_actions} 
                onChange={handleFormChange} 
                placeholder="Enter next steps or tasks..."
                rows="2"
              ></textarea>
            </div>

            <div className="ai-suggestions">
              <div className="suggestion-title">AI Suggested Follow-ups:</div>
              <ul>
                <li>+ Schedule follow-up meeting in 2 weeks</li>
                <li>+ Send relevant clinical study PDF</li>
                <li>+ Add HCP to advisory board invite list</li>
              </ul>
            </div>

            <button className="submit-btn" onClick={handleFormSubmit}>
              Save Interaction
            </button>
          </div>
        </div>

        {/* Right Side: AI Assistant Chat */}
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-title">
              <span className="bot-icon">🌐</span> AI Assistant
            </div>
            <div className="chat-subtitle">Log interaction via chat</div>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-content">{msg.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
                <div className="message-content typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div className="chat-footer">
            <form className="chat-input-wrapper" onSubmit={handleChatSubmit}>
              <textarea 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                placeholder="Describe Interaction..."
                rows="1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSubmit(e);
                  }
                }}
              ></textarea>
              <button type="submit" className="log-btn-small">
                <Send size={14} /> Log
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogInteraction;
