import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { retrieve_events } from '@/backend/retrieveEvents';
import { retrieve_tourist_info } from '@/backend/retrieveTouristInfo';
import { getLatLng } from '@/backend/getLatLng'
 
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
// const GPT_MODEL = 'gpt-4-1106-preview'
const GPT_MODEL = 'gpt-3.5-turbo-1106'
 
// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';
 
const functions = [
  {
    name: 'add_places_to_map',
    description: 'Add locations to the map to show the user where the location is.',
    parameters: {
      type: 'object',
      properties: {
        places: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: 'The text describing the place',
              },
              lat: {
                type: 'number',
                description: 'The latitude of the place',
              },
              lng: {
                type: 'number',
                description: 'The longitude of the place',
              }
            },
            required: ['text'],
          },
        },
      },
      required: ['places', 'lat', 'lng'],
    },
  },
  {
    name: 'retrieve_events',
    description: 'Retrieve future events filtered by dates that matches user preferences',
    parameters: {
      type: 'object',
      properties: {
        fromDate: {
            type: 'string',
            description: 'Start date for the events',
            example: '2024-01-01'
          },
          toDate: {
            type: 'string',
            description: 'End date for the events',
            example: '2024-12-31'
          },
          text: {
            type: 'string',
            description: 'user query to search for events',
          }
        },
        required: ['text'],
      },
    },
    {
      name: 'retrieve_tourist_info',
      description: 'Retrieve tourist info from Falkenberg by passing latest user query as text',
      parameters: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Raw User query to search for tourist info',
            example: 'Jag vill hitta ett barnvänligt hotell nära Ullared'
          }
        },
        required: ['text'],
      }
    },
    // {
    //   name: 'get_lat_lng',
    //   description: 'Retrieve exact lat and lng using google maps. Fallback if lat and lng is missing',
    //   parameters: {
    //     type: 'object',
    //     properties: {
    //       place: {
    //         type: 'string',
    //         description: 'Search for place and or address to get lat and lng',
    //       }
    //     },
    //     required: ['place'],
    //   }
    // },
    
]
const today = new Date();
const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
});

export async function POST(req) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();
  const systemMessage = {
    role: 'system',
    content: `Du är en hjälpsam reseguide på https://falkenberg.se som hjälper användaren att hitta turist info om restauranger, platser att besöka, cafeer, hotell (retrieve_info) eller framtida evenemang (retrive_events) i Falkenberg. dagens datum är ${formattedDate}. Du svarar trevligt och informativt i markdown, redovisa relevant länk och uppdaterar kartan när du har lat och lng. Länka bara till falkenberg.se`
  };
 
  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: GPT_MODEL,
    stream: true,
    messages: [systemMessage, ...messages],
    functions,
    temperature: 0.0
  });
  // Convert the response into a friendly text-stream
  // const stream = OpenAIStream(response);

  const stream = OpenAIStream(response, {
    experimental_onFunctionCall: async (
      { name, arguments: args },
      createFunctionCallMessages,
    ) => {
      let result;
  
      // Check if the function call is for 'retrieve_events'
      if (name === 'retrieve_events') {
        result = await retrieve_events(args);
      }
      // Check if the function call is for 'retrieve_tourist_info'
      else if (name === 'retrieve_tourist_info') {
        result = await retrieve_tourist_info(args);
      }

      else if (name === 'get_lat_lng') {
        result = await getLatLng(args);
      } 
  
      // If one of the functions was called, process the result
      if (result) {
        const newMessages = createFunctionCallMessages(result);
        return openai.chat.completions.create({
          messages: [systemMessage, ...messages,  ...newMessages], //,
          stream: true,
          model: GPT_MODEL,
          functions,
          temperature: 0.1
        });
      }
    },
  });
  
  // Respond with the stream
  return new StreamingTextResponse(stream);
}