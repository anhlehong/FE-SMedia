import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";

export default function EmojiComponent() {
  const [chosenEmoji, setChosenEmoji] = useState(null);

  const onEmojiClick = (emojiObject) => {
    setChosenEmoji(emojiObject);
  };

  return (
    <div>
      <h4>Chọn biểu tượng cảm xúc:</h4>
      <EmojiPicker onEmojiClick={onEmojiClick} />
      {chosenEmoji && <p>Biểu tượng đã chọn: {chosenEmoji.emoji}</p>}
    </div>
  );
}
