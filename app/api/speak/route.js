import { NextResponse } from "next/server";

export const runtime = "edge";

function pickVoice(languageCode) {
  // Reasonable defaults; change names to specific available voices in your GCP project/region if needed
  const defaults = {
    "ta-IN": { name: "ta-IN-Standard-A" },
    "hi-IN": { name: "hi-IN-Standard-A" },
    "bn-IN": { name: "bn-IN-Standard-A" },
    "te-IN": { name: "te-IN-Standard-A" },
    "kn-IN": { name: "kn-IN-Standard-A" },
    "ml-IN": { name: "ml-IN-Standard-A" },
    "mr-IN": { name: "mr-IN-Standard-A" },
    "gu-IN": { name: "gu-IN-Standard-A" },
    "ur-IN": { name: "ur-IN-Standard-A" },
    "en-US": { name: "en-US-Standard-C" },
    "es-ES": { name: "es-ES-Standard-A" },
    "fr-FR": { name: "fr-FR-Standard-A" },
    "de-DE": { name: "de-DE-Standard-A" },
    "it-IT": { name: "it-IT-Standard-A" },
    "pt-PT": { name: "pt-PT-Standard-A" },
    "ar-SA": { name: "ar-XA-Standard-A" },
    "zh-CN": { name: "cmn-CN-Standard-A" },
    "ja-JP": { name: "ja-JP-Standard-A" },
    "ko-KR": { name: "ko-KR-Standard-A" },
  };
  return defaults[languageCode] || { name: "en-US-Standard-C" };
}

export async function POST(request) {
  try {
    const { text, languageCode = "ta-IN", speakingRate = 1, pitch = 0 } = await request.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    }

    // 0) Try ElevenLabs TTS first
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    // Allow per-locale overrides via env like ELEVENLABS_VOICE_ID_EN_US, else fallback to ELEVENLABS_VOICE_ID
    const localeKey = String(languageCode || "").replace(/-/g, "_").toUpperCase();
    const elevenVoicePerLocale = process.env[`ELEVENLABS_VOICE_ID_${localeKey}`];
    const elevenDefaultVoice = process.env.ELEVENLABS_VOICE_ID;
    const elevenVoiceId = elevenVoicePerLocale || elevenDefaultVoice;
    if (elevenLabsApiKey && elevenVoiceId) {
      try {
        const elevenEndpoint = `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`;
        const body = {
          text,
          model_id: "eleven_multilingual_v2",
          // Note: ElevenLabs doesn't support direct pitch/rate; leave defaults
          optimize_streaming_latency: 0,
        };
        const elRes = await fetch(elevenEndpoint, {
          method: "POST",
          headers: {
            "xi-api-key": elevenLabsApiKey,
            "content-type": "application/json",
            accept: "audio/mpeg",
          },
          body: JSON.stringify(body),
        });
        if (elRes.ok) {
          const buf = await elRes.arrayBuffer();
          const b64 = arrayBufferToBase64(buf);
          return NextResponse.json({ audioContent: b64 });
        }
      } catch {}
    }

    // 1) Try Google Cloud TTS
    const gcpKey = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_TRANSLATE_API_KEY;
    if (gcpKey) {
      try {
        const gcpEndpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${gcpKey}`;
        const voice = pickVoice(languageCode);
        const payload = {
          audioConfig: { audioEncoding: "MP3", pitch, speakingRate },
          input: { text },
          voice: { languageCode, name: voice.name },
        };
        const gcpRes = await fetch(gcpEndpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (gcpRes.ok) {
          const data = await gcpRes.json();
          if (data?.audioContent) {
            return NextResponse.json({ audioContent: data.audioContent });
          }
        }
      } catch {}
    }

    // 2) Fallback to Azure Cognitive Services TTS
    const azureKey = process.env.AZURE_TTS_SUBSCRIPTION_KEY;
    const azureRegion = process.env.AZURE_TTS_REGION;
    if (azureKey && azureRegion) {
      try {
        // Map locales to Azure Neural voices
        const azureVoices = {
          "ta-IN": "ta-IN-PallaviNeural",
          "hi-IN": "hi-IN-SwaraNeural",
          "bn-IN": "bn-IN-TanishaaNeural",
          "te-IN": "te-IN-ShrutiNeural",
          "kn-IN": "kn-IN-SapnaNeural",
          "ml-IN": "ml-IN-SobhanaNeural",
          "mr-IN": "mr-IN-AarohiNeural",
          "gu-IN": "gu-IN-NiranjanNeural",
          "ur-IN": "ur-IN-GulNeural",
          "en-US": "en-US-JennyNeural",
          "es-ES": "es-ES-ElviraNeural",
          "fr-FR": "fr-FR-DeniseNeural",
          "de-DE": "de-DE-KatjaNeural",
          "it-IT": "it-IT-ElsaNeural",
          "pt-PT": "pt-PT-FernandaNeural",
          "ar-SA": "ar-SA-ZariyahNeural",
          "zh-CN": "zh-CN-XiaoxiaoNeural",
          "ja-JP": "ja-JP-NanamiNeural",
          "ko-KR": "ko-KR-SunHiNeural",
        };
        const azureVoice = azureVoices[languageCode] || "en-US-JennyNeural";
        const ssml = `<?xml version="1.0" encoding="UTF-8"?>
<speak version="1.0" xml:lang="${languageCode}">
  <voice name="${azureVoice}">
    <prosody pitch="${pitch}st" rate="${speakingRate}">${escapeXml(text)}</prosody>
  </voice>
</speak>`;

        const azureEndpoint = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
        const azRes = await fetch(azureEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
            "Ocp-Apim-Subscription-Key": azureKey,
          },
          body: ssml,
        });
        if (azRes.ok) {
          const buf = await azRes.arrayBuffer();
          const b64 = arrayBufferToBase64(buf);
          return NextResponse.json({ audioContent: b64 });
        }
      } catch {}
    }

    // 3) Final fallback: tell client to use browser TTS
    return NextResponse.json({ fallback: true });
  } catch (error) {
    return NextResponse.json({ error: "Speech synthesis failed." }, { status: 500 });
  }
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  if (typeof btoa !== "undefined") return btoa(binary);
  // Edge runtime provides btoa; keep fallback for completeness
  return Buffer.from(binary, "binary").toString("base64");
}

function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}


