import clsx from "clsx";

interface Message {
  me: boolean;
  text: string;
  replyTo?: string;
}

interface Props {
  messages: Message[];
}

export const Chat = ({ messages }: Props) => {
  return (
    <>
      <div className="space-y-xs">
        {messages.map((message, index) => (
          <div
            key={index}
            className={clsx("flex", {
              "justify-end": message.me,
            })}
          >
            <div className="max-w-[75%] lg:max-w-[66%]">
              {/* Reply if applicable */}
              {message.replyTo && (
                <>
                  {/* Replied to on top */}
                  <div
                    className={clsx("flex text-xs mb-1", {
                      "justify-end": message.me,
                    })}
                  >
                    Replied to
                  </div>
                  {/* Wrap mini bubble to put border on right/left  */}
                  <div
                    className={clsx(
                      "mb-1 flex",
                      {
                        "justify-end": message.me,
                      },
                      " border-gray-300",
                      {
                        "border-r-2 pr-xs": message.me,
                        "border-l-2 pl-xs": !message.me,
                      }
                    )}
                  >
                    {/* Mini bubble for quoted */}
                    <div
                      className={
                        "text-sm rounded-xl bg-gray-200 p-xs text-gray-darker"
                      }
                    >
                      {message.replyTo}
                    </div>
                  </div>
                </>
              )}
              {/* Message bubble */}
              <div
                className={clsx("flex", {
                  "justify-end": message.me,
                })}
              >
                <div
                  className={clsx("p-sm rounded-2xl", {
                    "bg-gray-200 text-gray-darker": !message.me,
                    "bg-primary-light text-gray-50": message.me,
                  })}
                >
                  <div>{message.text}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
