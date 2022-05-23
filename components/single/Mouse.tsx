import clsx from "clsx";
import { useEffect, useState } from "react";

const playMouseClick = () => {
  const sounds = ["one"];
  const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
  const fileName = `/sounds/keyboard/${randomSound}.mp3`;

  const audio = new Audio(fileName);
  audio.play();
};

export const Mouse = () => {
  const [leftClicked, setLeftClicked] = useState(false);
  const [rightClicked, setRightClicked] = useState(false);
  const mouseClick = (clicked: boolean, setClicked: (b: boolean) => void) => {
    playMouseClick();
    setClicked(true);
    setTimeout(() => setClicked(false), 100);
  };

  return (
    <div className="w-20 space-y-0.5">
      <div className="flex space-x-0.5">
        <button
          onClick={() => mouseClick(leftClicked, setLeftClicked)}
          className={clsx("h-8 w-10  rounded-tl-[100%]", {
            "bg-gray-700": !leftClicked,
            "bg-gray-500": leftClicked,
          })}
        ></button>
        <button
          onClick={() => mouseClick(rightClicked, setRightClicked)}
          className={clsx("h-8 w-10 rounded-tr-[100%]", {
            "bg-gray-700": !rightClicked,
            "bg-gray-500": rightClicked,
          })}
        ></button>
      </div>
      <div className="h-16 bg-gray-700 rounded-b-[50%]"></div>
    </div>
  );
};
