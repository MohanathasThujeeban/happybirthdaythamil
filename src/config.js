// Birthday Configuration
export const WISH_CONFIG = {
  name: "Thamil",
  from: "Thujeeban",
  age: 25,                       // set null to hide the age
  avatar: "/photos/avatar.jpg",  // birthday star portrait (place in public/photos/)
  intro: "Someone special has a surprise for you…",

  // Balloons: each one reveals a wish when popped
  wishes: [
    "May this year bring you everything your heart quietly hopes for 💛",
    "Wishing you endless laughter and zero stress 😄",
    "May your dreams grow bigger and your worries smaller 🌟",
    "Here's to good health, great food and better days 🍰",
    "Thank you for being exactly who you are 🤍"
  ],

  // Polaroid memories: add img: "/photos/1.jpg" (place pictures in public/photos/)
  memories: [
    { title: "That day we…", text: "Write a favourite memory here.", img: "/photos/1.jpg", date: "Best Day Ever" },
    { title: "You're the one who…", text: "Something you admire about them.", img: "/photos/2.jpg", date: "Unforgettable" },
    { title: "Inside joke", text: "Add a funny moment only you two know.", img: "/photos/3.jpg", date: "Pure Chaos 😂" }
  ],

  letter:
    "On your special day I just want you to know how much you mean to me. " +
    "You make ordinary days brighter, and I'm so grateful to have you in my life. " +
    "May this new year of yours be your best one yet.",

  surprise: "🎁 Your treat is on me — dinner this weekend! 🎁"
};
