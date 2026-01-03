"use client";
import { useUsername } from "@/hooks/use-username";
import { client } from "@/lib/client";
import { useRealtime } from "@/lib/realtime-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";

const formatTimeRemaining = (timeRemaining: number) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  // return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};
const Page = () => {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();
  const { username } = useUsername();
  const [copyStatus, setCopyStatus] = useState("复制");
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const [input, setInput] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const { data: ttlData } = useQuery({
    queryKey: ["ttl", roomId],
    queryFn: async () => {
      const res = await client.room.ttl.get({ query: { roomId } });
      return res.data;
    },
  });
  // console.log(ttlData?.ttl);

  useEffect(() => {
    if (ttlData?.ttl !== undefined) setTimeRemaining(ttlData.ttl);
  }, [ttlData]); //[ttlData]

  useEffect(() => {
    if (timeRemaining === null || timeRemaining < 0) return;

    if (timeRemaining === 0) {
      router.push("/?destroyed=true");
      return;
    }
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, router]);

  const { data: messages, refetch } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: async () => {
      const res = await client.messages.get({ query: { roomId } });
      return res.data;
    },
  });
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      await client.messages.post(
        { sender: username, text },
        { query: { roomId } }
      );
      // console.log("发送成功sss");
      setInput("");
    },
    // onSuccess: () => {
    //   console.log("发送成功");
    //   setInput("");
    //   inputRef.current?.focus();
    // },
  });
  useRealtime({
    channels: [roomId],
    events: ["chat.message", "chat.destroy"],
    onData: ({ event }) => {
      if (event === "chat.message") {
        refetch();
      }

      if (event === "chat.destroy") {
        router.push("/?destroyed=true");
      }
    },
  });

  const { mutate: destroyRoom } = useMutation({
    mutationFn: async () => {
      await client.room.delete(null, { query: { roomId } });
    },
  });
  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url); // 复制链接到剪贴板
    setCopyStatus("已复制!");
    setTimeout(() => setCopyStatus("复制"), 2000);
  };
  return (
    <main className="flex flex-col h-screen max-h-screen overflow-hidden">
      <header className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/30">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase">房间 ID</span>
            <div className="flex items-center gap-2">
              {/* 小屏时只显示前8位，大屏完整显示 */}
              <span className="font-bold text-green-500 hidden sm:inline">{roomId}</span>
              <span className="font-bold text-green-500 sm:hidden">{roomId.slice(0, 8)}…</span>
              <button
                className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
                onClick={copyLink}
              >
                {copyStatus}
              </button>{" "}
              {/* text-[10px]: 字体大小为10px; bg-zinc-800: 背景色为zinc-800; hover:bg-zinc-700: 鼠标悬停时背景色为zinc-700; px-2  py-0.5: 内外边距为0.5个单位; rounded: 圆角; text-zinc-400: 字体颜色为zinc- 400; hover:text-zinc-200: 鼠标悬停时字体颜色为zinc-200; transition-colors: 颜色过渡; */}
            </div>
          </div>
          <div className="h-8 w-px bg-zinc-800" />

          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase">
              自毁时间
            </span>
            <span
              className={`text-sm font-bold flex items-center gap-2 ${
                timeRemaining !== null && timeRemaining < 60
                  ? "text-red-500"
                  : "text-amber-500"
              }`}
            >
              {timeRemaining !== null
                ? formatTimeRemaining(timeRemaining)
                : "--:--"}
            </span>
          </div>
        </div>
        <button 
        onClick={() => destroyRoom()}
        className="text-xs bg-zinc-800 hover:bg-red-600 px-3 py-1.5 rounded text-zinc-400 hover:text-white font-bold transition-all group flex items-center gap-2 disabled:opacity-50">
          注销房间
        </button>{" "}
        {/* text-xs: 字体大小为12px; bg-zinc-800: 背景色为zinc-800; hover:bg-red-600: 鼠标悬停时背景色为red-600; px-3  py-1.5: 内外边距为1.5个单位; rounded: 圆角; text-zinc-400: 字体颜色为zinc- 400 hover:text-white: 鼠标悬停时字体颜色为white; font-bold: 字体加粗; transition-all: 所有属性过渡; group: 组件; flex items-center: 垂直居中; gap-2: 间距为2个单位; disabled:opacity-50: 禁用时透明度为50%; */}
      </header>
      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {/* flex-1: 填充剩余空间; overflow-y-auto: 垂直滚动; p-4: 内外边距为4个单位; space-y-4: 间距为4个单位; scrollbar-thin: 滚动条样式为thin; */}
        {messages?.messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-600 text-sm font-mono">
              暂无消息，开始对话吧。
            </p>
          </div>
        )}

        {messages?.messages.map((msg) => (
          <div key={msg.id} className="flex flex-col items-start">
            <div className="max-w-[80%] group">
              <div className="flex items-baseline gap-3 mb-1">
                <span
                  className={`text-xs font-bold ${
                    msg.sender === username ? "text-green-500" : "text-blue-500"
                  }`}
                >
                  {msg.sender === username ? "YOU" : msg.sender}
                </span>

                <span className="text-[10px] text-zinc-600">
                  {format(msg.timestamp, "HH:mm")}
                </span>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed break-all">
                {msg.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            {" "}
            {/* flex-1: 填充剩余空间; relative: 相对定位; group: 组件; */}
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 animate-pulse">
              {">"}
            </span>
            {/* absolute: 绝对定位; left-4: 左边距为4个单位; top-1/2: 上边距为50%; -translate-y-1/2: 垂直居中; text-zinc-500: 字体颜色为zinc- 500; animate-pulse: 闪烁动画; */}
            <input
              type="text"
              value={input}
              placeholder="输入消息..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  sendMessage({ text: input });
                  inputRef.current?.focus();
                }
              }}
              autoFocus
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-black border border-zinc-800 focus:border-zinc-700 focus:outline-none transition-colors text-zinc-100 placeholder:text-zinc-700 py-3 pl-8 pr-4 text-sm"
            />
          </div>
          {/* w-full: 宽度为100%; bg-black: 背景色为black; border: 边框为zinc-800; focus:border-zinc-700: 鼠标悬停时边框为zinc-700; focus:outline-none: 鼠标悬停时轮廓线为none; transition-colors: 颜色过渡; text-zinc-100: 字体颜色为zinc-100; placeholder:text-zinc-700: 占位符字体颜色为zinc-700; py-3 pl-8 pr-4 text-sm: 垂直内边距为3个单位; 水平内边距为8个单位; 水平内边距为4个单位; 字体大小为14px; */}
          <button
            className="bg-zinc-800 text-zinc-400 px-6 text-sm font-bold hover:text-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            value={input}
            onClick={() => {
              sendMessage({ text: input })
              inputRef.current?.focus()
            }}
            disabled={!input.trim() || isPending}
          >
            {/* bg-zinc-800: 背景色为zinc-800; text-zinc-400: 字体颜色为zinc- 400; px-6: 内外边距为6个单位; text-sm: 字体大小为14px; font-bold: 字体加粗; hover:text-zinc-200: 鼠标悬停时字体颜色为zinc-200; transition-all : 所有属性过渡; disabled:opacity-50: 禁用时透明度为50%; disabled:cursor-not-allowed: 禁用时鼠标样式为not-allowed; cursor-pointer: 鼠标样式为pointer; */}
            发送
          </button>
        </div>
      </div>
    </main>
  );
};

export default Page;
