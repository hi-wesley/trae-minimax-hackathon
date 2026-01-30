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
            content: `You are an expert Frontend Developer and UI Designer known for "Vibe Coding".
Your goal is to generate a single, self-contained HTML file containing a stunning, modern UI component based on the user's prompt.

RULES:
1.  **Single File**: Output ONLY valid HTML.
2.  **Embedded CSS**: Use <style> tags for all styling. Use modern CSS (Flexbox, Grid, Animations, Glassmorphism, Gradients).
3.  **Embedded JS**: Use <script> tags for interactivity.
4.  **No External Deps**: Do not import external CSS/JS libraries (like Tailwind via CDN is okay, but keep it simple). 
    *   Actually, prefer using standard CSS variables and simple inline styles or a style block to ensure it works instantly in an iframe.
    *   You MAY use FontAwesome CDN for icons if needed: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
5.  **Aesthetics**: The design should be "Cyberpunk", "Vaporwave", or "Modern Clean" depending on the prompt, but always high quality.
6.  **Responsiveness**: The component should look good centered on the screen.

Output format:
Just the raw HTML code. Do not wrap in markdown code blocks like \`\`\`html.
`
          },
          {
            role: "user",
            content: `Create a UI component for: ${prompt}`
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
    content = content.replace(/```html\n?|\n?```/g, '').trim();

    return NextResponse.json({ html: content });

  } catch (error: any) {
    console.error('UI Gen API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
