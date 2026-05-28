import { GoogleGenerativeAI } from "@google/generative-ai";
import type { z } from "zod";
import {
  type analysesSchema,
  type chatsSchema,
  type continuationSchema,
  type diariesSchema,
  type diaryTagsSchema,
  type monthlySummariesSchema,
  type newTag,
  userSchema,
} from "~/lib/schemas";
import {
  getDiariesByUserId,
  getTodayContinuation,
} from "../repository/getdata";
import {
  insertAnalyses,
  insertChat,
  insertContinuation,
  insertDiary,
  insertDiaryTag,
  insertMonthlySummaries,
  insertNewUser,
  insertTag,
} from "../repository/insertdata";

export async function createNewUser(email: string, hashedPassword: string) {
  try {
    if (email == null || hashedPassword == null)
      throw new Error("Invalid option data");
    const userData = userSchema.parse({
      email: email,
      password: hashedPassword,
    });
    const create = await insertNewUser(userData);
    if (create == null) throw new Error("err in insertNewUser");

    return create;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function initializeDiary(userId: string) {
  try {
    if (userId == null) throw new Error("Invalid option data");
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // フォーマットされた日時を分解
    const formattedDate = formatter.format(now);
    const [datePart, timePart] = formattedDate.split(" ");
    const [year, month, day] = datePart!.split("/");
    const [hours, minutes] = timePart!.split(":");

    // フォーマットした日時文字列を返す
    const dateString = `${year}/${month}/${day} ${hours}:${minutes}`;
    const diaryData: z.infer<typeof diariesSchema> = {
      userId: userId,
      title: dateString,
      summary: "出力結果",
      isPublic: false,
    };

    const created = await insertDiary(diaryData);
    if (created == null) throw new Error("err in insertDiary");

    return created;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function initializeChat(
  diaryId: string,
  mode: number,
  userMessage: string,
) {
  try {
    if (diaryId == null || userMessage == null)
      throw new Error("Invalid option data");
    const chatData: z.infer<typeof chatsSchema> = {
      diaryId: diaryId,
      mode: mode,
      message: userMessage,
    };

    const created = await insertChat(chatData);
    if (created == null) throw new Error("err in insertChat");

    return created;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createTag(name: string, userId: string) {
  try {
    if (name == null) throw new Error("Invalid option data");
    const tagData: z.infer<typeof newTag> = {
      name: name,
      userId: userId,
    };
    const created = await insertTag(tagData);
    if (created == null) throw new Error("err in insertTag");

    return created;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function connectDiaryTag(diaryId: string, tagId: string) {
  try {
    if (diaryId == null || tagId == null)
      throw new Error("Invalid option data");
    const diaryTagsData: z.infer<typeof diaryTagsSchema> = {
      diaryId: diaryId,
      tagId: tagId,
    };
    const created = await insertDiaryTag(diaryTagsData);
    if (created == null) throw new Error("err in insertDiaryTag");

    return created;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createMonthlyFB(userId: string, target: number) {
  try {
    if (userId == null || target == null)
      throw new Error("Invalid option data");
    // Gemini APIキーを設定
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) throw new Error("err getting GEMINI_API_KEY");
    const genAI = new GoogleGenerativeAI(apiKey);
    // モデルの取得
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: { temperature: 1, maxOutputTokens: 254 },
    }); // 使用モデル指定

    // 全部の日記の本文を取得
    const diaries = await getDiariesByUserId(userId);
    if (diaries == null) throw new Error("err in getDiariesByUserId");

    const diarySummaries = diaries
      .map((diary) => `[${diary.summary}]`)
      .join("");

    // 日記全文＋要約の文章をGeminiに送る（チャットじゃなくてgenerateContents）
    const prompt_post = `${diarySummaries} あなたは要約と分析を得意とするアシスタントです。上記の[]で囲まれた先月の日記を基に、以下の点を要約して文章にしてください。 主な出来事や体験、感情についてどんな月だったかが把握できるように簡潔に100字以内でまとめてください。`;

    // テキスト生成
    const result = await model.generateContent({
      contents: [{ role: "USER", parts: [{ text: prompt_post }] }],
      generationConfig: { temperature: 2 },
    });
    // レスポンスの取得
    const response = result.response;
    const generatedText = response.text();

    // FBの取得
    const text = generatedText;
    const monthlySummariesData: z.infer<typeof monthlySummariesSchema> = {
      userId: userId,
      month: target,
      text: text,
    };
    const created = await insertMonthlySummaries(monthlySummariesData);
    if (created == null) throw new Error("err in insertMonthlySummaries");

    return created;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createAnalysesFB(userId: string) {
  try {
    if (userId == null) throw new Error("Invalid option data");
    // 全部の日記の本文を取得
    const diaries = await getDiariesByUserId(userId);
    if (diaries == null) throw new Error("err in getDiariesByUserId");

    //表示するテキスト
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

    // 日記全文+要約の文章をGeminiに送る
    const prompt_post = `${diarySummaries} あなたは人物の分析を得意とするアシスタントです。上記の[]で囲まれた日記を基に、以下の点を要約して文章にしてください。 主な出来事や体験、感情の変化や価値観、ユーザーの強みや特徴を簡潔かつ自己分析に役立つ形で100字以内でまとめてください。`;

    // テキスト生成
    const result = await model.generateContent({
      contents: [{ role: "USER", parts: [{ text: prompt_post }] }],
      generationConfig: { temperature: 1, maxOutputTokens: 254 },
    });

    // レスポンスの取得
    const response = result.response;
    const generatedText = response.text();

    // FBの取得
    const text = generatedText;

    const analysesData: z.infer<typeof analysesSchema> = {
      userId: userId,
      text: text,
    };

    const created = await insertAnalyses(analysesData);
    if (created == null) throw new Error("err in insertAnalyses");

    return created;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createContinuation(userId: string, today: Date) {
  try {
    if (userId == null) throw new Error("Invalid option data");

    const year = today.getFullYear();
    const month = today.getMonth(); // 月は0ベース
    const day = today.getDate();
    // YYYYMMDD形式
    const target = year * 10000 + (month + 1) * 100 + day; // 月は0ベースなので+1して調整
    const exist = await getTodayContinuation(userId, target);
    if (exist == null) {
      const continuationData: z.infer<typeof continuationSchema> = {
        userId: userId,
        day: target,
        done: true,
      };
      const created = await insertContinuation(continuationData);
      if (created == null) throw new Error("err in insertContinuation");
      return created;
    }
    return exist;
  } catch (error) {
    console.error(error);
    return null;
  }
}
