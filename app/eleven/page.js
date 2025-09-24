"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function ElevenLabsLive() {
  const [language, setLanguage] = useState("English");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const eventSourceRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentAudioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  async function sendMessage(e) {
    if (e) e.preventDefault();
    const userText = input.trim();
    if (!userText || isLoading) return;
    setInput("");

    const userMsg = { role: "user", text: userText };
    setMessages((prev) => [...prev, userMsg, { role: "assistant", text: "" }]);
    setIsLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: userText, language }),
    });

    if (!res.ok || !res.body) {
      setIsLoading(false);
      setMessages((prev) => [...prev, { role: "system", text: "Error from server" }]);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload) continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.event === "token") {
            assistantText += evt.data?.text || "";
            setMessages((prev) => {
              const updated = [...prev];
              for (let i = updated.length - 1; i >= 0; i--) {
                if (updated[i].role === "assistant") {
                  updated[i] = { ...updated[i], text: assistantText };
                  break;
                }
              }
              return updated;
            });
          } else if (evt.event === "done") {
            setIsLoading(false);
            if (autoSpeak) {
              const lang = languageToLocale(language);
              await speakText(assistantText, lang);
            }
          } else if (evt.event === "error") {
            setIsLoading(false);
          }
        } catch {}
      }
    }
  }

  function languageToLocale(lang) {
    const map = {
      English: "en-US",
      Hindi: "hi-IN",
      Bengali: "bn-IN",
      Tamil: "ta-IN",
      Telugu: "te-IN",
      Kannada: "kn-IN",
      Malayalam: "ml-IN",
      Marathi: "mr-IN",
      Gujarati: "gu-IN",
      Urdu: "ur-IN",
      Spanish: "es-ES",
      French: "fr-FR",
      German: "de-DE",
      Italian: "it-IT",
      Portuguese: "pt-PT",
      Arabic: "ar-SA",
      Chinese: "zh-CN",
      Japanese: "ja-JP",
      Korean: "ko-KR",
    };
    return map[lang] || "en-US";
  }

  function startListening() {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }

    const recog = new SpeechRecognition();
    recog.lang = languageToLocale(language);
    recog.interimResults = true;
    recog.continuous = true;

    let finalTranscript = "";
    recog.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript + " ";
        else interim += transcript;
      }
      setInput((finalTranscript + interim).trim());
    };
    recog.onend = () => setIsListening(false);
    try {
      recog.start();
      setIsListening(true);
      recognitionRef.current = recog;
    } catch {}
  }

  function stopListening() {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }

  async function speakText(text, lang) {
    if (!text) return;
    stopSpeaking();
    setIsSpeaking(true);
    // Server-side TTS uses ElevenLabs first, then falls back
    try {
      const r = await fetch("/api/speak", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, languageCode: lang }),
      });
      if (r.ok) {
        const { audioContent, fallback } = await r.json();
        if (audioContent) {
          await playAudioFromBase64(audioContent);
          setIsSpeaking(false);
          return;
        }
        if (!fallback) throw new Error("TTS failed");
      }
    } catch {}
    await speakWithSynthesis(text, lang);
    setIsSpeaking(false);
  }

  function stopSpeaking() {
    if (currentAudioRef.current) {
      try { currentAudioRef.current.pause(); } catch {}
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
  }

  function playAudioFromBase64(b64) {
    return new Promise((resolve) => {
      const audio = new Audio(`data:audio/mp3;base64,${b64}`);
      currentAudioRef.current = audio;
      audio.onended = () => { currentAudioRef.current = null; resolve(); };
      audio.onerror = () => { currentAudioRef.current = null; resolve(); };
      audio.play().catch(() => { currentAudioRef.current = null; resolve(); });
    });
  }

  function speakWithSynthesis(text, lang) {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return resolve();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } catch {
        resolve();
      }
    });
  }

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <Script src="https://unpkg.com/@elevenlabs/convai-widget-embed" strategy="afterInteractive" />
      <elevenlabs-convai agent-id="agent_8301k5gvw8kgfsyvnfs4v1w1c7r5" />
      <h1 className="text-2xl font-semibold mb-4">Agrithozha Live Multilingual Chat</h1>

      <form onSubmit={sendMessage} className="mb-4 flex gap-2 items-center">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type your message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <select
          className="border rounded px-2 py-2"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>English</option>
          <option>Hindi</option>
          <option>Bengali</option>
          <option>Tamil</option>
          <option>Telugu</option>
          <option>Kannada</option>
          <option>Malayalam</option>
          <option>Marathi</option>
          <option>Gujarati</option>
          <option>Urdu</option>
          <option>Spanish</option>
          <option>French</option>
          <option>German</option>
          <option>Italian</option>
          <option>Portuguese</option>
          <option>Arabic</option>
          <option>Chinese</option>
          <option>Japanese</option>
          <option>Korean</option>
        </select>
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`px-3 py-2 rounded text-white ${isListening ? "bg-red-600" : "bg-blue-600"}`}
        >
          {isListening ? "Stop Mic" : "Start Mic"}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>

      <div className="flex items-center gap-3 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoSpeak}
            onChange={(e) => setAutoSpeak(e.target.checked)}
          />
          Auto speak replies (uses ElevenLabs first)
        </label>
        {isSpeaking && <span className="text-sm text-gray-600">Speaking…</span>}
      </div>

      <div className="space-y-3">
        {messages.map((m, idx) => (
          <div key={idx} className="border rounded p-3">
            <div className="text-xs text-gray-500 mb-1">{m.role}</div>
            <div className="whitespace-pre-wrap">{m.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


