
# 🌐 ChatGPT Next.js App

A chat application built with **Next.js** and **TypeScript**, featuring client-side state management and real-time chatbot responses using **OpenAI's GPT-4 model**. This modern, dynamic chat app offers seamless interaction with features such as auto-scroll, user-friendly input, and a responsive UI powered by **NextUI**.

---

## ✨ Features
- 🔄 **Client-side rendering** for real-time UI updates.
- 🚀 **Real-time bot responses** streamed to the client.
- 📩 **User input** sent via POST to the backend API.
- 🖱️ **Auto-scroll** to show the latest chat messages.
- 🛠️ **Modern UI** built with **NextUI** components.
- 🔧 **Data fetching** managed by **@tanstack/react-query**.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/misterhamu/clone-chat-gpt
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory and add your OpenAI API key:
```bash
OPENAI_API_KEY=your-openai-api-key
```

### 4. Start the development server
```bash
npm run dev
```

---

## 📡 API Routes

### `/api/chat`
- **Method**: `POST`
- **Description**: Sends a user's message to OpenAI GPT-4 and streams the response back.
- **Request Body**:
  ```json
  {
    "message": "Your message here"
  }
  ```
- **Response**: Server-Sent Events (SSE) stream of the chatbot's response in chunks.

---

## 🌐 Understanding Server-Sent Events (SSE)

### What is SSE?
**Server-Sent Events (SSE)** is a web technology that enables a server to push real-time updates to the client over an HTTP connection. It’s particularly useful for applications that require real-time data streaming, like our chat application.

### Why SSE for this project?
In this project, SSE allows the server (which communicates with OpenAI’s GPT-4) to send partial or complete responses to the client as they are generated. This ensures that the user receives messages in real-time without waiting for the entire response to complete.

### How SSE works in the chat app:
1. **Client request:** When a user sends a message, a POST request is made to the `/api/chat` endpoint.
2. **Server processing:** The server interacts with OpenAI’s API and starts streaming the response as it’s being generated.
3. **Streaming:** The server sends the response in small chunks (in SSE format), which are received and processed by the client in real-time.
4. **Real-time updates:** The chat interface displays the bot’s reply progressively, providing a seamless chat experience.

### SSE in the code:
The API route for `/api/chat` uses a **ReadableStream** to stream the response back to the client. Here’s a simplified version of the server-side implementation:
```ts
const readableStream = new ReadableStream({
  async start(controller) {
    // OpenAI API call and streaming response
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: message }],
      stream: true,
    });

    // Stream response chunks back to the client
    for await (const chunk of completion) {
      const content = chunk.choices[0].delta?.content || "";
      controller.enqueue(encoder.encode(`data: ${content}

`));
      
      // Close stream when complete
      if (chunk.choices[0].finish_reason === "stop") {
        controller.close();
        break;
      }
    }
  }
});
```

- **ReadableStream:** This creates a stream of data that is sent back to the client incrementally.
- **Controller:** Manages the flow of the stream and pushes chunks of data (GPT-4 responses) as they're generated.
- **Event format:** Each SSE message is prefixed with `data: ` followed by the message content.

SSE is ideal for this use case as it provides:
- Low latency for real-time updates.
- Efficient one-way communication from the server to the client.
- A persistent connection that keeps streaming until the server closes it.

---

## 🖥️ Usage

1. Input messages into the chat interface.
2. Submitting a message sends a request to `/api/chat` and initiates real-time streamed responses from GPT-4 using SSE.
3. Responses are displayed in the chat window, which auto-scrolls to the latest message.
4. Chat history is stored in the component’s local state for the session.

---

## 🛠️ Components Overview

- **`Home.tsx`**: Main chat interface component. Manages user input, chat history, and message sending.
- **API Route**: Handles communication with GPT-4 API, streams responses back to the client.

---

## 🧰 Technologies

- **Next.js**: React framework for server-side rendering and static site generation.
- **TypeScript**: Adds type safety to JavaScript for more robust code.
- **NextUI**: Modern component library for responsive design.
- **@tanstack/react-query**: Simplifies server-side state management.

---

## 📄 License

This project is licensed under the **MIT License**.
