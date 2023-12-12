'use client';

import Map from '@/components/Map';
import Spinner from '@/components/icons/Spinner';
import { XMarkIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { nanoid } from 'ai';
import { useChat } from 'ai/react';
import { useState, useEffect } from 'react';

export default function Chat() {
  const [mapLocation, setMapLocation] = useState({
    lat: 57,
    lng: 12.7,
    zoom: 10
  });
  const [places, setPlaces] = useState([]);
  const [prompt, setPrompt] = useState(''); // Store the initial input

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

  const { messages, setMessages, setInput, handleSubmit, isLoading } = useChat({
    experimental_onFunctionCall: functionCallHandler
  });

  const handleFormSubmit = (e) => {
      e.preventDefault();

      // Start a new session
      setMessages([]);


      setInput(prompt)
      // Normal form submission
      handleSubmit(e);
  };

  const handleChange = (e) => {
    setMessages([])
    setPrompt(e.target.value)
    setInput(e.target.value)
  }
  return (
    <div className="flex flex-col w-full h-screen max-w-2xl mx-auto font-montserrat">
      <div className="w-full my-4">
        <Map center={mapLocation} zoom={mapLocation.zoom} places={places} style={{ height: '45vh', width: '100%' }}/>
      </div>
      <form className="flex space-x-4 justify-between mb-4" onSubmit={handleSubmit}>
        <div className="relative w-full">
            <input
                className="w-full rounded-full border border-gray-400 p-2 text-black pl-4"
                value={prompt}
                onChange={handleChange}
                placeholder="Vad vill du göra ?"
                autoFocus
            />
            {prompt && (
                <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setPrompt('')}
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            )}
        </div>
    </form>
      <section className="">
        {messages.map(m => (
         
          <div className="mb-4" key={m.id}>
            <article className="prose prose-headings:font-bodoni-moda">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
                }}
              >
                 {(m.role != "user") && m.content}
              </ReactMarkdown>
            </article>
          </div>
        ))}
        {isLoading && <Spinner />}
      </section>
    </div>
  );
}