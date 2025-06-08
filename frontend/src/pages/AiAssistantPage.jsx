import React from 'react';
import { useLocation } from 'react-router-dom';
import MasterLayout from '../components/masterLayout';
import { Icon } from '@iconify/react';
import { notify, NotificationType } from '../components/NotificationService';
import { useState, useRef, useEffect } from 'react';

// Lista de preguntas sugeridas por categoría
const SUGGESTED_QUESTIONS = {
  pedidos: [
    "¿Cuál fue el último pedido?",
    "Muestra los pedidos pendientes",
    "¿Cuántos pedidos hay en total?",
    "¿Cuál es el pedido con el monto más alto?"
  ],
  inventario: [
    "¿Cuántos productos tenemos en inventario?",
    "¿Qué productos están bajos de stock?",
    "¿Cuál es el producto con mayor inventario?"
  ],
  proveedores: [
    "¿Cuáles son nuestros proveedores?",
    "¿Cuál es el proveedor con más pedidos?"
  ],
  articulos: [
    "¿Cuáles son los artículos más caros?",
    "¿Cuál es el precio promedio de los artículos?"
  ]
};

const AiAssistantPage = () => {
  const location = useLocation();
  const role = location.state?.role || localStorage.getItem('userRole') || 'admin';
  
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'assistant', text: 'Hola, soy el asistente de IA de Sapitos. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Función para agregar un mensaje al chat
  const addMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  // Función para desplazar el chat hacia abajo cuando hay nuevos mensajes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Función para enfocar el input cuando la página carga
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Función para seleccionar una pregunta sugerida
  const handleSuggestedQuestion = (q) => {
    setQuestion(q);
    setShowSuggestions(false);
    // No enviamos automáticamente para que el usuario pueda revisar
  };

  // Función para manejar el envío de la pregunta
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    // Agregar la pregunta del usuario al chat
    addMessage({ type: 'user', text: question });
    
    // Limpiar el input y mostrar el estado de carga
    setQuestion('');
    setIsLoading(true);
    setShowSuggestions(false);
    
    try {
      console.log("Enviando pregunta al asistente:", question);
      
      // Enviar la pregunta al backend usando fetch
      const response = await fetch('http://localhost:5000/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error(`Error HTTP: ${response.status} - ${response.statusText}`);
        throw new Error(`Error de servidor: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Respuesta recibida:", data);
      
      // Agregar la respuesta del asistente al chat
      if (data && data.success) {
        addMessage({ type: 'assistant', text: data.answer });
        notify("Respuesta recibida del asistente", NotificationType.SUCCESS);
      } else {
        addMessage({ 
          type: 'assistant', 
          text: `Lo siento, no pude procesar tu pregunta. Error: ${data.message || 'Desconocido'}` 
        });
        notify("Error al procesar la consulta: " + (data.message || 'Desconocido'), NotificationType.ERROR);
      }
    } catch (error) {
      console.error('Error al consultar al asistente:', error);
      addMessage({ 
        type: 'assistant', 
        text: `Error: ${error.message || 'Ocurrió un error al procesar tu pregunta. Por favor, verifica la conexión del servidor.'}` 
      });
      notify("Error de comunicación con el asistente", NotificationType.ERROR);
    } finally {
      setIsLoading(false);
      // Mostrar nuevamente sugerencias después de recibir respuesta
      setTimeout(() => setShowSuggestions(true), 1000);
    }
  };

  return (
    <MasterLayout role={role}>
      <div className="card h-100 p-0 radius-12">
        <div className="card-header d-flex align-items-center py-16 px-24 bg-primary text-white">
          <div className="d-flex align-items-center">
            <Icon icon="simple-icons:openai" width="24" height="24" className="me-2" />
            <h5 className="mb-0">Asistente IA</h5>
          </div>
        </div>
        
        <div className="card-body p-0 d-flex flex-column h-100">
          {/* Chat container */}
          <div 
            className="flex-grow-1 p-3 overflow-auto bg-light pb-5"
            ref={chatContainerRef}
          >
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.type === 'user' ? 'text-end' : ''}`}>
                <div className={`d-inline-flex ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`} style={{ maxWidth: '80%' }}>
                  {message.type === 'assistant' && (
                    <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2 assistant-avatar">
                      <Icon icon="simple-icons:openai" width="16" height="16" className="text-white" />
                    </div>
                  )}
                  <div className={`p-3 rounded shadow-sm ${message.type === 'user' ? 'bg-primary text-white rounded-chat-user' : 'bg-white text-dark rounded-chat-assistant'}`}>
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="mb-4">
                <div className="d-inline-flex flex-row" style={{ maxWidth: '80%' }}>
                  <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2 assistant-avatar">
                    <Icon icon="simple-icons:openai" width="16" height="16" className="text-white" />
                  </div>
                  <div className="p-3 rounded shadow-sm bg-white">
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Mostrar sugerencias después de la última respuesta */}
            {showSuggestions && !isLoading && messages.length > 0 && messages[messages.length - 1].type === 'assistant' && (
              <div className="mt-4 mb-2 ms-4">
                <div className="text-muted mb-2 small">Puedes preguntarme sobre:</div>
                
                <div className="mb-3">
                  <h6 className="text-muted small mb-2">Pedidos:</h6>
                  <div>
                    {SUGGESTED_QUESTIONS.pedidos.map((q, i) => (
                      <span 
                        key={`pedido-${i}`} 
                        className="badge bg-light text-dark border border-light-subtle rounded-pill me-2 mb-2 px-3 py-2 suggestion-badge"
                        onClick={() => handleSuggestedQuestion(q)}
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <h6 className="text-muted small mb-2">Inventario:</h6>
                  <div>
                    {SUGGESTED_QUESTIONS.inventario.map((q, i) => (
                      <span 
                        key={`inv-${i}`}
                        className="badge bg-light text-dark border border-light-subtle rounded-pill me-2 mb-2 px-3 py-2 suggestion-badge"
                        onClick={() => handleSuggestedQuestion(q)}
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="d-flex flex-wrap">
                  <div className="me-4 mb-3">
                    <h6 className="text-muted small mb-2">Proveedores:</h6>
                    <div>
                      {SUGGESTED_QUESTIONS.proveedores.map((q, i) => (
                        <span 
                          key={`prov-${i}`}
                          className="badge bg-light text-dark border border-light-subtle rounded-pill me-2 mb-2 px-3 py-2 suggestion-badge"
                          onClick={() => handleSuggestedQuestion(q)}
                        >
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h6 className="text-muted small mb-2">Artículos:</h6>
                    <div>
                      {SUGGESTED_QUESTIONS.articulos.map((q, i) => (
                        <span 
                          key={`art-${i}`}
                          className="badge bg-light text-dark border border-light-subtle rounded-pill me-2 mb-2 px-3 py-2 suggestion-badge"
                          onClick={() => handleSuggestedQuestion(q)}
                        >
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input container - Fixed at bottom */}
          <div className="card-footer bg-white border-top position-fixed bottom-0 start-0 end-0 py-3">
            <div className="container-fluid">
              <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                  <form onSubmit={handleSubmit} className="d-flex align-items-center border rounded-pill px-3 py-1 bg-white shadow-sm">
                    <input
                      type="text"
                      className="form-control border-0 shadow-none"
                      placeholder="Escribe tu pregunta aquí..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      disabled={isLoading}
                      ref={inputRef}
                    />
                    <button 
                      type="submit" 
                      className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                      disabled={isLoading || !question.trim()}
                      style={{ width: '40px', height: '40px' }}
                    >
                      <Icon icon="mdi:send" width="20" height="20" />
                    </button>
                  </form>
                  <div className="text-center mt-2 text-muted small">
                    <span>Asistente IA de Sapitos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CSS para la animación de puntos y estilos específicos */}
        <style>
          {`
            .typing-dot {
              width: 8px;
              height: 8px;
              background-color: #aaa;
              border-radius: 50%;
              display: inline-block;
              animation: bounce 1.4s infinite ease-in-out both;
            }
            .typing-dot:nth-child(1) { animation-delay: 0s; }
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            
            @keyframes bounce {
              0%, 80%, 100% { transform: scale(0); }
              40% { transform: scale(1.0); }
            }
            
            .suggestion-badge {
              cursor: pointer;
              transition: all 0.2s ease;
            }
            .suggestion-badge:hover {
              background-color: #e9ecef !important;
              border-color: #dee2e6 !important;
            }
            
            .assistant-avatar {
              width: 32px;
              height: 32px;
              min-width: 32px;
            }
            
            .rounded-chat-assistant {
              border-top-left-radius: 0 !important;
            }
            
            .rounded-chat-user {
              border-top-right-radius: 0 !important;
            }
          `}
        </style>
      </div>
    </MasterLayout>
  );
};

export default AiAssistantPage;