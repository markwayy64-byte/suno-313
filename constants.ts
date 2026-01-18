
import { StructureTemplate } from './types';

export const D_HZ_SYSTEM_PROMPT = `
SYSTEM ROLE: "D-Hz" (The Detroit Audio Architect)
CORE IDENTITY: You are D-Hz, a 26-year-old elite Audio Engineer and Suno V5 Architect from the East Side of Detroit (7 Mile). You speak in authentic Detroit street vernacular (AAVE), code-switching into high-level audio engineering terminology.

OBJECTIVE: Transition the user from "Prompting" (gambling) to "Engineering" (deterministic control) within Suno V5.

PART 1: THE VOICE & PERSONA
1.  **The Sacred Greeting:** ALWAYS start with "What up doe?" or "Shit, what up doe?". NEVER say "Hello."
2.  **The Roast & Pivot:** If a prompt is vague, roast it playfully (e.g., "That prompt is cooked."). Pivot immediately to the technical fix.
3.  **Vocabulary:**
    *   Good: Crack, Fire, Valid, Gettin' off, Crisp, Cold.
    *   Bad: Through, Cooked, Fried, Busted, Muddy, Bummy.
    *   Money: Bread, Strips, The Bag.
    *   Broke/Low-Res: Touchin' cloth, Down bad.
    *   The AI: "The Engine," "The Bitch".
    *   Agreement: "Say less," "That part," "Bet."

PART 2: THE KNOWLEDGE BASE (SUNO V5 PROTOCOL)
1.  **Tripartite Engine:** Semantic Parser (Input), Diffusion Model (Composer), Neural Vocoder (Renderer).
2.  **First-Token Bias:** Genre must be in the first 3 tokens.
3.  **Context Decay:** Memory fades after 120s. Enforce Recursive Anchor Method.
4.  **The Master Formula (Style Prompt):**
    \`[Primary Genre], [Sub-Genre/Era], [BPM], [Core Instrument], [Vocal Texture], [Production Style], [Exclude: Negative Tokens]\`

PART 3: THE "BEEF UP" SIGNAL CHAIN (FOR UPLOADS)
When the user wants to enhance/extend an uploaded sample (The "Beef Up" mode), use these specific tokens to manipulate the Neural Vocoder:
*   Tokens: \`Parallel Compression, Transient Shaper, Heavy Kick, 12k Saturation, Clean Modern Mix, Wide Stereo, Analog Warmth\`
*   Exclusions: \`Exclude: vocals, singing, rap, melisma\` (unless user asks for vocals).

PART 4: INTERACTION LOGIC
*   **Technical Specs Enforcement:** If the user input contains [Technical Specs] tags (e.g., 44.1kHz, 24-bit), you MUST include these exact tags in your final engineered Style Prompt code block. Do not ignore them.
*   **Granular Exclusions:** YOU MUST use granular exclusion tags.
    *   *Examples:* \`[Exclude: sad chord progressions]\`, \`[Exclude: chaotic arrangement]\`, \`[Exclude: muddy low-end]\`.
*   **Templates:** When a user selects a structure template, generate the full prompt using that exact structure in the Lyrics field.

OUTPUT FORMAT:
Always output the engineered prompt in a markdown code block.
`;

export const AUTOSUGGEST_TAGS = [
  "Preserve original samples",
  "Sample-locked generation",
  "Intro",
  "Verse",
  "Chorus",
  "Bridge",
  "Outro",
  "Drop",
  "Hook",
  "Exclude: melodic elements",
  "Exclude: vocals",
  "Exclude: drums",
  "Exclude: sad chord progressions",
  "Exclude: complex melody",
  "Exclude: digital sheen",
  "Exclude: autotune",
  "Exclude: chaotic arrangement",
  "Exclude: muddiness",
  "Exclude: dissonance",
  "Exclude: busy arrangement",
  "Exclude: harsh frequencies",
  "Exclude: lo-fi artifacts",
  "Exclude: major key",
  "44.1kHz",
  "48kHz",
  "16-bit",
  "24-bit"
];

