import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Smile,
  Sparkles,
  Coffee,
  Activity,
  Compass,
  Lightbulb,
  Clock,
  Heart,
  Flag,
  Delete,
} from 'lucide-react';

export interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  onBackspace?: () => void;
  title?: string;
  isReactionMode?: boolean;
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  emojis: { char: string; name: string }[];
}

const CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    name: 'Smileys & Emotion',
    icon: <Smile size={19} />,
    emojis: [
      { char: '😀', name: 'Grinning face' },
      { char: '😃', name: 'Grinning face with big eyes' },
      { char: '😄', name: 'Grinning face with smiling eyes' },
      { char: '😁', name: 'Beaming face with smiling eyes' },
      { char: '😆', name: 'Grinning squinting face' },
      { char: '😅', name: 'Grinning face with sweat' },
      { char: '🤣', name: 'Rolling on the floor laughing' },
      { char: '😂', name: 'Face with tears of joy' },
      { char: '🙂', name: 'Slightly smiling face' },
      { char: '🙃', name: 'Upside-down face' },
      { char: '😉', name: 'Winking face' },
      { char: '😊', name: 'Smiling face with smiling eyes' },
      { char: '😇', name: 'Smiling face with halo' },
      { char: '🥰', name: 'Smiling face with hearts' },
      { char: '😍', name: 'Heart eyes' },
      { char: '🤩', name: 'Star-struck' },
      { char: '😘', name: 'Face blowing a kiss' },
      { char: '😗', name: 'Kissing face' },
      { char: '😚', name: 'Kissing face with closed eyes' },
      { char: '😙', name: 'Kissing face with smiling eyes' },
      { char: '😋', name: 'Face savoring food' },
      { char: '😛', name: 'Face with tongue' },
      { char: '😜', name: 'Winking face with tongue' },
      { char: '🤪', name: 'Zany face' },
      { char: '😝', name: 'Squinting face with tongue' },
      { char: '🤑', name: 'Money-mouth face' },
      { char: '🤗', name: 'Hugging face' },
      { char: '🤭', name: 'Face with hand over mouth' },
      { char: '🤫', name: 'Shushing face' },
      { char: '🤔', name: 'Thinking face' },
      { char: '🤐', name: 'Zipper-mouth face' },
      { char: '🤨', name: 'Face with raised eyebrow' },
      { char: '😐', name: 'Neutral face' },
      { char: '😑', name: 'Expressionless face' },
      { char: '😶', name: 'Face without mouth' },
      { char: '😏', name: 'Smirking face' },
      { char: '😒', name: 'Unamused face' },
      { char: '🙄', name: 'Face with rolling eyes' },
      { char: '😬', name: 'Grimacing face' },
      { char: '🤥', name: 'Lying face' },
      { char: '😌', name: 'Relieved face' },
      { char: '😔', name: 'Pensive face' },
      { char: '😪', name: 'Sleepy face' },
      { char: '🤤', name: 'Drooling face' },
      { char: '😴', name: 'Sleeping face' },
      { char: '😷', name: 'Face with medical mask' },
      { char: '🤒', name: 'Face with thermometer' },
      { char: '🤕', name: 'Face with head-bandage' },
      { char: '🤢', name: 'Nauseated face' },
      { char: '🤮', name: 'Face vomiting' },
      { char: '🤧', name: 'Sneezing face' },
      { char: '🥵', name: 'Hot face' },
      { char: '🥶', name: 'Cold face' },
      { char: '🥴', name: 'Woozy face' },
      { char: '😵', name: 'Knocked-out face' },
      { char: '🤯', name: 'Exploding head' },
      { char: '🤠', name: 'Cowboy hat face' },
      { char: '🥳', name: 'Partying face' },
      { char: '🥸', name: 'Disguised face' },
      { char: '😎', name: 'Smiling face with sunglasses' },
      { char: '🤓', name: 'Nerd face' },
      { char: '🧐', name: 'Face with monocle' },
      { char: '😕', name: 'Confused face' },
      { char: '😟', name: 'Worried face' },
      { char: '🙁', name: 'Slightly frowning face' },
      { char: '😮', name: 'Face with open mouth' },
      { char: '😯', name: 'Hushed face' },
      { char: '😲', name: 'Astonished face' },
      { char: '😳', name: 'Flushed face' },
      { char: '🥺', name: 'Pleading face' },
      { char: '😦', name: 'Frowning face with open mouth' },
      { char: '😧', name: 'Anguished face' },
      { char: '😨', name: 'Fearful face' },
      { char: '😰', name: 'Anxious face with sweat' },
      { char: '😥', name: 'Sad but relieved face' },
      { char: '😢', name: 'Crying face' },
      { char: '😭', name: 'Loudly crying face' },
      { char: '😱', name: 'Face screaming in fear' },
      { char: '😖', name: 'Confounded face' },
      { char: '😣', name: 'Persevering face' },
      { char: '😞', name: 'Disappointed face' },
      { char: '😓', name: 'Downcast face with sweat' },
      { char: '😩', name: 'Weary face' },
      { char: '😫', name: 'Tired face' },
      { char: '🥱', name: 'Yawning face' },
      { char: '😤', name: 'Face with steam from nose' },
      { char: '😡', name: 'Pouting face' },
      { char: '😠', name: 'Angry face' },
      { char: '🤬', name: 'Face with symbols on mouth' },
      { char: '😈', name: 'Smiling face with horns' },
      { char: '👿', name: 'Angry face with horns' },
      { char: '💀', name: 'Skull' },
      { char: '☠️', name: 'Skull and crossbones' },
      { char: '💩', name: 'Pile of poo' },
      { char: '🤡', name: 'Clown face' },
      { char: '👻', name: 'Ghost' },
      { char: '👽', name: 'Alien' },
      { char: '🤖', name: 'Robot face' },
    ],
  },
  {
    id: 'people',
    name: 'People & Gestures',
    icon: <Sparkles size={19} />,
    emojis: [
      { char: '👋', name: 'Waving hand' },
      { char: '🤚', name: 'Raised back of hand' },
      { char: '🖐️', name: 'Hand with fingers splayed' },
      { char: '✋', name: 'Raised hand' },
      { char: '🖖', name: 'Vulcan salute' },
      { char: '👌', name: 'OK hand' },
      { char: '🤌', name: 'Pinched fingers' },
      { char: '🤏', name: 'Pinching hand' },
      { char: '✌️', name: 'Victory hand' },
      { char: '🤞', name: 'Crossed fingers' },
      { char: '🫰', name: 'Hand with index finger and thumb crossed' },
      { char: '🤟', name: 'Love-you gesture' },
      { char: '🤘', name: 'Sign of the horns' },
      { char: '🤙', name: 'Call me hand' },
      { char: '👈', name: 'Backhand index pointing left' },
      { char: '👉', name: 'Backhand index pointing right' },
      { char: '👆', name: 'Backhand index pointing up' },
      { char: '👇', name: 'Backhand index pointing down' },
      { char: '☝️', name: 'Index pointing up' },
      { char: '👍', name: 'Thumbs up' },
      { char: '👎', name: 'Thumbs down' },
      { char: '✊', name: 'Raised fist' },
      { char: '👊', name: 'Oncoming fist' },
      { char: '🤛', name: 'Left-facing fist' },
      { char: '🤜', name: 'Right-facing fist' },
      { char: '👏', name: 'Clapping hands' },
      { char: '🙌', name: 'Raising hands' },
      { char: '👐', name: 'Open hands' },
      { char: '🤲', name: 'Palms up together' },
      { char: '🤝', name: 'Handshake' },
      { char: '🙏', name: 'Folded hands' },
      { char: '✍️', name: 'Writing hand' },
      { char: '💅', name: 'Nail polish' },
      { char: '🤳', name: 'Selfie' },
      { char: '💪', name: 'Flexed biceps' },
      { char: '🧠', name: 'Brain' },
      { char: '🫀', name: 'Anatomical heart' },
      { char: '🫁', name: 'Lungs' },
      { char: '👀', name: 'Eyes' },
      { char: '👁️', name: 'Eye' },
      { char: '👅', name: 'Tongue' },
      { char: '👄', name: 'Mouth' },
      { char: '💋', name: 'Kiss mark' },
      { char: '🫂', name: 'People hugging' },
      { char: '👶', name: 'Baby' },
      { char: '👧', name: 'Girl' },
      { char: '👦', name: 'Boy' },
      { char: '👩', name: 'Woman' },
      { char: '👨', name: 'Man' },
      { char: '🧑', name: 'Person' },
      { char: '👱‍♀️', name: 'Blond woman' },
      { char: '👱‍♂️', name: 'Blond man' },
      { char: '🧔', name: 'Bearded person' },
      { char: '👵', name: 'Old woman' },
      { char: '👴', name: 'Old man' },
      { char: '💃', name: 'Woman dancing' },
      { char: '🕺', name: 'Man dancing' },
      { char: '🏃‍♀️', name: 'Woman running' },
      { char: '🏃‍♂️', name: 'Man running' },
    ],
  },
  {
    id: 'animals',
    name: 'Animals & Nature',
    icon: <Compass size={19} />,
    emojis: [
      { char: '🐶', name: 'Dog face' },
      { char: '🐱', name: 'Cat face' },
      { char: '🐭', name: 'Mouse face' },
      { char: '🐹', name: 'Hamster' },
      { char: '🐰', name: 'Rabbit face' },
      { char: '🦊', name: 'Fox' },
      { char: '🐻', name: 'Bear' },
      { char: '🐼', name: 'Panda' },
      { char: '🐨', name: 'Koala' },
      { char: '🐯', name: 'Tiger face' },
      { char: '🦁', name: 'Lion' },
      { char: '🐮', name: 'Cow face' },
      { char: '🐷', name: 'Pig face' },
      { char: '🐸', name: 'Frog' },
      { char: '🐵', name: 'Monkey face' },
      { char: '🙈', name: 'See-no-evil monkey' },
      { char: '🙉', name: 'Hear-no-evil monkey' },
      { char: '🙊', name: 'Speak-no-evil monkey' },
      { char: '🐔', name: 'Chicken' },
      { char: '🐧', name: 'Penguin' },
      { char: '🐦', name: 'Bird' },
      { char: '🐤', name: 'Baby chick' },
      { char: '🦆', name: 'Duck' },
      { char: '🦅', name: 'Eagle' },
      { char: '🦉', name: 'Owl' },
      { char: '🦇', name: 'Bat' },
      { char: '🐺', name: 'Wolf' },
      { char: '🐗', name: 'Boar' },
      { char: '🐴', name: 'Horse face' },
      { char: '🦄', name: 'Unicorn' },
      { char: '🐝', name: 'Honeybee' },
      { char: '🐛', name: 'Bug' },
      { char: '🦋', name: 'Butterfly' },
      { char: '🐌', name: 'Snail' },
      { char: '🐞', name: 'Lady beetle' },
      { char: '🐜', name: 'Ant' },
      { char: '🦟', name: 'Mosquito' },
      { char: '🐢', name: 'Turtle' },
      { char: '🐍', name: 'Snake' },
      { char: '🦎', name: 'Lizard' },
      { char: '🐙', name: 'Octopus' },
      { char: '🦑', name: 'Squid' },
      { char: '🦐', name: 'Shrimp' },
      { char: '🦀', name: 'Crab' },
      { char: '🐡', name: 'Blowfish' },
      { char: '🐠', name: 'Tropical fish' },
      { char: '🐟', name: 'Fish' },
      { char: '🐬', name: 'Dolphin' },
      { char: '🐳', name: 'Spouting whale' },
      { char: '🦈', name: 'Shark' },
      { char: '🐊', name: 'Crocodile' },
      { char: '🐆', name: 'Leopard' },
      { char: '🦓', name: 'Zebra' },
      { char: '🦍', name: 'Gorilla' },
      { char: '🐘', name: 'Elephant' },
      { char: '🦛', name: 'Hippopotamus' },
      { char: '🦏', name: 'Rhinoceros' },
      { char: '🐪', name: 'Camel' },
      { char: '🦒', name: 'Giraffe' },
      { char: '🦘', name: 'Kangaroo' },
      { char: '🌹', name: 'Rose' },
      { char: '🌸', name: 'Cherry blossom' },
      { char: '🌺', name: 'Hibiscus' },
      { char: '🌻', name: 'Sunflower' },
      { char: '🌼', name: 'Blossom' },
      { char: '🌷', name: 'Tulip' },
      { char: '🌱', name: 'Seedling' },
      { char: '🌲', name: 'Evergreen tree' },
      { char: '🌳', name: 'Deciduous tree' },
      { char: '🌴', name: 'Palm tree' },
      { char: '🌵', name: 'Cactus' },
      { char: '🌾', name: 'Sheaf of rice' },
      { char: '🌿', name: 'Herb' },
      { char: '☘️', name: 'Shamrock' },
      { char: '🍀', name: 'Four leaf clover' },
      { char: '🍁', name: 'Maple leaf' },
      { char: '🍂', name: 'Fallen leaf' },
      { char: '🍃', name: 'Leaf fluttering in wind' },
      { char: '🍄', name: 'Mushroom' },
    ],
  },
  {
    id: 'food',
    name: 'Food & Drink',
    icon: <Coffee size={19} />,
    emojis: [
      { char: '☕', name: 'Hot beverage / Coffee' },
      { char: '🍵', name: 'Teacup without handle' },
      { char: '🧋', name: 'Bubble tea' },
      { char: '🥤', name: 'Cup with straw' },
      { char: '🍺', name: 'Beer mug' },
      { char: '🍻', name: 'Clinking beer mugs' },
      { char: '🍷', name: 'Wine glass' },
      { char: '🍸', name: 'Cocktail glass' },
      { char: '🍹', name: 'Tropical drink' },
      { char: '🍾', name: 'Bottle with popping cork' },
      { char: '🍕', name: 'Pizza' },
      { char: '🍔', name: 'Hamburger' },
      { char: '🍟', name: 'French fries' },
      { char: '🌭', name: 'Hot dog' },
      { char: '🥪', name: 'Sandwich' },
      { char: '🌮', name: 'Taco' },
      { char: '🌯', name: 'Burrito' },
      { char: '🥙', name: 'Stuffed flatbread' },
      { char: '🧆', name: 'Falafel' },
      { char: '🍜', name: 'Steaming bowl / Ramen' },
      { char: '🍝', name: 'Spaghetti' },
      { char: '🍣', name: 'Sushi' },
      { char: '🍱', name: 'Bento box' },
      { char: '🥟', name: 'Dumpling' },
      { char: '🍚', name: 'Cooked rice' },
      { char: '🍛', name: 'Curry rice' },
      { char: '🥗', name: 'Green salad' },
      { char: '🥑', name: 'Avocado' },
      { char: '🍎', name: 'Red apple' },
      { char: '🍏', name: 'Green apple' },
      { char: '🍐', name: 'Pear' },
      { char: '🍊', name: 'Tangerine' },
      { char: '🍋', name: 'Lemon' },
      { char: '🍌', name: 'Banana' },
      { char: '🍉', name: 'Watermelon' },
      { char: '🍇', name: 'Grapes' },
      { char: '🍓', name: 'Strawberry' },
      { char: '🫐', name: 'Blueberries' },
      { char: '🍈', name: 'Melon' },
      { char: '🍒', name: 'Cherries' },
      { char: '🍑', name: 'Peach' },
      { char: '🥭', name: 'Mango' },
      { char: '🍍', name: 'Pineapple' },
      { char: '🥥', name: 'Coconut' },
      { char: '🥝', name: 'Kiwi fruit' },
      { char: '🎂', name: 'Birthday cake' },
      { char: '🍰', name: 'Shortcake' },
      { char: '🧁', name: 'Cupcake' },
      { char: '🥧', name: 'Pie' },
      { char: '🍫', name: 'Chocolate bar' },
      { char: '🍬', name: 'Candy' },
      { char: '🍭', name: 'Lollipop' },
      { char: '🍮', name: 'Custard' },
      { char: '🍩', name: 'Doughnut' },
      { char: '🍪', name: 'Cookie' },
      { char: '🍿', name: 'Popcorn' },
      { char: '🥐', name: 'Croissant' },
      { char: '🥞', name: 'Pancakes' },
      { char: '🧇', name: 'Waffle' },
      { char: '🥨', name: 'Pretzel' },
      { char: '🧀', name: 'Cheese wedge' },
    ],
  },
  {
    id: 'activity',
    name: 'Activity & Sports',
    icon: <Activity size={19} />,
    emojis: [
      { char: '⚽', name: 'Soccer ball' },
      { char: '🏀', name: 'Basketball' },
      { char: '🏈', name: 'American football' },
      { char: '⚾', name: 'Baseball' },
      { char: '🥎', name: 'Softball' },
      { char: '🎾', name: 'Tennis' },
      { char: '🏐', name: 'Volleyball' },
      { char: '🏉', name: 'Rugby football' },
      { char: '🥏', name: 'Flying disc' },
      { char: '🎱', name: 'Pool 8 ball' },
      { char: '🏓', name: 'Ping pong' },
      { char: '🏸', name: 'Badminton' },
      { char: '🥊', name: 'Boxing glove' },
      { char: '🥋', name: 'Martial arts uniform' },
      { char: '🏆', name: 'Trophy' },
      { char: '🥇', name: '1st place medal' },
      { char: '🥈', name: '2nd place medal' },
      { char: '🥉', name: '3rd place medal' },
      { char: '🏅', name: 'Sports medal' },
      { char: '🎖️', name: 'Military medal' },
      { char: '🎫', name: 'Ticket' },
      { char: '🎟️', name: 'Admission tickets' },
      { char: '🎪', name: 'Circus tent' },
      { char: '🤹', name: 'Person juggling' },
      { char: '🎭', name: 'Performing arts' },
      { char: '🎨', name: 'Artist palette' },
      { char: '🎬', name: 'Clapper board' },
      { char: '🎤', name: 'Microphone' },
      { char: '🎧', name: 'Headphone' },
      { char: '🎼', name: 'Musical score' },
      { char: '🎹', name: 'Musical keyboard' },
      { char: '🥁', name: 'Drum' },
      { char: '🎷', name: 'Saxophone' },
      { char: '🎺', name: 'Trumpet' },
      { char: '🎸', name: 'Guitar' },
      { char: '🎻', name: 'Violin' },
      { char: '🎲', name: 'Game die' },
      { char: '♟️', name: 'Chess pawn' },
      { char: '🎯', name: 'Bullseye' },
      { char: '🎳', name: 'Bowling' },
      { char: '🎮', name: 'Video game controller' },
      { char: '🎰', name: 'Slot machine' },
      { char: '🧩', name: 'Puzzle piece' },
      { char: '🛹', name: 'Skateboard' },
      { char: '🛼', name: 'Roller skate' },
      { char: '🎿', name: 'Skis' },
      { char: '🛷', name: 'Sled' },
      { char: '🥌', name: 'Curling stone' },
    ],
  },
  {
    id: 'travel',
    name: 'Travel & Places',
    icon: <Compass size={19} />,
    emojis: [
      { char: '🚗', name: 'Automobile' },
      { char: '🚕', name: 'Taxi' },
      { char: '🚙', name: 'Sport utility vehicle' },
      { char: '🚌', name: 'Bus' },
      { char: '🚎', name: 'Trolleybus' },
      { char: '🏎️', name: 'Racing car' },
      { char: '🚓', name: 'Police car' },
      { char: '🚑', name: 'Ambulance' },
      { char: '🚒', name: 'Fire engine' },
      { char: '🚐', name: 'Minibus' },
      { char: '🛻', name: 'Pickup truck' },
      { char: '🚚', name: 'Delivery truck' },
      { char: '🚛', name: 'Articulated lorry' },
      { char: '🚜', name: 'Tractor' },
      { char: '🦯', name: 'White cane' },
      { char: '🦽', name: 'Manual wheelchair' },
      { char: '🦼', name: 'Motorized wheelchair' },
      { char: '🛴', name: 'Kick scooter' },
      { char: '🚲', name: 'Bicycle' },
      { char: '🛵', name: 'Motor scooter' },
      { char: '🏍️', name: 'Motorcycle' },
      { char: '🛺', name: 'Auto rickshaw' },
      { char: '🚨', name: 'Police car light' },
      { char: '✈️', name: 'Airplane' },
      { char: '🛫', name: 'Airplane departure' },
      { char: '🛬', name: 'Airplane arrival' },
      { char: '🚀', name: 'Rocket' },
      { char: '🛸', name: 'Flying saucer' },
      { char: '🚁', name: 'Helicopter' },
      { char: '🛶', name: 'Canoe' },
      { char: '⛵', name: 'Sailboat' },
      { char: '🚤', name: 'Speedboat' },
      { char: '🛳️', name: 'Passenger ship' },
      { char: '⛴️', name: 'Ferry' },
      { char: '🚢', name: 'Ship' },
      { char: '⚓', name: 'Anchor' },
      { char: '⛽', name: 'Fuel pump' },
      { char: '🏖️', name: 'Beach with umbrella' },
      { char: '🏝️', name: 'Desert island' },
      { char: '⛰️', name: 'Mountain' },
      { char: '🏔️', name: 'Snow-capped mountain' },
      { char: '🌋', name: 'Volcano' },
      { char: '🏕️', name: 'Camping' },
      { char: '🏜️', name: 'Desert' },
      { char: '🏛️', name: 'Classical building' },
      { char: '🏟️', name: 'Stadium' },
      { char: '🏠', name: 'House' },
      { char: '🏡', name: 'House with garden' },
      { char: '🏢', name: 'Office building' },
      { char: '🏬', name: 'Department store' },
      { char: '🏥', name: 'Hospital' },
      { char: '🏦', name: 'Bank' },
      { char: '🏨', name: 'Hotel' },
      { char: '🏫', name: 'School' },
      { char: '🏰', name: 'Castle' },
      { char: '🗼', name: 'Tokyo tower' },
      { char: '🗽', name: 'Statue of Liberty' },
    ],
  },
  {
    id: 'objects',
    name: 'Objects & Tools',
    icon: <Lightbulb size={19} />,
    emojis: [
      { char: '💡', name: 'Light bulb' },
      { char: '🔦', name: 'Flashlight' },
      { char: '🕯️', name: 'Candle' },
      { char: '📱', name: 'Mobile phone' },
      { char: '📲', name: 'Mobile phone with arrow' },
      { char: '💻', name: 'Laptop' },
      { char: '🖥️', name: 'Desktop computer' },
      { char: '🖨️', name: 'Printer' },
      { char: '⌨️', name: 'Keyboard' },
      { char: '🖱️', name: 'Computer mouse' },
      { char: '💾', name: 'Floppy disk' },
      { char: '💿', name: 'Optical disk' },
      { char: '📀', name: 'DVD' },
      { char: '📷', name: 'Camera' },
      { char: '📸', name: 'Camera with flash' },
      { char: '📹', name: 'Video camera' },
      { char: '📺', name: 'Television' },
      { char: '📻', name: 'Radio' },
      { char: '📼', name: 'Videocassette' },
      { char: '⌛', name: 'Hourglass done' },
      { char: '⏳', name: 'Hourglass not done' },
      { char: '⏰', name: 'Alarm clock' },
      { char: '⏱️', name: 'Stopwatch' },
      { char: '⏲️', name: 'Timer clock' },
      { char: '🕰️', name: 'Mantelpiece clock' },
      { char: '📡', name: 'Satellite antenna' },
      { char: '🔋', name: 'Battery' },
      { char: '🔌', name: 'Electric plug' },
      { char: '💰', name: 'Money bag' },
      { char: '🪙', name: 'Coin' },
      { char: '💵', name: 'Dollar banknote' },
      { char: '💳', name: 'Credit card' },
      { char: '💎', name: 'Gem stone' },
      { char: '⚖️', name: 'Balance scale' },
      { char: '🔧', name: 'Wrench' },
      { char: '🔨', name: 'Hammer' },
      { char: '⚒️', name: 'Hammer and pick' },
      { char: '🛠️', name: 'Hammer and wrench' },
      { char: '⛏️', name: 'Pick' },
      { char: '🔩', name: 'Nut and bolt' },
      { char: '⚙️', name: 'Gear' },
      { char: '🪛', name: 'Screwdriver' },
      { char: '🧱', name: 'Brick' },
      { char: '🧲', name: 'Magnet' },
      { char: '🔫', name: 'Water pistol' },
      { char: '💣', name: 'Bomb' },
      { char: '🧨', name: 'Firecracker' },
      { char: '🔪', name: 'Kitchen knife' },
      { char: '🗡️', name: 'Dagger' },
      { char: '⚔️', name: 'Crossed swords' },
      { char: '🛡️', name: 'Shield' },
      { char: '🔑', name: 'Key' },
      { char: '🗝️', name: 'Old key' },
      { char: '🔒', name: 'Locked' },
      { char: '🔓', name: 'Unlocked' },
      { char: '🔏', name: 'Locked with pen' },
      { char: '🔐', name: 'Locked with key' },
      { char: '🔔', name: 'Bell' },
      { char: '🔕', name: 'Bell with slash' },
      { char: '📦', name: 'Package' },
      { char: '📫', name: 'Closed mailbox with raised flag' },
      { char: '📬', name: 'Open mailbox with raised flag' },
      { char: '📭', name: 'Open mailbox with lowered flag' },
      { char: '📮', name: 'Postbox' },
      { char: '📝', name: 'Memo' },
      { char: '📄', name: 'Page facing up' },
      { char: '📃', name: 'Page with curl' },
      { char: '📑', name: 'Bookmark tabs' },
      { char: '📊', name: 'Bar chart' },
      { char: '📈', name: 'Chart increasing' },
      { char: '📉', name: 'Chart decreasing' },
      { char: '📜', name: 'Scroll' },
      { char: '📚', name: 'Books' },
      { char: '📖', name: 'Open book' },
      { char: '🔖', name: 'Bookmark' },
      { char: '🏷️', name: 'Label' },
      { char: '✉️', name: 'Envelope' },
      { char: '📩', name: 'Envelope with arrow' },
      { char: '📨', name: 'Incoming envelope' },
    ],
  },
  {
    id: 'symbols',
    name: 'Symbols & Hearts',
    icon: <Heart size={19} />,
    emojis: [
      { char: '❤️', name: 'Red heart' },
      { char: '🧡', name: 'Orange heart' },
      { char: '💛', name: 'Yellow heart' },
      { char: '💚', name: 'Green heart' },
      { char: '💙', name: 'Blue heart' },
      { char: '💜', name: 'Purple heart' },
      { char: '🖤', name: 'Black heart' },
      { char: '🤍', name: 'White heart' },
      { char: '🤎', name: 'Brown heart (HiveTalk signature)' },
      { char: '💔', name: 'Broken heart' },
      { char: '❣️', name: 'Heart exclamation' },
      { char: '💕', name: 'Two hearts' },
      { char: '💞', name: 'Revolving hearts' },
      { char: '💓', name: 'Beating heart' },
      { char: '💗', name: 'Growing heart' },
      { char: '💖', name: 'Sparkling heart' },
      { char: '💘', name: 'Heart with arrow' },
      { char: '💝', name: 'Heart with ribbon' },
      { char: '🔥', name: 'Fire' },
      { char: '✨', name: 'Sparkles' },
      { char: '🎉', name: 'Party popper' },
      { char: '🎊', name: 'Confetti ball' },
      { char: '🎈', name: 'Balloon' },
      { char: '💯', name: 'Hundred points' },
      { char: '💥', name: 'Collision' },
      { char: '💫', name: 'Dizzy star' },
      { char: '💬', name: 'Speech balloon' },
      { char: '👁️‍🗨️', name: 'Eye in speech bubble' },
      { char: '🗨️', name: 'Left speech bubble' },
      { char: '🗯️', name: 'Right anger bubble' },
      { char: '💭', name: 'Thought balloon' },
      { char: '💤', name: 'Zzz' },
      { char: '⭐', name: 'Star' },
      { char: '🌟', name: 'Glowing star' },
      { char: '⚡', name: 'High voltage' },
      { char: '🌈', name: 'Rainbow' },
      { char: '☀️', name: 'Sun' },
      { char: '🌤️', name: 'Sun behind small cloud' },
      { char: '⛅', name: 'Sun behind cloud' },
      { char: '🌥️', name: 'Sun behind large cloud' },
      { char: '☁️', name: 'Cloud' },
      { char: '🌦️', name: 'Sun behind rain cloud' },
      { char: '🌧️', name: 'Cloud with rain' },
      { char: '⛈️', name: 'Cloud with lightning and rain' },
      { char: '🌩️', name: 'Cloud with lightning' },
      { char: '🌨️', name: 'Cloud with snow' },
      { char: '❄️', name: 'Snowflake' },
      { char: '☃️', name: 'Snowman' },
      { char: '⛄', name: 'Snowman without snow' },
      { char: '🌬️', name: 'Wind face' },
      { char: '💨', name: 'Dashing away' },
      { char: '💧', name: 'Droplet' },
      { char: '💦', name: 'Sweat droplets' },
      { char: '☔', name: 'Umbrella with rain drops' },
      { char: '☂️', name: 'Umbrella' },
      { char: '🌊', name: 'Water wave' },
      { char: '✅', name: 'Check mark button' },
      { char: '❌', name: 'Cross mark' },
      { char: '❎', name: 'Cross mark button' },
      { char: '➕', name: 'Plus' },
      { char: '➖', name: 'Minus' },
      { char: '➗', name: 'Division' },
      { char: '✖️', name: 'Multiply' },
      { char: '♾️', name: 'Infinity' },
      { char: '‼️', name: 'Double exclamation mark' },
      { char: '⁉️', name: 'Exclamation question mark' },
      { char: '❓', name: 'Question mark' },
      { char: '❔', name: 'White question mark' },
      { char: '❕', name: 'White exclamation mark' },
      { char: '❗', name: 'Exclamation mark' },
      { char: '⚠️', name: 'Warning' },
      { char: '⛔', name: 'No entry' },
      { char: '🚫', name: 'Prohibited' },
      { char: '🛑', name: 'Stop sign' },
      { char: '🟢', name: 'Green circle' },
      { char: '🟡', name: 'Yellow circle' },
      { char: '🔴', name: 'Red circle' },
      { char: '🟣', name: 'Purple circle' },
      { char: '🟤', name: 'Brown circle' },
      { char: '⚫', name: 'Black circle' },
      { char: '⚪', name: 'White circle' },
      { char: '🟩', name: 'Green square' },
      { char: '🟨', name: 'Yellow square' },
      { char: '🟥', name: 'Red square' },
      { char: '🟦', name: 'Blue square' },
    ],
  },
  {
    id: 'flags',
    name: 'Flags',
    icon: <Flag size={19} />,
    emojis: [
      { char: '🚩', name: 'Triangular flag' },
      { char: '🏁', name: 'Chequered flag' },
      { char: '🎌', name: 'Crossed flags' },
      { char: '🏴', name: 'Black flag' },
      { char: '🏳️', name: 'White flag' },
      { char: '🏳️‍🌈', name: 'Rainbow flag' },
      { char: '🏳️‍⚧️', name: 'Transgender flag' },
      { char: '🏴‍☠️', name: 'Pirate flag' },
      { char: '🇺🇸', name: 'Flag: United States' },
      { char: '🇬🇧', name: 'Flag: United Kingdom' },
      { char: '🇨🇦', name: 'Flag: Canada' },
      { char: '🇦🇺', name: 'Flag: Australia' },
      { char: '🇩🇪', name: 'Flag: Germany' },
      { char: '🇫🇷', name: 'Flag: France' },
      { char: '🇮🇹', name: 'Flag: Italy' },
      { char: '🇪🇸', name: 'Flag: Spain' },
      { char: '🇧🇷', name: 'Flag: Brazil' },
      { char: '🇲🇽', name: 'Flag: Mexico' },
      { char: '🇮🇳', name: 'Flag: India' },
      { char: '🇯🇵', name: 'Flag: Japan' },
      { char: '🇰🇷', name: 'Flag: South Korea' },
      { char: '🇨🇳', name: 'Flag: China' },
      { char: '🇷🇺', name: 'Flag: Russia' },
      { char: '🇳🇱', name: 'Flag: Netherlands' },
      { char: '🇸🇪', name: 'Flag: Sweden' },
      { char: '🇨🇭', name: 'Flag: Switzerland' },
      { char: '🇦🇪', name: 'Flag: United Arab Emirates' },
      { char: '🇸🇦', name: 'Flag: Saudi Arabia' },
      { char: '🇿🇦', name: 'Flag: South Africa' },
      { char: '🇳🇬', name: 'Flag: Nigeria' },
    ],
  },
];

