<p align="center">
  <img src="./public/logo.png" style="width: 33%;" alt="Logo" />
</p>

# Chat Diary
｢ねえ聞いてよ、｣で充実した思い出を残そう。  
AIとのチャット形式で日記を作成するwebアプリです。

## スライド
https://docs.google.com/presentation/d/14vMjdI7lIXOCuJzLdsrLxZfBCUXR1j3cASJJJRCXviQ/edit?usp=sharing

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
