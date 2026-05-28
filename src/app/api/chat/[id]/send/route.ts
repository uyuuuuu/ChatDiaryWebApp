// チャット送信POST

import {
  type GenerateContentResult,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { postSendChat } from "~/lib/schemas";
import { getChatCounts } from "~/server/repository/getdata";
import { returnedChat, summariedDiary } from "~/server/repository/updatedata";
import { initializeChat } from "~/server/service/create";
import { getChatHistory } from "~/server/service/fetch";

// タイムアウト付きの関数を作成
async function withTimeout(
  promise: Promise<GenerateContentResult>,
  timeoutMs: number,
) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Request timed out")),
      timeoutMs,
    );
    promise
      .then((result) => {
        clearTimeout(timeout);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error instanceof Error ? error : new Error(String(error)));
      });
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const diaryId = z.string().parse((await params).id); //パスパラメータ
    const { mode, text } = postSendChat.parse(await req.json()); //body

    // 送ったチャットを反映
    const sendChat = await initializeChat(diaryId, mode, text);
    if (sendChat == null) throw new Error("err in initializeChat()");

    // AIからの返答
    const chatLimit = 5;
    const diaryCounts = await getChatCounts(diaryId);
    if (diaryCounts == null) throw new Error("err in getChatCounts");

    // タイムアウト時間の設定
    const timeoutMs = 10000; // 10秒

    let aiResponse = null;
    let aiSummary = null;

    // Gemini APIキーを設定
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    // モデルの取得
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { temperature: 1 },
    }); // 使用モデル指定
    //過去のログの生成
    const historyArray = await getChatHistory(mode, diaryId);
    // 要約生成のタイミングなら現在のチャットを追加
    if (diaryCounts < chatLimit && text) {
      historyArray.push({ role: "user", parts: [{ text }] });
    }
    // テキスト生成
    const chat = model.startChat({
      history: historyArray,
    });

    try {
      if (diaryCounts < chatLimit) {
        // レスポンスの取得
        const result = await withTimeout(chat.sendMessage(text), timeoutMs);
        const response = (result as GenerateContentResult).response;

        const res = await returnedChat(sendChat?.id, response.text());
        if (res == null) throw new Error("err in returnedChat");
        aiResponse = res.response!;
      } else {
        // 要約の取得
        const prompt =
          "これまでのやり取りを基に、日記として自然な要約を書いてください。AIとのやり取りや会話形式には触れず、内容が矛盾しないように調整してください。余計な情報は追加せず、200字程度でまとめてください";
        const result = await withTimeout(chat.sendMessage(prompt), 10000);
        const response = (result as GenerateContentResult).response;

        // 日記に追加
        const updatedDiary = await summariedDiary(diaryId, response.text());
        if (updatedDiary == null) throw new Error("err in summariedDiary");
        aiSummary = updatedDiary.summary!;
      }
    } catch (error) {
      if (error instanceof Error && error.message === "Request timed out") {
        console.error("Gemini API request timed out");
        // タイムアウト時にchatcountを増加させないための処理
        return NextResponse.json(
          { error: "Gemini API request timed out" },
          { status: 504 },
        );
      } else {
        throw error; // その他のエラーはそのままスロー
      }
    }

    return NextResponse.json({
      message: "send chat successfully",
      chatId: sendChat?.id,
      count: diaryCounts,
      response: aiResponse,
      summary: aiSummary,
    });
  } catch (error) {
    console.error("Error in POST chat/[id]/send request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