const DEFAULT_RECENTS = [
  { char: '😂', name: 'Face with tears of joy' },
  { char: '❤️', name: 'Red heart' },
  { char: '👍', name: 'Thumbs up' },
  { char: '🔥', name: 'Fire' },
  { char: '🎉', name: 'Party popper' },
  { char: '🙏', name: 'Folded hands' },
  { char: '😍', name: 'Heart eyes' },
  { char: '😊', name: 'Smiling face' },
  { char: '✨', name: 'Sparkles' },
  { char: '👏', name: 'Clapping hands' },
  { char: '💯', name: 'Hundred points' },
  { char: '🥳', name: 'Partying face' },
  { char: '😎', name: 'Cool sunglasses' },
  { char: '🥰', name: 'Smiling face with hearts' },
  { char: '🤣', name: 'Rolling on the floor laughing' },
  { char: '🥺', name: 'Pleading face' },
];

const RECENT_STORAGE_KEY = 'hivetalk_recent_emojis_v2';

export function EmojiPicker({
  isOpen,
  onClose,
  onSelect,
  onBackspace,
  title = 'Emojis',
  isReactionMode = false,
}: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>('smileys');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredEmoji, setHoveredEmoji] = useState<{ char: string; name: string } | null>(null);

  const [recentEmojis, setRecentEmojis] = useState<{ char: string; name: string }[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_RECENTS;
  });

  const pickerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      window.addEventListener('mousedown', handleClickOutside);
    }, 20);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Click on category tab scrolls directly to that section
  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    setSearchQuery('');
    const targetElement = categoryRefs.current[catId];
    if (targetElement && scrollContainerRef.current) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectEmoji = (char: string, name: string) => {
    try {
      const stored = localStorage.getItem(RECENT_STORAGE_KEY);
      const prevList = stored ? JSON.parse(stored) : DEFAULT_RECENTS;
      const filtered = Array.isArray(prevList) ? prevList.filter((item: any) => item.char !== char) : [];
      const updated = [{ char, name }, ...filtered].slice(0, 32);
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    onSelect(char);

    // If reaction mode (e.g. from message bubble reaction picker), close after 1 tap
    if (isReactionMode) {
      onClose();
    }
  };

  // Search filter
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matches: { char: string; name: string }[] = [];
    const seen = new Set<string>();

    for (const cat of CATEGORIES) {
      for (const item of cat.emojis) {
        if (!seen.has(item.char) && (item.name.toLowerCase().includes(q) || item.char === q)) {
          seen.add(item.char);
          matches.push(item);
        }
      }
    }
    return matches;
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <>
      {isReactionMode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(2px)',
            zIndex: 9998,
          }}
          onClick={onClose}
        />
      )}
      <div
        ref={pickerRef}
        className="whatsapp-emoji-drawer animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={
          isReactionMode
            ? {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(440px, calc(100vw - 32px))',
                height: '440px',
                maxHeight: '82vh',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--color-border, #E5E7EB)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 9999,
                overflow: 'hidden',
                fontFamily: 'var(--font-sans, system-ui, sans-serif)',
              }
            : {
                position: 'absolute',
                bottom: 'calc(100% + 10px)',
                left: '8px',
                width: 'min(440px, calc(100vw - 20px))',
                height: '420px',
                maxHeight: 'min(500px, 68vh)',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 16px 40px rgba(45, 31, 23, 0.22), 0 3px 8px rgba(0, 0, 0, 0.08)',
                border: '1px solid var(--color-border, #E5E7EB)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                overflow: 'hidden',
                fontFamily: 'var(--font-sans, system-ui, sans-serif)',
              }
        }
      >
      {/* 1. TOP HEADER & SEARCH BAR (WHATSAPP WEB STYLE) */}
      <div
        style={{
          padding: '10px 14px 8px',
          borderBottom: '1px solid #F3F4F6',
          backgroundColor: '#FAFAFA',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1F2937' }}>
              {title}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                backgroundColor: 'rgba(139, 94, 60, 0.1)',
                color: 'var(--color-brand-primary, #8B5E3C)',
                padding: '2px 6px',
                borderRadius: '10px',
                fontWeight: 600,
              }}
            >
              WhatsApp Style
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onBackspace && !isReactionMode && (
              <button
                type="button"
                onClick={onBackspace}
                title="Backspace (delete last character)"
                style={{
                  background: '#F3F4F6',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  color: '#4B5563',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                <Delete size={15} />
                <span>⌫</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              title="Close"
              style={{
                background: 'none',
                border: 'none',
                color: '#9CA3AF',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search input with instant clear */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: '9999px',
            border: '1px solid #E5E7EB',
            padding: '5px 12px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <Search size={15} style={{ color: '#9CA3AF', marginRight: '8px', flexShrink: 0 }} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search emoji (e.g. smile, heart, fire)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '0.85rem',
              color: '#1F2937',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#9CA3AF',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Top Category Shortcut Pills Bar (WhatsApp-style easy switching) */}
        {!searchQuery && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              paddingTop: '4px',
              paddingBottom: '2px',
              scrollbarWidth: 'none',
            }}
          >
            <button
              type="button"
              title="Frequently Used"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => scrollToCategory('recent')}
              style={{
                background: activeCategory === 'recent' ? 'var(--color-brand-primary, #8B5E3C)' : '#F3F4F6',
                color: activeCategory === 'recent' ? '#FFFFFF' : '#4B5563',
                border: 'none',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <Clock size={12} />
              <span>Recent</span>
            </button>

            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const sampleChar = cat.emojis[0]?.char || '';
              return (
                <button
                  key={`top-tab-${cat.id}`}
                  type="button"
                  title={cat.name}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => scrollToCategory(cat.id)}
                  style={{
                    background: isActive ? 'var(--color-brand-primary, #8B5E3C)' : '#F3F4F6',
                    color: isActive ? '#FFFFFF' : '#4B5563',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '4px 10px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{sampleChar}</span>
                  <span>{cat.name.split('&')[0].trim()}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. MAIN SCROLLABLE EMOJI BODY (ALL CATEGORIES STACKED SEQUENTIALLY) */}
      <div
        ref={scrollContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 14px',
          scrollBehavior: 'smooth',
        }}
      >
        {searchQuery ? (
          <div>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#6B7280',
                textTransform: 'uppercase',
                marginBottom: '8px',
                letterSpacing: '0.04em',
              }}
            >
              Search Results ({searchResults?.length || 0})
            </div>
            {searchResults && searchResults.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 1fr)',
                  gap: '4px',
                }}
              >
                {searchResults.map((item, idx) => (
                  <button
                    key={`search-${item.char}-${idx}`}
                    type="button"
                    title={item.name}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectEmoji(item.char, item.name)}
                    onMouseEnter={() => setHoveredEmoji(item)}
                    onMouseLeave={() => setHoveredEmoji(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.45rem',
                      padding: '6px 2px',
                      borderRadius: '8px',
                      transition: 'transform 0.1s ease, background 0.1s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none',
                    }}
                    onFocus={() => setHoveredEmoji(item)}
                  >
                    {item.char}
                  </button>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 10px',
                  color: '#9CA3AF',
                  fontSize: '0.88rem',
                }}
              >
                No emojis matching "{searchQuery}"
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* 1. FREQUENTLY USED SECTION */}
            {recentEmojis.length > 0 && (
              <div
                ref={(el) => (categoryRefs.current['recent'] = el)}
                style={{ marginBottom: '16px' }}
              >
                <div
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: 'var(--color-brand-primary, #8B5E3C)',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    letterSpacing: '0.04em',
                  }}
                >
                  <Clock size={13} />
                  <span>Frequently Used</span>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gap: '4px',
                  }}
                >
                  {recentEmojis.map((item, idx) => (
                    <button
                      key={`recent-${item.char}-${idx}`}
                      type="button"
                      title={item.name}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectEmoji(item.char, item.name)}
                      onMouseEnter={() => setHoveredEmoji(item)}
                      onMouseLeave={() => setHoveredEmoji(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.45rem',
                        padding: '6px 2px',
                        borderRadius: '8px',
                        transition: 'transform 0.1s ease, background 0.1s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        userSelect: 'none',
                      }}
                    >
                      {item.char}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. ALL OFFICIAL CATEGORIES IN CONTINUOUS SEQUENCE (WHATSAPP-STYLE) */}
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                ref={(el) => (categoryRefs.current[cat.id] = el)}
                style={{ marginBottom: '18px' }}
              >
                <div
                  style={{
                    position: 'sticky',
                    top: '-10px',
                    zIndex: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(4px)',
                    padding: '4px 0',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#4B5563',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid #F3F4F6',
                  }}
                >
                  {cat.name}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gap: '4px',
                  }}
                >
                  {cat.emojis.map((item) => (
                    <button
                      key={item.char}
                      type="button"
                      title={item.name}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectEmoji(item.char, item.name)}
                      onMouseEnter={() => setHoveredEmoji(item)}
                      onMouseLeave={() => setHoveredEmoji(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.45rem',
                        padding: '6px 2px',
                        borderRadius: '8px',
                        transition: 'transform 0.1s ease, background 0.1s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        userSelect: 'none',
                      }}
                    >
                      {item.char}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. HOVER PREVIEW BAR (LIKE WHATSAPP WEB) */}
      <div
        style={{
          padding: '6px 14px',
          backgroundColor: '#FAFAFA',
          borderTop: '1px solid #F3F4F6',
          minHeight: '34px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {hoveredEmoji ? (
          <>
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{hoveredEmoji.char}</span>
            <span
              style={{
                fontSize: '0.82rem',
                color: '#374151',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {hoveredEmoji.name}
            </span>
          </>
        ) : (
          <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
            Click emojis to insert into your message. Type or backspace anytime.
          </span>
        )}
      </div>

      {/* 4. BOTTOM CATEGORY NAVIGATION TAB BAR (WHATSAPP-STYLE) */}
      {!searchQuery && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 8px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E5E7EB',
          }}
        >
          {/* Recent Tab */}
          <button
            type="button"
            title="Frequently Used"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => scrollToCategory('recent')}
            style={{
              background: activeCategory === 'recent' ? '#EFEBE9' : 'transparent',
              color: activeCategory === 'recent' ? 'var(--color-brand-primary, #8B5E3C)' : '#6B7280',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <Clock size={18} />
          </button>

          {/* All other category tabs */}
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                title={cat.name}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => scrollToCategory(cat.id)}
                style={{
                  background: isActive ? '#EFEBE9' : 'transparent',
                  color: isActive ? 'var(--color-brand-primary, #8B5E3C)' : '#6B7280',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.icon}
              </button>
            );
          })}
        </div>
      )}
    </div>
  </>
  );
}
