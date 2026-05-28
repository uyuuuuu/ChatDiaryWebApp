import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDiariesByUserId } from "../repository/getdata";
import { updateAnalyses } from "../repository/updatedata";

export async function updateAnalysesFB(userId: string) {
  try {
    if (userId == null) throw new Error("Invalid option data");
    // 全部の日記の本文を取得
    const diaries = await getDiariesByUserId(userId);
    if (diaries == null) throw new Error("err in getDiariesByUserId");

    //表示するテキスト
    let text = "日記を書いてね！";

    if (diaries.length != 0) {
      const diarySummaries = diaries
        .map((diary) => `[${diary.summary}]`)
        .join("");

      // Gemini APIキーを設定
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) throw new Error("err getting GEMINI_API_KEY");

      const genAI = new GoogleGenerativeAI(apiKey);
      // モデルの取得
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        generationConfig: { temperature: 1, maxOutputTokens: 254 },
      }); // 使用モデル指定

      // 日記全文＋要約の文章をGeminiに送る
      const prompt_post = `${diarySummaries} あなたは人物の分析を得意とするアシスタントです。上記の[]で囲まれた日記を基に、以下の点を要約して文章にしてください。 主な出来事や体験、感情の変化や価値観、ユーザーの強みや特徴を簡潔かつ自己分析に役立つ形で100字以内でまとめてください。`;

      // テキスト生成
      const result = await model.generateContent({
        contents: [{ role: "USER", parts: [{ text: prompt_post }] }],
        generationConfig: { temperature: 1, maxOutputTokens: 254 },
      });
      // レスポンスの取得
      const response = result.response;
      const generatedText = response.text();
      text = generatedText;
    }
    const updated = await updateAnalyses(userId, text);
    if (updated == null) throw new Error("err in updateAnalyses");
    return updated;
  } catch (error) {
    console.error(error);
    return null;
  }
}
