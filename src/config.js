// Birthday Configuration for Thamil
export const WISH_CONFIG = {
  name: "Thamil",
  from: "Thujeeban",
  age: 25,
  avatar: "/photos/img_01.jpeg", // Hero Star Avatar Portrait
  intro: "Someone special has a surprise for you…",

  // 1. Core Memories Gallery & Reel (Photos + Videos)
  // Displayed right after the gift box opens
  memories: [
    { type: "image", src: "/photos/img_02.jpeg", title: "Unforgettable Moments ✨", text: "Every smile and memory we share is pure treasure.", date: "Special Times" },
    { type: "video", src: "/photos/video_01.mp4", title: "Laughs & Joy 😂", text: "The kind of laughter that makes your stomach hurt!", date: "Pure Fun" },
    { type: "image", src: "/photos/img_03.jpeg", title: "Your Radiant Smile 🌟", text: "Lighting up every moment with genuine warmth.", date: "Precious" },
    { type: "video", src: "/photos/video_02.mp4", title: "Candid Vibes 🎥", text: "Caught in the best moments without even trying.", date: "Golden Hour" },
    { type: "image", src: "/photos/img_04.jpeg", title: "Adventures Together 💫", text: "Walking through memories that feel like yesterday.", date: "Memories" },
    { type: "video", src: "/photos/video_03.mp4", title: "Good Times & Vibes 🎶", text: "Moments filled with music and joy.", date: "Unmatched" },
    { type: "image", src: "/photos/img_05.jpeg", title: "Sweetest Memories 💖", text: "Always grateful for having you around.", date: "Cherished" },
    { type: "video", src: "/photos/video_04.mp4", title: "Celebration Spirit 🎉", text: "Energy and happiness all around!", date: "Party Mode" },
    { type: "image", src: "/photos/img_06.jpeg", title: "That Special Day 🌸", text: "A day filled with colors, joy and fun.", date: "Day Out" },
    { type: "video", src: "/photos/video_05.mp4", title: "Little Things 🌈", text: "It's the smallest moments that mean the most.", date: "Heartfelt" },
    { type: "image", src: "/photos/img_07.jpeg", title: "Always Shining 👑", text: "Looking stunning as always!", date: "Star" },
    { type: "video", src: "/photos/video_06.mp4", title: "Behind The Scenes 🎬", text: "Unfiltered smiles and real happiness.", date: "Raw Moments" },
    { type: "image", src: "/photos/img_08.jpeg", title: "Best Days ☀️", text: "Days that we will talk about for years to come.", date: "Unreal" },
    { type: "video", src: "/photos/video_07.mp4", title: "Vibe Check Passed ✨", text: "Nothing but good energy and smiles.", date: "Favorite" },
    { type: "image", src: "/photos/img_09.jpeg", title: "Quiet & Peaceful 🕊️", text: "Moments of peace, connection and calm.", date: "Serene" }
  ],

  // 2. Birthday Cake Moments: Revealed with each candle blown (5 photos)
  cakePhotos: [
    { src: "/photos/img_10.jpeg", caption: "Candle 1: Radiant Energy 🔥" },
    { src: "/photos/img_11.jpeg", caption: "Candle 2: Endless Smiles 😄" },
    { src: "/photos/img_12.jpeg", caption: "Candle 3: Big Dreams Ahead 🌟" },
    { src: "/photos/img_13.jpeg", caption: "Candle 4: Pure Joy 💖" },
    { src: "/photos/img_14.jpeg", caption: "Candle 5: Wish Granted! 🌠" }
  ],

  // 3. Balloon Wishes: Each popped balloon reveals a personal wish with a photo! (6 photos)
  wishes: [
    { text: "May this year bring you everything your heart quietly hopes for 💛", img: "/photos/img_15.jpeg" },
    { text: "Wishing you endless laughter, zero stress, and boundless joy 😄", img: "/photos/img_16.jpeg" },
    { text: "May your dreams grow bigger and your worries disappear 🌟", img: "/photos/img_17.jpeg" },
    { text: "Here's to good health, great food, and even better days ahead 🍰", img: "/photos/img_18.jpeg" },
    { text: "Never stop shining with the bright, genuine spirit you have ✨", img: "/photos/img_19.jpeg" },
    { text: "Thank you for being exactly who you are — irreplaceable 🤍", img: "/photos/img_20.jpeg" }
  ],

  // 4. Love Letter: Pinned scrapbook photo strip beside handwritten letter (3 photos)
  letterPhotos: [
    "/photos/img_21.jpeg",
    "/photos/img_22.jpeg",
    "/photos/img_23.jpeg"
  ],

  letter:
    "On your special day, I just want you to know how deeply you are appreciated. " +
    "You make ordinary days extraordinary, bringing warmth, humor, and heart wherever you go. " +
    "Watching all these memories reminds me how blessed I am to share life's milestones with you. " +
    "May this 25th chapter be overflowing with peace, prosperity, and your fondest dreams coming true.",

  // 5. Scratch Card Surprise: Hidden surprise memory photo + gift message
  surpriseMedia: {
    type: "video",
    src: "/photos/video_08.mp4",
    poster: "/photos/img_24.jpeg",
    title: "🎁 Surprise Gift For You! 🎁",
    text: "Dinner on me this weekend at your favorite spot! ✨"
  },

  // 6. Grand Finale: Floating memory stream drifting upwards with fireworks (5 photos)
  finaleStream: [
    "/photos/img_25.jpeg",
    "/photos/img_26.jpeg",
    "/photos/img_27.jpeg",
    "/photos/img_28.jpeg",
    "/photos/img_29.jpeg"
  ]
};
