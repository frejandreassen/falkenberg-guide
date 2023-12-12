import OpenAI from "openai";

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

export async function retrieve_events(args) {
    try {
        const { toDate='2099-12-31', text='musik|konsert|teater|föreställning' } = args;
        let { fromDate } = args;
        console.log('Text for event search: ', text, fromDate, toDate)

        // If fromDate is not provided, use the current date
        if (!fromDate) {
            fromDate = new Date().toISOString().split('T')[0];
        }

        const embedding = await createEmbedding(text)
        const from = new Date(fromDate);
        const fromTimestamp = Math.floor(from.getTime() / 1000);
        console.log("fromTimestamp", fromTimestamp);

        const to = new Date(`${toDate}T23:59:59`);
        const toTimestamp = Math.floor(to.getTime() / 1000);

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
            "limit": 5,
            "with_payload": true,
            // "score_threshold": 0.75
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
        const results = data.result.map((point) => point.payload)
        return results;
    } catch(e) {
        console.log(e.message);
        return { error: 'unable to fetch events' };
    }    
}
