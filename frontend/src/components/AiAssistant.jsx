import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { notify, NotificationType } from './NotificationService';

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

const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  // Función para enfocar el input cuando se abre el chat
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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

  // Estilos inline para elementos específicos
  const floatingButtonStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1050,
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#5141EA',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  
  const typingIndicatorStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px'
  };
  
  const dotStyle = {
    width: '8px',
    height: '8px',
    backgroundColor: '#aaa',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'bounce 1.4s infinite ease-in-out both'
  };
  
  const suggestionPillStyle = {
    padding: '6px 12px',
    marginRight: '6px',
    marginBottom: '6px',
    borderRadius: '16px',
    backgroundColor: '#f0f0f0',
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'inline-block',
    transition: 'all 0.2s ease',
    border: '1px solid #ddd'
  };
  
  // Renderizar el botón flotante cuando el chat está cerrado
  if (!isOpen) {
    return (
      <button 
        style={floatingButtonStyle}
        onClick={() => setIsOpen(true)}
        title="Asistente IA"
        className="btn shadow"
      >
        <Icon icon="simple-icons:openai" width="24" height="24" />
      </button>
    );
  }

  // Renderizar el chat completo (estilo ChatGPT) cuando está abierto
  return (
    <div className="position-fixed top-0 start-0 bottom-0 end-0 d-flex flex-column bg-white" style={{ zIndex: 1040 }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-primary text-white">
        <div className="d-flex align-items-center">
          <Icon icon="simple-icons:openai" width="24" height="24" className="me-2" />
          <h5 className="mb-0">Asistente IA</h5>
        </div>
        <button 
          className="btn-close btn-close-white"
          onClick={() => setIsOpen(false)}
          aria-label="Cerrar"
        />
      </div>
      
      {/* Chat container */}
      <div 
        className="flex-grow-1 p-3 overflow-auto"
        ref={chatContainerRef}
        style={{ background: '#f8f9fa' }}
      >
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.type === 'user' ? 'text-end' : ''}`}>
            <div 
              className={`d-inline-flex ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              style={{ maxWidth: '80%' }}
            >
              {message.type === 'assistant' && (
                <div 
                  className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2"
                  style={{ width: '32px', height: '32px', minWidth: '32px' }}
                >
                  <Icon icon="simple-icons:openai" width="16" height="16" className="text-white" />
                </div>
              )}
              <div 
                className={`p-3 rounded shadow-sm ${
                  message.type === 'user' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-dark'
                }`}
                style={{ 
                  borderTopLeftRadius: message.type === 'assistant' ? '0' : undefined,
                  borderTopRightRadius: message.type === 'user' ? '0' : undefined,
                  textAlign: 'left'
                }}
              >
                {message.text}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="mb-4">
            <div className="d-inline-flex flex-row" style={{ maxWidth: '80%' }}>
              <div 
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2"
                style={{ width: '32px', height: '32px', minWidth: '32px' }}
              >
                <Icon icon="simple-icons:openai" width="16" height="16" className="text-white" />
              </div>
              <div className="p-3 rounded shadow-sm bg-white">
                <div style={typingIndicatorStyle}>
                  <span style={{...dotStyle, animationDelay: '0s'}}></span>
                  <span style={{...dotStyle, animationDelay: '0.2s'}}></span>
                  <span style={{...dotStyle, animationDelay: '0.4s'}}></span>
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
                    style={suggestionPillStyle} 
                    className="suggestion-pill"
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
                    style={suggestionPillStyle} 
                    className="suggestion-pill"
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
                      style={suggestionPillStyle} 
                      className="suggestion-pill"
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
                      style={suggestionPillStyle} 
                      className="suggestion-pill"
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
      
      {/* Input container */}
      <div className="p-3 border-top bg-white">
        <form onSubmit={handleSubmit} className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Escribe tu pregunta aquí..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            ref={inputRef}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading || !question.trim()}
          >
            <Icon icon="mdi:send" width="20" height="20" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistant; 