'use client';


import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { nanoid } from 'ai';
import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';

export default function Chat() {


  const messagesEndRef = useRef(null); // Ref to keep track of the end of the messages


  const functionCallHandler = async (
    chatMessages,
    functionCall,
  ) => {
    if (functionCall.name === 'add_places_to_map') {
      if (functionCall.arguments) {
        // Parsing here does not always work since it seems that some characters in generated code aren't escaped properly.
        const parsedFunctionCallArguments = JSON.parse(
          functionCall.arguments,
        );
        // alert(`Add places with args ${JSON.stringify(parsedFunctionCallArguments)}`)
        setPlaces(parsedFunctionCallArguments.places)
        const functionResponse = {
          messages: [
            ...chatMessages,
            {
              id: nanoid(),
              name: 'add_places_to_map',
              role: 'function',
              content: 'Uppdaterar kartan.',
            },
          ],
        };
        return functionResponse;
      }
    }
  };


  const { messages, input, handleInputChange, handleSubmit } = useChat({
    experimental_onFunctionCall: functionCallHandler
  });

  // useEffect(() => {
  //   // Auto-scroll to the bottom of the messages
  //   if (messagesEndRef.current) {
  //     messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [messages]); // Dependency array includes messages to trigger effect when new messages are added

  
  return (
    <div className="flex flex-col w-full h-screen">
      <div className="flex flex-1 mx-auto lg:w-2/3">
        <main className="flex-1 p-24 flex flex-col-reverse">
        <form className="flex space-x-4 justify-between" onSubmit={handleSubmit}>
            <input
              className="w-5/6 rounded-md p-2 text-black"
              value={input}
              onChange={handleInputChange}
              placeholder="Vad händer i Falkenberg i helgen?..."
              autoFocus
            />
            <button
              className="border-solid border-2 p-2 rounded-md text-black"
              type="submit"
            >
              Skicka
            </button>
          </form>
          <section className="mb-auto flex-col-reverse overflow-auto max-h-[80vh]">
            {messages.map(m => (
              <div className="mb-4" key={m.id}>
                {/* {m.role === 'user' ? 'User: ' : 'AI: '}
                {m.content} */}
                <article className="prose flex-1">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
                    }}
                  >
                    {m.content && `${m.role === 'user' ? 'User: ' : 'AI: '} ${m.content}`}

                  </ReactMarkdown>
                </article>
              </div>
            
              
            ))}
            <div ref={messagesEndRef} />
          </section>
          
        </main>
        
      </div>
    </div>
    );
}
