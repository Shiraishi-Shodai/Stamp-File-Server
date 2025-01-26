const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(express.json({ limit: "50mb" })); // JSONペイロードを持つリクエストを解析する。リクエストボディの最大サイズを表す

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// 送信された画像を保存
app.post("/input_stamp", (req, res) => {
  try {
    const { user_id, stamp_id, imgBase64 } = req.body;
    // 必要なパラメータが正しく渡されているか確認
    if (!user_id || !stamp_id || !imgBase64) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // 保存先のパス(stamps/user_id)
    const userDirPath = path.join(__dirname, `../stamps/${user_id}`);
    // 保存先のパスにディレクトリがすでに存在していなければ、ディレクトリを再帰的に作成する
    if (!fs.existsSync(userDirPath)) {
      fs.mkdirSync(userDirPath, { recursive: true });
    }
    // 画像ファイルの保存先を指定
    const filePath = path.join(userDirPath, `/${stamp_id}.png`);
    // base64データをデコードし、バイナリー化
    const imgBuffer = Buffer.from(imgBase64, "base64");

    // 画像をファイルとして保存
    fs.writeFile(filePath, imgBuffer, (err) => {
      if (err) {
        console.error("ファイル保存エラー:", err);
        return res.status(500).json({ error: "ファイル保存エラー" });
      }

      console.log("画像が保存されました:", filePath);
      res.json({ status: 200, message: "画像が保存されました", filePath });
    });
  } catch (e) {
    console.error("エラーが発生しました:", e);
    if (next) {
      next(e); // エラーハンドラが定義されている場合に制御を渡す
    } else {
      res.status(500).json({ error: "サーバーエラー" });
    }
  }
});

// 特定のユーザーの画像を取得{ファイル名: base64}[]
app.post("/listMyStamp", (req, res) => {
  try {
    const { user_id } = req.body;
    // 必要なパラメータが正しく渡されているか確認
    if (!user_id) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const targetDir = path.join(__dirname, `../stamps/${user_id}`);

    // 非同期でファイルを取得
    fs.readdir(targetDir, (err, files) => {
      if (err) {
        console.error("ディレクトリ読み込みエラー:", err);
        return res.status(500).json({ error: "ディレクトリ読み込みエラー" });
      }

      // 画像データを格納する配列
      const imgBase64List = [];
      files.forEach((file) => {
        // バイナリー化したデータをbase64に変換
        const imgBase64 = Buffer.from(file).toString("base64");
        imgBase64List.push({ file: file, imgBase64: imgBase64 });
      });

      // ファイルの一覧をレスポンスで返す
      res.status(200).json({ imgBase64List });
    });
  } catch (e) {
    console.error("エラーが発生しました:", e);
    if (next) {
      next(e); // エラーハンドラが定義されている場合に制御を渡す
    } else {
      res.status(500).json({ error: "サーバーエラー" });
    }
  }
});

// 全ユーザーの画像を取得{ファイル名: base64}[]
app.get("/listAllStamp", (req, res) => {
  try {
    const targetDir = path.join(__dirname, `../stamps/`);
    const imgBase64List = [];

    // targetDir配下のディレクトリやファイルを取得
    const entries = fs.readdirSync(targetDir, {
      withFileTypes: true,
      recursive: true,
    });
    // 各エントリを処理
    entries.forEach((entry) => {
      if (entry.isFile()) {
        const imgBase64 = Buffer.from(file).toString("base64");

        const fullPath = path.join(targetDir, entry.name);
        // ファイルなら、リストに追加
        imgBase64List.push(fullPath);
      }
    });

    res.status(200).json({ imgBase64List });
  } catch (e) {
    console.error("エラーが発生しました:", e);
    if (next) {
      next(e); // エラーハンドラが定義されている場合に制御を渡す
    } else {
      res.status(500).json({ error: "サーバーエラー" });
    }
  }
});

// 全ユーザーのスタンプを取得する。
app.use((err, req, res, next) => {
  res.json({ message: "エラー発生" });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
