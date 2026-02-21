import dotenv from "dotenv";
dotenv.config();
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";
// creating a weather fetching tool 

const weatherTool = tool(

    async ({ query }) => {
        console.log("Fetching weather for query:", query);
        const apiKey = process.env.WEATHER_API_KEY;
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        if (data.cod === 200) {
            return `The weather in ${data.name} is ${data.weather[0].main} with a temperature of ${data.main.temp}°C.`;
        }
        return `Could not fetch weather for ${query}`;
    },
    {
        name: "weather",
        description: "Get the weather in a given location.",
        schema: z.object({
            query: z.string().describe("The query to use in search."),
        })
    }

)
// in query we have a and b number if tool doing some math , query will use in search

//! from description , LLM will understand when to use this tool ,
// schema will use how to call this tool and what parameters to pass to it. In this example, we are not providing any parameters, so the tool will be called without any arguments. 
// zod define the schema also validate with typescript
const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "models/gemini-2.5-flash",
    temperature: 0,
});


const checkpointSaver = new MemorySaver();


export const agent = createReactAgent({
    llm: model,
    tools: [weatherTool],
    checkpointSaver
});

