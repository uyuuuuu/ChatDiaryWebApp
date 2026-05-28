import type { z } from "zod";
import { type diaryAndTagSchema, getSummary } from "~/lib/schemas";
import {
  getDateDiariesByUserId,
  getDiaryData,
  getHistoryData,
  getMonthlyFeedBack,
  getOtherUserDiaryData,
  getRecentTagsByUserId,
  getTagByID,
  getTagConnectionsByDiary,
  getTodayContinuation,
} from "../repository/getdata";

export const getDiariesAndTag = async (diaryId: string) => {
  try {
    const diaryData = await getDiaryData(diaryId);
    if (diaryData == null) return [];
    const tagNames: string[] = [];
    const connections = await getTagConnectionsByDiary(diaryId);
    if (connections != null) {
      for (const tag of connections) {
        const tagName = await getTagByID(tag.tagId);
        if (tagName != null) tagNames.push(tagName.name);
      }
    }
    const diaryAndTagData: z.infer<typeof diaryAndTagSchema> = {
      id: diaryData.id,
      title: diaryData.title,
      isPublic: diaryData.isPublic,
      summary: diaryData.summary,
      created_at: diaryData.created_at,
      tags: tagNames,
    };
    return diaryAndTagData;
  } catch (error) {
    console.error("Error in getDiariesAndTag:", error);
    return null;
  }
};

export const getChatHistory = async (mode: number, diaryId: string) => {
  const historyArray = [];
  if (mode == 0) {
    // 物事モード
    historyArray.push({
      role: "user",
      parts: [
        {
          text: "あなたは物事について深掘りする質問を得意とするアシスタントです。ユーザーが書いた文章に基づいて、その出来事や状況の背景、関連する要素、起こった結果について詳しく引き出し、それを深く理解する手助けをする質問を1つしてください。質問は親しみやすく、ユーザーが考えを整理しやすいトーンで簡潔に作成してください。アスタリスク等のmarkdown記法は用いないで下さい。",
        },
      ],
    });
    historyArray.push({
      role: "model",
      parts: [
        {
          text: "はい、私は物事を深掘りする質問を得意とするアシスタントです。個人的な意見は述べず、リラックスしたトーンで、ユーザーが答えやすい簡単な質問を、80字以内の簡潔な文章で1つ作成します。",
        },
      ],
    });
  } else {
    // 感情モード
    historyArray.push({
      role: "user",
      parts: [
        {
          text: "あなたは感情を深掘りする質問を得意とするアシスタントです。ユーザーが書いた文章に基づいて、そのときの感情や体験の背景を詳しく引き出し、価値観、強みを見つけ出すことにつながるような質問を1つしてください。質問は親しみやすく、ユーザーが考えを整理しやすいトーンで簡潔に作成してください。アスタリスク等のmarkdown記法は用いないで下さい。",
        },
      ],
    });
    historyArray.push({
      role: "model",
      parts: [
        {
          text: "はい、私は感情を深掘りする質問を得意とするアシスタントです。個人的な意見は述べず、リラックスしたトーンで、ユーザーが答えやすい簡単な質問を、80字以内の簡潔な文章で1つ作成します。",
        },
      ],
    });
  }
  const historyData = await getHistoryData(diaryId);
  if (historyData == null) return [];
  for (const data of historyData) {
    if (data?.message && data?.response) {
      historyArray.push({ role: "user", parts: [{ text: data.message }] });
      historyArray.push({ role: "model", parts: [{ text: data.response }] });
    }
  }
  return historyArray;
};

export const getRecentTagNamesByUserId = async (userId: string) => {
  try {
    const diaryTagDatas = await getRecentTagsByUserId(userId);
    if (diaryTagDatas == null) return [];
    const tagNames: string[] = [];
    for (const tag of diaryTagDatas) {
      tagNames.push(tag.name);
    }
    return tagNames;
  } catch (error) {
    console.error("Error in getRecentTagNamesByUserId:", error);
    return null;
  }
};

export const getLastMonthFB = async (userId: string, target: number) => {
  try {
    const fb = await getMonthlyFeedBack(userId, target);
    if (fb == null) return null;

    return fb;
  } catch (error) {
    console.error("Error in getLastMonthFB:", error);
    return null;
  }
};

export const getMonthlyContinuation = async (userId: string, today: Date) => {
  try {
    const year = today.getFullYear(); // 年を取得
    const month = today.getMonth() + 1; // 月を取得（0-basedなので +1）
    const day = today.getDate(); // 今日の日を取得

    const ret = [];

    for (let i = 1; i <= day; i++) {
      const target = year * 10000 + month * 100 + i;
      const continuation = await getTodayContinuation(userId, target);
      if (continuation == null) {
        ret.push(false);
      } else {
        ret.push(true);
      }
    }

    return ret;
  } catch (error) {
    console.error("Error in getMonthlyContinuation:", error);
    return null;
  }
};

export const getOtherUserDiary = async (userId: string) => {
  try {
    const diary = await getOtherUserDiaryData(userId);
    if (diary == null) return null;

    return getSummary.parse(diary);
  } catch (error) {
    console.error("Error in getOtherUserDiary:", error);
    return null;
  }
};

export const getMonthlyDiariesByUserId = async (
  userId: string,
  yearMonth: number,
) => {
  try {
    const year = Math.floor(yearMonth / 100); // 上位4桁が年
    const month = yearMonth % 100; // 下位2桁が月

    // 開始日と終了日を計算
    const startDate = new Date(year, month - 1, 1); // 月は0-basedなので-1
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // 月末日を計算
    const diary = await getDateDiariesByUserId(userId, startDate, endDate);
    if (diary == null) return null;

    return getSummary.parse(diary);
  } catch (error) {
    console.error("Error in getOtherUserDiary:", error);
    return null;
  }
};
