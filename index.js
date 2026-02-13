const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();

// تفعيل استقبال بيانات JSON من روبلوكس
app.use(express.json());

// مفتاح الـ API الخاص بك (تم وضعه مباشرة لضمان الحل)
const API_KEY = "AIzaSyD0rWCfsqoHT5LsY8GvYHvyfx0iQzXHtGs";
const genAI = new GoogleGenerativeAI(API_KEY);

// صفحة اختبار السيرفر (تفتحها في المتصفح للتأكد)
app.get('/', (req, res) => {
  res.send("السيرفر يعمل بنجاح! جاهز لاستقبال رسائل جيميناي الآن.");
});

// المسار الذي يستقبل الطلبات من روبلوكس
app.post('/gemini', async (req, res) => {
  try {
    const { question } = req.body;

    // تصحيح اسم الموديل ليتوافق مع تحديثات جوجل
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // إرسال السؤال وانتظار النتيجة
    const result = await model.generateContent(question);
    const response = await result.response;
    const text = response.text();

    // إرسال الرد النهائي لروبلوكس
    res.json({ answer: text });

  } catch (e) {
    console.error("حدث خطأ:", e);
    // إرجاع تفاصيل الخطأ للمساعدة في تتبعه إذا فشل شيء ما
    res.status(500).json({ 
        error: 'AI Error', 
        details: e.message 
    });
  }
});

// تشغيل السيرفر على البورت المناسب لبيئة Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
