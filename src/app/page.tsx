"use client"; // Client-side component

import { Button, Textarea } from "@nextui-org/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, GPTIcon } from "./components/Icons";

export default function Home() {
  const [message, setMessage] = useState(""); // User input message
  const [chat, setChat] = useState<string[]>([]); // Chat history

  // Reference to the chatbox container for scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = useMutation({
    mutationKey: ["sendMessage"],
    mutationFn: async (message: string) => {
      await sendingChat(message);
    },
    onMutate: () => {},
    onError: () => {},
    onSuccess: () => {},
    onSettled: () => {
      // Focus the input field after the message is sent
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
  });

  const sendingChat = async (message: string) => {
    // Step 1: Make a POST request and set up streaming
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }), // Send the user message
    });

    if (!response.ok) {
      console.error("Failed to fetch chat response");
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullBotMessage = ""; // To accumulate the bot's response progressively

    // Step 2: Process the stream in chunks
    while (true) {
      const { done, value } = await reader!.read();

      if (done) {
        break; // End of the stream
      }

      const chunkText = decoder.decode(value, { stream: true });

      // Ensure the chunk starts with "data: " and remove it
      const lines = chunkText
        .split("\n")
        .filter((line) => line.startsWith("data: "));
      for (const line of lines) {
        const jsonString = line.replace(/^data: /, ""); // Remove 'data: ' prefix
        try {
          const parsedData = JSON.parse(jsonString); // Parse the JSON string
          const botMessage = parsedData.message.content.parts[0]; // Extract the bot's message
          fullBotMessage = botMessage;

          // Update the chat with the accumulated bot response
          setChat((prevChat) => {
            const updatedChat = [...prevChat];
            const lastIndex = updatedChat.length - 1;

            // If the last message is from the bot, update it, otherwise add a new bot message
            if (updatedChat[lastIndex]?.startsWith("Bot:")) {
              updatedChat[lastIndex] = `Bot: ${fullBotMessage}`;
            } else {
              updatedChat.push(`Bot: ${fullBotMessage}`);
            }

            return updatedChat;
          });
        } catch (err) {
          console.error("Error parsing JSON:", err);
        }
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Append the user's message to the chat
    setChat((prevChat) => [...prevChat, `You: ${message}`]);

    // Clear the input message
    setMessage("");

    sendMessage.mutate(message);
  };

  // Auto-scroll to the bottom of the chatbox when a new message is added
  useEffect(() => {
    if (chatContainerRef.current) {
      window.scrollTo({
        top: chatContainerRef.current.scrollHeight, // Change this number to the Y coordinate you want to scroll to
        behavior: "smooth", // 'smooth' for smooth scrolling, 'auto' for instant scroll
      });
    }
  }, [chat]); // Runs whenever the chat array updates

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // Focus the input field when not loading
    }
  }, [sendMessage.isPending]);

  return (
    <>
      <main className="relative h-full w-full flex-1 overflow-auto">
        <div className="flex h-full flex-col focus-visible:outline-0">
          <div className="flex-1  mb-[48px]">
            <div className="h-full" ref={chatContainerRef}>
              <div className="flex flex-col text-sm md:pb-9">
                {chat.map((line, index) => (
                  <article
                    key={index}
                    className={`w-full  focus-visible:outline-2 focus-visible:outline-offset-[-4px] text-white`}
                  >
                    <div className="m-auto text-base py-[18px] px-3 md:px-4 w-full lg:px-4 xl:px-5">
                      <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl">
                        {line.startsWith("Bot:") && (
                          <div className="flex-shrink-0 flex flex-col relative items-end">
                            <div>
                              <div className="pt-0">
                                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full">
                                  <div className="relative flex items-center justify-center  h-8 w-8 border  border-[#424242] rounded-full p-2">
                                    <GPTIcon size={16} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="relative flex w-full min-w-0 flex-col">
                          <div className="flex-col gap-1 md:gap-3">
                            <div className="flex max-w-full flex-col flex-grow">
                              <div className="min-h-8 text-message flex w-full flex-col items-end gap-2 whitespace-normal break-words [.text-message+&amp;]:mt-5">
                                <div
                                  className={`${
                                    line.startsWith("You:")
                                      ? "flex w-full flex-col gap-1 empty:hidden items-end rtl:items-start"
                                      : "flex w-full flex-col gap-1 empty:hidden first:pt-[3px]"
                                  }`}
                                >
                                  <div
                                    className={`${
                                      line.startsWith("You:")
                                        ? "relative max-w-[70%] rounded-3xl px-5 py-2.5 bg-[#2F2F2F] dark:bg-token-main-surface-secondary"
                                        : "markdown prose w-full break-words dark:prose-invert dark"
                                    }`}
                                  >
                                    <p className="whitespace-pre-wrap">
                                      {line.startsWith("You:") ||
                                      line.startsWith("Bot:")
                                        ? line.slice(4)
                                        : line}{" "}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="md:pt-0 dark:border-white/20 md:border-transparent md:dark:border-transparent w-full">
            <div className="m-auto  px-3 md:px-4 w-full md:px-5 lg:px-4 xl:px-5 fixed bottom-0 pb-4 bg-[#212121]">
              <div className="mx-auto flex flex-1 gap-4 text-base md:gap-5 lg:gap-6 md:max-w-3xl">
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="relative flex h-full max-w-full flex-1 flex-col">
                    <div className="relative flex w-full items-center">
                      <div className="flex w-full flex-col gap-1.5 rounded-[26px] p-1.5 transition-colors dark:bg-token-main-surface-secondary">
                        <div className="flex items-end gap-1.5 pl-4 md:gap-2">
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="overflow-hidden default-browser">
                              <Textarea
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key == "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                  }
                                }}
                                id={"inputRef"}
                                ref={inputRef}
                                type="text"
                                value={message}
                                minRows={1}
                                maxRows={3}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Message to ChatGPT"
                                className="flex-1 p-2 rounded-[26px]  bg-[#2F2F2F] !text-white "
                                classNames={{
                                  inputWrapper:
                                    "group-data-[focus-visible=true]:ring-0 group-data-[focus-visible=true]:ring-offset-0",
                                }}
                                disabled={sendMessage.isPending} // Disable input while loading
                              />
                              <Button
                                type="submit"
                                isLoading={sendMessage.isPending}
                                isIconOnly
                                color="default"
                                className="absolute bottom-3.5 right-4 rounded-full"
                              >
                                <ArrowUp />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
