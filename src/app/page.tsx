"use client";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useUsername } from "@/hooks/use-username";
import { Suspense } from "react";

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Lobby />
    </Suspense>
  );
};

export default Page;

function Lobby() {
  const { username } = useUsername();
  const router = useRouter();
  const searchParams = useSearchParams()
  const wasDestroyed = searchParams.get("destroyed") === "true"
  const error = searchParams.get("error")
  const { mutate: createRoom } = useMutation({
    mutationFn: async () => {
      const res = await client.room.create.post();

      if (res.status === 200) {
        router.push(`/room/${res.data?.roomId}`);
      }
    },
  });
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      {/*  flex: flex布局; min-h-screen: 最小高度为屏幕高度; flex-col: 垂直方向布局; items-center: 水平居中; justify-center: 垂直居中; p-4: 内边距为4个单位; */}
      {wasDestroyed && (
        <div className="bg-red-950/50 border border-red-900 p-4 text-center">
          <p className="text-red-500 text-sm font-bold">房间已销毁</p>
          <p className="text-zinc-500 text-xs mt-1">
            所有消息已被永久删除。
          </p>
        </div>
      )}
      {error === "room-not-found" && (
        <div className="bg-red-950/50 border border-red-900 p-4 text-center">
          <p className="text-red-500 text-sm font-bold">房间不存在</p>
          <p className="text-zinc-500 text-xs mt-1">
            此房间可能已过期或不存在。
          </p>
        </div>
      )}
      {error === "room-full" && (
        <div className="bg-red-950/50 border border-red-900 p-4 text-center">
          <p className="text-red-500 text-sm font-bold">房间已满</p>
          <p className="text-zinc-500 text-xs mt-1">
            此房间成员已满。
          </p>
        </div>
      )}

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-green-500">
            {" "}
            {/* h1: h1标签; text-2xl: 文本大小为2xl; font-bold: 字体为粗体; tracking-tight: 字体间距为紧; text-green-500: 文本颜色为green-500; */}
            {">"}私密聊天
          </h1>
          <p className="text-zinc-500 text-sm">
            一个私密的、自我销毁的聊天房间。
          </p>
        </div>
        {/*  w-full: 宽度为100%; max-w-md: 最大宽度为md; space-y-8: 垂直方向的间距为8个单位; */}
        <div className="border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md">
          {/*  border: 边框; border-zinc-800: 边框颜色为zinc-800; bg-zinc-900/50: 背景颜色为zinc-900/50; p-6: 内边距为6个单位; backdrop-blur-md: 模糊度为md; */}
          <div className="space-y-5">
            {/*  space-y-5: 垂直方向的间距为5个单位; */}
            <div className="space-y-2">
              <label className="flex items-center text-zinc-500">
                你的身份ID
              </label>
              {/*  label: 标签; flex: flex布局; items-center: 垂直居中; text-zinc-500: 文本颜色为zinc-500; */}
              <div className="flex items-center gap-3">
                {/*  div: div标签; flex: flex布局; items-center: 垂直居中; gap-3: 间距为3个单位; */}
                <div className="flex-1 bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-400 font-mono">
                  {username}
                </div>
                {/*  div: div标签; flex-1: 宽度为1/12; bg-zinc-950: 背景颜色为zinc-950; border: 边框; border-zinc-800: 边框颜色为zinc-800; p-3: 内边距为3个单位; text-sm: 文本大小为sm; text-zinc-400: 文本颜色为zinc-400; font-mono: 字体为mono; */}
              </div>
            </div>
            <button
              onClick={() => createRoom()}
              className="w-full bg-zinc-100 text-black p-3 text-sm font-bold hover:bg-zinc-50 hover:text-black transition-colors mt-2 cursor-pointer disabled:opacity-50"
              // w-full: 宽度为100%; bg-zinc-100: 背景颜色为zinc-100; text-black: 文本颜色为black; p-3: 内边距为3个单位; text-sm: 文本大小为sm; font-bold: 字体为粗体; hover:bg-zinc-50: 鼠标悬停时背景颜色为zinc-50; hover:text-black: 鼠标悬停时文本颜色
            >
              创建安全房间
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
