FROM node:22

# ワークディレクトリを /app に設定
WORKDIR /app

# backend フォルダ内の package*.json をコピー
COPY backend/package*.json ./

# 依存関係をインストール
RUN npm install --omit=dev

# backend 内の全ファイルをコピー
COPY backend/ .

# サーバー起動
CMD ["node", "proxy.js"]