export const CONFLICTING_TAGS: Record<string, string[]> = {
  "lo-fi": ["high fidelity", "clean mix", "modern mix", "48khz", "24-bit"],
  "high fidelity": ["lo-fi", "tape hiss", "vinyl crackle", "bitcrush"],
  "clean mix": ["lo-fi", "muddy", "distortion", "noise"],
  "acoustic": ["synthesizer", "edm", "electronic", "808"],
  "electronic": ["acoustic", "unplugged", "folk"],
  "happy": ["sad", "melancholy", "dark", "depressive"],
  "dark": ["happy", "uplifting", "euphoric", "bright"],
  "slow": ["fast", "rapid", "up-tempo", "140 bpm", "170 bpm"],
  "fast": ["slow", "downtempo", "80 bpm", "60 bpm"]
};

export const PRESETS = [
  {
    genre: "Detroit Trap",
    description: "Flint/Detroit style with nervous piano and off-beat flow.",
    prompt: "Detroit Trap, Flint Rap, 190 BPM, Nervous Piano Loops, Heavy 808 Glides, Off-beat Percussion, Aggressive Male Vocals, Crisp Mix, [Exclude: melodic, singing, autotune, pop structure]"
  },
  {
    genre: "90s Boom Bap",
    description: "Gritty East Coast sound with vinyl texture.",
    prompt: "90s Boom Bap, East Coast Hip-Hop, 90 BPM, Sampled Jazz Piano, Vinyl Crackle, Heavy Kick Drum, Gritty Male Rap, Analog Warmth, SP-1200 Texture, [Exclude: trap hi-hats, autotune, digital sheen, modern pop]"
  },
  {
    genre: "Dark UK Drill",
    description: "Sliding 808s and ominous atmosphere.",
    prompt: "UK Drill, Dark Trap, 140 BPM, Sliding 808 Bass, Rapid Hi-Hat Triplets, Snare Rimshots, Cinematic Tension, Grime Texture, Aggressive Flow, Wide Stereo Master, [Exclude: acoustic drums, happy, major key, singing]"
  },
  {
    genre: "Ethereal Cloud Rap",
    description: "Hazy, reverb-heavy atmosphere.",
    prompt: "Cloud Rap, Ethereal, 130 BPM, Massive Reverb, Hazy Synth Pads, Distorted 808s, Mumbled Vocals, Wide Stereo Image, Dreamy Texture, [Exclude: dry mix, aggressive attack, boom bap drums]"
  },
  {
    genre: "Jazzy Hip-Hop",
    description: "Sophisticated chords with laid-back swing.",
    prompt: "Jazz Rap, Neo-Soul, 85 BPM, Fender Rhodes, Upright Bass, Brushes on Snare, Smooth Flow, Warm Tube Saturation, Coffee Shop Vibe, [Exclude: trap drums, aggressive vocals, electronic synths, distortion]"
  },
  {
    genre: "Lo-fi Hip-Hop",
    description: "Study beats with high noise floor and nostalgia.",
    prompt: "Lo-fi Hip-Hop, Chillhop, 70 BPM, Detuned Piano, Rain Ambience, Sidechained Kick, Tape Hiss, Wow and Flutter, Melancholy, [Exclude: high fidelity, bright mix, rapping, drops, aggressive transients]"
  },
  {
    genre: "Conscious Hip-Hop",
    description: "Lyrical focus with soulful sampling.",
    prompt: "Conscious Hip-Hop, Soul Sample Flip, 92 BPM, Chopped Vocal Samples, Tight Snare, Deep Bassline, Storytelling Flow, 70s Soul Aesthetic, [Exclude: mumble rap, auto-tune, repetitive hook, simplistic drums]"
  },
  {
    genre: "Memphis Phonk",
    description: "Dark, lo-fi 90s Memphis sound with cowbells.",
    prompt: "Memphis Rap, Phonk, 140 BPM, Cowbell Melodies, Distorted 808s, Lo-fi Cassette Tape Hiss, Chopped and Screwed Vocals, Horrorcore Atmosphere, [Exclude: clean mix, happy melodies, acoustic instruments]"
  },
  {
    genre: "Neo-Soul",
    description: "Soulful, unquantized rhythms with rich harmonies.",
    prompt: "Neo-Soul, R&B, 88 BPM, Dilla Swing, Fender Rhodes, Unquantized Drums, Soulful Female Vocals, Deep Bassline, Warm Analog Mix, [Exclude: rigid quantization, trap hi-hats, edm, aggressive rap]"
  },
  {
    genre: "West Coast G-Funk",
    description: "Laid back groove with high synth leads.",
    prompt: "G-Funk, West Coast Hip-Hop, 95 BPM, High-Pitched Sine Synth, Deep Moog Bassline, Funk Samples, Laid-back Flow, Gangsta Rap, Groovy, [Exclude: trap drums, dark, fast tempo, distortion]"
  }
];

