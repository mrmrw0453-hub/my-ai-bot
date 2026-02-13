const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
app.use(express.json());

// وضعنا المفتاح مباشرة في الكود بناءً على طلبك
const API_KEY = "AIzaSyD0rWCfsqoHT5LsY8GvYHvyfx0iQzXHtGs";
const genAI = new GoogleGenerativeAI(API_KEY);

// صفحة بسيطة للتأكد أن السيرفر يعمل عند فتحه في المتصفح
app.get('/', (req, res) => {
  res.send("السيرفر يعمل بنجاح! جاهز لاستقبال رسائل جيميناي.");
});

// المسار الذي يستقبل الرسائل من روبلوكس
app.post('/gemini', async (req, res) => {
  try {
    const { question } = req.body;
    
    // استخدام موديل جيميناي 1.5 فلاش
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(question);
    
    // إرسال الرد بصيغة JSON
    res.json({ answer: result.response.text() });
  } catch (e) {
    console.error("خطأ في جيميناي:", e);
    res.status(500).json({ error: 'AI Error', details: e.message });
  }
});

// تشغيل السيرفر على البورت المناسب لـ Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Running on port " + PORT));
