"use client";

import { useEffect, useState } from "react";
import { cn } from "@/utils/style";
import { pickRandom } from "@/utils/array";

function playKeyPress() {
  const sounds = ["one", "two", "three", "four", "five", "six", "seven", "eight"];

  const randomSound = pickRandom(sounds);
  console.log(randomSound);
  const fileName = `/sounds/keyboard/${randomSound}.mp3`;

  const audio = new Audio(fileName);
  audio.play();
}

function Key({
  children,
  space = false,
  disabled = false,
}: {
  children?: string;
  space?: boolean;
  disabled?: boolean;
}) {
  const defaultBgClassName = "bg-[#000]";
  const [bgClassName, setBgClassName] = useState(defaultBgClassName);
  const colors = [
    "bg-blue-200 shadow-blue-200",
    "bg-red-200 shadow-red-200",
    "bg-green-200 shadow-green-200",
    "bg-yellow-200 shadow-yellow-200",
    "bg-orange-200 shadow-orange-200",
    "bg-purple-200 shadow-purple-200",
    "bg-amber-200 shadow-amber-200",
    "bg-lime-200 shadow-lime-200",
    "bg-sky-200 shadow-sky-200",
    "bg-indigo-200 shadow-indigo-200",
    "bg-violet-200 shadow-violet-200",
    "bg-pink-200 shadow-pink-200",
    "bg-rose-200 shadow-rose-200",
  ];

  const thisKeyPressed = () => {
    playKeyPress();
    setBgClassName(pickRandom(colors));
    setTimeout(() => {
      setBgClassName(defaultBgClassName);
    }, 170);
  };

  const onKeyPress = (e: any) => {
    const key = e.key as string;

    // Prevent space bar from scrolling down
    if (key === " " && e.target == document.body) {
      e.preventDefault();
    }

    if (key == " " && space) thisKeyPressed();
    if (key == children) thisKeyPressed();
  };

  useEffect(() => {
    if (!disabled) document.addEventListener("keypress", onKeyPress);
    return () => {
      if (!disabled) document.removeEventListener("keypress", onKeyPress);
    };
  }, []);

  return (
    <button
      onClick={thisKeyPressed}
      className={cn(
        bgClassName,
        "text-[#eee] capitalize shadow transition-all text-xs md:text-sm rounded-sm flex items-center justify-center font-system",
        "h-7 md:h-9",
        {
          "w-7 md:w-9": !space,
          "w-[10.25rem] md:w-[13.25rem]": space,
        }
      )}
    >
      {children}
    </button>
  );
}

export function Keyboard({ disabled = false }: { disabled?: boolean }) {
  const rows = ["1234567890".split(""), "qwertyuiop".split(""), "asdfghjkl;".split(""), "zxcvbnm,.".split("")];

  const rowClassName = "mx-auto flex justify-center space-x-1";

  return (
    <div className="inline-block p-4 rounded-xl bg-[#333] space-y-1">
      {rows.map((row, index) => (
        <div key={index} className={rowClassName}>
          {row.map((key, j) => {
            return (
              <Key key={j} disabled={disabled}>
                {key}
              </Key>
            );
          })}
        </div>
      ))}
      <div className={rowClassName}>
        <Key space disabled={disabled} />
      </div>
    </div>
  );
}
