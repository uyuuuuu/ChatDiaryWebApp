<p align="center">
  <img src="./public/logo.png" style="width: 33%;" alt="Logo" />
</p>

# Chat Diary
｢ねえ聞いてよ、｣で充実した思い出を残そう。  
AIとのチャット形式で日記を作成するwebアプリです。

## 担当
プロジェクトリーダー、バックエンド、UIデザイン、ロゴデザイン

## スライド
https://docs.google.com/presentation/d/14vMjdI7lIXOCuJzLdsrLxZfBCUXR1j3cASJJJRCXviQ/edit?usp=sharing

<img width=70% alt="ChatDiary_Slide" src="https://github.com/user-attachments/assets/43f78ba3-331d-4535-8bf0-ac68595c0e12" />
<img width=70% alt="ChatDiary_Slide (1)" src="https://github.com/user-attachments/assets/ff28a26c-6211-40a9-a86f-b2216f957bed" />
<img width=70% alt="ChatDiary_Slide (2)" src="https://github.com/user-attachments/assets/6fbfc9f7-26ea-4890-a66a-2b6198316bc0" />
<img width=70% alt="ChatDiary_Slide (3)" src="https://github.com/user-attachments/assets/356b4133-8d13-48a6-8134-cd6921656283" />
<img width=70% alt="ChatDiary_Slide (4)" src="https://github.com/user-attachments/assets/2c147917-85c8-41dc-b30a-7742f2215d82" />
<img width=70% alt="ChatDiary_Slide (5)" src="https://github.com/user-attachments/assets/5da0378e-836e-43c9-a515-ae7801001aca" />
<img width=70% alt="ChatDiary_Slide (6)" src="https://github.com/user-attachments/assets/20af20ac-763f-4ca2-a51f-88579255e81e" />
<img width=70% alt="ChatDiary_Slide (7)" src="https://github.com/user-attachments/assets/7362d8c4-4527-4fce-a631-88cd27192272" />
<img width=70% alt="ChatDiary_Slide (8)" src="https://github.com/user-attachments/assets/bbdf2419-fd9c-4ad3-9c24-5629b5ca7e0f" />
<img width=70% alt="ChatDiary_Slide (9)" src="https://github.com/user-attachments/assets/6c4a5b03-3dae-4b3d-bc90-8fc3be9c30d0" />
<img width=70% alt="ChatDiary_Slide (10)" src="https://github.com/user-attachments/assets/566f2204-9ed3-4986-b552-54671056b55f" />
<img width=70% alt="ChatDiary_Slide (11)" src="https://github.com/user-attachments/assets/cb8d1350-3df7-4716-a7ca-e903b910b854" />
<img width=70% alt="ChatDiary_Slide (12)" src="https://github.com/user-attachments/assets/8c942d29-238e-4190-bea2-26a2f5a01f5b" />
<img width=70% alt="ChatDiary_Slide (13)" src="https://github.com/user-attachments/assets/15b7b242-db22-43b3-a24e-f18fd41ca572" />
<img width=70% alt="ChatDiary_Slide (14)" src="https://github.com/user-attachments/assets/7aadb82b-72a3-4355-a3ce-a300d991f257" />


# 開発者用
## 実行方法
```.env```ファイルをルートディレクトリ直下に作成、環境変数を登録  
初回のみ ```npm install```  
DB変更時 ```npm run db:push```  
```npm run dev```  
[http:/localhost:3000](http:/localhost:3000)に接続

## Prisma
```npx prisma studio```  
[http:/localhost:5555](http:/localhost:5555)に接続

## テスト実行方法
docker desktopを開いておく  
初回のみ ```cd docker``` ```docker-compose up -d```  
初回のみ ```npx prisma init```  
DB変更時 ```npm run db:generate```  
```npm test```

## ブランチ命名規則
<個人名>/<作業名>

## コミットメッセージ
○○: 変更の概要  
  
fix：バグ修正  
add：新規ファイル追加  
remove：ファイル削除  
feat：新規機能実装  
update：機能修正（バグではない）  
change：仕様変更  
ref：リファクタリング  
style：空白, 改行, コメントアウト等  
docs：テキストの変更  
revert：変更取り消し  
