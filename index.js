const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
app.use(express.json());

// ضع المفتاح الجديد هنا
const API_KEY = "AIzaSyD0rWCfsqoHT5LsY8GvYHvyfx0iQzXHtGs";
const genAI = new GoogleGenerativeAI(API_KEY);

// دالة لاختبار المفتاح أولاً
async function testApiKey() {
    try {
        const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const test = await fetch(testUrl);
        const data = await test.json();
        
        if (data.error) {
            console.error("❌ المفتاح غير صالح:", data.error.message);
            return false;
        } else {
            console.log("✅ المفتاح صالح! النماذج المتاحة:", data.models.length);
            return true;
        }
    } catch (e) {
        console.error("❌ فشل اختبار المفتاح:", e.message);
        return false;
    }
}

app.get('/', async (req, res) => {
    const isValid = await testApiKey();
    if (isValid) {
        res.send("✅ السيرفر يعمل والمفتاح صالح! جاهز لاستقبال رسائل جيميناي.");
    } else {
        res.send("❌ السيرفر يعمل لكن المفتاح غير صالح. يرجى تحديث المفتاح.");
    }
});

app.post('/gemini', async (req, res) => {
    try {
        const { question } = req.body;
        
        // التحقق من المفتاح
        if (!API_KEY || API_KEY === "ضع_المفتاح_الجديد_هنا") {
            return res.status(500).json({ 
                error: 'API Key Missing', 
                details: 'يرجى وضع مفتاح API صحيح في الكود'
            });
        }
        
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(question);
        res.json({ answer: result.response.text() });
        
    } catch (e) {
        console.error('❌ خطأ:', e);
        
        // تحديد نوع الخطأ
        let errorMessage = e.message;
        if (errorMessage.includes("API key")) {
            errorMessage = "مفتاح API غير صالح. يرجى الحصول على مفتاح جديد من Google AI Studio";
        }
        
        res.status(500).json({ 
            error: 'AI Error', 
            details: errorMessage
        });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("🚀 Server Running on port", process.env.PORT || 3000);
    testApiKey(); // اختبار المفتاح عند تشغيل السيرفر
});
