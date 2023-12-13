import OpenAI from "openai";

// Define the endpoint for your Qdrant collection
const collectionEndpoint = 'http://qdrant.utvecklingfalkenberg.se:6333/collections/falkenberg_guide/points/search';
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

export async function retrieve_tourist_info(args) {
    
    try {
        const { text } = args;
        console.log('Text for vector search: ', text)
        const embedding = await createEmbedding(text)

        const payload = {
            "vector": embedding,
            "limit": 5,
            "filter": {
                "must_not": [
                    {
                        "key": "uri",
                        "match": {
                            "text": "/inspiration/"
                        }
                    }
                ]
            },
            "with_payload": true
        };

        const res = await fetch(collectionEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': `${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        return data;
    } catch(e) {
        console.log(e.message);
        return { error: 'unable to fetch tourist info' };
    }    
}