export const BEEF_UP_PRESETS = [
  {
    genre: "Low End Reconstruction",
    description: "Re-synthesize sub frequencies and kick.",
    prompt: "[Task: Beef Up Low End], [Add Sub-Harmonics], [Kick Drum Replacement], [Sidechain Glue], [Mono Bass], [Exclude: mud, rumble]"
  },
  {
    genre: "Transient Restoration",
    description: "Recover lost punch in drums.",
    prompt: "[Task: Transient Shaping], [Attack Boost], [Snare Crack], [Percussion Clarity], [Multi-band Compression], [Exclude: dull transients, soft clip]"
  },
  {
    genre: "Stereo Field Expansion",
    description: "Widen the mix without phase issues.",
    prompt: "[Task: Stereo Widening], [Mid-Side EQ], [Haas Effect], [High-End Shine], [Spatial Depth], [Exclude: phase cancellation, hollow center]"
  },
  {
    genre: "Vintage Analog Warmth",
    description: "Apply tube/tape saturation artifacts.",
    prompt: "[Task: Analog Texture], [Tape Saturation], [Tube Distortion], [Vinyl Noise Floor], [Warm EQ Curves], [Exclude: digital coldness, harsh highs]"
  },
  {
    genre: "Vocal Clarity & Presence",
    description: "Bring vocals to the front of the mix.",
    prompt: "[Task: Vocal Enhancement], [De-essing], [Presence Boost 3kHz], [Optical Compression], [Plate Reverb], [Exclude: sibilance, muddy vocals]"
  },
  {
    genre: "High-Fidelity Upscale",
    description: "General remastering for clarity.",
    prompt: "[Task: HD Remaster], [Exciter], [Air Band Boost], [Parallel Compression], [Limiter Maximizer], [Exclude: distortion, clipping, noise]"
  }
];

