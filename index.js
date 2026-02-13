const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// صفحة بسيطة للتأكد أن السيرفر يعمل
app.get('/', (req, res) => {
  res.send("السيرفر يعمل بنجاح! جاهز لاستقبال رسائل جيميناي.");
});

app.post('/gemini', async (req, res) => {
  try {
    const { question } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(question);
    res.json({ answer: result.response.text() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'AI Error' });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Server Running"));
