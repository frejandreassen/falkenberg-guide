import OpenAI from "openai";
const axios = require('axios');

// Define the endpoint for your Qdrant collection
const collectionEndpoint = 'http://qdrant.utvecklingfalkenberg.se:6333/collections/falkenberg_events/points/search';
const apiKey = process.env.QDRANT_API_KEY

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function createEmbedding(text) {
  const result = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
    encoding_format: "float",
  });

  return result.data[0].embedding
}

export async function POST(req) {
    try {
        const { fromDate='', toDate='2099-12-31', text } = await req.json();
        const embedding = await createEmbedding(text)
        const from = new Date(fromDate)
        const fromTimestamp = Math.floor(from.getTime() / 1000)
        const to = new Date(toDate)
        const toTimestamp = Math.floor(to.getTime() / 1000)

        const payload = {
            "vector": embedding,
            "filter": {
                "should": [
                    {
                        "key": "occurrences[].startTimestamp",
                        "range": {
                            "gte": fromTimestamp,
                            "lte": toTimestamp
                        }
                    }
                ]
            },
            "limit": 3,
            "with_payload": true
        };

        const res = await axios.post(collectionEndpoint, payload, {
            headers: {
                'api-key': `${apiKey}`
            }
        });

        const data  = res.data
        return Response.json({data})
    }catch(e){
        console.log(e.message)
        return Response.json({ error: 'unable to fetch data' })
    }    
  }