import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'MINIMAX_API_KEY not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.minimax.io/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "MiniMax-M2.1",
        messages: [
          {
            role: "system",
            content: `You are an expert ASCII art animator. 
Your goal is to generate a short ASCII art animation based on the user's prompt.
The animation should consist of 10 to 15 frames.
Each frame should be a string containing the ASCII art.
Use newlines (\\n) within the string to format the ASCII art vertically.
Keep the ASCII art relatively simple and clear (approx 40x20 chars).
Return ONLY valid JSON in the following format, with no markdown code blocks:
{
  "frames": [
    "frame 1 string...",
    "frame 2 string...",
    ...
  ]
}`
          },
          {
            role: "user",
            content: `Create an ASCII animation for: ${prompt}`
          }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.base_resp?.status_msg || response.statusText);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Clean up markdown if present
    content = content.replace(/```json\n?|\n?```/g, '').trim();

    // Parse the JSON content
    let parsedContent;
    try {
        parsedContent = JSON.parse(content);
    } catch (e) {
        console.error("Failed to parse JSON:", content);
        throw new Error("Failed to parse model output");
    }

    return NextResponse.json(parsedContent);

  } catch (error: any) {
    console.error('ASCII API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