export const ADVANCED_TEMPLATES: StructureTemplate[] = [
  {
    id: "pop_radio",
    label: "Radio Standard (V-C-V-C-B-C)",
    description: "The industry standard for maximum retention. Good for Pop, Rap, and R&B.",
    tags: ["Radio", "Pop", "Standard"],
    sections: [
      { id: "1", name: "Intro", bars: 4, type: "intro", description: "Atmospheric setup, establish key." },
      { id: "2", name: "Verse 1", bars: 16, type: "verse", description: "Low energy, establish narrative." },
      { id: "3", name: "Pre-Chorus", bars: 4, type: "transition", description: "Riser, tension build." },
      { id: "4", name: "Chorus", bars: 8, type: "chorus", description: "Full stereo width, hook." },
      { id: "5", name: "Verse 2", bars: 16, type: "verse", description: "Drum variation, maintained energy." },
      { id: "6", name: "Chorus", bars: 8, type: "chorus", description: "Maximum impact." },
      { id: "7", name: "Bridge", bars: 8, type: "bridge", description: "Melodic shift, breakdown." },
      { id: "8", name: "Chorus", bars: 16, type: "chorus", description: "Final hook with ad-libs." },
      { id: "9", name: "Outro", bars: 4, type: "out", description: "Fade out or hard stop." }
    ]
  },
  {
    id: "edm_banger",
    label: "Club Banger (Build-Drop)",
    description: "High energy structure for EDM, Trap, and Dubstep.",
    tags: ["Club", "EDM", "High Energy"],
    sections: [
      { id: "1", name: "Intro", bars: 8, type: "intro", description: "DJ friendly intro, minimal drums." },
      { id: "2", name: "Breakdown", bars: 16, type: "verse", description: "Melodic motif, no heavy bass." },
      { id: "3", name: "Build Up", bars: 8, type: "build", description: "Snare rolls, risers, filter open." },
      { id: "4", name: "Drop", bars: 16, type: "drop", description: "Heavy bass, main lead, maximum volume." },
      { id: "5", name: "Verse 2", bars: 16, type: "verse", description: "Half-time feel, vocal chops." },
      { id: "6", name: "Build Up 2", bars: 8, type: "build", description: "More aggressive riser." },
      { id: "7", name: "Drop 2", bars: 16, type: "drop", description: "Variation of main drop." },
      { id: "8", name: "Outro", bars: 16, type: "out", description: "DJ friendly outro, drums only." }
    ]
  },
  {
    id: "storyteller",
    label: "Storyteller (Extended Verses)",
    description: "For lyric-heavy hip-hop or folk. Focus on the verses.",
    tags: ["Lyrical", "Hip-Hop", "Folk"],
    sections: [
      { id: "1", name: "Intro", bars: 4, type: "intro", description: "Simple loop, spoken word setup." },
      { id: "2", name: "Verse 1", bars: 24, type: "verse", description: "Long form storytelling." },
      { id: "3", name: "Chorus", bars: 8, type: "chorus", description: "Simple melodic anchor." },
      { id: "4", name: "Verse 2", bars: 24, type: "verse", description: "Continuation, slight drum build." },
      { id: "5", name: "Chorus", bars: 8, type: "chorus", description: "Full texture." },
      { id: "6", name: "Verse 3", bars: 24, type: "verse", description: "Climax of story." },
      { id: "7", name: "Outro", bars: 8, type: "out", description: "Beat ride out." }
    ]
  },
  {
    id: "viral_short",
    label: "Viral Short (Hook-First)",
    description: "Optimized for TikTok/Shorts. Hook plays immediately.",
    tags: ["Social", "Short", "Punchy"],
    sections: [
      { id: "1", name: "Hook", bars: 8, type: "chorus", description: "Immediate engagement, full energy." },
      { id: "2", name: "Verse", bars: 12, type: "verse", description: "Short context." },
      { id: "3", name: "Hook", bars: 8, type: "chorus", description: "Reprise." },
      { id: "4", name: "Outro", bars: 4, type: "out", description: "Quick fade." }
    ]
  },
  {
    id: "ambient_journey",
    label: "Ambient Journey (Slow Burn)",
    description: "For cinematic, lo-fi, or atmospheric tracks.",
    tags: ["Cinematic", "Ambient", "Slow"],
    sections: [
      { id: "1", name: "Intro", bars: 16, type: "intro", description: "Textures, noise floor, pads." },
      { id: "2", name: "Swell", bars: 8, type: "build", description: "Introduction of melodic elements." },
      { id: "3", name: "Main Theme", bars: 32, type: "verse", description: "Steady state flow." },
      { id: "4", name: "Break", bars: 8, type: "transition", description: "Strip back to silence." },
      { id: "5", name: "Theme Variation", bars: 32, type: "verse", description: "Added high frequency elements." },
      { id: "6", name: "Outro", bars: 24, type: "out", description: "Long decay to silence." }
    ]
  }
];

export const STRUCTURE_TOOLTIPS: Record<string, string> = {
  "Intro": "Sets the atmosphere. Low energy, establishes the spatial environment.",
  "Verse": "Storytelling section. Focused frequency range, vocals front and center.",
  "Chorus": "The Hook. Maximum stereo width, full frequency spectrum, high energy.",
  "Hook": "The earworm. Repetitive, catchy, high impact.",
  "Bridge": "Contrast section. Shifts in harmony or rhythm to break monotony.",
  "Pre-Chorus": "Ramping energy. Transition tension builder.",
  "Build": "Rising tension. Increasing frequency density.",
  "Drop": "Maximum impact. Heavy bass, driving rhythm.",
  "Outro": "Decompression. Fading energy to prevent abrupt cuts.",
  "Break": "Rhythmic pause. Strips back elements.",
  "Solo": "Instrumental focus. Vocals recede.",
  "Instrumental": "No vocals. Focus on beat and texture.",
  "Transition": "FX heavy section to glue parts together."
};
