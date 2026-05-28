import { Resend } from "resend";
import { EmailTemplate } from "~/components/emailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(mail: string, token: string) {
  try {
    const data = await resend.emails.send({
      from: "diaryappwithai@peach-fi-zz.org",
      to: mail,
      subject: "ChatDiaryアカウント登録のお知らせ",
      react: EmailTemplate({ mail: mail, token: token }),
    });
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
