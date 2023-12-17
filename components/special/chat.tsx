import { cn } from "@/utils/style";

interface Message {
  me: boolean;
  text: string;
  replyTo?: string;
}

interface Props {
  messages: Message[];
}

export function Chat({ messages }: Props) {
  return (
    <>
      <div className="space-y-1">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn("flex", {
              "justify-end": message.me,
            })}
          >
            <div className="max-w-[75%] lg:max-w-[66%]">
              {/* Reply if applicable */}
              {message.replyTo && (
                <>
                  {/* Replied to on top */}
                  <div
                    className={cn("flex text-xs mb-1", {
                      "justify-end": message.me,
                    })}
                  >
                    Replied to
                  </div>
                  {/* Wrap mini bubble to put border on right/left  */}
                  <div
                    className={cn(
                      "mb-1 flex",
                      {
                        "justify-end": message.me,
                      },
                      " border-gray-300",
                      {
                        "border-r-2 pr-1": message.me,
                        "border-l-2 pl-1": !message.me,
                      }
                    )}
                  >
                    {/* Mini bubble for quoted */}
                    <div
                      className={cn("text-xs rounded-xl p-1.5", {
                        "bg-gray-200 text-gray-800": message.me,
                        "bg-indigo-500 text-gray-50": !message.me,
                      })}
                    >
                      {message.replyTo}
                    </div>
                  </div>
                </>
              )}
              {/* Message bubble */}
              <div
                className={cn("flex", {
                  "justify-end": message.me,
                })}
              >
                <div
                  className={cn("p-2 rounded-2xl", {
                    "bg-gray-200 text-gray-800": !message.me,
                    "bg-indigo-500 text-gray-50": message.me,
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
}
