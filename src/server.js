const express = require('express');
const path = require("path")
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.json({limit: "50mb"})) // JSONペイロードを持つリクエストを解析する。リクエストボディの最大サイズを表す

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post("/input_stamp/:id", (req, res)=> {
    console.log(`${req.params.id}`, req.body )
    const imgBuffer = Buffer.from(req.body.imgBase64, "base64")
    // 画像ファイルの保存先を指定
    const filePath = path.join(__dirname, "../stamps", `${req.params.id}.png`);

    // 画像をファイルとして保存
    fs.writeFile(filePath, imgBuffer, (err) => {
        if (err) {
            console.error("ファイル保存エラー:", err);
            return res.status(500).json({ error: "ファイル保存エラー" });
        }

        console.log("画像が保存されました:", filePath);
        res.json({ status: 200, message: "画像が保存されました", filePath });
    });
})


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});