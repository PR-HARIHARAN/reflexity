import express from "express";
import { tavily } from "@tavily/core";
import { Groq } from "groq-sdk";
import { PROMPT_TEMPLATE, SYSTEM_PROMPT } from "./prompt";
import { middleware } from "./middleware";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const client = tavily({ apiKey: process.env.TAVILY_API_KEY});
const groq = new Groq({apiKey: process.env.GROQ_API_KEY});


//get Past Converstaion
app.get("/conversations", middleware, async (req, res) => {
    res.json({
        userId: req.userId
    })
});

//get conversation by id
app.get("/conversation/:conversationId", middleware, async(req ,res)=>{

});


app.post("/reflexity_ask", middleware, async (req, res) =>{
    //get query from the user
    const query = req.body.query;

    //make sure user has access/credits to hit the endpoint

    //chek if we have web-search indexed for similar query

    //web search to gather sources
    const webSearchResponse = client.search(query, {
        SearchDepth: "advanced"
    });

    const webSearchResult = (await webSearchResponse).results;

    //do some context engineering on the prompt + web search responses

    // hit the LLM and stream back the response
    const prompt = PROMPT_TEMPLATE
        .replace("{{WEB_SEARCH_RESULTS}}",JSON.stringify(webSearchResult))
        .replace("{{USER_QUERY}}", query);
    
    const result = await groq.chat.completions.create({
        "messages": [
            {
            "role": "system",
            "content": SYSTEM_PROMPT,
            },
            {
            "role": "user",
            "content": prompt
            }
        ],
        "model": "llama-3.1-8b-instant",
        "temperature": 0,
        "max_completion_tokens": 768,
        "top_p": 1,
        "stream": true,
        "stop": null
        });
        
    res.header('Cache-Control','no-cache');
    res.header('Content-Type','text/event-stream');
        for await (const chunk of result) {
        res.write(chunk.choices[0]?.delta?.content || '');
        }

    res.write("\n<SOURCES>\n")

    // also stream back the sources and the follow up questions (which we can get another parallel LLM call)
    res.write(JSON.stringify(webSearchResult.map(result => ({url: result.url}))));
    
    res.write("\n</SOURCES>\n")
    //close the event stream
    res.end();

});


app.post("/reflexity_ask/follow_up", middleware,async(req, res) =>{
    //get the existing chat from the db

    //forward the full history to the LLM

    //
})

app.listen(3001,()=>{
    console.log(`Server running on port http://localhost:${3001}`);
    
});



